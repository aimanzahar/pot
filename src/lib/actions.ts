"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  adminSetParticipantPaid,
  createBill,
  deleteBill,
  markParticipantPaid,
} from "./bills";
import type { CreateBillInput, Currency, SplitMode } from "./types";
import { CURRENCY_OPTIONS } from "./format";

function parseAmount(raw: FormDataEntryValue | null): number {
  if (typeof raw !== "string") return NaN;
  const n = Number.parseFloat(raw.replace(/[, ]/g, ""));
  return Number.isFinite(n) ? n : NaN;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export async function createBillAction(
  _prev: unknown,
  formData: FormData,
): Promise<{ error?: string; slug?: string; token?: string }> {
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const totalAmount = parseAmount(formData.get("totalAmount"));
  const currencyRaw = String(formData.get("currency") ?? "MYR");
  const currency: Currency = (
    CURRENCY_OPTIONS as readonly string[]
  ).includes(currencyRaw)
    ? (currencyRaw as Currency)
    : "MYR";
  const splitModeRaw = String(formData.get("splitMode") ?? "equal");
  const splitMode: SplitMode =
    splitModeRaw === "custom" ? "custom" : "equal";
  const dueDateRaw = String(formData.get("dueDate") ?? "").trim();
  const organizerName = String(formData.get("organizerName") ?? "").trim();
  const names = formData.getAll("participantName").map((v) => String(v).trim());
  const amounts = formData
    .getAll("participantAmount")
    .map((v) => parseAmount(v));

  if (!title) return { error: "Please give the bill a title." };
  if (!Number.isFinite(totalAmount) || totalAmount <= 0)
    return { error: "Total amount must be greater than 0." };

  const cleaned = names
    .map((name, i) => ({ name, amount: amounts[i] ?? 0 }))
    .filter((p) => p.name.length > 0);
  if (cleaned.length < 2)
    return { error: "Add at least 2 participants." };

  let participants: CreateBillInput["participants"];
  if (splitMode === "equal") {
    const n = cleaned.length;
    const per = round2(totalAmount / n);
    let allocated = 0;
    participants = cleaned.map((p, i) => {
      let amt: number;
      if (i === n - 1) {
        amt = round2(totalAmount - allocated);
      } else {
        amt = per;
        allocated = round2(allocated + per);
      }
      return { name: p.name, amount: amt };
    });
  } else {
    participants = cleaned.map((p) => ({
      name: p.name,
      amount: round2(p.amount),
    }));
    const sum = round2(participants.reduce((s, p) => s + p.amount, 0));
    if (Math.abs(sum - round2(totalAmount)) > 0.01)
      return {
        error: `Custom amounts (${sum.toFixed(2)}) must add up to the total (${totalAmount.toFixed(2)}).`,
      };
    if (participants.some((p) => p.amount <= 0))
      return { error: "Every custom amount must be greater than 0." };
  }

  const { slug, organizerToken } = createBill({
    title,
    description: description || undefined,
    totalAmount: round2(totalAmount),
    currency,
    splitMode,
    dueDate: dueDateRaw || null,
    organizerName: organizerName || undefined,
    participants,
  });

  redirect(`/new/created?slug=${slug}&token=${organizerToken}`);
}

export async function markPaidAction(formData: FormData): Promise<void> {
  const slug = String(formData.get("slug") ?? "");
  const participantId = String(formData.get("participantId") ?? "");
  const note = String(formData.get("note") ?? "").trim() || null;
  if (!slug || !participantId) return;
  markParticipantPaid(slug, participantId, note);
  revalidatePath(`/b/${slug}`);
  revalidatePath(`/b/${slug}/admin`);
}

export async function adminTogglePaidAction(formData: FormData): Promise<void> {
  const slug = String(formData.get("slug") ?? "");
  const token = String(formData.get("token") ?? "");
  const participantId = String(formData.get("participantId") ?? "");
  const paid = String(formData.get("paid") ?? "") === "true";
  if (!slug || !token || !participantId) return;
  adminSetParticipantPaid(slug, token, participantId, paid);
  revalidatePath(`/b/${slug}`);
  revalidatePath(`/b/${slug}/admin`);
}

export async function deleteBillAction(formData: FormData): Promise<void> {
  const slug = String(formData.get("slug") ?? "");
  const token = String(formData.get("token") ?? "");
  if (!slug || !token) return;
  const res = deleteBill(slug, token);
  if (res.ok) redirect("/");
}
