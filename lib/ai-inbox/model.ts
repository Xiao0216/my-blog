import type { AiInboxRawCandidate } from "@/lib/ai-inbox/types"

type OpenAIResponse = {
  readonly output?: unknown
  readonly output_text?: unknown
}

export async function classifyAiInboxText(
  prompt: string
): Promise<AiInboxRawCandidate> {
  const apiKey = process.env.OPENAI_API_KEY?.trim()
  const model = process.env.OPENAI_MODEL?.trim()

  if (!apiKey || !model) {
    throw new Error("AI inbox model is not configured")
  }

  let response: Response

  try {
    response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        input: prompt,
        temperature: 0.2,
      }),
    })
  } catch {
    throw new Error("AI inbox model request failed")
  }

  if (!response.ok) {
    throw new Error("AI inbox model request failed")
  }

  let data: OpenAIResponse

  try {
    data = (await response.json()) as OpenAIResponse
  } catch {
    throw new Error("AI inbox model response could not be parsed")
  }

  const output = extractOutputText(data).trim()

  if (!output) {
    throw new Error("AI inbox model returned an empty response")
  }

  try {
    return JSON.parse(output) as AiInboxRawCandidate
  } catch {
    throw new Error("AI inbox model returned invalid JSON")
  }
}

function extractOutputText(data: OpenAIResponse): string {
  const outputTexts: string[] = []

  if (Array.isArray(data.output)) {
    for (const outputItem of data.output) {
      if (!isRecord(outputItem) || outputItem.type !== "message") {
        continue
      }

      const content = outputItem.content
      if (!Array.isArray(content)) {
        continue
      }

      for (const contentItem of content) {
        if (
          isRecord(contentItem) &&
          contentItem.type === "output_text" &&
          typeof contentItem.text === "string"
        ) {
          outputTexts.push(contentItem.text)
        }
      }
    }
  }

  if (outputTexts.length > 0) {
    return outputTexts.join("")
  }

  if (typeof data.output_text === "string") {
    return data.output_text
  }

  return ""
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}
