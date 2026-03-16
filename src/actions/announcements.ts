'use server'

import { revalidatePath } from 'next/cache'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createAnnouncementSchema } from '@/validators/announcements'

interface ActionResult {
  success?: boolean
  error?: string
}

export async function createAnnouncement(input: {
  eventId: string
  title: string
  content: string
  type: string
  isPinned: boolean
}): Promise<ActionResult> {
  try {
    const parsed = createAnnouncementSchema.safeParse(input)
    if (!parsed.success) {
      return { error: '입력 데이터가 올바르지 않아요.' }
    }

    const supabase = await createServerSupabaseClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: '로그인이 필요해요.' }
    }

    const { error } = await supabase.from('announcements').insert({
      event_id: parsed.data.eventId,
      title: parsed.data.title,
      content: parsed.data.content,
      type: parsed.data.type,
      is_pinned: parsed.data.isPinned,
      author_id: user.id,
    })

    if (error) {
      console.error('createAnnouncement failed:', error)
      return { error: '공지사항 등록에 실패했어요.' }
    }

    revalidatePath('/announcements')
    return { success: true }
  } catch (e) {
    console.error('createAnnouncement failed:', e)
    return { error: '처리 중 오류가 발생했어요.' }
  }
}

export async function deleteAnnouncement(id: string): Promise<ActionResult> {
  try {
    if (!id) {
      return { error: '삭제할 공지사항을 찾을 수 없어요.' }
    }

    const supabase = await createServerSupabaseClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: '로그인이 필요해요.' }
    }

    const { error } = await supabase
      .from('announcements')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('deleteAnnouncement failed:', error)
      return { error: '공지사항 삭제에 실패했어요.' }
    }

    revalidatePath('/announcements')
    return { success: true }
  } catch (e) {
    console.error('deleteAnnouncement failed:', e)
    return { error: '처리 중 오류가 발생했어요.' }
  }
}
