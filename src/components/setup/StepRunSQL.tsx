'use client'

import { useState } from 'react'
import { Check, Copy, ExternalLink, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { SCHEMA_SQL } from '@/lib/supabase/schema-sql'
import { getSupabaseClient } from '@/lib/supabase/client'
import { checkSchemaInitialized } from '@/lib/supabase/check-schema'

interface StepRunSQLProps {
  onNext: () => void
  onBack: () => void
  supabaseUrl: string
}

export function StepRunSQL({ onNext, onBack, supabaseUrl }: StepRunSQLProps) {
  const [copied, setCopied] = useState(false)
  const [checking, setChecking] = useState(false)

  async function handleCopySQL() {
    await navigator.clipboard.writeText(SCHEMA_SQL)
    setCopied(true)
    toast.success('SQL이 복사되었어요')
    setTimeout(() => setCopied(false), 2000)
  }

  function getSqlEditorUrl(): string {
    // Extract project ref from Supabase URL
    // e.g., https://abcdefgh.supabase.co -> abcdefgh
    try {
      const url = new URL(supabaseUrl)
      const ref = url.hostname.split('.')[0]
      return `https://supabase.com/dashboard/project/${ref}/sql/new`
    } catch {
      return 'https://supabase.com/dashboard'
    }
  }

  async function handleCheckSchema() {
    setChecking(true)
    try {
      const supabase = getSupabaseClient()
      if (!supabase) {
        toast.error('Supabase 연결 정보가 없어요. 이전 단계를 확인해 주세요.')
        setChecking(false)
        return
      }
      const result = await checkSchemaInitialized(supabase)

      if (result.initialized) {
        toast.success('데이터베이스 설정이 완료되었어요!')
        onNext()
      } else {
        toast.error('SQL이 아직 실행되지 않은 것 같아요. 다시 확인해 주세요.')
      }
    } catch {
      toast.error('확인 중 문제가 발생했어요. 잠시 후 다시 시도해 주세요.')
    } finally {
      setChecking(false)
    }
  }

  return (
    <div>
      <h2 className="text-xl font-bold">데이터베이스 설정</h2>
      <p className="mt-1 text-muted-foreground">
        마지막 단계예요! 아래 SQL을 Supabase에서 실행하면 모든 준비가 완료돼요.
      </p>

      {/* SQL code block */}
      <div className="relative mt-6 rounded-lg border bg-muted/30">
        <div className="flex items-center justify-between border-b px-4 py-2">
          <span className="text-xs font-medium text-muted-foreground">SQL</span>
          <button
            type="button"
            onClick={handleCopySQL}
            className="flex h-8 items-center gap-1.5 rounded-md px-3 text-xs font-medium transition-colors hover:bg-muted"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-primary" />
                복사됨
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                전체 복사
              </>
            )}
          </button>
        </div>
        <pre className="max-h-48 overflow-auto p-4 text-xs leading-relaxed text-muted-foreground">
          <code>{SCHEMA_SQL.slice(0, 500)}...</code>
        </pre>
      </div>

      {/* Steps */}
      <div className="mt-6 space-y-4">
        <div className="flex gap-3">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
            1
          </div>
          <p className="pt-0.5 text-[0.9375rem]">위에서 SQL을 복사하세요</p>
        </div>

        <div className="flex gap-3">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
            2
          </div>
          <div className="pt-0.5">
            <p className="text-[0.9375rem]">SQL Editor를 열어주세요</p>
            <a
              href={getSqlEditorUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              SQL Editor 열기
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
            3
          </div>
          <p className="pt-0.5 text-[0.9375rem]">
            복사한 SQL을 붙여넣고 <strong>Run</strong> 버튼을 누르세요
          </p>
        </div>

        <div className="flex gap-3">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
            4
          </div>
          <p className="pt-0.5 text-[0.9375rem]">
            &quot;Success&quot; 메시지가 나오면 아래 버튼을 눌러주세요
          </p>
        </div>
      </div>

      <div className="mt-8 flex gap-3">
        <Button variant="outline" onClick={onBack} className="h-12 flex-1 text-base">
          이전
        </Button>
        <Button
          onClick={handleCheckSchema}
          disabled={checking}
          className="h-12 flex-1 text-base"
        >
          {checking ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              확인 중...
            </>
          ) : (
            '설정 확인'
          )}
        </Button>
      </div>
    </div>
  )
}
