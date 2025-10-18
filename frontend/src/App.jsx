import React, { useState } from 'react'
import Transition from './components/Transition'
import Home from './Pages/Home'

const App = () => {
  const [showHome, setShowHome] = useState(false)

  // Build health endpoint URL from environment variables
  const getHealthEndpoint = () => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
    const endpoint = import.meta.env.VITE_API_HEALTH_ENDPOINT || "/health";
    return `${baseUrl}${endpoint}`;
  }

  const handleTransitionComplete = () => {
    console.log('[App] Transition complete, showing Home')
    setShowHome(true)
  }

  return (
    <>
      {!showHome && (
        <Transition
          healthEndpoint={getHealthEndpoint()}
          onTransitionComplete={handleTransitionComplete}
          animationText="battling renders cold starts now"
          storageKey="ages_transition_done"
        />
      )}
      {showHome && <Home />}
    </>
  )
}

export default App