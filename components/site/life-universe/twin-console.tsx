import { Send } from "lucide-react"
import type { FormEvent } from "react"

import type {
  ChatMessage,
  UniverseCardModel,
} from "@/components/site/life-universe/types"
import type { StoredTwinIdentity } from "@/lib/content"

export function TwinConsole({
  identity,
  selectedCard,
  memoriesCount,
  draftMessage,
  isSending,
  messages,
  onDraftChange,
  onSubmit,
}: {
  readonly identity: StoredTwinIdentity
  readonly selectedCard?: UniverseCardModel
  readonly memoriesCount: number
  readonly draftMessage: string
  readonly isSending: boolean
  readonly messages: ReadonlyArray<ChatMessage>
  readonly onDraftChange: (value: string) => void
  readonly onSubmit: (event: FormEvent<HTMLFormElement>) => void
}) {
  return (
    <aside
      role="complementary"
      aria-label="Null AI digital twin"
      className="pointer-events-auto relative z-20 flex min-h-[620px] flex-col border-t border-white/10 bg-black/20 px-5 py-6 backdrop-blur-xl md:absolute md:top-0 md:right-0 md:bottom-0 md:w-[22rem] md:border-t-0 md:border-l"
    >
      <div className="mx-auto mt-8 grid h-36 w-36 place-items-center rounded-full border border-white/10 bg-[radial-gradient(circle_at_40%_35%,rgba(255,255,255,0.25),rgba(45,212,191,0.12)_34%,rgba(15,23,42,0.85)_70%)] shadow-[0_0_70px_rgba(45,212,191,0.18)]">
        <div className="grid h-16 w-16 place-items-center rounded-full bg-black/45 shadow-[inset_0_0_20px_rgba(255,255,255,0.08)]">
          <div className="flex gap-3">
            <span className="h-3 w-2 rounded-full bg-white/85" />
            <span className="h-3 w-2 rounded-full bg-white/85" />
          </div>
        </div>
      </div>

      <div className="mt-7 text-center">
        <div className="inline-flex items-center gap-2">
          <h2 className="text-lg font-semibold text-zinc-100">
            {identity.displayName || "Null AI"}
          </h2>
          <span className="rounded-md border border-violet-200/20 bg-violet-300/10 px-1.5 py-0.5 text-[0.56rem] text-violet-200">
            BETA
          </span>
        </div>
        <p className="mt-1 text-sm text-zinc-500">
          {identity.subtitle || "你的思考伙伴"}
        </p>
      </div>

      <section className="mt-5 rounded-2xl border border-white/10 bg-white/[0.035] p-4 text-sm leading-6 text-zinc-400">
        <p className="text-zinc-300">你好，我是你的 AI 分身</p>
        <p className="mt-1">我可以帮你：</p>
        <ul className="mt-2 space-y-1 text-zinc-500">
          <li>• 发掘知识关联</li>
          <li>• 继续文意脉络</li>
          <li>• 拓展思考边界</li>
          <li>• 陪你对话交流</li>
        </ul>
        <p className="mt-3 text-zinc-400">
          当前聚焦：<span data-testid="selected-card-title">{selectedCard?.title ?? "空宇宙"}</span>
        </p>
        {memoriesCount === 0 ? (
          <p className="mt-2 text-zinc-500">No public memories attached yet</p>
        ) : null}
      </section>

      <div className="mt-4 min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
        {messages.map((message) => (
          <article
            key={message.id}
            className={`rounded-2xl border p-3 text-sm leading-6 ${
              message.role === "assistant"
                ? "border-teal-100/10 bg-teal-100/[0.045] text-zinc-300"
                : "border-white/10 bg-white/[0.055] text-zinc-200"
            }`}
          >
            <p>{message.content}</p>
            {message.references && message.references.length > 0 ? (
              <div className="mt-3 space-y-1 border-t border-white/10 pt-2 text-xs text-zinc-500">
                {message.references.slice(0, 3).map((reference) => (
                  <p key={reference.id}>{reference.title}</p>
                ))}
              </div>
            ) : null}
          </article>
        ))}
      </div>

      <form onSubmit={onSubmit} className="mt-4 flex items-center gap-2">
        <input
          value={draftMessage}
          onChange={(event) => onDraftChange(event.target.value)}
          placeholder="和 Null AI 聊聊..."
          className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-white/[0.045] px-4 py-3 text-sm text-zinc-100 outline-none placeholder:text-zinc-600 focus:ring-2 focus:ring-teal-100/40"
        />
        <button
          type="submit"
          aria-label="发送给 Null AI"
          disabled={isSending}
          className="grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-white/[0.055] text-zinc-400 outline-none transition hover:text-teal-100 focus-visible:ring-2 focus-visible:ring-teal-100/60 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </aside>
  )
}
