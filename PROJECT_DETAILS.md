# Blood Donor Management System

## Project Overview
Blood Donor Management System is a full-stack web application designed to manage blood donors, recipients, and donation matching. The system helps administrators record donor and recipient details, match compatible donors to urgent recipient requests, manage donation status, and track key metrics.

## Key Features
- Admin authentication and secure access control using JWT tokens.
- Donor management with Create, Read, Update, and Delete (CRUD) operations.
- Recipient management with CRUD operations and urgency filtering.
- Donor-recipient matching engine based on blood type compatibility.
- Donation lifecycle management with Pending, Completed, and Cancelled statuses.
- Donor availability tracking and matching only available donors.
- Search and filter capabilities for donors and recipients.
- Analytics-ready endpoints for donation trends by blood group, month, and urgency level.
- Backend handling for missing or empty values by normalizing to `NO Field`.

## Technical Stack
- Frontend: React, Vite, Bootstrap, Axios
- Backend: Python, Flask, Flask-CORS, Flask-PyMongo
- Database: MongoDB (NoSQL)
- Authentication: JWT
- Password hashing: bcrypt

## Architecture
- `frontend/`: React application with an admin dashboard and modular components.
- `backend/`: Flask REST API exposing donor, recipient, donation, matching, and analytics endpoints.
- MongoDB collections: `donors`, `recipients`, `donations`, `admins`.

## Frontend Details
- **Admin Dashboard**: central navigation for donors, recipients, matching, and donation history.
- **Login Page**: collects admin credentials and stores JWT in `localStorage`.
- **Donor Management**: list view, search/filter by blood group, add/edit/delete donors.
- **Recipient Management**: list view, search/filter by blood group and urgency, add/edit/delete recipients.
- **Matching System**: selects recipients and lists compatible donors; creates donation records.
- **Donation History**: displays donation records, allows status updates, and shows tracking details.

## Backend Details
- **Authentication**: simplified login endpoint issues JWT tokens and a token verification decorator protects API routes.
- **Donor Endpoints**:
  - GET `/api/donors`
  - GET `/api/donors/<id>`
  - POST `/api/donors`
  - PUT `/api/donors/<id>`
  - DELETE `/api/donors/<id>`
  - GET `/api/donors/search`
- **Recipient Endpoints**:
  - GET `/api/recipients`
  - GET `/api/recipients/<id>`
  - POST `/api/recipients`
  - PUT `/api/recipients/<id>`
  - DELETE `/api/recipients/<id>`
  - GET `/api/recipients/search`
- **Matching Endpoints**:
  - GET `/api/match`
  - GET `/api/match/<recipient_id>`
- **Donation Endpoints**:
  - GET `/api/donations`
  - POST `/api/donations`
  - PUT `/api/donations/<id>`
- **Analytics Endpoints**:
  - GET `/api/analytics/donations-by-blood-group`
  - GET `/api/analytics/donations-by-month`
  - GET `/api/analytics/urgency-distribution`

## Database Design
- `donors`: stores donor personal details, blood group, available status, donation history, location, and contact information.
- `recipients`: stores recipient details, required blood group, urgency level, hospital, contact information, and need date.
- `donations`: stores donation records, donor and recipient references, status, tracking history, and metadata.

## Interview Q&A
### What problem does this project solve?
It solves blood donor coordination by matching donors with recipients, tracking donation status, and providing an admin interface for managing records and analytics.

### How is blood compatibility handled?
A compatibility function maps recipient blood group to compatible donor groups. The backend queries MongoDB for available donors with compatible types.

### What are the main technical responsibilities you handled?
- Built REST APIs for donor, recipient, and donation workflows.
- Implemented a matching system and donation status tracking.
- Designed the frontend admin dashboard with search, filtering, and forms.
- Integrated MongoDB for flexible NoSQL storage and analytics.

### What are the strengths of the technology stack?
- React + Vite provides fast development and responsive UI.
- Flask offers simple REST API creation and easy Python-based backend logic.
- MongoDB supports dynamic schema design and embedded tracking arrays.
- JWT enables token-based session handling for admin access.

### What improvements would you make next?
- Add full production authentication and user roles.
- Implement input validation and secure password handling.
- Add charting dashboards for analytics endpoints.
- Deploy backend and frontend to a cloud platform and use hosted MongoDB.

## Resume Bullets
- Developed a full-stack Blood Donor Management System using **React**, **Vite**, **Flask**, and **MongoDB**.
- Created CRUD management for donors and recipients with search, filter, and form-based editing.
- Implemented a donor-recipient blood compatibility matching engine and donation lifecycle tracking.
- Built donation history management with status updates and tracking history.
- Added analytics-ready backend routes for donation trends by blood group, month, and urgency.

## Portfolio Summary
Blood Donor Management System is a comprehensive administrative platform built to manage blood donation workflows. The application supports donor and recipient records, matches compatible donors to urgent requests, tracks donation status, and stores analytics-ready data in MongoDB. The interface offers a responsive React admin dashboard with dedicated modules for management, matching, and history.

## How to Run the Project
1. Start MongoDB locally.
2. Run the backend from `backend/app.py`.
3. Run the frontend using the Vite commands in `frontend/`.
4. Log in to the admin interface and manage donors, recipients, and donations.

---

If you want, I can also create a shorter `README` paragraph or a LinkedIn-ready summary specifically for your portfolio page.