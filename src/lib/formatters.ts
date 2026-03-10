export const formatProduct = (dbProduct: any) => {
  if (!dbProduct) return null;

  // 1. Safely handle images (Prioritize array, fallback to string, fallback to placeholder)
  const imageUrls = dbProduct.image_urls || [];
  const primaryImage = imageUrls.length > 0 
    ? imageUrls[0] 
    : (dbProduct.image_url || 'https://via.placeholder.com/800');

  // 2. Return the perfectly cleaned object
  return {
    // Keep all original raw data just in case you need a specific raw field later
    ...dbProduct,

    // Guarantee these core fields ALWAYS exist and are formatted correctly
    id: dbProduct.id,
    name: dbProduct.title || "Unknown Product",
    price: Number(dbProduct.price) || 0,
    originalPrice: dbProduct.originalPrice ? Number(dbProduct.originalPrice) : undefined,
    
    // ✅ The permanent fix for the Category Slug vs Name issue
    categorySlug: dbProduct.categories?.slug || 'uncategorized',
    categoryName: dbProduct.categories?.name || 'Uncategorized',
    
    // ✅ Always guarantee an image exists so the UI never breaks
    image: primaryImage, 
    images: imageUrls.length > 0 ? imageUrls : [primaryImage], 
    
    // ✅ Clean up stock logic so we don't have to do Math on the frontend
    stockQuantity: Number(dbProduct.stock_quantity || 0),
    isOutOfStock: Number(dbProduct.stock_quantity || 0) <= 0,
  };
};

/**
 * Formats an array of raw Supabase products (Great for Carousels, Category Pages, and Search Results)
 */
export const formatProductList = (dbProducts: any[]) => {
  if (!Array.isArray(dbProducts)) return [];
  
  // Run every product through the formatter and remove any null/broken ones
  return dbProducts.map(product => formatProduct(product)).filter(Boolean); 
};