const productService = require('../services/productService');
const orderService = require('../services/orderService');
const diseaseService = require('../services/diseaseService');
const yieldService = require('../services/yieldService');
const store = require('../models/store');

const apiControllers = {
  // Auth
  login(req, res) {
    const { role, name } = req.body;
    const jwt = require('jsonwebtoken');
    const { JWT_SECRET } = require('../middleware/auth');
    const userRole = role || 'customer';
    const userName = name || (userRole === 'farmer' ? 'Kavitha S' : userRole === 'delivery' ? 'Ramesh K' : 'Sanjay Kumar');
    const token = jwt.sign({ name: userName, role: userRole }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ success: true, token, user: { name: userName, role: userRole } });
  },

  getUsers(req, res) {
    res.json(store.readDb ? store.readDb().users || [] : []);
  },

  // Products
  getProducts(req, res) {
    try {
      const result = productService.getProducts(req.query);
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  getProductById(req, res) {
    const p = productService.getProductById(req.params.id);
    if (!p) return res.status(404).json({ error: 'Product not found' });
    res.json(p);
  },

  createProduct(req, res) {
    try {
      const p = productService.createProduct(req.body);
      res.status(201).json(p);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  updateProduct(req, res) {
    const p = productService.updateProduct(req.params.id, req.body);
    if (!p) return res.status(404).json({ error: 'Product not found' });
    res.json(p);
  },

  deleteProduct(req, res) {
    const ok = productService.deleteProduct(req.params.id);
    if (!ok) return res.status(404).json({ error: 'Product not found' });
    res.json({ success: true, message: 'Product deleted successfully' });
  },

  getCategories(req, res) {
    res.json(['All', 'Vegetables', 'Fruits', 'Grains', 'Spices']);
  },

  // Cart
  getCart(req, res) {
    res.json(store.getCart());
  },

  saveCart(req, res) {
    const items = req.body.items || req.body;
    res.json(store.saveCart(items));
  },

  // Orders
  getOrders(req, res) {
    try {
      const result = orderService.getOrders(req.query);
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  getOrderById(req, res) {
    const o = orderService.getOrderById(req.params.id);
    if (!o) return res.status(404).json({ error: 'Order not found' });
    res.json(o);
  },

  createOrder(req, res) {
    try {
      const o = orderService.createOrder(req.body);
      res.status(201).json(o);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  updateOrderStatus(req, res) {
    try {
      const { status, deliveryBoyId, deliveryBoyName } = req.body;
      const updated = orderService.updateOrderStatus(req.params.id, status, { deliveryBoyId, deliveryBoyName });
      res.json(updated);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  // Delivery
  getDeliveryBoys(req, res) {
    res.json(store.getDeliveryBoys());
  },

  assignDelivery(req, res) {
    try {
      const { orderId, deliveryBoyId } = req.body;
      const updated = orderService.assignDeliveryBoy(orderId, deliveryBoyId);
      res.json(updated);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  // Disease
  getDiseaseHistory(req, res) {
    const farmerId = req.query.farmerId || (req.user ? req.user.name : 'Kavitha S');
    res.json(diseaseService.getHistory(farmerId));
  },

  analyzeDisease(req, res) {
    try {
      const diag = diseaseService.analyzeCropImage(req.body);
      res.json({ success: true, diagnosis: diag });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  },

  // Yield
  getYieldHistory(req, res) {
    const farmerId = req.query.farmerId || (req.user ? req.user.name : 'Kavitha S');
    res.json(yieldService.getHistory(farmerId));
  },

  predictYield(req, res) {
    try {
      const pred = yieldService.predictYield(req.body);
      res.json({ success: true, prediction: pred });
    } catch (err) {
      if (err.errors) {
        return res.status(400).json({ error: 'Validation failed', errors: err.errors });
      }
      res.status(400).json({ error: err.message });
    }
  },

  // Notifications
  getNotifications(req, res) {
    const userId = req.query.userId || (req.user ? req.user.name : 'u1');
    res.json(store.getNotifications(userId));
  },

  // Voice Translation (Tamil -> English)
  async translate(req, res) {
    try {
      const { text, from, to } = req.body;
      const translationService = require('../services/translationService');
      const result = await translationService.translateTamilToEnglish(text);
      res.json(result);
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  // Live GPS Tracking (Delivery Partner Location)
  updateDeliveryLocation(req, res) {
    const { orderId, deliveryBoyId, deliveryBoyName, lat, lng, speed, accuracy } = req.body;
    
    // Store in-memory / state
    const locationData = {
      orderId,
      deliveryBoyId,
      deliveryBoyName,
      lat: Number(lat),
      lng: Number(lng),
      speed: Number(speed || 0),
      accuracy: Number(accuracy || 10),
      updatedAt: new Date().toISOString()
    };

    if (global.lastKnownLocations) {
      global.lastKnownLocations[orderId || deliveryBoyId] = locationData;
    } else {
      global.lastKnownLocations = { [orderId || deliveryBoyId]: locationData };
    }

    res.json({ success: true, location: locationData });
  },

  getDeliveryLocation(req, res) {
    const { id } = req.params;
    const loc = (global.lastKnownLocations && global.lastKnownLocations[id]) || null;
    res.json({ success: true, location: loc });
  }
};

module.exports = apiControllers;
