"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  active: boolean;
  message?: string;
}

const COLORS = [
  "#C5553D",
  "#E69A52",
  "#F4D58D",
  "#7A8B6F",
  "#A64530",
  "#CDD7C3",
];

interface Piece {
  id: number;
  left: number;
  delay: number;
  duration: number;
  rotate: number;
  xDelta: number;
  color: string;
  shape: "rect" | "circle";
}

function generatePieces(): Piece[] {
  return Array.from({ length: 80 }).map((_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 0.5,
    duration: 2.4 + Math.random() * 2,
    rotate: Math.random() * 720 - 360,
    xDelta: (Math.random() - 0.5) * 60,
    color: COLORS[Math.floor(Math.random() * COLORS.length)]!,
    shape: Math.random() > 0.5 ? "rect" : "circle",
  }));
}

export default function CelebrationOverlay({
  active,
  message = "Pot full!",
}: Props) {
  const [shown, setShown] = useState(false);
  const [pieces, setPieces] = useState<Piece[]>([]);
  const firedRef = useRef(false);

  useEffect(() => {
    if (!active || firedRef.current) return;
    let seen: string | null = null;
    try {
      seen = sessionStorage.getItem("pot-celebrated");
    } catch {}
    if (seen) {
      firedRef.current = true;
      return;
    }
    firedRef.current = true;

    // Defer state updates so they run as scheduled microtasks, not synchronously
    // in the effect body (React 19 lint rule prefers this).
    const openId = setTimeout(() => {
      try {
        sessionStorage.setItem("pot-celebrated", "1");
      } catch {}
      setPieces(generatePieces());
      setShown(true);
    }, 0);
    const closeId = setTimeout(() => setShown(false), 4200);

    return () => {
      clearTimeout(openId);
      clearTimeout(closeId);
    };
  }, [active]);

  return (
    <AnimatePresence>
      {shown && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="pointer-events-none fixed inset-0 z-50 overflow-hidden"
          aria-hidden
        >
          {/* Warm radial glow */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(circle at center, rgba(230,154,82,0.32), rgba(197,85,61,0.18) 30%, transparent 60%)",
            }}
          />

          {/* Toast */}
          <motion.div
            initial={{ y: -40, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ type: "spring", stiffness: 240, damping: 22 }}
            className="absolute left-1/2 top-12 -translate-x-1/2"
          >
            <div className="flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-cream shadow-[var(--shadow-pop)]">
              <span aria-hidden>✨</span>
              <span className="font-display text-lg">{message}</span>
              <span aria-hidden>✨</span>
            </div>
          </motion.div>

          {/* Confetti */}
          {pieces.map((p) => (
            <motion.span
              key={p.id}
              initial={{ y: "-10vh", x: 0, rotate: 0, opacity: 1 }}
              animate={{
                y: "110vh",
                x: p.xDelta,
                rotate: p.rotate,
                opacity: [1, 1, 0.9, 0],
              }}
              transition={{
                duration: p.duration,
                delay: p.delay,
                ease: "easeIn",
              }}
              className="absolute"
              style={{
                left: `${p.left}%`,
                top: 0,
                width: 8,
                height: p.shape === "rect" ? 12 : 8,
                background: p.color,
                borderRadius: p.shape === "circle" ? "50%" : "2px",
              }}
            />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
