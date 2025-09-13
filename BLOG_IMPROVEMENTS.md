# Alaska Blog Improvements

This document describes the new features implemented for the Alaska blog system.

## Features Implemented

### 1. HTML Sanitization (HTML Purifier)

**Location:** `utils/htmlSanitizer.js`

- **Purpose:** Sanitize HTML content when saving blog posts to prevent XSS attacks
- **Functions:**
  - `sanitizeHTML(content)` - Full HTML sanitization for blog post content
  - `sanitizeText(content)` - Strip all HTML tags for plain text fields
  - `sanitizeExcerpt(content)` - Minimal HTML sanitization for excerpts

**Features:**
- Allows safe HTML tags: `p`, `br`, `strong`, `em`, `u`, `h1-h6`, `ul`, `ol`, `li`, `blockquote`, `a`, `img`, etc.
- Removes dangerous tags: `script`, `object`, `embed`, `iframe`, `form`, etc.
- Removes dangerous attributes: `onerror`, `onload`, `onclick`, `style`, etc.
- Automatically adds `rel="noopener noreferrer"` to external links

### 2. File-based Caching System

**Location:** `utils/cache.js`

- **Purpose:** Cache metadata and API responses to improve performance
- **Features:**
  - File-based storage (compatible with any hosting environment)
  - TTL (Time To Live) support
  - Cache statistics and management
  - Automatic cleanup of expired entries

**API Endpoints:**
- `GET /api/cache/stats` - Get cache statistics
- `DELETE /api/cache` - Clear all cache
- `POST /api/cache/cleanup` - Remove expired entries

### 3. RSS Feed Generation

**Location:** `utils/rssGenerator.js`

- **Purpose:** Generate RSS 2.0 compliant feeds for blog content
- **Endpoint:** `GET /api/rss`
- **Features:**
  - RSS 2.0 compliant XML generation
  - Support for multi-tag filtering
  - Automatic CDATA escaping
  - Image enclosures
  - Proper metadata and timestamps

**Usage Examples:**
```bash
# Get all posts RSS
curl http://localhost:3001/api/rss

# Get filtered RSS by tags
curl "http://localhost:3001/api/rss?tag[]=salud&tag[]=veterinario"
```

### 4. Multi-tag Support

**Implementation:** Integrated into blog API and RSS endpoints

- **Supported formats:**
  - `tag[]=a&tag[]=b` (array format)
  - `tags=a,b,c` (comma-separated)
  - `category=Health` (backwards compatibility)

**API Examples:**
```bash
# Multiple tags using array format
curl "http://localhost:3001/api/blog?tag[]=salud&tag[]=veterinario"

# Using comma-separated tags
curl "http://localhost:3001/api/blog?tags=alimentación,nutrición"

# Single category (backwards compatible)
curl "http://localhost:3001/api/blog?category=Salud"
```

## Enhanced API Endpoints

### Blog API - GET /api/blog
- **Enhanced with:** Multi-tag filtering, caching, HTML sanitization
- **Cache duration:** 15 minutes
- **Response includes:** `tags` array showing applied filters

### Blog Creation - POST /api/blog
- **New endpoint** for creating/updating blog posts
- **Features:** Full HTML sanitization, cache invalidation
- **Required fields:** `title`, `content`
- **Optional fields:** `excerpt`, `category`, `tags`, `author`, `date`, `image`

### RSS Feed - GET /api/rss
- **New endpoint** for RSS feed generation
- **Features:** Multi-tag filtering, caching, proper XML formatting
- **Content-Type:** `application/rss+xml; charset=utf-8`
- **Cache duration:** 15 minutes

## Data Structure Changes

### Enhanced Blog Post Object
```json
{
  "id": 1,
  "title": "Post Title",
  "content": "Full HTML content (sanitized)",
  "excerpt": "Short description (minimal HTML)",
  "category": "Category Name",
  "tags": ["tag1", "tag2", "tag3"],
  "author": "Author Name",
  "date": "2025-01-01",
  "image": "/img/blog1.avif"
}
```

## Security Improvements

1. **XSS Prevention:** All user content is sanitized using DOMPurify
2. **Safe External Links:** External links get `rel="noopener noreferrer"`
3. **Input Validation:** All text fields are sanitized appropriately
4. **Safe HTML:** Only whitelisted HTML tags and attributes are allowed

## Performance Improvements

1. **Caching:** API responses are cached for 15 minutes
2. **Cache Management:** Expired entries are automatically cleaned up
3. **Efficient Filtering:** Multi-tag filtering is optimized
4. **RSS Caching:** RSS feeds are cached to reduce server load

## Testing

Run the test suite:
```bash
node test/test-features.js
```

The tests validate:
- HTML sanitization functionality
- Cache operations
- RSS generation
- Multi-tag parsing

## Backwards Compatibility

All changes maintain backwards compatibility:
- Existing category filtering still works
- Original API responses include new fields but don't break existing clients
- HTML escaping is replaced with proper sanitization but produces similar results for safe content