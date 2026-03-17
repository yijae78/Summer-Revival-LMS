'use client'

import { motion } from 'framer-motion'

import { useEventDepartments } from '@/hooks/useEventDepartments'
import { useDepartmentFilterStore } from '@/stores/departmentFilterStore'
import { cn } from '@/lib/utils'

const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }

interface DepartmentFilterProps {
  counts?: Record<string, number>
}

export function DepartmentFilter({ counts }: DepartmentFilterProps) {
  const departments = useEventDepartments()
  const department = useDepartmentFilterStore((s) => s.department)
  const setDepartment = useDepartmentFilterStore((s) => s.setDepartment)

  if (departments.length <= 2) return null

  return (
    <motion.div variants={fadeUp} className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1 md:gap-2">
      {departments.map((d) => {
        const count = counts?.[d.key]
        const isActive = department === d.key

        return (
          <motion.button
            key={d.key}
            type="button"
            onClick={() => setDepartment(d.key)}
            whileTap={{ scale: 0.94 }}
            className={cn(
              'relative flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1.5 text-[0.6875rem] font-bold transition-colors duration-200 md:gap-1.5 md:px-3.5 md:py-2 md:text-xs',
              isActive
                ? cn('bg-gradient-to-r text-white shadow-md', d.gradient)
                : 'border border-white/[0.08] bg-white/[0.03] text-muted-foreground',
            )}
          >
            <span className="text-xs md:text-sm">{d.emoji}</span>
            <span>{d.label}</span>
            {count !== undefined && count > 0 && (
              <span className={cn(
                'flex h-3.5 min-w-3.5 items-center justify-center rounded-full px-0.5 text-[0.5rem] font-black md:h-4 md:min-w-4 md:px-1 md:text-[0.5625rem]',
                isActive ? 'bg-white/20 text-white' : 'bg-white/[0.08] text-muted-foreground',
              )}>
                {count}
              </span>
            )}
          </motion.button>
        )
      })}
    </motion.div>
  )
}
