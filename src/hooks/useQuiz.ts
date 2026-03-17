'use client'

import { useQuery } from '@tanstack/react-query'

import { getSupabaseClient } from '@/lib/supabase/client'
import { isSupabaseConfigured } from '@/lib/supabase/config'
import { queryKeys } from '@/lib/query-keys'
import { useAppModeStore } from '@/stores/appModeStore'
import {
  DEMO_QUIZZES,
  DEMO_QUIZ_QUESTIONS,
  DEMO_QUIZ_RESPONSES,
  DEMO_PARTICIPANTS,
} from '@/lib/demo/data'
import { createDemoQueryResult } from '@/lib/demo/hooks'
import { getAll } from '@/lib/local-db'

import type { Quiz, QuizQuestion, QuizResponse, Participant } from '@/types'

export interface QuizWithQuestionCount extends Quiz {
  questionCount: number
}

export interface QuizWithQuestions extends Quiz {
  questions: QuizQuestion[]
}

export interface QuizResponseWithParticipant extends QuizResponse {
  participant_name: string
}

function filterByDepartment(quizzes: Quiz[], department?: string): Quiz[] {
  if (!department || department === 'all') return quizzes
  return quizzes.filter((q) => !q.department || q.department === department)
}

export function useQuizzes(eventId: string | null, department?: string) {
  const mode = useAppModeStore((s) => s.mode)

  const query = useQuery({
    queryKey: queryKeys.quizzes(eventId!, department),
    queryFn: async (): Promise<QuizWithQuestionCount[]> => {
      if (mode === 'local') {
        let quizzes = getAll<Quiz>('quizzes').filter((q) => q.event_id === eventId)
        quizzes = filterByDepartment(quizzes, department)
        const questions = getAll<QuizQuestion>('quiz_questions')
        return quizzes.map((quiz) => ({
          ...quiz,
          questionCount: questions.filter((q) => q.quiz_id === quiz.id).length,
        }))
      }

      const supabase = getSupabaseClient()!
      const { data, error } = await supabase
        .from('quizzes')
        .select('*, quiz_questions(id)')
        .eq('event_id', eventId!)
        .order('created_at', { ascending: false })

      if (error) throw error

      const quizzes = (data ?? []).map((quiz: Record<string, unknown>) => {
        const questions = quiz.quiz_questions as Array<{ id: string }> | null
        return {
          ...quiz,
          questionCount: questions?.length ?? 0,
        } as QuizWithQuestionCount
      })

      return filterByDepartment(quizzes, department) as QuizWithQuestionCount[]
    },
    enabled: eventId !== null && (mode === 'local' || (mode === 'cloud' && isSupabaseConfigured())),
  })

  if (mode === 'demo') {
    let demoQuizzes = filterByDepartment(DEMO_QUIZZES, department)
    const quizzesWithCount: QuizWithQuestionCount[] = demoQuizzes.map((quiz) => ({
      ...quiz,
      questionCount: DEMO_QUIZ_QUESTIONS.filter((q) => q.quiz_id === quiz.id).length,
    }))
    return createDemoQueryResult(quizzesWithCount)
  }

  return query
}

export function useQuiz(quizId: string | null) {
  const mode = useAppModeStore((s) => s.mode)

  const query = useQuery({
    queryKey: queryKeys.quiz(quizId!),
    queryFn: async (): Promise<QuizWithQuestions> => {
      if (mode === 'local') {
        const quizzes = getAll<Quiz>('quizzes')
        const quiz = quizzes.find((q) => q.id === quizId)
        if (!quiz) throw new Error('Quiz not found')
        const questions = getAll<QuizQuestion>('quiz_questions')
          .filter((q) => q.quiz_id === quizId)
          .sort((a, b) => a.order_index - b.order_index)
        return { ...quiz, questions }
      }

      const supabase = getSupabaseClient()!
      const { data, error } = await supabase
        .from('quizzes')
        .select('*, quiz_questions(*)')
        .eq('id', quizId!)
        .single()

      if (error) throw error

      const questions = (data.quiz_questions as QuizQuestion[] | null) ?? []
      const sorted = [...questions].sort(
        (a, b) => a.order_index - b.order_index
      )

      return {
        ...data,
        questions: sorted,
      } as QuizWithQuestions
    },
    enabled: quizId !== null && (mode === 'local' || (mode === 'cloud' && isSupabaseConfigured())),
  })

  if (mode === 'demo') {
    const quiz = DEMO_QUIZZES.find((q) => q.id === quizId)
    if (!quiz) return createDemoQueryResult(null)

    const questions = DEMO_QUIZ_QUESTIONS
      .filter((q) => q.quiz_id === quizId)
      .sort((a, b) => a.order_index - b.order_index)

    return createDemoQueryResult({
      ...quiz,
      questions,
    } as QuizWithQuestions)
  }

  return query
}

