
# 🚀 LogTrail Platform

A complete, self-hosted log management platform for Android applications. Monitor your app's logs, crashes, and performance in real-time with a modern web dashboard.

![Platform](https://img.shields.io/badge/Platform-Self%20Hosted-blue)
![License](https://img.shields.io/badge/License-MIT-green)
![Python](https://img.shields.io/badge/Python-3.9+-blue)
![React](https://img.shields.io/badge/React-18+-blue)
![MongoDB](https://img.shields.io/badge/MongoDB-7.0-green)

---

## 🎯 Overview

**LogTrail Platform** is a lightweight, self-hosted alternative to cloud logging services like Papertrail or Logcat viewers. It consists of a **React frontend dashboard** and a **Flask backend API** that work seamlessly with the [LogTrail Android SDK](https://github.com/YourUsername/LogTrailSDK).

### Perfect for developers who want:
- 🔒 **Complete data ownership** – logs stay on your infrastructure
- 💰 **Cost-effective** – no per-GB pricing or subscription fees  
- ⚡ **Real-time monitoring** – see logs as they happen
- 🎨 **Modern UI** – clean, responsive dashboard built with React & TailwindCSS
- 🔧 **Easy deployment** – Docker Compose setup in minutes

---

## ✨ Features

### 🖥️ Frontend Dashboard
- Real-time Log Viewer – live console with auto-refresh
- Advanced Filtering – search by user ID, log level, tag, timestamp
- Analytics Overview – error rates, activity trends, top sources
- Responsive Design – works on desktop, tablet, and mobile
- Dark/Light Theme – customizable interface

### 🔧 Backend API
- REST API – clean endpoints for log ingestion and retrieval
- Real-time Updates – WebSocket support for live log streaming
- MongoDB Integration – optimized queries with indexing
- CORS Enabled – compatible with any frontend origin
- Scalable Architecture – modular design (controllers & repositories)

### 📱 Android SDK Integration
- Seamless integration with [LogTrail Android SDK](https://github.com/YourUsername/LogTrailSDK)
- Automatic crash detection & lifecycle monitoring
- Custom log levels (DEBUG, INFO, WARN, ERROR, VERBOSE)
- Thread-safe and non-blocking

---

## 📁 Project Structure

```plaintext
LogTrailPlatform/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── db.py
│   │   ├── routes/
│   │   │   ├── log_routes.py
│   │   │   └── settings_routes.py
│   │   ├── controllers/
│   │   └── repositories/
│   ├── requirements.txt
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── init-mongo.js
└── logtrail-frontend/
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   │   ├── Overview.tsx
    │   │   ├── Logs.tsx
    │   │   ├── LiveConsole.tsx
    │   │   └── Settings.tsx
    │   ├── hooks/
    │   └── contexts/
    ├── package.json
    ├── vite.config.ts
    └── Dockerfile
```

---

## 🚀 Quick Start

### Prerequisites

- **Docker & Docker Compose** (recommended)
- Or **Python 3.9+** and **Node.js 18+** for manual setup
- **MongoDB 7.0+** (included in Docker setup)

---

### ✅ Option 1: Docker Compose (Recommended)

```bash
git clone https://github.com/YourUsername/LogTrailPlatform.git
cd LogTrailPlatform/backend
docker-compose up -d
```

- Frontend Dashboard: [http://localhost:3000](http://localhost:3000)
- Backend API: [http://localhost:5000](http://localhost:5000)
- MongoDB: `localhost:27017`

---

### 🛠 Option 2: Manual Setup

#### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Create .env
echo "MONGO_URI=mongodb://localhost:27017/logtrail" > .env
echo "MONGO_DB_NAME=logtrail" >> .env

# Start MongoDB via Docker (or install locally)
docker run -d -p 27017:27017 --name mongodb mongo:7.0

# Run server
python app.py
```

#### Frontend

```bash
cd logtrail-frontend
npm install

# Create .env
echo "VITE_API_BASE_URL=http://localhost:5000" > .env

npm run dev
```

---

## 🔧 Configuration

### Backend `.env`

```env
MONGO_URI=mongodb://localhost:27017/logtrail
MONGO_DB_NAME=logtrail
FLASK_ENV=development  # or production
```

### Frontend `.env`

```env
VITE_API_BASE_URL=http://localhost:5000
```

---

## 📊 Usage

### 1. Integrate Android SDK

```kotlin
val config = LogTrailConfig.create("http://localhost:5000", "user123")
LogTrail.init(this, config)

LogTrailLogger.i("MainActivity", "User logged in")
```

### 2. Use the Dashboard

- **Overview** – error rates, log volume, top sources
- **Logs** – search & filter logs
- **Live Console** – real-time log updates
- **Settings** – platform configuration

### 3. API Endpoints

```http
GET  /logs/get-logs?level=error&limit=50&page=1
POST /logs/add-log
GET  /logs/stats
```

---

## 🐳 Production Deployment

### Docker Compose (Production)

```yaml
version: '3.8'
services:
  mongodb:
    image: mongo:7.0
    restart: unless-stopped
    environment:
      MONGO_INITDB_ROOT_USERNAME: your_admin_user
      MONGO_INITDB_ROOT_PASSWORD: your_secure_password
    volumes:
      - mongodb_data:/data/db
    ports:
      - "27017:27017"

  backend:
    build: ./backend
    restart: unless-stopped
    environment:
      MONGO_URI: mongodb://your_admin_user:your_secure_password@mongodb:27017/logtrail?authSource=admin
      FLASK_ENV: production
    ports:
      - "5000:5000"

  frontend:
    build: ./logtrail-frontend
    restart: unless-stopped
    environment:
      VITE_API_BASE_URL: https://your-api-domain.com
    ports:
      - "3000:3000"

volumes:
  mongodb_data:
```

## 🛠 Development

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python app.py
```

### Frontend

```bash
cd logtrail-frontend
npm install
npm run dev
```

### Add New Features

- Backend: `app/routes/`, `app/controllers/`
- Frontend: `src/pages/`, `src/components/`
- DB schema: update `init-mongo.js`

---


## 🔗 Related Projects

- [LogTrail Android SDK](https://github.com/liadb33/LogTrailSDK) – Android logger


**Made with ❤️ for developers who want control over their logs**

*LogTrail Platform – self-hosted, lightweight, and developer-friendly*

