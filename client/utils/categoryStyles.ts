/**
 * Shared category style utility — used across all product card badges
 * and category displays site-wide.
 */

export interface CategoryStyle {
  /** Tailwind gradient classes for icon container & badge */
  gradient: string;
  /** Light background gradient for page/card backgrounds */
  bgLight: string;
  /** Text + border colour for the badge */
  badge: string;
}

/** Map from display name (as stored in DB / product.category) to styles */
const CATEGORY_STYLES: Record<string, CategoryStyle> = {
  // ── Pakaian ──────────────────────────────────────────────────────
  Pakaian: {
    gradient: 'from-[#e08644] to-[#8f4a1e]',
    bgLight:  'from-[#fff7f0] via-white to-[#fff1f2]',
    badge:    'bg-gradient-to-r from-[#e08644] to-[#8f4a1e] text-white',
  },
  // Legacy / fallback mapping for Kaos & Hoodie
  Kaos: {
    gradient: 'from-[#e08644] to-[#8f4a1e]',
    bgLight:  'from-[#fff7f0] via-white to-[#fff1f2]',
    badge:    'bg-gradient-to-r from-[#e08644] to-[#8f4a1e] text-white',
  },
  Hoodie: {
    gradient: 'from-[#e08644] to-[#8f4a1e]',
    bgLight:  'from-[#fff7f0] via-white to-[#fff1f2]',
    badge:    'bg-gradient-to-r from-[#e08644] to-[#8f4a1e] text-white',
  },
  // ── Tas Noken ─────────────────────────────────────────────────────
  'Tas Noken': {
    gradient: 'from-amber-500 to-yellow-600',
    bgLight:  'from-amber-50 via-white to-yellow-50',
    badge:    'bg-gradient-to-r from-amber-500 to-yellow-600 text-white',
  },
  Tas: {
    gradient: 'from-amber-500 to-yellow-600',
    bgLight:  'from-amber-50 via-white to-yellow-50',
    badge:    'bg-gradient-to-r from-amber-500 to-yellow-600 text-white',
  },
  // ── Aksesoris ─────────────────────────────────────────────────────
  Aksesoris: {
    gradient: 'from-emerald-500 to-teal-600',
    bgLight:  'from-emerald-50 via-white to-teal-50',
    badge:    'bg-gradient-to-r from-emerald-500 to-teal-600 text-white',
  },
};

/** Fallback when category is unknown */
const FALLBACK: CategoryStyle = {
  gradient: 'from-primary to-secondary',
  bgLight:  'from-orange-50 via-white to-amber-50',
  badge:    'bg-gradient-to-r from-primary to-secondary text-white',
};

/**
 * Returns the CategoryStyle for the given category name.
 * Case-insensitive partial match is attempted as a fallback.
 */
export function getCategoryStyle(category?: string | null): CategoryStyle {
  if (!category) return FALLBACK;

  // 1. Exact match
  if (CATEGORY_STYLES[category]) return CATEGORY_STYLES[category];

  // 2. Case-insensitive exact
  const lower = category.toLowerCase();
  for (const [key, val] of Object.entries(CATEGORY_STYLES)) {
    if (key.toLowerCase() === lower) return val;
  }

  // 3. Partial match
  for (const [key, val] of Object.entries(CATEGORY_STYLES)) {
    if (lower.includes(key.toLowerCase()) || key.toLowerCase().includes(lower)) return val;
  }

  return FALLBACK;
}

/**
 * Convenience: returns only the badge class string.
 * Usage: <div className={getCategoryBadge(product.category)}>...</div>
 */
export function getCategoryBadge(category?: string | null): string {
  return getCategoryStyle(category).badge;
}
