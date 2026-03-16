'use client'

import { useQuery } from '@tanstack/react-query'

import { getSupabaseClient } from '@/lib/supabase/client'
import { queryKeys } from '@/lib/query-keys'
import { useDemoStore } from '@/stores/demoStore'
import { DEMO_GROUPS, DEMO_GROUP_MEMBERS, DEMO_PARTICIPANTS } from '@/lib/demo/data'
import { createDemoQueryResult } from '@/lib/demo/hooks'

import type { Group, GroupMember, Participant } from '@/types'

interface GroupWithMemberCount extends Group {
  member_count: number
}

interface GroupMemberWithParticipant extends GroupMember {
  participant: Pick<Participant, 'id' | 'name' | 'gender' | 'grade'> | null
}

export function useGroups(eventId: string | null) {
  const isDemoMode = useDemoStore((s) => s.isDemoMode)

  const query = useQuery({
    queryKey: queryKeys.groups(eventId!),
    queryFn: async (): Promise<GroupWithMemberCount[]> => {
      const supabase = getSupabaseClient()
      const { data: groups, error: groupsError } = await supabase
        .from('groups')
        .select('*')
        .eq('event_id', eventId!)
        .order('created_at', { ascending: true })

      if (groupsError) throw groupsError
      if (!groups || groups.length === 0) return []

      const groupIds = groups.map((g) => g.id)
      const { data: members, error: membersError } = await supabase
        .from('group_members')
        .select('group_id')
        .in('group_id', groupIds)

      if (membersError) throw membersError

      const countMap = new Map<string, number>()
      for (const m of members ?? []) {
        const gid = m.group_id as string
        countMap.set(gid, (countMap.get(gid) ?? 0) + 1)
      }

      return (groups as Group[]).map((g) => ({
        ...g,
        member_count: countMap.get(g.id) ?? 0,
      }))
    },
    enabled: eventId !== null && !isDemoMode,
  })

  if (isDemoMode) {
    const countMap = new Map<string, number>()
    for (const m of DEMO_GROUP_MEMBERS) {
      const gid = m.group_id ?? ''
      countMap.set(gid, (countMap.get(gid) ?? 0) + 1)
    }
    const groupsWithCount: GroupWithMemberCount[] = DEMO_GROUPS.map((g) => ({
      ...g,
      member_count: countMap.get(g.id) ?? 0,
    }))
    return createDemoQueryResult(groupsWithCount)
  }

  return query
}

export function useGroup(groupId: string | null) {
  const isDemoMode = useDemoStore((s) => s.isDemoMode)

  const query = useQuery({
    queryKey: queryKeys.group(groupId!),
    queryFn: async (): Promise<Group> => {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('groups')
        .select('*')
        .eq('id', groupId!)
        .single()

      if (error) throw error
      return data as Group
    },
    enabled: groupId !== null && !isDemoMode,
  })

  if (isDemoMode) {
    const group = DEMO_GROUPS.find((g) => g.id === groupId) ?? null
    return createDemoQueryResult(group)
  }

  return query
}

export function useGroupMembers(groupId: string | null) {
  const isDemoMode = useDemoStore((s) => s.isDemoMode)

  const query = useQuery({
    queryKey: queryKeys.groupMembers(groupId!),
    queryFn: async (): Promise<GroupMemberWithParticipant[]> => {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase
        .from('group_members')
        .select('*, participant:participants(id, name, gender, grade)')
        .eq('group_id', groupId!)

      if (error) throw error
      return (data ?? []) as GroupMemberWithParticipant[]
    },
    enabled: groupId !== null && !isDemoMode,
  })

  if (isDemoMode) {
    const participantMap = new Map(DEMO_PARTICIPANTS.map((p) => [p.id, p]))
    const members: GroupMemberWithParticipant[] = DEMO_GROUP_MEMBERS
      .filter((m) => m.group_id === groupId)
      .map((m) => {
        const p = participantMap.get(m.participant_id ?? '')
        return {
          ...m,
          participant: p
            ? { id: p.id, name: p.name, gender: p.gender, grade: p.grade }
            : null,
        }
      })
    return createDemoQueryResult(members)
  }

  return query
}
