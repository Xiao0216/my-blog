import type { AiInboxRawCandidate } from "@/lib/ai-inbox/types"

type OpenAIResponse = {
  readonly output_text?: string
}

export async function classifyAiInboxText(
  prompt: string
): Promise<AiInboxRawCandidate> {
  const apiKey = process.env.OPENAI_API_KEY
  const model = process.env.OPENAI_MODEL

  if (!apiKey || !model) {
    throw new Error("AI inbox model is not configured")
  }

  const response = await fetch("https://api.openai.com/v1/responses", {
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

  if (!response.ok) {
    throw new Error("AI inbox model request failed")
  }

  const data = (await response.json()) as OpenAIResponse
  const output = data.output_text?.trim()

  if (!output) {
    throw new Error("AI inbox model returned an empty response")
  }

  try {
    return JSON.parse(output) as AiInboxRawCandidate
  } catch {
    throw new Error("AI inbox model returned invalid JSON")
  }
}
