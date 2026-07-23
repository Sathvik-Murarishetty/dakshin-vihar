'use client';


 

import Link from 'next/link';


 

export default function AdminError({ error, reset }: { error: Error; reset: () => void }) {

  return (

    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">

      <h2 className="font-display text-[28px] font-semibold" style={{ color: '#162019' }}>Admin Error</h2>

      <p className="text-[14px]" style={{ color: '#4B5A50' }}>{error.message}</p>

      <div className="flex gap-3">

        <button onClick={reset} className="btn-gold">Retry</button>

        <Link href="/admin" className="btn-ghost" style={{ border: '1px solid rgba(22,32,25,.2)', color: '#4B5A50' }}>Dashboard</Link>

      </div>

    </div>

  );

}