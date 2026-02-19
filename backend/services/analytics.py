import os
import json
from datetime import datetime, timedelta
from dotenv import load_dotenv

load_dotenv()

# Path to user data directory
USER_DATA_DIR = os.getenv("USER_DATA_DIR", "data/users")

async def get_user_analytics(user_id, time_period="week"):
    """
    Get user analytics for a specific time period.
    
    Args:
        user_id (str): The user ID
        time_period (str): The time period (day, week, month, year)
        
    Returns:
        dict: The user analytics
    """
    try:
        # Get user dashboard data
        dashboard_path = f"{USER_DATA_DIR}/{user_id}_dashboard.json"
        
        if not os.path.exists(dashboard_path):
            return {
                "message": "No analytics data available yet",
                "data": {}
            }
        
        with open(dashboard_path, "r") as f:
            dashboard_data = json.load(f)
        
        # Get user cravings data
        cravings_path = f"{USER_DATA_DIR}/{user_id}_cravings.json"
        
        if not os.path.exists(cravings_path):
            return {
                "message": "No cravings data available yet",
                "data": {}
            }
        
        with open(cravings_path, "r") as f:
            cravings_data = json.load(f)
        
        # Calculate time range
        now = datetime.now()
        
        if time_period == "day":
            start_date = now - timedelta(days=1)
        elif time_period == "week":
            start_date = now - timedelta(weeks=1)
        elif time_period == "month":
            start_date = now - timedelta(days=30)
        elif time_period == "year":
            start_date = now - timedelta(days=365)
        else:
            start_date = now - timedelta(weeks=1)  # Default to week
        
        # Filter cravings by date
        filtered_cravings = [
            c for c in cravings_data
            if datetime.fromisoformat(c.get("timestamp", "")) >= start_date
        ]
        
        # Calculate analytics
        total_cravings = len(filtered_cravings)
        
        # Count cravings by day
        cravings_by_day = {}
        for craving in filtered_cravings:
            date = datetime.fromisoformat(craving.get("timestamp", "")).strftime("%Y-%m-%d")
            cravings_by_day[date] = cravings_by_day.get(date, 0) + 1
        
        # Count cravings by trigger
        triggers = {}
        for craving in filtered_cravings:
            trigger = craving.get("trigger", "Unknown")
            triggers[trigger] = triggers.get(trigger, 0) + 1
        
        # Count cravings by intensity
        intensities = {
            "low": 0,
            "medium": 0,
            "high": 0
        }
        for craving in filtered_cravings:
            intensity = craving.get("intensity", "medium").lower()
            if intensity in intensities:
                intensities[intensity] += 1
        
        # Count cravings by coping strategy
        coping_strategies = {}
        for craving in filtered_cravings:
            strategy = craving.get("copingStrategy", "None")
            coping_strategies[strategy] = coping_strategies.get(strategy, 0) + 1
        
        # Calculate success rate
        successful_cravings = sum(1 for c in filtered_cravings if not c.get("smoked", False))
        success_rate = (successful_cravings / total_cravings * 100) if total_cravings > 0 else 0
        
        # Get quit date and days smoke-free
        quit_date = dashboard_data.get("quitDate", "")
        days_smoke_free = dashboard_data.get("daysSmokeFree", 0)
        
        # Get money saved
        money_saved = dashboard_data.get("moneySaved", 0)
        
        # Get health improvements
        health_improvements = dashboard_data.get("healthImprovements", [])
        
        # Create analytics object
        analytics = {
            "timePeriod": time_period,
            "totalCravings": total_cravings,
            "cravingsByDay": cravings_by_day,
            "triggers": triggers,
            "intensities": intensities,
            "copingStrategies": coping_strategies,
            "successRate": round(success_rate, 1),
            "quitDate": quit_date,
            "daysSmokeFree": days_smoke_free,
            "moneySaved": money_saved,
            "healthImprovements": health_improvements
        }
        
        return {
            "message": f"Analytics for the past {time_period}",
            "data": analytics
        }
    except Exception as e:
        print(f"Error getting user analytics: {str(e)}")
        return {
            "message": f"Error getting analytics: {str(e)}",
            "data": {}
        }

async def get_global_analytics():
    """
    Get global analytics across all users.
    
    Returns:
        dict: The global analytics
    """
    try:
        # Check if user directory exists
        if not os.path.exists(USER_DATA_DIR):
            return {
                "message": "No user data available",
                "data": {}
            }
        
        # Get all user files
        user_files = [f for f in os.listdir(USER_DATA_DIR) if f.endswith(".json") and not f.endswith("_plan.json") and not f.endswith("_cravings.json") and not f.endswith("_dashboard.json")]
        
        # Initialize analytics data
        total_users = len(user_files)
        total_days_smoke_free = 0
        total_money_saved = 0
        total_cravings = 0
        successful_cravings = 0
        
        # Process each user
        for user_file in user_files:
            user_id = user_file.replace(".json", "")
            
            # Get user dashboard data
            dashboard_path = f"{USER_DATA_DIR}/{user_id}_dashboard.json"
            if os.path.exists(dashboard_path):
                with open(dashboard_path, "r") as f:
                    dashboard_data = json.load(f)
                
                # Add to totals
                total_days_smoke_free += dashboard_data.get("daysSmokeFree", 0)
                total_money_saved += dashboard_data.get("moneySaved", 0)
            
            # Get user cravings data
            cravings_path = f"{USER_DATA_DIR}/{user_id}_cravings.json"
            if os.path.exists(cravings_path):
                with open(cravings_path, "r") as f:
                    cravings_data = json.load(f)
                
                # Add to totals
                total_cravings += len(cravings_data)
                successful_cravings += sum(1 for c in cravings_data if not c.get("smoked", False))
        
        # Calculate averages
        avg_days_smoke_free = total_days_smoke_free / total_users if total_users > 0 else 0
        avg_money_saved = total_money_saved / total_users if total_users > 0 else 0
        avg_cravings = total_cravings / total_users if total_users > 0 else 0
        success_rate = (successful_cravings / total_cravings * 100) if total_cravings > 0 else 0
        
        # Create analytics object
        analytics = {
            "totalUsers": total_users,
            "avgDaysSmokeFree": round(avg_days_smoke_free, 1),
            "avgMoneySaved": round(avg_money_saved, 2),
            "avgCravings": round(avg_cravings, 1),
            "successRate": round(success_rate, 1),
            "totalDaysSmokeFree": total_days_smoke_free,
            "totalMoneySaved": total_money_saved,
            "totalCravings": total_cravings,
            "successfulCravings": successful_cravings
        }
        
        return {
            "message": "Global analytics across all users",
            "data": analytics
        }
    except Exception as e:
        print(f"Error getting global analytics: {str(e)}")
        return {
            "message": f"Error getting global analytics: {str(e)}",
            "data": {}
        } 