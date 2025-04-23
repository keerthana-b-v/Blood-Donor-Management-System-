"use client"

import { useState, useEffect } from "react"
import "bootstrap/dist/css/bootstrap.min.css"
import "./App.css"

// Components
import LoginPage from "./components/LoginPage"
import AdminDashboard from "./components/AdminDashboard"
import DonorManagement from "./components/DonorManagement"
import RecipientManagement from "./components/RecipientManagement"
import MatchingSystem from "./components/MatchingSystem"
import DonationHistory from "./components/DonationHistory"

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [activeModule, setActiveModule] = useState("dashboard")

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem("adminToken")
    if (token) {
      setIsLoggedIn(true)
    }
  }, [])

  const handleLogin = (success) => {
    if (success) {
      setIsLoggedIn(true)
      setActiveModule("dashboard")
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("adminToken")
    setIsLoggedIn(false)
  }

  const renderModule = () => {
    switch (activeModule) {
      case "dashboard":
        return <AdminDashboard onNavigate={setActiveModule} onLogout={handleLogout} />
      case "donors":
        return <DonorManagement />
      case "recipients":
        return <RecipientManagement />
      case "matching":
        return <MatchingSystem />
      case "history":
        return <DonationHistory />
      default:
        return <AdminDashboard onNavigate={setActiveModule} onLogout={handleLogout} />
    }
  }

  return (
    <div className="container-fluid">
      {!isLoggedIn ? (
        <LoginPage onLogin={handleLogin} />
      ) : (
        <div className="row">
          <div className="col-md-2 sidebar">
            <h3 className="mt-3 mb-4">Blood Donor System</h3>
            <ul className="nav flex-column">
              <li className="nav-item">
                <button
                  className={`nav-link btn ${activeModule === "dashboard" ? "active" : ""}`}
                  onClick={() => setActiveModule("dashboard")}
                >
                  Dashboard
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link btn ${activeModule === "donors" ? "active" : ""}`}
                  onClick={() => setActiveModule("donors")}
                >
                  Donor Management
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link btn ${activeModule === "recipients" ? "active" : ""}`}
                  onClick={() => setActiveModule("recipients")}
                >
                  Recipient Management
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link btn ${activeModule === "matching" ? "active" : ""}`}
                  onClick={() => setActiveModule("matching")}
                >
                  Matching System
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link btn ${activeModule === "history" ? "active" : ""}`}
                  onClick={() => setActiveModule("history")}
                >
                  Donation History
                </button>
              </li>
              <li className="nav-item mt-5">
                <button className="nav-link btn btn-outline-danger" onClick={handleLogout}>
                  Logout
                </button>
              </li>
            </ul>
          </div>
          <div className="col-md-10 content-area">{renderModule()}</div>
        </div>
      )}
    </div>
  )
}

export default App
