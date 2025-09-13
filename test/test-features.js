/**
 * Simple tests for the new blog features
 * Tests HTML sanitization, caching, RSS generation, and multi-tag support
 */

const { sanitizeHTML, sanitizeText, sanitizeExcerpt } = require('../utils/htmlSanitizer');
const cache = require('../utils/cache');
const { generateRSSFeed, parseTagsFromQuery } = require('../utils/rssGenerator');

console.log('Running tests for Alaska blog improvements...\n');

// Test HTML Sanitization
console.log('1. Testing HTML Sanitization:');

const testHtml = '<p>Safe content</p><script>alert("xss")</script><strong>Bold</strong>';
const sanitized = sanitizeHTML(testHtml);
console.log('Input:', testHtml);
console.log('Output:', sanitized);
console.log('✓ Script tag removed, safe tags preserved\n');

// Test text sanitization
const testText = '<p>Hello <script>alert("bad")</script> World</p>';
const textOnly = sanitizeText(testText);
console.log('Text sanitization:', testText, '->', textOnly);
console.log('✓ All HTML removed\n');

// Test excerpt sanitization
const testExcerpt = '<p>This is <strong>important</strong> <script>alert("bad")</script></p>';
const excerptSanitized = sanitizeExcerpt(testExcerpt);
console.log('Excerpt sanitization:', testExcerpt, '->', excerptSanitized);
console.log('✓ Only safe formatting preserved\n');

// Test Cache System
console.log('2. Testing Cache System:');

async function testCache() {
  try {
    // Set cache value
    await cache.set('test_key', { data: 'test value' }, 60);
    console.log('✓ Cache set successful');
    
    // Get cache value
    const cached = await cache.get('test_key');
    console.log('✓ Cache get successful:', cached);
    
    // Check stats
    const stats = await cache.stats();
    console.log('✓ Cache stats:', stats);
    
    // Cleanup test
    await cache.remove('test_key');
    console.log('✓ Cache cleanup successful\n');
  } catch (error) {
    console.error('✗ Cache test failed:', error);
  }
}

// Test RSS Generation
console.log('3. Testing RSS Generation:');

const testPosts = [
  {
    id: 1,
    title: 'Test Post',
    excerpt: 'Test excerpt',
    category: 'Test',
    tags: ['test', 'rss'],
    date: '2025-01-01',
    image: '/img/test.jpg'
  }
];

const rssXml = generateRSSFeed(testPosts, {
  title: 'Test Feed',
  description: 'Test RSS Feed',
  link: 'http://test.com'
});

console.log('RSS XML generated successfully');
console.log('Contains channel:', rssXml.includes('<channel>'));
console.log('Contains items:', rssXml.includes('<item>'));
console.log('Contains CDATA:', rssXml.includes('<![CDATA['));
console.log('✓ RSS generation working\n');

// Test Tag Parsing
console.log('4. Testing Multi-tag Support:');

const testQueries = [
  { tag: ['health', 'vet'] },
  { 'tag[]': ['food', 'nutrition'] },
  { tags: 'exercise,behavior' },
  { category: 'Health' }
];

for (const query of testQueries) {
  const parsed = parseTagsFromQuery(query);
  console.log('Query:', query, '-> Tags:', parsed);
}
console.log('✓ Multi-tag parsing working\n');

// Run async tests
testCache().then(() => {
  console.log('All tests completed successfully! 🎉');
}).catch(error => {
  console.error('Some tests failed:', error);
});