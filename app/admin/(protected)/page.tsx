import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import {
  AdminPageHeader,
  AdminPanel,
  formatContentStatus,
  formatMemoryVisibility,
} from "@/components/admin/admin-ui"
import { ADMIN_SESSION_COOKIE, adminCookieOptions } from "@/lib/admin-auth"
import { requireAdminSession } from "@/lib/admin-guard"
import {
  getAdminContentSummary,
  getAdminEssays,
  getAdminMemories,
  getAdminNotes,
  getAdminPlanets,
  getAdminProjects,
  getTwinIdentity,
} from "@/lib/cms/db"

export const metadata = {
  title: "后台控制台",
}

export default async function AdminDashboardPage() {
  await requireAdminSession("/admin")

  const summary = getAdminContentSummary()
  const twinIdentity = getTwinIdentity()
  const latest = [
    ...getAdminPlanets().slice(0, 3).map((item) => ({
      type: "星球",
      title: item.name,
      status: item.status,
    })),
    ...getAdminMemories().slice(0, 3).map((item) => ({
      type: "记忆",
      title: item.title,
      status: item.visibility,
    })),
    ...getAdminEssays().slice(0, 3).map((item) => ({
      type: "文章",
      title: item.title,
      status: item.status,
    })),
    ...getAdminProjects().slice(0, 3).map((item) => ({
      type: "项目",
      title: item.title,
      status: item.status,
    })),
    ...getAdminNotes().slice(0, 3).map((item) => ({
      type: "笔记",
      title: item.title,
      status: item.status,
    })),
  ].slice(0, 6)

  return (
    <>
      <AdminPageHeader
        title="内容控制台"
        description="管理公开资料、文章、项目和短笔记。保存后前台运行时读取 SQLite，无需重新构建。"
        action={
          <form action={logoutAction}>
            <button className="rounded-md border border-zinc-200 px-3 py-2 text-sm hover:bg-zinc-100 dark:border-zinc-800 dark:hover:bg-zinc-900">
              退出登录
            </button>
          </form>
        }
      />
      <div className="grid gap-4 md:grid-cols-5">
        <Metric label="星球" published={summary.publishedPlanets} draft={summary.draftPlanets} />
        <MemoryMetric
          label="记忆"
          publicCount={summary.publicMemories}
          assistantCount={summary.assistantMemories}
          privateCount={summary.privateMemories}
        />
        <Metric label="文章" published={summary.publishedEssays} draft={summary.draftEssays} />
        <Metric
          label="项目"
          published={summary.publishedProjects}
          draft={summary.draftProjects}
        />
        <Metric label="笔记" published={summary.publishedNotes} draft={summary.draftNotes} />
      </div>
      <AdminPanel>
        <div className="mt-6 p-4">
          <p className="text-sm text-zinc-500">数字分身</p>
          <p className="mt-2 text-lg font-semibold">{twinIdentity.displayName}</p>
          <p className="mt-1 text-sm text-zinc-500">{twinIdentity.subtitle}</p>
        </div>
      </AdminPanel>
      <AdminPanel>
        <div className="mt-6 divide-y divide-zinc-200/70 dark:divide-zinc-800/70">
          {latest.map((item) => (
            <div key={`${item.type}-${item.title}`} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-sm font-medium">{item.title}</p>
                <p className="text-xs text-zinc-500">{item.type}</p>
              </div>
              <span className="rounded-md bg-zinc-100 px-2 py-1 text-xs text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400">
                {item.type === "记忆"
                  ? formatMemoryVisibility(item.status)
                  : formatContentStatus(item.status)}
              </span>
            </div>
          ))}
        </div>
      </AdminPanel>
    </>
  )
}

function MemoryMetric({
  label,
  publicCount,
  assistantCount,
  privateCount,
}: {
  readonly label: string
  readonly publicCount: number
  readonly assistantCount: number
  readonly privateCount: number
}) {
  return (
    <AdminPanel>
      <div className="p-4">
        <p className="text-sm text-zinc-500">{label}</p>
        <p className="mt-2 text-2xl font-semibold">
          {publicCount + assistantCount + privateCount}
        </p>
        <p className="mt-1 text-xs text-zinc-500">
          {publicCount} 公开 / {assistantCount} 分身可用 / {privateCount} 私密
        </p>
      </div>
    </AdminPanel>
  )
}

function Metric({
  label,
  published,
  draft,
}: {
  readonly label: string
  readonly published: number
  readonly draft: number
}) {
  return (
    <AdminPanel>
      <div className="p-4">
        <p className="text-sm text-zinc-500">{label}</p>
        <p className="mt-2 text-2xl font-semibold">{published}</p>
        <p className="mt-1 text-xs text-zinc-500">{draft} 个草稿</p>
      </div>
    </AdminPanel>
  )
}

async function logoutAction() {
  "use server"

  const cookieStore = await cookies()
  cookieStore.set(ADMIN_SESSION_COOKIE, "", { ...adminCookieOptions(), maxAge: 0 })
  redirect("/admin/login")
}
