# 🌾 Farmora — Digital Agriculture & Direct Supply Chain Platform

> Full-stack agri-commerce platform connecting farmers directly to consumers, featuring atomic stock management, real-time WebSocket order tracking, and agricultural advisory services.

[![Live Demo](https://img.shields.io/badge/Live_Demo-Vercel-000000?style=flat-square&logo=vercel&logoColor=white)](https://farmar-flame.vercel.app)
[![Node.js](https://img.shields.io/badge/Backend-Node.js-339933?style=flat-square&logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL_%2F_Supabase-316192?style=flat-square&logo=postgresql&logoColor=white)](https://supabase.com)
[![Socket.IO](https://img.shields.io/badge/Real--Time-Socket.IO-010101?style=flat-square&logo=socketdotio&logoColor=white)](https://socket.io)

---

## 📌 Overview & Problem Statement
Smallholder farmers frequently lose significant profit margins to supply-chain intermediaries and lack digital infrastructure to manage inventory, track order fulfillments in real-time, or access localized crop health advisory. 

**Farmora** provides a direct-to-consumer marketplace with real-time stock synchronization, atomic inventory reservations to prevent checkout race conditions, and integrated crop management modules.

---

## ✨ Key Features
- **Direct Marketplace:** Multi-role user portal (Farmers, Consumers, Delivery Partners) for listing and purchasing fresh produce.
- **Atomic Stock Decrement:** PostgreSQL stored procedure (`reserve_stock_atomic`) preventing inventory overselling during concurrent checkouts.
- **Real-Time Fulfillment Tracking:** Live order updates and delivery status dispatched via Socket.IO events.
- **Crop Health & Advisory:** Embedded diagnostic tools for plant disease identification and seasonal yield planning.
- **Role-Based Access Control:** Row Level Security (RLS) policies securing consumer and farmer datasets.

---

## 🛠️ Tech Stack
- **Frontend:** HTML5, CSS3, JavaScript (Modular ES6+)
- **Backend:** Node.js, Express.js, Socket.IO, Helmet, CORS
- **Database:** Supabase (PostgreSQL with RLS & PL/pgSQL Stored Procedures)
- **Deployment:** Vercel

---

## 🏗️ System Architecture

```
[ Client Browser (Consumer / Farmer / Delivery) ]
                       │
                       ▼ (HTTP REST / WebSocket Events)
          [ Node.js & Express API Gateway ]
          ├── Authentication & JWT Middleware
          ├── Order & Inventory Controller
          └── Socket.IO Real-Time Dispatcher
                       │
                       ▼ (PostgreSQL Client / Service Role)
         [ Supabase Database (PostgreSQL) ]
          ├── Tables: users, products, orders, order_items
          ├── PL/pgSQL: reserve_stock_atomic()
          └── Row Level Security (RLS) Policies
```

---

## 🔄 Application Workflow
1. **Farmer Onboarding:** Farmer registers, lists produce with quantity and pricing.
2. **Catalog Browsing:** Consumer browses active listings and adds produce to cart.
3. **Atomic Checkout:** Order placement executes a PostgreSQL stored procedure to verify and lock inventory atomically.
4. **Real-Time Dispatch:** Delivery partner accepts assignment; consumer receives live WebSocket status updates.

---

## 📸 Screenshots
- `docs/screenshots/farmer_portal.png` — Farmer produce listing console.
- `docs/screenshots/marketplace.png` — Consumer shopping & cart interface.
- `docs/screenshots/delivery_dashboard.png` — Real-time order dispatch screen.

---

## 🚀 Getting Started Locally

### 1. Prerequisites
- Node.js (v18.x+)
- npm or yarn

### 2. Clone & Install
```bash
git clone https://github.com/Sanjay151606/farmora.git
cd farmora
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the root directory (refer to `.env.example`):
```env
PORT=5000
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
JWT_SECRET=your_jwt_secret
```

### 4. Run the Project
```bash
# Start development server
npm run dev

# Start production server
npm start
```
Open `http://localhost:5000` in your browser.

---

## 🔌 API Documentation Summary

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register new Farmer or Consumer |
| `POST` | `/api/auth/login` | Authenticate user & issue JWT |
| `GET` | `/api/products` | Retrieve active marketplace produce |
| `POST` | `/api/products` | Add new produce listing (Farmer only) |
| `POST` | `/api/orders` | Place order with atomic stock decrement |
| `GET` | `/api/orders/:id` | Get real-time delivery status |

---

## 👤 Author
**Sanjay**  
- LinkedIn: [linkedin.com/in/sanjayselvamani/](https://www.linkedin.com/in/sanjayselvamani/)  
- Portfolio: [sanjay151606.github.io/new-portfolio/](https://sanjay151606.github.io/new-portfolio/)  
- Email: [ssanjay41571@gmail.com](mailto:ssanjay41571@gmail.com)
