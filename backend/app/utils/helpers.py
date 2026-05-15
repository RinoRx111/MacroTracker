"""Helper utilities."""

from datetime import datetime, date, timedelta
from typing import List, Dict, Any


def get_date_range(
    start_date: date,
    end_date: date
) -> List[date]:
    """Get list of dates between start and end date."""
    dates = []
    current = start_date
    while current <= end_date:
        dates.append(current)
        current += timedelta(days=1)
    return dates


def group_by_date(items: List[Dict[str, Any]], date_key: str = "logged_date") -> Dict[date, List[Dict]]:
    """Group items by date."""
    grouped = {}
    for item in items:
        item_date = item.get(date_key)
        if item_date not in grouped:
            grouped[item_date] = []
        grouped[item_date].append(item)
    return grouped


def calculate_days_ago(target_date: date) -> int:
    """Calculate how many days ago a date was."""
    return (date.today() - target_date).days


def format_date(d: date) -> str:
    """Format date to readable string."""
    return d.strftime("%B %d, %Y")


def format_datetime(dt: datetime) -> str:
    """Format datetime to readable string."""
    return dt.strftime("%B %d, %Y %I:%M %p")


def round_to_nearest(value: float, nearest: float = 0.1) -> float:
    """Round value to nearest increment."""
    return round(value / nearest) * nearest
