'use client'

import { useQuery } from '@tanstack/react-query'

import { getSupabaseClient } from '@/lib/supabase/client'
import { isSupabaseConfigured } from '@/lib/supabase/config'
import { queryKeys } from '@/lib/query-keys'
import { useAppModeStore } from '@/stores/appModeStore'
import {
  DEMO_BUDGET_CATEGORIES,
  DEMO_INCOME_RECORDS,
  DEMO_EXPENSE_RECORDS,
} from '@/lib/demo/data'
import { createDemoQueryResult } from '@/lib/demo/hooks'
import { getAll } from '@/lib/local-db'

import type { BudgetCategory, IncomeRecord, ExpenseRecord } from '@/types'

interface AccountingSummary {
  totalBudget: number
  totalIncome: number
  totalExpense: number
  balance: number
}

interface AccountingData {
  budgetCategories: BudgetCategory[]
  incomeRecords: IncomeRecord[]
  expenseRecords: ExpenseRecord[]
  summary: AccountingSummary
}

function computeSummary(
  budgetCategories: BudgetCategory[],
  incomeRecords: IncomeRecord[],
  expenseRecords: ExpenseRecord[]
): AccountingSummary {
  const totalBudget = budgetCategories.reduce((sum, cat) => sum + cat.planned_amount, 0)
  const totalIncome = incomeRecords.reduce((sum, rec) => sum + rec.amount, 0)
  const totalExpense = expenseRecords.reduce((sum, rec) => sum + rec.amount, 0)
  const balance = totalIncome - totalExpense
  return { totalBudget, totalIncome, totalExpense, balance }
}

export function useAccounting(eventId: string | null) {
  const mode = useAppModeStore((s) => s.mode)

  const query = useQuery({
    queryKey: queryKeys.accounting(eventId!),
    queryFn: async (): Promise<AccountingData> => {
      if (mode === 'local') {
        const budgetCategories = getAll<BudgetCategory>('budget_categories').filter(
          (c) => c.event_id === eventId
        )
        const incomeRecords = getAll<IncomeRecord>('income_records').filter(
          (r) => r.event_id === eventId
        )
        const expenseRecords = getAll<ExpenseRecord>('expense_records').filter(
          (r) => r.event_id === eventId
        )
        return {
          budgetCategories,
          incomeRecords,
          expenseRecords,
          summary: computeSummary(budgetCategories, incomeRecords, expenseRecords),
        }
      }

      const supabase = getSupabaseClient()!

      const [budgetRes, incomeRes, expenseRes] = await Promise.all([
        supabase
          .from('budget_categories')
          .select('*')
          .eq('event_id', eventId!)
          .order('created_at', { ascending: true }),
        supabase
          .from('income_records')
          .select('*')
          .eq('event_id', eventId!)
          .order('paid_at', { ascending: false }),
        supabase
          .from('expense_records')
          .select('*')
          .eq('event_id', eventId!)
          .order('paid_at', { ascending: false }),
      ])

      if (budgetRes.error) throw budgetRes.error
      if (incomeRes.error) throw incomeRes.error
      if (expenseRes.error) throw expenseRes.error

      const budgetCategories = (budgetRes.data ?? []) as BudgetCategory[]
      const incomeRecords = (incomeRes.data ?? []) as IncomeRecord[]
      const expenseRecords = (expenseRes.data ?? []) as ExpenseRecord[]

      return {
        budgetCategories,
        incomeRecords,
        expenseRecords,
        summary: computeSummary(budgetCategories, incomeRecords, expenseRecords),
      }
    },
    enabled: eventId !== null && (mode === 'local' || (mode === 'cloud' && isSupabaseConfigured())),
  })

  if (mode === 'demo') {
    const budgetCategories = DEMO_BUDGET_CATEGORIES
    const incomeRecords = DEMO_INCOME_RECORDS
    const expenseRecords = DEMO_EXPENSE_RECORDS
    const summary = computeSummary(budgetCategories, incomeRecords, expenseRecords)

    return {
      ...createDemoQueryResult({
        budgetCategories,
        incomeRecords,
        expenseRecords,
        summary,
      }),
      budgetCategories,
      incomeRecords,
      expenseRecords,
      summary,
      isLoading: false,
    }
  }

  return {
    ...query,
    budgetCategories: query.data?.budgetCategories ?? [],
    incomeRecords: query.data?.incomeRecords ?? [],
    expenseRecords: query.data?.expenseRecords ?? [],
    summary: query.data?.summary ?? { totalBudget: 0, totalIncome: 0, totalExpense: 0, balance: 0 },
    isLoading: query.isLoading,
  }
}
