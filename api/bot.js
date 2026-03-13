export default async function handler(req, res) {
  // 1. Grab the slug from the URL
  const { slug } = req.query;

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

    // If the product doesn't exist, send them away
    if (!product) {
      return res.status(404).send('Product not found');
    }

    // 4. Safely grab the product image
    const imageUrl = product.images?.[0] || product.image || 'https://sarvaajewelry.com/og-image.jpg';
    
    // --- ✅ THE FIX: Look for 'title' first, then 'name' ---
    const productName = product.title || product.name || 'Jewelry';
    const title = `${productName} | Sarvaa`;
    const description = product.short_description || product.description || `Discover the beautifully handcrafted ${productName}.`;
    const url = `https://${req.headers.host}/product/${slug}`;

    // 5. Build a custom, invisible HTML card specifically for the robot
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>${title}</title>
        <meta property="og:title" content="${title}">
        <meta property="og:description" content="${description}">
        <meta property="og:image" content="${imageUrl}">
        <meta property="og:url" content="${url}">
        <meta property="og:type" content="product">
        
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

    // 6. Hand it to WhatsApp!
    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(html);

  } catch (error) {
    console.error("Bot API Error:", error);
    res.status(500).send("Server Error");
  }
}