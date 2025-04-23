"use client"

import { useState, useEffect } from "react"
import axios from "axios"

const Analytics = () => {
  const [bloodGroupData, setBloodGroupData] = useState([])
  const [monthlyData, setMonthlyData] = useState([])
  const [urgencyData, setUrgencyData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)

      // Fetch blood group distribution
      const bloodGroupResponse = await axios.get("http://localhost:5000/api/analytics/donations-by-blood-group", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      })
      setBloodGroupData(bloodGroupResponse.data)

      // Fetch monthly donations
      const monthlyResponse = await axios.get("http://localhost:5000/api/analytics/donations-by-month", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      })
      setMonthlyData(monthlyResponse.data)

      // Fetch urgency distribution
      const urgencyResponse = await axios.get("http://localhost:5000/api/analytics/urgency-distribution", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      })
      setUrgencyData(urgencyResponse.data)
    } catch (err) {
      setError("Failed to load analytics data")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border"></div>
      </div>
    )
  }

  return (
    <div className="analytics-container">
      <h2 className="mb-4">Analytics Dashboard</h2>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row">
        <div className="col-md-6 mb-4">
          <div className="card h-100">
            <div className="card-header">
              <h5 className="mb-0">Donations by Blood Group</h5>
            </div>
            <div className="card-body">
              {bloodGroupData.length === 0 ? (
                <p className="text-center">No data available</p>
              ) : (
                <div className="chart-container">
                  <div className="blood-group-chart">
                    {bloodGroupData.map((item) => (
                      <div key={item._id} className="blood-group-item mb-2">
                        <div className="d-flex justify-content-between mb-1">
                          <span>
                            <strong>{item._id || "Unknown"}</strong>
                          </span>
                          <span>{item.count} donations</span>
                        </div>
                        <div className="progress">
                          <div
                            className="progress-bar bg-danger"
                            role="progressbar"
                            style={{
                              width: `${(item.count / Math.max(...bloodGroupData.map((d) => d.count))) * 100}%`,
                            }}
                            aria-valuenow={item.count}
                            aria-valuemin="0"
                            aria-valuemax={Math.max(...bloodGroupData.map((d) => d.count))}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-md-6 mb-4">
          <div className="card h-100">
            <div className="card-header">
              <h5 className="mb-0">Recipient Urgency Distribution</h5>
            </div>
            <div className="card-body">
              {urgencyData.length === 0 ? (
                <p className="text-center">No data available</p>
              ) : (
                <div className="chart-container">
                  <div className="urgency-chart">
                    {urgencyData.map((item) => (
                      <div key={item._id} className="urgency-item mb-3">
                        <div className="d-flex justify-content-between mb-1">
                          <span>
                            <strong>{item._id || "Unknown"}</strong>
                          </span>
                          <span>{item.count} recipients</span>
                        </div>
                        <div className="progress">
                          <div
                            className={`progress-bar ${
                              item._id === "High" ? "bg-danger" : item._id === "Medium" ? "bg-warning" : "bg-success"
                            }`}
                            role="progressbar"
                            style={{
                              width: `${(item.count / Math.max(...urgencyData.map((d) => d.count))) * 100}%`,
                            }}
                            aria-valuenow={item.count}
                            aria-valuemin="0"
                            aria-valuemax={Math.max(...urgencyData.map((d) => d.count))}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-12 mb-4">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Monthly Donation Trends</h5>
            </div>
            <div className="card-body">
              {monthlyData.length === 0 ? (
                <p className="text-center">No data available</p>
              ) : (
                <div className="chart-container">
                  <div className="monthly-chart">
                    {monthlyData.map((item) => (
                      <div key={item._id} className="monthly-item">
                        <div
                          className="monthly-bar"
                          style={{
                            height: `${(item.count / Math.max(...monthlyData.map((d) => d.count))) * 200}px`,
                          }}
                        >
                          <div className="monthly-value">{item.count}</div>
                        </div>
                        <div className="monthly-label">{item._id}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .monthly-chart {
          display: flex;
          justify-content: space-around;
          align-items: flex-end;
          height: 250px;
          padding-top: 20px;
        }
        
        .monthly-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 40px;
        }
        
        .monthly-bar {
          width: 40px;
          background-color: #dc3545;
          border-radius: 4px 4px 0 0;
          display: flex;
          justify-content: center;
          align-items: flex-start;
          color: white;
          min-height: 20px;
          transition: height 0.3s ease;
        }
        
        .monthly-value {
          padding: 5px 0;
          font-size: 12px;
        }
        
        .monthly-label {
          margin-top: 5px;
          font-size: 12px;
          text-align: center;
        }
      `}</style>
    </div>
  )
}

export default Analytics
