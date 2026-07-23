import { createServerSupabaseClient } from '@/lib/supabase/server';

import { revalidatePath } from 'next/cache';

import { redirect } from 'next/navigation';


 

export default async function StoreSettingsSection() {

  const supabase = await createServerSupabaseClient();


 

  const { data: settings } = await supabase

    .from('store_settings')

    .select('*')

    .eq('id', 1)

    .single();


 

  const { data: recentLogs } = await supabase

    .from('audit_logs')

    .select('*')

    .order('created_at', { ascending: false })

    .limit(30);


 

  async function saveSettings(formData: FormData) {

    'use server';

    const sb = await createServerSupabaseClient();

    await sb.from('store_settings').update({

      is_open:        formData.get('is_open') === 'true',

      open_message:   (formData.get('open_message') as string) || null,

      closed_message: (formData.get('closed_message') as string) || null,

      updated_at:     new Date().toISOString(),

    }).eq('id', 1);

    revalidatePath('/admin');

    redirect('/admin?tab=settings&toast=Settings+saved');

  }


 

  const isOpen = settings?.is_open ?? true;


 

  return (

    <div>

      <h1 className="font-display text-[32px] font-semibold mb-6" style={{ color: '#162019' }}>

        Store Settings

      </h1>


 

      {/* Store open/close */}

      <form action={saveSettings}

        className="mb-8 rounded-[20px] p-6 flex flex-col gap-5"

        style={{ background: '#FCFBF8', border: '1px solid rgba(22,32,25,.08)' }}>

        <div className="flex items-start justify-between gap-6 flex-wrap">

          <div>

            <h2 className="font-semibold text-[16px]" style={{ color: '#162019' }}>Store Status</h2>

            <p className="mt-1 text-[13px]" style={{ color: '#4B5A50' }}>

              Controls whether the store accepts new orders

            </p>

          </div>

          <div className="flex items-center gap-3">

            <span

              className="rounded-full px-3 py-1 text-[12px] font-semibold uppercase tracking-[0.08em]"

              style={isOpen

                ? { background: 'rgba(22,160,133,.1)', color: '#16a34a' }

                : { background: 'rgba(185,58,58,.08)', color: '#b93a3a' }}

            >

              {isOpen ? 'Open' : 'Closed'}

            </span>

          </div>

        </div>


 

        <div className="flex flex-col gap-1.5">

          <label className="text-[12px] font-medium" style={{ color: '#4B5A50' }}>Store Status</label>

          <select name="is_open" defaultValue={String(isOpen)}

            className="rounded-[12px] px-4 py-2.5 text-[13px] max-w-xs"

            style={{ border: '1px solid rgba(22,32,25,.15)', background: 'white', color: '#162019', outline: 'none' }}>

            <option value="true">Open — accepting orders</option>

            <option value="false">Closed — not accepting orders</option>

          </select>

        </div>


 

        <div className="flex flex-col gap-1.5">

          <label className="text-[12px] font-medium" style={{ color: '#4B5A50' }}>Open Message</label>

          <input name="open_message" type="text"

            defaultValue={settings?.open_message ?? 'We are open and taking orders!'}

            className="rounded-[12px] px-4 py-2.5 text-[13px]"

            style={{ border: '1px solid rgba(22,32,25,.15)', background: 'white', color: '#162019', outline: 'none' }} />

        </div>


 

        <div className="flex flex-col gap-1.5">

          <label className="text-[12px] font-medium" style={{ color: '#4B5A50' }}>Closed Message (shown to customers)</label>

          <input name="closed_message" type="text"

            defaultValue={settings?.closed_message ?? 'We are currently closed. Please check back later.'}

            className="rounded-[12px] px-4 py-2.5 text-[13px]"

            style={{ border: '1px solid rgba(22,32,25,.15)', background: 'white', color: '#162019', outline: 'none' }} />

        </div>


 

        {settings?.updated_at && (

          <p className="text-[12px]" style={{ color: 'rgba(22,32,25,.4)' }}>

            Last updated {new Date(settings.updated_at).toLocaleString('en-AE')}

          </p>

        )}


 

        <div>

          <button type="submit" className="btn-gold" style={{ height: '44px', padding: '0 28px', fontSize: '13px' }}>

            Save Settings

          </button>

        </div>

      </form>


 

      {/* Audit log */}

      <div>

        <h2 className="font-display text-[22px] font-semibold mb-4" style={{ color: '#162019' }}>Audit Log</h2>

        {recentLogs && recentLogs.length > 0 ? (

          <div className="rounded-[20px] overflow-hidden" style={{ border: '1px solid rgba(22,32,25,.1)' }}>

            <table className="w-full text-[13px]">

              <thead style={{ background: '#F6F2E9' }}>

                <tr>

                  {['Time', 'User', 'Action', 'Entity', 'ID'].map(h => (

                    <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.08em]"

                      style={{ color: '#4B5A50' }}>{h}</th>

                  ))}

                </tr>

              </thead>

              <tbody>

                {recentLogs.map((log, i) => (

                  <tr key={log.id} style={{ background: i % 2 === 0 ? '#FCFBF8' : '#F6F2E9', borderTop: '1px solid rgba(22,32,25,.06)' }}>

                    <td className="px-4 py-3 text-[11px]" style={{ color: '#4B5A50' }}>

                      {new Date(log.created_at).toLocaleString('en-AE')}

                    </td>

                    <td className="px-4 py-3 text-[12px]" style={{ color: '#4B5A50' }}>{log.user_email ?? '—'}</td>

                    <td className="px-4 py-3">

                      <span className="rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize"

                        style={

                          log.action === 'create' ? { background: 'rgba(22,160,133,.08)', color: '#16a34a' } :

                          log.action === 'delete' ? { background: 'rgba(185,58,58,.08)', color: '#b93a3a' } :

                          { background: 'rgba(216,177,90,.1)', color: '#b98a3d' }

                        }>

                        {log.action}

                      </span>

                    </td>

                    <td className="px-4 py-3 capitalize" style={{ color: '#162019' }}>{log.entity}</td>

                    <td className="px-4 py-3 font-mono text-[11px]" style={{ color: '#4B5A50' }}>

                      {log.entity_id ? log.entity_id.slice(-8) : '—'}

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        ) : (

          <p className="text-[13px]" style={{ color: '#4B5A50' }}>No audit entries yet.</p>

        )}

      </div>

    </div>

  );

}