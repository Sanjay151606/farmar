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

  getAvailableOrders(req, res) {
    const all = store.getOrders();
    const available = all.filter(o => !o.deliveryBoyId && (o.status === 'PENDING' || o.status === 'CONFIRMED' || o.status === 'ACCEPTED'));
    res.json(available);
  },

  getDeliveryOrders(req, res) {
    const { id } = req.params;
    const all = store.getOrders();
    const myOrders = all.filter(o => o.deliveryBoyId === id);
    res.json(myOrders);
  },

  acceptOrder(req, res) {
    try {
      const { id } = req.params;
      const { deliveryBoyId } = req.body;
      const updated = orderService.assignDeliveryBoy(id, deliveryBoyId);
      res.json({ success: true, order: updated });
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
  async getDiseaseHistory(req, res) {
    const farmerId = req.query.farmerId || (req.user ? req.user.name : 'Kavitha S');
    const result = await diseaseService.getHistory(farmerId);
    res.json(result);
  },

  async analyzeDisease(req, res) {
    try {
      const diag = await diseaseService.analyzeCropImage(req.body);
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
  async updateDeliveryLocation(req, res) {
    const { orderId, deliveryBoyId, deliveryBoyName, lat, lng, speed, accuracy, heading, status } = req.body;
    
    if (!orderId || lat === undefined || lng === undefined) {
      return res.status(400).json({ error: 'orderId, lat, and lng are required' });
    }

    const { supabase, isSupabaseEnabled } = require('../config/supabase');

    const locationData = {
      order_id: orderId,
      orderId,
      delivery_partner_id: deliveryBoyId,
      deliveryBoyId,
      delivery_partner_name: deliveryBoyName,
      deliveryBoyName,
      latitude: Number(lat),
      lat: Number(lat),
      longitude: Number(lng),
      lng: Number(lng),
      speed: Number(speed || 0),
      accuracy: Number(accuracy || 10),
      heading: Number(heading || 0),
      status: status || 'IN_TRANSIT',
      updated_at: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // 1. Persist to LowDB / local memory
    store.saveDeliveryTracking(locationData);

    // 2. Persist to Supabase delivery_tracking table if enabled
    if (isSupabaseEnabled()) {
      try {
        await supabase.from('delivery_tracking').upsert({
          order_id: locationData.order_id,
          delivery_partner_id: locationData.delivery_partner_id,
          delivery_partner_name: locationData.delivery_partner_name,
          latitude: locationData.latitude,
          longitude: locationData.longitude,
          speed: locationData.speed,
          accuracy: locationData.accuracy,
          heading: locationData.heading,
          status: locationData.status,
          updated_at: locationData.updated_at
        }, { onConflict: 'order_id' });
      } catch (err) {
        console.warn('Supabase delivery tracking upsert note:', err.message);
      }
    }

    res.json({ success: true, location: locationData });
  },

  async getDeliveryLocation(req, res) {
    const { id } = req.params;
    const { supabase, isSupabaseEnabled } = require('../config/supabase');

    // Check Supabase first
    if (isSupabaseEnabled()) {
      try {
        const { data, error } = await supabase
          .from('delivery_tracking')
          .select('*')
          .eq('order_id', id)
          .single();

        if (!error && data) {
          return res.json({
            success: true,
            location: {
              orderId: data.order_id,
              deliveryBoyId: data.delivery_partner_id,
              deliveryBoyName: data.delivery_partner_name,
              lat: Number(data.latitude),
              lng: Number(data.longitude),
              speed: Number(data.speed),
              accuracy: Number(data.accuracy),
              heading: Number(data.heading),
              status: data.status,
              updatedAt: data.updated_at
            }
          });
        }
      } catch (e) {}
    }

    const loc = store.getDeliveryTracking(id);
    res.json({ success: true, location: loc });
  },

  // SMS & WhatsApp Alerts
  async sendSms(req, res) {
    const { to, message } = req.body;
    const notificationService = require('../services/notificationService');
    const result = await notificationService.sendTwilioSms({ to, message });
    res.json(result);
  },

  getWhatsAppLink(req, res) {
    const { phone, message } = req.body;
    const notificationService = require('../services/notificationService');
    const link = notificationService.generateWhatsAppLink(phone, message);
    res.json({ success: true, url: link });
  }
};

module.exports = apiControllers;
