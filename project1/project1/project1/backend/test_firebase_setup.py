#!/usr/bin/env python3
"""
Firebase Connection Test Script
Run this to test if Firebase is properly configured
"""

import os
import sys
import json
from pathlib import Path

def test_firebase_setup():
    print("🔍 Testing Firebase Setup...")
    print("=" * 50)
    
    # Check if service account file exists
    service_account_path = Path("firebase-service-account.json")
    if service_account_path.exists():
        print("✅ Firebase service account file found")
        
        # Check if it's valid JSON
        try:
            with open(service_account_path, 'r') as f:
                data = json.load(f)
            
            required_fields = ['type', 'project_id', 'private_key', 'client_email']
            missing_fields = [field for field in required_fields if field not in data]
            
            if missing_fields:
                print(f"❌ Service account file missing fields: {missing_fields}")
                return False
            
            print(f"✅ Service account file is valid JSON")
            print(f"📋 Project ID: {data.get('project_id')}")
            print(f"📧 Client Email: {data.get('client_email')}")
            
        except json.JSONDecodeError:
            print("❌ Service account file is not valid JSON")
            return False
    else:
        print("❌ Firebase service account file not found")
        print("📁 Expected location: firebase-service-account.json")
        return False
    
    # Check if .env file exists
    env_path = Path(".env")
    if env_path.exists():
        print("✅ .env file found")
        
        with open(env_path, 'r') as f:
            env_content = f.read()
            
        if "FIREBASE_SERVICE_ACCOUNT_PATH" in env_content:
            print("✅ FIREBASE_SERVICE_ACCOUNT_PATH found in .env")
        else:
            print("❌ FIREBASE_SERVICE_ACCOUNT_PATH not found in .env")
            return False
    else:
        print("❌ .env file not found")
        return False
    
    # Test Firebase import
    try:
        import firebase_admin
        from firebase_admin import credentials, firestore
        print("✅ Firebase Admin SDK imported successfully")
        
        # Try to initialize Firebase
        if not firebase_admin._apps:
            cred = credentials.Certificate(str(service_account_path))
            firebase_admin.initialize_app(cred)
            print("✅ Firebase Admin SDK initialized successfully")
            
            # Test Firestore connection
            db = firestore.client()
            print("✅ Firestore client created successfully")
            
            # Test a simple operation
            test_ref = db.collection('test').document('connection_test')
            test_ref.set({'test': True, 'timestamp': firestore.SERVER_TIMESTAMP})
            print("✅ Test document written to Firestore")
            
            # Clean up test document
            test_ref.delete()
            print("✅ Test document cleaned up")
            
        else:
            print("✅ Firebase Admin SDK already initialized")
            
    except ImportError as e:
        print(f"❌ Failed to import Firebase Admin SDK: {e}")
        print("💡 Run: pip install firebase-admin")
        return False
    except Exception as e:
        print(f"❌ Firebase initialization failed: {e}")
        return False
    
    print("=" * 50)
    print("🎉 Firebase setup is working correctly!")
    print("🚀 You can now run: python main.py")
    return True

if __name__ == "__main__":
    success = test_firebase_setup()
    if not success:
        print("\n❌ Firebase setup needs attention. Please check the instructions above.")
        sys.exit(1)
    else:
        print("\n✅ Firebase is ready to use!")
        sys.exit(0)
