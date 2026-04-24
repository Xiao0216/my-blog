"use client"

import { MessageCircle, Send, X } from "lucide-react"
import type { FormEvent } from "react"
import { useEffect, useRef } from "react"

import type {
  ChatMessage,
  UniverseCardModel,
} from "@/components/site/life-universe/types"
import type { StoredTwinIdentity } from "@/lib/content"

export function TwinOrb({
  identity,
  contextCard,
  memoriesCount,
  draftMessage,
  isExpanded,
  isSending,
  messages,
  onDraftChange,
  onSubmit,
  onToggle,
}: {
  readonly identity: StoredTwinIdentity
  readonly contextCard?: UniverseCardModel
  readonly memoriesCount: number
  readonly draftMessage: string
  readonly isExpanded: boolean
  readonly isSending: boolean
  readonly messages: ReadonlyArray<ChatMessage>
  readonly onDraftChange: (value: string) => void
  readonly onSubmit: (event: FormEvent<HTMLFormElement>) => void
  readonly onToggle: () => void
}) {
  const displayName = identity.displayName || "Null AI"
  const contextTitle = contextCard?.title ?? "全局星图"
  const avatarButtonRef = useRef<HTMLButtonElement | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const previousExpandedRef = useRef(isExpanded)

  useEffect(() => {
    if (previousExpandedRef.current === isExpanded) {
      return
    }

    if (isExpanded) {
      textareaRef.current?.focus()
    } else {
      avatarButtonRef.current?.focus()
    }

    previousExpandedRef.current = isExpanded
  }, [isExpanded])

  return (
    <div className="twin-orb-shell pointer-events-none absolute">
      <span className="sr-only" data-testid="selected-card-title">
        {contextTitle}
      </span>
      {isExpanded ? (
        <section
          role="dialog"
          aria-label="Null AI 对话"
          className="twin-orb-panel pointer-events-auto"
        >
          <header className="twin-orb-panel-header">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-[var(--ns-text-primary)]">
                {displayName}
              </p>
              <p className="mt-1 text-xs text-[var(--ns-text-tertiary)]">
                当前上下文：{contextTitle}
              </p>
            </div>
            <button
              type="button"
              aria-label="收起 Null AI"
              onClick={onToggle}
              className="twin-orb-close"
            >
              <X className="h-4 w-4" />
            </button>
          </header>

          <div className="twin-orb-messages">
            {memoriesCount === 0 ? (
              <p className="text-sm text-[var(--ns-text-tertiary)]">
                No public memories attached yet
              </p>
            ) : null}
            {messages.map((message) => (
              <article
                key={message.id}
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
            ))}
            {isSending ? (
              <article className="message-ai thinking text-sm leading-6">
                <div className="message-bubble">
                  <p>思考中</p>
                </div>
              </article>
            ) : null}
          </div>

          <form onSubmit={onSubmit} className="twin-orb-form">
            <textarea
              ref={textareaRef}
              value={draftMessage}
              onChange={(event) => onDraftChange(event.target.value)}
              placeholder="搜索或和 Null AI 聊聊..."
              rows={2}
              className="twin-orb-textarea"
            />
            <button
              type="submit"
              aria-label="发送给 Null AI"
              disabled={isSending}
              className="twin-orb-send"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </section>
      ) : (
        <button
          ref={avatarButtonRef}
          type="button"
          aria-label="展开 Null AI"
          onClick={onToggle}
          className="twin-orb-avatar pointer-events-auto"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}
    </div>
  )
}
