# Monitor Dashboard - AI-Powered Scraper Management System

## Quick Start Guide

A full-stack web application for managing, monitoring, and automatically fixing web scraping monitors. It features:
- Real-time dashboard
- AI-powered code fixes
- Automated deployment (GitHub/GitLab)
- Repository management
- Role-based authentication (Admin/Operator)
- Advanced code comparison

### 1. Prerequisites
- **Node.js** (v18 or higher)
- **Git** (for version control)
- **npm** (comes with Node.js)
- **No database server required** (uses SQLite by default)

### 2. Clone the Repository
```bash
git clone https://github.com/abdullah0sadiku/Monitoring_Dashboard.git
cd Monitoring_Dashboard/magicui
```

### 3. Backend Setup

#### a. Install Dependencies
```bash
cd backend
npm install
```

#### b. Environment Variables
- Copy `env.example` to `.env` and adjust as needed:
  ```bash
  cp env.example .env
  ```
- For SQLite (default), you don’t need to change `DATABASE_URL`.
- For cloud/local MongoDB, set `DATABASE_URL` accordingly.

#### c. Start the Backend
```bash
npm start
```
- The backend will run on [http://localhost:3001](http://localhost:3001)
- Health check: [http://localhost:3001/health](http://localhost:3001/health)

### 4. Frontend Setup

#### a. Install Dependencies
```bash
npm install
```

#### b. Environment Variables
- Create a `.env` file in the root (if needed) with:
  ```
  REACT_APP_API_URL=http://localhost:3001
  ```

#### c. Start the Frontend
```bash
npm start
```
- The frontend will run on [http://localhost:3000](http://localhost:3000)

### 5. Usage

- **Login** as Admin or Operator (see README for roles).
- **Add/Manage Monitors** via the dashboard.
- **Configure Repositories** for deployment.
- **Generate and review AI fixes** for broken scrapers.
- **Deploy fixes** and monitor status in real time.

### 6. Troubleshooting

- **Backend won’t start?**  
  - Ensure Node.js is v18+  
  - Check `.env` settings  
  - SQLite database will be created automatically

- **Frontend won’t start?**  
  - Ensure backend is running  
  - Check `REACT_APP_API_URL` in `.env`

- **Need MongoDB instead of SQLite?**  
  - Set `DATABASE_URL` in backend `.env` to your MongoDB URI

---
