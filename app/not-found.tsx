import Link from "next/link"

export default function NotFound() {
  return (
    <main className="null-page-shell relative isolate min-h-screen overflow-hidden text-[var(--ns-text-primary)]">
      <div className="null-page-grid absolute inset-0" aria-hidden="true" />
      <div className="null-page-noise absolute inset-0" aria-hidden="true" />
      <div className="null-page-vignette absolute inset-0" aria-hidden="true" />
      <section className="page-frame story-section relative z-10 grid min-h-screen place-items-center">
        <div className="null-space-panel mx-auto max-w-2xl space-y-6 p-8 text-center md:p-12">
          <p className="story-label text-[var(--ns-accent-primary)]">404</p>
          <h1 className="text-3xl font-semibold leading-tight text-[var(--ns-text-primary)] md:text-4xl">
            这一页暂时不在这里
          </h1>
          <p className="text-sm leading-7 text-[var(--ns-text-tertiary)]">
            可能是链接已经更换，也可能这篇内容还在整理中。你可以先回到首页，继续慢慢读。
          </p>
          <Link
            href="/"
            className="inline-flex rounded-full border border-[var(--ns-glass-border)] bg-[var(--ns-control-bg)] px-4 py-2 text-sm font-medium text-[var(--ns-text-primary)] transition-colors hover:border-[var(--ns-accent-primary)]"
          >
            返回首页
          </Link>
        </div>
      </section>
    </main>
  )
}
