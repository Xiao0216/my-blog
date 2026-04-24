# Digital Twin Life Universe Design

## Goal

Build the public homepage and supporting data model into a personal "life universe" rather than a conventional blog index. The canvas represents the owner's life. Each planet is a configurable life dimension, such as work, life, diary, technology, health, relationships, or any future custom category. The right-side assistant is a digital twin prototype that answers as a memory-backed extension of the owner, with clear boundaries when it cannot speak for the person.

This design supersedes the earlier spatial canvas blog direction. The old direction mapped essays, projects, and notes directly onto a knowledge graph. The new direction keeps that spatial visual language, but changes the core metaphor and system model to life dimensions, memories, behavior records, and an identity-aware assistant.

## Scope

This phase delivers a vertical-slice MVP:

- Immersive dark life-universe homepage inspired by the provided design reference.
- Database-backed custom planets.
- Database-backed memories attached to planets.
- Admin management for planets, memories, and digital twin identity settings.
- Right-side digital twin chat panel on the homepage.
- Server-side memory retrieval before each chat response.
- Real model API support when configured.
- Local fallback response when model credentials are missing or model calls fail.

This phase does not include:

- WebGL shaders or a full infinite-canvas engine.
- Embedding or vector search.
- Automatic long-term learning from chat history.
- External imports from Notion, Obsidian, documents, or chat logs.
- Multi-user permissions.
- Replacing the existing essay, project, note, and admin foundations.

## Information Architecture

### Universe

The homepage is the universe entry point. It presents the owner's life as a navigable spatial canvas. The universe is not a marketing hero and not a card grid. It is a dark, glassy, star-map interface with pan, zoom, focus, and a persistent digital twin panel.

### Planet

A planet represents one configurable life dimension. Examples include life, work, diary, technology, health, and relationships, but the database must not hard-code these names.

Planet fields:

- `id`
- `slug`
- `name`
- `summary`
- `description`
- `x`
- `y`
- `size`
- `theme`
- `status`
- `sortOrder`
- `weight`
- `createdAt`
- `updatedAt`

The `theme` field stores restrained visual tokens such as accent color, glow color, or planet style. The `status` field controls whether the planet appears publicly.

### Memory

A memory is a concrete piece of life data attached to a planet. It can be a diary entry, behavior record, opinion, project moment, habit, preference, milestone, or public-facing biographical fact.

Memory fields:

- `id`
- `planetId`
- `title`
- `content`
- `type`
- `occurredAt`
- `visibility`
- `importance`
- `tags`
- `source`
- `createdAt`
- `updatedAt`

The `visibility` field protects private material from public display and model context. The first version only sends public or assistant-allowed memories to the model.

### Identity

The digital twin has explicit identity settings, separate from memories.

Identity fields:

- `displayName`
- `subtitle`
- `avatarDescription`
- `firstPersonStyle`
- `thirdPersonStyle`
- `values`
- `communicationRules`
- `privacyRules`
- `uncertaintyRules`
- `updatedAt`

The twin defaults to a first-person voice when answering general questions. It switches to a proxy voice for private, uncertain, commitment-heavy, or sensitive answers.

### Existing Content

Existing essays, projects, and notes remain available. They can be surfaced as memories or linked nodes inside planets, but this phase does not require migrating their storage model. Existing public pages and admin behavior must keep working.

## Frontend Experience

### Desktop Layout

The homepage uses a full-viewport layout:

- Left rail: compact navigation and universe tools.
- Center: life-universe canvas.
- Right rail: digital twin chat panel.
- Top controls: search, filters, and create/admin entry.
- Bottom controls: pan mode, search/focus, zoom level, reset, and graph controls.

The center canvas should visually follow the uploaded reference: dark cosmic field, faint star dust, subtle graph lines, glass panels, low-saturation glow, and a sense of depth. It should not read as a normal blog page.

### Planet Interaction

On desktop:

- Drag pans the canvas.
- Wheel or control buttons zoom within bounded limits.
- Clicking a planet focuses it.
- Focused planet details show nearby memories and linked content.
- Related planets can be connected by thin lines based on shared tags or manual links.

On mobile:

