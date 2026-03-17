'use client'

import { useState } from 'react'

import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Scale,
  Receipt,
  ArrowUpRight,
  ArrowDownRight,
  FileText,
  Plus,
  Banknote,
} from 'lucide-react'
import { motion } from 'framer-motion'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PageHeader } from '@/components/shared/PageHeader'
import { RoleGuard } from '@/components/shared/RoleGuard'
import { AccountingGate } from '@/components/shared/AccountingGate'
import { EmptyState } from '@/components/shared/EmptyState'
import { DepartmentFilter } from '@/components/shared/DepartmentFilter'

import { useAccounting } from '@/hooks/useAccounting'
import { useUser } from '@/hooks/useUser'
import { useEventStore } from '@/stores/eventStore'
import { useDepartmentFilterStore } from '@/stores/departmentFilterStore'
import { useViewportStore } from '@/stores/viewportStore'
import { getDepartmentByKey } from '@/constants/departments'
import { cn } from '@/lib/utils'

import type { IncomeRecord, ExpenseRecord, ExpenseCategory } from '@/types'

const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } }

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ko-KR').format(amount) + '원'
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}.${m}.${day}`
}

const INCOME_CATEGORY_LABELS: Record<string, { label: string; color: string }> = {
  registration_fee: { label: '참가비', color: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/20' },
  donation: { label: '헌금', color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' },
  sponsorship: { label: '후원', color: 'bg-purple-500/15 text-purple-400 border-purple-500/20' },
  other: { label: '기타', color: 'bg-slate-500/15 text-slate-400 border-slate-500/20' },
}

const EXPENSE_CATEGORY_LABELS: Record<string, { label: string; color: string }> = {
  food: { label: '식비', color: 'bg-orange-500/15 text-orange-400 border-orange-500/20' },
  accommodation: { label: '숙박', color: 'bg-blue-500/15 text-blue-400 border-blue-500/20' },
  transportation: { label: '교통', color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' },
  materials: { label: '자료', color: 'bg-purple-500/15 text-purple-400 border-purple-500/20' },
  equipment: { label: '장비', color: 'bg-slate-500/15 text-slate-400 border-slate-500/20' },
  insurance: { label: '보험', color: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/20' },
  venue: { label: '시설', color: 'bg-amber-500/15 text-amber-400 border-amber-500/20' },
  other: { label: '기타', color: 'bg-gray-500/15 text-gray-400 border-gray-500/20' },
}

// Map expense category to budget category name for matching
const EXPENSE_TO_BUDGET_MAP: Record<string, string> = {
  food: '식비',
  accommodation: '숙박',
  transportation: '교통',
  materials: '자료/교재',
  equipment: '기타',
  insurance: '보험',
  venue: '기타',
  other: '기타',
}

interface SummaryCardProps {
  label: string
  amount: number
  icon: React.ElementType
  gradientFrom: string
  gradientTo: string
  iconBg: string
  delay?: number
  isMobile?: boolean
}

function SummaryCard({ label, amount, icon: Icon, gradientFrom, gradientTo, iconBg, delay = 0, isMobile }: SummaryCardProps) {
  return (
    <motion.div
      variants={fadeUp}
      transition={{ delay }}
      className={cn(
        'relative overflow-hidden rounded-2xl border border-white/[0.08]',
        'bg-gradient-to-br backdrop-blur-xl',
        isMobile ? 'p-3' : 'p-5',
        gradientFrom,
        gradientTo
      )}
    >
      <div className="flex items-start justify-between">
        <div className={cn(isMobile ? 'space-y-1' : 'space-y-2')}>
          <p className={cn('font-medium text-muted-foreground', isMobile ? 'text-xs' : 'text-sm')}>{label}</p>
          <p className={cn('font-bold tracking-tight text-foreground', isMobile ? 'text-lg' : 'text-2xl')} style={{ fontVariantNumeric: 'tabular-nums' }}>
            {formatCurrency(amount)}
          </p>
        </div>
        <div className={cn('flex shrink-0 items-center justify-center rounded-xl', iconBg, isMobile ? 'h-9 w-9' : 'h-11 w-11')}>
          <Icon className={cn('text-white', isMobile ? 'h-4 w-4' : 'h-5 w-5')} />
        </div>
      </div>
    </motion.div>
  )
}

function BudgetBreakdown({
  budgetCategories,
  expenseRecords,
  isMobile,
}: {
  budgetCategories: { name: string; planned_amount: number }[]
  expenseRecords: ExpenseRecord[]
  isMobile?: boolean
}) {
  // Compute spent per budget category
  const spentByCategory: Record<string, number> = {}
  for (const exp of expenseRecords) {
    const budgetName = EXPENSE_TO_BUDGET_MAP[exp.category] ?? '기타'
    spentByCategory[budgetName] = (spentByCategory[budgetName] ?? 0) + exp.amount
  }

  return (
    <motion.div
      variants={fadeUp}
      className={cn('rounded-2xl border border-white/[0.08] bg-white/[0.04] backdrop-blur-xl', isMobile ? 'p-3' : 'p-5')}
    >
      <h3 className={cn('font-semibold text-foreground', isMobile ? 'mb-3 text-sm' : 'mb-4 text-base')}>예산 항목별 현황</h3>
      <div className={cn(isMobile ? 'space-y-3' : 'space-y-4')}>
        {budgetCategories.map((cat) => {
          const spent = spentByCategory[cat.name] ?? 0
          const remaining = cat.planned_amount - spent
          const usage = cat.planned_amount > 0 ? (spent / cat.planned_amount) * 100 : 0
          const barColor = usage > 100 ? 'bg-red-500' : usage >= 80 ? 'bg-amber-500' : 'bg-emerald-500'

          return (
            <div key={cat.name} className="space-y-2">
              <div className={cn('text-muted-foreground', isMobile ? 'space-y-1 text-xs' : 'flex items-center justify-between text-sm')}>
                <span className="font-medium text-foreground">{cat.name}</span>
                <div className={cn('flex text-muted-foreground', isMobile ? 'gap-2 text-xs' : 'gap-4')} style={{ fontVariantNumeric: 'tabular-nums' }}>
                  <span>계획 {formatCurrency(cat.planned_amount)}</span>
                  <span>사용 {formatCurrency(spent)}</span>
                  <span className={cn(remaining < 0 ? 'text-red-400' : 'text-emerald-400')}>
                    잔여 {formatCurrency(remaining)}
                  </span>
                </div>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
                <div
                  className={cn('h-full rounded-full transition-all duration-500', barColor)}
                  style={{ width: `${Math.min(usage, 100)}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </motion.div>
  )
}

