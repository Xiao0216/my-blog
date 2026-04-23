import Link from "next/link"

export default function NotFound() {
  return (
    <main className="page-frame story-section">
      <section className="paper-card mx-auto max-w-2xl space-y-6 p-8 text-center md:p-12">
        <p className="story-label">404</p>
        <h1 className="font-heading text-4xl leading-none text-foreground md:text-5xl">
          这一页暂时不在这里
        </h1>
        <p className="text-base leading-8 text-muted-foreground md:text-lg">
          可能是链接已经更换，也可能这篇内容还在整理中。你可以先回到首页，继续慢慢读。
        </p>
        <Link
          href="/"
          className="inline-flex rounded-full border border-border px-5 py-3 text-sm transition-colors hover:border-foreground hover:text-foreground"
        >
          返回首页
        </Link>
      </section>
    </main>
  )
}
