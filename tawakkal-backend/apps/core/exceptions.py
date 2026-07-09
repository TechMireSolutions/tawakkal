from rest_framework.views import exception_handler
from rest_framework.response import Response

def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)
    
    if response is not None:
        custom_data = {
            'success': False,
            'message': 'An error occurred.',
            'data': None,
            'errors': {}
        }
        
        if hasattr(exc, 'detail'):
            if isinstance(exc.detail, dict):
                custom_data['errors'] = exc.detail
                custom_data['message'] = 'Validation failed.'
            elif isinstance(exc.detail, list):
                custom_data['errors'] = {'non_field_errors': exc.detail}
            else:
                custom_data['message'] = str(exc.detail)
        
        response.data = custom_data

    return response
