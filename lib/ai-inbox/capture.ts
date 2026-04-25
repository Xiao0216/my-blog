import { classifyAiInboxText } from "@/lib/ai-inbox/model"
import { normalizeAiInboxCandidate } from "@/lib/ai-inbox/normalize"
import { buildAiInboxPrompt } from "@/lib/ai-inbox/prompt"
import { getLifeUniverseTaxonomy } from "@/lib/content"
import { getAdminPlanets, saveAiInboxRecord } from "@/lib/cms/db"
import type { StoredRecord } from "@/lib/cms/schema"

function todayText(): string {
  return new Date().toISOString().slice(0, 10)
}

export async function captureAiInboxText(
  sourceText: string
): Promise<StoredRecord> {
  const trimmed = sourceText.trim()

  if (!trimmed) {
    throw new Error("请输入要保存的文本")
  }

  const planets = getAdminPlanets()
  const prompt = buildAiInboxPrompt({
    sourceText: trimmed,
    planets,
    taxonomy: getLifeUniverseTaxonomy(),
  })
  const candidate = await classifyAiInboxText(prompt)
  const normalized = normalizeAiInboxCandidate({
    candidate,
    planets,
    sourceText: trimmed,
    today: todayText(),
  })

  return saveAiInboxRecord(normalized)
}
