'use client';


 

import { useState } from 'react';

import { useRouter } from 'next/navigation';


 

interface Props { driverId: string; }


 

export default function DeleteDriverButton({ driverId }: Props) {

  const [confirm, setConfirm] = useState(false);

  const [loading, setLoading] = useState(false);

  const router = useRouter();


 

  async function handleDelete() {

    setLoading(true);

    await fetch(`/api/admin/drivers/${driverId}`, {

      method: 'PATCH',

      headers: { 'Content-Type': 'application/json' },

      body: JSON.stringify({ is_active: false }),

    });

    router.refresh();

    setLoading(false);

  }


 

  if (confirm) {

    return (

      <div className="flex items-center gap-2">

        <button

          onClick={handleDelete}

          disabled={loading}

          className="rounded-full px-3 py-1 text-[11px] font-semibold"

          style={{ background: 'rgba(185,58,58,.1)', color: '#b93a3a' }}

        >

          {loading ? '…' : 'Delete'}

        </button>

        <button

          onClick={() => setConfirm(false)}

          className="rounded-full px-3 py-1 text-[11px] font-medium"

          style={{ border: '1px solid rgba(22,32,25,.12)', color: '#4B5A50' }}

        >

          Cancel

        </button>

      </div>

    );

  }


 

  return (

    <button

      onClick={() => setConfirm(true)}

      className="rounded-full px-3 py-1 text-[11px] font-medium"

      style={{ border: '1px solid rgba(185,58,58,.2)', color: '#b93a3a' }}

    >

      Remove

    </button>

  );

}