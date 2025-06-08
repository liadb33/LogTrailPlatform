from flask import Blueprint, request, jsonify
from app.controllers.settings_controller import (
    get_retention_settings, 
    update_retention_settings,
    get_live_console_settings,
    update_live_console_settings
)

settings_bp = Blueprint("settings", __name__)

@settings_bp.route("/retention", methods=["GET"])
def get_retention_settings_route():
    """Get current retention settings"""
    try:
        settings = get_retention_settings()
        return jsonify(settings), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@settings_bp.route("/retention", methods=["PUT"])
def update_retention_settings_route():
    """Update retention settings"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({"error": "No data provided"}), 400
        
        retention_period = data.get("retentionPeriod")
        auto_delete_old_logs = data.get("autoDeleteOldLogs")
        
        if retention_period is None or auto_delete_old_logs is None:
            return jsonify({
                "error": "Both retentionPeriod and autoDeleteOldLogs are required"
            }), 400
        
        # Validate retention period
        valid_periods = ["7 days", "30 days", "90 days"]
        if retention_period not in valid_periods:
            return jsonify({
                "error": f"Invalid retention period. Must be one of: {valid_periods}"
            }), 400
        
        # Validate auto_delete_old_logs is boolean
        if not isinstance(auto_delete_old_logs, bool):
            return jsonify({
                "error": "autoDeleteOldLogs must be a boolean value"
            }), 400
        
        updated_settings = update_retention_settings(retention_period, auto_delete_old_logs)
        return jsonify(updated_settings), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@settings_bp.route("/live-console", methods=["GET"])
def get_live_console_settings_route():
    """Get current live console settings"""
    try:
        settings = get_live_console_settings()
        return jsonify(settings), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@settings_bp.route("/live-console", methods=["PUT"])
def update_live_console_settings_route():
    """Update live console settings"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({"error": "No data provided"}), 400
        
        auto_refresh_interval = data.get("autoRefreshInterval")
        max_logs_to_display = data.get("maxLogsToDisplay")
        
        if auto_refresh_interval is None or max_logs_to_display is None:
            return jsonify({
                "error": "Both autoRefreshInterval and maxLogsToDisplay are required"
            }), 400
        
        # Validate auto refresh interval
        valid_intervals = ["5s", "10s", "30s"]
        if auto_refresh_interval not in valid_intervals:
            return jsonify({
                "error": f"Invalid auto refresh interval. Must be one of: {valid_intervals}"
            }), 400
        
        # Validate max logs to display
        valid_max_logs = ["100", "500", "1000"]
        if max_logs_to_display not in valid_max_logs:
            return jsonify({
                "error": f"Invalid max logs to display. Must be one of: {valid_max_logs}"
            }), 400
        
        updated_settings = update_live_console_settings(auto_refresh_interval, max_logs_to_display)
        return jsonify(updated_settings), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500 