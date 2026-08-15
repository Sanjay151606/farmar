const store = require('../models/store');

const productService = {
  getProducts({ search, category, farmer, page = 1, limit = 20 }) {
    let products = store.getProducts();

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      products = products.filter(p => 
        p.name.toLowerCase().includes(q) ||
        (p.farmer && p.farmer.toLowerCase().includes(q)) ||
        (p.farmerLocation && p.farmerLocation.toLowerCase().includes(q)) ||
        (p.category && p.category.toLowerCase().includes(q))
      );
    }

    if (category && category !== 'All') {
      products = products.filter(p => p.category && p.category.toLowerCase() === category.toLowerCase());
    }

    if (farmer) {
      products = products.filter(p => p.farmer && p.farmer.toLowerCase() === farmer.toLowerCase());
    }

    const total = products.length;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.max(1, parseInt(limit));
    const totalPages = Math.ceil(total / limitNum);
    const offset = (pageNum - 1) * limitNum;

    const paginated = products.slice(offset, offset + limitNum);

    return {
      products: paginated,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages
      }
    };
  },

  getProductById(id) {
    return store.getProductById(id);
  },

  createProduct(data) {
    const newId = 'p' + Date.now().toString().slice(-5);
    const newProduct = {
      id: newId,
      name: data.name,
      category: data.category || 'Vegetables',
      icon: data.icon || 'fas fa-seedling',
      price: Number(data.price),
      unit: data.unit || 'kg',
      quantity: Number(data.quantity),
      farmer: data.farmer || 'Selvi Farms',
      farmName: data.farmName || (data.farmer + ' Farms'),
      farmerLocation: data.farmerLocation || 'Madurai',
      description: data.description || 'Fresh farm produce harvested directly from Tamil Nadu fields.',
      season: data.season || 'Fresh Produce',
      active: true,
      createdAt: new Date().toISOString()
    };
    return store.saveProduct(newProduct);
  },

  updateProduct(id, data) {
    const existing = store.getProductById(id);
    if (!existing) return null;

    const updated = {
      ...existing,
      ...data,
      price: data.price !== undefined ? Number(data.price) : existing.price,
      quantity: data.quantity !== undefined ? Number(data.quantity) : existing.quantity
    };

    return store.saveProduct(updated);
  },

  deleteProduct(id) {
    return store.deleteProduct(id);
  }
};

module.exports = productService;
