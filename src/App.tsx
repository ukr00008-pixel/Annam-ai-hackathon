import React, { useState, useEffect, useCallback } from "react";
import "./styles/global.css";

import Header             from "./components/Header";
import InputForm          from "./components/InputForm";
import MandiCard          from "./components/MandiCard";
import { ProfitChart, CostBreakdownChart } from "./components/ProfitChart";
import RouteMap           from "./components/RouteMap";
import ImpactSummary      from "./components/ImpactSummary";
import PerishabilityAlert from "./components/PerishabilityAlert";
import PriceHistoryChart  from "./components/PriceHistoryChart";

import {
  fetchCrops,
  fetchVehicles,
  analyzeTrip,
  checkBackendHealth,
} from "./data/api";

import {
  toQuintals,
  getPerishabilityRisk,
} from "./utils/profitEngine";

import type { Crop, Vehicle, AnalysisInputs, FullAnalysis } from "./types";

// ── Section label ─────────────────────────────────────────────
const SL: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={styles.sectionLabel}>{children}</div>
);

// ============================================================
//  App
// ============================================================

const App: React.FC = () => {
  const [crops,      setCrops]      = useState<Crop[]>([]);
  const [vehicles,   setVehicles]   = useState<Vehicle[]>([]);
  const [analysis,   setAnalysis]   = useState<FullAnalysis | null>(null);
  const [loading,    setLoading]    = useState(false);
  const [initLoading,setInitLoading]= useState(true);   // true while checking backend
  const [backendUp,  setBackendUp]  = useState(false);
  const [error,      setError]      = useState<string | null>(null);
  const [initError,  setInitError]  = useState<string | null>(null);

  // ── On mount: check backend, load crops + vehicles ─────────
  useEffect(() => {
    const init = async () => {
      setInitLoading(true);
      setInitError(null);

      const isUp = await checkBackendHealth();

      if (!isUp) {
        setBackendUp(false);
        setInitLoading(false);
        setInitError("Cannot connect to server. Please try again later.");
        return;
      }

      setBackendUp(true);

      try {
        const [liveCrops, liveVehicles] = await Promise.all([
          fetchCrops(),
          fetchVehicles(),
        ]);

        if (liveCrops.length === 0 || liveVehicles.length === 0) {
          console.log(liveCrops,liveVehicles)
          setInitError("Server connected but no data found. Please contact support.");
          setInitLoading(false);
          return;
        }

        setCrops(liveCrops);
        setVehicles(liveVehicles);
      } catch {
        setInitError("Failed to load crop and vehicle data from server.");
      }
      
      setInitLoading(false);
    };

    init();
  }, []);

  // ── Analyze handler ────────────────────────────────────────
  const handleAnalyze = useCallback(
    async (inputs: AnalysisInputs): Promise<void> => {
      setLoading(true);
      setError(null);

      try {
        const data = await analyzeTrip({
          cropId:           inputs.crop.value,
          vehicleId:        inputs.vehicle.value,
          lat:              inputs.location.lat,
          lng:              inputs.location.lng,
          radiusKm:         100,
          quantityQuintals: toQuintals(inputs.qty, inputs.unit),
          handlingCost:     inputs.handling,
        });

        const result: FullAnalysis = {
          ...data,
          nearestResult:    data.nearest,
          perishRisk:       getPerishabilityRisk(inputs.crop, data.winner.km),
          inputs,
          quantityQuintals: toQuintals(inputs.qty, inputs.unit),
          mandisCompared:   data.mandisCompared,
          bestMargin:       data.bestMargin,
        };

        setAnalysis(result);
        setTimeout(() => {
          document
            .getElementById("results")
            ?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 100);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Something went wrong. Please try again."
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // ── Loading state (checking backend on startup) ────────────
  if (initLoading) {
    return (
      <div style={styles.app}>
        <Header />
        <div style={styles.centerBox}>
          <div style={styles.spinner} />
          <p style={styles.centerText}>Connecting to server…</p>
        </div>
      </div>
    );
  }

  // ── Backend is down ────────────────────────────────────────
  if (!backendUp || initError) {
    return (
      <div style={styles.app}>
        <Header />
        <div style={styles.offlineBox}>
          <div style={styles.offlineIcon}>⚠️</div>
          <h2 style={styles.offlineTitle}>Server Unavailable</h2>
          <p style={styles.offlineText}>
            {initError ?? "Unable to connect to the Krishi-Route server."}
          </p>
          <p style={styles.offlineText}>
            Please check your internet connection and try again.
          </p>
          <button
            style={styles.retryBtn}
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // ── Main UI ────────────────────────────────────────────────
  return (
    <div style={styles.app}>
      <Header />

      <InputForm
        onAnalyze={handleAnalyze}
        loading={loading}
        crops={crops}
        vehicles={vehicles}
      />

      {error && (
        <div style={styles.errorBox}>⚠️ {error}</div>
      )}

      {loading && (
        <div style={styles.loadingBox}>
          <div style={styles.spinner} />
          <span>Fetching live market prices and calculating optimal route…</span>
        </div>
      )}

      {analysis && !loading && (
        <div id="results">
          <PerishabilityAlert risk={analysis.perishRisk} />

          <SL>Route Map</SL>
          <RouteMap
            origin={analysis.inputs.location}
            results={analysis.results}
            winner={analysis.winner}
          />

          <SL>Mandi Comparison</SL>
          <div style={styles.mandiGrid}>
            {analysis.results.map((r, i) => (
              <MandiCard
                key={r.id}
                result={r}
                isWinner={r.id === analysis.winner.id}
                rank={i + 1}
              />
            ))}
          </div>

          <SL>Profit Breakdown</SL>
          <ProfitChart results={analysis.results} />
          <CostBreakdownChart results={analysis.results} />

          <SL>Price Trends</SL>
          <PriceHistoryChart
            results={analysis.results}
            backendUp={backendUp}
          />

          <ImpactSummary
            analysis={analysis}
            crop={analysis.inputs.crop}
            vehicle={analysis.inputs.vehicle}
          />
        </div>
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  app:          { maxWidth: 960, margin: "0 auto", padding: "1.5rem 1.25rem 4rem" },
  sectionLabel: { fontSize: 11, fontWeight: 600, color: "#4a7c23", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 },
  mandiGrid:    { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: "1.5rem" },
  loadingBox:   { display: "flex", alignItems: "center", gap: 12, padding: "1rem 1.5rem", background: "#edf5e1", borderRadius: 12, fontSize: 14, color: "#2d5016", marginBottom: "1.5rem", border: "1px solid rgba(74,124,35,0.2)" },
  spinner:      { width: 18, height: 18, border: "2px solid rgba(45,80,22,0.2)", borderTop: "2px solid #2d5016", borderRadius: "50%", animation: "spin 0.8s linear infinite", flexShrink: 0 },
  errorBox:     { background: "#fff3f2", border: "1px solid #f5c6c3", borderRadius: 12, padding: "1rem 1.25rem", fontSize: 13, color: "#7b1a14", marginBottom: "1.5rem" },

  // Offline / error screen
  centerBox:    { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "4rem 1rem", gap: 12 },
  centerText:   { fontSize: 14, color: "#6b6b6b" },
  offlineBox:   { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "4rem 1rem", gap: 12, textAlign: "center", maxWidth: 400, margin: "0 auto" },
  offlineIcon:  { fontSize: 48, marginBottom: 8 },
  offlineTitle: { fontSize: 22, fontWeight: 500, color: "#1a1a1a" },
  offlineText:  { fontSize: 14, color: "#6b6b6b", lineHeight: 1.6 },
  retryBtn:     { marginTop: 12, padding: "10px 28px", background: "#2d5016", color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: "pointer", fontFamily: "inherit" },
};

export default App;