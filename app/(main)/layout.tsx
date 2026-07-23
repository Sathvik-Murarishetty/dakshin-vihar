import type { ReactNode } from 'react';

import Navbar from '@/components/Navbar';

import Footer from '@/components/Footer';


 

export default function MainLayout({ children }: { children: ReactNode }) {

  return (

    <>

      <Navbar />

      <main className="pt-24 overflow-x-hidden">{children}</main>

      <Footer />

    </>

  );

}