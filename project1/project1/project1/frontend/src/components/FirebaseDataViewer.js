import React, { useState, useEffect } from 'react';
import { db } from '../firebase/config';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';

export default function FirebaseDataViewer({ user }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userData, setUserData] = useState(null);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const usersCollection = collection(db, 'users');
      const userSnapshot = await getDocs(usersCollection);
      const usersList = userSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUsers(usersList);
      console.log('Loaded users:', usersList);
    } catch (error) {
      console.error('Error loading users:', error);
      alert('Error loading users: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadUserData = async (userId) => {
    try {
      const userDoc = doc(db, 'users', userId);
      const userSnap = await getDoc(userDoc);
      if (userSnap.exists()) {
        setUserData(userSnap.data());
        console.log('User data:', userSnap.data());
      } else {
        setUserData(null);
        console.log('No user data found');
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      alert('Error loading user data: ' + error.message);
    }
  };

  useEffect(() => {
    if (user) {
      loadUsers();
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Firebase Data Viewer</h1>
        
        {/* Load Users Button */}
        <div className="mb-6">
          <button
            onClick={loadUsers}
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Load Users from Firebase'}
          </button>
        </div>

        {/* Users List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Users in Database</h2>
              <p className="text-sm text-gray-600 mt-1">Total: {users.length} users</p>
            </div>
            <div className="p-6">
              {users.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  {loading ? 'Loading users...' : 'No users found'}
                </div>
              ) : (
                <div className="space-y-3">
                  {users.map((user) => (
                    <div
                      key={user.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedUser === user.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => {
                        setSelectedUser(user.id);
                        loadUserData(user.id);
                      }}
                    >
                      <div className="font-medium text-gray-900">{user.id}</div>
                      <div className="text-sm text-gray-600">
                        Role: {user.role || 'Not specified'}
                      </div>
                      {user.resumeAnalysis && (
                        <div className="text-sm text-green-600 mt-1">
                          Has Resume Analysis ✓
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* User Details */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">User Details</h2>
              {selectedUser && (
                <p className="text-sm text-gray-600 mt-1">Selected: {selectedUser}</p>
              )}
            </div>
            <div className="p-6">
              {!selectedUser ? (
                <div className="text-center text-gray-500 py-8">
                  Select a user to view details
                </div>
              ) : !userData ? (
                <div className="text-center text-gray-500 py-8">
                  Loading user data...
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Basic Info</h3>
                    <div className="bg-gray-50 p-3 rounded">
                      <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                        {JSON.stringify(userData, null, 2)}
                      </pre>
                    </div>
                  </div>

                  {userData.resumeAnalysis && (
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">Resume Analysis</h3>
                      <div className="bg-blue-50 p-3 rounded">
                        <div className="text-sm text-gray-700">
                          <div><strong>Skills:</strong> {userData.resumeAnalysis.skills?.join(', ') || 'None'}</div>
                          <div><strong>CGPA:</strong> {userData.resumeAnalysis.cgpa || 'Not specified'}</div>
                          <div><strong>ATS Score:</strong> {userData.resumeAnalysis.ats_score || 'Not calculated'}</div>
                          <div><strong>Uploaded:</strong> {userData.resumeAnalysis.uploadedAt || 'Unknown'}</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {userData.learningPreferences && (
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">Learning Preferences</h3>
                      <div className="bg-green-50 p-3 rounded">
                        <div className="text-sm text-gray-700">
                          <div><strong>Selected Languages:</strong> {userData.learningPreferences.selectedLanguages?.join(', ') || 'None'}</div>
                          <div><strong>Experience Level:</strong> {userData.learningPreferences.experienceLevel || 'Not specified'}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 rounded-xl p-6 border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">How to Check Firebase Data:</h3>
          <div className="text-blue-800 space-y-2">
            <p>1. <strong>Click "Load Users from Firebase"</strong> to see all users in your database</p>
            <p>2. <strong>Click on any user</strong> to see their detailed information</p>
            <p>3. <strong>Check the console</strong> (F12 → Console) for detailed logs</p>
            <p>4. <strong>Common data locations:</strong></p>
            <ul className="ml-6 list-disc">
              <li>User profiles: <code>users/{email}</code></li>
              <li>Resume analysis: <code>users/{email}/resumeAnalysis</code></li>
              <li>Learning preferences: <code>users/{email}/learningPreferences</code></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
