import Link from 'next/link';

import { redirect } from 'next/navigation';

import { revalidatePath } from 'next/cache';

import { createServerSupabaseClient, createServiceSupabaseClient } from '@/lib/supabase/server';

import { getTodayDateString } from '@/lib/utils';

import InventoryPurchaseForm from '@/components/InventoryPurchaseForm';

import InventoryUsageForm    from '@/components/InventoryUsageForm';

import AutoRefresh           from '@/components/AutoRefresh';


 

const CAT_COLORS: Record<string, string> = {

  produce: '#16a34a', dairy: '#1a64c8', spices: '#b98a3d',

  grains:  '#7e22ce', oil:   '#b45309', packaging: '#4B5A50', other: '#162019',

};


 

export const dynamic = 'force-dynamic';


 

export default async function InventoryPage({

  searchParams,

}: {

  searchParams: Promise<{ tab?: string; q?: string; period?: string }>;

}) {

  const { tab = 'stock', q, period: periodParam = 'all' } = await searchParams;

  const period = ['today', '7d', '30d', 'all'].includes(periodParam) ? periodParam : 'all';

  const today = getTodayDateString();


 

  const supabase = await createServerSupabaseClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login?redirect=/admin/inventory');


 

  // Service client for all inventory reads (bypasses RLS)

  const sb = createServiceSupabaseClient();


 

  // Role check

  const { data: profile } = await sb.from('profiles').select('role').eq('id', user.id).single();

  const role    = profile?.role ?? 'customer';

  const isAdmin = role === 'admin' || role === 'manager';


 

  /* ── Fetch all purchases (no date filter — for stock calculation) ─── */

  const { data: allPurchases } = await sb

    .from('inventory_purchases')

    .select('name, category, unit, quantity, total_price, purchased_at, vendor, receipt_url, bill_id, purchased_by, notes, id, purchaser:profiles!purchased_by(full_name, email)')

    .order('purchased_at', { ascending: false });


 

  /* ── Fetch usage log ─────────────────────────────────────────────── */

  const { data: allUsage } = await sb

    .from('inventory_usage')

    .select('item_name, unit, quantity, used_at, notes, used_by, logger:profiles!used_by(full_name, email)')

    .order('used_at', { ascending: false });


 

  /* ── Fetch thresholds ────────────────────────────────────────────── */

  const { data: thresholds } = await sb

    .from('inventory_thresholds')

    .select('item_name, threshold, unit');


 

  const thresholdMap = Object.fromEntries(

    (thresholds ?? []).map((t) => [t.item_name, t.threshold])

  );


 

  /* ── Compute current stock per item ─────────────────────────────── */

  const stockMap: Record<string, { qty: number; unit: string; category: string }> = {};


 

  for (const p of allPurchases ?? []) {

    const key = p.name;

    if (!stockMap[key]) stockMap[key] = { qty: 0, unit: p.unit ?? 'kg', category: p.category ?? 'other' };

    stockMap[key].qty += Number(p.quantity) || 0;

  }

  for (const u of allUsage ?? []) {

    const key = u.item_name;

    if (!stockMap[key]) stockMap[key] = { qty: 0, unit: u.unit ?? 'kg', category: 'other' };

    stockMap[key].qty -= Number(u.quantity) || 0;

  }


 

  const stockItems = Object.entries(stockMap)

    .map(([name, { qty, unit, category }]) => ({

      name,

      qty: Math.max(0, qty), // don't go negative in display

      unit,

      category,

      threshold: thresholdMap[name] ?? 0,

      isLow: thresholdMap[name] != null && qty <= thresholdMap[name],

    }))

    .sort((a, b) => (b.isLow ? 1 : 0) - (a.isLow ? 1 : 0) || a.name.localeCompare(b.name));


 

  const lowStockCount = stockItems.filter((i) => i.isLow).length;


 

  /* ── Distinct item names (for autocomplete) ─────────────────────── */

  // purchasedItemNames: only items that have been purchased (for usage form validation)

  const purchasedItemNames = [...new Set((allPurchases ?? []).map((p) => p.name))].sort();

  // itemNames: full set (purchases + any historical usage entries)

  const usageNames = (allUsage ?? []).map((u) => u.item_name);

  const itemNames  = [...new Set([...purchasedItemNames, ...usageNames])].sort();


 

  /* ── Recent purchases (last 100) ─────────────────────────────────── */

  const recentPurchases = (allPurchases ?? []).slice(0, 100);


 

  /* ── Spend analytics — filtered by selected period ───────────────── */

  const now       = new Date();

  const todayStr  = getTodayDateString();

  const last7Str  = new Date(now.getTime() - 6  * 86400000).toISOString().slice(0, 10);

  const last30Str = new Date(now.getTime() - 29 * 86400000).toISOString().slice(0, 10);


 

  const periodStart: string | null =

    period === 'today' ? todayStr  :

    period === '7d'    ? last7Str  :

    period === '30d'   ? last30Str :

    null; // 'all' — no filter


 

  const periodPurchases = (allPurchases ?? []).filter((p) =>

    periodStart === null || p.purchased_at.slice(0, 10) >= periodStart

  );


 

  const spendPeriod     = periodPurchases.reduce((s, p) => s + Number(p.total_price), 0);

  const countPeriod     = periodPurchases.length;

  const avgPeriod       = countPeriod > 0 ? spendPeriod / countPeriod : 0;


 

  // Category breakdown for the selected period

  const spendByCategory: Record<string, number> = {};

  for (const p of periodPurchases) {

    const cat = p.category ?? 'other';

    spendByCategory[cat] = (spendByCategory[cat] ?? 0) + Number(p.total_price);

  }


 

  /* ── Recent usage (last 50) ──────────────────────────────────────── */

  const recentUsage = (allUsage ?? []).slice(0, 50);


 

  /* ── Server action: save threshold ──────────────────────────────── */

  async function saveThreshold(formData: FormData) {

    'use server';

    const sbSvc = createServiceSupabaseClient();

    const item  = formData.get('item_name') as string;

    const val   = Number(formData.get('threshold') ?? 0);

    const unit  = formData.get('unit') as string;

    if (!item) return;

    await sbSvc.from('inventory_thresholds').upsert({

      item_name: item, threshold: val, unit: unit || null,

      updated_at: new Date().toISOString(),

    });

    revalidatePath('/admin/inventory');

  }


 

  /* ── Server action: delete purchase ─────────────────────────────── */

  async function deletePurchase(id: string) {

    'use server';

    const sbSvc = createServiceSupabaseClient();

    await sbSvc.from('inventory_purchases').delete().eq('id', id);

    revalidatePath('/admin/inventory');

  }


 

  const TAB_LINKS = [

    { id: 'stock',    label: `Stock${lowStockCount > 0 ? ` (⚠ ${lowStockCount})` : ''}` },

    { id: 'purchase', label: 'Log Purchase' },

    { id: 'usage',    label: 'Log Usage' },

    { id: 'history',  label: 'Purchase History' },

    { id: 'log',      label: 'Usage Log' },

  ].filter((t) => isAdmin || ['stock', 'usage', 'log'].includes(t.id));


 

  return (

    <div>

      <AutoRefresh interval={60000} />


 

      {/* Page header */}

      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">

        <div>

          <Link href="/admin" className="text-[12px] font-medium" style={{ color: '#4B5A50' }}>← Dashboard</Link>

          <h1 className="font-display text-[32px] font-semibold mt-1" style={{ color: '#162019' }}>Inventory</h1>

          {lowStockCount > 0 && (

            <p className="mt-1 text-[13px] font-medium" style={{ color: '#b93a3a' }}>

              ⚠ {lowStockCount} item{lowStockCount > 1 ? 's' : ''} below threshold

            </p>

          )}

        </div>

      </div>


 

      {/* Tab nav */}

      <div className="flex flex-wrap gap-2 mb-6">

        {TAB_LINKS.map((t) => (

          <Link key={t.id} href={`/admin/inventory?tab=${t.id}`}

            className="rounded-full px-4 py-1.5 text-[12px] font-semibold transition-colors duration-150"

            style={tab === t.id

              ? { background: '#162019', color: '#F6F2E9' }

              : { border: '1px solid rgba(22,32,25,.15)', color: '#4B5A50' }}>

            {t.label}

          </Link>

        ))}

      </div>


 

      {/* ── STOCK OVERVIEW ─────────────────────────────────────────────── */}

      {tab === 'stock' && (

        <div>


 

          {/* Period switcher + spend infographics */}

          {isAdmin && allPurchases && allPurchases.length > 0 && (

            <div className="mb-6">

              {/* Period tabs */}

              <div className="flex flex-wrap gap-2 mb-4">

                {[

                  { id: 'today', label: 'Today' },

                  { id: '7d',    label: 'Last 7 Days' },

                  { id: '30d',   label: 'Last 30 Days' },

                  { id: 'all',   label: 'All Time' },

                ].map((p) => (

                  <Link key={p.id}

                    href={`/admin/inventory?tab=stock&period=${p.id}`}

                    className="rounded-full px-4 py-1.5 text-[12px] font-semibold transition-colors duration-150"

                    style={period === p.id

                      ? { background: '#162019', color: '#F6F2E9' }

                      : { border: '1px solid rgba(22,32,25,.15)', color: '#4B5A50' }}>

                    {p.label}

                  </Link>

                ))}

              </div>


 

              {/* Stat cards */}

              <div className="grid gap-3 sm:grid-cols-3">

                <div className="rounded-[16px] p-5" style={{ background: '#FCFBF8', border: '1px solid rgba(22,32,25,.08)' }}>

                  <p className="text-[11px] font-semibold uppercase tracking-[0.1em] mb-2" style={{ color: '#4B5A50' }}>Total Spend</p>

                  <p className="font-display text-[30px] font-bold leading-none" style={{ color: '#162019' }}>

                    AED {spendPeriod.toLocaleString('en-AE', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}

                  </p>

                  <p className="mt-1 text-[11px]" style={{ color: 'rgba(22,32,25,.4)' }}>

                    {period === 'today' ? 'today' : period === '7d' ? 'last 7 days' : period === '30d' ? 'last 30 days' : 'all time'}

                  </p>

                </div>


 

                <div className="rounded-[16px] p-5" style={{ background: '#FCFBF8', border: '1px solid rgba(22,32,25,.08)' }}>

                  <p className="text-[11px] font-semibold uppercase tracking-[0.1em] mb-2" style={{ color: '#4B5A50' }}>Purchases</p>

                  <p className="font-display text-[30px] font-bold leading-none" style={{ color: '#162019' }}>{countPeriod}</p>

                  <p className="mt-1 text-[11px]" style={{ color: 'rgba(22,32,25,.4)' }}>bill entries logged</p>

                </div>


 

                <div className="rounded-[16px] p-5" style={{ background: '#FCFBF8', border: '1px solid rgba(22,32,25,.08)' }}>

                  <p className="text-[11px] font-semibold uppercase tracking-[0.1em] mb-2" style={{ color: '#4B5A50' }}>Avg per Purchase</p>

                  <p className="font-display text-[30px] font-bold leading-none" style={{ color: '#162019' }}>

                    {countPeriod > 0

                      ? `AED ${avgPeriod.toLocaleString('en-AE', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`

                      : '—'}

                  </p>

                  <p className="mt-1 text-[11px]" style={{ color: 'rgba(22,32,25,.4)' }}>per bill entry</p>

                </div>

              </div>

            </div>

          )}


 

          {/* Spend by category — filtered for the selected period */}

          {isAdmin && Object.keys(spendByCategory).length > 0 && (

            <div className="mb-6 rounded-[16px] p-5" style={{ background: '#FCFBF8', border: '1px solid rgba(22,32,25,.08)' }}>

              <p className="text-[11px] font-semibold uppercase tracking-[0.1em] mb-4" style={{ color: '#4B5A50' }}>Spend by Category</p>

              <div className="flex flex-col gap-3">

                {Object.entries(spendByCategory)

                  .sort(([, a], [, b]) => b - a)

                  .map(([cat, amt]) => {

                    const pct = spendPeriod > 0 ? (amt / spendPeriod) * 100 : 0;

                    return (

                      <div key={cat}>

                        <div className="flex justify-between mb-1">

                          <div className="flex items-center gap-2">

                            <span className="h-2 w-2 rounded-full shrink-0"

                              style={{ background: CAT_COLORS[cat] ?? '#162019' }} />

                            <span className="text-[13px] capitalize font-medium" style={{ color: '#162019' }}>{cat}</span>

                          </div>

                          <span className="text-[12px] font-semibold" style={{ color: '#162019' }}>

                            AED {amt.toLocaleString('en-AE', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}

                            <span className="ml-2 font-normal" style={{ color: 'rgba(22,32,25,.4)' }}>{pct.toFixed(0)}%</span>

                          </span>

                        </div>

                        <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(22,32,25,.06)' }}>

                          <div className="h-full rounded-full transition-all duration-500"

                            style={{ width: `${pct}%`, background: CAT_COLORS[cat] ?? '#162019' }} />

                        </div>

                      </div>

                    );

                  })}

              </div>

            </div>

          )}


 

          {countPeriod === 0 && period !== 'all' && allPurchases && allPurchases.length > 0 && (

            <div className="mb-6 rounded-[14px] px-5 py-4 text-center text-[13px]"

              style={{ background: 'rgba(22,32,25,.03)', border: '1px solid rgba(22,32,25,.06)', color: '#4B5A50' }}>

              No purchases in this period.

            </div>

          )}


 

          {stockItems.length === 0 ? (

            <p className="py-10 text-center text-[14px]" style={{ color: '#4B5A50' }}>

              No inventory data yet. Log your first purchase to start tracking stock.

            </p>

          ) : (

            <div className="rounded-[20px] overflow-x-auto" style={{ border: '1px solid rgba(22,32,25,.1)' }}>

              <table className="w-full text-[13px]" style={{ minWidth: '560px' }}>

                <thead style={{ background: '#F6F2E9' }}>

                  <tr>

                    {['Item', 'Category', 'In Stock', isAdmin ? 'Alert At' : ''].filter(Boolean).map((h) => (

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

                          <p className="font-medium" style={{ color: '#162019' }}>{item.name}</p>

                          {item.isLow && (

                            <span className="rounded-full px-1.5 py-0.5 text-[9px] font-bold"

                              style={{ background: 'rgba(185,58,58,.08)', color: '#b93a3a' }}>LOW</span>

                          )}

                        </div>

                      </td>

                      <td className="px-4 py-3">

                        <span className="rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize"

                          style={{ background: `${CAT_COLORS[item.category] ?? '#162019'}18`, color: CAT_COLORS[item.category] ?? '#162019' }}>

                          {item.category}

                        </span>

                      </td>

                      <td className="px-4 py-3 font-bold text-[15px]"

                        style={{ color: item.isLow ? '#b93a3a' : '#162019' }}>

                        {item.qty.toFixed(item.qty % 1 === 0 ? 0 : 2)}

                        <span className="ml-1 text-[12px] font-normal" style={{ color: '#4B5A50' }}>{item.unit}</span>

                      </td>

                      {isAdmin && (

                        <td className="px-4 py-3">

                          <form action={saveThreshold} className="flex flex-col gap-0.5">

                            <input type="hidden" name="item_name" value={item.name} />

                            <input type="hidden" name="unit" value={item.unit} />

                            <div className="flex gap-1.5 items-center">

                              <input type="number" name="threshold" min="0" step="0.01"

                                defaultValue={item.threshold || ''}

                                placeholder="0"

                                className="w-16 rounded-[8px] px-2 py-1.5 text-[12px]"

                                style={{ border: '1px solid rgba(22,32,25,.15)', background: 'white', color: '#162019', outline: 'none' }} />

                              <span className="text-[11px]" style={{ color: '#4B5A50' }}>{item.unit}</span>

                              <button type="submit"

                                className="rounded-[8px] px-2 py-1.5 text-[11px] font-medium"

                                style={{ background: 'rgba(22,32,25,.08)', color: '#162019' }}>

                                Set

                              </button>

                            </div>

                            {item.threshold > 0 && (

                              <p className="text-[10px]" style={{ color: 'rgba(22,32,25,.4)' }}>current: ≤ {item.threshold} {item.unit}</p>

                            )}

                          </form>

                        </td>

                      )}

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          )}

        </div>

      )}


 

      {/* ── LOG PURCHASE ────────────────────────────────────────────────── */}

      {tab === 'purchase' && isAdmin && (

        <InventoryPurchaseForm itemNames={itemNames} today={today} />

      )}


 

      {/* ── LOG USAGE ───────────────────────────────────────────────────── */}

      {tab === 'usage' && (

        <InventoryUsageForm stockItems={stockItems} today={today} />

      )}


 

      {/* ── PURCHASE HISTORY ────────────────────────────────────────────── */}

      {tab === 'history' && isAdmin && (

        <div>

          <div className="rounded-[20px] overflow-x-auto" style={{ border: '1px solid rgba(22,32,25,.1)' }}>

            <table className="w-full text-[13px]" style={{ minWidth: '720px' }}>

              <thead style={{ background: '#F6F2E9' }}>

                <tr>

                  {['Date', 'Item', 'Category', 'Qty', 'Price (AED)', 'Vendor', 'Added By', 'Receipt', ''].map((h) => (

                    <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.08em]"

                      style={{ color: '#4B5A50' }}>{h}</th>

                  ))}

                </tr>

              </thead>

              <tbody>

                {recentPurchases.map((p, i) => (

                  <tr key={p.id}

                    style={{ background: i % 2 === 0 ? '#FCFBF8' : '#F6F2E9', borderTop: '1px solid rgba(22,32,25,.06)' }}>

                    <td className="px-4 py-3 text-[12px] whitespace-nowrap" style={{ color: '#4B5A50' }}>

                      {new Date(p.purchased_at).toLocaleDateString('en-AE')}

                    </td>

                    <td className="px-4 py-3">

                      <p className="font-medium" style={{ color: '#162019' }}>{p.name}</p>

                      {p.notes && <p className="text-[11px]" style={{ color: 'rgba(22,32,25,.4)' }}>{p.notes}</p>}

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

                      {Number(p.quantity).toFixed(Number(p.quantity) % 1 === 0 ? 0 : 2)} {p.unit}

                    </td>

                    <td className="px-4 py-3 font-semibold" style={{ color: '#162019' }}>

                      {Number(p.total_price).toFixed(2)}

                    </td>

                    <td className="px-4 py-3 text-[12px]" style={{ color: '#4B5A50' }}>

                      {p.vendor ?? '—'}

                    </td>

                    <td className="px-4 py-3 text-[12px]" style={{ color: '#4B5A50' }}>

                      {(() => {

                        const pr = (p as { purchaser?: { full_name?: string; email?: string } | null }).purchaser;

                        return pr?.full_name ?? pr?.email ?? '—';

                      })()}

                    </td>

                    <td className="px-4 py-3">

                      {p.receipt_url ? (

                        <a href={p.receipt_url} target="_blank" rel="noopener noreferrer"

                          className="text-[12px] font-medium" style={{ color: '#D8B15A' }}>View</a>

                      ) : <span style={{ color: 'rgba(22,32,25,.3)' }}>—</span>}

                    </td>

                    <td className="px-4 py-3">

                      <form action={deletePurchase.bind(null, p.id)}>

                        <button type="submit" className="text-[11px]" style={{ color: '#b93a3a' }}>

                          Delete

                        </button>

                      </form>

                    </td>

                  </tr>

                ))}

                {!recentPurchases.length && (

                  <tr><td colSpan={8} className="px-4 py-10 text-center text-[13px]" style={{ color: '#4B5A50' }}>

                    No purchases yet.

                  </td></tr>

                )}

              </tbody>

            </table>

          </div>

        </div>

      )}


 

      {/* ── USAGE LOG ─────────────────────────────────────────────────────── */}

      {tab === 'log' && (

        <div>

          <div className="rounded-[20px] overflow-x-auto" style={{ border: '1px solid rgba(22,32,25,.1)' }}>

            <table className="w-full text-[13px]" style={{ minWidth: '560px' }}>

              <thead style={{ background: '#F6F2E9' }}>

                <tr>

                  {['Date', 'Item', 'Qty Used', 'Notes', 'Logged By'].map((h) => (

                    <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.08em]"

                      style={{ color: '#4B5A50' }}>{h}</th>

                  ))}

                </tr>

              </thead>

              <tbody>

                {recentUsage.map((u, i) => (

                  <tr key={i}

                    style={{ background: i % 2 === 0 ? '#FCFBF8' : '#F6F2E9', borderTop: '1px solid rgba(22,32,25,.06)' }}>

                    <td className="px-4 py-3 text-[12px] whitespace-nowrap" style={{ color: '#4B5A50' }}>

                      {new Date(u.used_at).toLocaleDateString('en-AE')}

                    </td>

                    <td className="px-4 py-3 font-medium" style={{ color: '#162019' }}>{u.item_name}</td>

                    <td className="px-4 py-3 text-[12px]" style={{ color: '#b93a3a' }}>

                      −{Number(u.quantity).toFixed(Number(u.quantity) % 1 === 0 ? 0 : 2)} {u.unit}

                    </td>

                    <td className="px-4 py-3 text-[12px]" style={{ color: '#4B5A50' }}>{u.notes ?? '—'}</td>

                    <td className="px-4 py-3 text-[12px]" style={{ color: '#4B5A50' }}>

                      {(() => {

                        const lg = (u as { logger?: { full_name?: string; email?: string } | null }).logger;

                        return lg?.full_name ?? lg?.email ?? '—';

                      })()}

                    </td>

                  </tr>

                ))}

                {!recentUsage.length && (

                  <tr><td colSpan={5} className="px-4 py-10 text-center text-[13px]" style={{ color: '#4B5A50' }}>

                    No usage logged yet.

                  </td></tr>

                )}

              </tbody>

            </table>

          </div>

        </div>

      )}

    </div>

  );

}