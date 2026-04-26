import { Mic, Paperclip, Search, Send } from "lucide-react"
import type { FormEvent, ReactNode } from "react"

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
      aria-label="数字分身"
      className="pointer-events-auto relative z-20 flex min-h-[620px] flex-col border-t border-[var(--ns-glass-border)] bg-[var(--ns-panel-bg)] px-5 py-6 text-[var(--ns-text-primary)] backdrop-blur-xl md:absolute md:top-0 md:right-0 md:bottom-0 md:w-[22rem] md:border-t-0 md:border-l"
    >
      <div
        data-state={isSending ? "thinking" : "idle"}
        className="null-ai-avatar mx-auto mt-8 grid h-36 w-36 place-items-center rounded-full"
      >
        <div className="grid h-16 w-16 place-items-center rounded-full bg-black/45 shadow-[inset_0_0_20px_rgba(255,255,255,0.08)]">
          <div className="flex gap-3">
            <span className="h-3 w-2 rounded-full bg-white/85" />
            <span className="h-3 w-2 rounded-full bg-white/85" />
          </div>
        </div>
      </div>

      <div className="mt-7 text-center">
        <div className="inline-flex items-center gap-2">
          <h2 className="text-lg font-semibold text-[var(--ns-text-primary)]">
            {identity.displayName || "数字分身"}
          </h2>
          <span className="rounded-md border border-[var(--ns-accent-secondary)] bg-[var(--ns-badge-bg)] px-1.5 py-0.5 text-[0.56rem] text-[var(--ns-accent-secondary)]">
            测试
          </span>
        </div>
        <p className="mt-1 text-sm text-[var(--ns-text-tertiary)]">
          {identity.subtitle || "你的思考伙伴"}
        </p>
      </div>

      <section className="null-space-panel mt-5 p-4 text-sm leading-6 text-[var(--ns-text-secondary)]">
        <p className="text-[var(--ns-text-primary)]">你好，我是你的数字分身</p>
        <p className="mt-1">我可以帮你：</p>
        <ul className="mt-2 space-y-1 text-[var(--ns-text-tertiary)]">
          <li>• 发掘知识关联</li>
          <li>• 继续文意脉络</li>
          <li>• 拓展思考边界</li>
          <li>• 陪你对话交流</li>
        </ul>
        <p className="mt-3 text-[var(--ns-text-secondary)]">
          当前聚焦：<span data-testid="selected-card-title">{selectedCard?.title ?? "空宇宙"}</span>
        </p>
        {memoriesCount === 0 ? (
          <p className="mt-2 text-[var(--ns-text-tertiary)]">还没有关联公开记忆。</p>
        ) : null}
      </section>

      <div className="mt-4 min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        {isSending ? (
          <article className="message-ai thinking text-sm leading-6">
            <div className="message-bubble">
              <p>思考中</p>
            </div>
          </article>
        ) : null}
      </div>

      <div className="mt-4 flex items-center gap-2 text-[var(--ns-text-tertiary)]">
        <ToolButton label="搜索历史">
          <Search className="h-3.5 w-3.5" />
        </ToolButton>
        <ToolButton label="添加附件">
          <Paperclip className="h-3.5 w-3.5" />
        </ToolButton>
        <ToolButton label="语音输入">
          <Mic className="h-3.5 w-3.5" />
        </ToolButton>
      </div>

      <form onSubmit={onSubmit} className="mt-3 flex items-end gap-2">
        <textarea
          value={draftMessage}
          onChange={(event) => onDraftChange(event.target.value)}
          placeholder="和数字分身聊聊..."
          rows={1}
          className="min-h-11 min-w-0 flex-1 resize-none rounded-2xl border border-[var(--ns-glass-border)] bg-[var(--ns-input-bg)] px-4 py-3 text-sm text-[var(--ns-text-primary)] outline-none placeholder:text-[var(--ns-text-muted)] focus:ring-2 focus:ring-[var(--ns-accent-primary)]"
        />
        <button
          type="submit"
          aria-label="发送给数字分身"
          disabled={isSending}
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-[var(--ns-glass-border)] bg-[var(--ns-control-bg)] text-[var(--ns-text-tertiary)] outline-none transition hover:text-[var(--ns-accent-primary)] focus-visible:ring-2 focus-visible:ring-[var(--ns-accent-primary)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </aside>
  )
}

function MessageBubble({ message }: { readonly message: ChatMessage }) {
  return (
    <article
      className={`text-sm leading-6 ${
        message.role === "assistant" ? "message-ai" : "message-user"
      }`}
    >
      <div className="message-bubble">
        <p>{message.content}</p>
        {message.references && message.references.length > 0 ? (
          <div className="mt-3 space-y-1 border-t border-[var(--ns-glass-border)] pt-2 text-xs text-[var(--ns-text-tertiary)]">
            {message.references.slice(0, 3).map((reference) => (
              <p key={reference.id}>{reference.title}</p>
            ))}
          </div>
        ) : null}
      </div>
    </article>
  )
}

function ToolButton({
  label,
  children,
}: {
  readonly label: string
  readonly children: ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      className="grid h-8 w-8 place-items-center rounded-xl outline-none transition hover:bg-[var(--ns-control-bg)] hover:text-[var(--ns-text-primary)] focus-visible:ring-2 focus-visible:ring-[var(--ns-accent-primary)]"
    >
      {children}
    </button>
  )
}
