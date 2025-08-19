import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import VaporizeAnimationText from "./components/VaporizeAnimationText";

function App() {
  const [ages, setAges] = useState({});
  const [health, setHealth] = useState({ status: "checking", ok: false });

  const [burstTriggered, setBurstTriggered] = useState(false);
  const [burstComplete, setBurstComplete] = useState(false);
  const sawUnhealthyRef = useRef(false);
  const burstHandledRef = useRef(false);
  const intervalRef = useRef(null);

  const fetchAges = async () => {
    try {
      const res = await fetch("https://ages-5g4e.onrender.com/api/age");
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

      if (data) setAges(data);
    } catch (e) {
      console.error("[fetchAges] fetch exception:", e);
    }
  };

  const fetchHealth = async () => {
    try {
      const res = await fetch("https://ages-5g4e.onrender.com/health");
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

  useEffect(() => {
    fetchAges();
    fetchHealth();
    intervalRef.current = setInterval(() => {
      fetchAges();
      fetchHealth();
    }, 2500);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (burstHandledRef.current) return;

    if (!health.ok) {
      sawUnhealthyRef.current = true;
      return;
    }

    if (sawUnhealthyRef.current && !burstTriggered) {
      setBurstTriggered(true);
    } else if (!sawUnhealthyRef.current) {
      setBurstComplete(true);
      burstHandledRef.current = true;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  }, [health, burstTriggered]);

  useEffect(() => {
    if (burstComplete && intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [burstComplete]);

  const handleBurstComplete = () => {
    burstHandledRef.current = true;
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setBurstComplete(true);
  };

  if (!burstComplete) {
    return (
      <div className="relative w-full h-screen bg-black">
        <VaporizeAnimationText
          texts={["battling renders cold starts now"]}
          triggerBurst={burstTriggered}
          onComplete={handleBurstComplete}
        />
        <div className="absolute bottom-4 left-4 text-xs text-white/70 font-mono">
          {health.status}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.995 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="bg-black text-white h-screen p-4 font-mono"
    >
      <div className="mb-4 text-sm">
        <span className={health.ok ? "text-green-400" : "text-red-400"}>
          {health.status}
        </span>
      </div>

      <div className="space-y-8">
        {Object.entries(ages).map(([name, age]) => (
          <div key={name} className="animate-fade-in">
            <div className="text-xl mb-2 text-white">{name}</div>
            <div className="text-sm space-y-1">
              <div className="text-green-400">
                {age.years}Y {age.months}M {age.weeks}W {age.days}D {age.hours}H{" "}
                {age.minutes}MIN {age.seconds}S
              </div>
              <div className="opacity-60 text-blue-300">
                {age.total_months}M {age.total_weeks}W {age.total_minutes}MIN{" "}
                {age.total_seconds}S
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export default App;
