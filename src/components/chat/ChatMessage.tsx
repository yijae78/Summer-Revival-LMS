'use client'

import { memo } from 'react'
import { isToolUIPart, getToolName } from 'ai'
import { Bot, User } from 'lucide-react'

import { ToolResultCard } from '@/components/chat/ToolResultCard'
import { cn } from '@/lib/utils'

import type { UIMessage } from 'ai'

interface ChatMessageProps {
  message: UIMessage
}

function ChatMessageInner({ message }: ChatMessageProps) {
  const isUser = message.role === 'user'

  const textContent = message.parts
    .filter((part): part is { type: 'text'; text: string } => part.type === 'text')
    .map((part) => part.text)
    .join('')

  const toolParts = message.parts.filter((part) => isToolUIPart(part))

  return (
    <div
      className={cn('flex gap-2.5', isUser ? 'flex-row-reverse' : 'flex-row')}
      role="article"
      aria-label={
        isUser
          ? `사용자: ${textContent.slice(0, 30)}`
          : `AI 도우미: ${textContent.slice(0, 30)}`
      }
    >
      {/* Avatar */}
      {!isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
          <Bot className="h-4 w-4 text-primary" />
        </div>
      )}
      {isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
          <User className="h-4 w-4 text-muted-foreground" />
        </div>
      )}

      {/* Content */}
      <div className={cn('flex max-w-[80%] flex-col', isUser ? 'items-end' : 'items-start')}>
        <div
          className={cn(
            'rounded-2xl px-4 py-2.5',
            isUser
              ? 'rounded-tr-sm bg-primary text-primary-foreground'
              : 'rounded-tl-sm bg-muted text-foreground'
          )}
        >
          {/* Text content */}
          {textContent && (
            <p
              className="whitespace-pre-wrap text-[0.9375rem] leading-[1.7]"
              style={{ wordBreak: 'keep-all' }}
            >
              {textContent}
            </p>
          )}

          {/* Tool invocations */}
          {toolParts.map((part) => {
            const toolName = getToolName(part)
            const toolCallId = part.toolCallId
            return (
              <ToolResultCard key={toolCallId} toolName={toolName} part={part} />
            )
          })}
        </div>
      </div>
    </div>
  )
}

export const ChatMessage = memo(ChatMessageInner)
