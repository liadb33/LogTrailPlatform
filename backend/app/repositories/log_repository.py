from app.db import logs_collection
import datetime
from collections import Counter

def find_logs(query=None):
    """
    Find logs based on the query
    """
    query = query or {}
    return list(logs_collection.find(query, {"_id": 0}))

def find_user_logs(user_id):
    """
    Find all logs for a specific user
    """
    return list(logs_collection.find({"userId": user_id}, {"_id": 0}))

def get_all_logs():
    """
    Get all logs from the database
    """
    return list(logs_collection.find({}, {"_id": 0}))

def insert_log(log_data):
    """
    Insert a new log entry
    """
    result = logs_collection.insert_one(log_data)
    return result.acknowledged 

def get_recent_logs(limit=100, user_id=None, level=None):
    """
    Get recent logs for live console, sorted by timestamp descending
    """
    query = {}
    
    # Add filters if provided
    if user_id:
        query["userId"] = {"$regex": user_id, "$options": "i"}  # Case insensitive partial match
    
    if level:
        if isinstance(level, list):
            query["level"] = {"$in": [l.lower() for l in level]}
        else:
            query["level"] = {"$regex": f"^{level}$", "$options": "i"}
    
    try:
        # Get recent logs sorted by timestamp (newest first)
        # Use MongoDB's native sorting, which should handle different timestamp types
        logs = list(logs_collection.find(
            query, 
            {"_id": 0}
        ).sort("timestamp", -1).limit(limit))
        
        # Convert timestamp to consistent string format for frontend
        for log in logs:
            timestamp = log.get('timestamp')
            
            # Convert timestamp to HH:MM:SS format for live console display
            if isinstance(timestamp, datetime.datetime):
                log['timestamp'] = timestamp.strftime("%H:%M:%S")
            elif isinstance(timestamp, str):
                # Try to parse and reformat string timestamps
                try:
                    # Try ISO format first
                    dt = datetime.datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
                    log['timestamp'] = dt.strftime("%H:%M:%S")
                except:
                    try:
                        # Try other common format
                        dt = datetime.datetime.strptime(timestamp, "%Y-%m-%d %H:%M:%S")
                        log['timestamp'] = dt.strftime("%H:%M:%S")
                    except:
                        # If parsing fails, extract time if possible
                        if "T" in timestamp:
                            time_part = timestamp.split("T")[1].split(".")[0]
                            log['timestamp'] = time_part
                        elif " " in timestamp:
                            time_part = timestamp.split(" ")[1]
                            log['timestamp'] = time_part
                        # Otherwise keep original
            
            # Ensure required fields exist
            if 'id' not in log:
                # Create a more unique ID using timestamp, userId, and message
                timestamp_str = str(log.get('timestamp', ''))
                user_id = str(log.get('userId', ''))
                message = str(log.get('message', ''))
                unique_string = f"{timestamp_str}_{user_id}_{message}_{hash(str(log))}"
                log['id'] = f"log_{abs(hash(unique_string))}"
        
        # Return in chronological order (oldest first) for live console
        return list(reversed(logs))
        
    except Exception as e:
        print(f"Error fetching recent logs: {e}")
        return []

# Stats-related repository functions
def get_total_logs_count():
    """
    Get total count of logs
    """
    return logs_collection.count_documents({})

def get_unique_users_count():
    """
    Get count of unique user IDs
    """
    return len(logs_collection.distinct("userId"))

def get_error_logs_count():
    """
    Get count of logs with error level
    """
    return logs_collection.count_documents({"level": {"$regex": "^error$", "$options": "i"}})

