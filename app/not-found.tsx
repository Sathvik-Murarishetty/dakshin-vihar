import Link from 'next/link';


 

export default function NotFound() {

  return (

    <main

      className="flex min-h-screen flex-col items-center justify-center"

      style={{ background: '#162019' }}

    >

      <p className="overline mb-6">404</p>

      <h1

        className="font-display font-semibold"

        style={{ fontSize: 'clamp(48px,8vw,96px)', color: '#F6F2E9' }}

      >

        Page Not Found

      </h1>

      <p className="mt-4 max-w-sm text-center text-[15px] leading-relaxed" style={{ color: 'rgba(246,242,233,.5)' }}>

        The page you are looking for does not exist or has been moved.

      </p>

      <Link href="/" className="btn-gold mt-10">

        Return Home

      </Link>

    </main>

  );

}