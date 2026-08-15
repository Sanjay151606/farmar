const store = require('../models/store');

let ioInstance = null;

function setSocketIO(io) {
  ioInstance = io;
}

function broadcastOrderEvent(eventName, orderData) {
  if (ioInstance) {
    ioInstance.emit(eventName, orderData);
    ioInstance.emit('order_status_updated', orderData);
  }
}

const orderService = {
  setSocketIO,

  getOrders({ page = 1, limit = 20, status, farmer, customerId }) {
    let orders = store.getOrders();

    if (status) {
      orders = orders.filter(o => o.status === status);
    }

    if (farmer) {
      orders = orders.filter(o => o.farmerName && o.farmerName.toLowerCase() === farmer.toLowerCase());
    }

    if (customerId) {
      orders = orders.filter(o => o.customerId === customerId);
    }

    const total = orders.length;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.max(1, parseInt(limit));
    const totalPages = Math.ceil(total / limitNum);
    const offset = (pageNum - 1) * limitNum;

    return {
      orders: orders.slice(offset, offset + limitNum),
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages
      }
    };
  },

  getOrderById(id) {
    return store.getOrderById(id);
  },

  createOrder(orderInput) {
    const { customerName, customerAddress, items, totalAmount } = orderInput;

    if (!items || !items.length) {
      throw new Error('Order must contain at least one item');
    }

    // 1. Check stock availability for all items first
    for (const item of items) {
      const prod = store.getProductById(item.productId || item.id);
      if (prod) {
        const reqQty = Number(item.quantity || 1);
        if (prod.quantity < reqQty) {
          throw new Error(`Insufficient stock for ${prod.name}. Available: ${prod.quantity} ${prod.unit}, Requested: ${reqQty} ${prod.unit}`);
        }
      }
    }

    // 2. Reduce product stock dynamically
    for (const item of items) {
      const pId = item.productId || item.id;
      const reqQty = Number(item.quantity || 1);
      store.decreaseProductStock(pId, reqQty);
    }

    // 3. Create new Order record
    const newOrder = {
      id: 'ORD-' + Math.floor(1000 + Math.random() * 9000),
      customerId: orderInput.customerId || 'u1',
      customerName: customerName || 'Sanjay Kumar',
      customerAddress: customerAddress || '42, North Street, Madurai',
      farmerName: items[0] && items[0].farmer ? items[0].farmer : 'Kavitha S',
      deliveryBoyId: null,
      deliveryBoyName: null,
      items,
      totalAmount: Number(totalAmount),
      status: 'PENDING',
      createdAt: new Date().toISOString()
    };

    store.saveOrder(newOrder);

    // 4. Emit real-time Socket.IO event
    broadcastOrderEvent('order_created', newOrder);

    return newOrder;
  },

  updateOrderStatus(orderId, newStatus, extraData = {}) {
    const validStatuses = ['PENDING', 'ACCEPTED', 'CONFIRMED', 'ASSIGNED', 'PICKED_UP', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'];
    if (!validStatuses.includes(newStatus)) {
      throw new Error(`Invalid status transition: ${newStatus}`);
    }

    const updated = store.updateOrderStatus(orderId, newStatus, extraData);
    if (!updated) {
      throw new Error(`Order not found: ${orderId}`);
    }

    // Broadcast status change event
    const eventName = `order_${newStatus.toLowerCase()}`;
    broadcastOrderEvent(eventName, updated);

    return updated;
  },

  assignDeliveryBoy(orderId, deliveryBoyId) {
    const dBoys = store.getDeliveryBoys();
    const dboy = dBoys.find(b => b.id === deliveryBoyId);
    if (!dboy) throw new Error('Delivery partner not found');

    const updated = store.updateOrderStatus(orderId, 'ASSIGNED', {
      deliveryBoyId: dboy.id,
      deliveryBoyName: dboy.name
    });

    broadcastOrderEvent('order_assigned', updated);
    return updated;
  }
};

module.exports = orderService;
