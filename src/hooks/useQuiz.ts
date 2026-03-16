'use client'

import { useQuery } from '@tanstack/react-query'

import { getSupabaseClient } from '@/lib/supabase/client'
import { queryKeys } from '@/lib/query-keys'

import type { Quiz, QuizQuestion, QuizResponse } from '@/types'

export interface QuizWithQuestionCount extends Quiz {
  questionCount: number
}

export interface QuizWithQuestions extends Quiz {
  questions: QuizQuestion[]
}

export interface QuizResponseWithParticipant extends QuizResponse {
  participant_name: string
}

export function useQuizzes(eventId: string | null) {
  return useQuery({
    queryKey: queryKeys.quizzes(eventId!),
    queryFn: async (): Promise<QuizWithQuestionCount[]> => {
      const supabase = getSupabaseClient()
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

      return quizzes
    },
    enabled: eventId !== null,
  })
}

export function useQuiz(quizId: string | null) {
  return useQuery({
    queryKey: queryKeys.quiz(quizId!),
    queryFn: async (): Promise<QuizWithQuestions> => {
      const supabase = getSupabaseClient()
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
    enabled: quizId !== null,
  })
}

export function useQuizResponses(quizId: string | null) {
  return useQuery({
    queryKey: queryKeys.quizResponses(quizId!),
    queryFn: async (): Promise<QuizResponseWithParticipant[]> => {
      const supabase = getSupabaseClient()

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
    enabled: quizId !== null,
  })
}

export function useMyQuizResponses(
  quizId: string | null,
  participantId: string | null
) {
  return useQuery({
    queryKey: ['quizResponses', quizId, participantId],
    queryFn: async (): Promise<QuizResponse[]> => {
      const supabase = getSupabaseClient()

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
    enabled: quizId !== null && participantId !== null,
  })
}
