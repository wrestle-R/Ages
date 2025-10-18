import React, { useState, useEffect } from 'react'
import Transition from './components/Transition'
import Countdown from './components/Countdown'

const App = () => {
  const [showCountdown, setShowCountdown] = useState(false)
  const [transitionComplete, setTransitionComplete] = useState(false)

  // Build health endpoint URL from environment variables
  const getHealthEndpoint = () => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
    const endpoint = import.meta.env.VITE_API_HEALTH_ENDPOINT || "/health";
    return `${baseUrl}${endpoint}`;
  }

  const handleTransitionComplete = () => {
    console.log('[App] Transition complete, showing Countdown')
    setTransitionComplete(true)
    // Small delay to ensure smooth transition
    setTimeout(() => {
      setShowCountdown(true)
    }, 100)
  }

  // Check if transition was already done
  useEffect(() => {
    const isDone = localStorage.getItem('ages_transition_done')
    if (isDone === 'true') {
      setTransitionComplete(true)
      setShowCountdown(true)
    }
  }, [])

  return (
    <>
      {!transitionComplete && (
        <Transition
          healthEndpoint={getHealthEndpoint()}
          onTransitionComplete={handleTransitionComplete}
          animationText="battling renders cold starts now"
          storageKey="ages_transition_done"
        />
      )}
      {showCountdown && <Countdown />}
    </>
  )
}

export default App