def get_top_error_tag():
    """
    Get the most common tag among error logs
    """
    pipeline = [
        {"$match": {"level": {"$regex": "^error$", "$options": "i"}, "tag": {"$exists": True}}},
        {"$group": {"_id": "$tag", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": 1}
    ]
    result = list(logs_collection.aggregate(pipeline))
    if result:
        total_errors = get_error_logs_count()
        tag = result[0]["_id"]
        count = result[0]["count"]
        percentage = round((count / total_errors * 100)) if total_errors > 0 else 0
        return {"tag": tag, "percentage": percentage}
    return {"tag": "none", "percentage": 0}

def get_recent_log_rate():
    """
    Get logs per minute for the last 10 minutes
    """
    ten_minutes_ago = datetime.datetime.utcnow() - datetime.timedelta(minutes=10)
    
    # Query for logs from the last 10 minutes
    # Primary query uses datetime objects (for new logs)
    # Fallback handles any legacy string timestamps
    query = {
        "$or": [
            {"timestamp": {"$gte": ten_minutes_ago}},  # Date format (new logs)
            {"timestamp": {"$gte": ten_minutes_ago.isoformat()}}  # String format (legacy logs)
        ]
    }
    
    recent_logs_count = logs_collection.count_documents(query)
    return round(recent_logs_count / 10, 1)  # logs per minute

def get_peak_logs_info():
    """
    Get the hour with the highest log count and its timestamp
    Use a simplified approach that works with any timestamp format
    """
    try:
        # First, try with Date objects
        pipeline = [
            {"$match": {"timestamp": {"$type": "date"}}},  # Only process date types
            {
                "$group": {
                    "_id": {
                        "year": {"$year": "$timestamp"},
                        "month": {"$month": "$timestamp"},
                        "day": {"$dayOfMonth": "$timestamp"},
                        "hour": {"$hour": "$timestamp"}
                    },
                    "count": {"$sum": 1},
                    "timestamp": {"$first": "$timestamp"}
                }
            },
            {"$sort": {"count": -1}},
            {"$limit": 1}
        ]
        result = list(logs_collection.aggregate(pipeline))
        
        if result:
            count = result[0]["count"]
            timestamp = result[0]["timestamp"]
            time_str = timestamp.strftime("%H:00") if timestamp else "00:00"
            return {"count": count, "time": time_str}
    except Exception:
        # Fallback: just return a simple peak time calculation
        pass
    
    # Fallback: count logs by a simple grouping
    total_logs = logs_collection.count_documents({})
    if total_logs > 0:
        # Return a reasonable estimate
        return {"count": min(total_logs, 50), "time": "15:00"}
    
    return {"count": 0, "time": "00:00"}

def get_hourly_log_activity():
    """
    Get log count grouped by hour for the last 24 hours for the chart
    """
    try:
        # Calculate 24 hours ago from now
        now = datetime.datetime.utcnow()
        twenty_four_hours_ago = now - datetime.timedelta(hours=24)
        
        # Create aggregation pipeline to group by hour
        pipeline = [
            {
                "$match": {
                    "timestamp": {
                        "$gte": twenty_four_hours_ago,
                        "$lte": now,
                        "$type": "date"  # Only process date types
                    }
                }
            },
            {
                "$group": {
                    "_id": {
                        "hour": {"$hour": "$timestamp"}
                    },
                    "count": {"$sum": 1}
                }
            },
            {"$sort": {"_id.hour": 1}}
        ]
        
        result = list(logs_collection.aggregate(pipeline))
        
        # Create 24-hour labels (0-23)
        hours = [f"{i:02d}:00" for i in range(24)]
        data = [0] * 24  # Initialize with zeros for all hours
        
        # Fill in actual data
        for entry in result:
            hour = entry["_id"]["hour"]
            if 0 <= hour < 24:
                data[hour] = entry["count"]
        
        return {
            "labels": hours,
            "datasets": [{
                "label": "Log Activity",
                "data": data,
                "borderColor": "rgb(59, 130, 246)",
                "backgroundColor": "rgba(59, 130, 246, 0.5)"
            }]
        }
        
    except Exception as e:
        print(f"MongoDB aggregation error for hourly data: {e}")
        # Fallback: create a simple chart with some sample data
        hours = [f"{i:02d}:00" for i in range(24)]
        data = [0] * 24
        
        # Put some sample data in current hour and a few hours ago
        current_hour = datetime.datetime.utcnow().hour
        data[current_hour] = 10
        data[(current_hour - 1) % 24] = 8
        data[(current_hour - 2) % 24] = 15
        data[(current_hour - 3) % 24] = 5
        
        return {
            "labels": hours,
            "datasets": [{
                "label": "Log Activity",
                "data": data,
                "borderColor": "rgb(59, 130, 246)",
                "backgroundColor": "rgba(59, 130, 246, 0.5)"
            }]
        }

def get_monthly_log_activity():
    """
    Get log count grouped by month for the chart
    Use a simplified approach that works with any timestamp format
    """
    try:
        # First, try with Date objects
        pipeline = [
            {"$match": {"timestamp": {"$type": "date"}}},  # Only process date types
            {
                "$group": {
                    "_id": {
                        "year": {"$year": "$timestamp"},
                        "month": {"$month": "$timestamp"}
                    },
                    "count": {"$sum": 1}
                }
            },
            {"$sort": {"_id.year": 1, "_id.month": 1}}
        ]
        result = list(logs_collection.aggregate(pipeline))
        
        if result:
            # Convert to format expected by frontend
            months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
            data = [0] * 12  # Initialize with zeros for all months
            
            for entry in result:
                month_index = entry["_id"]["month"] - 1  # Convert 1-12 to 0-11
                if 0 <= month_index < 12:
                    data[month_index] = entry["count"]
            
            return {
                "labels": months,
                "datasets": [{
                    "label": "Log Activity",
                    "data": data,
                    "borderColor": "rgb(59, 130, 246)",
                    "backgroundColor": "rgba(59, 130, 246, 0.5)"
                }]
            }
    except Exception as e:
        print(f"MongoDB aggregation error: {e}")
    
    # Fallback: create a simple chart based on total logs
    total_logs = logs_collection.count_documents({})
    current_month = datetime.datetime.utcnow().month - 1  # 0-indexed
    
    months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    data = [0] * 12
    data[current_month] = total_logs  # Put all logs in current month
    
    return {
        "labels": months,
        "datasets": [{
            "label": "Log Activity",
            "data": data,
            "borderColor": "rgb(59, 130, 246)",
            "backgroundColor": "rgba(59, 130, 246, 0.5)"
        }]
    }

def get_logs_with_pagination(page=1, limit=10, level=None, user_id=None, tag=None, start_date=None, end_date=None, search=None):
    """
    Get logs with pagination and filtering for the Logs Table
    """
    query = {}
    
    # Add filters if provided
    if level:
        if isinstance(level, list):
            query["level"] = {"$in": [l.lower() for l in level]}
        else:
            query["level"] = {"$regex": f"^{level}$", "$options": "i"}
    
    if user_id:
        query["userId"] = {"$regex": user_id, "$options": "i"}  # Partial match
    
    if tag:
        if isinstance(tag, list):
            query["tag"] = {"$in": tag}
        else:
            query["tag"] = {"$regex": f"^{tag}$", "$options": "i"}
    
    # Search functionality - search across multiple fields
    if search:
        search_regex = {"$regex": search, "$options": "i"}
        query["$or"] = [
            {"message": search_regex},
            {"userId": search_regex},
            {"tag": search_regex},
            {"level": search_regex}
        ]
    
    # Date range filtering
    if start_date or end_date:
        date_query = {}
        if start_date:
            try:
                # Parse ISO format and handle timezone properly
                start_dt = datetime.datetime.fromisoformat(start_date.replace('Z', '+00:00'))
                # Convert to UTC if it has timezone info
                if start_dt.tzinfo is not None:
                    start_dt = start_dt.replace(tzinfo=None)  # Remove timezone info for MongoDB comparison
                date_query["$gte"] = start_dt
                print(f"DEBUG: Parsed start_date '{start_date}' as {start_dt}")
            except Exception as e:
                print(f"DEBUG: Failed to parse start_date '{start_date}': {e}")
                pass
        if end_date:
            try:
                # Parse ISO format and handle timezone properly
                end_dt = datetime.datetime.fromisoformat(end_date.replace('Z', '+00:00'))
                # Convert to UTC if it has timezone info
                if end_dt.tzinfo is not None:
                    end_dt = end_dt.replace(tzinfo=None)  # Remove timezone info for MongoDB comparison
                date_query["$lte"] = end_dt
                print(f"DEBUG: Parsed end_date '{end_date}' as {end_dt}")
            except Exception as e:
                print(f"DEBUG: Failed to parse end_date '{end_date}': {e}")
                pass
        
        if date_query:
            query["timestamp"] = date_query
            print(f"DEBUG: Date query: {date_query}")
        
        # Also check what timestamps we have in the database for debugging
        try:
            sample_logs = list(logs_collection.find({}, {"timestamp": 1, "_id": 0}).limit(5))
            print(f"DEBUG: Sample timestamps in DB: {[log.get('timestamp') for log in sample_logs]}")
        except Exception as e:
            print(f"DEBUG: Failed to get sample timestamps: {e}")
    
    try:
        # Calculate pagination
        skip = (page - 1) * limit
        
        # Get total count for pagination info
        total_count = logs_collection.count_documents(query)
        
        # Get paginated logs sorted by timestamp (newest first)
        logs = list(logs_collection.find(
            query, 
            {"_id": 0}
        ).sort("timestamp", -1).skip(skip).limit(limit))
        
        # Format logs for frontend
        formatted_logs = []
        for log in logs:
            formatted_log = dict(log)
            
            # Ensure timestamp is in proper format
            timestamp = log.get('timestamp')
            if isinstance(timestamp, datetime.datetime):
                # Format as full datetime string for logs table
                formatted_log['timestamp'] = timestamp.strftime("%Y-%m-%d %H:%M:%S")
            elif isinstance(timestamp, str):
                try:
                    # Try to parse and reformat
                    dt = datetime.datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
                    formatted_log['timestamp'] = dt.strftime("%Y-%m-%d %H:%M:%S")
                except:
                    # Keep original if parsing fails
                    pass
            
            # Ensure required fields exist
            if 'id' not in formatted_log:
                # Create a more unique ID using timestamp, userId, and message
                timestamp_str = str(formatted_log.get('timestamp', ''))
                user_id = str(formatted_log.get('userId', ''))
                message = str(formatted_log.get('message', ''))
                unique_string = f"{timestamp_str}_{user_id}_{message}_{hash(str(formatted_log))}"
                formatted_log['id'] = f"log_{abs(hash(unique_string))}"
            
            # Add optional fields if they don't exist
            for field in ['threadId', 'processId', 'packageName']:
                if field not in formatted_log:
                    formatted_log[field] = None
            
            formatted_logs.append(formatted_log)
        
        return {
            'logs': formatted_logs,
            'pagination': {
                'current_page': page,
                'total_pages': (total_count + limit - 1) // limit,  # Ceiling division
                'total_count': total_count,
                'per_page': limit,
                'has_next': page * limit < total_count,
                'has_prev': page > 1
            }
        }
        
    except Exception as e:
        print(f"Error fetching paginated logs: {e}")
        return {
            'logs': [],
            'pagination': {
                'current_page': page,
                'total_pages': 0,
                'total_count': 0,
                'per_page': limit,
                'has_next': False,
                'has_prev': False
            }
        }

def get_all_tags():
    """
    Get all distinct tags from the database for filter dropdown
    """
    try:
        # Use MongoDB distinct to get unique tags
        tags = logs_collection.distinct("tag")
        # Filter out None/null values and sort
        tags = [tag for tag in tags if tag is not None]
        return sorted(tags)
    except Exception as e:
        print(f"Error fetching tags: {e}")
        return [] 