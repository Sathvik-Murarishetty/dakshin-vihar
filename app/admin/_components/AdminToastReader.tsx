'use client';


 

import { useEffect } from 'react';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';

import { useToast } from '@/hooks/useToast';


 

export default function AdminToastReader() {

  const searchParams = useSearchParams();

  const router       = useRouter();

  const pathname     = usePathname();

  const { showToast } = useToast();


 

  const toastMsg = searchParams.get('toast');

  const errorMsg = searchParams.get('error');


 

  useEffect(() => {

    if (!toastMsg && !errorMsg) return;

    if (toastMsg) showToast(toastMsg, 'success');

    if (errorMsg) showToast(errorMsg, 'error');


 

    // Strip the params from the URL without a full navigation

    const params = new URLSearchParams(searchParams.toString());

    params.delete('toast');

    params.delete('error');

    const qs = params.toString();

    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });

  // eslint-disable-next-line react-hooks/exhaustive-deps

  }, [toastMsg, errorMsg]);


 

  return null;

}