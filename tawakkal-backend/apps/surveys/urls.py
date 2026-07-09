from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.surveys.views.survey_views import (
    SurveyViewSet, SurveySectionViewSet, QuestionViewSet,
    QuestionChoiceViewSet, SurveyResponseViewSet
)

router = DefaultRouter()
router.register(r'surveys', SurveyViewSet, basename='survey')
router.register(r'sections', SurveySectionViewSet, basename='survey-section')
router.register(r'questions', QuestionViewSet, basename='question')
router.register(r'choices', QuestionChoiceViewSet, basename='question-choice')
router.register(r'responses', SurveyResponseViewSet, basename='survey-response')

urlpatterns = [
    path('', include(router.urls)),
]
