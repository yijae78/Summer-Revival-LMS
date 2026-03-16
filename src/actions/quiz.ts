'use server'

import { revalidatePath } from 'next/cache'

import { createServerSupabaseClient } from '@/lib/supabase/server'

interface ActionResult {
  success?: boolean
  error?: string
  data?: { id: string }
}

export async function createQuiz(input: {
  eventId: string
  title: string
  description?: string
  type: string
  timeLimit?: number
  pointsPerQuestion: number
}): Promise<ActionResult> {
  try {
    const supabase = await createServerSupabaseClient()
    const { data, error } = await supabase
      .from('quizzes')
      .insert({
        event_id: input.eventId,
        title: input.title,
        description: input.description ?? null,
        type: input.type,
        is_active: false,
        time_limit: input.timeLimit ?? null,
        points_per_question: input.pointsPerQuestion,
      })
      .select('id')
      .single()

    if (error) {
      return { error: '퀴즈 만들기에 실패했어요. 다시 시도해 주세요.' }
    }

    revalidatePath('/quiz')
    return { success: true, data: { id: data.id } }
  } catch {
    return { error: '퀴즈 생성 중 문제가 발생했어요.' }
  }
}

export async function addQuestion(input: {
  quizId: string
  question: string
  type: string
  options?: Record<string, unknown>
  correctAnswer: string
  points: number
  orderIndex: number
}): Promise<ActionResult> {
  try {
    const supabase = await createServerSupabaseClient()
    const { data, error } = await supabase
      .from('quiz_questions')
      .insert({
        quiz_id: input.quizId,
        question: input.question,
        type: input.type,
        options: input.options ?? null,
        correct_answer: input.correctAnswer,
        points: input.points,
        order_index: input.orderIndex,
      })
      .select('id')
      .single()

    if (error) {
      return { error: '문제 추가에 실패했어요. 다시 시도해 주세요.' }
    }

    revalidatePath('/quiz')
    return { success: true, data: { id: data.id } }
  } catch {
    return { error: '문제 추가 중 오류가 발생했어요.' }
  }
}

export async function submitAnswer(input: {
  questionId: string
  participantId: string
  answer: string
  isCorrect: boolean
  timeTaken?: number
  pointsEarned: number
}): Promise<ActionResult> {
  try {
    const supabase = await createServerSupabaseClient()
    const { data, error } = await supabase
      .from('quiz_responses')
      .insert({
        question_id: input.questionId,
        participant_id: input.participantId,
        answer: input.answer,
        is_correct: input.isCorrect,
        time_taken: input.timeTaken ?? null,
        points_earned: input.pointsEarned,
      })
      .select('id')
      .single()

    if (error) {
      return { error: '답변 제출에 실패했어요.' }
    }

    revalidatePath('/quiz')
    return { success: true, data: { id: data.id } }
  } catch {
    return { error: '답변 제출 중 문제가 발생했어요.' }
  }
}

export async function toggleQuizActive(
  quizId: string,
  isActive: boolean
): Promise<ActionResult> {
  try {
    const supabase = await createServerSupabaseClient()
    const { error } = await supabase
      .from('quizzes')
      .update({ is_active: isActive })
      .eq('id', quizId)

    if (error) {
      return { error: '퀴즈 상태 변경에 실패했어요.' }
    }

    revalidatePath('/quiz')
    return { success: true }
  } catch {
    return { error: '퀴즈 상태 변경 중 문제가 발생했어요.' }
  }
}

export async function deleteQuiz(quizId: string): Promise<ActionResult> {
  try {
    const supabase = await createServerSupabaseClient()

    // Delete responses for all questions in this quiz
    const { data: questions } = await supabase
      .from('quiz_questions')
      .select('id')
      .eq('quiz_id', quizId)

    if (questions && questions.length > 0) {
      const questionIds = questions.map((q: { id: string }) => q.id)
      await supabase
        .from('quiz_responses')
        .delete()
        .in('question_id', questionIds)
    }

    // Delete questions
    await supabase
      .from('quiz_questions')
      .delete()
      .eq('quiz_id', quizId)

    // Delete quiz
    const { error } = await supabase
      .from('quizzes')
      .delete()
      .eq('id', quizId)

    if (error) {
      return { error: '퀴즈 삭제에 실패했어요.' }
    }

    revalidatePath('/quiz')
    return { success: true }
  } catch {
    return { error: '퀴즈 삭제 중 문제가 발생했어요.' }
  }
}
