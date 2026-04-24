import type { TwinChatResponse, TwinReference } from "@/lib/twin/types"

type OpenAIResponse = {
  readonly output_text?: string
}

export async function callTwinModel({
  prompt,
  references,
}: {
  readonly prompt: string
  readonly references: ReadonlyArray<TwinReference>
}): Promise<TwinChatResponse | null> {
  const apiKey = process.env.OPENAI_API_KEY
  const model = process.env.OPENAI_MODEL

  if (!apiKey || !model) {
    return null
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
      temperature: 0.4,
    }),
  })

  if (!response.ok) {
    return null
  }

  const data = (await response.json()) as OpenAIResponse
  const answer = data.output_text?.trim()

  if (!answer) {
    return null
  }

  return {
    answer,
    mode: "model",
    references,
  }
}
