'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createBrowserSupabaseClient } from '@/lib/supabase/client';

export default function ResetPasswordPage() {
  const router = useRouter();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expired, setExpired] = useState(false);
  const [success, setSuccess] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const supabase = createBrowserSupabaseClient();

    let timer: ReturnType<typeof setTimeout> | undefined;

    // Listen for Supabase authentication events.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      // Recovery session has been established.
      if (
        (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') &&
        session
      ) {
        setReady(true);
        setExpired(false);
      }

      // Password was successfully changed.
      if (event === 'USER_UPDATED') {
        setSuccess(true);

        timer = setTimeout(() => {
          router.push('/account');
        }, 2000);
      }
    });

    // Check whether a session already exists.
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setReady(true);
      }
    });

    return () => {
      subscription.unsubscribe();

      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setError(null);

    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    const supabase = createBrowserSupabaseClient();

    const { error: updateError } = await supabase.auth.updateUser({
      password,
    });

    if (updateError) {
      const message = updateError.message.toLowerCase();

      if (
        message.includes('expired') ||
        message.includes('invalid') ||
        message.includes('session')
      ) {
        setExpired(true);
      } else {
        setError(updateError.message);
      }

      setLoading(false);
      return;
    }

    setLoading(false);
    setSuccess(true);

    setTimeout(() => {
      router.push('/account');
    }, 2000);
  }

  // Show expired state.
  if (expired) {
    return (
      <main
        className="flex min-h-screen flex-col items-center justify-center px-4"
        style={{ background: '#0F1612' }}
      >
        <div
          className="w-full max-w-sm rounded-[24px] p-8 text-center"
          style={{
            background: 'rgba(246,242,233,.04)',
            border: '1px solid rgba(246,242,233,.08)',
          }}
        >
          <p
            className="font-display text-[20px] font-semibold"
            style={{ color: '#F6F2E9' }}
          >
            Link expired
          </p>

          <p
            className="mt-2 text-[13px]"
            style={{ color: 'rgba(246,242,233,.5)' }}
          >
            Please request a new password reset link.
          </p>

          <Link
            href="/forgot-password"
            className="btn-gold mt-6 inline-flex"
          >
            Request New Link
          </Link>
        </div>
      </main>
    );
  }

  // Show success state.
  if (success) {
    return (
      <main
        className="flex min-h-screen flex-col items-center justify-center px-4"
        style={{ background: '#0F1612' }}
      >
        <div
          className="w-full max-w-sm rounded-[24px] p-8 text-center"
          style={{
            background: 'rgba(246,242,233,.04)',
            border: '1px solid rgba(246,242,233,.08)',
          }}
        >
          <p
            className="font-display text-[20px] font-semibold"
            style={{ color: '#F6F2E9' }}
          >
            Password updated!
          </p>

          <p
            className="mt-2 text-[13px]"
            style={{ color: 'rgba(246,242,233,.5)' }}
          >
            Redirecting to your account…
          </p>
        </div>
      </main>
    );
  }

  // Wait for Supabase to establish the recovery session.
  if (!ready) {
    return (
      <main
        className="flex min-h-screen items-center justify-center"
        style={{ background: '#0F1612' }}
      >
        <p
          className="text-[14px]"
          style={{ color: 'rgba(246,242,233,.6)' }}
        >
          Verifying reset link…
        </p>
      </main>
    );
  }

  // Password reset form.
  return (
    <main
      className="flex min-h-screen flex-col items-center justify-center px-4"
      style={{ background: '#0F1612' }}
    >
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p
            className="font-display text-[22px] font-semibold"
            style={{ color: '#F6F2E9' }}
          >
            Set New Password
          </p>
        </div>

        <div
          className="rounded-[24px] p-8"
          style={{
            background: 'rgba(246,242,233,.04)',
            border: '1px solid rgba(246,242,233,.08)',
          }}
        >
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-5"
          >
            <div className="flex flex-col gap-1.5">
              <label
                className="text-[12px] font-medium"
                style={{ color: 'rgba(246,242,233,.6)' }}
              >
                New Password
              </label>

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
                className="rounded-[12px] px-4 py-3 text-[14px]"
                style={{
                  background: 'rgba(246,242,233,.06)',
                  border: '1px solid rgba(246,242,233,.12)',
                  color: '#F6F2E9',
                  outline: 'none',
                }}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                className="text-[12px] font-medium"
                style={{ color: 'rgba(246,242,233,.6)' }}
              >
                Confirm Password
              </label>

              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
                className="rounded-[12px] px-4 py-3 text-[14px]"
                style={{
                  background: 'rgba(246,242,233,.06)',
                  border: '1px solid rgba(246,242,233,.12)',
                  color: '#F6F2E9',
                  outline: 'none',
                }}
              />
            </div>

            {error && (
              <p
                className="rounded-[12px] px-4 py-3 text-[13px]"
                style={{
                  background: 'rgba(185,58,58,.12)',
                  color: '#ff7b7b',
                }}
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-gold w-full justify-center"
            >
              {loading ? 'Updating…' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}