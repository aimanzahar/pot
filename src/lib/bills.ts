import "server-only";
import { nanoid } from "nanoid";
import { getDb } from "./db";
import { deleteUpload } from "./uploads";
import type {
  Bill,
  BillStats,
  BillWithToken,
  CreateBillInput,
  Currency,
  Participant,
  SplitMode,
} from "./types";

interface BillRow {
  id: string;
  organizer_token: string;
  title: string;
  description: string | null;
  total_amount: number;
  currency: string;
  split_mode: string;
  due_date: string | null;
  organizer_name: string | null;
  payment_instructions: string | null;
  payment_qr_path: string | null;
  created_at: string;
}

interface ParticipantRow {
  id: string;
  bill_id: string;
  name: string;
  amount: number;
  paid: number;
  paid_at: string | null;
  payment_note: string | null;
  receipt_path: string | null;
  created_at: string;
}

function rowToParticipant(r: ParticipantRow): Participant {
  return {
    id: r.id,
    billId: r.bill_id,
    name: r.name,
    amount: r.amount,
    paid: r.paid === 1,
    paidAt: r.paid_at,
    paymentNote: r.payment_note,
    receiptPath: r.receipt_path,
    createdAt: r.created_at,
  };
}

function rowToBill(r: BillRow, participants: Participant[]): Bill {
  return {
    id: r.id,
    title: r.title,
    description: r.description,
    totalAmount: r.total_amount,
    currency: r.currency as Currency,
    splitMode: r.split_mode as SplitMode,
    dueDate: r.due_date,
    organizerName: r.organizer_name,
    paymentInstructions: r.payment_instructions,
    paymentQrPath: r.payment_qr_path,
    createdAt: r.created_at,
    participants,
  };
}

export interface CreatedBill {
  slug: string;
  organizerToken: string;
}

