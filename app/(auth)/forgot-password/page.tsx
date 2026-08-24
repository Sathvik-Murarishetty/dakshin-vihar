'use client';


 

import { useState } from 'react';

import Link from 'next/link';

import { createBrowserSupabaseClient } from '@/lib/supabase/client';


 

export default function ForgotPasswordPage() {

  const [email,   setEmail]   = useState('');

  const [loading, setLoading] = useState(false);

  const [sent,    setSent]    = useState(false);

  const [error,   setError]   = useState<string | null>(null);


 

  async function handleSubmit(e: React.FormEvent) {

    e.preventDefault();

    setLoading(true);

    setError(null);


 

    const supabase  = createBrowserSupabaseClient();

    const appUrl    = process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin;

    const { error: authError } = await supabase.auth.resetPasswordForEmail(email, {

      redirectTo: `${appUrl}/reset-password`,

    });


 

    if (authError) {

      setError(authError.message);

      setLoading(false);

      return;

    }

    setSent(true);

    setLoading(false);

  }


 

  return (

    <main className="flex min-h-screen flex-col items-center justify-center px-4" style={{ background: '#0F1612' }}>

      <div className="w-full max-w-sm">

        <div className="mb-8 text-center">

          <Link href="/">

            <p className="font-display text-[28px] font-bold" style={{ color: '#F6F2E9' }}>Dakshin Vihar</p>

          </Link>

          <p className="mt-6 font-display text-[22px] font-semibold" style={{ color: '#F6F2E9' }}>Reset Password</p>

        </div>


 

        <div className="rounded-[24px] p-8" style={{ background: 'rgba(246,242,233,.04)', border: '1px solid rgba(246,242,233,.08)' }}>

          {sent ? (

            <div className="text-center">

              <p className="font-semibold text-[16px]" style={{ color: '#F6F2E9' }}>Check your Inbox</p>

              <p className="mt-2 text-[13px] leading-relaxed" style={{ color: 'rgba(246,242,233,.55)' }}>

                We sent a password reset link to <strong style={{ color: '#D8B15A' }}>{email}</strong>.

              </p>

              <Link href="/login" className="btn-gold mt-6 inline-flex">Back to Sign In</Link>

            </div>

          ) : (

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">

              <p className="text-[13px] leading-relaxed" style={{ color: 'rgba(246,242,233,.55)' }}>

                Enter your email and we will send you a reset link.

              </p>

              <div className="flex flex-col gap-1.5">

                <label className="text-[12px] font-medium" style={{ color: 'rgba(246,242,233,.6)' }}>Email</label>

                <input

                  type="email" value={email} onChange={(e) => setEmail(e.target.value)} required

                  className="rounded-[12px] px-4 py-3 text-[14px]"

                  style={{ background: 'rgba(246,242,233,.06)', border: '1px solid rgba(246,242,233,.12)', color: '#F6F2E9', outline: 'none' }}

                />

              </div>

              {error && <p className="rounded-[12px] px-4 py-3 text-[13px]" style={{ background: 'rgba(185,58,58,.12)', color: '#ff7b7b' }}>{error}</p>}

              <button type="submit" disabled={loading} className="btn-gold w-full justify-center">

                {loading ? 'Sending…' : 'Send Reset Link'}

              </button>

              <Link href="/login" className="text-center text-[13px]" style={{ color: 'rgba(246,242,233,.4)' }}>Back to Sign In</Link>

            </form>

          )}

        </div>

      </div>

    </main>

  );

}
