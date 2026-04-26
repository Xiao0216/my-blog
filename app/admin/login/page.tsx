import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import {
  ADMIN_SESSION_COOKIE,
  adminCookieOptions,
  createAdminSessionCookieValue,
  getSafeAdminNextPath,
  verifyAdminPassword,
} from "@/lib/admin-auth"

export const metadata = {
  title: "后台登录",
}

export default function AdminLoginPage({
  searchParams,
}: {
  readonly searchParams?: Promise<{
    error?: string | string[]
    next?: string | string[]
  }>
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-5 text-zinc-950 dark:bg-zinc-950 dark:text-zinc-50">
      <section className="w-full max-w-sm rounded-lg border border-zinc-200/70 bg-white p-5 dark:border-zinc-800/70 dark:bg-zinc-950">
        <p className="font-mono text-[0.68rem] font-medium tracking-[0.14em] text-zinc-500 uppercase">
          后台
        </p>
        <h1 className="mt-2 text-xl font-semibold">登录后台</h1>
        <LoginError searchParams={searchParams} />
        <form action={loginAction} className="mt-5 space-y-4">
          <LoginNextInput searchParams={searchParams} />
          <label className="grid gap-1.5 text-sm">
            <span className="font-medium">管理员密码</span>
            <input
              name="password"
              type="password"
              required
              className="rounded-md border border-zinc-200 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:focus:ring-zinc-600"
            />
          </label>
          <button className="w-full rounded-md bg-zinc-950 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200">
            登录
          </button>
        </form>
      </section>
    </main>
  )
}

async function LoginError({
  searchParams,
}: {
  readonly searchParams?: Promise<{
    error?: string | string[]
    next?: string | string[]
  }>
}) {
  const params = await searchParams

  if (!params?.error) {
    return null
  }

  return <p className="mt-4 text-sm text-red-600">密码错误或后台未配置密码。</p>
}

async function LoginNextInput({
  searchParams,
}: {
  readonly searchParams?: Promise<{ next?: string | string[] }>
}) {
  const params = await searchParams
  const nextPath = getSafeAdminNextPath(params?.next)

  return <input type="hidden" name="next" value={nextPath} />
}

async function loginAction(formData: FormData) {
  "use server"

  const password = String(formData.get("password") ?? "")
  const nextPath = getSafeAdminNextPath(formData.get("next"))

  if (!verifyAdminPassword(password)) {
    redirect(`/admin/login?error=1&next=${encodeURIComponent(nextPath)}`)
  }

  const cookieStore = await cookies()
  cookieStore.set(
    ADMIN_SESSION_COOKIE,
    createAdminSessionCookieValue(),
    adminCookieOptions()
  )
  redirect(nextPath)
}