export function createBill(input: CreateBillInput): CreatedBill {
  const db = getDb();
  const id = nanoid(10);
  const organizerToken = nanoid(32);
  const now = new Date().toISOString();

  const insertBill = db.prepare(`
    INSERT INTO bills (
      id, organizer_token, title, description, total_amount,
      currency, split_mode, due_date, organizer_name,
      payment_instructions, payment_qr_path, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const insertParticipant = db.prepare(`
    INSERT INTO participants (
      id, bill_id, name, amount, paid, paid_at, payment_note, receipt_path, created_at
    ) VALUES (?, ?, ?, ?, 0, NULL, NULL, NULL, ?)
  `);

  const tx = db.transaction(() => {
    insertBill.run(
      id,
      organizerToken,
      input.title.trim(),
      input.description?.trim() || null,
      input.totalAmount,
      input.currency,
      input.splitMode,
      input.dueDate || null,
      input.organizerName?.trim() || null,
      input.paymentInstructions?.trim() || null,
      input.paymentQrPath || null,
      now,
    );
    for (const p of input.participants) {
      insertParticipant.run(nanoid(12), id, p.name.trim(), p.amount, now);
    }
  });
  tx();

  return { slug: id, organizerToken };
}

function loadBillRow(slug: string): BillRow | null {
  const db = getDb();
  const row = db
    .prepare<[string], BillRow>("SELECT * FROM bills WHERE id = ?")
    .get(slug);
  return row ?? null;
}

function loadParticipants(billId: string): Participant[] {
  const db = getDb();
  const rows = db
    .prepare<[string], ParticipantRow>(
      "SELECT * FROM participants WHERE bill_id = ? ORDER BY created_at ASC",
    )
    .all(billId);
  return rows.map(rowToParticipant);
}

export function getBill(slug: string): Bill | null {
  const row = loadBillRow(slug);
  if (!row) return null;
  return rowToBill(row, loadParticipants(row.id));
}

export function getBillForAdmin(
  slug: string,
  token: string,
): BillWithToken | null {
  const row = loadBillRow(slug);
  if (!row) return null;
  if (row.organizer_token !== token) return null;
  return {
    ...rowToBill(row, loadParticipants(row.id)),
    organizerToken: row.organizer_token,
  };
}

export function markParticipantPaid(
  slug: string,
  participantId: string,
  note: string | null,
  receiptPath: string | null,
): { ok: boolean; reason?: string } {
  const db = getDb();
  const row = loadBillRow(slug);
  if (!row) return { ok: false, reason: "bill_not_found" };

  const res = db
    .prepare(
      `UPDATE participants
         SET paid = 1,
             paid_at = ?,
             payment_note = ?,
             receipt_path = COALESCE(?, receipt_path)
         WHERE id = ? AND bill_id = ? AND paid = 0`,
    )
    .run(new Date().toISOString(), note, receiptPath, participantId, row.id);

  if (res.changes === 0) return { ok: false, reason: "already_paid_or_missing" };
  return { ok: true };
}

export function adminSetParticipantPaid(
  slug: string,
  token: string,
  participantId: string,
  paid: boolean,
): { ok: boolean; reason?: string } {
  const db = getDb();
  const row = loadBillRow(slug);
  if (!row) return { ok: false, reason: "bill_not_found" };
  if (row.organizer_token !== token) return { ok: false, reason: "forbidden" };

  if (paid) {
    db.prepare(
      `UPDATE participants
         SET paid = 1, paid_at = ?
         WHERE id = ? AND bill_id = ?`,
    ).run(new Date().toISOString(), participantId, row.id);
  } else {
    // Manual unpaid wipe also clears the attached receipt — if a member
    // claimed payment then the organizer disputed it, the now-rejected
    // proof shouldn't linger.
    const existing = db
      .prepare<[string, string], { receipt_path: string | null }>(
        "SELECT receipt_path FROM participants WHERE id = ? AND bill_id = ?",
      )
      .get(participantId, row.id);
    db.prepare(
      `UPDATE participants
         SET paid = 0, paid_at = NULL, payment_note = NULL, receipt_path = NULL
         WHERE id = ? AND bill_id = ?`,
    ).run(participantId, row.id);
    if (existing?.receipt_path) {
      void deleteUpload(existing.receipt_path);
    }
  }
  return { ok: true };
}

export function setPaymentInfo(
  slug: string,
  token: string,
  instructions: string | null,
  qrPath: string | null,
  options: { keepExistingQr: boolean },
): { ok: boolean; reason?: string } {
  const db = getDb();
  const row = loadBillRow(slug);
  if (!row) return { ok: false, reason: "bill_not_found" };
  if (row.organizer_token !== token) return { ok: false, reason: "forbidden" };

  const oldQr = row.payment_qr_path;
  const nextQr = qrPath ?? (options.keepExistingQr ? oldQr : null);

  db.prepare(
    `UPDATE bills
       SET payment_instructions = ?,
           payment_qr_path = ?
       WHERE id = ?`,
  ).run(instructions?.trim() || null, nextQr, row.id);

  // Replaced or removed QR — delete the old file unless caller kept it.
  if (oldQr && oldQr !== nextQr) {
    void deleteUpload(oldQr);
  }

  return { ok: true };
}

export function deleteBill(
  slug: string,
  token: string,
): { ok: boolean; reason?: string } {
  const db = getDb();
  const row = loadBillRow(slug);
  if (!row) return { ok: false, reason: "bill_not_found" };
  if (row.organizer_token !== token) return { ok: false, reason: "forbidden" };

  const receipts = db
    .prepare<[string], { receipt_path: string | null }>(
      "SELECT receipt_path FROM participants WHERE bill_id = ? AND receipt_path IS NOT NULL",
    )
    .all(row.id);

  db.prepare("DELETE FROM bills WHERE id = ?").run(row.id);

  // Clean up uploaded files after the row is gone; do this best-effort and
  // off the request critical path.
  if (row.payment_qr_path) void deleteUpload(row.payment_qr_path);
  for (const r of receipts) {
    if (r.receipt_path) void deleteUpload(r.receipt_path);
  }

  return { ok: true };
}

export function billStats(bill: Bill): BillStats {
  const total = bill.totalAmount;
  const paid = bill.participants
    .filter((p) => p.paid)
    .reduce((s, p) => s + p.amount, 0);
  const remaining = Math.max(0, total - paid);
  const paidCount = bill.participants.filter((p) => p.paid).length;
  const totalCount = bill.participants.length;
  const progress = total > 0 ? Math.min(1, paid / total) : 0;
  return {
    totalAmount: total,
    paidAmount: paid,
    remainingAmount: remaining,
    paidCount,
    totalCount,
    progress,
    complete: totalCount > 0 && paidCount === totalCount,
  };
}

export function recentPayments(bill: Bill, limit = 10): Participant[] {
  return bill.participants
    .filter((p) => p.paid && p.paidAt)
    .sort((a, b) => (a.paidAt! < b.paidAt! ? 1 : -1))
    .slice(0, limit);
}
