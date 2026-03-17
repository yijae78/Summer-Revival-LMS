'use client'

import { useQuery } from '@tanstack/react-query'

import { getSupabaseClient } from '@/lib/supabase/client'
import { isSupabaseConfigured } from '@/lib/supabase/config'
import { queryKeys } from '@/lib/query-keys'
import { useAppModeStore } from '@/stores/appModeStore'
import { DEMO_GROUPS, DEMO_GROUP_MEMBERS, DEMO_PARTICIPANTS } from '@/lib/demo/data'
import { createDemoQueryResult } from '@/lib/demo/hooks'
import { getAll } from '@/lib/local-db'

import type { Group, GroupMember, Participant } from '@/types'

interface GroupWithMemberCount extends Group {
  member_count: number
}

interface GroupMemberWithParticipant extends GroupMember {
  participant: Pick<Participant, 'id' | 'name' | 'gender' | 'grade'> | null
}

function computeMemberCounts(groups: Group[], members: GroupMember[]): GroupWithMemberCount[] {
  const countMap = new Map<string, number>()
  for (const m of members) {
    const gid = m.group_id ?? ''
    countMap.set(gid, (countMap.get(gid) ?? 0) + 1)
  }
  return groups.map((g) => ({
    ...g,
    member_count: countMap.get(g.id) ?? 0,
  }))
}

function filterByDepartment(groups: GroupWithMemberCount[], department?: string): GroupWithMemberCount[] {
  if (!department || department === 'all') return groups
  return groups.filter((g) => !g.department || g.department === department)
}

export function useGroups(eventId: string | null, department?: string) {
  const mode = useAppModeStore((s) => s.mode)

  const query = useQuery({
    queryKey: queryKeys.groups(eventId!, department),
    queryFn: async (): Promise<GroupWithMemberCount[]> => {
      if (mode === 'local') {
        const groups = getAll<Group>('groups').filter((g) => g.event_id === eventId)
        const members = getAll<GroupMember>('group_members')
        return filterByDepartment(computeMemberCounts(groups, members), department)
      }

      const supabase = getSupabaseClient()!
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

      const result = (groups as Group[]).map((g) => ({
        ...g,
        member_count: countMap.get(g.id) ?? 0,
      }))

      return filterByDepartment(result, department)
    },
    enabled: eventId !== null && (mode === 'local' || (mode === 'cloud' && isSupabaseConfigured())),
  })

  if (mode === 'demo') {
    return createDemoQueryResult(
      filterByDepartment(computeMemberCounts(DEMO_GROUPS, DEMO_GROUP_MEMBERS), department)
    )
  }

  return query
}

export function useGroup(groupId: string | null) {
  const mode = useAppModeStore((s) => s.mode)

  const query = useQuery({
    queryKey: queryKeys.group(groupId!),
    queryFn: async (): Promise<Group> => {
      if (mode === 'local') {
        const all = getAll<Group>('groups')
        const found = all.find((g) => g.id === groupId)
        if (!found) throw new Error('Group not found')
        return found
      }

      const supabase = getSupabaseClient()!
      const { data, error } = await supabase
        .from('groups')
        .select('*')
        .eq('id', groupId!)
        .single()

      if (error) throw error
      return data as Group
    },
    enabled: groupId !== null && (mode === 'local' || (mode === 'cloud' && isSupabaseConfigured())),
  })

  if (mode === 'demo') {
    const group = DEMO_GROUPS.find((g) => g.id === groupId) ?? null
    return createDemoQueryResult(group)
  }

  return query
}

export function useGroupMembers(groupId: string | null) {
  const mode = useAppModeStore((s) => s.mode)

  const query = useQuery({
    queryKey: queryKeys.groupMembers(groupId!),
    queryFn: async (): Promise<GroupMemberWithParticipant[]> => {
      if (mode === 'local') {
        const allMembers = getAll<GroupMember>('group_members').filter(
          (m) => m.group_id === groupId
        )
        const allParticipants = getAll<Participant>('participants')
        const participantMap = new Map(allParticipants.map((p) => [p.id, p]))
        return allMembers.map((m) => {
          const p = participantMap.get(m.participant_id ?? '')
          return {
            ...m,
            participant: p
              ? { id: p.id, name: p.name, gender: p.gender, grade: p.grade }
              : null,
          }
        })
      }

      const supabase = getSupabaseClient()!
      const { data, error } = await supabase
        .from('group_members')
        .select('*, participant:participants(id, name, gender, grade)')
        .eq('group_id', groupId!)

      if (error) throw error
      return (data ?? []) as GroupMemberWithParticipant[]
    },
    enabled: groupId !== null && (mode === 'local' || (mode === 'cloud' && isSupabaseConfigured())),
  })

  if (mode === 'demo') {
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
