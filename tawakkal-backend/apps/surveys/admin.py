from django.contrib import admin
from .models import *

@admin.register(Survey)
class SurveyAdmin(admin.ModelAdmin):
    list_display = tuple(['id', 'title', 'description', 'status', 'is_active', 'anonymous_allowed', 'created_at', 'is_deleted'])
    search_fields = tuple(['title', 'status'])
    list_filter = tuple(['is_deleted', 'is_active', 'anonymous_allowed', 'one_response_per_user'])
    readonly_fields = ('created_at', 'updated_at', 'created_by', 'updated_by', 'deleted_at')

@admin.register(SurveySection)
class SurveySectionAdmin(admin.ModelAdmin):
    list_display = tuple(['id', 'survey', 'title', 'description', 'sort_order', 'created_at', 'is_deleted'])
    search_fields = tuple(['title'])
    list_filter = tuple(['is_deleted', 'survey__id'])
    readonly_fields = ('created_at', 'updated_at', 'created_by', 'updated_by', 'deleted_at')

@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = tuple(['id', 'section', 'survey', 'text', 'type', 'help_text', 'created_at', 'is_deleted'])
    search_fields = tuple(['text', 'type', 'help_text', 'placeholder'])
    list_filter = tuple(['is_deleted', 'section__id', 'survey__id', 'is_required'])
    readonly_fields = ('created_at', 'updated_at', 'created_by', 'updated_by', 'deleted_at')

@admin.register(QuestionChoice)
class QuestionChoiceAdmin(admin.ModelAdmin):
    list_display = tuple(['id', 'question', 'text', 'sort_order', 'created_at', 'is_deleted'])
    search_fields = tuple(['text'])
    list_filter = tuple(['is_deleted', 'question__id'])
    readonly_fields = ('created_at', 'updated_at', 'created_by', 'updated_by', 'deleted_at')

@admin.register(SurveyResponse)
class SurveyResponseAdmin(admin.ModelAdmin):
    list_display = tuple(['id', 'survey', 'user', 'session_id', 'is_completed', 'started_at', 'created_at', 'is_deleted'])
    search_fields = tuple(['session_id'])
    list_filter = tuple(['is_deleted', 'survey__id', 'user__id', 'is_completed'])
    readonly_fields = ('created_at', 'updated_at', 'created_by', 'updated_by', 'deleted_at')

@admin.register(SurveyAnswer)
class SurveyAnswerAdmin(admin.ModelAdmin):
    list_display = tuple(['id', 'response', 'question', 'question_text', 'text_value', 'number_value', 'created_at', 'is_deleted'])
    search_fields = tuple(['question_text'])
    list_filter = tuple(['is_deleted', 'response__id', 'question__id', 'boolean_value'])
    readonly_fields = ('created_at', 'updated_at', 'created_by', 'updated_by', 'deleted_at')

@admin.register(SurveyInvitation)
class SurveyInvitationAdmin(admin.ModelAdmin):
    list_display = tuple(['id', 'survey', 'email', 'token', 'is_used', 'sent_at', 'created_at', 'is_deleted'])
    search_fields = tuple(['email', 'token'])
    list_filter = tuple(['is_deleted', 'survey__id', 'is_used'])
    readonly_fields = ('created_at', 'updated_at', 'created_by', 'updated_by', 'deleted_at')

@admin.register(SurveyTimeline)
class SurveyTimelineAdmin(admin.ModelAdmin):
    list_display = tuple(['id', 'survey', 'action', 'details', 'created_at', 'is_deleted'])
    search_fields = tuple(['action'])
    list_filter = tuple(['is_deleted', 'survey__id'])
    readonly_fields = ('created_at', 'updated_at', 'created_by', 'updated_by', 'deleted_at')

