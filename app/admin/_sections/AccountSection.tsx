'use client';


 

import { useState } from 'react';

import { createBrowserSupabaseClient } from '@/lib/supabase/client';


 

interface Props {

  email: string;

  fullName: string | null;

  role: string;

}


 

export default function AccountSection({ email, fullName, role }: Props) {

  const [currentPassword, setCurrentPassword] = useState('');

  const [newPassword,     setNewPassword]     = useState('');

  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);


 

  async function handleChangePassword(e: React.FormEvent) {

    e.preventDefault();

    if (newPassword !== confirmPassword) {

      setMessage({ type: 'error', text: 'New passwords do not match.' });

      return;

    }

    if (newPassword.length < 6) {

      setMessage({ type: 'error', text: 'Password must be at least 6 characters.' });

      return;

    }

    setLoading(true);

    setMessage(null);


 

    const supabase = createBrowserSupabaseClient();


 

    // Re-authenticate with current password first

    const { error: signInErr } = await supabase.auth.signInWithPassword({

      email,

      password: currentPassword,

    });

    if (signInErr) {

      setMessage({ type: 'error', text: 'Current password is incorrect.' });

      setLoading(false);

      return;

    }


 

    // Update to new password

    const { error: updateErr } = await supabase.auth.updateUser({ password: newPassword });

    if (updateErr) {

      setMessage({ type: 'error', text: updateErr.message });

    } else {

      setMessage({ type: 'success', text: 'Password changed successfully.' });

      setCurrentPassword('');

      setNewPassword('');

      setConfirmPassword('');

    }

    setLoading(false);

  }


 

  const ROLE_STYLE: Record<string, React.CSSProperties> = {

    admin:   { background: 'rgba(185,58,58,.08)',   color: '#b93a3a' },

    manager: { background: 'rgba(216,177,90,.1)',   color: '#b98a3d' },

    driver:  { background: 'rgba(22,160,133,.08)',  color: '#16a34a' },

    kitchen: { background: 'rgba(22,100,200,.08)',  color: '#1a64c8' },

    cook:    { background: 'rgba(22,100,200,.08)',  color: '#1a64c8' },

    staff:   { background: 'rgba(126,34,206,.08)',  color: '#7e22ce' },

    customer:{ background: 'rgba(22,32,25,.06)',    color: '#4B5A50' },

  };


 

  return (

    <div className="max-w-2xl">

      <h1 className="font-display text-[32px] font-semibold mb-6" style={{ color: '#162019' }}>My Account</h1>


 

      {/* Profile Info */}

      <div className="mb-6 rounded-[20px] p-6" style={{ background: '#FCFBF8', border: '1px solid rgba(22,32,25,.08)' }}>

        <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.12em]" style={{ color: '#4B5A50' }}>Profile</p>

        <div className="grid gap-4 sm:grid-cols-2">

          <div>

            <p className="text-[11px] font-medium uppercase tracking-[0.08em] mb-1" style={{ color: 'rgba(22,32,25,.45)' }}>Name</p>

            <p className="text-[15px] font-semibold" style={{ color: '#162019' }}>{fullName ?? '—'}</p>

          </div>

          <div>

            <p className="text-[11px] font-medium uppercase tracking-[0.08em] mb-1" style={{ color: 'rgba(22,32,25,.45)' }}>Email</p>

            <p className="text-[15px]" style={{ color: '#162019' }}>{email}</p>

          </div>

          <div>

            <p className="text-[11px] font-medium uppercase tracking-[0.08em] mb-1" style={{ color: 'rgba(22,32,25,.45)' }}>Role</p>

            <span className="rounded-full px-3 py-1 text-[12px] font-semibold capitalize"

              style={ROLE_STYLE[role] ?? ROLE_STYLE.customer}>

              {role}

            </span>

          </div>

        </div>

      </div>


 

      {/* Change Password */}

      <div className="rounded-[20px] p-6" style={{ background: '#FCFBF8', border: '1px solid rgba(22,32,25,.08)' }}>

        <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.12em]" style={{ color: '#4B5A50' }}>Change Password</p>


 

        <form onSubmit={handleChangePassword} className="flex flex-col gap-4">

          <div className="grid gap-4 sm:grid-cols-2">

            <div className="flex flex-col gap-1.5 sm:col-span-2">

              <label className="text-[12px] font-medium" style={{ color: '#4B5A50' }}>Current Password</label>

              <input

                type="password"

                value={currentPassword}

                onChange={(e) => setCurrentPassword(e.target.value)}

                required

                placeholder="Enter current password"

                className="rounded-[12px] px-4 py-2.5 text-[13px]"

                style={{ border: '1px solid rgba(22,32,25,.15)', background: 'white', color: '#162019', outline: 'none', maxWidth: '360px' }}

              />

            </div>

            <div className="flex flex-col gap-1.5">

              <label className="text-[12px] font-medium" style={{ color: '#4B5A50' }}>New Password</label>

              <input

                type="password"

                value={newPassword}

                onChange={(e) => setNewPassword(e.target.value)}

                required

                placeholder="Min 6 characters"

                className="rounded-[12px] px-4 py-2.5 text-[13px]"

                style={{ border: '1px solid rgba(22,32,25,.15)', background: 'white', color: '#162019', outline: 'none' }}

              />

            </div>

            <div className="flex flex-col gap-1.5">

              <label className="text-[12px] font-medium" style={{ color: '#4B5A50' }}>Confirm New Password</label>

              <input

                type="password"

                value={confirmPassword}

                onChange={(e) => setConfirmPassword(e.target.value)}

                required

                placeholder="Repeat new password"

                className="rounded-[12px] px-4 py-2.5 text-[13px]"

                style={{ border: '1px solid rgba(22,32,25,.15)', background: 'white', color: '#162019', outline: 'none' }}

              />

            </div>

          </div>


 

          {message && (

            <p className="rounded-[12px] px-4 py-3 text-[13px]"

              style={message.type === 'success'

                ? { background: 'rgba(22,160,133,.08)', color: '#16a34a' }

                : { background: 'rgba(185,58,58,.08)',  color: '#b93a3a' }

              }>

              {message.text}

            </p>

          )}


 

          <div>

            <button

              type="submit"

              disabled={loading}

              className="rounded-[12px] px-6 py-2.5 text-[13px] font-semibold"

              style={{ background: '#162019', color: '#F6F2E9', opacity: loading ? 0.6 : 1 }}

            >

              {loading ? 'Updating…' : 'Change Password'}

            </button>

          </div>

        </form>

      </div>

    </div>

  );

}