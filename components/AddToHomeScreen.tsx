'use client';


 

import { useEffect, useState } from 'react';


 

type Platform = 'android' | 'ios' | null;


 

// BeforeInstallPromptEvent is non-standard; extend the base Event type.

interface BeforeInstallPromptEvent extends Event {

  prompt: () => Promise<void>;

  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;

}


 

const DISMISS_KEY = 'dv-a2hs-dismissed';


 

export default function AddToHomeScreen() {

  const [platform, setPlatform]   = useState<Platform>(null);

  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  const [visible, setVisible]     = useState(false);

  const [showIOSTip, setShowIOSTip] = useState(false);


 

  useEffect(() => {

    // Don't show if already running as a PWA or user dismissed before.

    const isStandalone =

      window.matchMedia('(display-mode: standalone)').matches ||

      (navigator as { standalone?: boolean }).standalone === true;

    if (isStandalone || localStorage.getItem(DISMISS_KEY)) return;


 

    const ua = navigator.userAgent;

    const isIOS =

      /iPad|iPhone|iPod/.test(ua) && !(window as { MSStream?: unknown }).MSStream &&

      !ua.includes('CriOS'); // exclude Chrome on iOS (no a2hs support there)

    const isAndroid = /Android/.test(ua);


 

    if (isIOS) {

      setPlatform('ios');

      setVisible(true);

    }


 

    // Android / Chrome Desktop: wait for browser-native install prompt

    const handler = (e: Event) => {

      e.preventDefault();

      setDeferredPrompt(e as BeforeInstallPromptEvent);

      if (isAndroid || !isIOS) { setPlatform('android'); setVisible(true); }

    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);

  }, []);


 

  function dismiss() {

    localStorage.setItem(DISMISS_KEY, '1');

    setVisible(false);

    setShowIOSTip(false);

  }


 

  async function handleInstall() {

    if (!deferredPrompt) return;

    await deferredPrompt.prompt();

    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') dismiss();

    setDeferredPrompt(null);

  }


 

  if (!visible) return null;


 

  return (

    <div

      className="fixed top-[64px] inset-x-0 z-40 sm:hidden"

      style={{ background: 'rgba(22,32,25,.96)', backdropFilter: 'blur(8px)' }}

    >

      <div className="flex items-center gap-3 px-4 py-3">

        {/* Icon */}

        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px]"

          style={{ background: 'rgba(216,177,90,.15)' }}>

          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D8B15A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">

            <path d="M12 5v14M5 12l7-7 7 7"/>

          </svg>

        </div>


 

        {/* Text */}

        <div className="flex-1 min-w-0">

          <p className="text-[13px] font-semibold leading-tight" style={{ color: '#F6F2E9' }}>

            Add to Home Screen

          </p>

          <p className="text-[11px] leading-snug mt-0.5" style={{ color: 'rgba(246,242,233,.55)' }}>

            {platform === 'ios'

              ? 'Install the app for quick access'

              : 'Install for the best experience'}

          </p>

        </div>


 

        {/* Action */}

        {platform === 'android' && deferredPrompt ? (

          <button

            onClick={handleInstall}

            className="shrink-0 rounded-full px-3 py-1.5 text-[12px] font-semibold"

            style={{ background: '#D8B15A', color: '#162019' }}

          >

            Install

          </button>

        ) : platform === 'ios' ? (

          <button

            onClick={() => setShowIOSTip((v) => !v)}

            className="shrink-0 rounded-full px-3 py-1.5 text-[12px] font-semibold"

            style={{ background: '#D8B15A', color: '#162019' }}

          >

            How?

          </button>

        ) : null}


 

        {/* Dismiss */}

        <button onClick={dismiss} aria-label="Dismiss"

          className="shrink-0 flex h-7 w-7 items-center justify-center rounded-full"

          style={{ background: 'rgba(246,242,233,.08)' }}>

          <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ color: 'rgba(246,242,233,.6)' }}>

            <line x1="4" y1="4" x2="12" y2="12"/><line x1="12" y1="4" x2="4" y2="12"/>

          </svg>

        </button>

      </div>


 

      {/* iOS step-by-step tip */}

      {showIOSTip && platform === 'ios' && (

        <div className="px-4 pb-4 flex flex-col gap-1.5">

          {[

            { n: 1, text: 'Tap the Share button  at the bottom of Safari' },

            { n: 2, text: 'Scroll down and tap "Add to Home Screen"' },

            { n: 3, text: 'Tap "Add" in the top-right corner' },

          ].map(({ n, text }) => (

            <div key={n} className="flex items-start gap-2.5">

              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold mt-0.5"

                style={{ background: 'rgba(216,177,90,.2)', color: '#D8B15A' }}>

                {n}

              </span>

              <p className="text-[12px] leading-snug" style={{ color: 'rgba(246,242,233,.7)' }}>{text}</p>

            </div>

          ))}

          <p className="mt-1 text-[11px]" style={{ color: 'rgba(246,242,233,.35)' }}>

            Use Safari — Chrome on iOS does not support installation.

          </p>

        </div>

      )}

    </div>

  );

}