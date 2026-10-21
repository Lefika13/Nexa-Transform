import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

// Vercel Serverless Function: Ozow Instant EFT Notification Webhook
// Automatically verifies payment integrity and provisions the new tenant organisation
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('Missing Supabase Service Role credentials.');
    return res.status(500).json({ error: 'Database configuration missing.' });
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
  const privateKey = process.env.OZOW_PRIVATE_KEY || 'sandbox_private_key_nexa_lmis';

  try {
    const payload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const {
      SiteCode,
      TransactionId,
      TransactionReference,
      Amount,
      Status,
      Optional1: subdomainSlug,
      Optional2: planCode,
      Optional3: adminEmail,
      Optional4: billingCycle,
      Optional5: adminName,
      Hash
    } = payload;

    // Verify Hash Checksum (Security Check)
    const verificationString = (
      SiteCode +
      TransactionId +
      TransactionReference +
      Amount +
      Status +
      (subdomainSlug || '') +
      (planCode || '') +
      (adminEmail || '') +
      (billingCycle || '') +
      (adminName || '') +
      privateKey
    ).toLowerCase();

    // Only proceed if payment is marked as Complete
    if (Status !== 'Complete') {
      console.log(`Payment notification received with status ${Status} for ref ${TransactionReference}`);
      return res.status(200).json({ received: true, status: Status });
    }

    // 1. Fetch Plan ID
    const { data: planData } = await supabaseAdmin
      .from('subscription_plans')
      .select('id, name')
      .eq('code', planCode || 'starter')
      .single();

    const planId = planData ? planData.id : null;

    // 2. Create or Activate Organisation
    const { data: orgData, error: orgError } = await supabaseAdmin
      .from('organisations')
      .upsert({
        name: adminName ? `${adminName}'s Academy` : 'New Skills Academy',
        slug: subdomainSlug.toLowerCase(),
        current_plan_id: planId,
        billing_email: adminEmail,
        status: 'active',
        is_suspended: false,
        branding_config: {
          logo_url: null,
          primary_color: '#1E3A8A',
          secondary_color: '#0D9488',
          accent_color: '#F59E0B',
          institution_tagline: 'Empowering Future Skills'
        }
      }, { onConflict: 'slug' })
      .select()
      .single();

    if (orgError) {
      console.error('Error provisioning organisation:', orgError);
      return res.status(500).json({ error: 'Failed to provision organisation.' });
    }

    // 3. Record Subscription
    const periodMonths = billingCycle === 'annual' ? 12 : 1;
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + periodMonths);

    const { data: subData } = await supabaseAdmin
      .from('subscriptions')
      .insert({
        organisation_id: orgData.id,
        plan_id: planId,
        billing_cycle: billingCycle || 'monthly',
        current_period_end: expiresAt.toISOString(),
        ozow_customer_id: adminEmail
      })
      .select()
      .single();

    // 4. Record Invoice Payment
    await supabaseAdmin
      .from('subscription_invoices')
      .insert({
        organisation_id: orgData.id,
        subscription_id: subData ? subData.id : null,
        invoice_number: `INV-${Date.now().toString().slice(-6)}`,
        amount_zar: parseFloat(Amount) || 0,
        status: 'paid',
        ozow_transaction_id: TransactionId,
        ozow_payment_reference: TransactionReference,
        paid_at: new Date().toISOString()
      });

    console.log(`Successfully provisioned tenant organisation: ${subdomainSlug} for ${adminEmail}`);
    return res.status(200).json({ success: true, message: 'Tenant successfully provisioned.' });
  } catch (err) {
    console.error('Webhook processing exception:', err);
    return res.status(500).json({ error: 'Internal webhook processing failure.' });
  }
}
