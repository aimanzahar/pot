import "server-only";
import { nanoid } from "nanoid";
import { getDb } from "./db";
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
      currency, split_mode, due_date, organizer_name, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const insertParticipant = db.prepare(`
    INSERT INTO participants (
      id, bill_id, name, amount, paid, paid_at, payment_note, created_at
    ) VALUES (?, ?, ?, ?, 0, NULL, NULL, ?)
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
): { ok: boolean; reason?: string } {
  const db = getDb();
  const row = loadBillRow(slug);
  if (!row) return { ok: false, reason: "bill_not_found" };

  const res = db
    .prepare(
      `UPDATE participants
         SET paid = 1,
             paid_at = ?,
             payment_note = ?
         WHERE id = ? AND bill_id = ? AND paid = 0`,
    )
    .run(new Date().toISOString(), note, participantId, row.id);

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
    db.prepare(
      `UPDATE participants
         SET paid = 0, paid_at = NULL, payment_note = NULL
         WHERE id = ? AND bill_id = ?`,
    ).run(participantId, row.id);
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
  db.prepare("DELETE FROM bills WHERE id = ?").run(row.id);
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
