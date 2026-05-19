import Link from "next/link";

export function SiteHeader() {
  return (
    <nav className="relative z-10 flex items-center justify-between px-8 py-6 sm:px-12">
      <Link
        href="/"
        className="font-mono text-sm tracking-wider text-ink-500 transition hover:text-ink-900"
      >
        peek
      </Link>
      <div className="flex items-center gap-6 text-sm text-ink-500">
        <Link
          href="/play"
          className="transition hover:text-ink-900"
        >
          play
        </Link>
        <a
          href="https://github.com/nylaimanii/peek"
          target="_blank"
          rel="noopener noreferrer"
          className="transition hover:text-ink-900"
        >
          github
        </a>
        <span className="rounded-full bg-cream-200 px-3 py-1 text-xs font-medium text-ink-700">
          v0.1
        </span>
      </div>
    </nav>
  );
}
