const productService = require('../services/productService');
const orderService = require('../services/orderService');
const diseaseService = require('../services/diseaseService');
const yieldService = require('../services/yieldService');
const store = require('../models/store');
const { supabase, isSupabaseEnabled } = require('../config/supabase');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../middleware/auth');

const apiControllers = {
  // Auth
  async register(req, res) {
    const { email, password, name, phone, role, location } = req.body;
    const userRole = role || 'customer';
    const userName = name || 'Farmora Member';
    const userPhone = phone || '';
    const userLocation = location || 'Tamil Nadu';

    try {
      let userId = 'usr_' + Date.now().toString().slice(-6);
      let sessionToken = null;

      // 1. If Supabase is enabled and email+password provided, register via Supabase Auth
      if (isSupabaseEnabled() && email && password) {
        const { data: authData, error: authErr } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: userName, phone: userPhone, role: userRole, location: userLocation }
          }
        });

        if (authErr) {
          return res.status(400).json({ error: authErr.message });
        }

        if (authData && authData.user) {
          userId = authData.user.id;
          sessionToken = authData.session ? authData.session.access_token : null;

          // Upsert into public.profiles
          await supabase.from('profiles').upsert({
            id: userId,
            full_name: userName,
            email,
            phone: userPhone,
            role: userRole,
            location: userLocation,
            updated_at: new Date().toISOString()
          });
        }
      }

      if (!sessionToken) {
        sessionToken = jwt.sign({ id: userId, name: userName, role: userRole, email, phone: userPhone, location: userLocation }, JWT_SECRET, { expiresIn: '7d' });
      }

      // Save to local store for fallback
      if (store.readDb) {
        const db = store.readDb();
        if (!db.users) db.users = [];
        db.users.push({ id: userId, name: userName, email, phone: userPhone, role: userRole, location: userLocation, createdAt: new Date().toISOString() });
        store.writeDb(db);
      }

      res.status(201).json({
        success: true,
        token: sessionToken,
        user: { id: userId, name: userName, email, phone: userPhone, role: userRole, location: userLocation }
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async login(req, res) {
    const { email, password, role, name } = req.body;
    const userRole = role || 'customer';
    const userName = name || (userRole === 'farmer' ? 'Kavitha S' : userRole === 'delivery' ? 'Ramesh K' : 'Sanjay Kumar');

    try {
      // 1. Supabase Auth with Email & Password
      if (isSupabaseEnabled() && email && password) {
        const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (!authErr && authData && authData.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authData.user.id)
            .maybeSingle();

          const finalName = (profile && profile.full_name) || authData.user.user_metadata.full_name || userName;
          const finalRole = (profile && profile.role) || authData.user.user_metadata.role || userRole;
          const finalLocation = (profile && profile.location) || authData.user.user_metadata.location || 'Tamil Nadu';

          return res.json({
            success: true,
            token: authData.session ? authData.session.access_token : jwt.sign({ id: authData.user.id, name: finalName, role: finalRole }, JWT_SECRET),
            user: {
              id: authData.user.id,
              name: finalName,
              email: authData.user.email,
              phone: (profile && profile.phone) || '',
              role: finalRole,
              location: finalLocation
            }
          });
        }
      }

      // 2. Role-based fallback login
      const token = jwt.sign({ name: userName, role: userRole }, JWT_SECRET, { expiresIn: '7d' });
      res.json({ success: true, token, user: { name: userName, role: userRole, location: 'Tamil Nadu' } });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async getProfile(req, res) {
    if (isSupabaseEnabled() && req.user && req.user.id) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', req.user.id)
        .maybeSingle();
      if (profile) return res.json(profile);
    }
    res.json(req.user || { name: 'Guest User', role: 'customer' });
  },

  getUsers(req, res) {
    res.json(store.readDb ? store.readDb().users || [] : []);
  },

  // Products
  getProducts(req, res) {
    try {
      const result = productService.getProducts(req.query);
      if (req.query.paginated === 'true') {
        res.json(result);
      } else {
        res.json(result.products || []);
      }
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

  // Cart (Supabase & Local Store Synced)
  async getCart(req, res) {
    const customerId = req.query.customerId || (req.user && req.user.id);
    if (isSupabaseEnabled() && customerId) {
      try {
        const { data: cart } = await supabase
          .from('carts')
          .select('id')
          .eq('customer_id', customerId)
          .maybeSingle();

        if (cart) {
          const { data: items } = await supabase
            .from('cart_items')
            .select('id, product_id, quantity, products:product_id (id, name, price, unit, farmer, image_url, icon)')
            .eq('cart_id', cart.id);

          if (items && items.length > 0) {
            const mapped = items.map(i => ({
              id: i.product_id,
              cartItemId: i.id,
              name: i.products ? i.products.name : 'Produce',
              price: i.products ? Number(i.products.price) : 0,
              unit: i.products ? i.products.unit : 'kg',
              quantity: i.quantity,
              farmer: i.products ? i.products.farmer : '',
              image: i.products ? i.products.image_url : null,
              icon: i.products ? i.products.icon : 'fas fa-seedling'
            }));
            return res.json(mapped);
          }
        }
      } catch (err) {
        console.warn('Supabase getCart note:', err.message);
      }
    }
    res.json(store.getCart());
  },

  async saveCart(req, res) {
    const items = req.body.items || req.body;
    const customerId = req.body.customerId || (req.user && req.user.id);

    if (isSupabaseEnabled() && customerId && Array.isArray(items)) {
      try {
        let { data: cart } = await supabase
          .from('carts')
          .select('id')
          .eq('customer_id', customerId)
          .maybeSingle();

        if (!cart) {
          const { data: newCart } = await supabase
            .from('carts')
            .insert({ customer_id: customerId })
            .select()
            .single();
          cart = newCart;
        }

        if (cart) {
          await supabase.from('cart_items').delete().eq('cart_id', cart.id);
          for (const item of items) {
            if (item.id) {
              await supabase.from('cart_items').insert({
                cart_id: cart.id,
                product_id: item.id,
                quantity: item.quantity || 1
              });
            }
          }
        }
      } catch (err) {
        console.warn('Supabase saveCart note:', err.message);
      }
    }

    res.json(store.saveCart(items));
  },

  async addToCart(req, res) {
    const { customerId, productId, quantity = 1 } = req.body;
    if (isSupabaseEnabled() && customerId && productId) {
      try {
        let { data: cart } = await supabase
          .from('carts')
          .select('id')
          .eq('customer_id', customerId)
          .maybeSingle();

        if (!cart) {
          const { data: newCart } = await supabase
            .from('carts')
            .insert({ customer_id: customerId })
            .select()
            .single();
          cart = newCart;
        }

        if (cart) {
          const { data: existing } = await supabase
            .from('cart_items')
            .select('id, quantity')
            .eq('cart_id', cart.id)
            .eq('product_id', productId)
            .maybeSingle();

          if (existing) {
            await supabase
              .from('cart_items')
              .update({ quantity: existing.quantity + quantity, updated_at: new Date().toISOString() })
              .eq('id', existing.id);
          } else {
            await supabase
              .from('cart_items')
              .insert({ cart_id: cart.id, product_id: productId, quantity });
          }
        }
      } catch (err) {
        console.warn('Supabase addToCart note:', err.message);
      }
    }
    res.json({ success: true, message: 'Item added to cart' });
  },

  async removeFromCart(req, res) {
    const { customerId, productId } = req.body;
    if (isSupabaseEnabled() && customerId && productId) {
      try {
        const { data: cart } = await supabase
          .from('carts')
          .select('id')
          .eq('customer_id', customerId)
          .maybeSingle();

        if (cart) {
          await supabase
            .from('cart_items')
            .delete()
            .eq('cart_id', cart.id)
            .eq('product_id', productId);
        }
      } catch (err) {
        console.warn('Supabase removeFromCart note:', err.message);
      }
    }
    res.json({ success: true, message: 'Item removed from cart' });
  },

  async clearCart(req, res) {
    const customerId = req.body.customerId || (req.user && req.user.id);
    if (isSupabaseEnabled() && customerId) {
      try {
        const { data: cart } = await supabase
          .from('carts')
          .select('id')
          .eq('customer_id', customerId)
          .maybeSingle();

        if (cart) {
          await supabase.from('cart_items').delete().eq('cart_id', cart.id);
        }
      } catch (err) {}
    }
    store.saveCart([]);
    res.json({ success: true, message: 'Cart cleared' });
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

  async predictYield(req, res) {
    try {
      const pred = await yieldService.predictYield(req.body);
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
    const { orderId, deliveryBoyId, deliveryBoyName, speed, accuracy, heading, status } = req.body;
    const lat = req.body.lat !== undefined ? req.body.lat : req.body.latitude;
    const lng = req.body.lng !== undefined ? req.body.lng : req.body.longitude;
    
    if (!orderId || lat === undefined || lng === undefined) {
      return res.status(400).json({ error: 'orderId, lat (or latitude), and lng (or longitude) are required' });
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
