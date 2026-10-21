import fs from 'fs';
import path from 'path';

const files = [
  {
    slug: 'designing-a-multi-role-back-office-system',
    path: 'C:/Users/lfk66/.gemini/antigravity/brain/c81a00ad-1eb0-4b42-b6d0-a6ea6f58960b/.system_generated/steps/5477/content.md',
    category: 'Systems Architecture & Portals'
  },
  {
    slug: 'dmaic-process-improvement-a-practical-guide-to-all-five-phases',
    path: 'C:/Users/lfk66/.gemini/antigravity/brain/c81a00ad-1eb0-4b42-b6d0-a6ea6f58960b/.system_generated/steps/5479/content.md',
    category: 'Continuous Improvement & DMAIC'
  },
  {
    slug: 'custom-telemetry-management-system-pricing-and-cost-factors',
    path: 'C:/Users/lfk66/.gemini/antigravity/brain/c81a00ad-1eb0-4b42-b6d0-a6ea6f58960b/.system_generated/steps/5481/content.md',
    category: 'Telemetry & Cost Optimization'
  },
  {
    slug: 'a-disciplined-approach-to-continuous-improvement',
    path: 'C:/Users/lfk66/.gemini/antigravity/brain/c81a00ad-1eb0-4b42-b6d0-a6ea6f58960b/.system_generated/steps/5483/content.md',
    category: 'Operational Excellence'
  }
];

const articles = [];

for (const item of files) {
  const raw = fs.readFileSync(item.path, 'utf8');

  // Find all JSON-LD blocks
  const jsonLdBlocks = [...raw.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi)];
  let title = '';
  let excerpt = '';
  let coverImage = '';
  let publishedDate = '';
  let faqs = [];

  for (const block of jsonLdBlocks) {
    try {
      const data = JSON.parse(block[1]);
      if (data['@type'] === 'Article') {
        title = data.headline || title;
        excerpt = data.description || excerpt;
        coverImage = (typeof data.image === 'string' ? data.image : data.image?.url) || coverImage;
        publishedDate = data.datePublished || publishedDate;
      }
      if (data['@type'] === 'FAQPage' && data.mainEntity) {
        faqs = data.mainEntity.map(q => ({
          question: q.name,
          answer: q.acceptedAnswer?.text || ''
        }));
      }
    } catch (e) {
      console.error('Error parsing JSON-LD in', item.slug, e);
    }
  }

  // Extract read time from raw
  const readTimeMatch = raw.match(/(\d+\s+min\s+read)/i);
  const readTime = readTimeMatch ? readTimeMatch[1] : '17 min read';

  // Extract <article ...>...</article>
  const articleMatch = raw.match(/<article[\s\S]*?<\/article>/);
  let contentHtml = articleMatch ? articleMatch[0] : '';

  // Transform internal /post/ links to /insights/
  contentHtml = contentHtml.replace(/href="\/post\//g, 'href="/insights/');
  contentHtml = contentHtml.replace(/href='\/post\//g, "href='/insights/");

  articles.push({
    slug: item.slug,
    title,
    excerpt,
    category: item.category,
    author: 'Nexa Transform Group',
    publishedDate,
    readTime,
    coverImage,
    faqs,
    contentHtml
  });
}

// Sort by publishedDate desc
articles.sort((a, b) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime());

const output = `// Auto-generated from exact articles published by Visibly on insights.nexa-transform.com
// Generated: ${new Date().toISOString()}

export const INSIGHTS_ARTICLES = ${JSON.stringify(articles, null, 2)};
`;

fs.writeFileSync('src/data/insightsData.js', output, 'utf8');
console.log('Successfully wrote src/data/insightsData.js with', articles.length, 'articles.');