function IncomeList({ records, isMobile }: { records: IncomeRecord[]; isMobile?: boolean }) {
  if (records.length === 0) {
    return (
      <EmptyState
        icon={ArrowUpRight}
        title="수입 기록이 없어요"
        description="참가비, 헌금, 후원 등의 수입이 기록되면 여기에 표시돼요"
      />
    )
  }

  const total = records.reduce((sum, r) => sum + r.amount, 0)

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="space-y-3"
    >
      {records.map((record) => {
        const catInfo = INCOME_CATEGORY_LABELS[record.category] ?? INCOME_CATEGORY_LABELS.other
        return (
          <motion.div
            key={record.id}
            variants={fadeUp}
            className={cn(
              'flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02]',
              isMobile ? 'px-3 py-2.5' : 'px-4 py-3',
              'transition-all duration-300 hover:border-primary/15 hover:bg-white/[0.04]'
            )}
          >
            <div className={cn('flex items-center', isMobile ? 'gap-2' : 'gap-3')}>
              <div className={cn('flex items-center justify-center rounded-xl bg-emerald-500/10', isMobile ? 'h-8 w-8' : 'h-10 w-10')}>
                <ArrowUpRight className={cn('text-emerald-400', isMobile ? 'h-4 w-4' : 'h-5 w-5')} />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{record.description}</p>
                <div className="mt-0.5 flex items-center gap-2">
                  <span className={cn('inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold', catInfo.color)}>
                    {catInfo.label}
                  </span>
                  <span className="text-xs text-muted-foreground">{formatDate(record.paid_at)}</span>
                </div>
              </div>
            </div>
            <span className="text-sm font-semibold text-emerald-400" style={{ fontVariantNumeric: 'tabular-nums' }}>
              +{formatCurrency(record.amount)}
            </span>
          </motion.div>
        )
      })}

      <div className={cn('flex items-center justify-between rounded-xl border border-emerald-500/20 bg-emerald-500/5', isMobile ? 'px-3 py-2.5' : 'px-4 py-3')}>
        <span className={cn('font-semibold text-foreground', isMobile ? 'text-xs' : 'text-sm')}>총 수입</span>
        <span className={cn('font-bold text-emerald-400', isMobile ? 'text-sm' : 'text-base')} style={{ fontVariantNumeric: 'tabular-nums' }}>
          {formatCurrency(total)}
        </span>
      </div>
    </motion.div>
  )
}

