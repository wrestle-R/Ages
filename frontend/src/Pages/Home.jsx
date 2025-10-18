import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

/**
 * Home Component
 * Displays the "AGes" content with calculated ages for all people.
 * Fetches data from the backend API and displays it in a formatted manner.
 */
function Home() {
  const [ages, setAges] = useState({});
  const [health, setHealth] = useState({ status: "checking", ok: false });
  const [loading, setLoading] = useState(true);

  // Build API URLs from environment variables
  const getApiUrl = (endpoint) => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
    return `${baseUrl}${endpoint}`;
  };

  const fetchAges = async () => {
    try {
      const url = getApiUrl(import.meta.env.VITE_API_AGE_ENDPOINT || "/api/age");
      const res = await fetch(url);
      console.log("[fetchAges] response:", res);

      if (!res.ok) {
        console.error("[fetchAges] fetch failed with status", res.status);
        return;
      }

      const data = await res.json().catch((e) => {
        console.error("[fetchAges] json parse error:", e);
        return null;
      });

      console.log("[fetchAges] data:", data);

      if (data?.error) {
        console.error("[fetchAges] backend returned error:", data.error);
        return;
      }

      if (data) {
        setAges(data);
      }
    } catch (e) {
      console.error("[fetchAges] fetch exception:", e);
    }
  };

  const fetchHealth = async () => {
    try {
      const url = getApiUrl(import.meta.env.VITE_API_HEALTH_ENDPOINT || "/health");
      const res = await fetch(url);
      console.log("[fetchHealth] response:", res);

      if (!res.ok) {
        console.error("[fetchHealth] fetch failed with status", res.status);
        setHealth({ status: "unhealthy", ok: false });
        return;
      }

      const data = await res.json().catch((e) => {
        console.error("[fetchHealth] json parse error:", e);
        return null;
      });

      console.log("[fetchHealth] data:", data);

      setHealth({
        status: data?.status || "healthy",
        ok: true,
      });
    } catch (e) {
      console.error("[fetchHealth] fetch exception:", e);
      setHealth({ status: "down", ok: false });
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchAges();
      await fetchHealth();
      setLoading(false);
    };

    loadData();

    // Poll for updates every 2.5 seconds
    const intervalRef = setInterval(() => {
      fetchAges();
      fetchHealth();
    }, 2500);

    return () => clearInterval(intervalRef);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.995 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="bg-black text-white min-h-screen p-4 font-mono"
    >
      {/* Health Status Indicator */}
      <div className="mb-8">
        <div className="text-sm">
          Status:{" "}
          <span className={health.ok ? "text-green-400 font-semibold" : "text-red-400 font-semibold"}>
            {health.status}
          </span>
        </div>
      </div>

      {/* Ages Display */}
      <div className="space-y-10">
        <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
          AGES
        </h1>

        {loading && !Object.keys(ages).length ? (
          <div className="text-white/60">Loading ages...</div>
        ) : Object.keys(ages).length === 0 ? (
          <div className="text-white/60">No age data available</div>
        ) : (
          Object.entries(ages).map(([name, age], index) => (
            <motion.div
              key={name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="border-l-2 border-green-400 pl-4"
            >
              <div className="text-2xl font-bold text-white mb-3">{name}</div>

              {/* Primary Display */}
              <div className="text-sm space-y-2">
                <div className="text-green-400 font-mono">
                  {age.years}Y {age.months}M {age.weeks}W {age.days}D {age.hours}H{" "}
                  {age.minutes}MIN {age.seconds}S
                </div>

                {/* Secondary Display */}
                <div className="opacity-70 text-blue-300 font-mono text-xs">
                  {age.total_months}M • {age.total_weeks}W • {age.total_minutes}MIN •{" "}
                  {age.total_seconds}S
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="mt-16 pt-8 border-t border-white/10 text-xs text-white/40">
        Last updated: {new Date().toLocaleTimeString()}
      </div>
    </motion.div>
  );
}

export default Home;
