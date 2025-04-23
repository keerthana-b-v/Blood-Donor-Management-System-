"use client"

import { useState, useEffect } from "react"

const RecipientForm = ({ recipient, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: "",
    bloodGroup: "A+",
    hospital: "",
    location: "",
    urgencyLevel: "Medium",
    dateNeeded: "",
    contactNumber: "",
    // Simplified fields
    patientAge: "",
    patientGender: "",
    requiredUnits: 1,
    doctorName: "",
  })

  useEffect(() => {
    if (recipient) {
      // Format date for input field
      const formattedRecipient = { ...recipient }
      if (recipient.dateNeeded) {
        const date = new Date(recipient.dateNeeded)
        formattedRecipient.dateNeeded = date.toISOString().split("T")[0]
      }

      setFormData(formattedRecipient)
    }
  }, [recipient])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <div className="form-container mb-4">
      <h4>{recipient ? "Edit Recipient" : "Add New Recipient"}</h4>
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

          <div className="col-md-6 mb-3">
            <label htmlFor="bloodGroup" className="form-label">
              Blood Group Required
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
        </div>

        <div className="row">
          <div className="col-md-6 mb-3">
            <label htmlFor="hospital" className="form-label">
              Hospital
            </label>
            <input
              type="text"
              className="form-control"
              id="hospital"
              name="hospital"
              value={formData.hospital}
              onChange={handleChange}
            />
          </div>

          <div className="col-md-6 mb-3">
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
        </div>

        <div className="row">
          <div className="col-md-4 mb-3">
            <label htmlFor="urgencyLevel" className="form-label">
              Urgency Level
            </label>
            <select
              className="form-select"
              id="urgencyLevel"
              name="urgencyLevel"
              value={formData.urgencyLevel}
              onChange={handleChange}
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>

          <div className="col-md-4 mb-3">
            <label htmlFor="dateNeeded" className="form-label">
              Date Needed
            </label>
            <input
              type="date"
              className="form-control"
              id="dateNeeded"
              name="dateNeeded"
              value={formData.dateNeeded}
              onChange={handleChange}
            />
          </div>

          <div className="col-md-4 mb-3">
            <label htmlFor="contactNumber" className="form-label">
              Contact Number
            </label>
            <input
              type="tel"
              className="form-control"
              id="contactNumber"
              name="contactNumber"
              value={formData.contactNumber}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="row">
          <div className="col-md-3 mb-3">
            <label htmlFor="patientAge" className="form-label">
              Patient Age
            </label>
            <input
              type="number"
              className="form-control"
              id="patientAge"
              name="patientAge"
              value={formData.patientAge}
              onChange={handleChange}
            />
          </div>

          <div className="col-md-3 mb-3">
            <label htmlFor="patientGender" className="form-label">
              Patient Gender
            </label>
            <select
              className="form-select"
              id="patientGender"
              name="patientGender"
              value={formData.patientGender}
              onChange={handleChange}
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="col-md-3 mb-3">
            <label htmlFor="requiredUnits" className="form-label">
              Required Units
            </label>
            <input
              type="number"
              className="form-control"
              id="requiredUnits"
              name="requiredUnits"
              min="1"
              value={formData.requiredUnits}
              onChange={handleChange}
            />
          </div>

          <div className="col-md-3 mb-3">
            <label htmlFor="doctorName" className="form-label">
              Doctor's Name
            </label>
            <input
              type="text"
              className="form-control"
              id="doctorName"
              name="doctorName"
              value={formData.doctorName}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="d-flex justify-content-end">
          <button type="button" className="btn btn-secondary me-2" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            {recipient ? "Update Recipient" : "Add Recipient"}
          </button>
        </div>
      </form>
    </div>
  )
}

export default RecipientForm
