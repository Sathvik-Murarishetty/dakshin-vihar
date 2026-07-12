'use client';


 

import Link from 'next/link';


 

export default function MainError({

  error,

  reset,

}: {

  error: Error & { digest?: string };

  reset: () => void;

}) {

  return (

    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 text-center">

      <p className="overline">Something went wrong</p>

      <h2 className="font-display text-4xl font-semibold text-forest">{error.message || 'An unexpected error occurred.'}</h2>

      <div className="flex gap-3">

        <button onClick={reset} className="btn-gold">Try Again</button>

        <Link href="/" className="btn-ghost" style={{ border: '1px solid rgba(22,32,25,.2)', color: '#4B5A50' }}>Go Home</Link>

      </div>

    </div>

  );

}