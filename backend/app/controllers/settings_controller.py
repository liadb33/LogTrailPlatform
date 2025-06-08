from app.db import db

# Collection for storing settings
settings_collection = db["settings"]

def get_retention_settings():
    """Get the current retention settings from database"""
    try:
        # Try to get existing settings
        settings = settings_collection.find_one({"type": "retention"})
        
        if settings:
            return {
                "retentionPeriod": settings.get("retentionPeriod", "30 days"),
                "autoDeleteOldLogs": settings.get("autoDeleteOldLogs", True)
            }
        else:
            # Return default settings if none exist
            default_settings = {
                "retentionPeriod": "30 days",
                "autoDeleteOldLogs": True
            }
            
            # Save default settings to database
            settings_collection.insert_one({
                "type": "retention",
                **default_settings
            })
            
            return default_settings
            
    except Exception as e:
        raise Exception(f"Failed to get retention settings: {str(e)}")

def update_retention_settings(retention_period, auto_delete_old_logs):
    """Update the retention settings in database"""
    try:
        # Update or insert retention settings
        result = settings_collection.update_one(
            {"type": "retention"},
            {
                "$set": {
                    "retentionPeriod": retention_period,
                    "autoDeleteOldLogs": auto_delete_old_logs
                }
            },
            upsert=True  # Create if doesn't exist
        )
        
        return {
            "retentionPeriod": retention_period,
            "autoDeleteOldLogs": auto_delete_old_logs
        }
        
    except Exception as e:
        raise Exception(f"Failed to update retention settings: {str(e)}")

def get_live_console_settings():
    """Get the current live console settings from database"""
    try:
        # Try to get existing settings
        settings = settings_collection.find_one({"type": "live_console"})
        
        if settings:
            return {
                "autoRefreshInterval": settings.get("autoRefreshInterval", "10s"),
                "maxLogsToDisplay": settings.get("maxLogsToDisplay", "100")
            }
        else:
            # Return default settings if none exist
            default_settings = {
                "autoRefreshInterval": "10s",
                "maxLogsToDisplay": "100"
            }
            
            # Save default settings to database
            settings_collection.insert_one({
                "type": "live_console",
                **default_settings
            })
            
            return default_settings
            
    except Exception as e:
        raise Exception(f"Failed to get live console settings: {str(e)}")

def update_live_console_settings(auto_refresh_interval, max_logs_to_display):
    """Update the live console settings in database"""
    try:
        # Update or insert live console settings
        result = settings_collection.update_one(
            {"type": "live_console"},
            {
                "$set": {
                    "autoRefreshInterval": auto_refresh_interval,
                    "maxLogsToDisplay": max_logs_to_display
                }
            },
            upsert=True  # Create if doesn't exist
        )
        
        return {
            "autoRefreshInterval": auto_refresh_interval,
            "maxLogsToDisplay": max_logs_to_display
        }
        
    except Exception as e:
        raise Exception(f"Failed to update live console settings: {str(e)}") 