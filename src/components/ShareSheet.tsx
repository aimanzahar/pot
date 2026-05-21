"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ShareSheetProps {
  /** Must be an absolute URL — callers should build it server-side from `headers()`. */
  url: string;
  title: string;
  amountLabel?: string;
  qrDataUrl?: string;
  variant?: "full" | "compact";
}

export default function ShareSheet({
  url,
  title,
  amountLabel,
  qrDataUrl,
  variant = "full",
}: ShareSheetProps) {
  const [copied, setCopied] = useState(false);

  const absoluteUrl = url;
  const message =
    `Hey! Settling up: ${title}` +
    (amountLabel ? ` (${amountLabel})` : "") +
    `. Confirm your share here: ${absoluteUrl}`;

  const waUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(absoluteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copy this link", absoluteUrl);
    }
  }

  async function nativeShare() {
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await navigator.share({ title, text: message, url: absoluteUrl });
      } catch {
        /* user cancelled */
      }
    } else {
      await copy();
    }
  }

  return (
    <div
      className={`flex flex-col gap-4 ${
        variant === "full" ? "" : "items-stretch"
      }`}
    >
      {/* Link + copy */}
      <div className="flex items-center gap-2 rounded-2xl border border-line bg-cream-2/60 px-3 py-2.5">
        <span className="text-ink-faint flex-shrink-0">
          <LinkIcon />
        </span>
        <span className="truncate text-sm text-ink-soft tabular">
          {absoluteUrl}
        </span>
        <button
          type="button"
          onClick={copy}
          className="ml-auto inline-flex items-center gap-1.5 rounded-lg bg-cream px-3 py-1.5 text-xs font-semibold text-ink transition hover:bg-paper border border-line/70"
        >
          <AnimatePresence mode="wait" initial={false}>
            {copied ? (
              <motion.span
                key="copied"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="inline-flex items-center gap-1 text-sage-deep"
              >
                <CheckIcon /> Copied
              </motion.span>
            ) : (
              <motion.span
                key="copy"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="inline-flex items-center gap-1"
              >
                <CopyIcon /> Copy
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* Share buttons */}
      <div className="grid grid-cols-2 gap-2">
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn !py-2.5 !text-sm bg-[#25d366] !text-white hover:brightness-95 border-transparent"
        >
          <WaIcon /> WhatsApp
        </a>
        <button
          type="button"
          onClick={nativeShare}
          className="btn btn-ghost !py-2.5 !text-sm"
        >
          <ShareIcon /> Share…
        </button>
      </div>

      {/* QR code */}
      {qrDataUrl && variant === "full" && (
        <details className="group rounded-2xl border border-line bg-cream-2/40 px-4 py-3">
          <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-medium text-ink-soft">
            <span className="inline-flex items-center gap-2">
              <QrIcon />
              Show QR code
            </span>
            <span className="text-ink-faint transition group-open:rotate-180">
              <ChevronIcon />
            </span>
          </summary>
          <div className="mt-3 flex justify-center rounded-xl bg-white p-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={qrDataUrl}
              alt="QR code for this bill"
              className="h-44 w-44"
            />
          </div>
        </details>
      )}
    </div>
  );
}

function LinkIcon() {
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
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}
function CopyIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}
function CheckIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M5 13l4 4L19 7" />
    </svg>
  );
}
function WaIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M12.04 2a9.95 9.95 0 0 0-8.5 15.13L2 22l4.96-1.5A9.95 9.95 0 1 0 12.04 2zm0 18.16a8.16 8.16 0 0 1-4.16-1.14l-.3-.18-2.94.89.94-2.86-.2-.31a8.16 8.16 0 1 1 6.66 3.6zm4.7-6.1c-.26-.13-1.5-.74-1.74-.82-.23-.09-.4-.13-.57.13-.17.26-.65.82-.8.99-.15.17-.3.19-.55.06-.26-.13-1.09-.4-2.07-1.28-.77-.69-1.28-1.53-1.43-1.79-.15-.26-.02-.4.11-.53.11-.11.26-.3.39-.45.13-.15.17-.26.26-.43.09-.17.04-.32-.02-.45-.06-.13-.57-1.38-.78-1.88-.21-.5-.42-.43-.57-.43h-.49c-.17 0-.45.06-.69.32-.24.26-.91.89-.91 2.17 0 1.28.93 2.52 1.06 2.69.13.17 1.83 2.79 4.43 3.91.62.27 1.1.43 1.48.55.62.2 1.18.17 1.63.1.5-.07 1.54-.63 1.76-1.24.22-.61.22-1.13.15-1.24-.06-.11-.24-.18-.5-.31z" />
    </svg>
  );
}
function ShareIcon() {
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
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98" />
    </svg>
  );
}
function QrIcon() {
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
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
      <path d="M14 14h3v3h-3zM20 14v3M14 20h3M20 20h1" />
    </svg>
  );
}
function ChevronIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}
