import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { HeroPreview } from "@/components/landing/HeroPreview";

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-paper text-ink-900">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 -left-32 h-[420px] w-[420px] rounded-full bg-mint-200 blur-3xl opacity-60"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/3 -right-40 h-[480px] w-[480px] rounded-full bg-lavender-200 blur-3xl opacity-50"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 left-1/4 h-[440px] w-[440px] rounded-full bg-pink-200 blur-3xl opacity-40"
      />

      <SiteHeader />

      <section className="relative z-10 mx-auto flex max-w-5xl flex-col items-center px-6 pt-20 pb-32 text-center sm:pt-24">
        <span className="mb-8 inline-flex items-center gap-2 rounded-full border border-lavender-200 bg-white/60 px-4 py-1.5 text-xs font-medium text-ink-700 backdrop-blur">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-mint-300" />
          an interactive intro to mechanistic interpretability
        </span>

        <h1 className="max-w-3xl text-5xl font-semibold tracking-tight text-ink-900 sm:text-6xl md:text-7xl">
          train a neural network.
          <br />
          then look inside it.
        </h1>

        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-500">
          most tools show you a network learning. peek shows you what it
          learned. train a tiny net in your browser, then trace a data point
          through it, hover any neuron to see what it detects, and watch the
          decision boundary form.
        </p>

        <div className="mt-12 w-full">
          <HeroPreview />
        </div>

        <div className="mt-12 flex flex-col items-center gap-4 sm:flex-row">
          <Link
            href="/play"
            className="group inline-flex items-center gap-2 rounded-full bg-ink-900 px-7 py-3.5 text-base font-medium text-paper transition hover:bg-ink-700"
          >
            start exploring
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="transition group-hover:translate-x-0.5">
              <path d="M3 8h10m0 0L9 4m4 4l-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <a
            href="#what-is-this"
            className="text-sm text-ink-500 underline-offset-4 transition hover:text-ink-900 hover:underline"
          >
            what is mech interp?
          </a>
        </div>

        {/* feature cards — peek's REAL features */}
        <div className="mt-24 grid w-full grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-mint-200 bg-white/60 p-6 text-left backdrop-blur">
            <div className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-mint-200">
              <span className="font-mono text-xs text-ink-700">01</span>
            </div>
            <h3 className="text-base font-medium text-ink-900">watch it think</h3>
            <p className="mt-1 text-sm text-ink-500">
              pick any data point and trace it through the network. watch which
              neurons light up, layer by layer.
            </p>
          </div>
          <div className="rounded-2xl border border-lavender-200 bg-white/60 p-6 text-left backdrop-blur">
            <div className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-lavender-200">
              <span className="font-mono text-xs text-ink-700">02</span>
            </div>
            <h3 className="text-base font-medium text-ink-900">x-ray a neuron</h3>
            <p className="mt-1 text-sm text-ink-500">
              hover any neuron to see exactly what region of space it responds
              to. early ones make simple cuts, deep ones bend into shapes.
            </p>
          </div>
          <div className="rounded-2xl border border-pink-200 bg-white/60 p-6 text-left backdrop-blur">
            <div className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-pink-200">
              <span className="font-mono text-xs text-ink-700">03</span>
            </div>
            <h3 className="text-base font-medium text-ink-900">see the boundary</h3>
            <p className="mt-1 text-sm text-ink-500">
              a heatmap shows where the network draws the line, redrawing live
              as it trains. add input features and watch it shift.
            </p>
          </div>
        </div>
      </section>

      <footer className="relative z-10 px-8 pb-10 text-center text-xs text-ink-300 sm:px-12">
        built solo by{" "}
        <a
          href="https://github.com/nylaimanii"
          target="_blank"
          rel="noopener noreferrer"
          className="text-ink-500 underline-offset-4 hover:underline"
        >
          nyla
        </a>
      </footer>
    </main>
  );
}
