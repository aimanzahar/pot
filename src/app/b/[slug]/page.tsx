import Link from "next/link";
import { notFound } from "next/navigation";
import QRCode from "qrcode";
import Pot from "@/components/Pot";
import ParticipantRow from "@/components/ParticipantRow";
import PaymentDetailsCard from "@/components/PaymentDetailsCard";
import ShareSheet from "@/components/ShareSheet";
import SiteHeader from "@/components/SiteHeader";
import CelebrationOverlay from "@/components/CelebrationOverlay";
import { billStats, getBill } from "@/lib/bills";
import { dueLabel, formatDate, formatMoney } from "@/lib/format";
import { publicUploadUrl } from "@/lib/uploads";
import { getBaseUrl } from "@/lib/url";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const bill = getBill(slug);
  if (!bill) return { title: "Bill not found — Pot" };
  return {
    title: `${bill.title} — Pot`,
    description: bill.description ?? "Settle up the friendly way.",
  };
}

export default async function PublicBillPage({ params }: PageProps) {
  const { slug } = await params;
  const bill = getBill(slug);
  if (!bill) notFound();
  const stats = billStats(bill);

  const billUrl = `${await getBaseUrl()}/b/${slug}`;
  const qr = await QRCode.toDataURL(billUrl, {
    margin: 1,
    width: 360,
    color: { dark: "#3E2C23", light: "#FBF6EC" },
  });

  return (
    <>
      <SiteHeader showCreate={false} />
      <main className="mx-auto w-full max-w-2xl px-5 pb-24 pt-6">
        {/* Title block */}
        <header className="text-center">
          <span className="chip mb-3">
            {bill.organizerName
              ? `Hosted by ${bill.organizerName}`
              : "Communal pot"}
          </span>
          <h1 className="font-display text-3xl sm:text-4xl text-ink leading-tight">
            {bill.title}
          </h1>
          {bill.description && (
            <p className="mt-2 text-ink-soft text-sm max-w-md mx-auto">
              {bill.description}
            </p>
          )}
          {bill.dueDate && (
            <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-ink-faint">
              <CalendarIcon />
              {formatDate(bill.dueDate)} · {dueLabel(bill.dueDate)}
            </p>
          )}
        </header>

        {/* Pot + stats */}
        <section className="mt-6 flex justify-center">
          <Pot
            progress={stats.progress}
            size={210}
            label={`${Math.round(stats.progress * 100)}%`}
          />
        </section>

        <section className="mt-6 grid grid-cols-3 gap-2 sm:gap-3">
          <Stat
            label="Collected"
            value={formatMoney(stats.paidAmount, bill.currency)}
            accent="sage"
          />
          <Stat
            label="Remaining"
            value={formatMoney(stats.remainingAmount, bill.currency)}
            accent="terracotta"
          />
          <Stat
            label="Of total"
            value={formatMoney(stats.totalAmount, bill.currency)}
            accent="ink"
          />
        </section>

        <p className="mt-3 text-center text-xs text-ink-faint">
          {stats.paidCount} of {stats.totalCount} chipped in
        </p>

        {/* Payment details (how to pay the organizer) */}
        <section className="mt-8">
          <PaymentDetailsCard
            instructions={bill.paymentInstructions}
            qrUrl={
              bill.paymentQrPath ? publicUploadUrl(bill.paymentQrPath) : null
            }
            organizerName={bill.organizerName}
          />
        </section>

        {/* Participants */}
        <section className="mt-8">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-lg text-ink">Who&apos;s in</h2>
            <span className="text-xs text-ink-faint">
              Tap your name to confirm
            </span>
          </div>
          <ul className="flex flex-col gap-2">
            {bill.participants.map((p) => (
              <ParticipantRow
                key={p.id}
                // Strip receiptPath — receipts are host-only and would
                // otherwise leak through the RSC payload to the client.
                participant={{ ...p, receiptPath: null }}
                currency={bill.currency}
                slug={bill.id}
                mode="public"
              />
            ))}
          </ul>
        </section>

        {/* Share */}
        <section className="card mt-8 p-5 sm:p-6">
          <h2 className="font-display text-lg text-ink">Send to the rest</h2>
          <p className="mt-1 mb-4 text-sm text-ink-soft">
            Help spread the link to everyone who still needs to chip in.
          </p>
          <ShareSheet
            url={billUrl}
            title={bill.title}
            amountLabel={formatMoney(bill.totalAmount, bill.currency)}
            qrDataUrl={qr}
          />
        </section>

        <footer className="mt-10 text-center text-xs text-ink-faint">
          <p>
            Made with{" "}
            <Link
              href="/"
              className="text-ink-soft underline decoration-dotted underline-offset-2"
            >
              Pot
            </Link>{" "}
            · everyone chips in
          </p>
        </footer>

        <CelebrationOverlay active={stats.complete} message="Pot full!" />
      </main>
    </>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: "sage" | "terracotta" | "ink";
}) {
  const accentClass =
    accent === "sage"
      ? "text-sage-deep"
      : accent === "terracotta"
      ? "text-terracotta-2"
      : "text-ink";
  return (
    <div className="card !rounded-2xl px-3 py-3 text-center !shadow-none">
      <p className={`font-display tabular text-base sm:text-lg ${accentClass}`}>
        {value}
      </p>
      <p className="mt-0.5 text-[10px] sm:text-xs uppercase tracking-wider text-ink-faint">
        {label}
      </p>
    </div>
  );
}

function CalendarIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  );
}
