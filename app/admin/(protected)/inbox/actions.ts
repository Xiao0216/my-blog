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
