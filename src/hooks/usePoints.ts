'use client'

import { useQuery } from '@tanstack/react-query'

import { getSupabaseClient } from '@/lib/supabase/client'
import { queryKeys } from '@/lib/query-keys'
import { useDemoStore } from '@/stores/demoStore'
import { DEMO_GROUPS, DEMO_POINTS, DEMO_PARTICIPANTS } from '@/lib/demo/data'
import { createDemoQueryResult } from '@/lib/demo/hooks'

import type { PointRecord } from '@/types'

interface IndividualRankEntry {
  participantId: string
  name: string
  totalPoints: number
}

interface GroupRankEntry {
  groupId: string
  name: string
  color: string | null
  totalPoints: number
}

export type RankEntry = IndividualRankEntry | GroupRankEntry

export function usePointsRanking(eventId: string | null, type: 'individual' | 'group') {
  const isDemoMode = useDemoStore((s) => s.isDemoMode)

  const query = useQuery({
    queryKey: queryKeys.points(eventId!, type),
    queryFn: async (): Promise<RankEntry[]> => {
      const supabase = getSupabaseClient()

      if (type === 'group') {
        const { data, error } = await supabase
          .from('groups')
          .select('id, name, color, total_points')
          .eq('event_id', eventId!)
          .order('total_points', { ascending: false })

        if (error) throw error
        return (data ?? []).map((g) => ({
          groupId: g.id as string,
          name: g.name as string,
          color: g.color as string | null,
          totalPoints: (g.total_points as number) ?? 0,
        }))
      }

      // Individual ranking: aggregate points per participant
      const { data: points, error: pointsError } = await supabase
        .from('points')
        .select('participant_id, amount')
        .eq('event_id', eventId!)
        .not('participant_id', 'is', null)

      if (pointsError) throw pointsError

      const totals = new Map<string, number>()
      for (const p of points ?? []) {
        const pid = p.participant_id as string
        totals.set(pid, (totals.get(pid) ?? 0) + (p.amount as number))
      }

      if (totals.size === 0) return []

      const participantIds = Array.from(totals.keys())
      const { data: participants, error: partError } = await supabase
        .from('participants')
        .select('id, name')
        .in('id', participantIds)

      if (partError) throw partError

      const nameMap = new Map<string, string>()
      for (const p of participants ?? []) {
        nameMap.set(p.id as string, p.name as string)
      }

      const entries: IndividualRankEntry[] = Array.from(totals.entries())
        .map(([pid, total]) => ({
          participantId: pid,
          name: nameMap.get(pid) ?? '',
          totalPoints: total,
        }))
        .sort((a, b) => b.totalPoints - a.totalPoints)

      return entries
    },
    enabled: eventId !== null && !isDemoMode,
  })

  if (isDemoMode) {
    if (type === 'group') {
      const groupRanking: GroupRankEntry[] = DEMO_GROUPS
        .map((g) => ({
          groupId: g.id,
          name: g.name,
          color: g.color,
          totalPoints: g.total_points,
        }))
        .sort((a, b) => b.totalPoints - a.totalPoints)
      return createDemoQueryResult(groupRanking)
    }

    // Individual ranking from demo points
    const totals = new Map<string, number>()
    for (const pt of DEMO_POINTS) {
      if (pt.participant_id) {
        totals.set(pt.participant_id, (totals.get(pt.participant_id) ?? 0) + pt.amount)
      }
    }

    const nameMap = new Map(DEMO_PARTICIPANTS.map((p) => [p.id, p.name]))
    const entries: IndividualRankEntry[] = Array.from(totals.entries())
      .map(([pid, total]) => ({
        participantId: pid,
        name: nameMap.get(pid) ?? '',
        totalPoints: total,
      }))
      .sort((a, b) => b.totalPoints - a.totalPoints)

    return createDemoQueryResult(entries)
  }

  return query
}

export function usePointHistory(eventId: string | null, groupId?: string | null) {
  const isDemoMode = useDemoStore((s) => s.isDemoMode)

  const query = useQuery({
    queryKey: [...queryKeys.points(eventId!), 'history', groupId ?? 'all'],
    queryFn: async (): Promise<PointRecord[]> => {
      const supabase = getSupabaseClient()
      let q = supabase
        .from('points')
        .select('*')
        .eq('event_id', eventId!)
        .order('created_at', { ascending: false })

      if (groupId) {
        q = q.eq('group_id', groupId)
      }

      const { data, error } = await q

      if (error) throw error
      return (data ?? []) as PointRecord[]
    },
    enabled: eventId !== null && !isDemoMode,
  })

  if (isDemoMode) {
    let points = [...DEMO_POINTS]
    if (groupId) {
      points = points.filter((p) => p.group_id === groupId)
    }
    return createDemoQueryResult(points)
  }

  return query
}
