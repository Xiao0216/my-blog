# Life Universe Taxonomy Design

## Goal

Define the information architecture for the Null Space life universe without changing the current homepage UI. The homepage remains an immersive universe: each visible planet represents a stable dimension of the owner's life, and deeper pages or overlays organize the smaller topics, memories, writing, diary entries, projects, photos, and fragments that belong to each dimension.

The design turns the original "each planet represents one side of me" idea into a durable taxonomy that can grow without making the homepage crowded or forcing every record into a rigid folder.

## Scope

This design covers:

- The top-level life dimensions shown by the homepage universe.
- The relationship between galaxies, planets, content types, and tags.
- Rules for unclassified or private material.
- Page responsibilities for browsing and future implementation.
- Button intent mapping for the existing homepage controls.

This design does not cover:

- Redesigning the homepage visual UI.
- Replacing the current canvas, card, or AI chat interactions.
- A final database migration plan.
- Admin editing workflows beyond the taxonomy needs.
- Access control implementation details for private records.

## Core Model

The taxonomy has three stable layers.

### Galaxy

A galaxy is a top-level life domain. It answers: "Which part of my life is this about?"

The homepage should prioritize these top-level galaxies so the universe stays readable. A galaxy can be rendered as a large homepage planet or as the primary category behind one of the existing homepage cards.

### Planet

A planet is a more specific topic inside a galaxy. It answers: "What specific aspect of that life domain does this record belong to?"

Planets can grow over time. A topic should become a formal planet only after it has enough repeated material to justify a stable place in the universe.

### Content

Content is the actual record. It answers: "What kind of record is this?"

Content types are independent from galaxies and planets. An entry can be a diary entry about travel, a formal article about work, a project record about front-end engineering, or a private memory about family.

Example:

```txt
Galaxy: 生活与体验
Planet: 旅游
Type: 日记
Tags: 杭州, 周末, 2026
```

## Top-Level Galaxies

The initial universe uses seven top-level galaxies.

### 工作与职业

Purpose: records the owner's professional history, work patterns, project experience, collaboration, career changes, and job preparation.

Suggested planets:

- 过往工作
- 医疗项目
- 前端交付
- 数据平台
- 协作复盘
- 职业成长
- 求职准备

### 技术与学习

Purpose: records technical learning, experiments, engineering notes, and learning systems.

Suggested planets:

- Vue
- JavaScript
- 工程化
- 性能优化
- ECharts
- WebSocket
- AI 工具
- 读书学习
- 实验记录

### 写作与表达

Purpose: records public writing, drafts, opinions, fragments, excerpts, and ideas that may become articles.

Suggested planets:

- 正式文章
- 随笔
- 观点
- 摘录
- 灵感
- 草稿
- 发布复盘

### 日记与自我

Purpose: records daily self-observation, mood, habits, health, personal goals, and stage reviews.

Suggested planets:

- 每日记录
- 情绪
- 健康
- 习惯
- 阶段复盘
- 个人目标
- 自我观察

### 关系与情感

Purpose: records important relationships, emotion, family, friendship, love, conversations, gratitude, regret, and personal boundaries.

Suggested planets:

- 感情
- 朋友
- 家庭
- 重要对话
- 感谢
- 遗憾
- 边界感

### 生活与体验

Purpose: records concrete life experiences, places, food, travel, home, consumption, lifestyle, and ordinary weekends.

Suggested planets:

- 旅游
- 城市
- 饮食
- 租房
- 消费
- 生活方式
- 周末记录

### 兴趣与娱乐

Purpose: records hobbies, leisure, games, films, music, sports, collections, and small experiments that are not primarily work or study.

Suggested planets:

- 游戏
- 影视
- 音乐
- 运动
- 收藏
- 折腾的小东西
- 短期兴趣

## Content Types

Content type describes the record format, not the life domain.

Initial content types:

- 文章: polished public writing.
- 日记: time-based personal record.
- 项目: work, product, or personal build record.
- 记忆: discrete life fact, experience, preference, or milestone.
- 照片: visual memory or travel/life media.
- 碎片: short note, idea, quote, or unfinished observation.
- 清单: list of plans, recommendations, tasks, books, games, films, or goals.

Content can also carry tags. Tags are lightweight descriptors such as year, city, technology, person, mood, or event.

## Unclassified Material

Not every record should be forced into a permanent planet immediately. The system keeps four special areas.

### 星尘

Temporary fragments that do not yet have a clear home. 星尘 is the default for quick capture, unfinished thoughts, or one-off notes.

### 流星

Short-term interests that may disappear. A flow of game notes, a temporary hobby, or a passing obsession can live here before becoming a formal planet.

### 未命名星球

Repeated material that appears at least three times but has not received a final name. This is a staging area for emerging topics.

