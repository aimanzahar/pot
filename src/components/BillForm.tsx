"use client";

import Link from "next/link";
import { useActionState, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createBillAction } from "@/lib/actions";
import { CURRENCY_OPTIONS, currencySymbol, formatMoney } from "@/lib/format";
import type { Currency, SplitMode } from "@/lib/types";

interface Row {
  id: string;
  name: string;
  amount: string;
}

function newRow(): Row {
  return {
    id: Math.random().toString(36).slice(2),
    name: "",
    amount: "",
  };
}

function todayLocalISO(): string {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function BillForm() {
  const [state, formAction, pending] = useActionState(createBillAction, {});
  const [currency, setCurrency] = useState<Currency>("MYR");
  const [splitMode, setSplitMode] = useState<SplitMode>("equal");
  const [total, setTotal] = useState("");
  const [rows, setRows] = useState<Row[]>([newRow(), newRow(), newRow()]);

  const totalNum = useMemo(() => {
    const n = Number.parseFloat(total.replace(/[, ]/g, ""));
    return Number.isFinite(n) ? n : 0;
  }, [total]);

  const equalPerPerson = useMemo(() => {
    const filled = rows.filter((r) => r.name.trim().length > 0).length;
    if (!filled || totalNum <= 0) return 0;
    return Math.round((totalNum / filled) * 100) / 100;
  }, [rows, totalNum]);

  const customSum = useMemo(() => {
    return rows.reduce((s, r) => {
      const n = Number.parseFloat(r.amount.replace(/[, ]/g, ""));
      return s + (Number.isFinite(n) ? n : 0);
    }, 0);
  }, [rows]);

  const customDelta = Math.round((customSum - totalNum) * 100) / 100;

  function updateRow(id: string, patch: Partial<Row>) {
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  function addRow() {
    setRows((rs) => [...rs, newRow()]);
  }

  function removeRow(id: string) {
    setRows((rs) => (rs.length > 2 ? rs.filter((r) => r.id !== id) : rs));
  }

  const sym = currencySymbol(currency);

  return (
    <form
      action={formAction}
      className="flex flex-col gap-6"
      noValidate
    >
      {/* Title + description card */}
      <section className="card p-5 sm:p-6">
        <h2 className="font-display text-xl text-ink">What&apos;s this for?</h2>
        <p className="mt-1 text-sm text-ink-soft">
          A short title that everyone will recognise.
        </p>

        <div className="mt-5 flex flex-col gap-4">
          <Field label="Bill title" required>
            <input
              type="text"
              name="title"
              placeholder="Friday dinner @ Mamak"
              required
              maxLength={120}
            />
          </Field>
          <Field label="Description" hint="Optional — a bit of context">
            <textarea
              name="description"
              rows={2}
              placeholder="6 of us, roti + teh tarik. Senang je."
              maxLength={400}
            />
          </Field>
          <Field label="Your name" hint="Shown to everyone on the link">
            <input
              type="text"
              name="organizerName"
              placeholder="Aiman"
              maxLength={60}
            />
          </Field>
        </div>
      </section>

      {/* Total + currency + due date */}
      <section className="card p-5 sm:p-6">
        <h2 className="font-display text-xl text-ink">How much, by when?</h2>
        <p className="mt-1 text-sm text-ink-soft">
          The total bill amount and an optional deadline.
        </p>

        <div className="mt-5 grid gap-4 sm:grid-cols-[1fr_140px_1fr]">
          <Field label="Total" required>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-display text-ink-soft">
                {sym}
              </span>
              <input
                type="text"
                inputMode="decimal"
                name="totalAmount"
                placeholder="0.00"
                value={total}
                onChange={(e) => setTotal(e.target.value)}
                required
                className="!pl-9 tabular"
              />
            </div>
          </Field>
          <Field label="Currency">
            <select
              name="currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value as Currency)}
            >
              {CURRENCY_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Due date" hint="Optional">
            <input
              type="date"
              name="dueDate"
              defaultValue={todayLocalISO()}
            />
          </Field>
        </div>
      </section>

      {/* Participants & split */}
      <section className="card p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-xl text-ink">Who&apos;s chipping in?</h2>
            <p className="mt-1 text-sm text-ink-soft">
              Add at least two. You can always edit names later.
            </p>
          </div>
        </div>

        {/* Split mode toggle */}
        <div className="mt-5 inline-flex rounded-full border border-line bg-cream-2 p-1">
          <SplitToggle
            active={splitMode === "equal"}
            onClick={() => setSplitMode("equal")}
            label="Split equally"
          />
          <SplitToggle
            active={splitMode === "custom"}
            onClick={() => setSplitMode("custom")}
            label="Custom amounts"
          />
        </div>
        <input type="hidden" name="splitMode" value={splitMode} />

        {/* Rows */}
        <ul className="mt-5 flex flex-col gap-2.5">
          <AnimatePresence initial={false}>
            {rows.map((row, idx) => (
              <motion.li
                key={row.id}
                layout
                initial={{ opacity: 0, y: -6, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: -6, height: 0 }}
                transition={{ duration: 0.18 }}
                className="overflow-hidden"
              >
                <div className="flex items-center gap-2">
                  <span className="hidden sm:inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-cream-2 text-sm text-ink-soft font-display">
                    {idx + 1}
                  </span>
                  <input
                    type="text"
                    name="participantName"
                    placeholder={`Name ${idx + 1}`}
                    value={row.name}
                    onChange={(e) =>
                      updateRow(row.id, { name: e.target.value })
                    }
                    maxLength={40}
                  />
                  {splitMode === "custom" ? (
                    <div className="relative w-32 flex-shrink-0">
                      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-display text-ink-soft text-sm">
                        {sym}
                      </span>
                      <input
                        type="text"
                        inputMode="decimal"
                        name="participantAmount"
                        placeholder="0.00"
                        value={row.amount}
                        onChange={(e) =>
                          updateRow(row.id, { amount: e.target.value })
                        }
                        className="!pl-8 tabular"
                      />
                    </div>
                  ) : (
                    <>
                      {/* Always include hidden amount field for equal split (server recalcs) */}
                      <input
                        type="hidden"
                        name="participantAmount"
                        value="0"
                      />
                      <div className="w-32 flex-shrink-0 rounded-xl border border-dashed border-line bg-cream-2/40 px-3 py-2 text-right font-display tabular text-ink-soft">
                        {row.name.trim()
                          ? formatMoney(equalPerPerson, currency)
                          : "—"}
                      </div>
                    </>
                  )}
                  <button
                    type="button"
                    onClick={() => removeRow(row.id)}
                    disabled={rows.length <= 2}
                    className="inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-line text-ink-soft transition hover:bg-cream-2 hover:text-terracotta disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="Remove participant"
                  >
                    <TrashIcon />
                  </button>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>

        <button
          type="button"
          onClick={addRow}
          className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-terracotta hover:text-terracotta-2"
        >
          <PlusIcon />
          Add another
        </button>

        {/* Custom split delta hint */}
        {splitMode === "custom" && totalNum > 0 && (
          <div className="mt-4 text-sm">
            {Math.abs(customDelta) < 0.01 ? (
              <span className="chip chip-paid">
                Adds up · {formatMoney(customSum, currency)}
              </span>
            ) : customDelta > 0 ? (
              <span className="chip chip-unpaid">
                {formatMoney(Math.abs(customDelta), currency)} over the total
              </span>
            ) : (
              <span className="chip chip-unpaid">
                {formatMoney(Math.abs(customDelta), currency)} short of the
                total
              </span>
            )}
          </div>
        )}
      </section>

      {/* Errors */}
      {state.error && (
        <div className="rounded-2xl border border-terracotta/40 bg-terracotta/10 px-4 py-3 text-sm text-terracotta-2">
          {state.error}
        </div>
      )}

      {/* Submit */}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Link href="/" className="btn btn-ghost">
          Cancel
        </Link>
        <button
          type="submit"
          disabled={pending}
          className="btn btn-primary !py-3.5 sm:min-w-[200px]"
        >
          {pending ? "Creating…" : "Create bill"}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="flex items-baseline gap-2 text-sm font-medium text-ink">
        {label}
        {required && <span className="text-terracotta text-xs">required</span>}
        {hint && (
          <span className="text-xs font-normal text-ink-faint">{hint}</span>
        )}
      </span>
      {children}
    </label>
  );
}

function SplitToggle({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`relative rounded-full px-4 py-1.5 text-sm font-medium transition ${
        active ? "text-cream" : "text-ink-soft hover:text-ink"
      }`}
    >
      {active && (
        <motion.span
          layoutId="split-active"
          className="absolute inset-0 rounded-full bg-terracotta shadow-[var(--shadow-pop)]"
          transition={{ type: "spring", stiffness: 400, damping: 32 }}
        />
      )}
      <span className="relative">{label}</span>
    </button>
  );
}

function TrashIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}
