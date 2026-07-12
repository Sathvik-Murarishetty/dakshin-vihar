'use client';


 

import { useState } from 'react';

import { useRouter } from 'next/navigation';


 

interface Props { subscriptionId: string; }


 

export default function CancelSubscriptionButton({ subscriptionId }: Props) {

  const [confirm,  setConfirm]  = useState(false);

  const [loading,  setLoading]  = useState(false);

  const router = useRouter();


 

  async function handleCancel() {

    setLoading(true);

    const res  = await fetch(`/api/subscriptions/${subscriptionId}`, { method: 'DELETE' });

    const data = await res.json();

    if (!data.error) {

      router.refresh();

    }

    setLoading(false);

    setConfirm(false);

  }


 

  if (confirm) {

    return (

      <div className="flex items-center gap-2">

        <span className="text-[12px]" style={{ color: '#4B5A50' }}>Are you sure?</span>

        <button

          onClick={handleCancel}

          disabled={loading}

          className="rounded-full px-4 py-1.5 text-[12px] font-semibold"

          style={{ background: 'rgba(185,58,58,.1)', color: '#b93a3a' }}

        >

          {loading ? '…' : 'Yes, Cancel'}

        </button>

        <button

          onClick={() => setConfirm(false)}

          className="rounded-full px-4 py-1.5 text-[12px] font-medium"

          style={{ border: '1px solid rgba(22,32,25,.12)', color: '#4B5A50' }}

        >

          Keep

        </button>

      </div>

    );

  }


 

  return (

    <button

      onClick={() => setConfirm(true)}

      className="rounded-full px-4 py-1.5 text-[12px] font-medium transition-colors duration-200"

      style={{ border: '1px solid rgba(185,58,58,.3)', color: '#b93a3a', background: 'rgba(185,58,58,.05)' }}

    >

      Cancel Plan

    </button>

  );

}