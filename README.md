# 🩸 Blood Donor Management System

A full-stack web application designed to streamline blood donation workflows by connecting donors with recipients through an intelligent matching engine and a responsive admin dashboard.

---

## 📌 Overview

The **Blood Donor Management System** is a comprehensive administrative platform built to manage blood donation processes end-to-end. It enables administrators to record donor and recipient details, match compatible donors to urgent requests using medical compatibility rules, track donation lifecycles, and analyse donation trends through analytics-ready endpoints.

---

## ✨ Key Features

- 🔐 **Secure Admin Authentication** — JWT-based login with bcrypt password hashing
- 👤 **Donor Management** — Full CRUD operations with search and filter by blood group, location, and age
- 🏥 **Recipient Management** — CRUD operations with urgency-level filtering and date-range queries
- 🔄 **Blood Compatibility Matching Engine** — Automatically matches compatible available donors to recipient requests
- 📋 **Donation Lifecycle Tracking** — Manage donation status (Pending → Completed / Cancelled) with embedded history
- 📊 **Analytics Endpoints** — Donation trends by blood group, month, and urgency distribution
- 🗂️ **Dashboard Summary** — Real-time stats for total donors, recipients, pending and completed donations, and urgent requests

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React.js, Vite, Bootstrap 5, Axios |
| **Backend** | Python, Flask, Flask-CORS, Flask-PyMongo |
| **Database** | MongoDB (NoSQL) |
| **Authentication** | JWT (JSON Web Tokens) |
| **Security** | bcrypt password hashing |

---

## 🗂️ Project Structure

```
Blood-Donor-Management-System/
├── backend/
│   └── app.py               # Flask REST API — all routes and business logic
├── frontend/
│   ├── src/                 # React components and pages
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
└── PROJECT_DETAILS.md       # Detailed project documentation
```

---

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/admin/login` | Admin login — returns JWT token |

### Donors
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/donors` | List all donors |
| GET | `/api/donors/<id>` | Get a specific donor |
| POST | `/api/donors` | Add a new donor |
| PUT | `/api/donors/<id>` | Update a donor |
| DELETE | `/api/donors/<id>` | Delete a donor |
| GET | `/api/donors/search` | Search/filter donors |

### Recipients
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/recipients` | List all recipients |
| GET | `/api/recipients/<id>` | Get a specific recipient |
| POST | `/api/recipients` | Add a new recipient |
| PUT | `/api/recipients/<id>` | Update a recipient |
| DELETE | `/api/recipients/<id>` | Delete a recipient |
| GET | `/api/recipients/search` | Search/filter recipients |

### Matching
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/match` | Get matches for all recipients |
| GET | `/api/match/<recipient_id>` | Get compatible donors for a recipient |

### Donations
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/donations` | List all donation records |
| POST | `/api/donations` | Create a new donation record |
| PUT | `/api/donations/<id>` | Update donation status |

### Analytics
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/analytics/donations-by-blood-group` | Donation count grouped by blood group |
| GET | `/api/analytics/donations-by-month` | Donation trends by month |
| GET | `/api/analytics/urgency-distribution` | Recipient urgency level breakdown |

---

## 🧬 Blood Compatibility Chart

| Recipient Blood Group | Compatible Donor Groups |
|---|---|
| A+ | A+, A−, O+, O− |
| A− | A−, O− |
| B+ | B+, B−, O+, O− |
| B− | B−, O− |
| AB+ | All groups (Universal Recipient) |
| AB− | A−, B−, AB−, O− |
| O+ | O+, O− |
| O− | O− (Universal Donor) |

---

## ⚙️ Getting Started

### Prerequisites
- Python 3.x
- Node.js & npm
- MongoDB (running locally on port `27017`)

### 1. Start MongoDB
```bash
mongod
```

### 2. Run the Backend
```bash
cd backend
pip install flask flask-cors flask-pymongo pyjwt bcrypt
python app.py
```
The Flask server starts at `http://localhost:5000`

### 3. Run the Frontend
```bash
cd frontend
npm install
npm run dev
```
The React app starts at `http://localhost:5173`

### 4. Initialize Admin User
Visit `http://localhost:5000/api/init` once to seed the default admin account.

> **Default credentials:** `admin` / `admin123`

---

## 🗄️ Database Collections

| Collection | Description |
|---|---|
| `donors` | Donor personal info, blood group, availability, and embedded donation history |
| `recipients` | Recipient details, required blood group, urgency level, and hospital info |
| `donations` | Donation records with status, tracking history, and embedded metadata |
| `admins` | Admin credentials (hashed passwords) |

---

## 📈 MongoDB Highlights (NoSQL Advantages)

- **Embedded Arrays** — Donor donation history stored as embedded documents within each donor record
- **Flexible Schema** — Rich donation documents store donor/recipient snapshots without joins
- **Aggregation Pipelines** — Used for analytics: grouping, sorting, and computing trends directly in the database
- **Atomic Updates** — `$push` and `$set` with array filters ensure consistent embedded document updates

---

## 🔮 Future Improvements

- [ ] Role-based access control (multi-admin, hospital roles)
- [ ] Input validation and form sanitization
- [ ] Charting dashboards (e.g., Chart.js) for analytics endpoints
- [ ] SMS/email alerts for urgent donor matches
- [ ] Cloud deployment (Render/Railway + MongoDB Atlas)
- [ ] Donor self-registration portal

---

## 📄 License

This project was developed as an academic NoSQL project demonstration.

---

> Built with ❤️ using React, Flask, and MongoDB
