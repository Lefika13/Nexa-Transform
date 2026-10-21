const fs = require('fs');

const html = fs.readFileSync('scripts/article_raw.html', 'utf8');

// LD+JSON
const ldStart = html.indexOf('<script type="application/ld+json">');
let ld = {};
if (ldStart !== -1) {
  const ldEnd = html.indexOf('</script>', ldStart);
  const jsonStr = html.substring(ldStart + '<script type="application/ld+json">'.length, ldEnd);
  try {
    ld = JSON.parse(jsonStr);
  } catch (e) {
    console.error('JSON error:', e);
  }
}

// Extract article body
const articleStart = html.indexOf('<article');
const articleEnd = html.indexOf('</article>', articleStart);
let contentHtml = '';
if (articleStart !== -1 && articleEnd !== -1) {
  contentHtml = html.substring(articleStart, articleEnd + '</article>'.length);
}

// Extract read time from html
const readTimeMatch = html.match(/(\d+\s+min\s+read)/i);
const readTime = readTimeMatch ? readTimeMatch[1] : '17 min read';

// Extract FAQs from HTML
const faqs = [];
const faqTag = '<h2 id="frequently-asked-questions">';
const faqStart = html.indexOf(faqTag);
if (faqStart !== -1) {
  const nextH2 = html.indexOf('<h2', faqStart + faqTag.length);
  const faqChunk = html.substring(faqStart, nextH2 !== -1 ? nextH2 : undefined);
  const re = /<h3>(.*?)<\/h3>\s*<p>(.*?)<\/p>/gs;
  let m;
  while ((m = re.exec(faqChunk)) !== null) {
    faqs.push({
      question: m[1].replace(/<[^>]+>/g, '').trim(),
      answer: m[2].replace(/<[^>]+>/g, '').trim()
    });
  }
}

// Adjust any internal links in contentHtml:
// Breadcrumb: <a href="/" class="text-gray-400 hover:text-gray-600 no-underline" style="text-decoration: none; color: #9ca3af; cursor: pointer;">Blog</a>
// In existing articles, breadcrumb link is <a href="/" ...>Blog</a>
// Also, let's fix any absolute links to https://insights.nexa-transform.com/post/xxx to /insights/xxx so routing stays internal
contentHtml = contentHtml.replace(/https:\/\/insights\.nexa-transform\.com\/post\//g, '/insights/');

const articleObj = {
  slug: "root-cause-analysis-consulting-for-organizational-leaders",
  title: ld.headline || "Root Cause Analysis Consulting for Organizational Leaders",
  excerpt: ld.description || "Operational breakdowns are prevented when root cause analysis consulting is applied. Effective corrective actions and systemic improvements are established.",
  category: "Operational Governance & RCA",
  author: "Nexa Transform Group",
  publishedDate: ld.datePublished || "2026-10-21T10:00:00+00:00",
  readTime: readTime,
  coverImage: ld.image || "https://getautoseo.com/storage/hero_images/root-cause-analysis-consulting-for-organizational-leaders.jpg?v=cd2e849117a6",
  faqs: faqs,
  contentHtml: contentHtml
};

console.log('Parsed article:');
console.log('Title:', articleObj.title);
console.log('Published:', articleObj.publishedDate);
console.log('ReadTime:', articleObj.readTime);
console.log('Image:', articleObj.coverImage);
console.log('FAQs count:', articleObj.faqs.length);
faqs.forEach((f, i) => console.log(`  ${i+1}. ${f.question}`));
console.log('ContentHtml length:', articleObj.contentHtml.length);

fs.writeFileSync('scripts/parsed_article.json', JSON.stringify(articleObj, null, 2));
console.log('Saved to scripts/parsed_article.json');
