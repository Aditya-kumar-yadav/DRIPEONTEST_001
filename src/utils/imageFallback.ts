/**
 * Robust image fallback utility to resolve specific products to their correct seed images.
 * Keeps image rendering resilient even when database relations are completely wiped or unseeded.
 */
export function getProductImageUrl(product: any): string {
  if (!product) return 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80';
  
  // If there's a direct imageUrl field and it's valid
  if (product.imageUrl && typeof product.imageUrl === 'string' && product.imageUrl.trim() !== '') {
    return product.imageUrl;
  }
  
  // Try images array
  if (product.images && Array.isArray(product.images) && product.images.length > 0) {
    const primary = product.images.find((img: any) => img.isPrimary);
    if (primary && primary.imageUrl) return primary.imageUrl;
    const firstImg = product.images[0];
    if (firstImg && firstImg.imageUrl) return firstImg.imageUrl;
  }
  
  // Hardcoded fallback map based on product ID, slug, name OR productVariantId key matching
  const idOrSlug = (product.id || product.slug || '').toLowerCase();
  const name = (product.name || '').toLowerCase();
  
  if (idOrSlug.includes('sh-1') || idOrSlug.includes('black-utility-shacket') || name.includes('black utility shacket')) {
    return 'https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=800&q=80';
  }
  if (idOrSlug.includes('sh-2') || idOrSlug.includes('warm-brown-utility-shacket') || name.includes('warm brown utility shacket')) {
    return 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=800&q=80';
  }
  if (idOrSlug.includes('gk-pant-1') || idOrSlug.includes('navy-blue-tailored-gurkha-pant') || name.includes('navy blue tailored gurkha pant') || idOrSlug.includes('var-gk1')) {
    return 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=800&q=80';
  }
  if (idOrSlug.includes('gk-pant-2') || idOrSlug.includes('black-tailored-gurkha-pant') || name.includes('black tailored gurkha pant') || idOrSlug.includes('var-gk2')) {
    return 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80';
  }
  if (idOrSlug.includes('gk-pant-3') || idOrSlug.includes('ivory-tailored-gurkha-pant') || name.includes('ivory tailored gurkha pant') || idOrSlug.includes('var-gk3')) {
    return 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=800&q=80';
  }
  if (idOrSlug.includes('jap-pant-1') || idOrSlug.includes('black-tailored-japanese-pant') || name.includes('black tailored japanese pant') || idOrSlug.includes('var-jp1')) {
    return 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80';
  }
  
  return 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80';
}
