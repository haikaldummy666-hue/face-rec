import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from '../src/styles/Dashboard.module.css';

export default function Dashboard() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSessions, setSelectedSessions] = useState([]);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sessions`);
      if (response.ok) {
        const data = await response.json();
        setSessions(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSession = (sessionId) => {
    setSelectedSessions(prev =>
      prev.includes(sessionId)
        ? prev.filter(id => id !== sessionId)
        : [...prev, sessionId]
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-indigo-600">Emotion Detection System</h1>
            <div className="flex gap-4">
              <Link href="/">
                <a className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
                  New Session
                </a>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Session Dashboard</h2>
          <p className="text-gray-600">Manage and analyze your emotion detection sessions</p>
        </div>

        {/* Sessions Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-lg text-gray-600">Loading sessions...</div>
          </div>
        ) : sessions.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600 mb-4">No sessions yet. Start a new session to begin!</p>
            <Link href="/">
              <a className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
                Create First Session
              </a>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Sessions Table */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-indigo-600 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left">Select</th>
                    <th className="px-6 py-4 text-left">User ID</th>
                    <th className="px-6 py-4 text-left">Created</th>
                    <th className="px-6 py-4 text-left">Emotions Recorded</th>
                    <th className="px-6 py-4 text-left">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {sessions.map((session) => (
                    <tr key={session._id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedSessions.includes(session._id)}
                          onChange={() => handleSelectSession(session._id)}
                          className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
                        />
                      </td>
                      <td className="px-6 py-4 text-gray-900 font-medium">{session.user_id}</td>
                      <td className="px-6 py-4 text-gray-600 text-sm">{formatDate(session.createdAt)}</td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                          {session.emotions?.length || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <Link href={`/session/${session._id}`}>
                            <a className="text-indigo-600 hover:text-indigo-900 font-medium">View</a>
                          </Link>
                          <button
                            className="text-red-600 hover:text-red-900 font-medium"
                            onClick={() => {
                              if (window.confirm('Delete this session?')) {
                                // Delete logic
                              }
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Comparison Button */}
            {selectedSessions.length > 1 && (
              <div className="flex justify-center">
                <Link href={`/compare?sessions=${selectedSessions.join(',')}`}>
                  <a className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium">
                    Compare Selected Sessions ({selectedSessions.length})
                  </a>
                </Link>
              </div>
            )}

            {/* Statistics Card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-gray-600 text-sm font-medium">Total Sessions</h3>
                <p className="text-3xl font-bold text-indigo-600 mt-2">{sessions.length}</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-gray-600 text-sm font-medium">Total Emotions Recorded</h3>
                <p className="text-3xl font-bold text-indigo-600 mt-2">
                  {sessions.reduce((sum, s) => sum + (s.emotions?.length || 0), 0)}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-gray-600 text-sm font-medium">Average Emotions/Session</h3>
                <p className="text-3xl font-bold text-indigo-600 mt-2">
                  {sessions.length > 0
                    ? Math.round(
                        sessions.reduce((sum, s) => sum + (s.emotions?.length || 0), 0) / sessions.length
                      )
                    : 0}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
