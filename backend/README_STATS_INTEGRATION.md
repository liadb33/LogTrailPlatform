# Stats API Integration - Testing Guide

This guide explains how to test the new backend-frontend integration for KPI dashboard stats.

## 🚀 Backend Setup

### 1. Start the backend services

```bash
cd backend
docker-compose up -d
```

This will start:
- MongoDB on port 27017
- Mongo Express (DB viewer) on port 8081
- Flask backend on port 5000

### 2. Generate sample data

**Option A: Quick method (recommended)**
```bash
cd backend
python test_sample_data.py
```

**Option B: If you get connection errors**
```bash
cd backend
python setup_local_env.py  # Test connection first
python test_sample_data.py
```

This creates 200 sample log entries with:
- Various log levels (info, error, warning, debug)
- Different tags (auth, api, database, cache, system)
- Timestamps spread over the last 30 days
- Peak hours (2-4 PM) with more errors

### 3. Test the stats API

```bash
curl http://localhost:5000/logs/stats
```

Expected response format:
```json
{
  "stats": {
    "errors": 25,
    "totalLogs": 200,
    "uniqueUsers": 150,
    "topErrorTag": {
      "tag": "auth",
      "percentage": 60
    },
    "logRate": 2.1,
    "peakLogs": {
      "count": 15,
      "time": "14:00"
    }
  },
  "chartData": {
    "labels": ["Jan", "Feb", "Mar", ...],
    "datasets": [{
      "label": "Log Activity",
      "data": [0, 0, 0, ..., 200],
      "borderColor": "rgb(59, 130, 246)",
      "backgroundColor": "rgba(59, 130, 246, 0.5)"
    }]
  }
}
```

## 🎯 Frontend Setup

### 1. Start the frontend

```bash
cd logtrail-frontend
npm install
npm run dev
```

### 2. Configure API URL (optional)

Create a `.env` file in the frontend root:
```
VITE_API_BASE_URL=http://localhost:5000
```

### 3. Test the dashboard

1. Navigate to `http://localhost:5173`
2. The Overview page should show:
   - Loading spinner initially
   - Real KPI data from the backend
   - Refresh button in the top-right
   - Error handling if backend is down
   - Auto-refresh every 30 seconds

## 📊 KPI Metrics Explained

- **Total Logs**: Count of all documents in logs collection
- **Unique Users**: Distinct userId count
- **Errors**: Logs where level matches "error" (case-insensitive)
- **Top Error Tag**: Most common tag among error logs with percentage
- **Log Rate**: Logs per minute in the last 10 minutes
- **Peak Logs**: Hour with highest log count and its timestamp
- **Chart Data**: Monthly aggregation of all logs

## 🔧 API Endpoints

- `GET /logs/stats` - Get dashboard statistics
- `GET /logs/` - Get all logs (with optional filters)
- `POST /logs/` - Create a new log entry

## 🐛 Troubleshooting

### Connection Issues (Most Common)

If you get `ServerSelectionTimeoutError` when running scripts:

```bash
# 1. Make sure MongoDB is running
docker-compose up -d mongodb

# 2. Check if MongoDB container is running
docker ps | grep mongodb

# 3. Test connection manually
python setup_local_env.py

# 4. If still failing, restart everything
docker-compose down
docker-compose up -d
```

### Backend Issues
- Check MongoDB is running: `docker ps`
- View backend logs: `docker-compose logs backend`
- Test database connection: Visit `http://localhost:8081` (Mongo Express)
- Restart backend: `docker-compose restart backend`

### Frontend Issues
- Check console for CORS errors
- Verify API URL in network tab
- Check if backend is running on port 5000

### Data Issues
- Re-run sample data generation: `python test_sample_data.py`
- Check MongoDB data: Use Mongo Express at `http://localhost:8081`
- Clear database: Use Mongo Express or run the script again (it clears existing data)

## 🔄 Adding More Test Data

To add more varied data:

```python
from pymongo import MongoClient
import datetime

# Connect to MongoDB
client = MongoClient("mongodb://admin:password123@localhost:27017/logtrail?authSource=admin")
db = client.logtrail
logs_collection = db.logs

# Add a high-error period
logs_collection.insert_many([
    {
        'userId': f'user_critical_{i}',
        'level': 'error',
        'tag': 'system',
        'message': f'Critical system error {i}',
        'timestamp': datetime.datetime.utcnow() - datetime.timedelta(minutes=i)
    }
    for i in range(20)
])
```

## 🔍 Quick Test Commands

```bash
# Check if MongoDB is accessible
docker exec -it logtrail_mongodb mongosh mongodb://admin:password123@localhost:27017/logtrail?authSource=admin

# Check backend API directly
curl http://localhost:5000/logs/stats

# View current logs count
curl http://localhost:5000/logs/all | jq length

# Check frontend is connecting
# Open browser dev tools and check Network tab when visiting http://localhost:5173
```

This integration replaces all mock KPI data with real calculations from your MongoDB logs collection! 