- Use a scroll-first constellation stream.
- Keep the same dark/glass visual language.
- Avoid precision pan/zoom as the only way to navigate.

### Planet Detail

The first version can show planet detail inside the canvas rather than forcing a separate route. The detail view should expose:

- Planet summary.
- Recent memories.
- Important memories.
- Linked essays, projects, or notes when available.
- A way to ask the digital twin about that planet.

## Digital Twin Chat

### Entry Point

The right-side panel is always visible on desktop and becomes a focused drawer or section on mobile. It introduces the twin as an AI representation of the owner, not as a generic support bot.

Example user questions:

- "最近在忙什么?"
- "你怎么看前端工程化?"
- "工作方式是什么样的?"
- "生活状态怎么样?"
- "这个项目为什么这样设计?"

### Request Flow

1. User sends a message.
2. Server validates the request.
3. Server retrieves relevant planets and memories.
4. Server builds a prompt from identity settings, response rules, and retrieved context.
5. If model configuration exists, call the real model API.
6. If credentials are missing, the call fails, or the request times out, return a local fallback answer.
7. Response includes a small list of referenced memories or planets.

### Retrieval

The first version uses SQLite keyword retrieval:

- Match against planet names and summaries.
- Match against memory titles, content, tags, and type.
- Boost public, recent, and important memories.
- Limit results to a small context set before calling the model.

This keeps implementation simple while preserving an upgrade path to embeddings or vector search.

### Voice And Boundaries

The twin can answer in first person when discussing public, well-supported context. It must use a proxy voice when:

- The answer requires private memory that is not allowed for model context.
- The answer is uncertain.
- The answer would make a promise or commitment for the owner.
- The answer involves sensitive personal judgments.

Proxy wording should be direct, for example: "我不能替本人做承诺，但从已有记录看..." or "这部分没有足够记忆支持，我只能按公开信息推断..."

### Local Fallback

When no real model is available, the API returns a short deterministic answer built from retrieved context. It should clearly mark that it is offline or fallback mode, and still show which memories or planets were referenced. This keeps the prototype usable without credentials.

## Admin Experience

The existing admin area gains three modules:

- Planets: create, edit, hide, sort, position, size, and theme planets.
- Memories: create, edit, tag, classify, and attach memories to planets.
- Twin Identity: edit display name, communication style, values, and boundary rules.

The admin UI should follow existing admin patterns and remain visually separate from the public immersive homepage.

## Data Flow

Homepage render:

1. Read public planets from SQLite.
2. Read selected public memories and existing public content summaries.
3. Render the life-universe canvas and initial twin panel state.

Planet focus:

1. User focuses a planet.
2. Client updates focus state.
3. Planet details show attached memories already loaded or fetched from an API route.

Chat:

1. Client posts message and optional focused planet id to `/api/twin/chat`.
2. API retrieves identity settings and relevant context.
3. API calls model or fallback responder.
4. Client appends response and reference list to the panel.

## Error Handling

- Empty universe: show an atmospheric empty state with admin entry.
- No relevant memories: answer with uncertainty and suggest what kind of memory is missing.
- Model unavailable: use fallback response and label it clearly.
- Invalid chat request: return a concise validation error.
- Hidden/private memory: never expose it publicly or include it in model context unless explicitly allowed.

## Testing Strategy

Add focused coverage for:

- Planet and memory database schema helpers.
- Admin validation for planets, memories, and identity settings.
- Homepage rendering from database-backed planets.
- Planet focus and mobile fallback rendering.
- Chat API retrieval behavior.
- Chat API model fallback behavior.
- Existing essays, projects, notes, RSS, sitemap, and admin tests remain passing.

## Acceptance Criteria

- Homepage visually follows the provided dark spatial design direction.
- Homepage represents life planets, not only essays/projects/notes.
- Planets are configurable through the database/admin path.
- Memories are configurable through the database/admin path and attach to planets.
- Right-side digital twin panel can answer questions.
- Chat retrieves only a limited set of relevant allowed memories.
- Real model integration is used when configured.
- Local fallback works without model credentials.
- Responses can include referenced planets or memories.
- Existing public content pages and admin foundations remain intact.
