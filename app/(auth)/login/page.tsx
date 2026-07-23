'use client';

// Metadata is exported from app/(auth)/login/layout.tsx

import { useState, Suspense } from 'react';

import Link from 'next/link';

import { useRouter, useSearchParams } from 'next/navigation';

import { createBrowserSupabaseClient } from '@/lib/supabase/client';

import { safeRedirect } from '@/lib/utils';


 

function LoginForm() {

  const router       = useRouter();

  const searchParams = useSearchParams();

  const redirect     = safeRedirect(searchParams.get('redirect'));


 

  const [email,    setEmail]    = useState('');

  const [password, setPassword] = useState('');

  const [showPass, setShowPass] = useState(false);

  const [loading,  setLoading]  = useState(false);

  const [error,    setError]    = useState<string | null>(null);


 

  async function handleSubmit(e: React.FormEvent) {

    e.preventDefault();

    setLoading(true);

    setError(null);


 

    const supabase = createBrowserSupabaseClient();

    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });


 

    if (authError) {

      setError(authError.message);

      setLoading(false);

      return;

    }


 

    // Hard redirect: ensures the new auth cookie is sent with the next request

    // and avoids the router.push + router.refresh() race condition.

    window.location.href = redirect;

  }


 

  return (

    <form onSubmit={handleSubmit} className="flex flex-col gap-5">

      <div className="flex flex-col gap-1.5">

        <label className="text-[12px] font-medium" style={{ color: 'rgba(246,242,233,.6)' }}>Email</label>

        <input

          type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email"

          className="rounded-[12px] px-4 py-3 text-[14px]"

          style={{ background: 'rgba(246,242,233,.06)', border: '1px solid rgba(246,242,233,.12)', color: '#F6F2E9', outline: 'none' }}

        />

      </div>

      <div className="flex flex-col gap-1.5">

        <div className="flex items-center justify-between">

          <label className="text-[12px] font-medium" style={{ color: 'rgba(246,242,233,.6)' }}>Password</label>

          <Link href="/forgot-password" className="text-[12px] transition-colors duration-150" style={{ color: 'rgba(216,177,90,.7)' }}>

            Forgot password?

          </Link>

        </div>

        <div className="relative">

          <input

            type={showPass ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password"

            className="rounded-[12px] px-4 py-3 pr-16 text-[14px] w-full"

            style={{ background: 'rgba(246,242,233,.06)', border: '1px solid rgba(246,242,233,.12)', color: '#F6F2E9', outline: 'none' }}

          />

          <button type="button" onClick={() => setShowPass((v) => !v)} tabIndex={-1}

            className="absolute right-4 top-1/2 -translate-y-1/2 text-[11px] font-semibold select-none"

            style={{ color: 'rgba(246,242,233,.4)' }}

          >{showPass ? 'Hide' : 'Show'}</button>

        </div>

      </div>


 

      {error && (

        <p className="rounded-[12px] px-4 py-3 text-[13px]" style={{ background: 'rgba(185,58,58,.12)', color: '#ff7b7b' }}>{error}</p>

      )}


 

      <button type="submit" disabled={loading} className="btn-gold w-full justify-center">

        {loading ? 'Signing in…' : 'Sign In'}

      </button>


 

      <p className="text-center text-[13px]" style={{ color: 'rgba(246,242,233,.45)' }}>

        No account?{' '}

        <Link href={`/signup?redirect=${encodeURIComponent(redirect)}`} className="font-medium" style={{ color: '#D8B15A' }}>

          Create one

        </Link>

      </p>

    </form>

  );

}


 

export default function LoginPage() {

  return (

    <main className="flex min-h-screen flex-col items-center justify-center px-4" style={{ background: '#0F1612' }}>

      <div className="w-full max-w-sm">

        <div className="mb-8 text-center">

          <Link href="/">

            <p className="font-display text-[28px] font-bold" style={{ color: '#F6F2E9' }}>Dakshin Vihar</p>

            <p className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.2em]" style={{ color: 'rgba(216,177,90,.6)' }}>

              Soulful South Indian

            </p>

          </Link>

          <p className="mt-6 font-display text-[22px] font-semibold" style={{ color: '#F6F2E9' }}>Welcome back</p>

        </div>


 

        <div className="rounded-[24px] p-8" style={{ background: 'rgba(246,242,233,.04)', border: '1px solid rgba(246,242,233,.08)' }}>

          <Suspense fallback={<div className="h-60 animate-pulse rounded-[12px]" style={{ background: 'rgba(255,255,255,.04)' }} />}>

            <LoginForm />

          </Suspense>

        </div>

      </div>

    </main>

  );

}