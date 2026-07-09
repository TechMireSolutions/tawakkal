import crypto from 'crypto';

const API_BASE = 'http://localhost:8000/api/v1/admin';
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzgzNDk4MDc1LCJpYXQiOjE3ODM0OTQ0NzUsImp0aSI6IjEwOGY4ZWVhODViNDQ1MzZiYmQ1NGNjZTA5MTU1ZTRmIiwidXNlcl9pZCI6IjliZDg0ZmRmLWZkNTQtNGFiYi1iNzM4LTBkN2ZlNTc2YWU3YiJ9.SCwzWCeACh3FE261tYter-bhSmgZHAnRbxQIkuVs74I';

async function testCreate() {

  const catId = crypto.randomUUID();

  // The exact payload generation from ProductForm.jsx
  const data = {
    name: 'Test Product',
    sku: 'TST-001',
    slug: 'test-product',
    description: '<p>Test</p>',
    category_id: catId,
    brand: 'Test Brand',
    base_price: '99.99',
    compare_at_price: '',
    stock: 10,
    low_stock_threshold: 5,
    seo_title: '',
    seo_description: '',
    seo_keywords: '',
    status: 'DRAFT',
    is_featured: false,
    media_ids: [],
    variants: []
  };

  const payload = {
    ...data,
    base_price: parseFloat(data.base_price),
    compare_at_price: data.compare_at_price ? parseFloat(data.compare_at_price) : null,
    stock: parseInt(data.stock, 10),
    low_stock_threshold: parseInt(data.low_stock_threshold || 5, 10),
    variants: data.variants.map(v => ({
      ...v,
      color_id: v.color_id || null,
      size_id: v.size_id || null,
      price_override: v.price_override ? parseFloat(v.price_override) : null,
      stock: parseInt(v.stock || 0, 10)
    }))
  };

  console.log("PAYLOAD BEING SENT:", JSON.stringify(payload, null, 2));

  const createRes = await fetch(`${API_BASE}/catalog/products/`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });

  const createData = await createRes.json();
  console.log("RESPONSE HTTP STATUS:", createRes.status);
  console.log("RESPONSE JSON:", JSON.stringify(createData, null, 2));
}

testCreate().catch(console.error);
