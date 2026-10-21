async function main() {
  const res = await fetch('https://insights.nexa-transform.com');
  const html = await res.text();
  
  // Extract article links and titles
  const re = /<a[^>]+href="([^"]+)"[^>]*>(.*?)<\/a>/gi;
  let match;
  const articles = [];
  while ((match = re.exec(html)) !== null) {
    const href = match[1];
    const text = match[2].replace(/<[^>]+>/g, '').trim();
    if (href.startsWith('/posts/') || href.startsWith('/article/') || href.includes('/post') || (text.length > 20 && !href.includes('#'))) {
      articles.push({ href, text });
    }
  }
  console.log('ARTICLES:', JSON.stringify(articles, null, 2));

  // Also check if there is an RSS or JSON feed
  const feedMatch = html.match(/href="([^"]+\.(?:xml|rss|json|atom))"/i);
  if (feedMatch) console.log('FEED:', feedMatch[1]);
}
main().catch(console.error);
