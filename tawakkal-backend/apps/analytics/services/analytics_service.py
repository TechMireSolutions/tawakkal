from ..repositories.analytics_repository import AnalyticsRepository

class AnalyticsService:
    @classmethod
    def get_dashboard_stats(cls):
        return AnalyticsRepository.get_dashboard_aggregates()

    @classmethod
    def get_recent_activity(cls, limit=10):
        return AnalyticsRepository.get_recent_activity(limit=limit)

    @classmethod
    def get_analytics_overview(cls, period='30d'):
        return AnalyticsRepository.get_overview(period=period)
