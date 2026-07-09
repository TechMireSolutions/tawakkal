import traceback
from django.http import JsonResponse

class TracebackMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        return self.get_response(request)

    def process_exception(self, request, exception):
        tb = traceback.format_exc()
        print("TRACEBACK FROM MIDDLEWARE:", tb)
        return JsonResponse({'error': str(exception), 'traceback': tb}, status=500)