function ExpenseList({ records, isMobile }: { records: ExpenseRecord[]; isMobile?: boolean }) {
  if (records.length === 0) {
    return (
      <EmptyState
        icon={ArrowDownRight}
        title="지출 기록이 없어요"
        description="지출이 발생하면 여기에 기록돼요"
      />
    )
  }

  const total = records.reduce((sum, r) => sum + r.amount, 0)

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="space-y-3"
    >
      {records.map((record) => {
        const catInfo = EXPENSE_CATEGORY_LABELS[record.category] ?? EXPENSE_CATEGORY_LABELS.other
        return (
          <motion.div
            key={record.id}
            variants={fadeUp}
            className={cn(
              'flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02]',
              isMobile ? 'px-3 py-2.5' : 'px-4 py-3',
              'transition-all duration-300 hover:border-primary/15 hover:bg-white/[0.04]'
            )}
          >
            <div className={cn('flex items-center', isMobile ? 'gap-2' : 'gap-3')}>
              <div className={cn('flex items-center justify-center rounded-xl bg-rose-500/10', isMobile ? 'h-8 w-8' : 'h-10 w-10')}>
                <ArrowDownRight className={cn('text-rose-400', isMobile ? 'h-4 w-4' : 'h-5 w-5')} />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{record.description}</p>
                <div className="mt-0.5 flex items-center gap-2">
                  <span className={cn('inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold', catInfo.color)}>
                    {catInfo.label}
                  </span>
                  <span className="text-xs text-muted-foreground">{formatDate(record.paid_at)}</span>
                  {record.receipt_url && (
                    <Receipt className="h-3.5 w-3.5 text-muted-foreground" aria-label="영수증 첨부됨" />
                  )}
                </div>
              </div>
            </div>
            <span className="text-sm font-semibold text-rose-400" style={{ fontVariantNumeric: 'tabular-nums' }}>
              -{formatCurrency(record.amount)}
            </span>
          </motion.div>
        )
      })}

      <div className={cn('flex items-center justify-between rounded-xl border border-rose-500/20 bg-rose-500/5', isMobile ? 'px-3 py-2.5' : 'px-4 py-3')}>
        <span className={cn('font-semibold text-foreground', isMobile ? 'text-xs' : 'text-sm')}>총 지출</span>
        <span className={cn('font-bold text-rose-400', isMobile ? 'text-sm' : 'text-base')} style={{ fontVariantNumeric: 'tabular-nums' }}>
          {formatCurrency(total)}
        </span>
      </div>
    </motion.div>
  )
}

