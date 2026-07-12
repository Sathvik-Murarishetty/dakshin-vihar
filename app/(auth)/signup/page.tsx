'use client';


 

import { useState, Suspense } from 'react';

import Link from 'next/link';

import { useRouter, useSearchParams } from 'next/navigation';

import { createBrowserSupabaseClient } from '@/lib/supabase/client';

import { safeRedirect } from '@/lib/utils';


 

function SignupForm() {

  const router       = useRouter();

  const searchParams = useSearchParams();

  const redirect     = safeRedirect(searchParams.get('redirect'));


 

  const [name,        setName]        = useState('');

  const [email,       setEmail]       = useState('');

  const [password,    setPassword]    = useState('');

  const [showPass,    setShowPass]    = useState(false);

  const [loading,     setLoading]     = useState(false);

  const [error,       setError]       = useState<string | null>(null);

  const [needsConfirm, setNeedsConfirm] = useState(false);


 

  async function handleSubmit(e: React.FormEvent) {

    e.preventDefault();

    setLoading(true);

    setError(null);


 

    const supabase = createBrowserSupabaseClient();

    const { data, error: authError } = await supabase.auth.signUp({

      email,

      password,

      options: { data: { full_name: name } },

    });


 

    if (authError) {

      setError(authError.message);

      setLoading(false);

      return;

    }


 

    // If session is null, Supabase requires email confirmation before login.

    // Show a message instead of redirecting to a protected route.

    if (!data.session) {

      setNeedsConfirm(true);

      setLoading(false);

      return;

    }


 

    router.push(redirect);

    router.refresh();

  }


 

  if (needsConfirm) {

    return (

      <div className="text-center">

        <p className="font-semibold text-[16px] mb-2" style={{ color: '#F6F2E9' }}>Check your inbox</p>

        <p className="text-[13px] leading-relaxed" style={{ color: 'rgba(246,242,233,.55)' }}>

          We sent a confirmation link to <strong style={{ color: '#D8B15A' }}>{email}</strong>.<br />

          Click it to activate your account, then sign in.

        </p>

        <Link href="/login" className="btn-gold mt-6 inline-flex">Go to Sign In</Link>

      </div>

    );

  }


 

  return (

    <form onSubmit={handleSubmit} className="flex flex-col gap-5">

      <div className="flex flex-col gap-1.5">

        <label className="text-[12px] font-medium" style={{ color: 'rgba(246,242,233,.6)' }}>Full Name</label>

        <input

          type="text" value={name} onChange={(e) => setName(e.target.value)} required

          className="rounded-[12px] px-4 py-3 text-[14px]"

          style={{ background: 'rgba(246,242,233,.06)', border: '1px solid rgba(246,242,233,.12)', color: '#F6F2E9', outline: 'none' }}

        />

      </div>

      <div className="flex flex-col gap-1.5">

        <label className="text-[12px] font-medium" style={{ color: 'rgba(246,242,233,.6)' }}>Email</label>

        <input

          type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email"

          className="rounded-[12px] px-4 py-3 text-[14px]"

          style={{ background: 'rgba(246,242,233,.06)', border: '1px solid rgba(246,242,233,.12)', color: '#F6F2E9', outline: 'none' }}

        />

      </div>

      <div className="flex flex-col gap-1.5">

        <label className="text-[12px] font-medium" style={{ color: 'rgba(246,242,233,.6)' }}>Password</label>

        <div className="relative">

          <input

            type={showPass ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} autoComplete="new-password"

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

        {loading ? 'Creating account…' : 'Create Account'}

      </button>


 

      <p className="text-center text-[13px]" style={{ color: 'rgba(246,242,233,.45)' }}>

        Already have an account?{' '}

        <Link href={`/login?redirect=${encodeURIComponent(redirect)}`} className="font-medium" style={{ color: '#D8B15A' }}>

          Sign in

        </Link>

      </p>

    </form>

  );

}


 

export default function SignupPage() {

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

          <p className="mt-6 font-display text-[22px] font-semibold" style={{ color: '#F6F2E9' }}>Create your account</p>

        </div>


 

        <div className="rounded-[24px] p-8" style={{ background: 'rgba(246,242,233,.04)', border: '1px solid rgba(246,242,233,.08)' }}>

          <Suspense fallback={<div className="h-72 animate-pulse rounded-[12px]" style={{ background: 'rgba(255,255,255,.04)' }} />}>

            <SignupForm />

          </Suspense>

        </div>

      </div>

    </main>

  );

}