# 🌾 Krishi-Route — किसान का मार्गदर्शक

> **"Google Maps for Farmers"** — Find the most *profitable* mandi route, not just the fastest one.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite)](https://vitejs.dev/)
[![Express](https://img.shields.io/badge/Express-4.18-black?logo=express)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-8-47A248?logo=mongodb)](https://www.mongodb.com/)

---

## 📖 Problem Statement

India has 7,000+ Agricultural Produce Market Committees (APMCs), yet **70% of farmers sell at the nearest mandi** without checking prices elsewhere. A farmer selling onions 10 km away might earn ₹20,000, while traveling 50 km could yield ₹24,000 — after transport costs.

**Krishi-Route solves this by calculating net profit per mandi, not just price.**

```
Net Profit = Revenue − Transport Cost − APMC Commission − Handling
Revenue    = Market Price (₹/quintal) × Quantity (quintals)
Transport  = Distance (km) × Vehicle Rate (₹/km)
```

---

## 🗂️ Repository Structure

```
krishi-route-ts/                    ← GitHub repo root
│
├── frontend/                    ← 🖥️  Frontend (React + Vite + TypeScript)
│   ├── public/
|   |     |──index.html
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── tsconfig.node.json
│   ├── package.json
│   └── src/
│       ├── main.tsx                ← React entry point
│       ├── App.tsx                 ← Root component
│       ├── types/
│       │   └── index.ts            ← All shared TS interfaces
│       ├── data/
│       │   └── mockData.ts         ← Crops, vehicles, mandis, price history
│       ├── utils/
│       │   └── profitEngine.ts     ← Core profit algorithm + formatters
│       ├── components/
│       │   ├── Header.tsx
│       │   ├── InputForm.tsx
│       │   ├── MandiCard.tsx
│       │   ├── ProfitChart.tsx
│       │   ├── PriceHistoryChart.tsx
│       │   ├── RouteMap.tsx        ← Leaflet map (fixed for Vite)
│       │   ├── ImpactSummary.tsx
│       │   └── PerishabilityAlert.tsx
│       └── styles/
│           └── global.css
│
├── backend/                  ← 🔧 Backend (Express + MongoDB + TypeScript)
│   ├── .env.example
│   ├── tsconfig.json
│   ├── package.json
│   └── src/
│       ├── server.ts               ← Express app entry
│       ├── config/
│       │   └── database.ts         ← MongoDB connection
│       ├── types/
│       │   └── index.ts            ← Server-side TS interfaces
│       ├── models/
│       │   ├── index.ts            ← Barrel export
│       │   ├── Crop.ts             ← 🌾 Crop schema
│       │   ├── Vehicle.ts          ← 🚛 Vehicle schema
│       │   ├── Mandi.ts            ← 🏪 Mandi schema (2dsphere geo index)
│       │   ├── MarketPrice.ts      ← 💰 Daily price history
│       │   ├── Farmer.ts           ← 👨‍🌾 Farmer profile
│       │   ├── Trip.ts             ← 🗺️  Trip record
│       │   ├── PriceAlert.ts       ← 🔔 Alert subscriptions
│       │   └── RideshareRequest.ts ← 🤝 Pooling board
│       ├── routes/
│       │   ├── crops.ts
│       │   ├── vehicles.ts
│       │   ├── mandis.ts           ← Geospatial $nearSphere query
│       │   ├── prices.ts
│       │   ├── analyze.ts          ← Core profit engine (live DB)
│       │   ├── farmers.ts
│       │   ├── trips.ts
│       │   └── rideshare.ts
│       └── scripts/
│           └── seed.ts             ← Populates DB with initial data
│
├── .gitignore                      ← ✅ Needed
├── README.md                       ← ✅ This file
└── .env.example                    ← ✅ Needed (root-level hint)
```

---

## 🚀 Quick Start

### Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Node.js | ≥ 18 | [nodejs.org](https://nodejs.org) |
| npm | ≥ 9 | comes with Node |
| MongoDB | ≥ 6 | [mongodb.com](https://www.mongodb.com/try/download/community) or use [Atlas](https://www.mongodb.com/atlas) |
| Git | any | [git-scm.com](https://git-scm.com) |

---

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/krishi-route-ts.git
cd krishi-route-ts
```

---

### 2. Start the Backend

```bash
cd backend

# Install dependencies
npm install

# Copy env file and fill in your MongoDB URI
cp .env.example .env

# Seed the database (crops, vehicles, mandis, 30 days of price history)
npm run seed

# Start the dev server
npm run dev
# → API running at http://localhost:5000
```

**Test it:**
```bash
curl http://localhost:5000/health
# → {"status":"ok","timestamp":"..."}
```

---

### 3. Start the Frontend

```bash
# Open a new terminal tab
cd frotend

# Install dependencies
npm install

# Start Vite dev server
npm start 
# → App running at http://localhost:3000
```

---

## ⚙️ Environment Variables

### Backend — `krishi-server/.env`

```env
# MongoDB connection string
MONGODB_URI=mongodb://localhost:27017/krishi_route

# Server port
PORT=5000

# Node environment
NODE_ENV=development

# Frontend URL for CORS
CLIENT_URL=http://localhost:3000

# Optional: live price API
AGMARKNET_API_KEY=your_key_here
GOOGLE_MAPS_API_KEY=your_key_here
```

### Frontend — `frontend/.env`

```env
# Backend API URL
VITE_API_URL=http://localhost:5000
```

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Server health check |
| GET | `/api/crops` | All supported crops |
| GET | `/api/vehicles` | All vehicle types with ₹/km rates |
| GET | `/api/mandis?lat=&lng=&radius=` | Mandis within radius (km) |
| GET | `/api/prices?mandiId=&cropId=&days=` | Price history |
| GET | `/api/prices/latest?mandiId=&cropId=` | Most recent price |
| **POST** | **`/api/analyze`** | **Core profit comparison** |
| POST | `/api/farmers` | Register a farmer |
| GET | `/api/farmers/:phone` | Lookup farmer by phone |
| GET | `/api/trips/farmer/:id` | Trip history (paginated) |
| GET | `/api/trips/farmer/:id/summary` | Profit totals + averages |
| GET | `/api/rideshare?mandiId=&date=` | Open pooling rides |
| POST | `/api/rideshare/:id/join` | Join a rideshare |

### POST `/api/analyze` — Example

```json
// Request body
{
  "cropId":            "65f1a2b3c4d5e6f7a8b9c0d1",
  "lat":               29.9457,
  "lng":               78.1642,
  "radiusKm":          100,
  "quantityQuintals":  5,
  "vehicleId":         "65f1a2b3c4d5e6f7a8b9c0d2",
  "handlingCost":      200
}

// Response
{
  "success": true,
  "data": {
    "results": [...],
    "winner":          { "name": "Muzaffarnagar Mandi", "netProfit": 9458, ... },
    "extraVsNearest":  3200,
    "mandisCompared":  4,
    "bestMargin":      81.5
  }
}
```

---

## 🗄️ MongoDB Collections

| Collection | Purpose | Key Index |
|---|---|---|
| `crops` | Crop types + MSP prices | `value` |
| `vehicles` | Transport options + ₹/km | `value` |
| `mandis` | APMC markets + location | `2dsphere` on `location` |
| `market_prices` | Daily min/modal/max prices | `{ mandi, crop, date }` unique |
| `farmers` | Farmer profiles | `phone` unique, `2dsphere` |
| `trips` | Trip history + financials | `{ farmer, tripDate }` |
| `price_alerts` | Alert subscriptions | `{ farmer, mandi, crop, alertType }` unique |
| `rideshare_requests` | Pooling board | TTL auto-delete after 7 days |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Language** | TypeScript 5.3 (strict mode) |
| **Frontend** | React 18 + Vite 5 |
| **Charts** | Recharts |
| **Maps** | Leaflet + OpenStreetMap (free, no API key) |
| **Backend** | Express 4 + Node.js 18+ |
| **Database** | MongoDB 8 + Mongoose 8 |
| **Dev server** | ts-node-dev (hot reload) |

---

## 🔌 Going Live — API Integrations

### Replace mock prices with Agmarknet

In `krishi-vite/src/utils/profitEngine.ts`, replace `simulateMarketPrice()`:

```typescript
export async function fetchLivePrice(commodity: string, market: string): Promise<number> {
  const res = await fetch(
    `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070` +
    `?api-key=${import.meta.env.VITE_AGMARKNET_KEY}` +
    `&filters[commodity]=${encodeURIComponent(commodity)}` +
    `&filters[market]=${encodeURIComponent(market)}&limit=1`
  );
  const data = await res.json();
  return parseFloat(data.records?.[0]?.modal_price ?? "0");
}
```

### Replace straight-line km with road distance

```typescript
export async function getRoadDistanceKm(
  oLat: number, oLng: number, dLat: number, dLng: number
): Promise<number> {
  const res = await fetch(
    `https://maps.googleapis.com/maps/api/distancematrix/json` +
    `?origins=${oLat},${oLng}&destinations=${dLat},${dLng}` +
    `&key=${import.meta.env.VITE_GOOGLE_MAPS_KEY}`
  );
  const data = await res.json();
  return (data.rows[0]?.elements[0]?.distance?.value ?? 0) / 1000;
}
```

---

## ⚡ Level-Up Features (Roadmap)

| Feature | Status | Where to build |
|---------|--------|----------------|
| Live Agmarknet prices | 🔲 Todo | `profitEngine.ts` |
| Google Maps road distance | 🔲 Todo | `RouteMap.tsx` + `analyze.ts` |
| GPS auto-detect location | 🔲 Todo | `InputForm.tsx` → `navigator.geolocation` |
| Farmer auth (OTP via phone) | 🔲 Todo | New `auth.ts` route + SMS API |
| Rideshare matching UI | 🔲 Todo | New `RideshareForm.tsx` component |
| Price volatility SMS alerts | 🔲 Todo | `PriceAlert` model + cron job |
| Fuel price integration | 🔲 Todo | Fetch diesel rates → adjust `ratePerKm` |
| Hindi language support | 🔲 Todo | i18n library + `labelHindi` fields |
| Mobile app (React Native) | 🔲 Todo | Shared types from `krishi-server/src/types` |

---

## 🤝 Contributing

1. Fork the repo
2. Create a branch: `git checkout -b feature/your-feature`
3. Make your changes with proper TypeScript types
4. Run type-check: `npm run type-check` in both `krishi-vite/` and `krishi-server/`
5. Push and open a Pull Request

---

## 📄 License

MIT — free to use for hackathons, research, and farmer welfare projects.

---

> Built for **AnnamAI Hackathon** 🌾 — empowering Indian farmers with data-driven decisions.
