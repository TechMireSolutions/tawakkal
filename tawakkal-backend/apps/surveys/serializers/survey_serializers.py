from rest_framework import serializers
from apps.surveys.models import (
    Survey, SurveySection, Question, QuestionChoice,
    SurveyResponse, SurveyAnswer, SurveyTimeline
)

class QuestionChoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuestionChoice
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'is_deleted', 'deleted_at']

class QuestionSerializer(serializers.ModelSerializer):
    choices = QuestionChoiceSerializer(many=True, read_only=True)
    
    class Meta:
        model = Question
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'is_deleted', 'deleted_at']

class SurveySectionSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=True)
    
    class Meta:
        model = SurveySection
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'is_deleted', 'deleted_at']

class SurveySerializer(serializers.ModelSerializer):
    class Meta:
        model = Survey
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'is_deleted', 'deleted_at']

class SurveyDetailSerializer(SurveySerializer):
    sections = SurveySectionSerializer(many=True, read_only=True)
    questions = serializers.SerializerMethodField()

    def get_questions(self, obj):
        # Only return questions that are NOT in a section (direct survey questions)
        qs = obj.questions.filter(section__isnull=True)
        return QuestionSerializer(qs, many=True).data

class SurveyAnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = SurveyAnswer
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'is_deleted', 'deleted_at']

class SurveyResponseSerializer(serializers.ModelSerializer):
    answers = SurveyAnswerSerializer(many=True, read_only=True)
    
    class Meta:
        model = SurveyResponse
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'is_deleted', 'deleted_at']

class SurveyTimelineSerializer(serializers.ModelSerializer):
    class Meta:
        model = SurveyTimeline
        fields = '__all__'

# Serializer for Submission Payload
class SubmitAnswerSerializer(serializers.Serializer):
    question_id = serializers.UUIDField()
    text_value = serializers.CharField(required=False, allow_blank=True)
    number_value = serializers.DecimalField(max_digits=15, decimal_places=4, required=False, allow_null=True)
    date_value = serializers.DateField(required=False, allow_null=True)
    time_value = serializers.TimeField(required=False, allow_null=True)
    boolean_value = serializers.BooleanField(required=False, allow_null=True)
    choice_ids = serializers.ListField(child=serializers.UUIDField(), required=False)
    file_id = serializers.UUIDField(required=False, allow_null=True)

class SubmitSurveySerializer(serializers.Serializer):
    session_id = serializers.CharField(required=False, allow_blank=True)
    answers = SubmitAnswerSerializer(many=True)
