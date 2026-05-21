import Brand from "./Brand";
import ThemeToggle from "./ThemeToggle";

export default function SiteHeader({
  showCreate = true,
  rightSlot,
}: {
  showCreate?: boolean;
  rightSlot?: React.ReactNode;
}) {
  return (
    <header className="sticky top-0 z-30 w-full border-b border-line/60 bg-cream/80 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-3 px-5 py-3.5">
        <Brand />
        <div className="flex items-center gap-2">
          {rightSlot}
          {showCreate && (
            <a
              href="/new"
              className="btn btn-primary hidden sm:inline-flex !py-2 !text-sm"
            >
              + New bill
            </a>
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
