"use client"

import Link from "next/link"
import { useActionState } from "react"

import {
  type InboxActionState,
  submitAiInboxAction,
} from "@/app/admin/(protected)/inbox/actions"
import {
  AdminError,
  SubmitButton,
  formatRecordProjectionStatus,
  formatRecordTargetType,
} from "@/components/admin/admin-ui"

const initialState: InboxActionState = {
  sourceText: "",
}

const editHrefByTable = {
  essays: "/admin/essays",
  memories: "/admin/memories",
  notes: "/admin/notes",
  projects: "/admin/projects",
} as const

export function AiInboxForm() {
  const [state, formAction, pending] = useActionState(
    submitAiInboxAction,
    initialState
  )
  const editHref =
    state.record?.projectionTable &&
    state.record.projectionTable in editHrefByTable
      ? editHrefByTable[
          state.record.projectionTable as keyof typeof editHrefByTable
        ]
      : null

  return (
    <form action={formAction} className="grid gap-4">
      <label className="grid gap-1.5 text-sm">
        <span className="font-medium">原始文本</span>
        <textarea
          key={state.record?.id ?? state.error ?? "sourceText"}
          name="sourceText"
          defaultValue={state.sourceText}
          rows={10}
          required
          className="w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:focus:ring-zinc-600"
        />
      </label>

      <AdminError message={state.error} />

      {state.record ? (
        <div className="grid gap-2 rounded-md border border-zinc-200 bg-zinc-50 px-3 py-3 text-sm dark:border-zinc-800 dark:bg-zinc-900/60">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-medium">{state.record.title}</p>
            {editHref ? (
              <Link
                href={editHref}
                className="text-xs font-medium text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50"
              >
                查看内容
              </Link>
            ) : null}
          </div>
          <p className="text-xs text-zinc-500">
            {formatRecordTargetType(state.record.targetType)} ·{" "}
            {formatRecordProjectionStatus(state.record.projectionStatus)} · 置信度{" "}
            {state.record.confidence}
          </p>
          <p className="text-sm text-zinc-600 dark:text-zinc-300">
            {state.record.summary}
          </p>
        </div>
      ) : null}

      <div>
        <SubmitButton disabled={pending}>
          {pending ? "分析保存中..." : "智能保存"}
        </SubmitButton>
      </div>
    </form>
  )
}