function AddExpenseDialog({ eventId }: { eventId: string }) {
  const [open, setOpen] = useState(false)
  const [category, setCategory] = useState<ExpenseCategory | ''>('')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [isPending, setIsPending] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!category || !amount || !description) return

    setIsPending(true)
    try {
      const { createExpense } = await import('@/actions/accounting')
      const result = await createExpense({
        eventId,
        category,
        amount: Number(amount),
        description,
      })
      if (result.success) {
        setOpen(false)
        setCategory('')
        setAmount('')
        setDescription('')
      }
    } finally {
      setIsPending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className={cn(
            'min-h-[48px] gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600',
            'text-white shadow-lg transition-all duration-300',
            'hover:from-rose-400 hover:to-rose-500 hover:shadow-[0_0_20px_rgba(244,63,94,0.2)]',
            'active:scale-[0.97]'
          )}
        >
          <Plus className="h-4 w-4" />
          지출 등록
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-2xl border border-white/[0.08] bg-[#151823] shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-foreground">지출 등록</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="expense-category" className="text-sm font-medium text-foreground">카테고리</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as ExpenseCategory)}>
              <SelectTrigger
                id="expense-category"
                className="min-h-[48px] rounded-xl border-white/[0.08] bg-white/[0.03]"
              >
                <SelectValue placeholder="카테고리를 선택해 주세요" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(EXPENSE_CATEGORY_LABELS).map(([key, val]) => (
                  <SelectItem key={key} value={key}>{val.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="expense-amount" className="text-sm font-medium text-foreground">금액 (원)</Label>
            <Input
              id="expense-amount"
              type="number"
              inputMode="numeric"
              placeholder="50000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="min-h-[48px] rounded-xl border-white/[0.08] bg-white/[0.03]"
              min={1}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="expense-desc" className="text-sm font-medium text-foreground">내용</Label>
            <Input
              id="expense-desc"
              type="text"
              placeholder="지출 내용을 입력해 주세요"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[48px] rounded-xl border-white/[0.08] bg-white/[0.03]"
              required
            />
          </div>
          <Button
            type="submit"
            disabled={isPending || !category || !amount || !description}
            className={cn(
              'min-h-[48px] w-full rounded-xl bg-gradient-to-r from-rose-500 to-rose-600',
              'text-white font-semibold transition-all duration-300',
              'hover:from-rose-400 hover:to-rose-500',
              'disabled:opacity-50'
            )}
          >
            {isPending ? '등록 중...' : '등록하기'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function AccountingContent() {
  const viewport = useViewportStore((s) => s.viewport)
  const isMobile = viewport === 'mobile' || viewport === 'tablet'
  const eventId = useEventStore((s) => s.currentEventId)
  const { data: user } = useUser()
  const globalDept = useDepartmentFilterStore((s) => s.department)

  // Staff: locked to their department. Admin: can switch freely.
  const isStaff = user?.role === 'staff'
  const staffDepartment = (user as unknown as Record<string, unknown>)?.department as string | undefined
  const department = isStaff && staffDepartment ? staffDepartment : globalDept

  const {
    budgetCategories,
    incomeRecords,
    expenseRecords,
    summary,
    isLoading,
  } = useAccounting(eventId, department)

  if (isLoading) {
    return (
      <div className="flex min-h-[40dvh] items-center justify-center">
        <div className="space-y-3 text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
          <p className="text-sm text-muted-foreground">회계 정보를 불러오고 있어요...</p>
        </div>
      </div>
    )
  }

  const hasData = budgetCategories.length > 0 || incomeRecords.length > 0 || expenseRecords.length > 0

  if (!hasData && !eventId) {
    return (
      <EmptyState
        icon={Banknote}
        title="행사를 먼저 선택해 주세요"
        description="대시보드에서 행사를 선택하면 회계 정보가 표시돼요"
      />
    )
  }

  return (
    <motion.div
      className="space-y-5"
      variants={stagger}
      initial="hidden"
      animate="show"
    >
      {/* Summary Cards */}
      <div className={cn('grid', isMobile ? 'grid-cols-2 gap-2' : 'grid-cols-4 gap-3')}>
        <SummaryCard
          label="총예산"
          amount={summary.totalBudget}
          icon={Wallet}
          gradientFrom="from-indigo-500/10"
          gradientTo="to-indigo-600/5"
          iconBg="bg-gradient-to-br from-indigo-500 to-indigo-600"
          isMobile={isMobile}
        />
        <SummaryCard
          label="총수입"
          amount={summary.totalIncome}
          icon={TrendingUp}
          gradientFrom="from-emerald-500/10"
          gradientTo="to-emerald-600/5"
          iconBg="bg-gradient-to-br from-emerald-500 to-emerald-600"
          delay={0.05}
          isMobile={isMobile}
        />
        <SummaryCard
          label="총지출"
          amount={summary.totalExpense}
          icon={TrendingDown}
          gradientFrom="from-rose-500/10"
          gradientTo="to-rose-600/5"
          iconBg="bg-gradient-to-br from-rose-500 to-rose-600"
          delay={0.1}
          isMobile={isMobile}
        />
        <SummaryCard
          label="잔액"
          amount={summary.balance}
          icon={Scale}
          gradientFrom="from-amber-500/10"
          gradientTo="to-amber-600/5"
          iconBg="bg-gradient-to-br from-amber-500 to-amber-600"
          delay={0.15}
          isMobile={isMobile}
        />
      </div>

      {/* Tabs: Summary / Income / Expense */}
      <motion.div variants={fadeUp}>
        <Tabs defaultValue="summary" className="w-full">
          <TabsList className={cn('mb-4 grid w-full grid-cols-3 rounded-xl border border-white/[0.08] bg-white/[0.04] backdrop-blur-md', isMobile ? 'p-0.5' : 'p-1')}>
            <TabsTrigger
              value="summary"
              className={cn('rounded-lg font-medium data-[state=active]:bg-white/[0.08] data-[state=active]:text-foreground', isMobile ? 'min-h-[36px] text-xs' : 'min-h-[40px] text-sm')}
            >
              <FileText className={cn(isMobile ? 'mr-1 h-3.5 w-3.5' : 'mr-1.5 h-4 w-4')} />
              요약
            </TabsTrigger>
            <TabsTrigger
              value="income"
              className={cn('rounded-lg font-medium data-[state=active]:bg-white/[0.08] data-[state=active]:text-foreground', isMobile ? 'min-h-[36px] text-xs' : 'min-h-[40px] text-sm')}
            >
              <ArrowUpRight className={cn(isMobile ? 'mr-1 h-3.5 w-3.5' : 'mr-1.5 h-4 w-4')} />
              수입
            </TabsTrigger>
            <TabsTrigger
              value="expense"
              className={cn('rounded-lg font-medium data-[state=active]:bg-white/[0.08] data-[state=active]:text-foreground', isMobile ? 'min-h-[36px] text-xs' : 'min-h-[40px] text-sm')}
            >
              <ArrowDownRight className={cn(isMobile ? 'mr-1 h-3.5 w-3.5' : 'mr-1.5 h-4 w-4')} />
              지출
            </TabsTrigger>
          </TabsList>

          <TabsContent value="summary">
            {budgetCategories.length > 0 ? (
              <BudgetBreakdown
                budgetCategories={budgetCategories}
                expenseRecords={expenseRecords}
                isMobile={isMobile}
              />
            ) : (
              <EmptyState
                icon={FileText}
                title="예산 항목이 없어요"
                description="예산 카테고리를 등록하면 항목별 현황이 표시돼요"
              />
            )}
          </TabsContent>

          <TabsContent value="income">
            <IncomeList records={incomeRecords} isMobile={isMobile} />
          </TabsContent>

          <TabsContent value="expense">
            <div className="space-y-4">
              {eventId && (
                <div className="flex justify-end">
                  <AddExpenseDialog eventId={eventId} />
                </div>
              )}
              <ExpenseList records={expenseRecords} isMobile={isMobile} />
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  )
}

function AccountingDepartmentSection() {
  const { data: user } = useUser()
  const isStaff = user?.role === 'staff'
  const staffDepartment = (user as unknown as Record<string, unknown>)?.department as string | undefined

  if (isStaff && staffDepartment) {
    const dept = getDepartmentByKey(staffDepartment)
    return (
      <div className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2.5">
        <span className="text-sm">{dept?.emoji}</span>
        <span className="text-sm font-semibold text-foreground">{dept?.label ?? staffDepartment} 회계</span>
        <span className="text-xs text-muted-foreground/60">내 부서 회계만 표시돼요</span>
      </div>
    )
  }

  return <DepartmentFilter />
}

export default function AccountingPage() {
  return (
    <RoleGuard allowedRoles={['admin', 'staff']}>
      <AccountingGate>
        <div className="space-y-5">
          <PageHeader
            backHref="/dashboard"
            title="회계 관리"
            description="예산과 수입/지출을 관리해요"
          />
          <AccountingDepartmentSection />
          <AccountingContent />
        </div>
      </AccountingGate>
    </RoleGuard>
  )
}
