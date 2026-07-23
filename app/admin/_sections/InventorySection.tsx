import Link from 'next/link';

import { redirect } from 'next/navigation';

import { revalidatePath } from 'next/cache';

import { createServerSupabaseClient, createServiceSupabaseClient } from '@/lib/supabase/server';

import ImageUploadField from '@/components/ImageUploadField';

import { getTodayDateString } from '@/lib/utils';


 

type Period = 'today' | 'week' | 'month';


 

interface Props {

  role:      string;

  category?: string;

  q?:        string;

  period?:   string;

}


 

const CATEGORIES = [

  { value: 'produce',   label: 'Produce' },

  { value: 'dairy',     label: 'Dairy' },

  { value: 'spices',    label: 'Spices' },

  { value: 'grains',    label: 'Grains & Lentils' },

  { value: 'oil',       label: 'Oil & Ghee' },

  { value: 'packaging', label: 'Packaging' },

  { value: 'other',     label: 'Other' },

];


 

const UNITS = ['kg', 'g', 'L', 'mL', 'pcs', 'bags', 'boxes', 'packets'];


 

const CAT_COLORS: Record<string, string> = {

  produce:   '#16a34a',

  dairy:     '#1a64c8',

  spices:    '#b98a3d',

  grains:    '#7e22ce',

  oil:       '#b45309',

  packaging: '#4B5A50',

  other:     '#162019',

};


 

function getPeriodStart(period: Period): string {

  const now = new Date();

  if (period === 'week')  now.setDate(now.getDate() - 7);

  else if (period === 'month') now.setDate(now.getDate() - 30);

  else now.setHours(0, 0, 0, 0);

  return now.toISOString().slice(0, 10);

}


 

const PERIOD_LABELS: Record<Period, string> = {

  today: 'Today',

  week:  'Last 7 Days',

  month: 'Last 30 Days',

};


 

