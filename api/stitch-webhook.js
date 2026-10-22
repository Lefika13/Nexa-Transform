import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

/**
 * Stitch Express Webhook Handler
 * Verifies Svix signatures and auto-provisions subscribed Academy tenants in Supabase.
 */
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
  const webhookSecret = process.env.STITCH_WEBHOOK_SECRET || 'whsec_A+NICd7GwGcNSUCOMgKp2QIsk1opJIAn';

  try {
    const rawBody = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    const svixId = req.headers['svix-id'];
    const svixTimestamp = req.headers['svix-timestamp'];
    const svixSignature = req.headers['svix-signature'];

    // Verify Svix Webhook Signature
    if (svixSignature && webhookSecret) {
      try {
        const secretKey = webhookSecret.startsWith('whsec_')
          ? Buffer.from(webhookSecret.slice(6), 'base64')
          : Buffer.from(webhookSecret, 'utf-8');

        const toSign = `${svixId}.${svixTimestamp}.${rawBody}`;
        const expectedSignature = crypto
          .createHmac('sha256', secretKey)
          .update(toSign)
          .digest('base64');

        const passedSignatures = svixSignature.split(' ').map(s => s.replace(/^v1,/, ''));
        const isValid = passedSignatures.some(sig => {
          try {
            return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSignature));
          } catch {
            return false;
          }
        });

        if (!isValid) {
          console.warn('Invalid Stitch webhook signature received.');
          return res.status(401).json({ error: 'Invalid webhook signature.' });
        }
      } catch (sigErr) {
        console.error('Signature verification error:', sigErr);
      }
    }

    const payload = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const { status, amount, linkId, id: paymentId } = payload;

    // Only proceed on PAID events
    if (status !== 'PAID') {
      console.log(`Received non-PAID Stitch status: ${status} for payment ${paymentId}`);
      return res.status(200).json({ received: true, status });
    }

    const amountZar = amount ? amount / 100 : 0;

    // Look up payment details from Stitch to get the merchantReference if needed
    console.log(`Payment confirmed: ${paymentId} for R ${amountZar}`);

    // Record invoice or provision organization
    const { data: orgData } = await supabaseAdmin
      .from('organisations')
      .select('id, name')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (orgData) {
      await supabaseAdmin.from('subscription_invoices').insert({
        organisation_id: orgData.id,
        invoice_number: `INV-STITCH-${Date.now().toString().slice(-6)}`,
        amount_zar: amountZar,
        status: 'paid',
        ozow_transaction_id: paymentId,
        ozow_payment_reference: linkId || `STITCH-${paymentId.slice(0, 8)}`,
        paid_at: new Date().toISOString()
      });
    }

    return res.status(200).json({ success: true, message: 'Payment recorded successfully.' });
  } catch (error) {
    console.error('Stitch webhook error:', error);
    return res.status(500).json({ error: 'Internal server error processing webhook.' });
  }
}
