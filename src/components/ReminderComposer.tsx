"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Currency, Participant } from "@/lib/types";
import { formatMoney, dueLabel } from "@/lib/format";

interface Props {
  unpaid: Participant[];
  billTitle: string;
  billUrl: string;
  currency: Currency;
  dueDate?: string | null;
  organizerName?: string | null;
}

export default function ReminderComposer({
  unpaid,
  billTitle,
  billUrl,
  currency,
  dueDate,
  organizerName,
}: Props) {
  const [selected, setSelected] = useState<string>(unpaid[0]?.id ?? "");
  const [copied, setCopied] = useState(false);
  const target = unpaid.find((p) => p.id === selected) ?? unpaid[0];

  const message = useMemo(() => {
    if (!target) return "";
    const due = dueDate ? ` (${dueLabel(dueDate)})` : "";
    const from = organizerName ? ` — ${organizerName}` : "";
    return [
      `Hey ${target.name}! Friendly nudge for ${billTitle}${due}.`,
      `Your share is ${formatMoney(target.amount, currency)}.`,
      `Confirm here once you've paid: ${billUrl}`,
      `Thanks!${from}`,
    ].join("\n");
  }, [target, billTitle, billUrl, currency, dueDate, organizerName]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copy this reminder", message);
    }
  }

  if (unpaid.length === 0) {
    return (
      <div className="card !rounded-2xl border-sage-soft bg-sage-soft/30 px-4 py-4">
        <p className="text-sm text-sage-deep">
          🌿 Everyone has settled up. Nothing to remind!
        </p>
      </div>
    );
  }

  const waHref = target
    ? `https://wa.me/?text=${encodeURIComponent(message)}`
    : "#";

  return (
    <div className="card !rounded-2xl border-line p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="font-display text-base text-ink">Send a reminder</h3>
        <span className="chip">
          {unpaid.length} {unpaid.length === 1 ? "person" : "people"}
        </span>
      </div>

      <label className="mb-2 flex flex-col gap-1.5">
        <span className="text-xs text-ink-soft">Pick someone</span>
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
        >
          {unpaid.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} · {formatMoney(p.amount, currency)}
            </option>
          ))}
        </select>
      </label>

      <pre className="mt-2 max-h-44 overflow-auto whitespace-pre-wrap rounded-xl border border-line bg-cream-2/40 px-3 py-2.5 text-xs text-ink-soft font-sans leading-relaxed">
        {message}
      </pre>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={copy}
          className="btn btn-ghost !py-2 !text-sm"
        >
          <AnimatePresence mode="wait" initial={false}>
            {copied ? (
              <motion.span
                key="c"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
              >
                Copied ✓
              </motion.span>
            ) : (
              <motion.span
                key="d"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
              >
                Copy text
              </motion.span>
            )}
          </AnimatePresence>
        </button>
        <a
          href={waHref}
          target="_blank"
          rel="noopener noreferrer"
          className="btn !py-2 !text-sm bg-[#25d366] !text-white hover:brightness-95 border-transparent"
        >
          Send via WhatsApp
        </a>
      </div>
    </div>
  );
}