### 黑匣子

Private or sensitive material. 黑匣子 is not public by default and should only be used by the owner or by AI features with explicit permission boundaries.

## Classification Rules

Use these rules when adding new records:

1. Pick a galaxy by life domain.
2. Pick a planet only when the topic is clear.
3. Pick a content type by record format.
4. Add tags for time, place, people, technology, mood, or event.
5. Use 星尘 when the record is too early to classify.
6. Upgrade a repeated 星尘 or 流星 topic into a formal planet after it appears at least three times.
7. Use 黑匣子 for private records even when a public galaxy or planet also exists.

## Homepage Meaning

The existing homepage UI should not be visually changed for this taxonomy phase.

The homepage universe represents the top-level view of the owner. It should emphasize the seven galaxies rather than exposing every small topic at once. This keeps the first screen calm and preserves the "life universe" metaphor.

Existing interactions keep their current conceptual meaning:

- Focus a card: choose a galaxy or planet as the current context.
- Enter: open the detail view for that galaxy, planet, or content node.
- Ask AI: ask the digital twin using the focused context.
- Related: show nearby galaxies, planets, content, or tags.
- Zoom and pan: navigate the universe canvas.
- Reset: return to the default overview.

## Page Responsibilities

### Homepage

Shows the life universe overview. The primary nodes are the seven galaxies, with a small number of featured planets or recent content nodes when needed.

### Galaxy Detail

Shows one top-level life domain. It should include:

- Galaxy summary.
- Child planets.
- Recent content across all child planets.
- Important memories.
- Related galaxies.
- AI entry point for that galaxy.

### Planet Detail

Shows one specific aspect inside a galaxy. It should include:

- Planet summary.
- Timeline or grouped content.
- Content type filters.
- Important memories.
- Related tags, planets, and galaxies.
- AI entry point for that planet.

### Search And Filter

Search should work across galaxies, planets, content types, tags, and full text.

Filter controls should support:

- Galaxy.
- Planet.
- Content type.
- Tag.
- Visibility.
- Date range.

### AI Digital Twin

The AI twin should use the current focused galaxy, planet, or content node as context. It should be able to answer questions such as:

- "总结我在这个星球里的主要经历。"
- "这里最近有什么变化?"
- "这个领域和我的工作有什么关系?"
- "哪些内容还没有归类?"

The twin must respect private material boundaries, especially 黑匣子 records.

## Button Intent Mapping

This section defines intent only. It does not require immediate UI changes.

- 搜索空间: open search or command panel across the whole universe.
- 筛选空间: filter visible nodes by galaxy, type, tag, date, or visibility.
- New: show latest additions for public visitors; when an authenticated owner workflow exists, it can also expose a create shortcut.
- 关闭空间: reserved for a future conventional site view; until that view exists, it should not trigger navigation or destructive state changes.
- 首页: return to universe overview.
- 轨道: show galaxy or planet orbit structure.
- 记录: show diary, memories, and fragments.
- 作品: show projects and polished outputs.
- 偏好: show preferences, habits, and personal rules.
- 文章: show public essays.
- 关于: show profile and biography.
- 抓手模式: indicate canvas pan mode.
- 画布搜索: focus search inside the visible universe.
- 连接视图: emphasize relationships between galaxies, planets, content, and tags.

## Data Shape Direction

Future data can evolve toward this shape:

```txt
Galaxy
- id
- slug
- name
- summary
- description
- sortOrder
- visibility

Planet
- id
- galaxyId
- slug
- name
- summary
- description
- theme
- sortOrder
- visibility

ContentRecord
- id
- galaxyId
- planetId
- type
- title
- body
- occurredAt
- visibility
- tags
- source
```

The current data model can be adapted gradually. Existing planets can first act as galaxies, then child planets can be introduced when the content volume requires it.

## Migration Strategy

Start conservatively:

1. Keep the homepage UI unchanged.
2. Rename or seed the primary visible planets as the seven galaxies.
3. Attach existing essays, projects, notes, and memories to the closest galaxy.
4. Introduce child planets only for topics with enough material.
5. Keep uncertain material in 星尘 until repeated patterns appear.
6. Add search, filter, and detail routes after the taxonomy is stable.

## Implementation Decisions

- The seven top-level galaxies are the primary homepage meaning. Existing homepage planets can be mapped into these galaxies first, then moved into child planets as the data model grows.
- Detail should be overlay-first because the current homepage already supports immersive entry. Routes can be added later for shareable galaxy or planet pages.
- New is public-first: it shows latest additions. Owner-only creation should stay behind the admin/authenticated workflow.
- 黑匣子 records are private by default, excluded from public display, and excluded from public AI context unless a future authenticated owner-only mode explicitly allows them.
