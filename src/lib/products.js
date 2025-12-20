import { products } from '@/data/products';

/**
 * Static product list with backend pricing
 * This is the source of truth for product validation
 * NEVER trust frontend prices - always use this for calculations
 */
export const productList = products.map(product => ({
  id: product.id,
  name: product.title,
  priceCents: Math.round(product.price * 100), // Convert to cents
  imagePath: product.image,
  active: true, // You can add an active flag if needed
}));

/**
 * Get product by ID for backend validation
 * @param {string} productId - The product ID
 * @returns {Object|null} Product object or null if not found
 */
export function getProductById(productId) {
  return productList.find(p => p.id === productId && p.active) || null;
}

/**
 * Get all active products
 * @returns {Array} Array of active products
 */
export function getAllProducts() {
  return productList.filter(p => p.active);
}

/**
 * Validate product exists and is active
 * @param {string} productId - The product ID
 * @returns {boolean} True if product is valid
 */
export function isValidProduct(productId) {
  return getProductById(productId) !== null;
}

