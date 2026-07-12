'use client';


 

import { useEffect } from 'react';

import { useSearchParams } from 'next/navigation';

import { useCart } from '@/hooks/useCart';


 

/** Opens the cart drawer when the URL has ?cart=open (e.g. after login redirect) */

export default function OrderCartAutoOpen() {

  const searchParams = useSearchParams();

  const { openCart } = useCart();


 

  useEffect(() => {

    if (searchParams.get('cart') === 'open') openCart();

  }, [searchParams, openCart]);


 

  return null;

}