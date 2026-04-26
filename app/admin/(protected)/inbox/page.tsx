import Link from "next/link"

import { AiInboxForm } from "@/components/admin/ai-inbox-form"
import {
  AdminPageHeader,
  AdminPanel,
  formatRecordProjectionStatus,
  formatRecordTargetType,
} from "@/components/admin/admin-ui"
import { requireAdminSession } from "@/lib/admin-guard"
import { getRecentRecords } from "@/lib/cms/db"

export const metadata = {
  title: "后台智能收件箱",
}

const editHrefByTable = {
  essays: "/admin/essays",
  memories: "/admin/memories",
  notes: "/admin/notes",
  projects: "/admin/projects",
} as const

export default async function AdminInboxPage() {
  await requireAdminSession("/admin/inbox")

  const records = getRecentRecords()

  return (
    <>
      <AdminPageHeader
        title="智能收件箱"
        description="粘贴原始文本，让智能模型分类并落库到记录与对应内容表。"
      />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <AdminPanel>
          <div className="border-b border-zinc-200/70 px-4 py-3 dark:border-zinc-800/70">
            <h2 className="text-sm font-medium">提交内容</h2>
          </div>
          <div className="p-4">
            <AiInboxForm />
          </div>
        </AdminPanel>

        <AdminPanel>
          <div className="border-b border-zinc-200/70 px-4 py-3 dark:border-zinc-800/70">
            <h2 className="text-sm font-medium">最近记录</h2>
          </div>
          <div className="divide-y divide-zinc-200/70 dark:divide-zinc-800/70">
            {records.length > 0 ? (
              records.map((record) => {
                const editHref =
                  record.projectionTable &&
                  record.projectionTable in editHrefByTable
                    ? editHrefByTable[
                        record.projectionTable as keyof typeof editHrefByTable
                      ]
                    : null

                return (
                  <article key={record.id} className="grid gap-3 px-4 py-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="space-y-1">
                        <h3 className="text-sm font-medium">{record.title}</h3>
                        <p className="text-xs text-zinc-500">
                          {formatRecordTargetType(record.targetType)} ·{" "}
                          {formatRecordProjectionStatus(record.projectionStatus)} ·{" "}
                          {record.createdAt}
                        </p>
                      </div>
                      {editHref ? (
                        <Link
                          href={editHref}
                          className="text-xs font-medium text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50"
                        >
                          编辑
                        </Link>
                      ) : null}
                    </div>
                    <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-300">
                      {record.summary}
                    </p>
                    <div className="flex flex-wrap gap-2 text-xs text-zinc-500">
                      {record.planetName ? <span>{record.planetName}</span> : null}
                      <span>置信度 {record.confidence}</span>
                      {record.tags.map((tag) => (
                        <span
                          key={`${record.id}-${tag}`}
                          className="rounded-md bg-zinc-100 px-2 py-1 dark:bg-zinc-900"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </article>
                )
              })
            ) : (
              <p className="px-4 py-6 text-sm text-zinc-500">还没有智能收件箱记录。</p>
            )}
          </div>
        </AdminPanel>
      </div>
    </>
  )
}
