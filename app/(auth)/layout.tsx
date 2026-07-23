import type { Metadata } from 'next';

import type { ReactNode } from 'react';


 

export const metadata: Metadata = {

  title: 'Sign In — Dakshin Vihar',

  description: 'Sign in or create an account to order fresh South Indian meals.',

  robots: { index: false, follow: false },

};


 

export default function AuthLayout({ children }: { children: ReactNode }) {

  return <>{children}</>;

}