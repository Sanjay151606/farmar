const { readDb, writeDb } = require('../config/db');

const store = {
  getProducts() {
    return readDb().products || [];
  },

  getProductById(id) {
    return (readDb().products || []).find(p => p.id === id);
  },

  saveProduct(productData) {
    const db = readDb();
    const existingIdx = db.products.findIndex(p => p.id === productData.id);
    if (existingIdx !== -1) {
      db.products[existingIdx] = { ...db.products[existingIdx], ...productData };
    } else {
      db.products.unshift(productData);
    }
    writeDb(db);
    return productData;
  },

  deleteProduct(id) {
    const db = readDb();
    const idx = db.products.findIndex(p => p.id === id);
    if (idx !== -1) {
      db.products.splice(idx, 1);
      writeDb(db);
      return true;
    }
    return false;
  },

  decreaseProductStock(productId, qty) {
    const db = readDb();
    const prod = db.products.find(p => p.id === productId);
    if (prod) {
      prod.quantity = Math.max(0, prod.quantity - qty);
      writeDb(db);
      return prod;
    }
    return null;
  },

  getOrders() {
    return readDb().orders || [];
  },

  getOrderById(id) {
    return (readDb().orders || []).find(o => o.id === id);
  },

  saveOrder(orderData) {
    const db = readDb();
    db.orders.unshift(orderData);
    writeDb(db);
    return orderData;
  },

  updateOrderStatus(orderId, status, extraFields = {}) {
    const db = readDb();
    const order = db.orders.find(o => o.id === orderId);
    if (order) {
      order.status = status;
      Object.assign(order, extraFields);
      writeDb(db);
      return order;
    }
    return null;
  },

  getCart() {
    return readDb().cart || [];
  },

  saveCart(cartItems) {
    const db = readDb();
    db.cart = cartItems;
    writeDb(db);
    return db.cart;
  },

  getDeliveryBoys() {
    return readDb().deliveryBoys || [];
  },

  getDiseaseDiagnoses(farmerId) {
    const all = readDb().diseaseDiagnoses || [];
    if (!farmerId) return all;
    return all.filter(d => d.farmerId === farmerId);
  },

  saveDiseaseDiagnosis(diag) {
    const db = readDb();
    db.diseaseDiagnoses.unshift(diag);
    writeDb(db);
    return diag;
  },

  getYieldPredictions(farmerId) {
    const all = readDb().yieldPredictions || [];
    if (!farmerId) return all;
    return all.filter(y => y.farmerId === farmerId);
  },

  saveYieldPrediction(pred) {
    const db = readDb();
    db.yieldPredictions.unshift(pred);
    writeDb(db);
    return pred;
  },

  getNotifications(userId) {
    const all = readDb().notifications || [];
    if (!userId) return all;
    return all.filter(n => n.userId === userId);
  },

  addNotification(userId, title, message) {
    const db = readDb();
    const notif = {
      id: 'n-' + Date.now(),
      userId,
      title,
      message,
      read: false,
      createdAt: new Date().toISOString()
    };
    db.notifications.unshift(notif);
    writeDb(db);
    return notif;
  },

  saveNotification(notif) {
    const db = readDb();
    if (!db.notifications) db.notifications = [];
    db.notifications.unshift(notif);
    writeDb(db);
    return notif;
  },

  getDeliveryTracking(orderId) {
    const db = readDb();
    if (!db.deliveryTracking) db.deliveryTracking = {};
    return db.deliveryTracking[orderId] || null;
  },

  saveDeliveryTracking(data) {
    const db = readDb();
    if (!db.deliveryTracking) db.deliveryTracking = {};
    db.deliveryTracking[data.orderId || data.order_id] = data;
    writeDb(db);
    return data;
  }
};

module.exports = store;
