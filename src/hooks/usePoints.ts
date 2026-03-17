'use client'

import { useQuery } from '@tanstack/react-query'

import { getSupabaseClient } from '@/lib/supabase/client'
import { isSupabaseConfigured } from '@/lib/supabase/config'
import { queryKeys } from '@/lib/query-keys'
import { useAppModeStore } from '@/stores/appModeStore'
import { DEMO_GROUPS, DEMO_POINTS, DEMO_PARTICIPANTS } from '@/lib/demo/data'
import { createDemoQueryResult } from '@/lib/demo/hooks'
import { getAll } from '@/lib/local-db'
import { getDepartmentKeyFromGrade } from '@/constants/departments'

import type { PointRecord, Group, Participant } from '@/types'

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

function buildGroupRanking(groups: Group[], department?: string): GroupRankEntry[] {
  let filtered = groups
  if (department && department !== 'all') {
    filtered = groups.filter((g) => !g.department || g.department === department)
  }
  return filtered
    .map((g) => ({
      groupId: g.id,
      name: g.name,
      color: g.color,
      totalPoints: g.total_points,
    }))
    .sort((a, b) => b.totalPoints - a.totalPoints)
}

function buildIndividualRanking(
  points: PointRecord[],
  participants: Participant[],
  department?: string
): IndividualRankEntry[] {
  let filteredParticipants = participants
  if (department && department !== 'all') {
    filteredParticipants = participants.filter(
      (p) => getDepartmentKeyFromGrade(p.grade) === department
    )
  }
  const participantIds = new Set(filteredParticipants.map((p) => p.id))

  const totals = new Map<string, number>()
  for (const pt of points) {
    if (pt.participant_id && participantIds.has(pt.participant_id)) {
      totals.set(pt.participant_id, (totals.get(pt.participant_id) ?? 0) + pt.amount)
    }
  }
  const nameMap = new Map(filteredParticipants.map((p) => [p.id, p.name]))
  return Array.from(totals.entries())
    .map(([pid, total]) => ({
      participantId: pid,
      name: nameMap.get(pid) ?? '',
      totalPoints: total,
    }))
    .sort((a, b) => b.totalPoints - a.totalPoints)
}

export function usePointsRanking(eventId: string | null, type: 'individual' | 'group', department?: string) {
  const mode = useAppModeStore((s) => s.mode)

  const query = useQuery({
    queryKey: queryKeys.points(eventId!, type, department),
    queryFn: async (): Promise<RankEntry[]> => {
      if (mode === 'local') {
        if (type === 'group') {
          const groups = getAll<Group>('groups').filter((g) => g.event_id === eventId)
          return buildGroupRanking(groups, department)
        }
        const points = getAll<PointRecord>('points').filter((p) => p.event_id === eventId)
        const participants = getAll<Participant>('participants')
        return buildIndividualRanking(points, participants, department)
      }

      const supabase = getSupabaseClient()!

      if (type === 'group') {
        const { data, error } = await supabase
          .from('groups')
          .select('id, name, color, total_points, department')
          .eq('event_id', eventId!)
          .order('total_points', { ascending: false })

        if (error) throw error

        let groups = (data ?? []) as Group[]
        if (department && department !== 'all') {
          groups = groups.filter((g) => !g.department || g.department === department)
        }

        return groups.map((g) => ({
          groupId: g.id,
          name: g.name,
          color: g.color,
          totalPoints: g.total_points ?? 0,
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
        .select('id, name, grade')
        .in('id', participantIds)

      if (partError) throw partError

      let filteredParticipants = participants ?? []
      if (department && department !== 'all') {
        filteredParticipants = filteredParticipants.filter(
          (p) => getDepartmentKeyFromGrade(p.grade as string | null) === department
        )
      }

      const nameMap = new Map<string, string>()
      const validIds = new Set<string>()
      for (const p of filteredParticipants) {
        nameMap.set(p.id as string, p.name as string)
        validIds.add(p.id as string)
      }

      const entries: IndividualRankEntry[] = Array.from(totals.entries())
        .filter(([pid]) => validIds.has(pid))
        .map(([pid, total]) => ({
          participantId: pid,
          name: nameMap.get(pid) ?? '',
          totalPoints: total,
        }))
        .sort((a, b) => b.totalPoints - a.totalPoints)

      return entries
    },
    enabled: eventId !== null && (mode === 'local' || (mode === 'cloud' && isSupabaseConfigured())),
  })

  if (mode === 'demo') {
    if (type === 'group') {
      return createDemoQueryResult(buildGroupRanking(DEMO_GROUPS, department))
    }
    return createDemoQueryResult(buildIndividualRanking(DEMO_POINTS, DEMO_PARTICIPANTS, department))
  }

  return query
}

export function usePointHistory(eventId: string | null, groupId?: string | null) {
  const mode = useAppModeStore((s) => s.mode)

  const query = useQuery({
    queryKey: [...queryKeys.points(eventId!), 'history', groupId ?? 'all'],
    queryFn: async (): Promise<PointRecord[]> => {
      if (mode === 'local') {
        let points = getAll<PointRecord>('points').filter((p) => p.event_id === eventId)
        if (groupId) {
          points = points.filter((p) => p.group_id === groupId)
        }
        return points.sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
      }

      const supabase = getSupabaseClient()!
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
    enabled: eventId !== null && (mode === 'local' || (mode === 'cloud' && isSupabaseConfigured())),
  })

  if (mode === 'demo') {
    let points = [...DEMO_POINTS]
    if (groupId) {
      points = points.filter((p) => p.group_id === groupId)
    }
    return createDemoQueryResult(points)
  }

  return query
}
