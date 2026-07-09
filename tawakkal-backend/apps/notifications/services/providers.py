from abc import ABC, abstractmethod
from typing import Dict, Any

class BaseProvider(ABC):
    @abstractmethod
    def send(self, notification_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Sends the notification via the specific provider.
        Returns a dict containing response status and payload.
        """
        pass

class DummyEmailProvider(BaseProvider):
    def send(self, notification_data: Dict[str, Any]) -> Dict[str, Any]:
        # Simulate sending email
        return {
            'status': 'SUCCESS',
            'provider': 'DummyEmail',
            'response': {'message': 'Email sent successfully'}
        }

class DummySMSProvider(BaseProvider):
    def send(self, notification_data: Dict[str, Any]) -> Dict[str, Any]:
        # Simulate sending SMS
        return {
            'status': 'SUCCESS',
            'provider': 'DummySMS',
            'response': {'message': 'SMS sent successfully'}
        }

class DummyPushProvider(BaseProvider):
    def send(self, notification_data: Dict[str, Any]) -> Dict[str, Any]:
        # Simulate sending Push Notification
        return {
            'status': 'SUCCESS',
            'provider': 'DummyPush',
            'response': {'message': 'Push sent successfully'}
        }

class ProviderFactory:
    @staticmethod
    def get_provider(channel: str) -> BaseProvider:
        if channel == 'EMAIL':
            return DummyEmailProvider()
        elif channel == 'SMS':
            return DummySMSProvider()
        elif channel == 'PUSH':
            return DummyPushProvider()
        return None
