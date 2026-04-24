import Link from "next/link"

export default function NotFound() {
  return (
    <main className="page-frame story-section">
      <section className="mx-auto max-w-2xl space-y-6 rounded-lg border border-zinc-200/70 bg-white p-8 text-center md:p-12 dark:border-zinc-800/70 dark:bg-zinc-950">
        <p className="story-label">404</p>
        <h1 className="text-3xl font-semibold leading-tight text-zinc-950 md:text-4xl dark:text-zinc-50">
          这一页暂时不在这里
        </h1>
        <p className="text-sm leading-7 text-zinc-500 dark:text-zinc-400">
          可能是链接已经更换，也可能这篇内容还在整理中。你可以先回到首页，继续慢慢读。
        </p>
        <Link
          href="/"
          className="inline-flex rounded-md border border-zinc-200/70 px-4 py-2 text-sm font-medium text-zinc-950 transition-colors hover:border-zinc-400 dark:border-zinc-800/70 dark:text-zinc-50 dark:hover:border-zinc-600"
        >
          返回首页
        </Link>
      </section>
    </main>
  )
}
