import datetime
from app.repositories.log_repository import (
    find_logs, insert_log, get_all_logs, get_recent_logs,
    get_total_logs_count, get_unique_users_count, get_error_logs_count,
    get_top_error_tag, get_recent_log_rate, get_peak_logs_info, get_hourly_log_activity,
    get_logs_with_pagination, get_all_tags
)

def get_filtered_logs(user_id=None, level=None, start=None, end=None, tag=None, package_name=None):
    """
    Get logs with optional filtering
    """
    query = {}

    if user_id:
        query["userId"] = user_id

    if level:
        query["level"] = level

    if tag:
        query["tag"] = tag
        
    if package_name:
        query["packageName"] = package_name

    if start or end:
        query["timestamp"] = {}
        if start:
            query["timestamp"]["$gte"] = datetime.datetime.fromisoformat(start)
        if end:
            query["timestamp"]["$lte"] = datetime.datetime.fromisoformat(end)

    return find_logs(query)

def get_all_logs_controller():
    """
    Get all logs from the system
    """
    return get_all_logs()

def get_recent_logs_controller(limit=100, user_id=None, levels=None):
    """
    Get recent logs for live console with filtering
    """
    try:
        # Convert levels to list if it's a comma-separated string
        if levels and isinstance(levels, str):
            levels = [level.strip() for level in levels.split(',') if level.strip()]
        
        logs = get_recent_logs(limit=limit, user_id=user_id, level=levels)
        
        # Ensure all logs have required fields for live console
        formatted_logs = []
        for log in logs:
            # Create a more unique ID if not present
            log_id = log.get('id')
            if not log_id:
                timestamp_str = str(log.get('timestamp', ''))
                user_id = str(log.get('userId', ''))
                message = str(log.get('message', ''))
                unique_string = f"{timestamp_str}_{user_id}_{message}_{hash(str(log))}"
                log_id = f"log_{abs(hash(unique_string))}"
            
            formatted_log = {
                'id': log_id,
                'timestamp': log.get('timestamp', '00:00:00'),
                'level': log.get('level', 'info').lower(),
                'message': log.get('message', 'No message'),
                'userId': log.get('userId')
            }
            formatted_logs.append(formatted_log)
        
        return formatted_logs
        
    except Exception as e:
        raise Exception(f"Error getting recent logs: {str(e)}")

def create_log(data):
    """
    Validate and create a new log entry with all fields
    """
    if not data:
        raise ValueError("Invalid log data")
    
    # Validate required fields
    required_fields = ["userId", "level", "message", "timestamp"]
    for field in required_fields:
        if field not in data or data[field] is None:
            raise ValueError(f"Missing required field: {field}")
    
    # Convert timestamp string to datetime object
    timestamp_str = data["timestamp"]
    try:
        # Try to parse the timestamp string to datetime object
        if isinstance(timestamp_str, str):
            # Handle common timestamp formats
            try:
                # Try ISO format first (e.g., "2023-12-15T10:30:45" or "2023-12-15T10:30:45.123Z")
                timestamp_dt = datetime.datetime.fromisoformat(timestamp_str.replace('Z', '+00:00'))
            except ValueError:
                try:
                    # Try format: "YYYY-MM-DD HH:mm:ss"
                    timestamp_dt = datetime.datetime.strptime(timestamp_str, "%Y-%m-%d %H:%M:%S")
                except ValueError:
                    try:
                        # Try format: "YYYY-MM-DD HH:mm:ss.fff"
                        timestamp_dt = datetime.datetime.strptime(timestamp_str, "%Y-%m-%d %H:%M:%S.%f")
                    except ValueError:
                        raise ValueError(f"Invalid timestamp format: {timestamp_str}. Expected formats: 'YYYY-MM-DD HH:mm:ss', 'YYYY-MM-DD HH:mm:ss.fff', or ISO format")
        elif isinstance(timestamp_str, datetime.datetime):
            # Already a datetime object
            timestamp_dt = timestamp_str
        else:
            raise ValueError(f"Timestamp must be a string or datetime object, got {type(timestamp_str)}")
    except Exception as e:
        raise ValueError(f"Error parsing timestamp: {str(e)}")
    
    # Create log entry with all possible fields
    log_entry = {
        "userId": data["userId"],
        "level": data["level"],
        "message": data["message"],
        "timestamp": timestamp_dt  # Store as datetime object
    }
    
    # Add optional fields if present
    optional_fields = ["tag", "threadId", "processId", "packageName"]
    for field in optional_fields:
        if field in data and data[field] is not None:
            log_entry[field] = data[field]
        
    return insert_log(log_entry)

def get_dashboard_stats():
    """
    Get comprehensive dashboard statistics
    """
    try:
        stats = {
            "errors": get_error_logs_count(),
            "totalLogs": get_total_logs_count(),
            "uniqueUsers": get_unique_users_count(),
            "topErrorTag": get_top_error_tag(),
            "logRate": get_recent_log_rate(),
            "peakLogs": get_peak_logs_info()
        }
        
        chart_data = get_hourly_log_activity()
        
        return {
            "stats": stats,
            "chartData": chart_data
        }
    except Exception as e:
        raise Exception(f"Error getting dashboard stats: {str(e)}")

def get_logs_table_controller(page=1, limit=10, levels=None, user_id=None, tags=None, start_date=None, end_date=None, search=None):
    """
    Get logs for the logs table with pagination and filtering
    """
    try:
        # Convert comma-separated strings to lists
        if levels and isinstance(levels, str):
            levels = [level.strip() for level in levels.split(',') if level.strip()]
        
        if tags and isinstance(tags, str):
            tags = [tag.strip() for tag in tags.split(',') if tag.strip()]
        
        # Validate page and limit
        page = max(1, int(page) if isinstance(page, (str, int)) else 1)
        limit = min(100, max(1, int(limit) if isinstance(limit, (str, int)) else 10))  # Max 100 per page
        
        result = get_logs_with_pagination(
            page=page,
            limit=limit,
            level=levels,
            user_id=user_id,
            tag=tags,
            start_date=start_date,
            end_date=end_date,
            search=search
        )
        
        return result
        
    except Exception as e:
        raise Exception(f"Error getting logs table data: {str(e)}")

def get_tags_controller():
    """
    Get all distinct tags for filter dropdown
    """
    try:
        tags = get_all_tags()
        return {"tags": tags}
    except Exception as e:
        raise Exception(f"Error getting tags: {str(e)}") 