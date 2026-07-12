import type { Metadata } from 'next';


 

export const metadata: Metadata = {

  title: "Today's Menu — Dakshin Vihar",

  description: 'See what fresh South Indian meals are available today.',

};


 

export default function MenuLayout({ children }: { children: React.ReactNode }) {

  return <>{children}</>;

}