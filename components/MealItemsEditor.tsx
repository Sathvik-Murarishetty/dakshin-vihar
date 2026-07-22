'use client';


 

import { useState } from 'react';

import { Plus, Trash2 } from 'lucide-react';


 

export interface ItemDraft { name: string; is_veg: boolean }


 

interface Props {

  items:    ItemDraft[];

  onChange: (items: ItemDraft[]) => void;

}


 

export default function MealItemsEditor({ items, onChange }: Props) {

  const [newName,  setNewName]  = useState('');

  const [newIsVeg, setNewIsVeg] = useState(true);


 

  function add() {

    const name = newName.trim();

    if (!name) return;

    onChange([...items, { name, is_veg: newIsVeg }]);

    setNewName('');

  }


 

  function remove(idx: number) {

    onChange(items.filter((_, i) => i !== idx));

  }


 

  return (

    <div className="flex flex-col gap-3">

      <label className="text-[12px] font-semibold uppercase tracking-[0.1em]" style={{ color: '#4B5A50' }}>

        Items Included

      </label>


 

      {/* Existing items */}

      {items.length > 0 && (

        <ul className="flex flex-col gap-1.5 rounded-[14px] p-3"

          style={{ background: 'rgba(22,32,25,.03)', border: '1px solid rgba(22,32,25,.1)' }}>

          {items.map((item, idx) => (

            <li key={idx} className="flex items-center gap-3">

              {/* Veg indicator */}

              {item.is_veg ? (

                <svg width="13" height="13" viewBox="0 0 16 16" fill="none" className="shrink-0">

                  <rect x="1.5" y="1.5" width="13" height="13" rx="1.5" stroke="#16a34a" strokeWidth="1.5"/>

                  <circle cx="8" cy="8" r="4" fill="#16a34a"/>

                </svg>

              ) : (

                <svg width="13" height="13" viewBox="0 0 16 16" fill="none" className="shrink-0">

                  <rect x="1.5" y="1.5" width="13" height="13" rx="1.5" stroke="#b45309" strokeWidth="1.5"/>

                  <polygon points="8,4 13,12 3,12" fill="#b45309"/>

                </svg>

              )}

              <span className="flex-1 text-[13px]" style={{ color: '#162019' }}>{item.name}</span>

              <button type="button" onClick={() => remove(idx)}

                className="flex h-6 w-6 items-center justify-center rounded-full"

                style={{ background: 'rgba(185,58,58,.08)', color: '#b93a3a' }}>

                <Trash2 size={11} strokeWidth={1.5} />

              </button>

            </li>

          ))}

        </ul>

      )}


 

      {/* Add item row */}

      <div className="flex gap-2 items-center">

        <input

          type="text"

          value={newName}

          onChange={(e) => setNewName(e.target.value)}

          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}

          placeholder="e.g. Rice, Sambar, Chicken Curry…"

          className="flex-1 rounded-[12px] px-4 py-2.5 text-[13px]"

          style={{ border: '1px solid rgba(22,32,25,.15)', background: '#FCFBF8', color: '#162019', outline: 'none' }}

        />

        {/* Veg toggle */}

        <div className="flex rounded-[10px] overflow-hidden shrink-0"

          style={{ border: '1px solid rgba(22,32,25,.15)' }}>

          <button type="button"

            onClick={() => setNewIsVeg(true)}

            className="px-3 py-2 text-[11px] font-semibold transition-all duration-150"

            style={newIsVeg

              ? { background: 'rgba(22,160,133,.12)', color: '#16a34a' }

              : { background: 'transparent', color: '#4B5A50' }

            }>

            Veg

          </button>

          <button type="button"

            onClick={() => setNewIsVeg(false)}

            className="px-3 py-2 text-[11px] font-semibold transition-all duration-150"

            style={!newIsVeg

              ? { background: 'rgba(180,83,9,.1)', color: '#b45309' }

              : { background: 'transparent', color: '#4B5A50' }

            }>

            Non-Veg

          </button>

        </div>

        <button type="button" onClick={add} disabled={!newName.trim()}

          className="flex h-10 w-10 items-center justify-center rounded-[10px] shrink-0"

          style={{ background: '#162019', color: '#D8B15A' }}>

          <Plus size={16} strokeWidth={2} />

        </button>

      </div>


 

      {items.length === 0 && (

        <p className="text-[12px]" style={{ color: 'rgba(22,32,25,.35)' }}>No items yet — add dishes above.</p>

      )}

    </div>

  );

}