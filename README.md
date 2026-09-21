# 🏛️ JansevaX - Civic Issue Management & Resolution Portal

**JansevaX** is a modern, full-stack civic tech platform designed to empower citizens to report local infrastructure & public service issues (potholes, water supply, streetlight failures, garbage accumulation, etc.) while equipping municipal officers and department heads with real-time GIS mapping, AI-based priority scoring, problem clustering, and automated resolution workflow management.

---

## ✨ Key Features

### 👤 Citizen Portal
- **Interactive Issue Reporting**: Upload photo evidence, auto-locate via GPS or pin on interactive maps, and tag category/department.
- **Real-Time Issue Tracking**: Live status timelines from *Reported* ➔ *Assigned* ➔ *In Progress* ➔ *Resolved*.
- **Citizen Feedback & Verification**: Citizens verify resolved issues and rate resolution quality.

### 👮 Officer & Department Dashboard
- **Dynamic GIS Map View**: Visual geographic cluster mapping of reported issues with severity indicators.
- **AI Priority Scoring Engine**: Automatic sorting of complaints based on impact, recurrence, location density, and urgency.
- **Interactive Notification Center**: Real-time notifications for newly assigned reports, status updates, and officer action logging.
- **Problem Clustering & Duplicate Detection**: Automatically groups nearby/duplicate civic complaints into unified actionable clusters.

### 🛠️ Administrator Control Room
- **Departmental Analytics**: System-wide resolution metrics, department workloads, and escalation monitoring.
- **User & Role Management**: RBAC (Role-Based Access Control) for Citizens, Departmental Officers, and Super Admins.

---

## 🛠️ Technology Stack

### **Frontend**
- **Framework**: React 18 (Vite)
- **Styling**: Tailwind CSS + Custom Dark/Glassmorphism Design System
- **Mapping**: Leaflet / React-Leaflet GIS Integration
- **State & Routing**: React Router v6, Context API

### **Backend**
- **Framework**: Java 17 + Spring Boot 3
- **Security**: Spring Security + JWT Authentication
- **Database**: PostgreSQL / H2 Database with JPA / Hibernate ORM
- **Build Tool**: Apache Maven

---

## 🚀 Getting Started Locally

### Prerequisites
- **Node.js**: v18+ installed
- **Java JDK**: 17+ installed

### 1. Clone the Repository
```bash
git clone https://github.com/Ankit-kitcollege/JansevaX.git
cd JansevaX
```

### 2. Run Backend (Spring Boot)
```bash
cd backend
./mvnw spring-boot:run
```
*Backend runs on `http://localhost:8080`*

### 3. Run Frontend (React Vite)
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:3000`*

---

## 📄 Database Setup
Execute the SQL script located at `database/schema.sql` on your PostgreSQL database instance to initialize all tables, enums, triggers, and foreign keys.

---

## 👥 Authors & Acknowledgements
Developed as part of the **JansevaX Civic Initiative** for modern smart city administration and citizen grievance redressal.
