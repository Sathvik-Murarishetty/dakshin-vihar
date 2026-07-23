import type { Metadata } from 'next';

import type { ReactNode } from 'react';

import { Inter, Cormorant_Garamond } from 'next/font/google';

import { CartProvider } from '@/hooks/useCart';

import { ToastProvider } from '@/hooks/useToast';

import CartDrawer from '@/components/CartDrawer';

import './globals.css';


 

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

const cormorant = Cormorant_Garamond({

  subsets: ['latin'],

  variable: '--font-cormorant',

  weight: ['300', '400', '500', '600', '700'],

  style: ['normal', 'italic'],

});


 

export const metadata: Metadata = {

  metadataBase: new URL('https://dakshinvihar.com'),

  title: {

    default:  'Dakshin Vihar — Soulful South Indian',

    template: '%s — Dakshin Vihar',

  },

  description:

    'Authentic South Indian home-style meals in Dubai. Subscribe monthly for daily lunch, dinner, or both.',

  openGraph: {

    title:       'Dakshin Vihar — Soulful South Indian',

    description: 'Subscribe to fresh, authentic South Indian meals every day.',

    type:        'website',

    siteName:    'Dakshin Vihar',

    locale:      'en_AE',

  },

  twitter: {

    card:        'summary_large_image',

    title:       'Dakshin Vihar — Soulful South Indian',

    description: 'Fresh South Indian meals delivered daily across Dubai.',

  },

  robots: {

    index:  true,

    follow: true,

  },

};


 

export default function RootLayout({ children }: { children: ReactNode }) {

  return (

    <html lang="en" className={`${inter.variable} ${cormorant.variable}`}>

      <body className="bg-ivory text-stone antialiased">

        <CartProvider>

          <ToastProvider>

            <CartDrawer />

            {children}

          </ToastProvider>

        </CartProvider>

      </body>

    </html>

  );

}