const fs = require('fs');

const currentContent = fs.readFileSync('src/data/insightsData.js', 'utf8');
const newArticle = JSON.parse(fs.readFileSync('scripts/parsed_article.json', 'utf8'));

const markerRegex = /export const INSIGHTS_ARTICLES = \[\r?\n/;
const match = currentContent.match(markerRegex);

if (!match) {
  console.error('Could not find marker regex in src/data/insightsData.js');
  process.exit(1);
}

const idx = match.index;
const matchLength = match[0].length;

const formattedNewArticle = JSON.stringify(newArticle, null, 2)
  .split('\n')
  .map(line => '  ' + line)
  .join('\n');

const updatedContent = 
  `// All 8 Authentic Published Articles by Visibly (insights.nexa-transform.com)\n` +
  `// Updated: ${new Date().toISOString()}\n\n` +
  `export const INSIGHTS_ARTICLES = [\n` +
  formattedNewArticle + ',\n' +
  currentContent.substring(idx + matchLength);

fs.writeFileSync('src/data/insightsData.js', updatedContent, 'utf8');
console.log('Successfully updated src/data/insightsData.js with new article!');
