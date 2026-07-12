import type { Metadata } from 'next';


 

export const metadata: Metadata = {

  title: 'Order — Dakshin Vihar',

  description: 'Order fresh South Indian meals for delivery.',

};


 

export default function OrderLayout({ children }: { children: React.ReactNode }) {

  return <>{children}</>;

}