'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { Send, X, Minus, WifiOff } from 'lucide-react'

import { ChatMessage } from '@/components/chat/ChatMessage'
import { ChatEmptyState } from '@/components/chat/ChatEmptyState'
import { cn } from '@/lib/utils'
import { useNetworkStatus } from '@/hooks/useNetworkStatus'

interface ChatPanelProps {
  onClose: () => void
  onMinimize: () => void
}

export function ChatPanel({ onClose, onMinimize }: ChatPanelProps) {
  const [input, setInput] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const isOnline = useNetworkStatus()

  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({ api: '/api/chat' }),
  })

  const isLoading = status === 'submitted' || status === 'streaming'

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  // Focus input on mount
  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 300)
    return () => clearTimeout(timer)
  }, [])

  const handleSend = useCallback(
    (text: string) => {
      const trimmed = text.trim()
      if (!trimmed || isLoading || !isOnline) return
      setInput('')
      sendMessage({ text: trimmed })
    },
    [isLoading, isOnline, sendMessage]
  )

  // Quick question handler
  const handleQuickQuestion = useCallback(
    (question: string) => {
      handleSend(question)
    },
    [handleSend]
  )

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    handleSend(input)
  }

  // Keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
    }
  }

  return (
    <div className="flex h-full flex-col" onKeyDown={handleKeyDown}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/50 bg-primary/5 px-4 py-3">
        <div>
          <h2 className="text-sm font-bold text-foreground">FLOWING 어시스턴트</h2>
          <p className="text-[0.6875rem] text-muted-foreground">무엇이든 물어보세요</p>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onMinimize}
            className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-muted"
            aria-label="최소화"
          >
            <Minus className="h-4 w-4 text-muted-foreground" />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-muted"
            aria-label="닫기"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <ChatEmptyState onQuickQuestion={handleQuickQuestion} />
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}

            {/* Loading indicator */}
            {isLoading && (
              <div className="flex items-start gap-2.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <div className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                </div>
                <div className="rounded-2xl rounded-tl-sm bg-muted px-4 py-2.5">
                  <p className="text-[0.8125rem] text-muted-foreground">
                    답변을 준비하고 있어요...
                  </p>
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-3">
                <p className="text-xs text-destructive">
                  {error.message || '문제가 생겼어요. 다시 시도해 주세요.'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Offline banner */}
      {!isOnline && (
        <div className="flex items-center gap-2 border-t border-amber-500/20 bg-amber-500/10 px-4 py-2">
          <WifiOff className="h-3.5 w-3.5 text-amber-500" />
          <p className="text-xs text-amber-500">
            인터넷 연결을 확인해 주세요
          </p>
        </div>
      )}

      {/* Input */}
      <form
        id="chat-form"
        onSubmit={handleFormSubmit}
        className="border-t border-border/50 p-3"
      >
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            name="prompt"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            maxLength={500}
            placeholder={isOnline ? '메시지를 입력하세요...' : '오프라인 상태에요'}
            disabled={isLoading || !isOnline}
            aria-label="AI 도우미에게 질문하기"
            className={cn(
              'min-h-[48px] flex-1 rounded-xl border border-border/50 bg-background px-4 py-3',
              'text-[0.9375rem] leading-[1.7] placeholder:text-muted-foreground/50',
              'focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20',
              'disabled:cursor-not-allowed disabled:opacity-50',
              'transition-colors duration-150'
            )}
            style={{ wordBreak: 'keep-all' }}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading || !isOnline}
            aria-label="메시지 전송"
            className={cn(
              'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl',
              'bg-primary text-primary-foreground',
              'transition-all duration-150',
              'hover:bg-primary/90 active:scale-95',
              'disabled:cursor-not-allowed disabled:opacity-40',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2'
            )}
          >
            <Send className="h-[18px] w-[18px]" />
          </button>
        </div>
      </form>
    </div>
  )
}
