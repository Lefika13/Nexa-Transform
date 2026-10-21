import crypto from 'crypto';
import { checkRateLimit } from './_rateLimit.js';

/**
 * Ozow Payment Request Initializer
 * Computes the SHA512 hash checksum required by Ozow Instant EFT specifications:
 * HashString = SiteCode + CountryCode + CurrencyCode + Amount + TransactionReference +
 *              BankReference + Optional1 + Optional2 + Optional3 + Optional4 + Optional5 +
 *              Customer + CancelUrl + ErrorUrl + SuccessUrl + NotifyUrl + IsTest + PrivateKey
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
  const rate = checkRateLimit(clientIp, 10, 60 * 1000);
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
    let baseAmount = 25000.00; // Starter default
    if (planCode === 'growth') baseAmount = 45000.00;
    if (planCode === 'pro_plus') baseAmount = 60000.00;

    // Apply 15% discount if annual
    const totalAmount = billingCycle === 'annual'
      ? (baseAmount * 12 * 0.85).toFixed(2)
      : baseAmount.toFixed(2);

    const transactionReference = `NEXA-${planCode.toUpperCase()}-${Date.now().toString().slice(-6)}`;
    const bankReference = `NEXA-${subdomainSlug.slice(0, 10).toUpperCase()}`;

    // Ozow Credentials from Environment Variables
    const siteCode = process.env.OZOW_SITE_CODE || 'NEXA-TEST-01';
    const privateKey = process.env.OZOW_PRIVATE_KEY || 'sandbox_private_key_nexa_lmis';
    const apiKey = process.env.OZOW_API_KEY || 'sandbox_api_key_nexa_lmis';
    const isTest = process.env.OZOW_IS_TEST !== 'false'; // Default to test mode unless explicitly false

    const appOrigin = process.env.NEXT_PUBLIC_APP_URL || 'https://nexa-transform.com';
    const cancelUrl = `${appOrigin}/pricing?status=cancelled`;
    const errorUrl = `${appOrigin}/pricing?status=error`;
    const successUrl = `${appOrigin}/lmis?status=subscription_success&ref=${transactionReference}`;
    const notifyUrl = `${appOrigin}/api/ozow-webhook`;

    // String for Hash generation (all values concatenated, converted to lowercase)
    const hashString = (
      siteCode +
      'ZA' + // CountryCode
      'ZAR' + // CurrencyCode
      totalAmount +
      transactionReference +
      bankReference +
      subdomainSlug + // Optional1
      planCode +      // Optional2
      adminEmail +    // Optional3
      billingCycle +  // Optional4
      adminName +     // Optional5
      adminEmail +    // Customer
      cancelUrl +
      errorUrl +
      successUrl +
      notifyUrl +
      (isTest ? 'true' : 'false') +
      privateKey
    ).toLowerCase();

    const hashCheck = crypto.createHash('sha512').update(hashString).digest('hex');

    // Return the pre-calculated payload to the client so it can render the Ozow payment modal or redirect
    return res.status(200).json({
      success: true,
      paymentData: {
        siteCode,
        countryCode: 'ZA',
        currencyCode: 'ZAR',
        amount: totalAmount,
        transactionReference,
        bankReference,
        optional1: subdomainSlug,
        optional2: planCode,
        optional3: adminEmail,
        optional4: billingCycle,
        optional5: adminName,
        customer: adminEmail,
        cancelUrl,
        errorUrl,
        successUrl,
        notifyUrl,
        isTest,
        hashCheck
      },
      paymentEndpoint: isTest
        ? 'https://staging.ozow.com/postpayment'
        : 'https://pay.ozow.com'
    });
  } catch (error) {
    console.error('Failed to initialize Ozow payment:', error);
    return res.status(500).json({ error: 'Internal server error initializing payment.' });
  }
}
