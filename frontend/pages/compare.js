import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Bar, Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  RadarController,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  RadarController,
  PointElement,
  LineElement,
  Filler,
  Title,
  Tooltip,
  Legend
);

const emotionColors = {
  happy: 'rgba(251, 191, 36, 0.6)',
  sad: 'rgba(59, 130, 246, 0.6)',
  angry: 'rgba(239, 68, 68, 0.6)',
  surprised: 'rgba(167, 139, 250, 0.6)',
  neutral: 'rgba(156, 163, 175, 0.6)',
  fearful: 'rgba(216, 180, 254, 0.6)',
  disgusted: 'rgba(74, 222, 128, 0.6)',
};

export default function CompareSessions() {
  const router = useRouter();
  const { ids } = router.query;
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    if (!ids) return;

    const sessionIds = Array.isArray(ids) ? ids : [ids];

    const fetchSessions = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        const data = await Promise.all(
          sessionIds.map(id =>
            fetch(`${apiUrl}/sessions/${id}`)
              .then(res => res.json())
              .catch(err => {
                console.error(`Error fetching session ${id}:`, err);
                return null;
              })
          )
        );

        const validSessions = data.filter(s => s !== null);
        setSessions(validSessions);
        processComparisonData(validSessions);
        setError(null);
      } catch (err) {
        console.error('Error fetching sessions:', err);
        setError('Failed to load session data');
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, [ids]);

  const processComparisonData = (sessionList) => {
    if (sessionList.length === 0) return;

    // Calculate emotion distribution for each session
    const sessionEmotions = sessionList.map(session => {
      const emotions = {
        happy: 0,
        sad: 0,
        angry: 0,
        surprised: 0,
        neutral: 0,
        fearful: 0,
        disgusted: 0,
      };

      session.emotions.forEach(emotion => {
        const exp = emotion?.emotion || 'neutral';
        if (emotions.hasOwnProperty(exp)) {
          emotions[exp]++;
        }
      });

      const total = session.emotions.length;
      return Object.fromEntries(
        Object.entries(emotions).map(([k, v]) => [k, ((v / total) * 100).toFixed(1)])
      );
    });

    // Bar chart comparing emotion counts
    const barData = {
      labels: Object.keys(sessionEmotions[0]),
      datasets: sessionList.map((session, idx) => ({
        label: `Session ${idx + 1} (${new Date(session.createdAt).toLocaleDateString()})`,
        data: Object.values(sessionEmotions[idx]),
        backgroundColor: Object.values(emotionColors)[idx % Object.values(emotionColors).length],
        borderColor: Object.values(emotionColors)[idx % Object.values(emotionColors).length].replace('0.6', '1'),
        borderWidth: 1,
      })),
    };

    // Radar chart
    const radarData = {
      labels: Object.keys(sessionEmotions[0]),
      datasets: sessionList.map((session, idx) => ({
        label: `Session ${idx + 1}`,
        data: Object.values(sessionEmotions[idx]),
        borderColor: Object.values(emotionColors)[idx % Object.values(emotionColors).length].replace('0.6', '1'),
        backgroundColor: Object.values(emotionColors)[idx % Object.values(emotionColors).length],
        pointRadius: 3,
        pointHoverRadius: 5,
      })),
    };

    setChartData({ bar: barData, radar: radarData });
  };

  if (!ids) {
    return <div className="p-8">Loading...</div>;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading session data...</p>
        </div>
      </div>
    );
  }

  if (error || sessions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
        <div className="max-w-7xl mx-auto">
          <Link href="/dashboard">
            <button className="mb-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
              ← Back to Dashboard
            </button>
          </Link>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-800">{error || 'No sessions to compare'}</p>
          </div>
        </div>
      </div>
    );
  }

  // Calculate comparison stats
  const stats = sessions.map(session => {
    const emotions = {};
    session.emotions.forEach(emotion => {
      const exp = emotion?.emotion || 'neutral';
      emotions[exp] = (emotions[exp] || 0) + 1;
    });

    const emotionArray = Object.entries(emotions).sort(([, a], [, b]) => b - a);
    return {
      sessionId: session._id,
      totalEmotions: session.emotions.length,
      mostFrequent: emotionArray[0] ? emotionArray[0][0] : 'N/A',
      mostFrequentCount: emotionArray[0] ? emotionArray[0][1] : 0,
      createdAt: session.createdAt,
    };
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <Link href="/dashboard">
              <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition">
                ← Back to Dashboard
              </button>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Multi-Session Comparison</h1>
            <div className="text-sm text-gray-500">
              Comparing {sessions.length} sessions
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-white rounded-lg shadow p-6">
              <div className="text-sm text-gray-500 uppercase tracking-wide">
                Session {idx + 1}
              </div>
              <div className="mt-4 space-y-2">
                <div>
                  <span className="text-xs text-gray-400">Total Emotions:</span>
                  <div className="text-xl font-bold text-indigo-600">{stat.totalEmotions}</div>
                </div>
                <div>
                  <span className="text-xs text-gray-400">Most Frequent:</span>
                  <div className="text-lg font-bold text-yellow-600 capitalize">
                    {stat.mostFrequent} ({stat.mostFrequentCount})
                  </div>
                </div>
                <div>
                  <span className="text-xs text-gray-400">Date:</span>
                  <div className="text-sm text-gray-900">
                    {new Date(stat.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts */}
        {chartData && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Bar Chart */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Emotion Distribution Comparison</h2>
              <div style={{ height: '400px' }}>
                <Bar
                  data={chartData.bar}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: true,
                        position: 'top',
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        title: {
                          display: true,
                          text: 'Percentage (%)',
                        },
                      },
                    },
                  }}
                />
              </div>
            </div>

            {/* Radar Chart */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Emotion Pattern Comparison</h2>
              <div style={{ height: '400px' }}>
                <Radar
                  data={chartData.radar}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: true,
                        position: 'top',
                      },
                    },
                    scales: {
                      r: {
                        beginAtZero: true,
                        max: 100,
                      },
                    },
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Detailed Comparison Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Detailed Comparison</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Session
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Emotions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Most Frequent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sessions.map((session, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      Session {idx + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(session.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full">
                        {session.emotions.length}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {(() => {
                        const emotions = {};
                        session.emotions.forEach(e => {
                          const exp = e?.emotion || 'neutral';
                          emotions[exp] = (emotions[exp] || 0) + 1;
                        });
                        const mostFreq = Object.entries(emotions).sort(
                          ([, a], [, b]) => b - a
                        )[0];
                        return (
                          <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${
                            mostFreq[0] === 'happy'
                              ? 'bg-yellow-100 text-yellow-800'
                              : mostFreq[0] === 'sad'
                              ? 'bg-blue-100 text-blue-800'
                              : mostFreq[0] === 'angry'
                              ? 'bg-red-100 text-red-800'
                              : mostFreq[0] === 'surprised'
                              ? 'bg-purple-100 text-purple-800'
                              : mostFreq[0] === 'disgusted'
                              ? 'bg-green-100 text-green-800'
                              : mostFreq[0] === 'fearful'
                              ? 'bg-pink-100 text-pink-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {mostFreq[0]} ({mostFreq[1]})
                          </span>
                        );
                      })()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <Link href={`/session/${session._id}`}>
                        <button className="text-indigo-600 hover:text-indigo-900 font-medium">
                          View Details
                        </button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