export default async function InventorySection({ role, category = 'all', q, period: rawPeriod }: Props) {

  const isAdmin  = role === 'admin' || role === 'manager';

  const period: Period = rawPeriod === 'week' || rawPeriod === 'month' ? rawPeriod : 'today';

  const fromDate = getPeriodStart(period);

  const today    = getTodayDateString();


 

  const supabase = await createServerSupabaseClient();

  const { data: { user } } = await supabase.auth.getUser();


 

  /* ── Server action: add purchase ─────────────────── */

  async function addPurchase(formData: FormData) {

    'use server';

    const sb = createServiceSupabaseClient();

    const ss = await createServerSupabaseClient();

    const { data: { user: u } } = await ss.auth.getUser();


 

    await sb.from('inventory_purchases').insert({

      name:         formData.get('name') as string,

      category:     (formData.get('category') as string) || null,

      quantity:     Number(formData.get('quantity')),

      unit:         (formData.get('unit') as string) || 'kg',

      total_price:  Number(formData.get('total_price')),

      vendor:       (formData.get('vendor') as string) || null,

      purchased_at: (formData.get('purchased_at') as string) || today,

      notes:        (formData.get('notes') as string) || null,

      receipt_url:  (formData.get('receipt_url') as string) || null,

      purchased_by: u?.id ?? null,

    });

    revalidatePath('/admin');

    redirect('/admin?tab=inventory&toast=Purchase+logged');

  }


 

  /* ── Fetch purchases list ────────────────────────── */

  let listQuery = supabase

    .from('inventory_purchases')

    .select('*, buyer:profiles(full_name, email)')

    .order('purchased_at', { ascending: false })

    .order('created_at',   { ascending: false })

    .limit(100);


 

  if (!isAdmin && user) listQuery = listQuery.eq('purchased_by', user.id);

  if (category !== 'all') listQuery = listQuery.eq('category', category);

  if (q?.trim()) listQuery = listQuery.ilike('name', `%${q.trim()}%`);


 

  const { data: purchases } = await listQuery;


 

  /* ── Stats (admin/manager only) ──────────────────── */

  let totalSpend     = 0;

  let purchaseCount  = 0;

  let catBreakdown:  Record<string, number> = {};

  let dailySpend:    { date: string; label: string; amount: number }[] = [];


 

  if (isAdmin) {

    const { data: periodData } = await supabase

      .from('inventory_purchases')

      .select('total_price, category, purchased_at')

      .gte('purchased_at', fromDate);


 

    totalSpend    = (periodData ?? []).reduce((s, p) => s + Number(p.total_price), 0);

    purchaseCount = periodData?.length ?? 0;


 

    for (const p of periodData ?? []) {

      const cat = p.category ?? 'other';

      catBreakdown[cat] = (catBreakdown[cat] ?? 0) + Number(p.total_price);

    }


 

    // 7-day daily spend for chart

    for (let i = 6; i >= 0; i--) {

      const d = new Date();

      d.setDate(d.getDate() - i);

      const dateStr = d.toISOString().slice(0, 10);

      dailySpend.push({

        date:   dateStr,

        label:  d.toLocaleDateString('en-AE', { weekday: 'short' }),

        amount: 0,

      });

    }

    for (const p of periodData ?? []) {

      const day = dailySpend.find((d) => d.date === (p.purchased_at as string).slice(0, 10));

      if (day) day.amount += Number(p.total_price);

    }

  }


 

  const maxDaily = Math.max(...dailySpend.map((d) => d.amount), 1);

  const maxCat   = Math.max(...Object.values(catBreakdown), 1);

  const catEntries = Object.entries(catBreakdown).sort((a, b) => b[1] - a[1]);


 

  return (

    <div>

      <h1 className="font-display text-[32px] font-semibold mb-6" style={{ color: '#162019' }}>

        Inventory

      </h1>


 

      {/* ── Admin stats ───────────────────────────────────────── */}

      {isAdmin && (

        <>

          {/* Period selector */}

          <div className="flex gap-2 mb-6 flex-wrap">

            {(Object.keys(PERIOD_LABELS) as Period[]).map((p) => (

              <Link key={p} href={`/admin?tab=inventory&period=${p}`}

                className="rounded-full px-4 py-1.5 text-[12px] font-semibold"

                style={period === p

                  ? { background: '#162019', color: '#F6F2E9' }

                  : { border: '1px solid rgba(22,32,25,.15)', color: '#4B5A50' }}>

                {PERIOD_LABELS[p]}

              </Link>

            ))}

          </div>


 

          {/* Summary cards */}

          <div className="grid grid-cols-2 gap-4 mb-6 sm:grid-cols-3">

            <div className="rounded-[20px] p-5" style={{ background: '#FCFBF8', border: '1px solid rgba(22,32,25,.08)' }}>

              <p className="text-[11px] font-semibold uppercase tracking-[0.1em]" style={{ color: '#4B5A50' }}>

                Total Spent — {PERIOD_LABELS[period]}

              </p>

              <p className="mt-2 font-display text-[36px] font-bold leading-none" style={{ color: '#D8B15A' }}>

                AED {totalSpend.toFixed(0)}

              </p>

            </div>

            <div className="rounded-[20px] p-5" style={{ background: '#FCFBF8', border: '1px solid rgba(22,32,25,.08)' }}>

              <p className="text-[11px] font-semibold uppercase tracking-[0.1em]" style={{ color: '#4B5A50' }}>

                Purchases — {PERIOD_LABELS[period]}

              </p>

              <p className="mt-2 font-display text-[36px] font-bold leading-none" style={{ color: '#162019' }}>

                {purchaseCount}

              </p>

            </div>

            {catEntries[0] && (

              <div className="rounded-[20px] p-5" style={{ background: '#FCFBF8', border: '1px solid rgba(22,32,25,.08)' }}>

                <p className="text-[11px] font-semibold uppercase tracking-[0.1em]" style={{ color: '#4B5A50' }}>

                  Top Category

                </p>

                <p className="mt-2 font-display text-[28px] font-bold capitalize leading-none" style={{ color: '#162019' }}>

                  {catEntries[0][0]}

                </p>

                <p className="mt-1 text-[12px]" style={{ color: '#4B5A50' }}>AED {catEntries[0][1].toFixed(0)}</p>

              </div>

            )}

          </div>


 

          {/* Charts row */}

          <div className="grid gap-6 sm:grid-cols-2 mb-8">


 

            {/* Daily spend bar chart */}

            <div className="rounded-[20px] p-5" style={{ background: '#FCFBF8', border: '1px solid rgba(22,32,25,.08)' }}>

              <p className="mb-4 text-[12px] font-semibold uppercase tracking-[0.1em]" style={{ color: '#4B5A50' }}>

                Daily Spend (AED) — Last 7 Days

              </p>

              <div className="flex items-end gap-2 h-24">

                {dailySpend.map((d) => (

                  <div key={d.date} className="flex flex-1 flex-col items-center gap-1">

                    <span className="text-[10px] font-semibold" style={{ color: '#D8B15A' }}>

                      {d.amount > 0 ? d.amount.toFixed(0) : ''}

                    </span>

                    <div className="w-full rounded-t-[4px]"

                      style={{

                        height: `${Math.round((d.amount / maxDaily) * 72)}px`,

                        minHeight: d.amount > 0 ? '4px' : '2px',

                        background: d.amount > 0 ? '#D8B15A' : 'rgba(22,32,25,.1)',

                      }} />

                    <span className="text-[10px]" style={{ color: '#4B5A50' }}>{d.label}</span>

                  </div>

                ))}

              </div>

            </div>


 

            {/* Category breakdown horizontal bars */}

            <div className="rounded-[20px] p-5" style={{ background: '#FCFBF8', border: '1px solid rgba(22,32,25,.08)' }}>

              <p className="mb-4 text-[12px] font-semibold uppercase tracking-[0.1em]" style={{ color: '#4B5A50' }}>

                By Category — {PERIOD_LABELS[period]}

              </p>

              {catEntries.length > 0 ? (

                <div className="flex flex-col gap-3">

                  {catEntries.map(([cat, amount]) => (

                    <div key={cat} className="flex flex-col gap-1">

                      <div className="flex items-center justify-between">

                        <span className="text-[12px] font-medium capitalize" style={{ color: '#162019' }}>{cat}</span>

                        <span className="text-[12px] font-semibold" style={{ color: '#4B5A50' }}>AED {amount.toFixed(0)}</span>

                      </div>

                      <div className="h-2 w-full rounded-full overflow-hidden" style={{ background: 'rgba(22,32,25,.08)' }}>

                        <div

                          className="h-full rounded-full"

                          style={{

                            width: `${Math.round((amount / maxCat) * 100)}%`,

                            background: CAT_COLORS[cat] ?? '#162019',

                          }}

                        />

                      </div>

                    </div>

                  ))}

                </div>

              ) : (

                <p className="text-[13px]" style={{ color: '#4B5A50' }}>No purchases in this period.</p>

              )}

            </div>

          </div>

        </>

      )}


 

      {/* ── Add purchase form ──────────────────────────────────── */}

      <form action={addPurchase}

        className="mb-8 rounded-[20px] p-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"

        style={{ background: '#FCFBF8', border: '1px solid rgba(22,32,25,.08)' }}>

        <h2 className="font-semibold text-[15px] sm:col-span-2 lg:col-span-3" style={{ color: '#162019' }}>

          Log a Purchase

        </h2>


 

        {/* Name */}

        <div className="flex flex-col gap-1.5 lg:col-span-2">

          <label className="text-[12px] font-medium" style={{ color: '#4B5A50' }}>Item Name *</label>

          <input name="name" required placeholder="e.g. Basmati Rice 25kg"

            className="rounded-[12px] px-4 py-2.5 text-[13px]"

            style={{ border: '1px solid rgba(22,32,25,.15)', background: 'white', color: '#162019', outline: 'none' }} />

        </div>


 

        {/* Category */}

        <div className="flex flex-col gap-1.5">

          <label className="text-[12px] font-medium" style={{ color: '#4B5A50' }}>Category</label>

          <select name="category"

            className="rounded-[12px] px-4 py-2.5 text-[13px]"

            style={{ border: '1px solid rgba(22,32,25,.15)', background: 'white', color: '#162019', outline: 'none' }}>

            <option value="">— Select —</option>

            {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}

          </select>

        </div>


 

        {/* Quantity + Unit */}

        <div className="flex gap-2">

          <div className="flex flex-col gap-1.5 flex-1">

            <label className="text-[12px] font-medium" style={{ color: '#4B5A50' }}>Quantity *</label>

            <input name="quantity" type="number" required min="0.01" step="0.01" placeholder="5"

              className="rounded-[12px] px-4 py-2.5 text-[13px]"

              style={{ border: '1px solid rgba(22,32,25,.15)', background: 'white', color: '#162019', outline: 'none' }} />

          </div>

          <div className="flex flex-col gap-1.5 w-24">

            <label className="text-[12px] font-medium" style={{ color: '#4B5A50' }}>Unit</label>

            <select name="unit"

              className="rounded-[12px] px-3 py-2.5 text-[13px]"

              style={{ border: '1px solid rgba(22,32,25,.15)', background: 'white', color: '#162019', outline: 'none' }}>

              {UNITS.map((u) => <option key={u}>{u}</option>)}

            </select>

          </div>

        </div>


 

        {/* Total Price */}

        <div className="flex flex-col gap-1.5">

          <label className="text-[12px] font-medium" style={{ color: '#4B5A50' }}>Total Price (AED) *</label>

          <input name="total_price" type="number" required min="0" step="0.01" placeholder="0.00"

            className="rounded-[12px] px-4 py-2.5 text-[13px]"

            style={{ border: '1px solid rgba(22,32,25,.15)', background: 'white', color: '#162019', outline: 'none' }} />

        </div>


 

        {/* Vendor */}

        <div className="flex flex-col gap-1.5">

          <label className="text-[12px] font-medium" style={{ color: '#4B5A50' }}>Vendor / Shop</label>

          <input name="vendor" placeholder="e.g. Al Madina Supermarket"

            className="rounded-[12px] px-4 py-2.5 text-[13px]"

            style={{ border: '1px solid rgba(22,32,25,.15)', background: 'white', color: '#162019', outline: 'none' }} />

        </div>


 

        {/* Purchase date */}

        <div className="flex flex-col gap-1.5">

          <label className="text-[12px] font-medium" style={{ color: '#4B5A50' }}>Date</label>

          <input name="purchased_at" type="date" defaultValue={today}

            className="rounded-[12px] px-4 py-2.5 text-[13px]"

            style={{ border: '1px solid rgba(22,32,25,.15)', background: 'white', color: '#162019', outline: 'none' }} />

        </div>


 

        {/* Notes */}

        <div className="flex flex-col gap-1.5 sm:col-span-2">

          <label className="text-[12px] font-medium" style={{ color: '#4B5A50' }}>Notes</label>

          <input name="notes" placeholder="Optional"

            className="rounded-[12px] px-4 py-2.5 text-[13px]"

            style={{ border: '1px solid rgba(22,32,25,.15)', background: 'white', color: '#162019', outline: 'none' }} />

        </div>


 

        {/* Receipt upload */}

        <div className="sm:col-span-2 lg:col-span-3">

          <ImageUploadField name="receipt_url" bucket="meal-images" folder="receipts" />

        </div>


 

        <div className="sm:col-span-2 lg:col-span-3">

          <button type="submit" className="btn-gold" style={{ height: '44px', padding: '0 28px', fontSize: '13px' }}>

            Add Purchase

          </button>

        </div>

      </form>


 

      {/* ── Filter bar (admin/manager only) ───────────────────── */}

      {isAdmin && (

        <div className="mb-6 rounded-[16px] p-4 flex flex-col gap-3"

          style={{ background: '#FCFBF8', border: '1px solid rgba(22,32,25,.08)' }}>

          <div className="flex flex-wrap gap-2">

            {[{ value: 'all', label: 'All Categories' }, ...CATEGORIES].map((opt) => (

              <Link key={opt.value}

                href={`/admin?tab=inventory&period=${period}&category=${opt.value}${q ? `&q=${encodeURIComponent(q)}` : ''}`}

                className="rounded-full px-3 py-1 text-[12px] font-medium"

                style={category === opt.value

                  ? { background: '#162019', color: '#F6F2E9' }

                  : { border: '1px solid rgba(22,32,25,.15)', color: '#4B5A50' }}>

                {opt.label}

              </Link>

            ))}

          </div>

          <form method="get" className="flex gap-2">

            <input type="hidden" name="tab" value="inventory" />

            <input type="hidden" name="period" value={period} />

            <input type="hidden" name="category" value={category} />

            <input type="text" name="q" defaultValue={q ?? ''} placeholder="Search by item name…"

              className="flex-1 rounded-[12px] px-4 py-2 text-[13px]"

              style={{ border: '1px solid rgba(22,32,25,.15)', background: 'white', color: '#162019', outline: 'none' }} />

            <button type="submit" className="rounded-[12px] px-4 py-2 text-[13px] font-medium"

              style={{ background: '#162019', color: '#F6F2E9' }}>Search</button>

            {q && (

              <Link href={`/admin?tab=inventory&period=${period}&category=${category}`}

                className="rounded-[12px] px-4 py-2 text-[13px] font-medium"

                style={{ border: '1px solid rgba(22,32,25,.15)', color: '#4B5A50' }}>Clear</Link>

            )}

          </form>

        </div>

      )}


 

      {/* ── Purchases list ─────────────────────────────────────── */}

      <div className="rounded-[20px] overflow-hidden" style={{ border: '1px solid rgba(22,32,25,.1)' }}>

        <table className="w-full text-[13px]">

          <thead style={{ background: '#F6F2E9' }}>

            <tr>

              {['Date', 'Item', 'Category', 'Qty', 'Total (AED)', ...(isAdmin ? ['By', 'Receipt', 'Actions'] : ['Receipt'])].map((h) => (

                <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.08em]"

                  style={{ color: '#4B5A50' }}>{h}</th>

              ))}

            </tr>

          </thead>

          <tbody>

            {purchases?.map((p, i) => {

              const buyer = p.buyer as { full_name?: string; email?: string } | null;

              return (

                <tr key={p.id} style={{ background: i % 2 === 0 ? '#FCFBF8' : '#F6F2E9', borderTop: '1px solid rgba(22,32,25,.06)' }}>

                  <td className="px-4 py-3 text-[12px] whitespace-nowrap" style={{ color: '#4B5A50' }}>

                    {new Date(p.purchased_at).toLocaleDateString('en-AE')}

                  </td>

                  <td className="px-4 py-3">

                    <p className="font-medium" style={{ color: '#162019' }}>{p.name}</p>

                    {p.vendor && <p className="text-[11px]" style={{ color: '#4B5A50' }}>{p.vendor}</p>}

                    {p.notes  && <p className="text-[11px]" style={{ color: 'rgba(22,32,25,.4)' }}>{p.notes}</p>}

                  </td>

                  <td className="px-4 py-3">

                    {p.category ? (

                      <span className="rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize"

                        style={{ background: `${CAT_COLORS[p.category]}18`, color: CAT_COLORS[p.category] ?? '#162019' }}>

                        {p.category}

                      </span>

                    ) : '—'}

                  </td>

                  <td className="px-4 py-3 text-[12px]" style={{ color: '#4B5A50' }}>

                    {p.quantity} {p.unit}

                  </td>

                  <td className="px-4 py-3 font-semibold" style={{ color: '#162019' }}>

                    {Number(p.total_price).toFixed(2)}

                  </td>

                  {isAdmin && (

                    <td className="px-4 py-3 text-[12px]" style={{ color: '#4B5A50' }}>

                      {buyer?.full_name ?? buyer?.email ?? '—'}

                    </td>

                  )}

                  <td className="px-4 py-3">

                    {p.receipt_url ? (

                      <a href={p.receipt_url} target="_blank" rel="noopener noreferrer"

                        className="text-[12px] font-medium" style={{ color: '#D8B15A' }}>

                        View

                      </a>

                    ) : <span style={{ color: 'rgba(22,32,25,.3)' }}>—</span>}

                  </td>

                  {isAdmin && (

                    <td className="px-4 py-3">

                      <Link href={`/admin/inventory/${p.id}/edit`}

                        className="text-[12px] font-medium" style={{ color: '#4B5A50' }}>

                        Edit

                      </Link>

                    </td>

                  )}

                </tr>

              );

            })}

            {!purchases?.length && (

              <tr>

                <td colSpan={isAdmin ? 8 : 6}

                  className="px-4 py-10 text-center text-[14px]" style={{ color: '#4B5A50' }}>

                  No purchases yet.

                </td>

              </tr>

            )}

          </tbody>

        </table>

      </div>

    </div>

  );

}