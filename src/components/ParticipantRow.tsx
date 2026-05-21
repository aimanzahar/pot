"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Currency, Participant } from "@/lib/types";
import { formatMoney, formatRelativeTime } from "@/lib/format";
import { markPaidAction, adminTogglePaidAction } from "@/lib/actions";
import ReceiptThumb from "./ReceiptThumb";

interface BaseProps {
  participant: Participant;
  currency: Currency;
  slug: string;
}

interface PublicProps extends BaseProps {
  mode: "public";
}

interface AdminProps extends BaseProps {
  mode: "admin";
  token: string;
  /** Absolute or basePath-prefixed URL for the participant's receipt image. */
  receiptUrl?: string | null;
}

type Props = PublicProps | AdminProps;

export default function ParticipantRow(props: Props) {
  const { participant: p, currency, slug } = props;
  const [pending, setPending] = useState(false);
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const receiptInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (receiptPreview) URL.revokeObjectURL(receiptPreview);
    };
  }, [receiptPreview]);

  function handleReceiptChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (receiptPreview) URL.revokeObjectURL(receiptPreview);
    setReceiptPreview(file ? URL.createObjectURL(file) : null);
  }

  function clearReceipt() {
    if (receiptInputRef.current) receiptInputRef.current.value = "";
    if (receiptPreview) URL.revokeObjectURL(receiptPreview);
    setReceiptPreview(null);
  }

  async function publicConfirm() {
    setPending(true);
    const fd = new FormData();
    fd.set("slug", slug);
    fd.set("participantId", p.id);
    fd.set("note", note);
    const file = receiptInputRef.current?.files?.[0];
    if (file) fd.set("receipt", file);
    await markPaidAction(fd);
    setPending(false);
    setOpen(false);
    clearReceipt();
    setNote("");
  }

  async function adminToggle() {
    if (props.mode !== "admin") return;
    setPending(true);
    const fd = new FormData();
    fd.set("slug", slug);
    fd.set("token", props.token);
    fd.set("participantId", p.id);
    fd.set("paid", String(!p.paid));
    await adminTogglePaidAction(fd);
    setPending(false);
  }

  return (
    <motion.li
      layout
      initial={false}
      animate={{
        backgroundColor: p.paid
          ? "color-mix(in srgb, var(--sage) 8%, var(--paper))"
          : "var(--paper)",
      }}
      transition={{ duration: 0.3 }}
      className="card overflow-hidden !rounded-2xl !shadow-none border-line"
    >
      <div className="flex items-center gap-3 px-4 py-3">
        {/* Avatar */}
        <Avatar name={p.name} paid={p.paid} />

        {/* Name + meta */}
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            <p className="truncate font-medium text-ink">{p.name}</p>
            {p.paid && (
              <span className="text-xs text-ink-faint">
                {formatRelativeTime(p.paidAt)}
              </span>
            )}
          </div>
          {p.paymentNote ? (
            <p className="truncate text-xs text-ink-soft mt-0.5 italic">
              &ldquo;{p.paymentNote}&rdquo;
            </p>
          ) : (
            <p className="text-xs text-ink-faint mt-0.5">
              {p.paid ? "Settled" : "Hasn't paid yet"}
            </p>
          )}
        </div>

        {/* Amount */}
        <div className="text-right">
          <p className="font-display tabular text-base text-ink">
            {formatMoney(p.amount, currency)}
          </p>
        </div>

        {/* Receipt thumb (admin only, when present) */}
        {props.mode === "admin" && p.paid && props.receiptUrl && (
          <ReceiptThumb
            url={props.receiptUrl}
            alt={`Receipt from ${p.name}`}
            size="sm"
          />
        )}

        {/* Action */}
        {props.mode === "public" ? (
          p.paid ? (
            <span className="chip chip-paid">
              <CheckIcon /> Paid
            </span>
          ) : (
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="btn btn-primary !py-2 !px-3 !text-xs"
            >
              I paid
            </button>
          )
        ) : (
          <button
            type="button"
            onClick={adminToggle}
            disabled={pending}
            className={`chip transition ${
              p.paid ? "chip-paid" : "chip-unpaid"
            } cursor-pointer hover:brightness-95`}
            title={
              p.paid
                ? "Click to mark unpaid"
                : "Click to mark paid (organizer)"
            }
          >
            {p.paid ? (
              <>
                <CheckIcon /> Paid
              </>
            ) : (
              <>Mark paid</>
            )}
          </button>
        )}
      </div>

      {/* Public confirm panel */}
      <AnimatePresence initial={false}>
        {props.mode === "public" && open && !p.paid && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden border-t border-line bg-cream-2/40"
          >
            <div className="px-4 py-3.5">
              <p className="text-xs text-ink-soft mb-2">
                Confirm you&apos;ve paid{" "}
                <strong className="text-ink">
                  {formatMoney(p.amount, currency)}
                </strong>{" "}
                — to the organizer, however you sent it.
              </p>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Optional note (e.g. paid via DuitNow)"
                maxLength={120}
              />

              {/* Receipt upload */}
              <div className="mt-2.5">
                <input
                  ref={receiptInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  capture="environment"
                  onChange={handleReceiptChange}
                  className="hidden"
                  id={`receipt-${p.id}`}
                />
                <div className="flex items-center gap-2">
                  <label
                    htmlFor={`receipt-${p.id}`}
                    className="btn btn-ghost !py-1.5 !px-3 !text-xs cursor-pointer"
                  >
                    <PaperclipIcon />
                    {receiptPreview ? "Replace receipt" : "Attach receipt"}
                  </label>
                  <span className="text-[11px] text-ink-faint">
                    optional · only the organizer sees it
                  </span>
                </div>
                {receiptPreview && (
                  <div className="mt-2 inline-flex items-start gap-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={receiptPreview}
                      alt="Receipt preview"
                      className="h-16 w-16 rounded-lg border border-line object-cover bg-white"
                    />
                    <button
                      type="button"
                      onClick={clearReceipt}
                      className="text-[11px] text-ink-faint hover:text-terracotta-2 underline decoration-dotted underline-offset-2"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              <div className="mt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="btn btn-ghost !py-2 !text-sm"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={publicConfirm}
                  disabled={pending}
                  className="btn btn-sage !py-2 !text-sm"
                >
                  {pending ? "Saving…" : "Confirm payment"}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.li>
  );
}

function Avatar({ name, paid }: { name: string; paid: boolean }) {
  const initials = name
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="relative h-10 w-10 flex-shrink-0">
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-full font-display text-sm transition ${
          paid
            ? "bg-sage-soft text-sage-deep"
            : "bg-terracotta-soft text-terracotta-2"
        }`}
      >
        {initials || "·"}
      </div>
      {paid && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-sage text-cream"
        >
          <svg
            width="11"
            height="11"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M5 13l4 4L19 7" />
          </svg>
        </motion.div>
      )}
    </div>
  );
}

function CheckIcon() {
  return (
    <svg
      width="11"
      height="11"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M5 13l4 4L19 7" />
    </svg>
  );
}

function PaperclipIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
    </svg>
  );
}
