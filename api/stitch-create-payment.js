import { checkRateLimit } from './_rateLimit.js';

/**
 * Stitch Express Payment Link Generator
 * Communicates with https://express.stitch.money/api/v1/ to issue payment links
 * for Academy Subscriptions.
 */
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Rate Limiting Protection
  const clientIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || 'unknown';
  const rate = checkRateLimit(clientIp, 15, 60 * 1000);
  if (!rate.allowed) {
    return res.status(429).json({ error: 'Too many requests. Please wait a minute.' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const {
      planCode,
      billingCycle,
      academyName,
      subdomainSlug,
      adminEmail,
      adminName,
      contactPhone
    } = body;

    if (!planCode || !academyName || !subdomainSlug || !adminEmail) {
      return res.status(400).json({ error: 'Missing required subscription fields.' });
    }

    // Determine Base Price in ZAR
    let baseAmountZar = 25000;
    if (planCode === 'growth') baseAmountZar = 45000;
    if (planCode === 'pro_plus') baseAmountZar = 60000;

    // Apply 15% discount for annual
    const totalAmountZar = billingCycle === 'annual'
      ? Math.round(baseAmountZar * 12 * 0.85)
      : baseAmountZar;

    // Stitch Express amounts are in South African Cents (1 ZAR = 100 cents)
    const amountInCents = totalAmountZar * 100;

    const clientId = process.env.STITCH_CLIENT_ID || 'test-c485a22d-a03f-404e-88db-bb569e18ffd4';
    const clientSecret = process.env.STITCH_CLIENT_SECRET || '4A8iw0LJo72LepXr4mhq3Rd+q1e/kg6uVhpapm8K0j2r0Dp8SdyeZ4JQrOF0nMPn';

    // 1. Authenticate with Stitch Express API
    const tokenRes = await fetch('https://express.stitch.money/api/v1/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientId,
        clientSecret,
        scope: 'client_paymentrequest'
      })
    });

    const tokenData = await tokenRes.json();
    if (!tokenRes.ok || !tokenData.data?.accessToken) {
      console.error('Failed to obtain Stitch Express token:', tokenData);
      return res.status(502).json({ error: 'Unable to authenticate with payment gateway.' });
    }

    const accessToken = tokenData.data.accessToken;
    const merchantReference = `NEXA-${planCode.toUpperCase()}-${Date.now().toString().slice(-6)}`;

    // 2. Generate Payment Link
    const linkRes = await fetch('https://express.stitch.money/api/v1/payment-links', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        amount: amountInCents,
        payerName: (adminName || academyName).slice(0, 40),
        payerEmailAddress: adminEmail,
        payerPhoneNumber: contactPhone || undefined,
        merchantReference: merchantReference
      })
    });

    const linkData = await linkRes.json();
    if (!linkRes.ok || !linkData.data?.payment?.link) {
      console.error('Failed to create Stitch payment link:', linkData);
      return res.status(502).json({ error: 'Failed to generate payment link.' });
    }

    return res.status(200).json({
      success: true,
      paymentId: linkData.data.payment.id,
      paymentUrl: linkData.data.payment.link,
      merchantReference: merchantReference,
      amountZar: totalAmountZar
    });
  } catch (error) {
    console.error('Stitch payment creation exception:', error);
    return res.status(500).json({ error: 'Internal server error processing payment request.' });
  }
}
