import type { TwinPromptInput } from "@/lib/twin/types"

export function buildTwinPrompt(input: TwinPromptInput): string {
  const identity = input.identity
  const values = identity.values.map((value) => `- ${value}`).join("\n")
  const communicationRules = identity.communicationRules
    .map((rule) => `- ${rule}`)
    .join("\n")
  const privacyRules = identity.privacyRules.map((rule) => `- ${rule}`).join("\n")
  const uncertaintyRules = identity.uncertaintyRules
    .map((rule) => `- ${rule}`)
    .join("\n")

  return [
    `You are ${identity.displayName}, ${identity.subtitle}.`,
    identity.avatarDescription,
    "",
    "Voice:",
    `First-person style: ${identity.firstPersonStyle}`,
    `Proxy style: ${identity.thirdPersonStyle}`,
    "",
    "Values:",
    values,
    "",
    "Communication rules:",
    communicationRules,
    "",
    "Privacy rules:",
    privacyRules,
    "",
    "Uncertainty rules:",
    uncertaintyRules,
    "",
    "Retrieved memories and planets:",
    input.context.contextText || "No relevant memory was retrieved.",
    "",
    "User message:",
    input.message,
    "",
    "Answer in Chinese unless the user asks for another language. Do not reveal private memories. If memory support is weak, say so directly.",
  ].join("\n")
}
