"use client"

import { useState, useEffect } from "react"
import axios from "axios"

const DonationHistory = () => {
  const [donations, setDonations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [filter, setFilter] = useState("all")
  const [selectedDonation, setSelectedDonation] = useState(null)

  useEffect(() => {
    fetchDonations()
  }, [])

  const fetchDonations = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/donations", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      })
      setDonations(response.data)
    } catch (err) {
      setError("Failed to load donation history")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const updateDonationStatus = async (id, status, notes = "") => {
    try {
      await axios.put(
        `http://localhost:5000/api/donations/${id}`,
        { status, notes },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        },
      )
      fetchDonations()
      setSelectedDonation(null)
    } catch (err) {
      setError("Failed to update donation status")
      console.error(err)
    }
  }

  const filteredDonations = donations.filter((donation) => {
    if (filter === "all") return true
    return donation.status === filter
  })

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border"></div>
      </div>
    )
  }

  return (
    <div className="donation-history">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Donation History</h2>
        <div className="btn-group">
          <button
            className={`btn ${filter === "all" ? "btn-primary" : "btn-outline-primary"}`}
            onClick={() => setFilter("all")}
          >
            All
          </button>
          <button
            className={`btn ${filter === "Pending" ? "btn-primary" : "btn-outline-primary"}`}
            onClick={() => setFilter("Pending")}
          >
            Pending
          </button>
          <button
            className={`btn ${filter === "Completed" ? "btn-primary" : "btn-outline-primary"}`}
            onClick={() => setFilter("Completed")}
          >
            Completed
          </button>
          <button
            className={`btn ${filter === "Cancelled" ? "btn-primary" : "btn-outline-primary"}`}
            onClick={() => setFilter("Cancelled")}
          >
            Cancelled
          </button>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row">
        <div className="col-md-8">
          <div className="table-container">
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Donor</th>
                  <th>Recipient</th>
                  <th>Blood Group</th>
                  <th>Hospital</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDonations.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center">
                      No donation records found
                    </td>
                  </tr>
                ) : (
                  filteredDonations.map((donation) => (
                    <tr key={donation._id} className={selectedDonation === donation._id ? "table-primary" : ""}>
                      <td>{new Date(donation.date).toLocaleDateString()}</td>
                      <td>{donation.donorName || donation.donor?.name || "NO Field"}</td>
                      <td>{donation.recipientName || donation.recipient?.name || "NO Field"}</td>
                      <td>{donation.donorBloodGroup || donation.donor?.bloodGroup || "NO Field"}</td>
                      <td>{donation.hospital || donation.recipient?.hospital || "NO Field"}</td>
                      <td>
                        <span
                          className={`badge ${
                            donation.status === "Completed"
                              ? "bg-success"
                              : donation.status === "Pending"
                                ? "bg-warning"
                                : "bg-danger"
                          }`}
                        >
                          {donation.status}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn btn-sm btn-info btn-action"
                          onClick={() => setSelectedDonation(donation._id === selectedDonation ? null : donation._id)}
                        >
                          Details
                        </button>
                        {donation.status === "Pending" && (
                          <>
                            <button
                              className="btn btn-sm btn-success btn-action ms-1"
                              onClick={() =>
                                updateDonationStatus(donation._id, "Completed", "Donation completed successfully")
                              }
                            >
                              Complete
                            </button>
                            <button
                              className="btn btn-sm btn-danger btn-action ms-1"
                              onClick={() => updateDonationStatus(donation._id, "Cancelled", "Donation cancelled")}
                            >
                              Cancel
                            </button>
                          </>
                        )}
                        {donation.status === "Cancelled" && (
                          <button
                            className="btn btn-sm btn-warning btn-action ms-1"
                            onClick={() => updateDonationStatus(donation._id, "Pending", "Donation reactivated")}
                          >
                            Reactivate
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="col-md-4">
          {selectedDonation && (
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">Donation Details</h5>
              </div>
              <div className="card-body">
                {(() => {
                  const donation = donations.find((d) => d._id === selectedDonation)
                  if (!donation) return null

                  return (
                    <div>
                      <h6>Donor Information</h6>
                      <p>
                        <strong>Name:</strong> {donation.donorName || donation.donor?.name || "NO Field"}
                        <br />
                        <strong>Blood Group:</strong>{" "}
                        {donation.donorBloodGroup || donation.donor?.bloodGroup || "NO Field"}
                        <br />
                        {donation.donor?.phone ? (
                          <>
                            <strong>Contact:</strong> {donation.donor.phone}
                            <br />
                          </>
                        ) : (
                          <>
                            <strong>Contact:</strong> NO Field
                            <br />
                          </>
                        )}
                      </p>

                      <h6>Recipient Information</h6>
                      <p>
                        <strong>Name:</strong> {donation.recipientName || donation.recipient?.name || "NO Field"}
                        <br />
                        <strong>Blood Group:</strong>{" "}
                        {donation.recipientBloodGroup || donation.recipient?.bloodGroup || "NO Field"}
                        <br />
                        <strong>Hospital:</strong> {donation.hospital || donation.recipient?.hospital || "NO Field"}
                        <br />
                        <strong>Urgency:</strong>{" "}
                        {donation.urgencyLevel || donation.recipient?.urgencyLevel || "NO Field"}
                        <br />
                      </p>

                      <h6>Tracking History</h6>
                      {donation.tracking ? (
                        <div className="tracking-timeline">
                          {donation.tracking.map((track, index) => (
                            <div key={index} className="tracking-item mb-2 pb-2 border-bottom">
                              <div className="d-flex justify-content-between">
                                <span
                                  className={`badge ${
                                    track.status === "Completed"
                                      ? "bg-success"
                                      : track.status === "Pending"
                                        ? "bg-warning"
                                        : track.status === "Created"
                                          ? "bg-info"
                                          : "bg-danger"
                                  }`}
                                >
                                  {track.status}
                                </span>
                                <small>{new Date(track.timestamp).toLocaleString()}</small>
                              </div>
                              {track.notes && <div className="mt-1">{track.notes}</div>}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p>No tracking information available</p>
                      )}
                    </div>
                  )
                })()}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DonationHistory
