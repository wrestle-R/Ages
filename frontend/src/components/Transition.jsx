import React, { useEffect, useState, useRef } from "react";
import VaporizeAnimationText from "./VaporizeAnimationText";

/**
 * Reusable Transition Component
 * 
 * A generic component that handles health checks and triggers a loading animation.
 * Perfect for multiple projects. Only shows animation once per session, not on refresh.
 * 
 * @param {Object} props - Component props
 * @param {string} props.healthEndpoint - Health check endpoint URL (required)
 * @param {Function} props.onTransitionComplete - Callback when transition finishes
 * @param {string} props.animationText - Text to show in animation (default: "loading...")
 * @param {string} props.storageKey - localStorage key to track if transition was done (default: "transition_done")
 * @param {number} props.healthPollInterval - Poll interval in ms (default: 2500)
 * @param {boolean} props.skipStorageCheck - Skip localStorage check (default: false)
 * @param {React.ReactNode} props.loadingUI - Custom loading UI component instead of animation
 * 
 * @example
 * // Basic usage
 * <Transition
 *   healthEndpoint="http://localhost:8080/health"
 *   onTransitionComplete={() => setShowHome(true)}
 *   animationText="loading..."
 * />
 * 
 * @example
 * // For different projects
 * <Transition
 *   healthEndpoint={`${process.env.REACT_APP_API_URL}/health`}
 *   onTransitionComplete={handleComplete}
 *   animationText="initializing project..."
 *   storageKey="my_project_transition"
 * />
 */
function Transition({
  healthEndpoint = "http://localhost:8080/health",
  onTransitionComplete = () => {},
  animationText = "loading...",
  storageKey = "transition_done",
  healthPollInterval = 2500,
  skipStorageCheck = false,
  loadingUI = null,
}) {
  const [animationComplete, setAnimationComplete] = useState(false);
  const [health, setHealth] = useState({ status: "checking", ok: false });
  const [burstTriggered, setBurstTriggered] = useState(false);
  const [shouldShowAnimation, setShouldShowAnimation] = useState(true);
  
  const healthCheckCompleteRef = useRef(false);
  const animationCompletedRef = useRef(false);
  const intervalRef = useRef(null);

  // Check if transition was already done in this session
  useEffect(() => {
    if (!skipStorageCheck) {
      const wasTransitionDone = sessionStorage.getItem(storageKey) === "true";
      if (wasTransitionDone) {
        console.log("[Transition] Transition already done in this session, skipping animation");
        setShouldShowAnimation(false);
        setAnimationComplete(true);
        // Call callback immediately
        setTimeout(() => {
          onTransitionComplete();
        }, 0);
      }
    }
  }, [storageKey, skipStorageCheck, onTransitionComplete]);

  const fetchHealth = async () => {
    try {
      const res = await fetch(healthEndpoint);
      console.log("[Transition] Health check response:", res);

      if (!res.ok) {
        console.error("[Transition] Health check failed with status", res.status);
        setHealth({ status: "unhealthy", ok: false });
        return;
      }

      const data = await res.json().catch((e) => {
        console.error("[Transition] Health check JSON parse error:", e);
        return null;
      });

      console.log("[Transition] Health check data:", data);

      if (data?.status === "healthy") {
        setHealth({
          status: "healthy",
          ok: true,
        });
        
        // Stop polling once we get a healthy response
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        healthCheckCompleteRef.current = true;
      }
    } catch (e) {
      console.error("[Transition] Health check fetch exception:", e);
      setHealth({ status: "down", ok: false });
      
      // If server is completely down, proceed anyway after a few attempts
      if (!healthCheckCompleteRef.current) {
        console.log("[Transition] Server appears down, will proceed with animation anyway");
      }
    }
  };

  // Initial health check - only if we should show animation
  useEffect(() => {
    if (!shouldShowAnimation) {
      return;
    }

    let attemptCount = 0;
    const maxAttempts = 3;

    const checkHealthWithFallback = async () => {
      attemptCount++;
      await fetchHealth();
      
      // If we've tried maxAttempts and still no success, proceed anyway
      if (attemptCount >= maxAttempts && !healthCheckCompleteRef.current) {
        console.log("[Transition] Max health check attempts reached, proceeding with animation");
        setHealth({ status: "proceeding anyway", ok: true });
        healthCheckCompleteRef.current = true;
        
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }
    };

    checkHealthWithFallback();
    
    // Poll for health until we get a healthy response or max attempts
    intervalRef.current = setInterval(() => {
      if (!healthCheckCompleteRef.current) {
        checkHealthWithFallback();
      }
    }, healthPollInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [shouldShowAnimation, healthPollInterval]);

  // Trigger burst animation once health check is successful
  useEffect(() => {
    if (shouldShowAnimation && health.ok && !burstTriggered) {
      console.log("[Transition] Health is OK, triggering animation");
      setBurstTriggered(true);
    }
  }, [health.ok, burstTriggered, shouldShowAnimation]);

  // Handle animation completion
  const handleAnimationComplete = () => {
    console.log("[Transition] Animation complete");
    if (!animationCompletedRef.current) {
      animationCompletedRef.current = true;
      
      // Mark transition as done in this session
      sessionStorage.setItem(storageKey, "true");
      
      // Small delay to ensure animation is fully done
      setTimeout(() => {
        setAnimationComplete(true);
        onTransitionComplete();
      }, 100);
    }
  };

  // If animation already done in this session, return null
  if (!shouldShowAnimation || animationComplete) {
    return null;
  }

  // Show custom loading UI if provided
  if (loadingUI) {
    return loadingUI;
  }

  // Default animation UI
  return (
    <div className="relative w-full h-screen bg-black">
      <VaporizeAnimationText
        texts={[animationText]}
        triggerBurst={burstTriggered}
        onComplete={handleAnimationComplete}
      />
      <div className="absolute bottom-4 left-4 text-xs text-white/70 font-mono">
        {health.status}
      </div>
    </div>
  );
}

export default Transition;
