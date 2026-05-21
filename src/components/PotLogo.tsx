interface PotLogoProps {
  size?: number;
  className?: string;
}

export default function PotLogo({ size = 28, className = "" }: PotLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden
      className={className}
    >
      {/* Lid */}
      <rect
        x="8"
        y="6"
        width="16"
        height="2.6"
        rx="1.3"
        fill="var(--terracotta)"
      />
      <circle cx="16" cy="5.6" r="1.2" fill="var(--terracotta)" />
      {/* Pot body */}
      <path
        d="M 6 10 Q 6 9, 7 9 L 25 9 Q 26 9, 26 10 L 27 23 Q 27 27, 23 27 L 9 27 Q 5 27, 5 23 Z"
        fill="var(--amber)"
      />
      {/* Pot rim highlight */}
      <path
        d="M 6.5 11 Q 6.5 10.5, 7 10.5 L 25 10.5 Q 25.5 10.5, 25.5 11"
        stroke="var(--paper)"
        strokeWidth="0.7"
        strokeOpacity="0.6"
        fill="none"
      />
      {/* Liquid level */}
      <path
        d="M 6.2 16 Q 9 14, 12 16 T 18 16 T 24 16 T 25.8 16 L 26.5 23 Q 26.5 26.5, 23 26.5 L 9 26.5 Q 5.5 26.5, 5.5 23 Z"
        fill="var(--terracotta)"
      />
    </svg>
  );
}
