"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import DonorForm from "./DonorForm"

const DonorManagement = () => {
  const [donors, setDonors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [currentDonor, setCurrentDonor] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [bloodGroupFilter, setBloodGroupFilter] = useState("")

  useEffect(() => {
    fetchDonors()
  }, [])

  const fetchDonors = async () => {
    try {
      setLoading(true)
      const response = await axios.get("http://localhost:5000/api/donors", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      })
      setDonors(response.data)
      setError("")
    } catch (err) {
      console.error("Error fetching donors:", err)
      setError("Failed to load donors")
    } finally {
      setLoading(false)
    }
  }

  const handleAddDonor = () => {
    setCurrentDonor(null)
    setShowForm(true)
  }

  const handleEditDonor = (donor) => {
    setCurrentDonor(donor)
    setShowForm(true)
  }

  const handleDeleteDonor = async (id) => {
    if (window.confirm("Are you sure you want to delete this donor?")) {
      try {
        await axios.delete(`http://localhost:5000/api/donors/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        })
        fetchDonors()
      } catch (err) {
        console.error("Error deleting donor:", err)
        setError("Failed to delete donor")
      }
    }
  }

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

      if (currentDonor) {
        // Update existing donor
        const response = await axios.put(`http://localhost:5000/api/donors/${currentDonor._id}`, dataToSubmit, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        })

        if (response.status === 200) {
          // Show success message
          setError("Donor updated successfully!")
          setTimeout(() => {
            setShowForm(false)
            fetchDonors()
          }, 1000)
        }
      } else {
        // Add new donor
        const response = await axios.post("http://localhost:5000/api/donors", dataToSubmit, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        })

        if (response.status === 201) {
          // Show success message
          setError("Donor added successfully!")
          setTimeout(() => {
            setShowForm(false)
            fetchDonors()
          }, 1000)
        }
      }
    } catch (err) {
      console.error("Error saving donor:", err)
      setError(err.response?.data?.message || "Failed to save donor. Please try again.")
    }
  }

  const handleFormCancel = () => {
    setShowForm(false)
  }

  const filteredDonors = donors.filter((donor) => {
    const matchesSearch =
      donor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      donor.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      donor.phone?.includes(searchTerm) ||
      donor.location?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesBloodGroup = bloodGroupFilter ? donor.bloodGroup === bloodGroupFilter : true

    return matchesSearch && matchesBloodGroup
  })

  if (loading && donors.length === 0) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border"></div>
      </div>
    )
  }

  return (
    <div className="donor-management">
      <h2 className="mb-4">Donor Management</h2>

      {error && (
        <div className={`alert ${error.includes("successfully") ? "alert-success" : "alert-danger"}`}>{error}</div>
      )}

      {showForm ? (
        <DonorForm donor={currentDonor} onSubmit={handleFormSubmit} onCancel={handleFormCancel} />
      ) : (
        <>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <button className="btn btn-primary" onClick={handleAddDonor}>
              Add New Donor
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

              <input
                type="text"
                className="form-control"
                placeholder="Search donors..."
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
                  <th>Age</th>
                  <th>Blood Group</th>
                  <th>Location</th>
                  <th>Contact</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDonors.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center">
                      No donors found
                    </td>
                  </tr>
                ) : (
                  filteredDonors.map((donor) => (
                    <tr key={donor._id}>
                      <td>{donor.name}</td>
                      <td>{donor.age || "NO Field"}</td>
                      <td>
                        <span className="badge bg-danger">{donor.bloodGroup}</span>
                      </td>
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
                        <span className={`badge ${donor.available ? "bg-success" : "bg-secondary"}`}>
                          {donor.available ? "Available" : "Unavailable"}
                        </span>
                      </td>
                      <td>
                        <button className="btn btn-sm btn-info me-1" onClick={() => handleEditDonor(donor)}>
                          Edit
                        </button>
                        <button className="btn btn-sm btn-danger" onClick={() => handleDeleteDonor(donor._id)}>
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

export default DonorManagement
