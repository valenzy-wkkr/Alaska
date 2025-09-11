/**
 * HTML Sanitization utility using DOMPurify
 * Sanitizes HTML content to prevent XSS attacks while preserving safe formatting
 */

const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');

// Create window and DOMPurify instance for server-side use
const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

/**
 * Sanitize HTML content for blog posts and user input
 * @param {string} content - HTML content to sanitize
 * @returns {string} - Sanitized HTML content
 */
function sanitizeHTML(content) {
  if (!content || typeof content !== 'string') {
    return '';
  }

  // Configure DOMPurify with safe settings for blog content
  const config = {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'blockquote', 'a', 'img', 'pre', 'code', 'hr',
      'span', 'div', 'table', 'thead', 'tbody', 'tr', 'th', 'td'
    ],
    ALLOWED_ATTR: [
      'href', 'title', 'alt', 'src', 'width', 'height', 'class', 'id',
      'target', 'rel'
    ],
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp|data):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
    ADD_ATTR: ['target', 'rel'],
    FORBID_TAGS: ['script', 'object', 'embed', 'iframe', 'form', 'input', 'textarea', 'button'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'style']
  };

  // Sanitize the content
  const sanitized = DOMPurify.sanitize(content, config);

  // Add rel="noopener noreferrer" to external links for security
  return sanitized.replace(
    /<a([^>]+)href=["']https?:\/\/(?!localhost|127\.0\.0\.1)/gi,
    '<a$1href="$&" target="_blank" rel="noopener noreferrer"'
  );
}

/**
 * Sanitize plain text content (removes all HTML)
 * @param {string} content - Content to sanitize
 * @returns {string} - Plain text content
 */
function sanitizeText(content) {
  if (!content || typeof content !== 'string') {
    return '';
  }
  
  return DOMPurify.sanitize(content, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
}

/**
 * Sanitize excerpt/summary content (minimal HTML allowed)
 * @param {string} content - Content to sanitize
 * @returns {string} - Sanitized excerpt
 */
function sanitizeExcerpt(content) {
  if (!content || typeof content !== 'string') {
    return '';
  }

  const config = {
    ALLOWED_TAGS: ['strong', 'em', 'br'],
    ALLOWED_ATTR: [],
    FORBID_TAGS: ['script', 'style', 'link'],
    FORBID_ATTR: ['style', 'class', 'id']
  };

  return DOMPurify.sanitize(content, config);
}

module.exports = {
  sanitizeHTML,
  sanitizeText,
  sanitizeExcerpt
};