"use client"

import { useState, useEffect } from "react"
import axios from "axios"

const MatchingSystem = () => {
  const [recipients, setRecipients] = useState([])
  const [selectedRecipient, setSelectedRecipient] = useState(null)
  const [matchingDonors, setMatchingDonors] = useState([])
  const [loading, setLoading] = useState(true)
  const [matchLoading, setMatchLoading] = useState(false)
  const [error, setError] = useState("")
  const [donationSuccess, setDonationSuccess] = useState(false)
  const [donations, setDonations] = useState([])

  useEffect(() => {
    fetchRecipients()
    fetchDonations()
  }, [])

  const fetchRecipients = async () => {
    try {
      setLoading(true)
      const response = await axios.get("http://localhost:5000/api/recipients", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      })
      setRecipients(response.data)
    } catch (err) {
      console.error("Error fetching recipients:", err)
      setError("Failed to load recipients")
    } finally {
      setLoading(false)
    }
  }

  const fetchDonations = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/donations", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      })
      setDonations(response.data)
    } catch (err) {
      console.error("Error fetching donations:", err)
    }
  }

  const handleRecipientSelect = async (recipient) => {
    try {
      setSelectedRecipient(recipient)
      setMatchLoading(true)
      setMatchingDonors([])
      setDonationSuccess(false)

      const response = await axios.get(`http://localhost:5000/api/match/${recipient._id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      })

      setMatchingDonors(response.data)
    } catch (err) {
      console.error("Error finding matches:", err)
      setError("Failed to find matching donors")
    } finally {
      setMatchLoading(false)
    }
  }

  const handleCreateDonation = async (donorId) => {
    try {
      if (!selectedRecipient) return

      const donationData = {
        donorId: donorId,
        recipientId: selectedRecipient._id,
        date: new Date().toISOString().split("T")[0],
        status: "Pending",
      }

      await axios.post("http://localhost:5000/api/donations", donationData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      })

      setDonationSuccess(true)

      // Refresh data to reflect changes
      fetchDonations()
      fetchRecipients()

      // Clear selected recipient after successful donation
      setTimeout(() => {
        setSelectedRecipient(null)
      }, 2000)
    } catch (err) {
      console.error("Error creating donation:", err)
      setError("Failed to create donation record")
    }
  }

  // Filter out recipients who already have donations (matched)
  const availableRecipients = recipients.filter((recipient) => {
    return !donations.some(
      (donation) =>
        donation.recipientId === recipient._id && (donation.status === "Pending" || donation.status === "Completed"),
    )
  })

  if (loading && recipients.length === 0) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border"></div>
      </div>
    )
  }

  return (
    <div className="matching-system">
      <h2 className="mb-4">Donor-Recipient Matching System</h2>

      {error && <div className="alert alert-danger">{error}</div>}
      {donationSuccess && (
        <div className="alert alert-success">
          Donation record created successfully! The donor is now marked as unavailable.
        </div>
      )}

      <div className="row">
        <div className="col-md-5">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Recipients Needing Donors</h5>
            </div>
            <div className="card-body">
              <div className="list-group recipient-list">
                {availableRecipients.length === 0 ? (
                  <p className="text-center">No recipients found who need donors</p>
                ) : (
                  availableRecipients.map((recipient) => (
                    <button
                      key={recipient._id}
                      className={`list-group-item list-group-item-action ${
                        selectedRecipient && selectedRecipient._id === recipient._id ? "active" : ""
                      }`}
                      onClick={() => handleRecipientSelect(recipient)}
                    >
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <strong>{recipient.name}</strong>
                          <div className="small">
                            Blood Group: <span className="badge bg-danger">{recipient.bloodGroup}</span>
                          </div>
                          <div className="small">{recipient.hospital || "NO Field"}</div>
                        </div>
                        <span
                          className={`badge ${
                            recipient.urgencyLevel === "High"
                              ? "bg-danger"
                              : recipient.urgencyLevel === "Medium"
                                ? "bg-warning"
                                : "bg-success"
                          }`}
                        >
                          {recipient.urgencyLevel || "Medium"}
                        </span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-7">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">
                {selectedRecipient
                  ? `Matching Donors for ${selectedRecipient.name}`
                  : "Select a recipient to find matching donors"}
              </h5>
            </div>
            <div className="card-body">
              {matchLoading ? (
                <div className="text-center py-4">
                  <div className="spinner-border"></div>
                  <p className="mt-2">Finding matching donors...</p>
                </div>
              ) : selectedRecipient ? (
                <>
                  <div className="recipient-details mb-3">
                    <div className="row">
                      <div className="col-md-6">
                        <p>
                          <strong>Blood Group:</strong>{" "}
                          <span className="badge bg-danger">{selectedRecipient.bloodGroup}</span>
                        </p>
                        <p>
                          <strong>Hospital:</strong> {selectedRecipient.hospital || "NO Field"}
                        </p>
                        <p>
                          <strong>Location:</strong> {selectedRecipient.location || "NO Field"}
                        </p>
                      </div>
                      <div className="col-md-6">
                        <p>
                          <strong>Date Needed:</strong>{" "}
                          {selectedRecipient.dateNeeded
                            ? new Date(selectedRecipient.dateNeeded).toLocaleDateString()
                            : "NO Field"}
                        </p>
                        <p>
                          <strong>Urgency:</strong>{" "}
                          <span
                            className={`badge ${
                              selectedRecipient.urgencyLevel === "High"
                                ? "bg-danger"
                                : selectedRecipient.urgencyLevel === "Medium"
                                  ? "bg-warning"
                                  : "bg-success"
                            }`}
                          >
                            {selectedRecipient.urgencyLevel || "Medium"}
                          </span>
                        </p>
                        <p>
                          <strong>Contact:</strong> {selectedRecipient.contactNumber || "NO Field"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <hr />

                  <h6>Compatible Donors:</h6>
                  {matchingDonors.length === 0 ? (
                    <div className="alert alert-warning">
                      No matching donors found. Try expanding your search criteria.
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-striped">
                        <thead>
                          <tr>
                            <th>Name</th>
                            <th>Blood Group</th>
                            <th>Age</th>
                            <th>Location</th>
                            <th>Contact</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {matchingDonors.map((donor) => (
                            <tr key={donor._id}>
                              <td>{donor.name}</td>
                              <td>
                                <span className="badge bg-danger">{donor.bloodGroup}</span>
                              </td>
                              <td>{donor.age || "NO Field"}</td>
                              <td>{donor.location || "NO Field"}</td>
                              <td>
                                {donor.phone}
                                {donor.email ? (
                                  <div className="small text-muted">{donor.email}</div>
                                ) : (
                                  <div className="small text-muted">NO Field</div>
                                )}
                              </td>
                              <td>
                                <button
                                  className="btn btn-sm btn-success"
                                  onClick={() => handleCreateDonation(donor._id)}
                                >
                                  Create Donation
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-center py-4">Select a recipient from the list to find matching donors</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MatchingSystem
