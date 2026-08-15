require('dotenv').config();
const express = require('express');
const http = require('http');
const path = require('path');
const cors = require('cors');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || '0.0.0.0';

// Setup Socket.IO for real-time WebSocket updates
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

// Pass Socket.IO instance to orderService
const orderService = require('./services/orderService');
orderService.setSocketIO(io);

io.on('connection', (socket) => {
  console.log(`⚡ Client connected to Socket.IO: ${socket.id}`);
  
  socket.on('join_role_room', (role) => {
    socket.join(`role_${role}`);
  });

  socket.on('disconnect', () => {
    // client disconnected
  });
});

app.use(cors());
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ limit: '15mb', extended: true }));

// Serve static frontend files
app.use(express.static(path.join(__dirname, "../public/pages")));
app.use(express.static(path.join(__dirname, "../public/assets")));
app.use(express.static(path.join(__dirname, "../public")));

// Health API
app.get('/api/health', (req, res) => {
  res.json({
    status: 'UP',
    platform: 'FARMORA Agro-Tech System',
    timestamp: new Date().toISOString(),
    database: 'Persistent LowDB Storage Active',
    sockets: 'Socket.IO Real-Time Engine Online'
  });
});

// Market Demand Intelligence Endpoint
app.get('/api/demand/overview', (req, res) => {
  res.json({
    region: 'Tamil Nadu Statewide',
    allProducts: [
      { id: 'p1', productName: 'Fresh Organic Tomatoes', demandLevel: 'HIGH', currentSupply: 150, predictedDemand: 280, shortage: 130, unit: 'kg', trend: 'INCREASING', growthPercentage: 35, icon: 'fas fa-apple-alt', farmerLocation: 'Thanjavur' },
      { id: 'p2', productName: 'Red Onions (Small)', demandLevel: 'HIGH', currentSupply: 200, predictedDemand: 340, shortage: 140, unit: 'kg', trend: 'INCREASING', growthPercentage: 28, icon: 'fas fa-seedling', farmerLocation: 'Dindigul' },
      { id: 'p3', productName: 'Farm Fresh Potatoes', demandLevel: 'MEDIUM', currentSupply: 180, predictedDemand: 210, shortage: 30, unit: 'kg', trend: 'STABLE', growthPercentage: 12, icon: 'fas fa-carrot', farmerLocation: 'Salem' },
      { id: 'p4', productName: 'Organic Green Chilies', demandLevel: 'HIGH', currentSupply: 80, predictedDemand: 160, shortage: 80, unit: 'kg', trend: 'INCREASING', growthPercentage: 42, icon: 'fas fa-pepper-hot', farmerLocation: 'Thanjavur' }
    ],
    potentialShortages: [
      { productName: 'Organic Green Chilies', shortage: 80, unit: 'kg', farmerLocation: 'Thanjavur', currentSupply: 80, predictedDemand: 160, growthPercentage: 42 }
    ]
  });
});

app.get('/api/demand/region/:region', (req, res) => {
  const { region } = req.params;
  res.json({
    region,
    allProducts: [
      { id: 'p1', productName: 'Fresh Organic Tomatoes', demandLevel: 'HIGH', currentSupply: 100, predictedDemand: 220, shortage: 120, unit: 'kg', trend: 'INCREASING', growthPercentage: 40, icon: 'fas fa-apple-alt', farmerLocation: region },
      { id: 'p2', productName: 'Red Onions (Small)', demandLevel: 'MEDIUM', currentSupply: 150, predictedDemand: 180, shortage: 30, unit: 'kg', trend: 'STABLE', growthPercentage: 15, icon: 'fas fa-seedling', farmerLocation: region }
    ],
    potentialShortages: [
      { productName: 'Fresh Organic Tomatoes', shortage: 120, unit: 'kg', farmerLocation: region, currentSupply: 100, predictedDemand: 220, growthPercentage: 40 }
    ]
  });
});

// Mount Modular API Routes
const apiRoutes = require('./routes/apiRoutes');
app.use('/api', apiRoutes);

// Page Fallback Routes
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "../public/home.html")));
app.get("/farmer_reg.html", (req, res) => res.sendFile(path.join(__dirname, "../public/pages/farmer_reg.html")));
app.get("/consumer_reg.html", (req, res) => res.sendFile(path.join(__dirname, "../public/pages/consumer_reg.html")));
app.get("/product", (req, res) => res.sendFile(path.join(__dirname, "../public/pages/product.html")));
app.get("/product.html", (req, res) => res.sendFile(path.join(__dirname, "../public/pages/product.html")));
app.get("/customer-shop", (req, res) => res.sendFile(path.join(__dirname, "../public/pages/customer-shop.html")));
app.get("/customer-shop.html", (req, res) => res.sendFile(path.join(__dirname, "../public/pages/customer-shop.html")));
app.get("/booking.html", (req, res) => res.sendFile(path.join(__dirname, "../public/pages/booking.html")));
app.get("/payment.html", (req, res) => res.sendFile(path.join(__dirname, "../public/pages/payment.html")));
app.get("/tracker.html", (req, res) => res.sendFile(path.join(__dirname, "../public/pages/tracker.html")));
app.get("/transaction-dashboard.html", (req, res) => res.sendFile(path.join(__dirname, "../public/pages/transaction-dashboard.html")));
app.get("/chatbot.html", (req, res) => res.sendFile(path.join(__dirname, "../public/pages/chatbot.html")));
app.get("/farmer-dashboard.html", (req, res) => res.sendFile(path.join(__dirname, "../public/pages/farmer-dashboard.html")));
app.get("/delivery-dashboard.html", (req, res) => res.sendFile(path.join(__dirname, "../public/pages/delivery-dashboard.html")));
app.get("/smart-agriculture", (req, res) => res.sendFile(path.join(__dirname, "../public/pages/smart-agriculture.html")));
app.get("/smart-agriculture.html", (req, res) => res.sendFile(path.join(__dirname, "../public/pages/smart-agriculture.html")));
app.get("/disease-detection", (req, res) => res.sendFile(path.join(__dirname, "../public/pages/disease-detection.html")));
app.get("/disease-detection.html", (req, res) => res.sendFile(path.join(__dirname, "../public/pages/disease-detection.html")));
app.get("/farmer/disease-detection", (req, res) => res.sendFile(path.join(__dirname, "../public/pages/disease-detection.html")));
app.get("/yield-prediction", (req, res) => res.sendFile(path.join(__dirname, "../public/pages/yield-prediction.html")));
app.get("/yield-prediction.html", (req, res) => res.sendFile(path.join(__dirname, "../public/pages/yield-prediction.html")));
app.get("/farmer/yield-prediction", (req, res) => res.sendFile(path.join(__dirname, "../public/pages/yield-prediction.html")));

if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, HOST, () => {
    console.log(`Server is listening on ${HOST}:${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
  });
}

module.exports = app;
