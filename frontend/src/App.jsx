import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import VaporizeAnimationText from "./components/VaporizeAnimationText";

function App() {
  const [ages, setAges] = useState({});
  const [health, setHealth] = useState({ status: "checking", ok: false });

  const [burstTriggered, setBurstTriggered] = useState(false);
  const [burstComplete, setBurstComplete] = useState(false);
  const sawUnhealthyRef = useRef(false);

  // New refs to ensure single handling and to control the polling interval
  const burstHandledRef = useRef(false);
  const intervalRef = useRef(null);

  const fetchAges = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8080/api/age");
      if (!res.ok) return;
      const data = await res.json().catch(() => null);
      if (data?.error) return;
      if (data) setAges(data);
    } catch (e) {
      // silent
    }
  };

  const fetchHealth = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8080/health");
      if (!res.ok) {
        setHealth({ status: "unhealthy", ok: false });
        return;
      }
      const data = await res.json().catch(() => null);
      setHealth({
        status: data?.status || "healthy",
        ok: true,
      });
    } catch (e) {
      setHealth({ status: "down", ok: false });
    }
  };

  useEffect(() => {
    // initial fetch + start polling
    fetchAges();
    fetchHealth();
    intervalRef.current = setInterval(() => {
      fetchAges();
      fetchHealth();
    }, 2500);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  // Guarded effect: trigger the burst only once when backend transitions to healthy
  useEffect(() => {
    if (burstHandledRef.current) return;

    if (!health.ok) {
      sawUnhealthyRef.current = true;
      return;
    }

    // backend is healthy
    if (sawUnhealthyRef.current && !burstTriggered) {
      setBurstTriggered(true);
      // don't mark handled here — wait until onComplete to avoid race
    } else if (!sawUnhealthyRef.current) {
      // backend was already healthy
      setBurstComplete(true);
      burstHandledRef.current = true;
      // stop polling if already complete
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  }, [health, burstTriggered]);

  // stop polling when burst completes (safety)
  useEffect(() => {
    if (burstComplete && intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [burstComplete]);

  // handle reveal and ensure burst is marked handled
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
        <span className={health.ok ? "text-green-400" : "text-red-400"}>{health.status}</span>
      </div>

      <div className="space-y-8">
        {Object.entries(ages).map(([name, age]) => (
          <div key={name} className="animate-fade-in">
            <div className="text-xl mb-2 text-white">{name}</div>
            <div className="text-sm space-y-1">
              <div className="text-green-400">
                {age.years}Y {age.months}M {age.weeks}W {age.days}D {age.hours}H {age.minutes}MIN {age.seconds}S
              </div>
              <div className="opacity-60 text-blue-300">
                {age.total_months}M {age.total_weeks}W {age.total_minutes}MIN {age.total_seconds}S
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export default App;