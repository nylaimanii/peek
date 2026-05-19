export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-paper text-ink-900">
      {/* soft pastel blobs in the background — decorative */}
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

      {/* nav */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-6 sm:px-12">
        <span className="font-mono text-sm tracking-wider text-ink-500">
          peek
        </span>
        <div className="flex items-center gap-6 text-sm text-ink-500">
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

      {/* hero */}
      <section className="relative z-10 mx-auto flex max-w-5xl flex-col items-center px-6 pt-24 pb-32 text-center sm:pt-32">
        <span className="mb-8 inline-flex items-center gap-2 rounded-full border border-lavender-200 bg-white/60 px-4 py-1.5 text-xs font-medium text-ink-700 backdrop-blur">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-mint-300" />
          an interactive intro to mechanistic interpretability
        </span>

        <h1 className="text-7xl font-semibold tracking-tight text-ink-900 sm:text-8xl md:text-9xl">
          peek
        </h1>

        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-500 sm:text-xl">
          train a tiny neural network in your browser, then peek inside it
          with the same techniques used at the frontier of AI research.
          <br className="hidden sm:block" />
          no setup, no PhD required.
        </p>

        <div className="mt-12 flex flex-col items-center gap-4 sm:flex-row">
          <button
            type="button"
            className="group inline-flex items-center gap-2 rounded-full bg-ink-900 px-7 py-3.5 text-base font-medium text-paper transition hover:bg-ink-700"
          >
            start exploring
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              className="transition group-hover:translate-x-0.5"
            >
              <path
                d="M3 8h10m0 0L9 4m4 4l-4 4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <a
            href="#what-is-this"
            className="text-sm text-ink-500 underline-offset-4 transition hover:text-ink-900 hover:underline"
          >
            what is mech interp?
          </a>
        </div>

        {/* three-view preview chips */}
        <div className="mt-24 grid w-full grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-mint-200 bg-white/60 p-6 text-left backdrop-blur">
            <div className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-mint-200">
              <span className="font-mono text-xs text-ink-700">01</span>
            </div>
            <h3 className="text-base font-medium text-ink-900">flow</h3>
            <p className="mt-1 text-sm text-ink-500">
              trace any data point through the network and watch neurons
              light up.
            </p>
          </div>
          <div className="rounded-2xl border border-lavender-200 bg-white/60 p-6 text-left backdrop-blur">
            <div className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-lavender-200">
              <span className="font-mono text-xs text-ink-700">02</span>
            </div>
            <h3 className="text-base font-medium text-ink-900">circuit</h3>
            <p className="mt-1 text-sm text-ink-500">
              see which connections matter. ablate neurons and watch the
              network break.
            </p>
          </div>
          <div className="rounded-2xl border border-pink-200 bg-white/60 p-6 text-left backdrop-blur">
            <div className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-pink-200">
              <span className="font-mono text-xs text-ink-700">03</span>
            </div>
            <h3 className="text-base font-medium text-ink-900">features</h3>
            <p className="mt-1 text-sm text-ink-500">
              untangle polysemantic neurons with a sparse autoencoder.
            </p>
          </div>
        </div>
      </section>

      {/* footer */}
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
