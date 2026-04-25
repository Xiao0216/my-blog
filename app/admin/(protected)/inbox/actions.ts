"use server"

import { revalidatePath } from "next/cache"

import { captureAiInboxText } from "@/lib/ai-inbox/capture"
import { requireAdminSession } from "@/lib/admin-guard"
import type { StoredRecord } from "@/lib/cms/schema"

export type InboxActionState = {
  readonly error?: string
  readonly sourceText: string
  readonly record?: StoredRecord
}

const projectedAdminPathByTable = {
  essays: "/admin/essays",
  memories: "/admin/memories",
  notes: "/admin/notes",
  projects: "/admin/projects",
} as const

export async function submitAiInboxAction(
  _state: InboxActionState,
  formData: FormData
): Promise<InboxActionState> {
  await requireAdminSession("/admin/inbox")
  const sourceText = String(formData.get("sourceText") ?? "")

  try {
    const record = await captureAiInboxText(sourceText)
    revalidatePath("/")
    revalidatePath("/admin")
    revalidatePath("/admin/inbox")
    const projectedAdminPath =
      record.projectionTable &&
      record.projectionTable in projectedAdminPathByTable
        ? projectedAdminPathByTable[
            record.projectionTable as keyof typeof projectedAdminPathByTable
          ]
        : null

    if (projectedAdminPath) {
      revalidatePath(projectedAdminPath)
    }

    return {
      sourceText: "",
      record,
    }
  } catch (error) {
    return {
      sourceText,
      error: error instanceof Error ? error.message : "AI 保存失败",
    }
  }
}
