import { Router, Request, Response } from "express";
import { Mandi, MarketPrice, Vehicle } from "../models";
import type { IMandi, IMarketPrice, IVehicle } from "../types";

const router = Router();

// ── Profit calculation (mirrors frontend profitEngine.ts) ────

function calculateNetProfit(params: {
  modalPrice:       number;
  quantityQuintals: number;
  distanceKm:       number;
  ratePerKm:        number;
  handlingCost:     number;
  commissionPct?:   number;
}) {
  const { modalPrice, quantityQuintals, distanceKm, ratePerKm, handlingCost, commissionPct = 2 } = params;

  const revenue        = modalPrice * quantityQuintals;
  const transportCost  = distanceKm * ratePerKm;
  const commissionCost = Math.round(revenue * (commissionPct / 100));
  const totalCost      = transportCost + handlingCost + commissionCost;
  const netProfit      = revenue - totalCost;
  const profitMargin   = revenue > 0 ? (netProfit / revenue) * 100 : 0;

  return { revenue, transportCost, commissionCost, totalCost, netProfit, profitMargin };
}

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R  = 6371;
  const dL = ((lat2 - lat1) * Math.PI) / 180;
  const dG = ((lng2 - lng1) * Math.PI) / 180;
  const a  =
    Math.sin(dL / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dG / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ── POST /api/analyze ─────────────────────────────────────────
// Body: { cropId, lat, lng, radiusKm, quantityQuintals, vehicleId, handlingCost }
router.post("/", async (req: Request, res: Response) => {
  try {
    const {
      cropId,
      lat,
      lng,
      radiusKm       = 100,
      quantityQuintals,
      vehicleId,
      handlingCost   = 200,
    } = req.body;

    if (!cropId || !lat || !lng || !quantityQuintals || !vehicleId) {
      res.status(400).json({ success: false, error: "cropId, lat, lng, quantityQuintals, vehicleId are required" });
      return;
    }

    // 1. Fetch vehicle
    const vehicle = await Vehicle.findById(vehicleId).lean() as IVehicle | null;
    if (!vehicle) {
      res.status(404).json({ success: false, error: "Vehicle not found" });
      return;
    }

    // 2. Find mandis within radius using geospatial query
    const mandis = await Mandi.find({
      isActive: true,
      location: {
        $nearSphere: {
          $geometry: { type: "Point", coordinates: [lng, lat] },
          $maxDistance: radiusKm * 1000,
        },
      },
    })
      .limit(8)
      .lean() as unknown as IMandi[];

    if (mandis.length === 0) {
      res.status(404).json({ success: false, error: "No mandis found within radius" });
      return;
    }

    // 3. Fetch latest price for each mandi
    const results = await Promise.all(
      mandis.map(async (mandi) => {
        const price = await MarketPrice.findOne({ mandi: mandi._id, crop: cropId })
          .sort({ date: -1 })
          .lean() as IMarketPrice | null;

        if (!price) return null;

        // Straight-line km (replace with Google Maps API for road distance)
        const [mLng, mLat] = mandi.location.coordinates;
        const distanceKm   = Math.round(haversineKm(lat, lng, mLat, mLng));

        const calc = calculateNetProfit({
          modalPrice:       price.modalPrice,
          quantityQuintals: parseFloat(quantityQuintals),
          distanceKm,
          ratePerKm:        vehicle.ratePerKm,
          handlingCost:     parseFloat(handlingCost),
        });

        return {
          mandi: {
            _id:      mandi._id,
            name:     mandi.name,
            district: mandi.district,
            state:    mandi.state,
            peakDays: mandi.peakDays,
            lat:      mLat,
            lng:      mLng,
          },
          distanceKm,
          pricePerQuintal: price.modalPrice,
          minPrice:        price.minPrice,
          maxPrice:        price.maxPrice,
          trend:           price.trend,
          arrivals:        price.arrivals,
          priceDate:       price.date,
          ...calc,
        };
      })
    );

    // 4. Filter nulls, sort by net profit descending
    const validResults = results
      .filter(Boolean)
      .sort((a, b) => (b?.netProfit ?? 0) - (a?.netProfit ?? 0));

    if (validResults.length === 0) {
      res.status(404).json({ success: false, error: "No price data available for nearby mandis" });
      return;
    }

    const winner    = validResults[0]!;
    const nearest   = [...validResults].sort((a, b) => (a?.distanceKm ?? 0) - (b?.distanceKm ?? 0))[0]!;
    const extraGain = winner.netProfit - nearest.netProfit;

    res.json({
      success: true,
      data: {
        results: validResults,
        winner,
        nearest,
        extraVsNearest:  Math.round(extraGain),
        mandisCompared:  validResults.length,
        bestMargin:      Math.round(winner.profitMargin * 10) / 10,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: String(err) });
  }
});

export default router;
