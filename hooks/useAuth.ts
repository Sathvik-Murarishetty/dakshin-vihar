'use client';


 

import { useEffect, useState } from 'react';

import { createBrowserSupabaseClient } from '@/lib/supabase/client';

import type { User } from '@supabase/supabase-js';


 

export function useAuth() {

  const [user,    setUser]    = useState<User | null>(null);

  const [loading, setLoading] = useState(true);


 

  useEffect(() => {

    const supabase = createBrowserSupabaseClient();


 

    supabase.auth.getUser().then(({ data }) => {

      setUser(data.user);

      setLoading(false);

    });


 

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {

      setUser(session?.user ?? null);

    });


 

    return () => subscription.unsubscribe();

  }, []);


 

  return { user, loading };

}