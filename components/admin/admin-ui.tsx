import Link from "next/link"
import type { ReactNode } from "react"

const navItems = [
  { href: "/admin", label: "控制台" },
  { href: "/admin/inbox", label: "收件箱" },
  { href: "/admin/profile", label: "资料" },
  { href: "/admin/planets", label: "星球" },
  { href: "/admin/memories", label: "记忆" },
  { href: "/admin/twin", label: "分身" },
  { href: "/admin/essays", label: "文章" },
  { href: "/admin/projects", label: "项目" },
  { href: "/admin/notes", label: "笔记" },
]

const contentStatusLabels: Record<string, string> = {
  draft: "草稿",
  published: "已发布",
}

const memoryVisibilityLabels: Record<string, string> = {
  assistant: "分身可用",
  private: "私密",
  public: "公开",
}

const memoryTypeLabels: Record<string, string> = {
  behavior: "行为",
  bio: "简介",
  diary: "日记",
  habit: "习惯",
  milestone: "里程碑",
  opinion: "观点",
  preference: "偏好",
  project: "项目",
}

const planetSizeLabels: Record<string, string> = {
  large: "大",
  medium: "中",
  small: "小",
}

const recordProjectionStatusLabels: Record<string, string> = {
  failed: "投射失败",
  pending_projection: "待投射",
  projected: "已投射",
}

const recordTargetTypeLabels: Record<string, string> = {
  essay: "文章",
  list: "清单",
  memory: "记忆",
  note: "笔记",
  photo: "照片",
  project: "项目",
}

export function formatContentStatus(value: string | null | undefined): string {
  return value ? contentStatusLabels[value] ?? value : ""
}

export function formatMemoryType(value: string | null | undefined): string {
  return value ? memoryTypeLabels[value] ?? value : ""
}

export function formatMemoryVisibility(value: string | null | undefined): string {
  return value ? memoryVisibilityLabels[value] ?? value : ""
}

export function formatPlanetSize(value: string | null | undefined): string {
  return value ? planetSizeLabels[value] ?? value : ""
}

export function formatRecordProjectionStatus(
  value: string | null | undefined
): string {
  return value ? recordProjectionStatusLabels[value] ?? value : ""
}

export function formatRecordTargetType(value: string | null | undefined): string {
  return value ? recordTargetTypeLabels[value] ?? value : ""
}

export function AdminShell({ children }: { readonly children: ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950 dark:bg-zinc-950 dark:text-zinc-50">
      <header className="border-b border-zinc-200/70 bg-white/85 backdrop-blur-md dark:border-zinc-800/70 dark:bg-zinc-950/85">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3">
          <Link href="/admin" className="font-mono text-sm font-semibold">
            博客后台
          </Link>
          <nav className="flex flex-wrap items-center gap-1 text-xs text-zinc-500">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-md px-2 py-1 hover:bg-zinc-100 hover:text-zinc-950 dark:hover:bg-zinc-900 dark:hover:text-zinc-50"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl px-5 py-8">{children}</main>
    </div>
  )
}

export function AdminPageHeader({
  title,
  description,
  action,
}: {
  readonly title: string
  readonly description: string
  readonly action?: ReactNode
}) {
  return (
    <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <p className="font-mono text-[0.68rem] font-medium tracking-[0.14em] text-zinc-500 uppercase">
          后台
        </p>
        <h1 className="mt-2 text-2xl font-semibold">{title}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">{description}</p>
      </div>
      {action}
    </div>
  )
}

export function AdminPanel({ children }: { readonly children: ReactNode }) {
  return (
    <section className="rounded-lg border border-zinc-200/70 bg-white dark:border-zinc-800/70 dark:bg-zinc-950">
      {children}
    </section>
  )
}

export function AdminField({
  label,
  name,
  defaultValue,
  textarea = false,
  required = false,
  readOnly = false,
}: {
  readonly label: string
  readonly name: string
  readonly defaultValue?: string | number
  readonly textarea?: boolean
  readonly required?: boolean
  readonly readOnly?: boolean
}) {
  const className =
    "w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-400 read-only:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:focus:ring-zinc-600 dark:read-only:bg-zinc-900"

  return (
    <label className="grid gap-1.5 text-sm">
      <span className="font-medium">{label}</span>
      {textarea ? (
        <textarea
          name={name}
          defaultValue={defaultValue}
          required={required}
          readOnly={readOnly}
          rows={6}
          className={className}
        />
      ) : (
        <input
          name={name}
          defaultValue={defaultValue}
          required={required}
          readOnly={readOnly}
          className={className}
        />
      )}
    </label>
  )
}

export function StatusSelect({ defaultValue }: { readonly defaultValue: string }) {
  return (
    <label className="grid gap-1.5 text-sm">
      <span className="font-medium">状态</span>
      <select
        name="status"
        defaultValue={defaultValue}
        className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:focus:ring-zinc-600"
      >
        <option value="published">已发布</option>
        <option value="draft">草稿</option>
      </select>
    </label>
  )
}

export function SubmitButton({
  children = "保存",
  disabled = false,
}: {
  readonly children?: ReactNode
  readonly disabled?: boolean
}) {
  return (
    <button
      type="submit"
      disabled={disabled}
      className="rounded-md bg-zinc-950 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
    >
      {children}
    </button>
  )
}

export function AdminError({ message }: { readonly message?: string }) {
  if (!message) {
    return null
  }

  return (
    <p className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
      {message}
    </p>
  )
}
