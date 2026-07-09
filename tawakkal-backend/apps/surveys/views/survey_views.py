from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, AllowAny
from drf_spectacular.utils import extend_schema, extend_schema_view
from django.db.models import Prefetch

from apps.core.utils import format_api_response
from apps.users.permissions import HasModulePermission
from apps.surveys.models import (
    Survey, SurveySection, Question, QuestionChoice, SurveyResponse
)
from apps.surveys.serializers.survey_serializers import (
    SurveySerializer, SurveyDetailSerializer, SurveySectionSerializer,
    QuestionSerializer, QuestionChoiceSerializer, SurveyResponseSerializer,
    SubmitSurveySerializer
)
from apps.surveys.services.survey_service import SurveyService
from apps.surveys.repositories.survey_repository import SurveyRepository

@extend_schema_view(
    list=extend_schema(summary="List Surveys"),
    create=extend_schema(summary="Create Survey"),
    retrieve=extend_schema(summary="Retrieve Survey", responses={200: SurveyDetailSerializer}),
    update=extend_schema(summary="Update Survey"),
    partial_update=extend_schema(summary="Partially Update Survey"),
    destroy=extend_schema(summary="Delete Survey"),
)
class SurveyViewSet(viewsets.ModelViewSet):
    queryset = Survey.objects.all()
    serializer_class = SurveySerializer
    permission_classes = [IsAuthenticated, HasModulePermission]
    module_name = 'surveys'

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return SurveyDetailSerializer
        return super().get_serializer_class()

    def get_queryset(self):
        if self.action == 'retrieve':
            return Survey.objects.prefetch_related(
                'sections__questions__choices',
                Prefetch('questions', queryset=Question.objects.filter(section__isnull=True).prefetch_related('choices'))
            )
        return super().get_queryset()

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(queryset, many=True)
        return format_api_response(success=True, data=serializer.data)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return format_api_response(success=True, data=serializer.data)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return format_api_response(success=True, data=serializer.data, status_code=status.HTTP_201_CREATED)
        return format_api_response(success=False, message="Validation Error", errors=serializer.errors, status_code=status.HTTP_400_BAD_REQUEST)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return format_api_response(success=True, data=serializer.data)
        return format_api_response(success=False, message="Validation Error", errors=serializer.errors, status_code=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.soft_delete()
        return format_api_response(success=True, message="Successfully deleted.")

    @extend_schema(summary="Publish Survey")
    @action(detail=True, methods=['post'])
    def publish(self, request, pk=None):
        survey = self.get_object()
        survey = SurveyService.publish_survey(survey)
        return format_api_response(success=True, data=SurveySerializer(survey).data, message="Survey published successfully.")

    @extend_schema(summary="Unpublish Survey")
    @action(detail=True, methods=['post'])
    def unpublish(self, request, pk=None):
        survey = self.get_object()
        survey = SurveyService.unpublish_survey(survey)
        return format_api_response(success=True, data=SurveySerializer(survey).data, message="Survey unpublished successfully.")

    @extend_schema(summary="Duplicate Survey")
    @action(detail=True, methods=['post'])
    def duplicate(self, request, pk=None):
        survey = self.get_object()
        new_survey = SurveyService.duplicate_survey(survey)
        return format_api_response(success=True, data=SurveySerializer(new_survey).data, message="Survey duplicated successfully.")

    @extend_schema(summary="Survey Statistics")
    @action(detail=True, methods=['get'])
    def statistics(self, request, pk=None):
        survey = self.get_object()
        stats = SurveyRepository.get_statistics(survey.id)
        return format_api_response(success=True, data=stats)

    @extend_schema(
        summary="Submit Survey Response",
        request=SubmitSurveySerializer,
        responses={201: SurveyResponseSerializer}
    )
    @action(detail=True, methods=['post'], permission_classes=[AllowAny])
    def submit(self, request, pk=None):
        survey = self.get_object()
        
        # User resolving
        user = request.user if request.user.is_authenticated else None
        
        serializer = SubmitSurveySerializer(data=request.data)
        if serializer.is_valid():
            data = serializer.validated_data
            try:
                response = SurveyService.process_submission(
                    survey=survey,
                    user=user,
                    session_id=data.get('session_id', ''),
                    answers_data=data['answers']
                )
                return format_api_response(success=True, data=SurveyResponseSerializer(response).data, status_code=status.HTTP_201_CREATED)
            except ValueError as e:
                return format_api_response(success=False, message=str(e), status_code=status.HTTP_400_BAD_REQUEST)
        return format_api_response(success=False, message="Validation Error", errors=serializer.errors, status_code=status.HTTP_400_BAD_REQUEST)


@extend_schema_view(
    list=extend_schema(summary="List Survey Sections"),
    create=extend_schema(summary="Create Survey Section"),
    retrieve=extend_schema(summary="Retrieve Survey Section"),
    update=extend_schema(summary="Update Survey Section"),
    partial_update=extend_schema(summary="Partially Update Survey Section"),
    destroy=extend_schema(summary="Delete Survey Section"),
)
class SurveySectionViewSet(viewsets.ModelViewSet):
    queryset = SurveySection.objects.all()
    serializer_class = SurveySectionSerializer
    permission_classes = [IsAuthenticated, HasModulePermission]
    module_name = 'surveys'


@extend_schema_view(
    list=extend_schema(summary="List Questions"),
    create=extend_schema(summary="Create Question"),
    retrieve=extend_schema(summary="Retrieve Question"),
    update=extend_schema(summary="Update Question"),
    partial_update=extend_schema(summary="Partially Update Question"),
    destroy=extend_schema(summary="Delete Question"),
)
class QuestionViewSet(viewsets.ModelViewSet):
    queryset = Question.objects.all()
    serializer_class = QuestionSerializer
    permission_classes = [IsAuthenticated, HasModulePermission]
    module_name = 'surveys'


@extend_schema_view(
    list=extend_schema(summary="List Question Choices"),
    create=extend_schema(summary="Create Question Choice"),
    retrieve=extend_schema(summary="Retrieve Question Choice"),
    update=extend_schema(summary="Update Question Choice"),
    partial_update=extend_schema(summary="Partially Update Question Choice"),
    destroy=extend_schema(summary="Delete Question Choice"),
)
class QuestionChoiceViewSet(viewsets.ModelViewSet):
    queryset = QuestionChoice.objects.all()
    serializer_class = QuestionChoiceSerializer
    permission_classes = [IsAuthenticated, HasModulePermission]
    module_name = 'surveys'


@extend_schema_view(
    list=extend_schema(summary="List Survey Responses"),
    retrieve=extend_schema(summary="Retrieve Survey Response"),
    destroy=extend_schema(summary="Delete Survey Response"),
)
class SurveyResponseViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Responses are read-only for admins to view submissions.
    """
    queryset = SurveyResponse.objects.prefetch_related('answers', 'answers__choices')
    serializer_class = SurveyResponseSerializer
    permission_classes = [IsAuthenticated, HasModulePermission]
    module_name = 'surveys'

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        survey_id = request.query_params.get('survey_id')
        if survey_id:
            queryset = queryset.filter(survey_id=survey_id)
            
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(queryset, many=True)
        return format_api_response(success=True, data=serializer.data)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return format_api_response(success=True, data=serializer.data)
