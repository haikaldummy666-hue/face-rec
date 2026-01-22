import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Pie, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import styles from '../../src/styles/Dashboard.module.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const emotionColors = {
  happy: '#fbbf24',
  sad: '#3b82f6',
  angry: '#ef4444',
  surprised: '#a78bfa',
  neutral: '#9ca3af',
  fearful: '#d8b4fe',
  disgusted: '#4ade80',
};

export default function SessionDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    if (!id) return;

    const fetchSession = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
        const response = await fetch(`${apiUrl}/sessions/${id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch session');
        }

        const data = await response.json();
        setSession(data);
        processChartData(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching session:', err);
        setError('Failed to load session data');
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [id]);

  const processChartData = (sessionData) => {
    if (!sessionData.emotions || sessionData.emotions.length === 0) return;

    // Count emotions for pie chart
    const emotionCounts = {};
    sessionData.emotions.forEach(emotion => {
      const primary = emotion.expressions[0];
      if (primary) {
        emotionCounts[primary] = (emotionCounts[primary] || 0) + 1;
      }
    });

    // Timeline data for line chart
    const timelineData = sessionData.emotions.map((emotion, index) => ({
      index,
      expression: emotion.expressions[0] || 'neutral',
      confidence: emotion.confidences[0] || 0,
    }));

    // Pie chart data
    const pieData = {
      labels: Object.keys(emotionCounts),
      datasets: [
        {
          label: 'Emotion Distribution',
          data: Object.values(emotionCounts),
          backgroundColor: Object.keys(emotionCounts).map(
            emotion => emotionColors[emotion] || '#999'
          ),
          borderColor: '#fff',
          borderWidth: 2,
        },
      ],
    };

    // Line chart data
    const lineData = {
      labels: timelineData.map(d => d.index),
      datasets: [
        {
          label: 'Emotion Confidence',
          data: timelineData.map(d => d.confidence),
          borderColor: '#4f46e5',
          backgroundColor: 'rgba(79, 70, 229, 0.1)',
          tension: 0.4,
          fill: true,
          pointRadius: 2,
          pointHoverRadius: 5,
        },
      ],
    };

    setChartData({ pie: pieData, line: lineData });
  };

  const handleExportPDF = async () => {
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();

      // Add content
      doc.setFontSize(16);
      doc.text('Session Report', 20, 20);

      doc.setFontSize(12);
      doc.text(`User ID: ${session.user_id}`, 20, 40);
      doc.text(`Created: ${new Date(session.createdAt).toLocaleString()}`, 20, 50);
      doc.text(`Total Emotions: ${session.emotions.length}`, 20, 60);

      if (session.emotions.length > 0) {
        const emotions = {};
        session.emotions.forEach(e => {
          const exp = e.expressions[0] || 'neutral';
          emotions[exp] = (emotions[exp] || 0) + 1;
        });

        doc.text('Emotion Distribution:', 20, 80);
        let yPos = 90;
        Object.entries(emotions).forEach(([emotion, count]) => {
          doc.text(`  ${emotion}: ${count}`, 20, yPos);
          yPos += 10;
        });
      }

      doc.save(`session-${id}.pdf`);
    } catch (err) {
      console.error('Error exporting PDF:', err);
      alert('Failed to export PDF');
    }
  };

  const handleExportCSV = () => {
    if (!session || !session.emotions) return;

    let csv = 'Timestamp,Emotion,Confidence\n';
    session.emotions.forEach(emotion => {
      const timestamp = new Date(emotion.timestamp).toLocaleString();
      const expression = emotion.expressions[0] || 'neutral';
      const confidence = emotion.confidences[0] || 0;
      csv += `"${timestamp}","${expression}",${confidence}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `session-${id}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (!id) {
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

  if (error || !session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
        <div className="max-w-7xl mx-auto">
          <Link href="/dashboard">
            <button className="mb-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
              ← Back to Dashboard
            </button>
          </Link>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-800">{error || 'Session not found'}</p>
          </div>
        </div>
      </div>
    );
  }

  const emotionStats = {};
  session.emotions.forEach(emotion => {
    const primary = emotion.expressions[0] || 'neutral';
    emotionStats[primary] = (emotionStats[primary] || 0) + 1;
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
            <Link href="/dashboard">
              <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition">
                ← Back to Dashboard
              </button>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Session Analysis</h1>
            <div className="flex gap-2">
              <button
                onClick={handleExportPDF}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
              >
                📄 PDF Export
              </button>
              <button
                onClick={handleExportCSV}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
              >
                📊 CSV Export
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Session Info */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-500 uppercase tracking-wide">User ID</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">{session.user_id}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-500 uppercase tracking-wide">Total Emotions</div>
            <div className="text-2xl font-bold text-indigo-600 mt-1">{session.emotions.length}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-500 uppercase tracking-wide">Session Date</div>
            <div className="text-lg font-bold text-gray-900 mt-1">
              {new Date(session.createdAt).toLocaleDateString()}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-500 uppercase tracking-wide">Most Frequent</div>
            <div className="text-2xl font-bold text-yellow-600 mt-1 capitalize">
              {mostFrequentEmotion ? mostFrequentEmotion[0] : 'N/A'}
            </div>
          </div>
        </div>

        {/* Charts */}
        {chartData && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Pie Chart */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Emotion Distribution</h2>
              <div className="flex justify-center">
                <div style={{ width: '300px', height: '300px' }}>
                  <Pie
                    data={chartData.pie}
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

            {/* Line Chart */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Emotion Timeline</h2>
              <div style={{ height: '300px' }}>
                <Line
                  data={chartData.line}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: true,
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        max: 1,
                      },
                    },
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Emotion Details Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Emotion Timeline</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Emotion
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Confidence
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {session.emotions.slice(0, 50).map((emotion, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(emotion.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${
                        emotion.expressions[0] === 'happy'
                          ? 'bg-yellow-100 text-yellow-800'
                          : emotion.expressions[0] === 'sad'
                          ? 'bg-blue-100 text-blue-800'
                          : emotion.expressions[0] === 'angry'
                          ? 'bg-red-100 text-red-800'
                          : emotion.expressions[0] === 'surprised'
                          ? 'bg-purple-100 text-purple-800'
                          : emotion.expressions[0] === 'disgusted'
                          ? 'bg-green-100 text-green-800'
                          : emotion.expressions[0] === 'fearful'
                          ? 'bg-pink-100 text-pink-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {emotion.expressions[0] || 'neutral'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {((emotion.confidences[0] || 0) * 100).toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {session.emotions.length > 50 && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 text-sm text-gray-600 text-center">
              Showing 50 of {session.emotions.length} emotions
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
