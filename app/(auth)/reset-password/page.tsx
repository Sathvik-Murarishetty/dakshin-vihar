'use client';


 

import { useState, useEffect } from 'react';

import { useRouter } from 'next/navigation';

import Link from 'next/link';

import { createBrowserSupabaseClient } from '@/lib/supabase/client';


 

export default function ResetPasswordPage() {

  const router = useRouter();

  const [password,  setPassword]  = useState('');

  const [confirm,   setConfirm]   = useState('');

  const [loading,   setLoading]   = useState(false);

  const [error,     setError]     = useState<string | null>(null);

  const [expired,   setExpired]   = useState(false);

  const [success,   setSuccess]   = useState(false);

  // Whether a valid recovery session is ready to accept a new password

  const [ready,     setReady]     = useState(false);


 

  useEffect(() => {

    const supabase = createBrowserSupabaseClient();

    let timer: ReturnType<typeof setTimeout>;


 

    // ── PKCE flow: Supabase sends ?code= in the URL ───────────────

    const params = new URLSearchParams(window.location.search);

    const code   = params.get('code');

    if (code) {

      supabase.auth.exchangeCodeForSession(code)

        .then(({ data, error: e }) => {

          if (e || !data.session) setExpired(true);

          else setReady(true);

        });

    }


 

    // ── Legacy implicit flow: token arrives in URL hash ───────────

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {

      if (event === 'PASSWORD_RECOVERY') setReady(true);

      if (event === 'USER_UPDATED') {

        setSuccess(true);

        timer = setTimeout(() => router.push('/account'), 2000);

      }

    });


 

    // If already has a recovery session (e.g. page refresh)

    supabase.auth.getSession().then(({ data: { session } }) => {

      if (session && !code) setReady(true);

    });


 

    return () => {

      subscription.unsubscribe();

      clearTimeout(timer);

    };

  }, [router]);


 

  async function handleSubmit(e: React.FormEvent) {

    e.preventDefault();

    if (password !== confirm) { setError('Passwords do not match'); return; }

    if (password.length < 8)  { setError('Password must be at least 8 characters'); return; }


 

    setLoading(true);

    setError(null);


 

    const supabase = createBrowserSupabaseClient();

    const { error: updateError } = await supabase.auth.updateUser({ password });


 

    if (updateError) {

      if (updateError.message.includes('expired') || updateError.message.includes('invalid')) {

        setExpired(true);

      } else {

        setError(updateError.message);

      }

      setLoading(false);

    }

  }


 

  if (expired) {

    return (

      <main className="flex min-h-screen flex-col items-center justify-center px-4" style={{ background: '#0F1612' }}>

        <div className="w-full max-w-sm rounded-[24px] p-8 text-center" style={{ background: 'rgba(246,242,233,.04)', border: '1px solid rgba(246,242,233,.08)' }}>

          <p className="font-display text-[20px] font-semibold" style={{ color: '#F6F2E9' }}>Link expired</p>

          <p className="mt-2 text-[13px]" style={{ color: 'rgba(246,242,233,.5)' }}>Please request a new password reset link.</p>

          <Link href="/forgot-password" className="btn-gold mt-6 inline-flex">Request New Link</Link>

        </div>

      </main>

    );

  }


 

  if (success) {

    return (

      <main className="flex min-h-screen flex-col items-center justify-center px-4" style={{ background: '#0F1612' }}>

        <div className="w-full max-w-sm rounded-[24px] p-8 text-center" style={{ background: 'rgba(246,242,233,.04)', border: '1px solid rgba(246,242,233,.08)' }}>

          <p className="font-display text-[20px] font-semibold" style={{ color: '#F6F2E9' }}>Password updated!</p>

          <p className="mt-2 text-[13px]" style={{ color: 'rgba(246,242,233,.5)' }}>Redirecting to your account…</p>

        </div>

      </main>

    );

  }


 

  return (

    <main className="flex min-h-screen flex-col items-center justify-center px-4" style={{ background: '#0F1612' }}>

      <div className="w-full max-w-sm">

        <div className="mb-8 text-center">

          <p className="font-display text-[22px] font-semibold" style={{ color: '#F6F2E9' }}>Set New Password</p>

        </div>

        <div className="rounded-[24px] p-8" style={{ background: 'rgba(246,242,233,.04)', border: '1px solid rgba(246,242,233,.08)' }}>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">

            {[

              { label: 'New Password',     val: password, set: setPassword, auto: 'new-password' },

              { label: 'Confirm Password', val: confirm,  set: setConfirm,  auto: 'new-password' },

            ].map(({ label, val, set, auto }) => (

              <div key={label} className="flex flex-col gap-1.5">

                <label className="text-[12px] font-medium" style={{ color: 'rgba(246,242,233,.6)' }}>{label}</label>

                <input

                  type="password" value={val} onChange={(e) => set(e.target.value)} required minLength={8} autoComplete={auto}

                  className="rounded-[12px] px-4 py-3 text-[14px]"

                  style={{ background: 'rgba(246,242,233,.06)', border: '1px solid rgba(246,242,233,.12)', color: '#F6F2E9', outline: 'none' }}

                />

              </div>

            ))}

            {error && <p className="rounded-[12px] px-4 py-3 text-[13px]" style={{ background: 'rgba(185,58,58,.12)', color: '#ff7b7b' }}>{error}</p>}

            <button type="submit" disabled={loading} className="btn-gold w-full justify-center">

              {loading ? 'Updating…' : 'Update Password'}

            </button>

          </form>

        </div>

      </div>

    </main>

  );

}