import Link from "next/link";
import QRCode from "qrcode";
import Pot from "@/components/Pot";
import ParticipantRow from "@/components/ParticipantRow";
import PaymentDetailsEditor from "@/components/PaymentDetailsEditor";
import ShareSheet from "@/components/ShareSheet";
import SiteHeader from "@/components/SiteHeader";
import ReminderComposer from "@/components/ReminderComposer";
import DeleteBillButton from "@/components/DeleteBillButton";
import CelebrationOverlay from "@/components/CelebrationOverlay";
import { billStats, getBillForAdmin, recentPayments } from "@/lib/bills";
import {
  dueLabel,
  formatDate,
  formatMoney,
  formatRelativeTime,
} from "@/lib/format";
import { publicUploadUrl } from "@/lib/uploads";
import { getBaseUrl } from "@/lib/url";

export const metadata = { title: "Dashboard — Pot" };

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ token?: string }>;
}

export default async function AdminPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { token } = await searchParams;
  if (!token) return <Forbidden />;

  const bill = getBillForAdmin(slug, token);
  if (!bill) {
    return <Forbidden />;
  }
  const stats = billStats(bill);
  const recent = recentPayments(bill, 6);
  const unpaid = bill.participants.filter((p) => !p.paid);

  const billUrl = `${await getBaseUrl()}/b/${slug}`;
  const qr = await QRCode.toDataURL(billUrl, {
    margin: 1,
    width: 360,
    color: { dark: "#3E2C23", light: "#FBF6EC" },
  });

  return (
    <>
      <SiteHeader
        showCreate={false}
        rightSlot={
          <Link
            href={`/b/${slug}`}
            target="_blank"
            className="hidden sm:inline-flex chip"
          >
            View public →
          </Link>
        }
      />

      <main className="mx-auto w-full max-w-3xl px-5 pb-24 pt-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="chip mb-2">Organizer dashboard</span>
            <h1 className="font-display text-2xl sm:text-3xl text-ink leading-tight">
              {bill.title}
            </h1>
            <p className="mt-1 text-sm text-ink-soft">
              {bill.description ?? "—"}
            </p>
            {bill.dueDate && (
              <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-ink-faint">
                <CalendarIcon />
                {formatDate(bill.dueDate)} · {dueLabel(bill.dueDate)}
              </p>
            )}
          </div>
          <Link
            href={`/b/${slug}`}
            target="_blank"
            className="btn btn-ghost !py-2 !text-xs sm:hidden"
          >
            Public ↗
          </Link>
        </div>

        {/* Pot + stats */}
        <section className="card mt-6 overflow-hidden p-5 sm:p-7">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <div className="mx-auto flex-shrink-0">
              <Pot
                progress={stats.progress}
                size={170}
                label={`${Math.round(stats.progress * 100)}%`}
              />
            </div>
            <div className="flex flex-1 flex-col gap-3">
              <div className="grid grid-cols-3 gap-3">
                <BigStat
                  label="Collected"
                  value={formatMoney(stats.paidAmount, bill.currency)}
                  accent="sage"
                />
                <BigStat
                  label="Remaining"
                  value={formatMoney(stats.remainingAmount, bill.currency)}
                  accent="terracotta"
                />
                <BigStat
                  label="Total"
                  value={formatMoney(stats.totalAmount, bill.currency)}
                  accent="ink"
                />
              </div>
              <div className="dotted-divider" />
              <div className="flex items-center justify-between text-sm text-ink-soft">
                <span>
                  <strong className="text-ink font-display tabular">
                    {stats.paidCount}
                  </strong>{" "}
                  / {stats.totalCount} settled
                </span>
                {stats.complete && (
                  <span className="chip chip-paid">All settled 🌿</span>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Side-by-side: participants + side panel */}
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
          {/* Participants */}
          <section>
            {unpaid.length > 0 && (
              <>
                <SectionHeader
                  title="Still waiting"
                  count={unpaid.length}
                  tone="terracotta"
                />
                <ul className="mt-3 flex flex-col gap-2">
                  {unpaid.map((p) => (
                    <ParticipantRow
                      key={p.id}
                      participant={p}
                      currency={bill.currency}
                      slug={bill.id}
                      mode="admin"
                      token={token}
                      receiptUrl={
                        p.receiptPath ? publicUploadUrl(p.receiptPath) : null
                      }
                    />
                  ))}
                </ul>
              </>
            )}

            {bill.participants.filter((p) => p.paid).length > 0 && (
              <>
                <SectionHeader
                  title="Settled"
                  count={bill.participants.filter((p) => p.paid).length}
                  tone="sage"
                  className={unpaid.length > 0 ? "mt-6" : ""}
                />
                <ul className="mt-3 flex flex-col gap-2">
                  {bill.participants
                    .filter((p) => p.paid)
                    .map((p) => (
                      <ParticipantRow
                        key={p.id}
                        participant={p}
                        currency={bill.currency}
                        slug={bill.id}
                        mode="admin"
                        token={token}
                      />
                    ))}
                </ul>
              </>
            )}
          </section>

          {/* Sidebar */}
          <aside className="flex flex-col gap-4">
            <PaymentDetailsEditor
              slug={bill.id}
              token={token}
              initialInstructions={bill.paymentInstructions}
              initialQrUrl={
                bill.paymentQrPath ? publicUploadUrl(bill.paymentQrPath) : null
              }
            />

            <ReminderComposer
              unpaid={unpaid}
              billTitle={bill.title}
              billUrl={billUrl}
              currency={bill.currency}
              dueDate={bill.dueDate}
              organizerName={bill.organizerName}
            />

            <div className="card !rounded-2xl border-line p-4">
              <h3 className="font-display text-base text-ink mb-3">
                Share the bill
              </h3>
              <ShareSheet
                url={billUrl}
                title={bill.title}
                amountLabel={formatMoney(bill.totalAmount, bill.currency)}
                qrDataUrl={qr}
              />
            </div>

            {recent.length > 0 && (
              <div className="card !rounded-2xl border-line p-4">
                <h3 className="font-display text-base text-ink mb-3">
                  Recent activity
                </h3>
                <ul className="flex flex-col gap-2.5">
                  {recent.map((p) => (
                    <li
                      key={p.id}
                      className="flex items-center gap-2 text-sm"
                    >
                      <span className="inline-flex h-2 w-2 rounded-full bg-sage" />
                      <span className="font-medium text-ink truncate">
                        {p.name}
                      </span>
                      <span className="text-ink-soft tabular">
                        {formatMoney(p.amount, bill.currency)}
                      </span>
                      <span className="ml-auto text-xs text-ink-faint flex-shrink-0">
                        {formatRelativeTime(p.paidAt)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>
        </div>

        {/* Footer admin actions */}
        <div className="mt-10 flex flex-col items-center gap-2 text-center">
          <DeleteBillButton slug={bill.id} token={token} />
          <p className="text-[11px] text-ink-faint">
            Bill created {formatRelativeTime(bill.createdAt)}
          </p>
        </div>

        <CelebrationOverlay
          active={stats.complete}
          message="The pot is full!"
        />
      </main>
    </>
  );
}

function BigStat({
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
    <div className="text-center sm:text-left">
      <p className={`font-display tabular text-lg sm:text-xl ${accentClass}`}>
        {value}
      </p>
      <p className="mt-0.5 text-[10px] sm:text-xs uppercase tracking-wider text-ink-faint">
        {label}
      </p>
    </div>
  );
}

function SectionHeader({
  title,
  count,
  tone,
  className = "",
}: {
  title: string;
  count: number;
  tone: "sage" | "terracotta";
  className?: string;
}) {
  return (
    <div
      className={`flex items-baseline justify-between border-b border-line/60 pb-2 ${className}`}
    >
      <h2 className="font-display text-lg text-ink">
        {title}
        <span
          className={`ml-2 text-sm font-sans font-medium ${
            tone === "sage" ? "text-sage-deep" : "text-terracotta-2"
          }`}
        >
          ({count})
        </span>
      </h2>
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

function Forbidden() {
  return (
    <>
      <SiteHeader showCreate={false} />
      <main className="mx-auto flex w-full max-w-md flex-col items-center px-5 pb-24 pt-16 text-center">
        <div className="text-6xl" aria-hidden>
          🔒
        </div>
        <h1 className="mt-4 font-display text-3xl text-ink">Private pot.</h1>
        <p className="mt-2 text-ink-soft">
          This dashboard requires the organizer link with its secret token. If
          you&apos;re the organizer, open the URL you saved when you created
          the bill.
        </p>
        <Link href="/" className="btn btn-ghost mt-6 !py-3">
          Back to home
        </Link>
      </main>
    </>
  );
}
