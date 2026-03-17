'use client'

import { useMemo } from 'react'

import { useCurrentEvent } from '@/hooks/useCurrentEvent'
import { DEPARTMENTS, getDepartmentByKey } from '@/constants/departments'

import type { DepartmentDef } from '@/constants/departments'

export function useEventDepartments(): DepartmentDef[] {
  const { event } = useCurrentEvent()

  return useMemo(() => {
    const settings = (event?.settings ?? {}) as Record<string, unknown>
    const configuredKeys = (settings.departments as string[]) ?? []

    if (configuredKeys.length === 0) {
      return DEPARTMENTS
    }

    const allDept = DEPARTMENTS[0] // 'all'
    const filtered = configuredKeys
      .map((key) => getDepartmentByKey(key))
      .filter((d): d is DepartmentDef => d !== undefined)

    return [allDept, ...filtered]
  }, [event])
}
