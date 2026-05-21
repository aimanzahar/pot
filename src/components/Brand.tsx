import Link from "next/link";
import PotLogo from "./PotLogo";

export default function Brand({
  href = "/",
  size = 28,
}: {
  href?: string | null;
  size?: number;
}) {
  const inner = (
    <div className="inline-flex items-center gap-2.5">
      <PotLogo size={size} />
      <span className="font-display text-2xl font-semibold tracking-tight text-ink">
        Pot
      </span>
    </div>
  );

  if (!href) return inner;
  return <Link href={href}>{inner}</Link>;
}
