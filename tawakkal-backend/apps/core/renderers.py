from rest_framework.renderers import JSONRenderer

class StandardizedJSONRenderer(JSONRenderer):
    def render(self, data, accepted_media_type=None, renderer_context=None):
        response = renderer_context.get('response') if renderer_context else None
        status_code = response.status_code if response else 200

        # If data is already standardized (e.g. by our custom exception handler or manual wrapping), don't wrap it again
        if isinstance(data, dict) and 'success' in data and 'message' in data and ('data' in data or 'errors' in data):
            return super().render(data, accepted_media_type, renderer_context)

        # Build the standard response structure
        success = status_code < 400
        message = "Success" if success else "An error occurred"
        
        response_data = {
            'success': success,
            'message': message,
            'data': data if success else None,
            'errors': data if not success else None
        }

        return super().render(response_data, accepted_media_type, renderer_context)
