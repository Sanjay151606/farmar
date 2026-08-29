const express = require('express');
const router = express.Router();
const apiControllers = require('../controllers/apiControllers');
const { verifyToken, requireRole } = require('../middleware/auth');

// Auth & Users
router.post('/auth/register', apiControllers.register);
router.post('/auth/signup', apiControllers.register);
router.post('/auth/login', apiControllers.login);
router.get('/auth/profile', verifyToken, apiControllers.getProfile);
router.get('/users', verifyToken, apiControllers.getUsers);

// Products
router.get('/products', apiControllers.getProducts);
router.get('/products/:id', apiControllers.getProductById);
router.post('/products', apiControllers.createProduct);
router.put('/products/:id', apiControllers.updateProduct);
router.delete('/products/:id', apiControllers.deleteProduct);
router.get('/categories', apiControllers.getCategories);

// Cart
router.get('/cart', apiControllers.getCart);
router.post('/cart', apiControllers.saveCart);
router.post('/cart/add', apiControllers.addToCart);
router.post('/cart/remove', apiControllers.removeFromCart);
router.delete('/cart', apiControllers.clearCart);

// Orders
router.get('/orders', apiControllers.getOrders);
router.get('/orders/available', apiControllers.getAvailableOrders);
router.get('/orders/delivery/:id', apiControllers.getDeliveryOrders);
router.post('/orders/:id/accept', apiControllers.acceptOrder);
router.get('/orders/:id', apiControllers.getOrderById);
router.post('/orders', apiControllers.createOrder);
router.put('/orders/:id/status', apiControllers.updateOrderStatus);
router.patch('/orders/:id/status', apiControllers.updateOrderStatus);

// Delivery
router.get('/delivery-boys', apiControllers.getDeliveryBoys);
router.get('/delivery/orders', apiControllers.getOrders);
router.post('/delivery/assign', apiControllers.assignDelivery);
router.post('/delivery/location', apiControllers.updateDeliveryLocation);
router.get('/delivery/location/:id', apiControllers.getDeliveryLocation);

// Disease
router.get('/farmer/disease-detection/history', verifyToken, apiControllers.getDiseaseHistory);
router.get('/disease/history', verifyToken, apiControllers.getDiseaseHistory);
router.post('/farmer/disease-detection', verifyToken, apiControllers.analyzeDisease);
router.post('/disease', verifyToken, apiControllers.analyzeDisease);

// Yield
router.get('/farmer/yield-prediction/history', verifyToken, apiControllers.getYieldHistory);
router.get('/yield/history', verifyToken, apiControllers.getYieldHistory);
router.post('/farmer/yield-prediction', verifyToken, apiControllers.predictYield);
router.post('/yield', verifyToken, apiControllers.predictYield);

// Notifications & Weather
router.get('/notifications', verifyToken, apiControllers.getNotifications);
router.post('/notifications/send-sms', apiControllers.sendSms);
router.post('/notifications/whatsapp-link', apiControllers.getWhatsAppLink);
router.get('/weather', apiControllers.getWeather);

// Voice Translation
router.post('/translate', apiControllers.translate);

module.exports = router;
