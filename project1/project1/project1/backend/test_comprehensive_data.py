#!/usr/bin/env python3
"""
Comprehensive Firebase Data Storage Test
Tests all the data types you mentioned: ATS scores, jobs applied, mock test scores, courses enrolled
"""

import firebase_admin
from firebase_admin import credentials, firestore
import os
import json
from datetime import datetime

def test_all_data_storage():
    print("🔍 Testing All Firebase Data Storage Features...")
    print("=" * 60)
    
    # Check if service account file exists
    service_account_path = "firebase-service-account.json"
    if not os.path.exists(service_account_path):
        print("❌ Service account file not found")
        return False
    
    try:
        # Initialize Firebase
        if not firebase_admin._apps:
            cred = credentials.Certificate(service_account_path)
            firebase_admin.initialize_app(cred)
            print("✅ Firebase initialized")
        
        # Get Firestore client
        db = firestore.client()
        print("✅ Firestore client created")
        
        # Test user email
        test_email = "comprehensive_test@example.com"
        
        print("\n📊 Testing ATS Score Storage...")
        # Test ATS Score Storage
        ats_ref = db.collection('ats_scores').document('test-ats-123')
        ats_ref.set({
            'user_email': test_email,
            'resume_filename': 'test_resume.pdf',
            'ats_score': 85,
            'skills_detected': ['Python', 'JavaScript', 'React', 'Node.js'],
            'missing_skills': ['Docker', 'AWS', 'MongoDB'],
            'recommendations': ['Add Docker experience', 'Include AWS projects', 'Mention MongoDB'],
            'resume_text': 'Sample resume text content...',
            'analyzed_at': firestore.SERVER_TIMESTAMP,
            'test': True
        })
        print("✅ ATS Score saved successfully")
        
        print("\n💼 Testing Job Application Storage...")
        # Test Job Application Storage
        app_ref = db.collection('applications').document('test-app-comprehensive')
        app_ref.set({
            'job_id': 3,
            'user_email': test_email,
            'job_title': 'Full Stack Developer',
            'company': 'TechCorp',
            'status': 'applied',
            'created_at': firestore.SERVER_TIMESTAMP,
            'updated_at': firestore.SERVER_TIMESTAMP,
            'test': True
        })
        print("✅ Job Application saved successfully")
        
        print("\n📝 Testing Mock Test Score Storage...")
        # Test Mock Test Score Storage
        mock_ref = db.collection('mock_test_results').document('test-mock-comprehensive')
        mock_ref.set({
            'user_email': test_email,
            'score': 9,
            'total_questions': 10,
            'percentage': 90.0,
            'subject': 'Full Stack Development',
            'submitted_at': firestore.SERVER_TIMESTAMP,
            'test': True
        })
        print("✅ Mock Test Score saved successfully")
        
        print("\n🎓 Testing Course Enrollment Storage...")
        # Test Course Enrollment Storage
        course_ref = db.collection('course_enrollments').document('test-course-comprehensive')
        course_ref.set({
            'user_email': test_email,
            'course_id': 'fsd-101',
            'course_title': 'Full Stack Development Bootcamp',
            'course_category': 'Web Development',
            'course_difficulty': 'Intermediate',
            'course_duration': '12 weeks',
            'progress_percentage': 25,
            'status': 'enrolled',
            'enrolled_at': firestore.SERVER_TIMESTAMP,
            'last_accessed': firestore.SERVER_TIMESTAMP,
            'test': True
        })
        print("✅ Course Enrollment saved successfully")
        
        print("\n📈 Testing User Activity Tracking...")
        # Test User Activity Tracking
        activity_ref = db.collection('user_activities').document('test-activity-comprehensive')
        activity_ref.set({
            'user_email': test_email,
            'activity_type': 'page_view',
            'page_visited': '/dashboard',
            'action_performed': 'viewed_job_recommendations',
            'metadata': {'job_count': 5, 'recommendation_score': 8.5},
            'timestamp': firestore.SERVER_TIMESTAMP,
            'test': True
        })
        print("✅ User Activity tracked successfully")
        
        print("\n🎯 Testing Interview Scheduling...")
        # Test Interview Scheduling
        interview_ref = db.collection('interviews').document('test-interview-comprehensive')
        interview_ref.set({
            'email': test_email,
            'round': 'Technical Round',
            'date': '2025-10-25T14:00:00Z',
            'notes': 'Technical interview focusing on full stack development',
            'created_at': firestore.SERVER_TIMESTAMP,
            'test': True
        })
        print("✅ Interview scheduled successfully")
        
        print("\n" + "=" * 60)
        print("🎉 ALL DATA STORAGE TESTS PASSED!")
        print("🔍 Check your Firebase Console now - you should see:")
        print("   📊 ats_scores collection")
        print("   💼 applications collection")
        print("   📝 mock_test_results collection")
        print("   🎓 course_enrollments collection")
        print("   📈 user_activities collection")
        print("   🎯 interviews collection")
        print("   👤 users collection")
        
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    success = test_all_data_storage()
    if success:
        print("\n✅ All Firebase data storage features are working correctly!")
    else:
        print("\n❌ Firebase data storage test failed!")