function buildResponsesWithNames(
  responses: QuizResponse[],
  participants: Participant[]
): QuizResponseWithParticipant[] {
  const nameMap = new Map(participants.map((p) => [p.id, p.name]))
  return responses.map((r) => ({
    ...r,
    participant_name: nameMap.get(r.participant_id ?? '') ?? '',
  }))
}

export function useQuizResponses(quizId: string | null) {
  const mode = useAppModeStore((s) => s.mode)

  const query = useQuery({
    queryKey: queryKeys.quizResponses(quizId!),
    queryFn: async (): Promise<QuizResponseWithParticipant[]> => {
      if (mode === 'local') {
        const questions = getAll<QuizQuestion>('quiz_questions')
          .filter((q) => q.quiz_id === quizId)
        const questionIds = questions.map((q) => q.id)
        const responses = getAll<QuizResponse>('quiz_responses')
          .filter((r) => questionIds.includes(r.question_id ?? ''))
        const participants = getAll<Participant>('participants')
        return buildResponsesWithNames(responses, participants)
      }

      const supabase = getSupabaseClient()!

      // First get all questions for this quiz
      const { data: questions, error: questionsError } = await supabase
        .from('quiz_questions')
        .select('id')
        .eq('quiz_id', quizId!)

      if (questionsError) throw questionsError

      const questionIds = (questions ?? []).map(
        (q: { id: string }) => q.id
      )

      if (questionIds.length === 0) return []

      const { data, error } = await supabase
        .from('quiz_responses')
        .select('*, participants(name)')
        .in('question_id', questionIds)
        .order('created_at', { ascending: true })

      if (error) throw error

      const responses = (data ?? []).map(
        (response: Record<string, unknown>) => {
          const participants = response.participants as {
            name: string
          } | null
          return {
            ...response,
            participant_name: participants?.name ?? '',
          } as QuizResponseWithParticipant
        }
      )

      return responses
    },
    enabled: quizId !== null && (mode === 'local' || (mode === 'cloud' && isSupabaseConfigured())),
  })

  if (mode === 'demo') {
    const questionIds = DEMO_QUIZ_QUESTIONS
      .filter((q) => q.quiz_id === quizId)
      .map((q) => q.id)

    const responses = DEMO_QUIZ_RESPONSES
      .filter((r) => questionIds.includes(r.question_id ?? ''))

    return createDemoQueryResult(buildResponsesWithNames(responses, DEMO_PARTICIPANTS))
  }

  return query
}

export function useMyQuizResponses(
  quizId: string | null,
  participantId: string | null
) {
  const mode = useAppModeStore((s) => s.mode)

  const query = useQuery({
    queryKey: ['quizResponses', quizId, participantId],
    queryFn: async (): Promise<QuizResponse[]> => {
      if (mode === 'local') {
        const questions = getAll<QuizQuestion>('quiz_questions')
          .filter((q) => q.quiz_id === quizId)
        const questionIds = questions.map((q) => q.id)
        return getAll<QuizResponse>('quiz_responses')
          .filter(
            (r) =>
              questionIds.includes(r.question_id ?? '') &&
              r.participant_id === participantId
          )
      }

      const supabase = getSupabaseClient()!

      // Get questions for this quiz
      const { data: questions, error: questionsError } = await supabase
        .from('quiz_questions')
        .select('id')
        .eq('quiz_id', quizId!)

      if (questionsError) throw questionsError

      const questionIds = (questions ?? []).map(
        (q: { id: string }) => q.id
      )

      if (questionIds.length === 0) return []

      const { data, error } = await supabase
        .from('quiz_responses')
        .select('*')
        .in('question_id', questionIds)
        .eq('participant_id', participantId!)

      if (error) throw error

      return (data ?? []) as QuizResponse[]
    },
    enabled: quizId !== null && participantId !== null && (mode === 'local' || (mode === 'cloud' && isSupabaseConfigured())),
  })

  if (mode === 'demo') {
    const questionIds = DEMO_QUIZ_QUESTIONS
      .filter((q) => q.quiz_id === quizId)
      .map((q) => q.id)

    const responses = DEMO_QUIZ_RESPONSES.filter(
      (r) =>
        questionIds.includes(r.question_id ?? '') &&
        r.participant_id === participantId
    )
    return createDemoQueryResult(responses)
  }

  return query
}
