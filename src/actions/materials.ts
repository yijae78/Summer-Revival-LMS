'use server'

import { revalidatePath } from 'next/cache'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createMaterialSchema } from '@/validators/materials'

interface ActionResult {
  success?: boolean
  error?: string
}

export async function createMaterial(input: {
  eventId: string
  title: string
  category: string
  fileUrl: string
  fileType: string | null
  fileSize: number | null
  dayNumber: number | null
}): Promise<ActionResult> {
  try {
    const parsed = createMaterialSchema.safeParse(input)
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

    const { error } = await supabase.from('materials').insert({
      event_id: parsed.data.eventId,
      title: parsed.data.title,
      category: parsed.data.category,
      file_url: parsed.data.fileUrl,
      file_type: parsed.data.fileType,
      file_size: parsed.data.fileSize,
      day_number: parsed.data.dayNumber,
      uploaded_by: user.id,
    })

    if (error) {
      return { error: '자료 등록에 실패했어요.' }
    }

    revalidatePath('/materials')
    return { success: true }
  } catch (e) {
    return { error: '처리 중 오류가 발생했어요.' }
  }
}

export async function deleteMaterial(id: string): Promise<ActionResult> {
  try {
    if (!id) {
      return { error: '삭제할 자료를 찾을 수 없어요.' }
    }

    const supabase = await createServerSupabaseClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: '로그인이 필요해요.' }
    }

    const { error } = await supabase
      .from('materials')
      .delete()
      .eq('id', id)

    if (error) {
      return { error: '자료 삭제에 실패했어요.' }
    }

    revalidatePath('/materials')
    return { success: true }
  } catch (e) {
    return { error: '처리 중 오류가 발생했어요.' }
  }
}
