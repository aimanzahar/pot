"use client";

import { motion } from "framer-motion";
import { useId, useMemo } from "react";

interface PotProps {
  progress: number;
  label?: string;
  size?: number;
  showShimmer?: boolean;
  className?: string;
}

export default function Pot({
  progress,
  label,
  size = 240,
  showShimmer = true,
  className = "",
}: PotProps) {
  const p = Math.max(0, Math.min(1, progress));
  const filled = p >= 0.999;
  const uid = useId().replace(/:/g, "");
  const ids = useMemo(
    () => ({
      clip: `pot-clip-${uid}`,
      grad: `pot-grad-${uid}`,
      surface: `pot-surface-${uid}`,
      rim: `pot-rim-${uid}`,
      shadow: `pot-shadow-${uid}`,
      stem: `pot-stem-${uid}`,
    }),
    [uid],
  );

  /* Geometry of the pot body (in 100x100 viewBox):
     Body curve: a rounded vessel. Liquid fills from y=85 (bottom) up to y=30 (top of body).
     Range = 55 units. y = 85 - (p * 55). */
  const bodyTop = 30;
  const bodyBottom = 85;
  const range = bodyBottom - bodyTop;
  const liquidY = bodyBottom - p * range;

  return (
    <div
      className={`relative inline-flex flex-col items-center ${className}`}
      style={{ width: size }}
      aria-label={
        label ?? `Pot is ${Math.round(p * 100)} percent full`
      }
      role="img"
    >
      {/* Halo glow when full */}
      <motion.div
        aria-hidden
        initial={false}
        animate={{
          opacity: filled ? 1 : 0,
          scale: filled ? 1 : 0.8,
        }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="absolute inset-0 pointer-events-none"
        style={{
          boxShadow: "var(--glow-warm)",
          borderRadius: "50%",
          filter: "blur(8px)",
        }}
      />

      <svg
        viewBox="0 0 100 110"
        width={size}
        height={size * 1.1}
        className="relative drop-shadow-[0_8px_24px_rgba(62,44,35,0.18)]"
      >
        <defs>
          {/* Pot body silhouette = clipping path for liquid */}
          <clipPath id={ids.clip}>
            <path
              d={`
                M 18 30
                Q 18 22 26 22
                L 74 22
                Q 82 22 82 30
                L 84 80
                Q 84 90 74 90
                L 26 90
                Q 16 90 16 80
                Z
              `}
            />
          </clipPath>

          {/* Liquid gradient — warm amber to terracotta */}
          <linearGradient id={ids.grad} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="var(--amber)" stopOpacity="0.95" />
            <stop offset="60%" stopColor="var(--terracotta)" stopOpacity="0.98" />
            <stop
              offset="100%"
              stopColor="var(--terracotta-2)"
              stopOpacity="1"
            />
          </linearGradient>

          {/* Surface highlight gradient */}
          <linearGradient id={ids.surface} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="white" stopOpacity="0.35" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </linearGradient>

          {/* Rim shadow */}
          <linearGradient id={ids.rim} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="var(--ink)" stopOpacity="0.18" />
            <stop offset="100%" stopColor="var(--ink)" stopOpacity="0" />
          </linearGradient>

          {/* Wave path — repeats twice for seamless loop */}
          <path
            id={ids.stem}
            d="M 0 4 Q 12.5 0, 25 4 T 50 4 T 75 4 T 100 4 V 60 H 0 Z"
          />
        </defs>

        {/* Pot body fill (background) */}
        <path
          d="M 18 30 Q 18 22 26 22 L 74 22 Q 82 22 82 30 L 84 80 Q 84 90 74 90 L 26 90 Q 16 90 16 80 Z"
          fill="var(--paper)"
          stroke="var(--ink)"
          strokeOpacity="0.18"
          strokeWidth="0.7"
        />

        {/* Liquid (clipped to pot body) */}
        <g clipPath={`url(#${ids.clip})`}>
          <motion.g
            initial={false}
            animate={{ y: liquidY }}
            transition={{
              type: "spring",
              stiffness: 80,
              damping: 18,
              mass: 1,
            }}
            style={{ originY: 0 }}
          >
            {/* Animated wave surface — moves horizontally for shimmer */}
            <motion.g
              animate={{ x: [-50, 0] }}
              transition={{
                duration: 6,
                ease: "linear",
                repeat: Infinity,
              }}
            >
              {/* Two adjacent wave paths for seamless tiling */}
              <use href={`#${ids.stem}`} x="0" fill={`url(#${ids.grad})`} />
              <use href={`#${ids.stem}`} x="100" fill={`url(#${ids.grad})`} />
            </motion.g>

            {/* Second wave layer, opposite direction, lower opacity — adds depth */}
            <motion.g
              animate={{ x: [0, -50] }}
              transition={{
                duration: 9,
                ease: "linear",
                repeat: Infinity,
              }}
              style={{ opacity: 0.45 }}
            >
              <use
                href={`#${ids.stem}`}
                x="0"
                y="1.5"
                fill="var(--amber)"
              />
              <use
                href={`#${ids.stem}`}
                x="100"
                y="1.5"
                fill="var(--amber)"
              />
            </motion.g>

            {/* Surface highlight band */}
            {showShimmer && (
              <motion.rect
                x="0"
                y="3"
                width="100"
                height="2"
                fill={`url(#${ids.surface})`}
                animate={{ opacity: [0.5, 0.95, 0.5] }}
                transition={{
                  duration: 3.2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            )}
          </motion.g>
        </g>

        {/* Inner rim shadow inside pot for depth */}
        <path
          d="M 18 30 Q 18 22 26 22 L 74 22 Q 82 22 82 30"
          fill="none"
          stroke={`url(#${ids.rim})`}
          strokeWidth="3"
        />

        {/* Pot lip / band */}
        <ellipse
          cx="50"
          cy="24"
          rx="32"
          ry="3.5"
          fill="var(--cream-2)"
          stroke="var(--ink)"
          strokeOpacity="0.2"
          strokeWidth="0.6"
        />
        <ellipse
          cx="50"
          cy="23"
          rx="32"
          ry="3.5"
          fill="var(--paper)"
          stroke="var(--ink)"
          strokeOpacity="0.18"
          strokeWidth="0.6"
        />

        {/* Steam wisps when full */}
        <motion.g
          initial={false}
          animate={{ opacity: filled ? 0.7 : 0 }}
          transition={{ duration: 0.5 }}
        >
          <Steam x={40} delay={0} />
          <Steam x={50} delay={0.6} />
          <Steam x={60} delay={1.2} />
        </motion.g>

        {/* Subtle ground shadow */}
        <ellipse
          cx="50"
          cy="96"
          rx="36"
          ry="3"
          fill="var(--ink)"
          opacity="0.1"
        />
      </svg>

      {label && (
        <div className="mt-2 text-center font-display text-2xl tabular text-ink">
          {label}
        </div>
      )}
    </div>
  );
}

function Steam({ x, delay }: { x: number; delay: number }) {
  return (
    <motion.path
      d={`M ${x} 18 Q ${x - 2} 12, ${x + 1} 6 T ${x} -4`}
      stroke="var(--ink-soft)"
      strokeOpacity="0.55"
      strokeWidth="0.8"
      strokeLinecap="round"
      fill="none"
      animate={{
        opacity: [0, 0.7, 0],
        y: [0, -6, -12],
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: "easeOut",
        delay,
      }}
    />
  );
}
