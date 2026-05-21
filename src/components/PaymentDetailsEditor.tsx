"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { updatePaymentInfoAction } from "@/lib/actions";
import ImageLightbox from "./ImageLightbox";

interface Props {
  slug: string;
  token: string;
  initialInstructions: string | null;
  initialQrUrl: string | null;
}

export default function PaymentDetailsEditor({
  slug,
  token,
  initialInstructions,
  initialQrUrl,
}: Props) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [instructions, setInstructions] = useState(initialInstructions ?? "");
  const [qrPreview, setQrPreview] = useState<string | null>(null);
  const [removeExistingQr, setRemoveExistingQr] = useState(false);
  const [lightbox, setLightbox] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (qrPreview) URL.revokeObjectURL(qrPreview);
    };
  }, [qrPreview]);

  function startEdit() {
    setInstructions(initialInstructions ?? "");
    setRemoveExistingQr(false);
    if (fileRef.current) fileRef.current.value = "";
    if (qrPreview) URL.revokeObjectURL(qrPreview);
    setQrPreview(null);
    setOpen(true);
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (qrPreview) URL.revokeObjectURL(qrPreview);
    setQrPreview(file ? URL.createObjectURL(file) : null);
    if (file) setRemoveExistingQr(false);
  }

  async function save() {
    setPending(true);
    const fd = new FormData();
    fd.set("slug", slug);
    fd.set("token", token);
    fd.set("paymentInstructions", instructions);
    const file = fileRef.current?.files?.[0];
    if (file) fd.set("paymentQr", file);
    if (removeExistingQr && !file) fd.set("removeQr", "true");
    await updatePaymentInfoAction(fd);
    setPending(false);
    setOpen(false);
  }

  const hasAny = !!(initialInstructions || initialQrUrl);

  // Resolves the QR shown in "preview" while editing:
  // - new upload preview (if user just picked a file)
  // - existing QR (unless user ticked remove)
  // - nothing
  const previewSrc = qrPreview ?? (!removeExistingQr ? initialQrUrl : null);

  return (
    <div className="card !rounded-2xl border-line p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="font-display text-base text-ink">Payment details</h3>
        {!open && (
          <button
            type="button"
            onClick={startEdit}
            className="text-xs font-semibold text-terracotta hover:text-terracotta-2 underline decoration-dotted underline-offset-2"
          >
            {hasAny ? "Edit" : "Add"}
          </button>
        )}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {!open ? (
          <motion.div
            key="view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            {hasAny ? (
              <div className="space-y-2.5">
                {initialInstructions && (
                  <pre className="m-0 whitespace-pre-wrap rounded-xl border border-line bg-cream-2/40 px-3 py-2.5 font-sans text-xs leading-relaxed text-ink-soft">
                    {initialInstructions}
                  </pre>
                )}
                {initialQrUrl && (
                  <button
                    type="button"
                    onClick={() => setLightbox(true)}
                    className="inline-flex rounded-xl border border-line bg-white p-1.5 transition hover:shadow-[var(--shadow-pop)]"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={initialQrUrl}
                      alt="Payment QR"
                      className="h-20 w-20 object-contain"
                    />
                  </button>
                )}
              </div>
            ) : (
              <p className="rounded-xl border border-dashed border-line bg-cream-2/30 px-3 py-2.5 text-xs text-ink-soft">
                None set yet. Add bank details or a QR so members know how to
                pay you.
              </p>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="edit"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="space-y-3"
          >
            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium text-ink-soft">
                Instructions
              </span>
              <textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                rows={3}
                maxLength={500}
                placeholder="DuitNow: 016-1234567 (Aiman)"
              />
            </label>

            <div>
              <span className="text-xs font-medium text-ink-soft">
                QR image
              </span>
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFile}
                className="hidden"
                id={`pde-qr-${slug}`}
              />
              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                <label
                  htmlFor={`pde-qr-${slug}`}
                  className="btn btn-ghost !py-1.5 !px-3 !text-xs cursor-pointer"
                >
                  {previewSrc ? "Replace" : "Choose"}
                </label>
                {previewSrc && (
                  <button
                    type="button"
                    onClick={() => {
                      if (qrPreview) {
                        URL.revokeObjectURL(qrPreview);
                        setQrPreview(null);
                        if (fileRef.current) fileRef.current.value = "";
                      } else {
                        setRemoveExistingQr(true);
                      }
                    }}
                    className="text-xs text-terracotta-2 hover:underline"
                  >
                    Remove
                  </button>
                )}
              </div>
              {previewSrc && (
                <div className="mt-2 inline-flex rounded-xl border border-line bg-white p-1.5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={previewSrc}
                    alt="QR preview"
                    className="h-20 w-20 object-contain"
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={pending}
                className="btn btn-ghost !py-1.5 !px-3 !text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={save}
                disabled={pending}
                className="btn btn-primary !py-1.5 !px-3 !text-xs"
              >
                {pending ? "Saving…" : "Save"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <ImageLightbox
        src={lightbox && initialQrUrl ? initialQrUrl : null}
        alt="Payment QR code"
        onClose={() => setLightbox(false)}
      />
    </div>
  );
}
