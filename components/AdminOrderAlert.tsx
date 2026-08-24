'use client';


 

import { useEffect, useRef, useState } from 'react';

import { createBrowserSupabaseClient } from '@/lib/supabase/client';


 

// Three-tone ascending alert — harsh square wave, max gain, cuts through noise.

function playAlert() {

  try {

    const Ctx = window.AudioContext ?? (window as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

    if (!Ctx) return;

    const ctx = new Ctx();


 

    [[0, 880], [0.22, 1046], [0.44, 1318]].forEach(([t, freq]) => {

      const osc  = ctx.createOscillator();

      const gain = ctx.createGain();

      osc.connect(gain);

      gain.connect(ctx.destination);

      osc.type = 'square';

      osc.frequency.value = freq as number;

      const start = ctx.currentTime + (t as number);

      gain.gain.setValueAtTime(1, start);                           // max volume

      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.25);

      osc.start(start);

      osc.stop(start + 0.25);

    });

  } catch { /* AudioContext may be blocked before first gesture */ }

}


 

export default function AdminOrderAlert() {

  const [banner, setBanner] = useState<{ id: string; time: string } | null>(null);

  // AudioContext must be created after a user gesture; unlock on first click.

  const unlocked = useRef(false);


 

  useEffect(() => {

    const unlock = () => { unlocked.current = true; };

    document.addEventListener('click', unlock, { once: true });

    return () => document.removeEventListener('click', unlock);

  }, []);


 

  useEffect(() => {

    const sb = createBrowserSupabaseClient();

    const channel = sb

      .channel('admin-new-orders')

      .on(

        'postgres_changes',

        { event: 'INSERT', schema: 'public', table: 'orders' },

        (payload) => {

          const newOrder = payload.new as { id: string; created_at: string };

          if (unlocked.current) playAlert();

          setBanner({ id: newOrder.id.slice(-6).toUpperCase(), time: new Date(newOrder.created_at).toLocaleTimeString('en-AE') });

          setTimeout(() => setBanner(null), 6000);

        }

      )

      .subscribe();


 

    return () => { sb.removeChannel(channel); };

  }, []);


 

  if (!banner) return null;


 

  return (

    <div

      role="alert"

      className="fixed top-4 left-1/2 z-[300] -translate-x-1/2 flex items-center gap-3 rounded-full px-5 py-3 shadow-2xl"

      style={{

        background: '#162019',

        border: '2px solid #D8B15A',

        animation: 'dv-order-ping 0.3s ease',

        whiteSpace: 'nowrap',

      }}

    >

      <span className="text-[20px]">🔔</span>

      <div>

        <p className="text-[13px] font-bold" style={{ color: '#D8B15A' }}>New Order!</p>

        <p className="text-[11px]" style={{ color: 'rgba(246,242,233,.7)' }}>#{banner.id} · {banner.time}</p>

      </div>

      <button onClick={() => setBanner(null)} aria-label="Dismiss"

        className="ml-1 flex h-6 w-6 items-center justify-center rounded-full"

        style={{ background: 'rgba(216,177,90,.15)' }}>

        <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="#D8B15A" strokeWidth="2.5" strokeLinecap="round">

          <line x1="4" y1="4" x2="12" y2="12"/><line x1="12" y1="4" x2="4" y2="12"/>

        </svg>

      </button>

      <style>{`

        @keyframes dv-order-ping {

          0%   { transform: translateX(-50%) scale(0.8); opacity: 0; }

          60%  { transform: translateX(-50%) scale(1.06); opacity: 1; }

          100% { transform: translateX(-50%) scale(1);    opacity: 1; }

        }

      `}</style>

    </div>

  );

}