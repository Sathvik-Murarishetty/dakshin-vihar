import type { ReactNode } from 'react';

import Navbar from '@/components/Navbar';

import Footer from '@/components/Footer';


 

export default function MainLayout({ children }: { children: ReactNode }) {

  return (

    <>

      <Navbar />

      {/* overflow-x is already handled globally on html/body in globals.css;

          keeping it here would make <main> a scroll container and break sticky */}

      <main className="pt-24">{children}</main>

      <Footer />

    </>

  );

}