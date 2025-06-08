# Live Console Integration Guide

This guide explains the Live Console integration between frontend and backend for real-time log viewing.

## 🚀 Backend Implementation

### New API Endpoint

**`GET /logs/recent`** - Get recent logs for live console

**Query Parameters:**
- `limit` (optional): Number of logs to return (default: 100, max: 200)
- `userId` (optional): Filter by partial user ID match (case-insensitive)
- `levels` (optional): Comma-separated log levels (info,error,warning,debug)

**Example Requests:**
```bash
# Get 10 most recent logs
curl "http://localhost:5000/logs/recent?limit=10"

# Get error logs only
curl "http://localhost:5000/logs/recent?levels=error"

# Get logs for specific user
curl "http://localhost:5000/logs/recent?userId=user_1234"

# Combined filters
curl "http://localhost:5000/logs/recent?limit=20&levels=error,warning&userId=admin"
```

**Response Format:**
```json
[
  {
    "id": "log_123456789",
    "timestamp": "14:32:15",
    "level": "error",
    "message": "User authentication failed",
    "userId": "user_1234"
  }
]
```

### Backend Architecture

**Repository Layer** (`app/repositories/log_repository.py`):
- `get_recent_logs(limit, user_id, level)` - MongoDB query with filtering and sorting

**Controller Layer** (`app/controllers/log_controller.py`):
- `get_recent_logs_controller(limit, user_id, levels)` - Input validation and formatting

**Routes Layer** (`app/routes/log_routes.py`):
- `GET /logs/recent` - HTTP endpoint with query parameter parsing

## 🎯 Frontend Implementation

### Updated Hook: `useLogs.ts`

The hook now supports real API integration with the following features:

**New Interface:**
```typescript
interface UseLogsOptions {
  limit?: number;           // Max logs to fetch
  userId?: string;          // User ID filter
  levels?: string[];        // Log level filters
  autoRefresh?: boolean;    // Enable auto-refresh
  refreshInterval?: number; // Refresh interval in ms
}

interface UseLogsReturn {
  logs: LogEntry[];         // Current logs
  loading: boolean;         // Loading state
  error: string | null;     // Error message
  refetch: () => void;      // Manual refresh function
}
```

**Usage:**
```typescript
// Basic usage (auto-refresh every 5 seconds)
const { logs, loading, error, refetch } = useLogs();

// With filters
const { logs } = useLogs({
  limit: 50,
  userId: 'admin',
  levels: ['error', 'warning'],
  autoRefresh: true,
  refreshInterval: 3000
});
```

### Updated Component: `LiveConsole.tsx`

**New Features:**
- Real-time API integration
- Auto-refresh toggle
- Manual refresh button
- Loading states
- Error handling
- Status indicators
- Enhanced filtering

**Key Changes:**
- Removed client-side filtering (now handled by API)
- Added connection status indicators
- Enhanced error display
- Real-time auto-refresh controls

## 🔧 Configuration

### Environment Variables

**Frontend** (`.env`):
```
VITE_API_BASE_URL=http://localhost:5000
```

### Auto-Refresh Settings

- **Default interval**: 5 seconds
- **Configurable** via `refreshInterval` option
- **Toggle-able** via UI controls
- **Pauses** when errors occur

## 📊 Performance Considerations

### Backend Optimizations

1. **Indexed Queries**: MongoDB indexes on `timestamp` and `level`
2. **Limited Results**: Max 200 logs per request
3. **Efficient Sorting**: Uses MongoDB's native sorting
4. **Proper Error Handling**: Graceful degradation

### Frontend Optimizations

1. **Debounced Filtering**: Filters trigger new API calls
2. **Auto-Refresh Control**: Can be disabled to reduce load
3. **Error Recovery**: Automatic retry mechanisms
4. **Efficient Rendering**: React optimizations for log list

## 🧪 Testing

### Test the API Directly

```bash
# Run the test script
python test_recent_logs_api.py

# Manual testing
curl "http://localhost:5000/logs/recent?limit=5"
```

### Frontend Testing

1. Start backend: `docker-compose up -d`
2. Start frontend: `npm run dev`
3. Navigate to Live Console in dashboard
4. Test filtering and auto-refresh features

## 🚀 Usage Flow

1. **Component Mount**: LiveConsole loads with `useLogs()` hook
2. **Initial Fetch**: Hook makes API call to `/logs/recent`
3. **Auto-Refresh**: Every 5 seconds, hook refetches data
4. **User Filtering**: Filter changes trigger new API calls with params
5. **Real-time Updates**: New logs appear automatically
6. **Error Handling**: Connection issues display error states

## 🔍 Troubleshooting

### Common Issues

**No logs appearing:**
- Check if backend is running on port 5000
- Verify MongoDB has sample data
- Check browser console for API errors

**Filtering not working:**
- Ensure filter values match log data format
- Check API response in Network tab
- Verify backend query logic

**Auto-refresh stopped:**
- Check for JavaScript errors
- Verify API endpoint is accessible
- Toggle auto-refresh off/on

### Debug Commands

```bash
# Check recent logs API
curl "http://localhost:5000/logs/recent?limit=3"

# Check logs exist in database
python test_sample_data.py

# Test with specific filters
curl "http://localhost:5000/logs/recent?levels=error&limit=5"
```

## 🎉 Integration Complete!

The Live Console now displays real-time logs from your MongoDB database with:
- ✅ Real API integration
- ✅ Dynamic filtering
- ✅ Auto-refresh functionality
- ✅ Error handling
- ✅ Loading states
- ✅ Status indicators

The component maintains its original design while now using live data from your backend! 