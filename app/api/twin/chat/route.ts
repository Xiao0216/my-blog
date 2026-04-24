import { NextResponse } from "next/server"

import { getAssistantMemories, getPublicPlanets, getTwinIdentity } from "@/lib/cms/db"
import { buildFallbackTwinResponse } from "@/lib/twin/fallback"
import { callTwinModel } from "@/lib/twin/model"
import { buildTwinPrompt } from "@/lib/twin/prompt"
import { retrieveTwinContext } from "@/lib/twin/retrieval"
import type { TwinChatRequest } from "@/lib/twin/types"

export async function POST(request: Request) {
  let body: TwinChatRequest

  try {
    body = (await request.json()) as TwinChatRequest
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const message = typeof body.message === "string" ? body.message.trim() : ""

  if (!message) {
    return NextResponse.json({ error: "Message is required" }, { status: 400 })
  }

  const planets = getPublicPlanets()
  const memories = getAssistantMemories()
  const identity = getTwinIdentity()
  const context = retrieveTwinContext({
    message,
    focusedPlanetId: body.focusedPlanetId,
    planets,
    memories,
    limit: 5,
  })
  const prompt = buildTwinPrompt({ message, identity, context })
  const modelResponse = await callTwinModel({
    prompt,
    references: context.references,
  })

  return NextResponse.json(
    modelResponse ?? buildFallbackTwinResponse(message, context)
  )
}
