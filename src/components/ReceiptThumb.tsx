"use client";

import { useState } from "react";
import ImageLightbox from "./ImageLightbox";

interface Props {
  url: string;
  alt: string;
  /** Compact (inline next to a name) or block (under a row). */
  size?: "sm" | "md";
}

export default function ReceiptThumb({ url, alt, size = "sm" }: Props) {
  const [open, setOpen] = useState(false);
  const dim = size === "sm" ? "h-7 w-7" : "h-12 w-12";

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        title="View receipt"
        aria-label="View attached receipt"
        className={`relative inline-flex shrink-0 overflow-hidden rounded-md border border-line bg-white transition hover:shadow-[var(--shadow-pop)] ${dim}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt={alt}
          loading="lazy"
          className="h-full w-full object-cover"
        />
      </button>
      <ImageLightbox
        src={open ? url : null}
        alt={alt}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
