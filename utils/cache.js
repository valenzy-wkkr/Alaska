/**
 * File-based caching utility for metadata
 * Provides caching functionality similar to APCu but using file system
 */

const fs = require('fs').promises;
const path = require('path');

// Cache directory
const CACHE_DIR = path.join(__dirname, '..', '.cache');
const DEFAULT_TTL = 3600; // 1 hour in seconds

/**
 * Ensure cache directory exists
 */
async function ensureCacheDir() {
  try {
    await fs.access(CACHE_DIR);
  } catch {
    await fs.mkdir(CACHE_DIR, { recursive: true });
  }
}

/**
 * Get cache file path for a key
 * @param {string} key - Cache key
 * @returns {string} - File path
 */
function getCacheFilePath(key) {
  // Sanitize key for filename
  const safeKey = key.replace(/[^a-zA-Z0-9_-]/g, '_');
  return path.join(CACHE_DIR, `${safeKey}.json`);
}

/**
 * Set cache value
 * @param {string} key - Cache key
 * @param {any} value - Value to cache
 * @param {number} ttl - Time to live in seconds (default: 1 hour)
 * @returns {Promise<boolean>} - Success status
 */
async function set(key, value, ttl = DEFAULT_TTL) {
  try {
    await ensureCacheDir();
    
    const cacheData = {
      value,
      expires: Date.now() + (ttl * 1000),
      created: Date.now()
    };
    
    const filePath = getCacheFilePath(key);
    await fs.writeFile(filePath, JSON.stringify(cacheData), 'utf8');
    
    return true;
  } catch (error) {
    console.warn('Cache set failed:', error);
    return false;
  }
}

/**
 * Get cache value
 * @param {string} key - Cache key
 * @param {any} defaultValue - Default value if not found or expired
 * @returns {Promise<any>} - Cached value or default
 */
async function get(key, defaultValue = null) {
  try {
    const filePath = getCacheFilePath(key);
    const data = await fs.readFile(filePath, 'utf8');
    const cacheData = JSON.parse(data);
    
    // Check if expired
    if (Date.now() > cacheData.expires) {
      // Remove expired cache
      await remove(key);
      return defaultValue;
    }
    
    return cacheData.value;
  } catch (error) {
    // File doesn't exist or other error
    return defaultValue;
  }
}

/**
 * Remove cache entry
 * @param {string} key - Cache key
 * @returns {Promise<boolean>} - Success status
 */
async function remove(key) {
  try {
    const filePath = getCacheFilePath(key);
    await fs.unlink(filePath);
    return true;
  } catch (error) {
    // File might not exist
    return false;
  }
}

/**
 * Clear all cache
 * @returns {Promise<boolean>} - Success status
 */
async function clear() {
  try {
    const files = await fs.readdir(CACHE_DIR);
    const deletePromises = files
      .filter(file => file.endsWith('.json'))
      .map(file => fs.unlink(path.join(CACHE_DIR, file)));
    
    await Promise.all(deletePromises);
    return true;
  } catch (error) {
    console.warn('Cache clear failed:', error);
    return false;
  }
}

/**
 * Check if cache key exists and is not expired
 * @param {string} key - Cache key
 * @returns {Promise<boolean>} - True if exists and valid
 */
async function exists(key) {
  try {
    const filePath = getCacheFilePath(key);
    const data = await fs.readFile(filePath, 'utf8');
    const cacheData = JSON.parse(data);
    
    return Date.now() <= cacheData.expires;
  } catch {
    return false;
  }
}

/**
 * Get cache statistics
 * @returns {Promise<object>} - Cache stats
 */
async function stats() {
  try {
    const files = await fs.readdir(CACHE_DIR);
    const cacheFiles = files.filter(file => file.endsWith('.json'));
    
    let validEntries = 0;
    let expiredEntries = 0;
    let totalSize = 0;
    
    for (const file of cacheFiles) {
      try {
        const filePath = path.join(CACHE_DIR, file);
        const stat = await fs.stat(filePath);
        totalSize += stat.size;
        
        const data = await fs.readFile(filePath, 'utf8');
        const cacheData = JSON.parse(data);
        
        if (Date.now() <= cacheData.expires) {
          validEntries++;
        } else {
          expiredEntries++;
        }
      } catch {
        // Ignore invalid files
      }
    }
    
    return {
      totalEntries: cacheFiles.length,
      validEntries,
      expiredEntries,
      totalSize,
      cacheDir: CACHE_DIR
    };
  } catch {
    return {
      totalEntries: 0,
      validEntries: 0,
      expiredEntries: 0,
      totalSize: 0,
      cacheDir: CACHE_DIR
    };
  }
}

/**
 * Clean up expired cache entries
 * @returns {Promise<number>} - Number of entries removed
 */
async function cleanup() {
  try {
    const files = await fs.readdir(CACHE_DIR);
    const cacheFiles = files.filter(file => file.endsWith('.json'));
    
    let removed = 0;
    
    for (const file of cacheFiles) {
      try {
        const filePath = path.join(CACHE_DIR, file);
        const data = await fs.readFile(filePath, 'utf8');
        const cacheData = JSON.parse(data);
        
        if (Date.now() > cacheData.expires) {
          await fs.unlink(filePath);
          removed++;
        }
      } catch {
        // Ignore errors, continue with next file
      }
    }
    
    return removed;
  } catch {
    return 0;
  }
}

module.exports = {
  set,
  get,
  remove,
  clear,
  exists,
  stats,
  cleanup,
  DEFAULT_TTL
};