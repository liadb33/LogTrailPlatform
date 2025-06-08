from flask import Blueprint, request, jsonify
from app.controllers.log_controller import get_filtered_logs, create_log, get_all_logs_controller, get_dashboard_stats, get_recent_logs_controller, get_logs_table_controller, get_tags_controller

log_bp = Blueprint("logs", __name__)

@log_bp.route("/", methods=["GET"])
def get_logs():
    try:
        # Extract filter parameters from request
        user_id = request.args.get("userId")
        level = request.args.get("level")
        start = request.args.get("start")
        end = request.args.get("end")
        tag = request.args.get("tag")
        package_name = request.args.get("packageName")
        
        # Get logs through controller
        logs = get_filtered_logs(user_id, level, start, end, tag, package_name)
        return jsonify(logs), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@log_bp.route("/all", methods=["GET"])
def get_all_logs():
    try:
        logs = get_all_logs_controller()
        return jsonify(logs), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@log_bp.route("/recent", methods=["GET"])
def get_recent_logs():
    try:
        # Extract query parameters
        limit = min(int(request.args.get("limit", 100)), 200)  # Max 200 logs
        user_id = request.args.get("userId")
        levels = request.args.get("levels")  # Comma-separated levels
        
        # Get recent logs through controller
        logs = get_recent_logs_controller(limit=limit, user_id=user_id, levels=levels)
        return jsonify(logs), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@log_bp.route("/stats", methods=["GET"])
def get_stats():
    try:
        stats_data = get_dashboard_stats()
        return jsonify(stats_data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@log_bp.route("/", methods=["POST"])
def add_log():
    try:
        data = request.get_json()
        create_log(data)
        return jsonify({"message": "Log stored"}), 201
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@log_bp.route("/table", methods=["GET"])
def get_logs_table():
    try:
        # Extract query parameters
        page = int(request.args.get("page", 1))
        limit = int(request.args.get("limit", 10))
        levels = request.args.get("levels")  # Comma-separated levels
        user_id = request.args.get("userId")
        tags = request.args.get("tags")  # Comma-separated tags
        start_date = request.args.get("startDate")
        end_date = request.args.get("endDate")
        search = request.args.get("search")  # Search term for message content
        
        # Get logs through controller
        result = get_logs_table_controller(
            page=page,
            limit=limit,
            levels=levels,
            user_id=user_id,
            tags=tags,
            start_date=start_date,
            end_date=end_date,
            search=search
        )
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@log_bp.route("/tags", methods=["GET"])
def get_tags():
    try:
        tags_data = get_tags_controller()
        return jsonify(tags_data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
