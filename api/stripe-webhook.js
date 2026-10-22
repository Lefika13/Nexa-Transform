import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://bwygpjlzoefhfixtyxdg.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Stripe Webhook Handler
 * Listens for checkout.session.completed to provision subscriber organisations in PostgreSQL.
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const event = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

    if (event.type === 'checkout.session.completed') {
      const session = event.data?.object;
      const meta = session?.metadata || {};

      const academyName = meta.academy_name;
      const slug = meta.subdomain_slug;
      const billingEmail = meta.admin_email;
      const contactPhone = meta.contact_phone;
      const planCode = meta.plan_code || 'growth';

      if (slug && academyName) {
        // 1. Look up plan ID
        const { data: plans } = await supabase
          .from('subscription_plans')
          .select('id')
          .eq('code', planCode)
          .limit(1);

        const planId = plans?.[0]?.id || null;

        // 2. Insert into organisations
        const { data: orgData, error: orgError } = await supabase
          .from('organisations')
          .upsert({
            name: academyName,
            slug: slug,
            billing_email: billingEmail,
            contact_phone: contactPhone,
            current_plan_id: planId,
            status: 'active',
            is_suspended: false,
            updated_at: new Date().toISOString()
          }, { onConflict: 'slug' })
          .select()
          .single();

        if (orgError) {
          console.error('Supabase organisation provisioning error:', orgError);
        } else if (orgData?.id && planId) {
          // 3. Record active subscription
          await supabase
            .from('subscriptions')
            .insert({
              organisation_id: orgData.id,
              plan_id: planId,
              status: 'active',
              billing_cycle: meta.billing_cycle || 'annual',
              current_period_start: new Date().toISOString(),
              current_period_end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
            });
        }
      }
    }

    return res.status(200).json({ received: true });
  } catch (err) {
    console.error('Stripe webhook processing error:', err);
    return res.status(400).json({ error: err.message });
  }
}
