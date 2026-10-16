// Vercel Serverless Function: Transactional Email Dispatcher via Resend API
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.RESEND_API_KEY || process.env.VITE_RESEND_API_KEY;

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const { to, subject, html, text, from, reply_to, cc, bcc } = body;

    if (!to || !subject) {
      return res.status(400).json({ error: 'Missing "to" or "subject" parameter.' });
    }

    // Default sender branding
    const fromAddress = from || 'NexaTransform Hub <admissions@nexa-transform.com>';
    const replyAddress = reply_to || 'enquiries@nexa-transform.com';

    // If Resend API key is configured, send via official Resend API
    if (apiKey) {
      const resendPayload = {
        from: fromAddress,
        to: Array.isArray(to) ? to : [to],
        subject: subject,
        html: html || `<p>${text || subject}</p>`,
        reply_to: replyAddress
      };

      if (text) resendPayload.text = text;
      if (cc) resendPayload.cc = Array.isArray(cc) ? cc : [cc];
      if (bcc) resendPayload.bcc = Array.isArray(bcc) ? bcc : [bcc];

      const resendRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(resendPayload)
      });

      const resData = await resendRes.json();
      if (!resendRes.ok) {
        console.warn('Resend API dispatch error:', resData);
        return res.status(resendRes.status).json({ error: resData });
      }

      return res.status(200).json({ status: 'sent', provider: 'resend', data: resData });
    }

    // Graceful fallback if API key is not yet set in environment
    console.warn('RESEND_API_KEY not configured. Falling back to notification log.');
    return res.status(200).json({
      status: 'simulated',
      message: 'Email queued. Add RESEND_API_KEY to Vercel environment to enable live sending.',
      recipient: to,
      subject: subject
    });

  } catch (err) {
    console.error('Email dispatch exception:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
