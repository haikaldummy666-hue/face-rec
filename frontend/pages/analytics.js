import { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import {
  Chart as ChartJSLib,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

// Register Chart.js components
ChartJSLib.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Line = dynamic(
  () => import('react-chartjs-2').then(mod => mod.Line),
  {
    ssr: false,
    loading: () => <div className="text-center py-8">Loading chart...</div>
  }
);

const Bar = dynamic(
  () => import('react-chartjs-2').then(mod => mod.Bar),
  {
    ssr: false,
    loading: () => <div className="text-center py-8">Loading chart...</div>
  }
);

const Doughnut = dynamic(
  () => import('react-chartjs-2').then(mod => mod.Doughnut),
  {
    ssr: false,
    loading: () => <div className="text-center py-8">Loading chart...</div>
  }
);

export default function Analytics() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('week'); // week, month, all
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        console.log('Fetching from:', `${apiUrl}/sessions`);
        
        const response = await fetch(`${apiUrl}/sessions`);
        console.log('Response status:', response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Error response:', errorText);
          throw new Error(`Failed to fetch sessions: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Sessions data:', data);
        setSessions(data);
        processAnalytics(data);
      } catch (err) {
        console.error('Full error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, []);

  const processAnalytics = (sessionList) => {
    if (sessionList.length === 0) return;

    // Aggregate emotion distribution
    const emotionCounts = {
      happy: 0,
      sad: 0,
      angry: 0,
      surprised: 0,
      neutral: 0,
      fearful: 0,
      disgusted: 0,
    };

    const emotionsByDay = {};

    sessionList.forEach(session => {
      try {
        const date = new Date(session.createdAt).toLocaleDateString();
        if (!emotionsByDay[date]) {
          emotionsByDay[date] = { ...emotionCounts };
        }

        (session.emotions || []).forEach(emotion => {
          try {
            // emotion object has emotion (string) and confidence (number)
            const exp = emotion?.emotion || 'neutral';
            if (emotionCounts.hasOwnProperty(exp)) {
              emotionCounts[exp]++;
              emotionsByDay[date][exp]++;
            }
          } catch (e) {
            console.error('Error processing emotion:', emotion, e);
          }
        });
      } catch (e) {
        console.error('Error processing session:', session, e);
      }
    });

    // Doughnut chart
    const doughnutData = {
      labels: Object.keys(emotionCounts),
      datasets: [
        {
          label: 'Emotion Distribution',
          data: Object.values(emotionCounts),
          backgroundColor: [
            '#fbbf24', // happy
            '#3b82f6', // sad
            '#ef4444', // angry
            '#a78bfa', // surprised
            '#9ca3af', // neutral
            '#d8b4fe', // fearful
            '#4ade80', // disgusted
          ],
          borderColor: '#fff',
          borderWidth: 2,
        },
      ],
    };

    // Time series line chart
    const sortedDates = Object.keys(emotionsByDay).sort();
    
    let lineData;
    if (sortedDates.length > 0) {
      lineData = {
        labels: sortedDates,
        datasets: Object.keys(emotionCounts).map((emotion, idx) => ({
          label: emotion.charAt(0).toUpperCase() + emotion.slice(1),
          data: sortedDates.map(date => emotionsByDay[date][emotion]),
          borderColor: [
            '#fbbf24',
            '#3b82f6',
            '#ef4444',
            '#a78bfa',
            '#9ca3af',
            '#d8b4fe',
            '#4ade80',
          ][idx],
          backgroundColor: `rgba(${[
            [251, 191, 36],
            [59, 130, 246],
            [239, 68, 68],
            [167, 139, 250],
            [156, 163, 175],
            [216, 180, 254],
            [74, 222, 128],
          ][idx].join(',')}, 0.1)`,
          tension: 0.4,
          fill: true,
        })),
      };
    } else {
      // Fallback: group by session instead of date
      lineData = {
        labels: sessionList.map((s, idx) => `Session ${idx + 1}`),
        datasets: Object.keys(emotionCounts).map((emotion, idx) => ({
          label: emotion.charAt(0).toUpperCase() + emotion.slice(1),
          data: sessionList.map(session => {
            const count = (session.emotions || []).filter(e => (e?.emotion || 'neutral') === emotion).length;
            return count;
          }),
          borderColor: [
            '#fbbf24',
            '#3b82f6',
            '#ef4444',
            '#a78bfa',
            '#9ca3af',
            '#d8b4fe',
            '#4ade80',
          ][idx],
          backgroundColor: `rgba(${[
            [251, 191, 36],
            [59, 130, 246],
            [239, 68, 68],
            [167, 139, 250],
            [156, 163, 175],
            [216, 180, 254],
            [74, 222, 128],
          ][idx].join(',')}, 0.1)`,
          tension: 0.4,
          fill: true,
        })),
      };
    }

    // Bar chart for session comparison
    const barData = {
      labels: sessionList.slice(-10).map((s, idx) => `Session ${idx + 1}`),
      datasets: [
        {
          label: 'Emotions Recorded',
          data: sessionList.slice(-10).map(s => s.emotions?.length || 0),
          backgroundColor: '#4f46e5',
          borderColor: '#4c1d95',
          borderWidth: 1,
        },
      ],
    };

    setChartData({ doughnut: doughnutData, line: lineData, bar: barData });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  // Calculate overall statistics
  const totalEmotions = sessions.reduce((sum, s) => sum + (s.emotions?.length || 0), 0);
  const avgSessionLength = sessions.length > 0 ? Math.round(totalEmotions / sessions.length) : 0;

  const emotionStats = {};
  sessions.forEach(session => {
    try {
      (session.emotions || []).forEach(emotion => {
        try {
          const exp = emotion?.emotion || 'neutral';
          emotionStats[exp] = (emotionStats[exp] || 0) + 1;
        } catch (e) {
          console.error('Error in emotion processing:', emotion, e);
        }
      });
    } catch (e) {
      console.error('Error in session processing:', session, e);
    }
  });

  const mostFrequentEmotion = Object.entries(emotionStats).sort(
    ([, a], [, b]) => b - a
  )[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Analytics & Insights</h1>
            <div className="flex gap-2">
              <Link href="/dashboard">
                <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition">
                  ← Back to Dashboard
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-500 uppercase tracking-wide">Total Sessions</div>
            <div className="text-3xl font-bold text-indigo-600 mt-2">{sessions.length}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-500 uppercase tracking-wide">Total Emotions</div>
            <div className="text-3xl font-bold text-blue-600 mt-2">{totalEmotions}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-500 uppercase tracking-wide">Avg Per Session</div>
            <div className="text-3xl font-bold text-green-600 mt-2">{avgSessionLength}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-500 uppercase tracking-wide">Most Frequent</div>
            <div className="text-2xl font-bold text-yellow-600 mt-2 capitalize">
              {mostFrequentEmotion ? mostFrequentEmotion[0] : 'N/A'}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              ({mostFrequentEmotion ? mostFrequentEmotion[1] : 0} occurrences)
            </div>
          </div>
        </div>

        {/* Charts */}
        {chartData && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Doughnut Chart */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Overall Emotion Distribution</h2>
                <div className="flex justify-center">
                  <div style={{ width: '300px', height: '300px' }}>
                    <Doughnut
                      data={chartData.doughnut}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'bottom',
                          },
                        },
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Bar Chart */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Session Activity</h2>
                <div style={{ height: '300px' }}>
                  <Bar
                    data={chartData.bar}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          display: false,
                        },
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                        },
                      },
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Time Series Chart */}
            <div className="bg-white rounded-lg shadow p-6 mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Emotion Trends Over Time</h2>
              {chartData?.line && chartData.line.labels && chartData.line.labels.length > 0 ? (
                <div style={{ height: '400px' }}>
                  <Line
                    data={chartData.line}
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
                        },
                      },
                    }}
                  />
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500">No data available for trend analysis</p>
                </div>
              )}
            </div>
          </>
        )}

        {/* Emotion Statistics Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Emotion Statistics</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Emotion
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Count
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Percentage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Distribution
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {Object.entries(emotionStats)
                  .sort(([, a], [, b]) => b - a)
                  .map(([emotion, count]) => (
                    <tr key={emotion} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 capitalize">
                        {emotion}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold">
                        {count}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {((count / totalEmotions) * 100).toFixed(1)}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-indigo-600 h-2 rounded-full"
                            style={{ width: `${(count / totalEmotions) * 100}%` }}
                          ></div>
                        </div>
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
