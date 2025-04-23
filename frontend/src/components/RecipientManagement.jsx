"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import RecipientForm from "./RecipientForm"

const RecipientManagement = () => {
  const [recipients, setRecipients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [currentRecipient, setCurrentRecipient] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [bloodGroupFilter, setBloodGroupFilter] = useState("")
  const [urgencyFilter, setUrgencyFilter] = useState("")

  useEffect(() => {
    fetchRecipients()
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
      setError("")
    } catch (err) {
      console.error("Error fetching recipients:", err)
      setError("Failed to load recipients")
    } finally {
      setLoading(false)
    }
  }

  const handleAddRecipient = () => {
    setCurrentRecipient(null)
    setShowForm(true)
  }

  const handleEditRecipient = (recipient) => {
    setCurrentRecipient(recipient)
    setShowForm(true)
  }

  const handleDeleteRecipient = async (id) => {
    if (window.confirm("Are you sure you want to delete this recipient?")) {
      try {
        await axios.delete(`http://localhost:5000/api/recipients/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        })
        fetchRecipients()
      } catch (err) {
        console.error("Error deleting recipient:", err)
        setError("Failed to delete recipient")
      }
    }
  }

  // Update the handleFormSubmit function to properly handle updates
  const handleFormSubmit = async (formData) => {
    try {
      setError("")

      // Create a copy of formData to ensure we don't modify the original
      const dataToSubmit = { ...formData }

      // Convert empty strings to null for proper database storage
      Object.keys(dataToSubmit).forEach((key) => {
        if (dataToSubmit[key] === "") {
          dataToSubmit[key] = null
        }
      })

      if (currentRecipient) {
        // Update existing recipient
        const response = await axios.put(`http://localhost:5000/api/recipients/${currentRecipient._id}`, dataToSubmit, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        })

        if (response.status === 200) {
          // Show success message
          setError("Recipient updated successfully!")
          setTimeout(() => {
            setShowForm(false)
            fetchRecipients()
          }, 1000)
        }
      } else {
        // Add new recipient
        const response = await axios.post("http://localhost:5000/api/recipients", dataToSubmit, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        })

        if (response.status === 201) {
          // Show success message
          setError("Recipient added successfully!")
          setTimeout(() => {
            setShowForm(false)
            fetchRecipients()
          }, 1000)
        }
      }
    } catch (err) {
      console.error("Error saving recipient:", err)
      setError(err.response?.data?.message || "Failed to save recipient. Please try again.")
    }
  }

  const handleFormCancel = () => {
    setShowForm(false)
  }

  const filteredRecipients = recipients.filter((recipient) => {
    const matchesSearch =
      recipient.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recipient.hospital?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recipient.location?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesBloodGroup = bloodGroupFilter ? recipient.bloodGroup === bloodGroupFilter : true
    const matchesUrgency = urgencyFilter ? recipient.urgencyLevel === urgencyFilter : true

    return matchesSearch && matchesBloodGroup && matchesUrgency
  })

  if (loading && recipients.length === 0) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border"></div>
      </div>
    )
  }

  return (
    <div className="recipient-management">
      <h2 className="mb-4">Recipient Management</h2>

      {error && (
        <div className={`alert ${error.includes("successfully") ? "alert-success" : "alert-danger"}`}>{error}</div>
      )}

      {showForm ? (
        <RecipientForm recipient={currentRecipient} onSubmit={handleFormSubmit} onCancel={handleFormCancel} />
      ) : (
        <>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <button className="btn btn-primary" onClick={handleAddRecipient}>
              Add New Recipient
            </button>

            <div className="d-flex">
              <select
                className="form-select me-2"
                value={bloodGroupFilter}
                onChange={(e) => setBloodGroupFilter(e.target.value)}
              >
                <option value="">All Blood Groups</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>

              <select
                className="form-select me-2"
                value={urgencyFilter}
                onChange={(e) => setUrgencyFilter(e.target.value)}
              >
                <option value="">All Urgency Levels</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>

              <input
                type="text"
                className="form-control"
                placeholder="Search recipients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="table-responsive">
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Blood Group</th>
                  <th>Hospital</th>
                  <th>Location</th>
                  <th>Date Needed</th>
                  <th>Urgency</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecipients.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center">
                      No recipients found
                    </td>
                  </tr>
                ) : (
                  filteredRecipients.map((recipient) => (
                    <tr key={recipient._id}>
                      <td>{recipient.name}</td>
                      <td>
                        <span className="badge bg-danger">{recipient.bloodGroup}</span>
                      </td>
                      <td>{recipient.hospital || "NO Field"}</td>
                      <td>{recipient.location || "NO Field"}</td>
                      <td>{recipient.dateNeeded ? new Date(recipient.dateNeeded).toLocaleDateString() : "NO Field"}</td>
                      <td>
                        <span
                          className={`badge ${
                            recipient.urgencyLevel === "High"
                              ? "bg-danger"
                              : recipient.urgencyLevel === "Medium"
                                ? "bg-warning"
                                : "bg-success"
                          }`}
                        >
                          {recipient.urgencyLevel}
                        </span>
                      </td>
                      <td>
                        <button className="btn btn-sm btn-info me-1" onClick={() => handleEditRecipient(recipient)}>
                          Edit
                        </button>
                        <button className="btn btn-sm btn-danger" onClick={() => handleDeleteRecipient(recipient._id)}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}

export default RecipientManagement
