"use client";

import { useState } from "react";
import ImageLightbox from "./ImageLightbox";

interface Props {
  instructions: string | null;
  qrUrl: string | null;
  organizerName?: string | null;
}

export default function PaymentDetailsCard({
  instructions,
  qrUrl,
  organizerName,
}: Props) {
  const [lightbox, setLightbox] = useState(false);
  const hasAny = !!(instructions || qrUrl);

  return (
    <section className="card relative overflow-hidden p-5 sm:p-6">
      {/* Decorative gradient corner */}
      <div className="pointer-events-none absolute -top-12 -right-12 h-36 w-36 rounded-full bg-amber/20 blur-3xl" />

      <div className="relative">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="font-display text-xl text-ink">
            How to pay {organizerName ? <>· {organizerName}</> : null}
          </h2>
          <span className="chip">Sender info</span>
        </div>

        {hasAny ? (
          <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-start">
            {instructions ? (
              <pre className="m-0 whitespace-pre-wrap font-sans text-sm leading-relaxed text-ink rounded-xl border border-line bg-cream-2/40 px-3.5 py-3">
                {instructions}
              </pre>
            ) : (
              <p className="text-sm text-ink-soft italic">
                Scan the QR with your banking app to pay.
              </p>
            )}

            {qrUrl && (
              <button
                type="button"
                onClick={() => setLightbox(true)}
                className="group relative shrink-0 self-start rounded-2xl border border-line bg-white p-2 transition hover:shadow-[var(--shadow-pop)]"
                aria-label="Open full-size QR"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={qrUrl}
                  alt="Payment QR code"
                  className="block h-32 w-32 object-contain sm:h-36 sm:w-36"
                />
                <span className="pointer-events-none absolute inset-x-2 bottom-2 rounded-md bg-ink/70 px-1.5 py-0.5 text-center text-[10px] font-medium text-cream opacity-0 transition group-hover:opacity-100">
                  Tap to enlarge
                </span>
              </button>
            )}
          </div>
        ) : (
          <p className="rounded-xl border border-dashed border-line bg-cream-2/40 px-4 py-3 text-sm text-ink-soft">
            Payment details haven&apos;t been added yet. Ask the organizer how
            they&apos;d like to be paid.
          </p>
        )}
      </div>

      {qrUrl && (
        <ImageLightbox
          src={lightbox ? qrUrl : null}
          alt="Payment QR code"
          onClose={() => setLightbox(false)}
        />
      )}
    </section>
  );
}
