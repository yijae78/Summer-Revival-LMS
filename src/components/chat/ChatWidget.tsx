'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X } from 'lucide-react'

import { ChatPanel } from '@/components/chat/ChatPanel'
import { cn } from '@/lib/utils'
import { useReducedMotion } from '@/hooks/useReducedMotion'

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const prefersReducedMotion = useReducedMotion()

  // Escape key to close
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  const animationProps = prefersReducedMotion
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.1 },
      }
    : {
        initial: { opacity: 0, y: 20, scale: 0.95 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: 20, scale: 0.95 },
        transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] as const },
      }

  return (
    <>
      {/* Floating button */}
      <motion.button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          'fixed z-50',
          'flex h-14 w-14 items-center justify-center',
          'rounded-full bg-primary text-primary-foreground',
          'shadow-[0_8px_24px_rgba(56,189,248,0.3)]',
          'transition-all duration-200',
          'hover:shadow-[0_8px_32px_rgba(56,189,248,0.4)]',
          'active:scale-95',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          // Desktop: right-6 bottom-6
          // Mobile: right-4 bottom-20 (above BottomNav)
          'right-4 bottom-20 lg:right-6 lg:bottom-6'
        )}
        whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
        whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
        aria-label={isOpen ? '채팅 닫기' : 'AI 어시스턴트 열기'}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <X className="h-6 w-6" />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <MessageCircle className="h-6 w-6" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            {...animationProps}
            className={cn(
              'fixed z-50 flex flex-col overflow-hidden',
              'border border-border/50 bg-background shadow-2xl',
              // Mobile: bottom sheet 85vh
              'inset-x-0 bottom-0 h-[85dvh] rounded-t-2xl',
              // Desktop: floating panel
              'lg:inset-auto lg:right-6 lg:bottom-24',
              'lg:h-[600px] lg:w-[400px] lg:rounded-2xl'
            )}
            role="dialog"
            aria-modal="true"
            aria-label="AI 어시스턴트 채팅"
          >
            <ChatPanel
              onClose={() => setIsOpen(false)}
              onMinimize={() => setIsOpen(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop for mobile */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/40 lg:hidden"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>
    </>
  )
}
