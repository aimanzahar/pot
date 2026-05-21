import BillForm from "@/components/BillForm";
import SiteHeader from "@/components/SiteHeader";

export const metadata = {
  title: "Create a bill — Pot",
};

export default function NewBillPage() {
  return (
    <>
      <SiteHeader showCreate={false} />
      <main className="mx-auto w-full max-w-2xl px-5 pb-24 pt-8 sm:pt-10">
        <div className="mb-8">
          <h1 className="font-display text-3xl sm:text-4xl text-ink leading-tight">
            Start a pot
          </h1>
          <p className="mt-2 text-ink-soft">
            Fill in the basics. We&apos;ll generate a share link and a private
            dashboard for you.
          </p>
        </div>
        <BillForm />
      </main>
    </>
  );
}
