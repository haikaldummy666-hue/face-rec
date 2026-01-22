import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from '../src/styles/Dashboard.module.css';

export default function Dashboard() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSessions, setSelectedSessions] = useState([]);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${apiUrl}/sessions`);
      if (response.ok) {
        const data = await response.json();
        setSessions(Array.isArray(data) ? data : []);
        setError(null);
      } else {
        throw new Error('Failed to fetch sessions');
      }
    } catch (err) {
      console.error('Error fetching sessions:', err);
      setError('Failed to load sessions');
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

  const handleCompare = () => {
    if (selectedSessions.length < 2) {
      alert('Please select at least 2 sessions to compare');
      return;
    }
    window.location.href = `/compare?ids=${selectedSessions.join(',')}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  // Calculate statistics
  const stats = {
    totalSessions: sessions.length,
    totalEmotions: sessions.reduce((sum, s) => sum + (s.emotions?.length || 0), 0),
    avgEmotionsPerSession: sessions.length > 0 
      ? (sessions.reduce((sum, s) => sum + (s.emotions?.length || 0), 0) / sessions.length).toFixed(1)
      : 0,
  };

  return (
    <div className={styles['dashboard-container']}>
      {/* Navigation */}
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Link href="/">
                <button className="px-5 py-2 bg-indigo-100 text-indigo-700 font-semibold rounded-lg hover:bg-indigo-200 transition shadow-sm">
                  ← Back to Emotion Detection
                </button>
              </Link>
              <h1 className="text-2xl font-bold text-indigo-600">Emotion Detection System</h1>
            </div>
            <div className="flex gap-4">
              <Link href="/analytics">
                <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
                  📈 Analytics
                </button>
              </Link>
              <Link href="/">
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
                  + New Session
                </button>
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

        {/* Statistics Cards */}
        {!loading && sessions.length > 0 && (
          <div className={styles['stats-container']}>
            <div className={styles['stat-card']}>
              <div className={styles['stat-label']}>Total Sessions</div>
              <div className={styles['stat-value']}>{stats.totalSessions}</div>
            </div>
            <div className={styles['stat-card']}>
              <div className={styles['stat-label']}>Total Emotions</div>
              <div className={styles['stat-value']}>{stats.totalEmotions}</div>
            </div>
            <div className={styles['stat-card']}>
              <div className={styles['stat-label']}>Avg Emotions/Session</div>
              <div className={styles['stat-value']}>{stats.avgEmotionsPerSession}</div>
            </div>
          </div>
        )}

        {/* Comparison Section */}
        {!loading && sessions.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">
                Multi-Session Comparison
              </h2>
              <button
                onClick={handleCompare}
                disabled={selectedSessions.length < 2}
                className={`px-6 py-2 rounded-lg font-medium transition ${
                  selectedSessions.length < 2
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                Compare ({selectedSessions.length}) Sessions
              </button>
            </div>
            <p className="text-gray-600 text-sm mt-2">
              Select at least 2 sessions to compare emotion patterns
            </p>
          </div>
        )}

        {/* Sessions Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-lg text-gray-600">Loading sessions...</div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-800">{error}</p>
          </div>
        ) : sessions.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600 mb-4">No sessions yet. Start a new session to begin!</p>
            <Link href="/">
              <button className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
                Create First Session
              </button>
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-indigo-600 text-white">
                <tr>
                  <th className="px-6 py-4 text-left">
                    <input
                      type="checkbox"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedSessions(sessions.map(s => s._id));
                        } else {
                          setSelectedSessions([]);
                        }
                      }}
                      checked={selectedSessions.length === sessions.length && sessions.length > 0}
                      className="rounded"
                    />
                  </th>
                  <th className="px-6 py-4 text-left">User ID</th>
                  <th className="px-6 py-4 text-left">Created</th>
                  <th className="px-6 py-4 text-left">Emotions Recorded</th>
                  <th className="px-6 py-4 text-left">Top Emotion</th>
                  <th className="px-6 py-4 text-left">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sessions.map((session) => {
                  const emotionCounts = {};
                  (session.emotions || []).forEach(emotion => {
                    const exp = emotion.expressions?.[0] || 'neutral';
                    emotionCounts[exp] = (emotionCounts[exp] || 0) + 1;
                  });
                  
                  const topEmotion = Object.entries(emotionCounts).sort(
                    ([, a], [, b]) => b - a
                  )[0];

                  return (
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
                        {topEmotion ? (
                          <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${
                            topEmotion[0] === 'happy'
                              ? 'bg-yellow-100 text-yellow-800'
                              : topEmotion[0] === 'sad'
                              ? 'bg-blue-100 text-blue-800'
                              : topEmotion[0] === 'angry'
                              ? 'bg-red-100 text-red-800'
                              : topEmotion[0] === 'surprised'
                              ? 'bg-purple-100 text-purple-800'
                              : topEmotion[0] === 'disgusted'
                              ? 'bg-green-100 text-green-800'
                              : topEmotion[0] === 'fearful'
                              ? 'bg-pink-100 text-pink-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {topEmotion[0]} ({topEmotion[1]})
                          </span>
                        ) : (
                          <span className="text-gray-400">No data</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <Link href={`/session/${session._id}`}>
                          <button className="text-indigo-600 hover:text-indigo-900 font-medium">
                            View Details
                          </button>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
