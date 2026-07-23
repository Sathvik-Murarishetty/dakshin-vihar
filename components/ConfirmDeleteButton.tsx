'use client';


 

import { useState, useTransition } from 'react';


 

interface Props {

  action: () => Promise<void>;

  label?: string;

}


 

export default function ConfirmDeleteButton({ action, label = 'item' }: Props) {

  const [isPending, startTransition] = useTransition();

  const [confirming, setConfirming] = useState(false);


 

  if (confirming) {

    return (

      <div className="flex items-center gap-2">

        <button

          onClick={() => startTransition(() => action())}

          disabled={isPending}

          className="rounded-full px-3 py-1.5 text-[12px] font-semibold"

          style={{ background: 'rgba(185,58,58,.1)', color: '#b93a3a', border: '1px solid rgba(185,58,58,.25)' }}

        >

          {isPending ? '…' : `Yes, delete`}

        </button>

        <button

          onClick={() => setConfirming(false)}

          disabled={isPending}

          className="rounded-full px-3 py-1.5 text-[12px] font-medium"

          style={{ border: '1px solid rgba(22,32,25,.15)', color: '#4B5A50' }}

        >

          Cancel

        </button>

      </div>

    );

  }


 

  return (

    <button

      onClick={() => setConfirming(true)}

      className="rounded-full px-3 py-1.5 text-[12px] font-medium"

      style={{ border: '1px solid rgba(185,58,58,.2)', color: '#b93a3a' }}

    >

      Delete {label}

    </button>

  );

}