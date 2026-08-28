const express = require('express');
const router = express.Router();
const apiControllers = require('../controllers/apiControllers');
const { verifyToken, requireRole } = require('../middleware/auth');

// Auth & Users
router.post('/auth/login', apiControllers.login);
router.get('/users', verifyToken, apiControllers.getUsers);

// Products
router.get('/products', apiControllers.getProducts);
router.get('/products/:id', apiControllers.getProductById);
router.post('/products', verifyToken, requireRole('farmer', 'vendor', 'admin'), apiControllers.createProduct);
router.put('/products/:id', verifyToken, requireRole('farmer', 'vendor', 'admin'), apiControllers.updateProduct);
router.delete('/products/:id', verifyToken, requireRole('farmer', 'vendor', 'admin'), apiControllers.deleteProduct);
router.get('/categories', apiControllers.getCategories);

// Cart
router.get('/cart', apiControllers.getCart);
router.post('/cart', apiControllers.saveCart);

// Orders
router.get('/orders', verifyToken, apiControllers.getOrders);
router.get('/orders/:id', verifyToken, apiControllers.getOrderById);
router.post('/orders', verifyToken, apiControllers.createOrder);
router.put('/orders/:id/status', verifyToken, apiControllers.updateOrderStatus);

// Delivery
router.get('/delivery-boys', apiControllers.getDeliveryBoys);
router.get('/delivery/orders', verifyToken, apiControllers.getOrders);
router.post('/delivery/assign', verifyToken, apiControllers.assignDelivery);
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

// Notifications
router.get('/notifications', verifyToken, apiControllers.getNotifications);

// Voice Translation
router.post('/translate', apiControllers.translate);

module.exports = router;
