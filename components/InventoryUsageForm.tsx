'use client';


 

import { useState } from 'react';

import { useRouter } from 'next/navigation';


 

export interface StockRow {

  name:     string;

  qty:      number;

  unit:     string;

  category: string;

  isLow:    boolean;

}


 

interface Props {

  stockItems: StockRow[];

  today:      string;

}


 

const UNITS = ['kg', 'g', 'L', 'mL', 'pcs', 'bags', 'boxes', 'packets'];


 

const CAT_COLORS: Record<string, string> = {

  produce: '#16a34a', dairy: '#1a64c8', spices: '#b98a3d',

  grains:  '#7e22ce', oil:   '#b45309', packaging: '#4B5A50', other: '#162019',

};


 

export default function InventoryUsageForm({ stockItems, today }: Props) {

  const router = useRouter();


 

  const [date,  setDate]  = useState(today);

  const [notes, setNotes] = useState('');

  const [qtys,     setQtys]    = useState<Record<string, string>>({});

  const [units,    setUnits]   = useState<Record<string, string>>(

    Object.fromEntries(stockItems.map((s) => [s.name, s.unit]))

  );

  const [logging, setLogging] = useState<string | null>(null);

  const [errors,  setErrors]  = useState<Record<string, string>>({});

  const [done,    setDone]    = useState<Record<string, boolean>>({});


 

  async function logItem(itemName: string) {

    const qty = qtys[itemName];

    if (!qty || Number(qty) <= 0) { setErrors((p) => ({ ...p, [itemName]: 'Enter qty' })); return; }

    setLogging(itemName); setErrors((p) => ({ ...p, [itemName]: '' }));

    const res  = await fetch('/api/admin/inventory/usage', {

      method:  'POST',

      headers: { 'Content-Type': 'application/json' },

      body:    JSON.stringify({ itemName, quantity: Number(qty), unit: units[itemName], notes, date }),

    });

    const data = await res.json();

    if (data.error) {

      setErrors((p) => ({ ...p, [itemName]: data.error }));

    } else {

      setQtys((p) => ({ ...p, [itemName]: '' }));

      setDone((p)  => ({ ...p, [itemName]: true }));

      setTimeout(() => setDone((p) => ({ ...p, [itemName]: false })), 2500);

      router.refresh();

    }

    setLogging(null);

  }


 

  if (stockItems.length === 0) {

    return (

      <p className="py-10 text-center text-[14px]" style={{ color: '#4B5A50' }}>

        No purchased items yet â€” log a purchase first.

      </p>

    );

  }


 

  return (

    <div>

      {/* Shared date + notes applied to every log entry */}

      <div className="mb-4 flex flex-wrap gap-3 items-end rounded-[16px] p-4"

        style={{ background: '#FCFBF8', border: '1px solid rgba(22,32,25,.08)' }}>

        <div className="flex flex-col gap-1">

          <label className="text-[11px] font-semibold uppercase tracking-[0.08em]" style={{ color: '#4B5A50' }}>Date</label>

          <input type="date" value={date} onChange={(e) => setDate(e.target.value)}

            className="rounded-[10px] px-3 py-2 text-[13px]"

            style={{ border: '1px solid rgba(22,32,25,.15)', background: 'white', color: '#162019', outline: 'none' }} />

        </div>

        <div className="flex flex-col gap-1 flex-1 min-w-[160px]">

          <label className="text-[11px] font-semibold uppercase tracking-[0.08em]" style={{ color: '#4B5A50' }}>Notes (optional)</label>

          <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g. morning prep"

            className="rounded-[10px] px-3 py-2 text-[13px]"

            style={{ border: '1px solid rgba(22,32,25,.15)', background: 'white', color: '#162019', outline: 'none' }} />

        </div>

      </div>


 

      {/* Per-item list */}

      <div className="rounded-[20px] overflow-x-auto" style={{ border: '1px solid rgba(22,32,25,.1)' }}>

        <table className="w-full text-[13px]" style={{ minWidth: '560px' }}>

          <thead style={{ background: '#F6F2E9' }}>

            <tr>

              {['Item', 'In Stock', 'Qty Used', 'Unit', ''].map((h) => (

                <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.08em]"

                  style={{ color: '#4B5A50' }}>{h}</th>

              ))}

            </tr>

          </thead>

          <tbody>

            {stockItems.map((item, i) => (

              <tr key={item.name}

                style={{ background: i % 2 === 0 ? '#FCFBF8' : 'white', borderTop: '1px solid rgba(22,32,25,.06)' }}>

                <td className="px-4 py-3">

                  <div className="flex items-center gap-2">

                    <span className="h-2 w-2 shrink-0 rounded-full"

                      style={{ background: CAT_COLORS[item.category] ?? '#162019' }} />

                    <div>

                      <p className="font-medium" style={{ color: '#162019' }}>{item.name}</p>

                      <p className="text-[11px] capitalize" style={{ color: '#4B5A50' }}>{item.category}</p>

                    </div>

                  </div>

                </td>

                <td className="px-4 py-3 font-semibold whitespace-nowrap"

                  style={{ color: item.isLow ? '#b93a3a' : '#162019' }}>

                  {item.qty.toFixed(item.qty % 1 === 0 ? 0 : 2)} {item.unit}

                  {item.isLow && (

                    <span className="ml-1.5 rounded-full px-1.5 py-0.5 text-[9px] font-bold"

                      style={{ background: 'rgba(185,58,58,.08)', color: '#b93a3a' }}>LOW</span>

                  )}

                </td>

                <td className="px-4 py-3">

                  <input type="number" min="0.01" step="0.01"

                    value={qtys[item.name] ?? ''}

                    onChange={(e) => setQtys((p) => ({ ...p, [item.name]: e.target.value }))}

                    placeholder="0"

                    className="w-20 rounded-[8px] px-2 py-1.5 text-[13px]"

                    style={{ border: errors[item.name] ? '1px solid #b93a3a' : '1px solid rgba(22,32,25,.15)', background: 'white', color: '#162019', outline: 'none' }} />

                  {errors[item.name] && (

                    <p className="mt-0.5 text-[10px]" style={{ color: '#b93a3a' }}>{errors[item.name]}</p>

                  )}

                </td>

                <td className="px-4 py-3">

                  <select value={units[item.name] ?? item.unit}

                    onChange={(e) => setUnits((p) => ({ ...p, [item.name]: e.target.value }))}

                    className="rounded-[8px] px-2 py-1.5 text-[12px]"

                    style={{ border: '1px solid rgba(22,32,25,.15)', background: 'white', color: '#162019', outline: 'none' }}>

                    {UNITS.map((u) => <option key={u}>{u}</option>)}

                  </select>

                </td>

                <td className="px-4 py-3">

                  {done[item.name] ? (

                    <span className="text-[12px] font-semibold" style={{ color: '#16a34a' }}>âœ“ Logged</span>

                  ) : (

                    <button onClick={() => logItem(item.name)} disabled={logging === item.name}

                      className="rounded-[8px] px-3 py-1.5 text-[12px] font-semibold whitespace-nowrap"

                      style={{ background: '#162019', color: '#F6F2E9', opacity: logging === item.name ? 0.5 : 1 }}>

                      {logging === item.name ? 'â€¦' : 'Log'}

                    </button>

                  )}

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>

  );

}