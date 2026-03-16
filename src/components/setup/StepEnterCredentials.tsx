'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { saveSupabaseConfig } from '@/lib/supabase/config'
import { resetSupabaseClient } from '@/lib/supabase/client'

interface StepEnterCredentialsProps {
  onNext: () => void
  onBack: () => void
  onUrlSet: (url: string) => void
}

export function StepEnterCredentials({
  onNext,
  onBack,
  onUrlSet,
}: StepEnterCredentialsProps) {
  const [url, setUrl] = useState('')
  const [anonKey, setAnonKey] = useState('')
  const [testing, setTesting] = useState(false)

  async function handleTest() {
    if (!url.trim() || !anonKey.trim()) {
      toast.error('URL과 Key를 모두 입력해 주세요')
      return
    }

    // Basic URL validation
    if (!url.startsWith('https://') || !url.includes('.supabase.co')) {
      toast.error('올바른 Supabase URL을 입력해 주세요')
      return
    }

    setTesting(true)
    try {
      const supabase = createClient(url.trim(), anonKey.trim())
      // Try a simple query to test connection
      const { error } = await supabase.from('_app_meta').select('key').limit(1)

      // Connection works even if table doesn't exist yet (schema not applied)
      // 42P01 = table does not exist, which means connection is fine
      if (error && !error.message.includes('does not exist') && error.code !== '42P01') {
        toast.error('연결에 실패했어요. URL과 키를 다시 확인해 주세요.')
        return
      }

      // Save config to localStorage (client-side access)
      saveSupabaseConfig({ url: url.trim(), anonKey: anonKey.trim() })
      // Save config to cookies (server-side access for BYOS)
      document.cookie = `sb-url=${encodeURIComponent(url.trim())}; path=/; max-age=31536000; SameSite=Lax`
      document.cookie = `sb-anon-key=${encodeURIComponent(anonKey.trim())}; path=/; max-age=31536000; SameSite=Lax`
      resetSupabaseClient()
      onUrlSet(url.trim())
      toast.success('연결에 성공했어요!')
      onNext()
    } catch {
      toast.error('연결에 실패했어요. URL과 키를 다시 확인해 주세요.')
    } finally {
      setTesting(false)
    }
  }

  return (
    <div>
      <h2 className="text-xl font-bold">연결 정보 입력</h2>
      <p className="mt-1 text-muted-foreground">
        Supabase 프로젝트의 URL과 Key를 복사해서 붙여넣어 주세요.
      </p>

      <div className="mt-4 space-y-4">
        <div className="flex gap-3">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
            1
          </div>
          <p className="pt-0.5 text-[0.9375rem]">
            Supabase Dashboard 좌측에서 ⚙️ Project Settings를 클릭하세요
          </p>
        </div>
        <div className="flex gap-3">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
            2
          </div>
          <p className="pt-0.5 text-[0.9375rem]">
            상단 &quot;API&quot; 탭을 클릭하세요
          </p>
        </div>
        <div className="flex gap-3">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
            3
          </div>
          <p className="pt-0.5 text-[0.9375rem]">
            아래 두 값을 복사해서 붙여넣으세요
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="supabase-url" className="text-base">
            Project URL
          </Label>
          <Input
            id="supabase-url"
            type="url"
            inputMode="url"
            placeholder="https://xxx.supabase.co"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="h-12 text-base"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="supabase-key" className="text-base">
            anon public key
          </Label>
          <Input
            id="supabase-key"
            type="text"
            placeholder="eyJhbGciOi..."
            value={anonKey}
            onChange={(e) => setAnonKey(e.target.value)}
            className="h-12 font-mono text-sm"
          />
        </div>
      </div>

      <div className="mt-8 flex gap-3">
        <Button variant="outline" onClick={onBack} className="h-12 flex-1 text-base">
          이전
        </Button>
        <Button
          onClick={handleTest}
          disabled={testing || !url.trim() || !anonKey.trim()}
          className="h-12 flex-1 text-base"
        >
          {testing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              연결 확인 중...
            </>
          ) : (
            '연결 확인'
          )}
        </Button>
      </div>
    </div>
  )
}
