import { SiteHeader } from "@/components/SiteHeader";

export default function PlayPage() {
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

      <section className="relative z-10 mx-auto max-w-6xl px-6 pt-12 pb-32">
        <div className="mb-12">
          <span className="font-mono text-xs uppercase tracking-wider text-ink-500">
            playground
          </span>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight text-ink-900 sm:text-5xl">
            train a network
          </h1>
          <p className="mt-3 max-w-xl text-base text-ink-500">
            pick a dataset, choose how the network is wired up, then watch
            it learn. coming next step — for now this is a placeholder.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-[260px_1fr_280px]">
          {/* left: dataset + config — placeholder */}
          <aside className="rounded-2xl border border-ink-300/20 bg-white/60 p-5 backdrop-blur">
            <h2 className="font-mono text-xs uppercase tracking-wider text-ink-500">
              data
            </h2>
            <div className="mt-3 text-sm text-ink-500">
              dataset picker + network config will live here.
            </div>
          </aside>

          {/* center: network graph — placeholder */}
          <div className="flex min-h-[480px] items-center justify-center rounded-2xl border border-ink-300/20 bg-white/60 backdrop-blur">
            <div className="text-center">
              <div className="font-mono text-xs uppercase tracking-wider text-ink-300">
                network
              </div>
              <div className="mt-2 text-sm text-ink-500">
                react flow canvas goes here in step 8
              </div>
            </div>
          </div>

          {/* right: output / loss curve — placeholder */}
          <aside className="rounded-2xl border border-ink-300/20 bg-white/60 p-5 backdrop-blur">
            <h2 className="font-mono text-xs uppercase tracking-wider text-ink-500">
              output
            </h2>
            <div className="mt-3 text-sm text-ink-500">
              decision boundary + loss curve will live here.
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
