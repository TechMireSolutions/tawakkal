from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from apps.users.models import User
from apps.surveys.models import Survey, SurveySection, Question, QuestionChoice, SurveyStatus

class SurveyTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = User.objects.create_superuser(
            email='admin@example.com',
            password='password123'
        )
        self.user = User.objects.create_user(
            email='user@example.com',
            password='password123'
        )
        self.survey = Survey.objects.create(title="Customer Satisfaction", status=SurveyStatus.PUBLISHED)
        self.question = Question.objects.create(
            survey=self.survey,
            text="How are you?",
            type='short_text'
        )

    def test_survey_crud(self):
        self.client.force_authenticate(user=self.admin)
        
        # Create
        url = reverse('survey-list')
        data = {
            'title': 'New Survey',
            'description': 'A test survey'
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, 201)
        survey_id = response.json()['data']['id']
        
        # Retrieve
        detail_url = reverse('survey-detail', args=[survey_id])
        response = self.client.get(detail_url)
        self.assertEqual(response.status_code, 200)
        
        # Update
        response = self.client.patch(detail_url, {'title': 'Updated Survey'})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['data']['title'], 'Updated Survey')
        
        # Delete
        response = self.client.delete(detail_url)
        self.assertEqual(response.status_code, 200)

    def test_survey_submission_anonymous(self):
        url = reverse('survey-submit', args=[self.survey.id])
        data = {
            'session_id': 'sess_123',
            'answers': [
                {
                    'question_id': str(self.question.id),
                    'text_value': 'I am fine'
                }
            ]
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, 201)
        
        # Cannot submit twice anonymously if one_response_per_user is True
        self.survey.one_response_per_user = True
        self.survey.save()
        response2 = self.client.post(url, data, format='json')
        self.assertEqual(response2.status_code, 400)
        self.assertEqual(response2.json()['message'], 'You have already completed this survey.')

    def test_survey_statistics(self):
        self.client.force_authenticate(user=self.admin)
        
        # Submit a response
        url = reverse('survey-submit', args=[self.survey.id])
        data = {
            'session_id': 'sess_123',
            'answers': [
                {
                    'question_id': str(self.question.id),
                    'text_value': 'I am fine'
                }
            ]
        }
        self.client.post(url, data, format='json')
        
        # Get stats
        stats_url = reverse('survey-statistics', args=[self.survey.id])
        response = self.client.get(stats_url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['data']['total_responses'], 1)

    def test_survey_duplication(self):
        self.client.force_authenticate(user=self.admin)
        url = reverse('survey-duplicate', args=[self.survey.id])
        response = self.client.post(url)
        self.assertEqual(response.status_code, 200)
        
        new_title = response.json()['data']['title']
        self.assertTrue('Copy of' in new_title)
        
        # Check if question was duplicated
        new_survey_id = response.json()['data']['id']
        questions = Question.objects.filter(survey_id=new_survey_id)
        self.assertEqual(questions.count(), 1)
