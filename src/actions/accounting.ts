'use server'

import { revalidatePath } from 'next/cache'

import { createServerSupabaseClient } from '@/lib/supabase/server'

interface ActionResult {
  success?: boolean
  error?: string
}

export async function createExpense(input: {
  eventId: string
  category: string
  amount: number
  description: string
  receiptUrl?: string | null
  paidAt?: string | null
}): Promise<ActionResult> {
  try {
    if (!input.eventId || !input.category || !input.amount || !input.description) {
      return { error: '필수 항목을 모두 입력해 주세요.' }
    }

    if (input.amount <= 0) {
      return { error: '금액은 0보다 커야 해요.' }
    }

    const supabase = await createServerSupabaseClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: '로그인이 필요해요.' }
    }

    const { error } = await supabase.from('expense_records').insert({
      event_id: input.eventId,
      category: input.category,
      amount: input.amount,
      description: input.description,
      receipt_url: input.receiptUrl ?? null,
      paid_by: user.id,
      paid_at: input.paidAt ?? new Date().toISOString(),
    })

    if (error) {
      console.error('createExpense failed:', error)
      return { error: '지출 등록에 실패했어요.' }
    }

    revalidatePath('/accounting')
    return { success: true }
  } catch (e) {
    console.error('createExpense failed:', e)
    return { error: '처리 중 오류가 발생했어요.' }
  }
}

export async function createIncome(input: {
  eventId: string
  participantId?: string | null
  category: string
  amount: number
  description: string
}): Promise<ActionResult> {
  try {
    if (!input.eventId || !input.category || !input.amount || !input.description) {
      return { error: '필수 항목을 모두 입력해 주세요.' }
    }

    if (input.amount <= 0) {
      return { error: '금액은 0보다 커야 해요.' }
    }

    const supabase = await createServerSupabaseClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: '로그인이 필요해요.' }
    }

    const { error } = await supabase.from('income_records').insert({
      event_id: input.eventId,
      participant_id: input.participantId ?? null,
      category: input.category,
      amount: input.amount,
      description: input.description,
      paid_at: new Date().toISOString(),
    })

    if (error) {
      console.error('createIncome failed:', error)
      return { error: '수입 등록에 실패했어요.' }
    }

    revalidatePath('/accounting')
    return { success: true }
  } catch (e) {
    console.error('createIncome failed:', e)
    return { error: '처리 중 오류가 발생했어요.' }
  }
}

export async function deleteExpense(id: string): Promise<ActionResult> {
  try {
    if (!id) {
      return { error: '삭제할 지출 기록을 찾을 수 없어요.' }
    }

    const supabase = await createServerSupabaseClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: '로그인이 필요해요.' }
    }

    const { error } = await supabase
      .from('expense_records')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('deleteExpense failed:', error)
      return { error: '지출 삭제에 실패했어요.' }
    }

    revalidatePath('/accounting')
    return { success: true }
  } catch (e) {
    console.error('deleteExpense failed:', e)
    return { error: '처리 중 오류가 발생했어요.' }
  }
}

export async function deleteIncome(id: string): Promise<ActionResult> {
  try {
    if (!id) {
      return { error: '삭제할 수입 기록을 찾을 수 없어요.' }
    }

    const supabase = await createServerSupabaseClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: '로그인이 필요해요.' }
    }

    const { error } = await supabase
      .from('income_records')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('deleteIncome failed:', error)
      return { error: '수입 삭제에 실패했어요.' }
    }

    revalidatePath('/accounting')
    return { success: true }
  } catch (e) {
    console.error('deleteIncome failed:', e)
    return { error: '처리 중 오류가 발생했어요.' }
  }
}
