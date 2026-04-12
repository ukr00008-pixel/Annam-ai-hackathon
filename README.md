# 🌾 Krishi-Route — Frontend
 
> **"Google Maps for Farmers"** — Find the most profitable mandi route, not just the fastest one.
 
[![Live Demo](https://img.shields.io/badge/Live%20Demo-annam--ai--hackathon.vercel.app-brightgreen?style=flat-square&logo=vercel)](https://annam-ai-hackathon.vercel.app)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite)](https://vitejs.dev/)
 
---
 
## 🔗 Links
 
| | Link |
|--|--|
| 🖥️ **Frontend (Live)** | https://annam-ai-hackathon.vercel.app |
| 🔧 **Backend API** | https://annam-ai-hackathon-server4.onrender.com |
| 📦 **Frontend Repo** | https://github.com/Adityakumar41347/Annam-ai-hackathon |
| ⚙️ **Backend Repo** | https://github.com/Adityakumar41347/annam-ai-hackathon-server |
 
---
 
## 📖 Problem It Solves
 
India has 7,000+ Agricultural Produce Market Committees (APMCs), yet **70% of farmers sell at the nearest mandi** without checking prices elsewhere.
 
A farmer selling onions **10 km away** might earn ₹20,000, while traveling **50 km** could yield ₹24,000 after transport costs.
 
**Krishi-Route calculates net profit per mandi — not just price — so farmers make data-driven decisions.**
 
```
Net Profit = Revenue − Transport Cost − APMC Commission − Handling Cost
Revenue    = Market Price (₹/quintal) × Quantity (quintals)
Transport  = Distance (km) × Vehicle Rate (₹/km)
```
 
---
 
## 🚀 Quick Start (Local Development)
 
### Prerequisites
- Node.js ≥ 18
- Backend server running (see backend repo)
 
### Setup
 
```bash
# 1. Clone the repo
git clone https://github.com/Adityakumar41347/Annam-ai-hackathon.git
cd Annam-ai-hackathon
 
# 2. Install dependencies
npm install
 
# 3. Create environment file
echo "VITE_API_URL=https://annam-ai-hackathon-server4.onrender.com" > .env
 
# 4. Start development server
npm run dev
# → Opens at http://localhost:5173
```
 
### Available Scripts
 
```bash
npm run dev      # Start development server with hot reload
npm run build    # Build for production → /dist
npm run preview  # Preview production build locally
```
 
---
 
## 📁 Project Structure
 
```
Annam-ai-hackathon/
├── public/
│   └── index.html              # HTML entry point
├── src/
│   ├── main.tsx                # React entry point
│   ├── App.tsx                 # Root component — app state & routing logic
│   │
│   ├── types/
│   │   └── index.ts            # All TypeScript interfaces & types
│   │
│   ├── data/
│   │   └── api.ts              # All backend API calls (fetch wrappers)
│   │
│   ├── utils/
│   │   └── profitEngine.ts     # Core profit calculation algorithm
│   │
│   ├── components/
│   │   ├── Header.tsx          # Top navigation bar with logo
│   │   ├── InputForm.tsx       # Trip detail form (crop/vehicle/location)
│   │   ├── MandiCard.tsx       # Per-mandi profit breakdown card
│   │   ├── ProfitChart.tsx     # Bar chart + cost breakdown (Recharts)
│   │   ├── PriceHistoryChart.tsx # 7-day price trend line chart
│   │   ├── RouteMap.tsx        # Interactive Leaflet map with markers
│   │   ├── ImpactSummary.tsx   # Summary metrics + smart insights
│   │   └── PerishabilityAlert.tsx # Risk warning for perishable crops
│   │
│   └── styles/
│       └── global.css          # CSS variables + base styles
│
├── .env                        # Environment variables (not committed)
├── .env.example                # Template for environment variables
├── vite.config.ts              # Vite configuration
├── tsconfig.json               # TypeScript strict config
└── package.json
```
 
---
 
## ⚙️ Environment Variables
 
Create a `.env` file in the root:
 
```env
VITE_API_URL=https://annam-ai-hackathon-server4.onrender.com
```
 
> **Note:** All Vite env variables must start with `VITE_` to be accessible in the browser.
 
For local development with the backend running locally:
```env
VITE_API_URL=http://localhost:5000
```
 
---
 
## 🧩 Component Breakdown
 
### `App.tsx` — Root Component
The brain of the application. Manages all state and orchestrates data flow.
 
**Responsibilities:**
- Checks if the backend is reachable on startup via `/health`
- Fetches crops and vehicles from the API to populate the form
- Shows a loading spinner while connecting
- Shows a "Server Unavailable" screen if backend is down
- Calls `POST /api/analyze` when the farmer submits the form
- Passes results down to all child components
 
**State managed:**
| State | Type | Purpose |
|-------|------|---------|
| `crops` | `Crop[]` | Loaded from backend — fills crop dropdown |
| `vehicles` | `Vehicle[]` | Loaded from backend — fills vehicle dropdown |
| `analysis` | `FullAnalysis \| null` | Results from the analyze API |
| `loading` | `boolean` | Shows spinner during API call |
| `backendUp` | `boolean` | Whether backend responded to health check |
| `error` | `string \| null` | Error message shown to user |
 
---
 
### `InputForm.tsx` — Trip Details Form
Collects all the inputs needed to calculate profit.
 
**Fields:**
| Field | Type | Source |
|-------|------|--------|
| Crop Type | Dropdown | Loaded from `GET /api/crops` |
| Quantity | Number input | User input (quintals/tons/kg) |
| Unit | Dropdown | quintal / ton / kg |
| Vehicle | Dropdown | Loaded from `GET /api/vehicles` |
| Location | Dropdown | Static list of 6 cities |
| Loading/Unloading Cost | Number input | User input (₹) |
 
**On submit:** calls `onAnalyze(inputs)` which triggers `POST /api/analyze`
 
---
 
### `MandiCard.tsx` — Profit Card
Shows a detailed profit breakdown for one mandi.
 
**Displays:**
- Mandi name, distance, peak selling day
- Price trend badge (↑ Rising / ↓ Falling / → Stable)
- Market price per quintal
- Revenue, transport cost, handling cost, commission
- **Net Profit** (highlighted in green for the winner)
- Profit margin percentage
 
The **winner card** (highest net profit) gets a green border, green background, and a ⭐ Best Profit badge.
 
---
 
### `RouteMap.tsx` — Interactive Map
Built with **Leaflet + OpenStreetMap** (free, no API key needed).
 
**Shows:**
- 📍 Your farm location (dark green dot)
- 🟢 Best mandi (large green dot with outline)
- 🟡 Other mandis (smaller green dots)
- Dashed lines connecting your location to each mandi
- Clickable popups showing mandi name, distance, and net profit
- Auto-fits map bounds to show all markers
 
**Tech note:** Uses `import L from "leaflet"` (ES module) with a fix for Vite's asset bundling that breaks Leaflet's default marker icons.
 
---
 
### `ProfitChart.tsx` — Charts
Two charts built with **Recharts**:
 
**1. Net Profit Comparison (Bar Chart)**
- One bar per mandi sorted best to worst
- Winner bar is dark green, others are light green
- Labels show profit in ₹k format (e.g. ₹9.4k)
- Custom tooltip shows mandi name, distance, exact profit
 
**2. Revenue vs Costs Breakdown (Stacked Bar)**
- Shows revenue (green), transport cost (red), handling + commission (orange) per mandi
- Helps farmer see exactly where money is going
 
---
 
### `PriceHistoryChart.tsx` — 7-Day Trend
Line chart showing price movement over the last 7 days for each mandi.
 
- Fetches from `GET /api/prices?mandiId=&cropId=&days=7`
- Shows a 🟢 Live data / 🟡 Simulated badge
- 4 lines (one per mandi) in different colors
- Helps farmer decide if it's a good time to sell or wait
 
---
 
### `ImpactSummary.tsx` — Smart Insights
Shows 3 metric cards + actionable tips:
 
**Metric Cards:**
- 📊 Mandis Compared
- 📈 Best Profit Margin %
- 💰 Extra earnings vs nearest mandi
 
**Smart Tips generated automatically:**
- Which mandi is best and why
- Rideshare savings estimate (pool with a neighbour → save 45%)
- Best day of week to sell at the winning mandi
- Spoilage warning for perishable crops on long routes
- Volume tip (fill the vehicle to spread transport cost)
- Falling price warning if any mandi has a downtrend
 
---
 
### `PerishabilityAlert.tsx` — Risk Warning
Shows a coloured alert banner when a perishable crop (onion, tomato, potato) is being transported a long distance.
 
| Distance | Level | Colour |
|----------|-------|--------|
| > 150 km | 🔴 High | Red |
| > 100 km | 🟡 Medium | Yellow |
| > 60 km | 🟠 Low | Orange |
 
---
 
### `api.ts` — API Service Layer
All backend communication goes through this file.
 
**Functions:**
```typescript
checkBackendHealth()          // GET /health
fetchCrops()                  // GET /api/crops
fetchVehicles()               // GET /api/vehicles
fetchNearbyMandis(lat, lng)   // GET /api/mandis?lat=&lng=&radius=
fetchPriceHistory(mandiId, cropId) // GET /api/prices
analyzeTrip(payload)          // POST /api/analyze  ← main call
registerFarmer(payload)       // POST /api/farmers
saveTrip(payload)             // POST /api/trips
fetchOpenRides(mandiId, date) // GET /api/rideshare
```
 
All functions use a shared `apiFetch<T>()` wrapper that:
- Prepends `VITE_API_URL` from environment
- Sets `Content-Type: application/json`
- Throws a typed error if the response is not `ok`
- Unwraps the `{ success, data }` envelope automatically
 
---
 
### `profitEngine.ts` — Calculation Engine
Core business logic — same formula used by both frontend and backend.
 
```typescript
// Convert quantity units
toQuintals(qty, unit)          // quintal | ton | kg → quintals
 
// Calculate net profit for one mandi
calculateProfit({
  pricePerQuintal,
  quantityQuintals,
  distanceKm,
  vehicleRatePerKm,
  handlingCost,
  commissionPct = 2            // APMC standard 2%
})
 
// Check spoilage risk
getPerishabilityRisk(crop, distanceKm)  // → high | medium | low | null
 
// Format helpers
fmtRupee(1234)    // → "₹1,234"
fmtPct(81.5)      // → "81%"
```
 
---
 
## 🔄 Data Flow
 
```
User fills InputForm
        ↓
App.tsx calls POST /api/analyze
  { cropId, vehicleId, lat, lng, quantityQuintals, handlingCost }
        ↓
Backend queries Atlas MongoDB
  → finds mandis within 100km radius
  → fetches latest price for each mandi
  → calculates net profit per mandi
  → returns sorted results (best profit first)
        ↓
App.tsx receives FullAnalysis
        ↓
Results rendered in:
  RouteMap       ← shows distances visually
  MandiCard[]    ← shows profit per mandi
  ProfitChart    ← compares all mandis
  PriceHistory   ← shows 7-day trend
  ImpactSummary  ← smart insights + tips
```
 
---
 
## 🗺️ API Reference
 
All calls go to `VITE_API_URL` (configured in `.env`).
 
### `POST /api/analyze` — Core Endpoint
 
**Request:**
```json
{
  "cropId":            "onion",
  "vehicleId":         "tata_ace",
  "lat":               29.9457,
  "lng":               78.1642,
  "radiusKm":          100,
  "quantityQuintals":  5,
  "handlingCost":      200
}
```
 
**Response:**
```json
{
  "success": true,
  "data": {
    "results": [
      {
        "id": "...",
        "name": "Muzaffarnagar Mandi",
        "km": 95,
        "pricePerQuintal": 2320,
        "revenue": 11600,
        "transportCost": 1710,
        "commissionCost": 232,
        "totalCost": 2142,
        "netProfit": 9458,
        "profitMargin": 81.5,
        "trend": "rising",
        "peakDay": "Thursday"
      }
    ],
    "winner":          { ... },
    "nearest":         { ... },
    "extraVsNearest":  3200,
    "mandisCompared":  4,
    "bestMargin":      81.5
  }
}
```
 
---
 
## 🛠️ Tech Stack
 
| Layer | Technology | Why |
|-------|-----------|-----|
| Language | TypeScript 5.3 (strict) | Type safety across all components |
| Build tool | Vite 5 | Fast HMR, no peer dep conflicts |
| UI | React 18 | Component-based UI |
| Charts | Recharts | Composable chart library for React |
| Maps | Leaflet + OpenStreetMap | Free, no API key needed |
| HTTP | Native `fetch` | No axios dependency needed |
| Styling | CSS-in-JS + CSS variables | No extra styling library |
 
---
 
## 🚢 Deployment
 
Deployed on **Vercel** with these settings:
 
| Setting | Value |
|---------|-------|
| Framework | Vite |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Root Directory | `/` (repo root) |
 
**Environment variable set in Vercel dashboard:**
```
VITE_API_URL = https://annam-ai-hackathon-server4.onrender.com
```
 
> ⚠️ The `.env` file in the repo is only for local development. Vercel uses environment variables set in the dashboard during the build.
 
---
 
## ⚡ Features Implemented
 
| Feature | Status |
|---------|--------|
| Crop & vehicle selection from live DB | ✅ Done |
| Net profit calculation per mandi | ✅ Done |
| Interactive route map (Leaflet) | ✅ Done |
| Profit comparison bar chart | ✅ Done |
| Cost breakdown chart | ✅ Done |
| 7-day price trend chart | ✅ Done |
| Smart insights & tips | ✅ Done |
| Perishability risk alert | ✅ Done |
| Server unavailable error screen | ✅ Done |
| Live backend / offline detection | ✅ Done |
 
## 🔲 Future Roadmap
 
| Feature | Priority |
|---------|----------|
| GPS auto-detect location | High |
| Agmarknet live prices | High |
| Google Maps road distance | Medium |
| Rideshare matching UI | Medium |
| Farmer registration & login | Medium |
| Trip history dashboard | Low |
| Hindi language support | Low |
| Mobile app (React Native) | Low |
 
---
 
## 👨‍💻 Built For
 
**AnnamAI Hackathon** — empowering Indian farmers with data-driven mandi decisions.
 
> *"A farmer should not leave ₹5,000 on the table just because they didn't check the next mandi's price."*
 
