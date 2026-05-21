import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";

export default function BillNotFound() {
  return (
    <>
      <SiteHeader showCreate={false} />
      <main className="mx-auto flex w-full max-w-md flex-col items-center px-5 pb-24 pt-16 text-center">
        <div className="text-6xl" aria-hidden>
          🍲
        </div>
        <h1 className="mt-4 font-display text-3xl text-ink">
          This pot has gone cold.
        </h1>
        <p className="mt-2 text-ink-soft">
          We couldn&apos;t find a bill at that link. It may have been deleted or
          the link is mistyped.
        </p>
        <Link href="/new" className="btn btn-primary mt-6 !py-3">
          Start a new pot
        </Link>
      </main>
    </>
  );
}
