'use client'

import type { ReactNode } from 'react'
import { useRouter } from 'next/navigation'

import { ArrowLeft } from 'lucide-react'
import { motion } from 'framer-motion'

import { cn } from '@/lib/utils'

interface PageHeaderProps {
  title: string
  description?: string
  backHref?: string
  backLabel?: string
  action?: ReactNode
}

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] as const } },
}

export function PageHeader({
  title,
  description,
  backHref,
  backLabel = '뒤로',
  action,
}: PageHeaderProps) {
  const router = useRouter()

  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="show"
      className="flex items-start justify-between gap-4"
    >
      <div className="flex min-w-0 flex-1 items-start gap-3">
        {backHref && (
          <button
            type="button"
            onClick={() => router.push(backHref)}
            className={cn(
              'mt-0.5 flex min-h-[40px] min-w-[40px] shrink-0 items-center justify-center',
              'rounded-xl border border-white/[0.08] bg-white/[0.04] backdrop-blur-sm',
              'text-muted-foreground transition-all duration-300',
              'hover:border-indigo-500/20 hover:bg-white/[0.06] hover:text-foreground',
              'active:scale-95'
            )}
            aria-label={backLabel}
          >
            <ArrowLeft className="size-[18px]" />
          </button>
        )}
        <div className="min-w-0 flex-1">
          <h1 className={cn(
            'text-xl font-bold tracking-[-0.01em] md:text-2xl',
            !backHref
              ? 'bg-gradient-to-r from-indigo-300 via-purple-300 to-fuchsia-300 bg-clip-text text-transparent'
              : 'text-foreground'
          )}>
            {title}
          </h1>
          {description && (
            <p className="mt-1 text-sm leading-[1.7] text-muted-foreground">
              {description}
            </p>
          )}
        </div>
      </div>

      {action && (
        <div className="shrink-0">
          {action}
        </div>
      )}
    </motion.div>
  )
}
