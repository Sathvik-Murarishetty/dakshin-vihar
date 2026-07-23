import type { Metadata } from 'next';

import type { ReactNode } from 'react';


 

export const metadata: Metadata = {

  title: 'Create Account — Dakshin Vihar',

  description: 'Create a Dakshin Vihar account to subscribe to daily South Indian meal plans.',

  robots: { index: false, follow: false },

};


 

export default function SignupLayout({ children }: { children: ReactNode }) {

  return <>{children}</>;

}