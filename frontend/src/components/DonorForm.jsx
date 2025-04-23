"use client"

import { useState, useEffect } from "react"

const DonorForm = ({ donor, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "Male",
    bloodGroup: "A+",
    location: "",
    email: "",
    phone: "",
    available: true,
    lastDonated: "",
    // Simplified fields
    weight: "",
    height: "",
    occupation: "",
  })

  useEffect(() => {
    if (donor) {
      // Format date for input field if it exists
      const formattedDonor = { ...donor }
      if (donor.lastDonated) {
        const date = new Date(donor.lastDonated)
        formattedDonor.lastDonated = date.toISOString().split("T")[0]
      }

      setFormData(formattedDonor)
    }
  }, [donor])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <div className="form-container mb-4">
      <h4>{donor ? "Edit Donor" : "Add New Donor"}</h4>
      <form onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-md-6 mb-3">
            <label htmlFor="name" className="form-label">
              Name
            </label>
            <input
              type="text"
              className="form-control"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="col-md-3 mb-3">
            <label htmlFor="age" className="form-label">
              Age
            </label>
            <input
              type="number"
              className="form-control"
              id="age"
              name="age"
              min="18"
              max="65"
              value={formData.age}
              onChange={handleChange}
            />
          </div>

          <div className="col-md-3 mb-3">
            <label htmlFor="gender" className="form-label">
              Gender
            </label>
            <select className="form-select" id="gender" name="gender" value={formData.gender} onChange={handleChange}>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <div className="row">
          <div className="col-md-4 mb-3">
            <label htmlFor="bloodGroup" className="form-label">
              Blood Group
            </label>
            <select
              className="form-select"
              id="bloodGroup"
              name="bloodGroup"
              value={formData.bloodGroup}
              onChange={handleChange}
              required
            >
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </select>
          </div>

          <div className="col-md-4 mb-3">
            <label htmlFor="location" className="form-label">
              Location/City
            </label>
            <input
              type="text"
              className="form-control"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
            />
          </div>

          <div className="col-md-4 mb-3">
            <label htmlFor="lastDonated" className="form-label">
              Last Donated Date
            </label>
            <input
              type="date"
              className="form-control"
              id="lastDonated"
              name="lastDonated"
              value={formData.lastDonated}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="row">
          <div className="col-md-6 mb-3">
            <label htmlFor="email" className="form-label">
              Email
            </label>
            <input
              type="email"
              className="form-control"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div className="col-md-6 mb-3">
            <label htmlFor="phone" className="form-label">
              Phone Number
            </label>
            <input
              type="tel"
              className="form-control"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Basic physical attributes */}
        <div className="row">
          <div className="col-md-4 mb-3">
            <label htmlFor="weight" className="form-label">
              Weight (kg)
            </label>
            <input
              type="number"
              className="form-control"
              id="weight"
              name="weight"
              value={formData.weight}
              onChange={handleChange}
            />
          </div>

          <div className="col-md-4 mb-3">
            <label htmlFor="height" className="form-label">
              Height (cm)
            </label>
            <input
              type="number"
              className="form-control"
              id="height"
              name="height"
              value={formData.height}
              onChange={handleChange}
            />
          </div>

          <div className="col-md-4 mb-3">
            <label htmlFor="occupation" className="form-label">
              Occupation
            </label>
            <input
              type="text"
              className="form-control"
              id="occupation"
              name="occupation"
              value={formData.occupation}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="mb-3 form-check">
          <input
            type="checkbox"
            className="form-check-input"
            id="available"
            name="available"
            checked={formData.available}
            onChange={handleChange}
          />
          <label className="form-check-label" htmlFor="available">
            Available for donation
          </label>
        </div>

        <div className="d-flex justify-content-end">
          <button type="button" className="btn btn-secondary me-2" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            {donor ? "Update Donor" : "Add Donor"}
          </button>
        </div>
      </form>
    </div>
  )
}

export default DonorForm
