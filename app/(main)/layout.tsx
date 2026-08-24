import type { ReactNode } from 'react';

import Navbar from '@/components/Navbar';

import Footer from '@/components/Footer';

import AddToHomeScreen from '@/components/AddToHomeScreen';


 

export default function MainLayout({ children }: { children: ReactNode }) {

  return (

    <>

      <Navbar />

      <AddToHomeScreen />

      {/* overflow-x is already handled globally on html/body in globals.css;

          keeping it here would make <main> a scroll container and break sticky */}

      <main className="pt-24">{children}</main>

      <Footer />

    </>

  );

}