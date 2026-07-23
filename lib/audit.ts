import { createServiceSupabaseClient } from '@/lib/supabase/server';

import { createServerSupabaseClient } from '@/lib/supabase/server';


 

export async function logAudit({

  action,

  entity,

  entityId,

  details,

}: {

  action: 'create' | 'update' | 'delete';

  entity: string;

  entityId?: string;

  details?: Record<string, unknown>;

}) {

  try {

    const [supabase, service] = await Promise.all([

      createServerSupabaseClient(),

      Promise.resolve(createServiceSupabaseClient()),

    ]);


 

    const { data: { user } } = await supabase.auth.getUser();


 

    await service.from('audit_logs').insert({

      user_id:    user?.id    ?? null,

      user_email: user?.email ?? null,

      action,

      entity,

      entity_id: entityId ?? null,

      details:   details  ?? null,

    });

  } catch {

    // Audit logging should never break the main flow

    console.warn('[audit] failed to write log');

  }

}