/**
 * RSS Feed Generator for Alaska blog
 * Generates RSS 2.0 compliant XML feeds
 */

const { sanitizeText } = require('./htmlSanitizer');

/**
 * Generate RSS feed XML for blog posts
 * @param {Array} posts - Array of blog post objects
 * @param {Object} options - Feed configuration options
 * @returns {string} - RSS XML content
 */
function generateRSSFeed(posts, options = {}) {
  const {
    title = 'Alaska - Blog de Cuidado de Mascotas',
    description = 'Consejos y guías para el cuidado responsable de tus mascotas',
    link = 'http://localhost:3000',
    language = 'es-ES',
    copyright = '© 2025 Alaska Pets',
    managingEditor = 'info@alaska-pets.com (Alaska Team)',
    webMaster = 'webmaster@alaska-pets.com (Alaska Webmaster)',
    category = 'Pets',
    generator = 'Alaska RSS Generator'
  } = options;

  const buildDate = new Date().toUTCString();
  const lastBuildDate = posts.length > 0 
    ? new Date(Math.max(...posts.map(p => new Date(p.date)))).toUTCString()
    : buildDate;

  // Start RSS document
  let rss = '<?xml version="1.0" encoding="UTF-8"?>\n';
  rss += '<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom">\n';
  rss += '  <channel>\n';
  
  // Channel metadata
  rss += `    <title><![CDATA[${escapeXML(title)}]]></title>\n`;
  rss += `    <description><![CDATA[${escapeXML(description)}]]></description>\n`;
  rss += `    <link>${escapeXML(link)}</link>\n`;
  rss += `    <atom:link href="${escapeXML(link)}/api/rss" rel="self" type="application/rss+xml" />\n`;
  rss += `    <language>${escapeXML(language)}</language>\n`;
  rss += `    <copyright><![CDATA[${escapeXML(copyright)}]]></copyright>\n`;
  rss += `    <managingEditor><![CDATA[${escapeXML(managingEditor)}]]></managingEditor>\n`;
  rss += `    <webMaster><![CDATA[${escapeXML(webMaster)}]]></webMaster>\n`;
  rss += `    <category><![CDATA[${escapeXML(category)}]]></category>\n`;
  rss += `    <generator>${escapeXML(generator)}</generator>\n`;
  rss += `    <lastBuildDate>${lastBuildDate}</lastBuildDate>\n`;
  rss += `    <pubDate>${buildDate}</pubDate>\n`;
  rss += `    <ttl>60</ttl>\n`;

  // Add items
  for (const post of posts) {
    rss += generateRSSItem(post, link);
  }

  // Close RSS document
  rss += '  </channel>\n';
  rss += '</rss>';

  return rss;
}

/**
 * Generate RSS item for a single blog post
 * @param {Object} post - Blog post object
 * @param {string} baseUrl - Base URL for links
 * @returns {string} - RSS item XML
 */
function generateRSSItem(post, baseUrl) {
  const {
    id,
    title,
    excerpt,
    content,
    category,
    date,
    image,
    author = 'Alaska Team',
    tags = []
  } = post;

  const pubDate = new Date(date).toUTCString();
  const postUrl = `${baseUrl}/blog-detalle.html?id=${id}`;
  const guid = `${baseUrl}/blog/${id}`;
  
  // Use content if available, otherwise use excerpt
  const description = content || excerpt || '';
  const cleanDescription = sanitizeText(description);

  let item = '    <item>\n';
  item += `      <title><![CDATA[${escapeXML(title)}]]></title>\n`;
  item += `      <description><![CDATA[${escapeXML(cleanDescription)}]]></description>\n`;
  
  if (content) {
    item += `      <content:encoded><![CDATA[${escapeXML(content)}]]></content:encoded>\n`;
  }
  
  item += `      <link>${escapeXML(postUrl)}</link>\n`;
  item += `      <guid isPermaLink="false">${escapeXML(guid)}</guid>\n`;
  item += `      <pubDate>${pubDate}</pubDate>\n`;
  item += `      <author><![CDATA[${escapeXML(author)}]]></author>\n`;
  item += `      <category><![CDATA[${escapeXML(category)}]]></category>\n`;

  // Add tags as additional categories
  if (Array.isArray(tags)) {
    for (const tag of tags) {
      item += `      <category><![CDATA[${escapeXML(tag)}]]></category>\n`;
    }
  }

  // Add image enclosure if available
  if (image && (image.startsWith('http') || image.startsWith('/'))) {
    const imageUrl = image.startsWith('http') ? image : `${baseUrl}${image}`;
    item += `      <enclosure url="${escapeXML(imageUrl)}" type="image/jpeg" />\n`;
  }

  item += '    </item>\n';
  
  return item;
}

/**
 * Escape XML special characters
 * @param {string} str - String to escape
 * @returns {string} - Escaped string
 */
function escapeXML(str) {
  if (!str || typeof str !== 'string') {
    return '';
  }
  
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Parse tags from query parameters
 * Supports both single tags and multiple tags in format tag[]=a&tag[]=b
 * @param {Object} query - Express query object
 * @returns {Array} - Array of tag strings
 */
function parseTagsFromQuery(query) {
  const tags = [];
  
  // Handle tag[] array format
  if (query.tag && Array.isArray(query.tag)) {
    tags.push(...query.tag.filter(t => typeof t === 'string' && t.trim()));
  } else if (query.tag && typeof query.tag === 'string') {
    tags.push(query.tag.trim());
  }
  
  // Handle tags parameter (comma-separated)
  if (query.tags && typeof query.tags === 'string') {
    tags.push(...query.tags.split(',').map(t => t.trim()).filter(t => t));
  }
  
  // Handle category parameter for backwards compatibility
  if (query.category && typeof query.category === 'string') {
    tags.push(query.category.trim());
  }
  
  return [...new Set(tags)]; // Remove duplicates
}

module.exports = {
  generateRSSFeed,
  generateRSSItem,
  escapeXML,
  parseTagsFromQuery
};