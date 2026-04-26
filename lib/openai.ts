const DEFAULT_OPENAI_BASE_URL = "https://api.openai.com/v1"

export function getOpenAIResponsesUrl(): string {
  const baseUrl =
    process.env.OPENAI_BASE_URL?.trim() ||
    process.env.OPENAI_API_BASE_URL?.trim() ||
    DEFAULT_OPENAI_BASE_URL

  return `${baseUrl.replace(/\/+$/, "")}/responses`
}
