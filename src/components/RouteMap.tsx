import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { FarmerLocation, MandiResult } from "../types";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon   from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// ── Fix Leaflet marker icons broken by Vite's asset bundling ──
// Why double cast?
//   TypeScript strict mode rejects: (X as Record<string,unknown>)
//   when X and Record<string,unknown> have no overlapping members.
//   Casting through `unknown` first tells TS "I know what I'm doing"
//   and satisfies the compiler without disabling strict checks.
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)["_getIconUrl"];

L.Icon.Default.mergeOptions({
  iconUrl:       markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl:     markerShadow,
});

interface Props {
  origin:  FarmerLocation;
  results: MandiResult[];
  winner:  MandiResult;
}

const RouteMap: React.FC<Props> = ({ origin, results, winner }) => {
  const mapDiv  = useRef<HTMLDivElement>(null);
  const mapInst = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapDiv.current) return;

    // Destroy previous instance before re-creating
    if (mapInst.current) {
      mapInst.current.remove();
      mapInst.current = null;
    }

    const map = L.map(mapDiv.current, { zoomControl: true }).setView(
      [origin.lat, origin.lng],
      9
    );
    mapInst.current = map;

    // Free OpenStreetMap tiles — no API key needed
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 18,
    }).addTo(map);

    // ── Origin marker ─────────────────────────────────────────
    const originIcon = L.divIcon({
      html: `<div style="
        width:16px;height:16px;
        background:#2d5016;
        border:3px solid #7ab648;
        border-radius:50%;
        box-shadow:0 2px 6px rgba(0,0,0,0.3);
      "></div>`,
      iconSize:   [16, 16],
      iconAnchor: [8, 8],
      className:  "",
    });

    L.marker([origin.lat, origin.lng], { icon: originIcon })
      .addTo(map)
      .bindPopup(`<b>Your Location</b><br/>${origin.label}`);

    // ── Mandi markers + polylines ─────────────────────────────
    results.forEach((mandi) => {
      const isWin = mandi.id === winner.id;
      const color = isWin ? "#1e7e34" : "#7ab648";
      const size  = isWin ? 20 : 14;

      const mandiIcon = L.divIcon({
        html: `<div style="
          width:${size}px;height:${size}px;
          background:${color};
          border:3px solid ${isWin ? "#fff" : "#2d5016"};
          border-radius:50%;
          box-shadow:0 2px 8px rgba(0,0,0,0.25);
          ${isWin ? "outline:2px solid #1e7e34;outline-offset:2px;" : ""}
        "></div>`,
        iconSize:   [size, size],
        iconAnchor: [size / 2, size / 2],
        className:  "",
      });

      const profit = "₹" + Math.round(mandi.netProfit).toLocaleString("en-IN");

      L.marker([mandi.lat, mandi.lng], { icon: mandiIcon })
        .addTo(map)
        .bindPopup(`
          <div style="font-family:sans-serif;min-width:160px">
            <b style="font-size:14px">${mandi.name}</b>${isWin ? " ⭐" : ""}<br/>
            <span style="color:#6b6b6b;font-size:12px">${mandi.km} km away</span>
            <div style="margin-top:6px;font-size:13px">
              <div>Price: ₹${mandi.pricePerQuintal}/quintal</div>
              <div style="font-weight:600;color:${isWin ? "#1e7e34" : "#1a1a1a"};margin-top:2px">
                Net Profit: ${profit}
              </div>
            </div>
          </div>
        `);

      L.polyline([[origin.lat, origin.lng], [mandi.lat, mandi.lng]], {
        color,
        weight:    isWin ? 2.5 : 1.5,
        dashArray: isWin ? "8 4" : "4 6",
        opacity:   isWin ? 0.9 : 0.5,
      }).addTo(map);
    });

    // ── Fit bounds to show all markers ────────────────────────
    const allPoints: L.LatLngTuple[] = [
      [origin.lat, origin.lng],
      ...results.map((r): L.LatLngTuple => [r.lat, r.lng]),
    ];
    map.fitBounds(allPoints, { padding: [30, 30] });

    return () => {
      mapInst.current?.remove();
      mapInst.current = null;
    };
  }, [origin, results, winner]);

  return (
    <div style={styles.wrap}>
      <div style={styles.title}>Route Map</div>
      <div style={styles.legend}>
        <LegendDot
          dotStyle={{ background: "#2d5016", border: "2px solid #7ab648" }}
          label="Your location"
        />
        <LegendDot
          dotStyle={{ background: "#1e7e34", border: "2px solid #fff", outline: "2px solid #1e7e34" }}
          label="Best mandi"
        />
        <LegendDot
          dotStyle={{ background: "#7ab648", border: "2px solid #2d5016" }}
          label="Other mandis"
        />
      </div>
      <div ref={mapDiv} style={styles.map} />
    </div>
  );
};

// ── Legend helper ─────────────────────────────────────────────

interface LegendDotProps {
  dotStyle: React.CSSProperties;
  label:    string;
}

const LegendDot: React.FC<LegendDotProps> = ({ dotStyle, label }) => (
  <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#6b6b6b" }}>
    <span style={{
      width: 12, height: 12, borderRadius: "50%",
      display: "inline-block", flexShrink: 0,
      ...dotStyle,
    }} />
    {label}
  </span>
);

// ── Styles ────────────────────────────────────────────────────

const styles: Record<string, React.CSSProperties> = {
  wrap: {
    background:   "#ffffff",
    border:       "1px solid rgba(0,0,0,0.10)",
    borderRadius: 16,
    padding:      "1.5rem",
    marginBottom: "1.5rem",
    boxShadow:    "0 1px 4px rgba(0,0,0,0.06)",
  },
  title:  { fontSize: 14, fontWeight: 500, color: "#1a1a1a", marginBottom: 10 },
  legend: { display: "flex", gap: 16, marginBottom: 12, flexWrap: "wrap" },
  map:    { height: 360, borderRadius: 10, overflow: "hidden", border: "1px solid rgba(0,0,0,0.08)" },
};

export default RouteMap;
