// "use client"

// import { useState, useEffect } from "react"
// import axios from "axios"

// const AdminDashboard = ({ onNavigate, onLogout }) => {
//   const [stats, setStats] = useState({
//     totalDonors: 0,
//     totalRecipients: 0,
//     pendingDonations: 0,
//     completedDonations: 0,
//     urgentRequests: 0,
//   })
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState("")

//   useEffect(() => {
//     fetchDashboardData()
//   }, [])

//   const fetchDashboardData = async () => {
//     try {
//       const response = await axios.get("http://localhost:5000/api/dashboard", {
//         headers: {
//           Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
//         },
//       })
//       setStats(response.data)
//     } catch (err) {
//       console.error("Error fetching dashboard data:", err)
//       setError("Failed to load dashboard data")
//     } finally {
//       setLoading(false)
//     }
//   }

//   if (loading) {
//     return (
//       <div className="text-center mt-5">
//         <div className="spinner-border"></div>
//       </div>
//     )
//   }

//   return (
//     <div className="dashboard-container">
//       <div className="d-flex justify-content-between align-items-center mb-4">
//         <h2>Admin Dashboard</h2>
//         <button className="btn btn-outline-danger" onClick={onLogout}>
//           Logout
//         </button>
//       </div>

//       {error && <div className="alert alert-danger">{error}</div>}

//       <div className="row">
//         <div className="col-md-4 mb-4">
//           <div className="card dashboard-card">
//             <div className="card-body">
//               <h5 className="card-title">Donors</h5>
//               <div className="stat-value">{stats.totalDonors}</div>
//               <button className="btn btn-primary mt-3" onClick={() => onNavigate("donors")}>
//                 Manage Donors
//               </button>
//             </div>
//           </div>
//         </div>

//         <div className="col-md-4 mb-4">
//           <div className="card dashboard-card">
//             <div className="card-body">
//               <h5 className="card-title">Recipients</h5>
//               <div className="stat-value">{stats.totalRecipients}</div>
//               <button className="btn btn-primary mt-3" onClick={() => onNavigate("recipients")}>
//                 Manage Recipients
//               </button>
//             </div>
//           </div>
//         </div>

//         <div className="col-md-4 mb-4">
//           <div className="card dashboard-card urgent-card">
//             <div className="card-body">
//               <h5 className="card-title">Urgent Requests</h5>
//               <div className="stat-value">{stats.urgentRequests}</div>
//               <button className="btn btn-danger mt-3" onClick={() => onNavigate("recipients")}>
//                 View Urgent Requests
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>

//       <div className="row">
//         <div className="col-md-6 mb-4">
//           <div className="card dashboard-card">
//             <div className="card-body">
//               <h5 className="card-title">Pending Donations</h5>
//               <div className="stat-value">{stats.pendingDonations}</div>
//               <button className="btn btn-primary mt-3" onClick={() => onNavigate("history")}>
//                 View Donations
//               </button>
//             </div>
//           </div>
//         </div>

//         <div className="col-md-6 mb-4">
//           <div className="card dashboard-card">
//             <div className="card-body">
//               <h5 className="card-title">Completed Donations</h5>
//               <div className="stat-value">{stats.completedDonations}</div>
//               <button className="btn btn-primary mt-3" onClick={() => onNavigate("history")}>
//                 View History
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>

//       <div className="row">
//         <div className="col-md-6 mb-4">
//           <div className="card dashboard-card">
//             <div className="card-body">
//               <h5 className="card-title">Matching System</h5>
//               <p>Find compatible donors for recipients based on blood type and location.</p>
//               <button className="btn btn-primary" onClick={() => onNavigate("matching")}>
//                 Open Matching System
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

// export default AdminDashboard
"use client"

import { useState, useEffect } from "react"
import axios from "axios"

const AdminDashboard = ({ onNavigate, onLogout }) => {
  const [stats, setStats] = useState({
    totalDonors: 0,
    totalRecipients: 0,
    pendingDonations: 0,
    completedDonations: 0,
    urgentRequests: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/dashboard", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      })
      setStats(response.data)
    } catch (err) {
      console.error("Error fetching dashboard data:", err)
      setError("Failed to load dashboard data")
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
    <div className="dashboard-container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Admin Dashboard</h2>
        <button className="btn btn-outline-danger" onClick={onLogout}>
          Logout
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row">
        <div className="col-md-4 mb-4">
          <div className="card dashboard-card">
            <div className="card-body">
              <h5 className="card-title">Donors</h5>
              <div className="stat-value">{stats.totalDonors}</div>
              <button className="btn btn-primary mt-3" onClick={() => onNavigate("donors")}>
                Manage Donors
              </button>
            </div>
          </div>
        </div>

        <div className="col-md-4 mb-4">
          <div className="card dashboard-card">
            <div className="card-body">
              <h5 className="card-title">Recipients</h5>
              <div className="stat-value">{stats.totalRecipients}</div>
              <button className="btn btn-primary mt-3" onClick={() => onNavigate("recipients")}>
                Manage Recipients
              </button>
            </div>
          </div>
        </div>

        <div className="col-md-4 mb-4">
          <div className="card dashboard-card urgent-card">
            <div className="card-body">
              <h5 className="card-title">Urgent Requests</h5>
              <div className="stat-value">{stats.urgentRequests}</div>
              <button className="btn btn-danger mt-3" onClick={() => onNavigate("recipients")}>
                View Urgent Requests
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-md-6 mb-4">
          <div className="card dashboard-card">
            <div className="card-body">
              <h5 className="card-title">Pending Donations</h5>
              <div className="stat-value">{stats.pendingDonations}</div>
              <button className="btn btn-primary mt-3" onClick={() => onNavigate("history")}>
                View Donations
              </button>
            </div>
          </div>
        </div>

        <div className="col-md-6 mb-4">
          <div className="card dashboard-card">
            <div className="card-body">
              <h5 className="card-title">Completed Donations</h5>
              <div className="stat-value">{stats.completedDonations}</div>
              <button className="btn btn-primary mt-3" onClick={() => onNavigate("history")}>
                View History
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-md-6 mb-4">
          <div className="card dashboard-card">
            <div className="card-body">
              <h5 className="card-title">Matching System</h5>
              <p>Find compatible donors for recipients based on blood type and location.</p>
              <button className="btn btn-primary" onClick={() => onNavigate("matching")}>
                Open Matching System
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
