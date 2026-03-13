export default async function handler(req, res) {
  // 1. BULLETPROOF SLUG EXTRACTION (Fixes the "undefined" bug)
  let slug = req.query.slug;
  if (!slug && req.url.includes('/product/')) {
    // If Vercel stripped the query, manually pull it out of the raw URL
    slug = req.url.split('/product/')[1].split('?')[0];
  }

  // If somehow it is still missing, abort before crashing
  if (!slug) {
    return res.status(400).send('No product slug provided');
  }

  // 2. Safely grab your Supabase environment variables from Vercel
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

  try {
    // 3. Ask Supabase for this specific product directly
    const response = await fetch(`${supabaseUrl}/rest/v1/products?slug=eq.${slug}&select=*`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });
    
    const data = await response.json();
    const product = data[0];

    if (!product) {
      return res.status(404).send('Product not found in database');
    }

    // 4. Safely grab and format the product image
    let rawImageUrl = product.images?.[0] || product.image || 'https://sarva-bin-landing.vercel.app/og-image.jpg';
    
    // Ensure it is a full, absolute HTTPS link
    if (!rawImageUrl.startsWith('http')) {
      rawImageUrl = `https://${req.headers.host}${rawImageUrl.startsWith('/') ? '' : '/'}${rawImageUrl}`;
    }

    // Encode spaces safely for WhatsApp
    let imageUrl;
    try {
      imageUrl = new URL(rawImageUrl).toString();
    } catch (e) {
      imageUrl = rawImageUrl; 
    }

    // 5. Format the Text
    const productName = product.title || product.name || 'Jewelry';
    const title = `${productName} | Sarvaa`;
    const description = product.short_description || product.description || `Discover the beautifully handcrafted ${productName} at Sarvaa.`;
    const url = `https://${req.headers.host}/product/${slug}`;

    // 6. Build the bulletproof HTML card
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>${title}</title>
        
        <meta property="og:title" content="${title}">
        <meta property="og:description" content="${description}">
        <meta property="og:url" content="${url}">
        <meta property="og:type" content="product">
        
        <meta property="og:image" content="${imageUrl}">
        <meta property="og:image:secure_url" content="${imageUrl}">
        <meta property="og:image:width" content="800">
        <meta property="og:image:height" content="800">
        <meta property="og:image:type" content="image/jpeg">
        
        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:title" content="${title}">
        <meta name="twitter:description" content="${description}">
        <meta name="twitter:image" content="${imageUrl}">
      </head>
      <body>
        <script>window.location.replace("/product/${slug}");</script>
      </body>
      </html>
    `;

    // 7. Hand it to WhatsApp!
    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(html);

  } catch (error) {
    console.error("Bot API Error:", error);
    res.status(500).send("Server Error");
  }
}