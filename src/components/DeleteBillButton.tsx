"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { deleteBillAction } from "@/lib/actions";

export default function DeleteBillButton({
  slug,
  token,
}: {
  slug: string;
  token: string;
}) {
  const [confirming, setConfirming] = useState(false);
  const [pending, setPending] = useState(false);

  async function doDelete() {
    setPending(true);
    const fd = new FormData();
    fd.set("slug", slug);
    fd.set("token", token);
    await deleteBillAction(fd);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="text-xs font-medium text-ink-faint hover:text-terracotta underline decoration-dotted underline-offset-2"
      >
        Delete this bill
      </button>
      <AnimatePresence>
        {confirming && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 flex items-end sm:items-center justify-center bg-ink/40 p-4"
            onClick={() => !pending && setConfirming(false)}
          >
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 30, opacity: 0 }}
              transition={{ type: "spring", stiffness: 280, damping: 26 }}
              className="card w-full max-w-sm p-5"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="font-display text-xl text-ink">Delete this pot?</h3>
              <p className="mt-2 text-sm text-ink-soft">
                This removes the bill and all payment records. The shared link
                will stop working immediately. This can&apos;t be undone.
              </p>
              <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setConfirming(false)}
                  disabled={pending}
                  className="btn btn-ghost !py-2.5"
                >
                  Keep it
                </button>
                <button
                  type="button"
                  onClick={doDelete}
                  disabled={pending}
                  className="btn !py-2.5 bg-terracotta-2 !text-cream border-transparent hover:brightness-95"
                >
                  {pending ? "Deleting…" : "Yes, delete"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
