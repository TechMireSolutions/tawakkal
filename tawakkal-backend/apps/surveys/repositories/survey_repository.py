from django.db.models import Count, Avg, F, ExpressionWrapper, fields, Q
from apps.surveys.models import Survey, SurveyResponse, SurveyAnswer, Question, QuestionChoice

class SurveyRepository:
    
    @classmethod
    def get_survey_with_relations(cls, survey_id):
        return Survey.objects.prefetch_related(
            'sections',
            'sections__questions',
            'sections__questions__choices',
            'questions',
            'questions__choices'
        ).get(id=survey_id)
        
    @classmethod
    def get_statistics(cls, survey_id):
        # Base Responses stats
        responses = SurveyResponse.objects.filter(survey_id=survey_id, is_completed=True)
        total_responses = responses.count()
        
        in_progress = SurveyResponse.objects.filter(survey_id=survey_id, is_completed=False).count()
        completion_rate = 0
        if (total_responses + in_progress) > 0:
            completion_rate = (total_responses / (total_responses + in_progress)) * 100

        # Average completion time calculation
        avg_completion_time = responses.annotate(
            duration=ExpressionWrapper(
                F('completed_at') - F('started_at'),
                output_field=fields.DurationField()
            )
        ).aggregate(avg_duration=Avg('duration'))['avg_duration']

        # Choice distributions
        choice_distributions = {}
        answers = SurveyAnswer.objects.filter(
            response__survey_id=survey_id,
            response__is_completed=True,
            question__type__in=['single_choice', 'multiple_choice', 'dropdown', 'yes_no', 'rating']
        ).prefetch_related('choices')
        
        for ans in answers:
            q_id = str(ans.question_id)
            if q_id not in choice_distributions:
                choice_distributions[q_id] = {}
            
            for c in ans.choices.all():
                c_id = str(c.id)
                choice_distributions[q_id][c_id] = choice_distributions[q_id].get(c_id, 0) + 1

        return {
            'total_responses': total_responses,
            'in_progress': in_progress,
            'completion_rate': round(completion_rate, 2),
            'avg_completion_time': str(avg_completion_time) if avg_completion_time else None,
            'choice_distributions': choice_distributions
        }

    @classmethod
    def save_response(cls, survey, user, session_id, answers_data):
        response = SurveyResponse.objects.create(
            survey=survey,
            user=user,
            session_id=session_id,
            is_completed=True,
            completed_at=__import__('django.utils.timezone').utils.timezone.now()
        )
        
        for data in answers_data:
            question = Question.objects.get(id=data['question_id'])
            
            ans = SurveyAnswer.objects.create(
                response=response,
                question=question,
                question_text=question.text,
                text_value=data.get('text_value', ''),
                number_value=data.get('number_value'),
                date_value=data.get('date_value'),
                time_value=data.get('time_value'),
                boolean_value=data.get('boolean_value'),
                file_id=data.get('file_id')
            )
            
            choice_ids = data.get('choice_ids', [])
            if choice_ids:
                choices = QuestionChoice.objects.filter(id__in=choice_ids)
                ans.choices.set(choices)
                ans.choice_texts = list(choices.values_list('text', flat=True))
                ans.save()
                
        return response
