#!/usr/bin/env python3
"""
Direct Firebase Test - Check if data is actually being saved
"""

import firebase_admin
from firebase_admin import credentials, firestore
import os
import json

def test_direct_firebase():
    print("🔍 Testing Direct Firebase Connection...")
    print("=" * 50)
    
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
        
        # Test writing data
        print("📝 Writing test data...")
        
        # Write a test user
        user_ref = db.collection('users').document('test-user-123')
        user_ref.set({
            'email': 'test@firebase.com',
            'name': 'Test User',
            'created_at': firestore.SERVER_TIMESTAMP,
            'test': True
        })
        print("✅ Test user written to Firestore")
        
        # Write a test application
        app_ref = db.collection('applications').document('test-app-123')
        app_ref.set({
            'user_email': 'test@firebase.com',
            'job_id': 1,
            'job_title': 'Test Job',
            'created_at': firestore.SERVER_TIMESTAMP,
            'test': True
        })
        print("✅ Test application written to Firestore")
        
        # Write a test mock result
        result_ref = db.collection('mock_test_results').document('test-result-123')
        result_ref.set({
            'user_email': 'test@firebase.com',
            'score': 10,
            'total_questions': 10,
            'percentage': 100.0,
            'subject': 'Test Subject',
            'submitted_at': firestore.SERVER_TIMESTAMP,
            'test': True
        })
        print("✅ Test mock result written to Firestore")
        
        print("=" * 50)
        print("🎉 All test data written successfully!")
        print("🔍 Check your Firebase Console now - you should see:")
        print("   - users collection with test-user-123")
        print("   - applications collection with test-app-123")
        print("   - mock_test_results collection with test-result-123")
        
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    success = test_direct_firebase()
    if success:
        print("\n✅ Firebase is working correctly!")
    else:
        print("\n❌ Firebase test failed!")

