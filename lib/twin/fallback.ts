import type { RetrievedTwinContext, TwinChatResponse } from "@/lib/twin/types"

export function buildFallbackTwinResponse(
  message: string,
  context: RetrievedTwinContext
): TwinChatResponse {
  const lead = context.references[0]

  if (!lead) {
    return {
      answer:
        "离线模式：我暂时没有找到足够相关的公开记忆，所以不能替本人给出确定回答。可以先在后台补充对应星球或记忆。",
      mode: "fallback",
      references: [],
    }
  }

  return {
    answer: `离线模式：关于“${message}”，我找到的最相关记忆是「${lead.title}」。${lead.excerpt} 这不是完整模型回答，只是基于已检索记忆的简短摘要。`,
    mode: "fallback",
    references: context.references,
  }
}
