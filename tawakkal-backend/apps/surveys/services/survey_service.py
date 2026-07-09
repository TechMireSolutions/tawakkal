from django.utils import timezone
from apps.surveys.models import Survey, SurveyStatus, SurveyTimeline, Question, QuestionChoice, SurveySection
from apps.surveys.repositories.survey_repository import SurveyRepository

class SurveyService:

    @classmethod
    def publish_survey(cls, survey):
        survey.status = SurveyStatus.PUBLISHED
        survey.published_at = timezone.now()
        survey.save()
        SurveyTimeline.objects.create(survey=survey, action="Published")
        
        # Module 15: Notify Survey Published (Could go to all users, but omitting to prevent spam, or send to creators)
        from apps.notifications.services.notification_service import NotificationService
        if survey.created_by:
            NotificationService.dispatch(
                recipient=survey.created_by,
                template_code='SURVEY_PUBLISHED',
                variables={'survey_title': survey.title},
                related_object=survey,
                sender=survey.created_by
            )
        
        return survey

    @classmethod
    def unpublish_survey(cls, survey):
        survey.status = SurveyStatus.DRAFT
        survey.save()
        SurveyTimeline.objects.create(survey=survey, action="Unpublished")
        return survey

    @classmethod
    def duplicate_survey(cls, survey):
        # Deep clone logic
        new_survey = Survey.objects.create(
            title=f"Copy of {survey.title}",
            description=survey.description,
            status=SurveyStatus.DRAFT,
            anonymous_allowed=survey.anonymous_allowed,
            one_response_per_user=survey.one_response_per_user
        )
        
        # Clone Sections & Questions
        for section in survey.sections.all():
            new_section = SurveySection.objects.create(
                survey=new_survey,
                title=section.title,
                description=section.description,
                sort_order=section.sort_order
            )
            for q in section.questions.all():
                new_q = Question.objects.create(
                    survey=new_survey,
                    section=new_section,
                    text=q.text,
                    type=q.type,
                    help_text=q.help_text,
                    placeholder=q.placeholder,
                    is_required=q.is_required,
                    sort_order=q.sort_order,
                    validation_rules=q.validation_rules,
                    conditional_logic=q.conditional_logic
                )
                for choice in q.choices.all():
                    QuestionChoice.objects.create(
                        question=new_q,
                        text=choice.text,
                        sort_order=choice.sort_order
                    )
                    
        # Clone Survey-level Questions (not in sections)
        for q in survey.questions.filter(section__isnull=True):
            new_q = Question.objects.create(
                survey=new_survey,
                text=q.text,
                type=q.type,
                help_text=q.help_text,
                placeholder=q.placeholder,
                is_required=q.is_required,
                sort_order=q.sort_order,
                validation_rules=q.validation_rules,
                conditional_logic=q.conditional_logic
            )
            for choice in q.choices.all():
                QuestionChoice.objects.create(
                    question=new_q,
                    text=choice.text,
                    sort_order=choice.sort_order
                )
                
        SurveyTimeline.objects.create(survey=new_survey, action="Created via Duplication")
        return new_survey
        
    @classmethod
    def process_submission(cls, survey, user, session_id, answers_data):
        # Check permissions
        if survey.status != SurveyStatus.PUBLISHED:
            raise ValueError("Survey is not published.")
            
        if not survey.anonymous_allowed and not user:
            raise ValueError("Anonymous responses are not allowed.")
            
        if survey.one_response_per_user:
            from apps.surveys.models import SurveyResponse
            if user and SurveyResponse.objects.filter(survey=survey, user=user).exists():
                raise ValueError("You have already completed this survey.")
            elif not user and SurveyResponse.objects.filter(survey=survey, session_id=session_id).exists():
                raise ValueError("You have already completed this survey.")
                
        response = SurveyRepository.save_response(survey, user, session_id, answers_data)
        
        # Module 15: Notify Survey Completed
        if user:
            from apps.notifications.services.notification_service import NotificationService
            NotificationService.dispatch(
                recipient=user,
                template_code='SURVEY_COMPLETED',
                variables={'survey_title': survey.title, 'customer_name': user.first_name},
                related_object=response,
                sender=user
            )
            
        return response
