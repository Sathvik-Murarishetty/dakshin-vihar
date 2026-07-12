'use client';


 

import { useRouter } from 'next/navigation';

import { createBrowserSupabaseClient } from '@/lib/supabase/client';

import { LogOut } from 'lucide-react';


 

export default function LogoutButton() {

  const router = useRouter();


 

  async function handleLogout() {

    const supabase = createBrowserSupabaseClient();

    await supabase.auth.signOut();

    router.push('/');

    router.refresh();

  }


 

  return (

    <button

      onClick={handleLogout}

      className="flex items-center gap-2 rounded-full px-4 py-2 text-[13px] font-medium transition-colors duration-200"

      style={{ border: '1px solid rgba(22,32,25,.12)', color: '#4B5A50' }}

    >

      <LogOut size={14} strokeWidth={1.5} />

      Sign Out

    </button>

  );

}