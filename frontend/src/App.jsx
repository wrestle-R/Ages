import { useEffect, useState } from "react";

function App() {
  const [ages, setAges] = useState({});
  const [error, setError] = useState("");
  const [health, setHealth] = useState({ status: "checking", ok: false, message: "" });

  const fetchAges = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8080/api/age");
      if (!res.ok) throw new Error("Backend not responding");
      const data = await res.json();
      console.log(data)
      if (data.error) throw new Error(data.error);
      setAges(data);
      setError(""); 
    } catch (e) {
      setError(e.message);
    }
  }; 
   const fetchHealth = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8080/health");
      if (!res.ok) {
        setHealth({ status: "unhealthy", ok: false, message: `HTTP ${res.status}` });
        return;
      }
      const data = await res.json().catch(() => null);
      setHealth({ status: data?.status || "healthy", ok: true, message: data?.timestamp || "ok" });
    } catch (e) {
      setHealth({ status: "down", ok: false, message: e.message });
    }
  };

  useEffect(() => {
    fetchAges();
    fetchHealth();
    const interval = setInterval(() => {
      fetchAges();
      fetchHealth();
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (error) {
    return (
      <div className="bg-black text-white h-screen flex items-center justify-center">
        <h1>{error}</h1>
      </div>
    );
  }

return (
    <div className="bg-black text-white h-screen p-4 font-mono">
      {/* Health status */}
      <div className="mb-4 text-sm">
        <span className={health.ok ? "text-green-400" : "text-red-400"}>
          {health.status}
        </span>
        <span className="opacity-60 ml-2">{health.message}</span>
      </div>
      
      <div className="space-y-8">
        {Object.entries(ages).map(([name, age]) => (
          <div key={name}>
            <div className="text-xl mb-2">{name}</div>
            <div className="text-sm space-y-1">
              <div>{age.years}Y {age.months}M {age.weeks}W {age.days}D {age.hours}H {age.minutes}MIN {age.seconds}S</div>
              <div className="opacity-60">{age.total_months}M {age.total_weeks}W {age.total_minutes}MIN {age.total_seconds}S</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;