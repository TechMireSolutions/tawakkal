import uuid
from rest_framework.response import Response

def format_api_response(success=True, message="", data=None, errors=None, status_code=200):
    """
    Standardizes all API responses to a uniform schema.
    """
    return Response({
        'success': success,
        'message': message,
        'data': data,
        'errors': errors
    }, status=status_code)

def is_valid_uuid(val):
    try:
        uuid.UUID(str(val))
        return True
    except ValueError:
        return False
