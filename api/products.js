const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );
 
    const { data, error } = await supabase
      .from('products')
      .select('id, name, description, price, image_url, category, created_at')
      .order('created_at', { ascending: true });
 
    if (error) throw error;
 
    // Transform flat Supabase schema → nested format expected by script.js
    const products = data.map(p => ({
      id: p.id,
      category: p.category || 'filter',
      badge: '',
      image: p.image_url || '',
      price: p.price / 100,        // cents → euros
      roast: 50,                   // default until roast column is added
      stripeLink: '',
      en: {
        name:    p.name || '',
        region:  p.category || '',
        notes:   p.description || '',
        process: '',
      },
      bg: {
        name:    p.name || '',
        region:  p.category || '',
        notes:   p.description || '',
        process: '',
      },
    }));
 
    return res.status(200).json(products);
 
  } catch (err) {
    console.error('Products error:', err.message);
    return res.status(500).json({ error: 'Failed to load products', detail: err.message });
  }
};
