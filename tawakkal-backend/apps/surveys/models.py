from django.db import models
from django.conf import settings
from apps.core.models import BaseModel
from apps.media.models import Media

class SurveyStatus(models.TextChoices):
    DRAFT = 'draft', 'Draft'
    PUBLISHED = 'published', 'Published'
    ARCHIVED = 'archived', 'Archived'

class QuestionType(models.TextChoices):
    SHORT_TEXT = 'short_text', 'Short Text'
    LONG_TEXT = 'long_text', 'Long Text'
    EMAIL = 'email', 'Email'
    PHONE = 'phone', 'Phone'
    NUMBER = 'number', 'Number'
    DATE = 'date', 'Date'
    TIME = 'time', 'Time'
    RATING = 'rating', 'Rating'
    YES_NO = 'yes_no', 'Yes/No'
    SINGLE_CHOICE = 'single_choice', 'Single Choice'
    MULTIPLE_CHOICE = 'multiple_choice', 'Multiple Choice'
    DROPDOWN = 'dropdown', 'Dropdown'
    FILE_UPLOAD = 'file_upload', 'File Upload'

class Survey(BaseModel):
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=SurveyStatus.choices, default=SurveyStatus.DRAFT)
    is_active = models.BooleanField(default=True)
    
    # Settings
    anonymous_allowed = models.BooleanField(default=True)
    one_response_per_user = models.BooleanField(default=False)
    
    # Scheduling
    published_at = models.DateTimeField(null=True, blank=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    
    def __str__(self):
        return self.title

class SurveySection(BaseModel):
    survey = models.ForeignKey(Survey, on_delete=models.CASCADE, related_name='sections')
    title = models.CharField(max_length=255, blank=True)
    description = models.TextField(blank=True)
    sort_order = models.IntegerField(default=0)
    
    class Meta:
        ordering = ['sort_order']

    def __str__(self):
        return f"{self.survey.title} - {self.title or 'Section'}"

class Question(BaseModel):
    section = models.ForeignKey(SurveySection, on_delete=models.CASCADE, related_name='questions', null=True, blank=True)
    survey = models.ForeignKey(Survey, on_delete=models.CASCADE, related_name='questions') # Direct link for easier querying
    text = models.CharField(max_length=500)
    type = models.CharField(max_length=20, choices=QuestionType.choices)
    help_text = models.CharField(max_length=255, blank=True)
    placeholder = models.CharField(max_length=255, blank=True)
    is_required = models.BooleanField(default=True)
    sort_order = models.IntegerField(default=0)
    
    # Validation Rules stored as JSON
    validation_rules = models.JSONField(default=dict, blank=True)
    
    # Conditional visibility logic
    conditional_logic = models.JSONField(default=dict, blank=True)
    
    class Meta:
        ordering = ['sort_order']

    def __str__(self):
        return self.text

class QuestionChoice(BaseModel):
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='choices')
    text = models.CharField(max_length=255)
    sort_order = models.IntegerField(default=0)
    
    class Meta:
        ordering = ['sort_order']

class SurveyResponse(BaseModel):
    survey = models.ForeignKey(Survey, on_delete=models.CASCADE, related_name='responses')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='survey_responses')
    session_id = models.CharField(max_length=255, blank=True) # For anonymous tracking
    
    is_completed = models.BooleanField(default=False)
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-started_at']

class SurveyAnswer(BaseModel):
    response = models.ForeignKey(SurveyResponse, on_delete=models.CASCADE, related_name='answers')
    question = models.ForeignKey(Question, on_delete=models.SET_NULL, null=True, related_name='answers')
    
    # Immutable snapshot data
    question_text = models.CharField(max_length=500, blank=True)
    
    # Depending on question type, store the value
    text_value = models.TextField(blank=True)
    number_value = models.DecimalField(max_digits=15, decimal_places=4, null=True, blank=True)
    date_value = models.DateField(null=True, blank=True)
    time_value = models.TimeField(null=True, blank=True)
    boolean_value = models.BooleanField(null=True, blank=True)
    
    # For choice-based questions
    choices = models.ManyToManyField(QuestionChoice, blank=True)
    choice_texts = models.JSONField(default=list, blank=True) # Snapshot of choice texts
    
    # For file uploads
    file = models.ForeignKey(Media, on_delete=models.SET_NULL, null=True, blank=True)

class SurveyInvitation(BaseModel):
    survey = models.ForeignKey(Survey, on_delete=models.CASCADE, related_name='invitations')
    email = models.EmailField()
    token = models.CharField(max_length=100, unique=True)
    is_used = models.BooleanField(default=False)
    sent_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(null=True, blank=True)

class SurveyTimeline(BaseModel):
    survey = models.ForeignKey(Survey, on_delete=models.CASCADE, related_name='timeline')
    action = models.CharField(max_length=100)
    details = models.JSONField(default=dict, blank=True)
