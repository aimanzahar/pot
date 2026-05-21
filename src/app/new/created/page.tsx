import Link from "next/link";
import QRCode from "qrcode";
import { notFound } from "next/navigation";
import Pot from "@/components/Pot";
import ShareSheet from "@/components/ShareSheet";
import SiteHeader from "@/components/SiteHeader";
import { getBillForAdmin } from "@/lib/bills";
import { formatMoney } from "@/lib/format";
import { getBaseUrl } from "@/lib/url";

export const metadata = {
  title: "Bill created — Pot",
};

interface SearchParams {
  slug?: string;
  token?: string;
}

export default async function CreatedPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { slug, token } = await searchParams;
  if (!slug || !token) notFound();
  const bill = getBillForAdmin(slug, token);
  if (!bill) notFound();

  const origin = await getBaseUrl();
  const billUrl = `${origin}/b/${slug}`;
  const adminUrl = `${origin}/b/${slug}/admin?token=${token}`;
  const qr = await QRCode.toDataURL(billUrl, {
    margin: 1,
    width: 360,
    color: { dark: "#3E2C23", light: "#FBF6EC" },
  });

  return (
    <>
      <SiteHeader showCreate={false} />
      <main className="mx-auto w-full max-w-2xl px-5 pb-24 pt-8 sm:pt-10">
        {/* Header */}
        <div className="flex flex-col items-center text-center">
          <span className="chip chip-paid mb-3">
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M5 13l4 4L19 7" />
            </svg>
            Your pot is ready
          </span>
          <h1 className="font-display text-3xl sm:text-4xl text-ink leading-tight">
            {bill.title}
          </h1>
          <p className="mt-2 text-ink-soft">
            {formatMoney(bill.totalAmount, bill.currency)} ·{" "}
            {bill.participants.length} people
          </p>
        </div>

        <div className="mt-8 flex justify-center">
          <Pot progress={0} size={170} showShimmer={false} />
        </div>

        {/* Share */}
        <section className="card mt-8 p-5 sm:p-6">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <h2 className="font-display text-xl text-ink">
                Share the link
              </h2>
              <p className="mt-1 text-sm text-ink-soft">
                Send this to everyone who&apos;s chipping in.
              </p>
            </div>
            <span className="chip">Public</span>
          </div>
          <ShareSheet
            url={billUrl}
            title={bill.title}
            amountLabel={formatMoney(bill.totalAmount, bill.currency)}
            qrDataUrl={qr}
          />
        </section>

        {/* Admin link */}
        <section className="card mt-5 p-5 sm:p-6">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              <h2 className="font-display text-xl text-ink">
                Your private dashboard
              </h2>
              <p className="mt-1 text-sm text-ink-soft">
                Bookmark this. It&apos;s the only way back in — there&apos;s no
                login.
              </p>
            </div>
            <span className="chip chip-overdue">Private</span>
          </div>
          <ShareSheet url={adminUrl} title={`${bill.title} — Admin`} />
          <div className="mt-3 rounded-xl border border-amber/40 bg-amber/10 px-3.5 py-2.5 text-xs text-ink-soft leading-relaxed">
            <strong className="text-ink">Heads up:</strong> anyone with this
            admin link can manage the bill. Keep it to yourself.
          </div>
        </section>

        {/* CTAs */}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href={`/b/${slug}/admin?token=${token}`}
            className="btn btn-primary !py-3"
          >
            Open dashboard
          </Link>
          <Link href={`/b/${slug}`} className="btn btn-ghost !py-3">
            Preview public page
          </Link>
        </div>
      </main>
    </>
  );
}
