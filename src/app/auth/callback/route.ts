import { NextResponse } from 'next/server'

import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  let next = searchParams.get('next') ?? '/dashboard'
  if (!next.startsWith('/') || next.startsWith('//')) {
    next = '/dashboard'
  }

  if (code) {
    try {
      const supabase = await createServerSupabaseClient()

      const { data, error } = await supabase.auth.exchangeCodeForSession(code)

      if (!error && data.user) {
        // Create profile if not exists
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', data.user.id)
          .single()

        if (!profile) {
          const { error: insertError } = await supabase.from('profiles').insert({
            id: data.user.id,
            name:
              data.user.user_metadata?.full_name ||
              data.user.user_metadata?.name ||
              '사용자',
            role: 'student',
            avatar_url: data.user.user_metadata?.avatar_url,
          })

          if (insertError) {
            return NextResponse.redirect(`${origin}/login?error=profile_creation_failed`)
          }
        }

        return NextResponse.redirect(`${origin}${next}`)
      }
    } catch {
      return NextResponse.redirect(`${origin}/login?error=auth_failed`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}
