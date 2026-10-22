const https = require('https');

function fetchPage(url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve({ status: res.statusCode, data }));
    }).on('error', e => resolve({ status: 500, error: e.message }));
  });
}

async function test() {
  const targetUrl = 'https://nexa-transform-833vux1x2-nexa-transform.vercel.app';
  console.log('Testing target deployment:', targetUrl);
  
  const pricing = await fetchPage(targetUrl + '/pricing');
  console.log('Pricing HTML HTTP status:', pricing.status);

  const jsMatch = pricing.data.match(/\/assets\/index-[^"']+\.js/);
  if (jsMatch) {
    console.log('Found main JS bundle:', jsMatch[0]);
    const jsUrl = targetUrl + jsMatch[0];
    const jsRes = await fetchPage(jsUrl);
    console.log('JS bundle HTTP status:', jsRes.status, 'size:', jsRes.data.length);
    console.log('Bundle has stipend capability:', jsRes.data.includes('Disburse monthly stipends to learners directly from the LMIS'));
    console.log('Bundle has "What you can do directly from the LMIS":', jsRes.data.includes('What you can do directly from the LMIS:'));
    console.log('Bundle has new RCA article slug:', jsRes.data.includes('root-cause-analysis-consulting-for-organizational-leaders'));
    console.log('Bundle has RCA article title:', jsRes.data.includes('Root Cause Analysis Consulting for Organizational Leaders'));
    console.log('Bundle has Ozow EFT payout:', jsRes.data.includes('Direct Learner Stipend Payouts via Instant EFT'));
    console.log('Bundle has Digital Attendance:', jsRes.data.includes('Digital Attendance Tracking & Cohort Registers'));
  }

  // Also check custom domain cache status
  const domainRes = await new Promise((resolve) => {
    https.get('https://nexa-transform.com', (res) => {
      resolve({
        statusCode: res.statusCode,
        age: res.headers['age'],
        xVercelCache: res.headers['x-vercel-cache'],
        xVercelId: res.headers['x-vercel-id']
      });
    });
  });
  console.log('Custom domain https://nexa-transform.com status:', domainRes);
}

test();
