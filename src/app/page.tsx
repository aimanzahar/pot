import Link from "next/link";
import Pot from "@/components/Pot";
import SiteHeader from "@/components/SiteHeader";

export default function HomePage() {
  return (
    <>
      <SiteHeader showCreate={false} />
      <main className="mx-auto flex w-full max-w-3xl flex-col items-center px-5 pb-24">
        {/* Hero */}
        <section className="flex w-full flex-col items-center pt-10 sm:pt-16 text-center">
          <span className="chip mb-6">A friendlier bill-splitter</span>
          <h1 className="font-display text-4xl sm:text-6xl font-medium tracking-tight text-ink leading-[1.05]">
            Everyone chips in.
            <br />
            <span className="text-terracotta italic">The pot fills up.</span>
          </h1>
          <p className="mt-5 max-w-md text-base sm:text-lg text-ink-soft leading-relaxed">
            Create a bill, share a link, and watch contributions flow in.
            No awkward chasing, no spreadsheets — just a satisfying little pot.
          </p>

          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
            <Link href="/new" className="btn btn-primary !px-6 !py-3.5 !text-base">
              Create a bill
              <ArrowRight />
            </Link>
            <Link
              href="#how"
              className="text-sm font-medium text-ink-soft hover:text-ink underline decoration-dotted underline-offset-4"
            >
              How it works
            </Link>
          </div>
        </section>

        {/* Hero Pot demo */}
        <section className="mt-14 sm:mt-20 w-full">
          <div className="card relative mx-auto flex w-full flex-col items-center overflow-hidden px-6 py-10 sm:py-14">
            <div className="absolute -top-12 -right-12 h-44 w-44 rounded-full bg-amber/20 blur-3xl" />
            <div className="absolute -bottom-16 -left-12 h-44 w-44 rounded-full bg-terracotta/15 blur-3xl" />

            <Pot progress={0.72} size={220} />
            <div className="relative mt-4 grid grid-cols-3 gap-6 sm:gap-12 text-center">
              <div>
                <p className="font-display text-xl tabular text-ink">
                  RM 144
                </p>
                <p className="mt-1 text-xs uppercase tracking-wider text-ink-faint">
                  Collected
                </p>
              </div>
              <div>
                <p className="font-display text-xl tabular text-ink">
                  RM 56
                </p>
                <p className="mt-1 text-xs uppercase tracking-wider text-ink-faint">
                  Left
                </p>
              </div>
              <div>
                <p className="font-display text-xl tabular text-ink">
                  5 / 7
                </p>
                <p className="mt-1 text-xs uppercase tracking-wider text-ink-faint">
                  Settled
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="mt-20 w-full">
          <h2 className="font-display text-3xl text-ink text-center">
            Three steps. That&apos;s it.
          </h2>
          <div className="mt-10 grid gap-5 sm:grid-cols-3">
            <Step
              n={1}
              title="Create the bill"
              body="Title, total, due date, and who's in. Split equally or set custom amounts."
            />
            <Step
              n={2}
              title="Share the link"
              body="Drop it in your WhatsApp group. Everyone sees their share and can confirm with a tap."
            />
            <Step
              n={3}
              title="Watch it fill"
              body="As payments come in, the pot fills up. When it's full — well, that's a nice feeling."
            />
          </div>
        </section>

        {/* Features grid */}
        <section className="mt-20 w-full">
          <h2 className="font-display text-3xl text-ink text-center">
            Built for real groups
          </h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            <Feature
              title="Mobile-friendly"
              body="Designed for the WhatsApp generation. Looks great on every screen."
              emoji="📱"
            />
            <Feature
              title="No sign-up needed"
              body="No accounts. No passwords. Just create a bill and share."
              emoji="🪶"
            />
            <Feature
              title="QR + share sheet"
              body="A short link, a QR code, and a pre-filled WhatsApp message — pick your favourite."
              emoji="🔗"
            />
            <Feature
              title="Friendly reminders"
              body="One-tap copy-paste reminder for anyone who's forgotten. Stay friends."
              emoji="🌿"
            />
          </div>
        </section>

        {/* CTA */}
        <section className="mt-20 w-full">
          <div className="card relative overflow-hidden px-6 py-12 sm:px-12 text-center">
            <div className="absolute inset-0 -z-0 opacity-30 [background:radial-gradient(circle_at_30%_30%,var(--amber),transparent_50%),radial-gradient(circle_at_70%_70%,var(--terracotta),transparent_50%)]" />
            <div className="relative">
              <h2 className="font-display text-3xl sm:text-4xl text-ink">
                Ready to fill your first pot?
              </h2>
              <p className="mt-3 text-ink-soft">
                Takes about 30 seconds. No sign-up.
              </p>
              <Link
                href="/new"
                className="btn btn-primary mt-6 !px-6 !py-3.5 !text-base"
              >
                Create a bill
                <ArrowRight />
              </Link>
            </div>
          </div>
        </section>

        <footer className="mt-20 w-full text-center text-xs text-ink-faint">
          <p>Pot · everyone chips in · made with care</p>
        </footer>
      </main>
    </>
  );
}

function Step({ n, title, body }: { n: number; title: string; body: string }) {
  return (
    <div className="card relative px-5 py-6">
      <div className="absolute -top-3 -left-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-terracotta font-display text-cream text-lg shadow-[var(--shadow-pop)]">
        {n}
      </div>
      <h3 className="mt-2 font-display text-xl text-ink">{title}</h3>
      <p className="mt-2 text-sm text-ink-soft leading-relaxed">{body}</p>
    </div>
  );
}

function Feature({
  title,
  body,
  emoji,
}: {
  title: string;
  body: string;
  emoji: string;
}) {
  return (
    <div className="card flex items-start gap-3 px-5 py-5">
      <span
        className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl bg-cream-2 text-lg"
        aria-hidden
      >
        {emoji}
      </span>
      <div>
        <h3 className="font-display text-lg text-ink">{title}</h3>
        <p className="mt-1 text-sm text-ink-soft">{body}</p>
      </div>
    </div>
  );
}

function ArrowRight() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M5 12h14M13 5l7 7-7 7" />
    </svg>
  );
}
