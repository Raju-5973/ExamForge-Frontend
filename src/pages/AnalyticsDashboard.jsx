import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Layout } from '../components/Layout';
import { Card } from '../components/Card';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { TrendingUp, BookOpen, FileText, AlertCircle, BarChart2, Users } from 'lucide-react';
import api from '../utils/api';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#3b82f6', '#ec4899'];

const EmptyChart = ({ message = 'No data available' }) => (
  <div className="flex flex-col items-center justify-center h-full text-center gap-2">
    <BarChart2 className="w-10 h-10 text-gray-400 dark:text-slate-600" />
    <p className="text-sm text-gray-400 dark:text-slate-500">{message}</p>
  </div>
);

const StatCard = ({ icon, label, value, color }) => (
  <Card className="p-6 flex items-center space-x-4">
    <div className={`p-3 rounded-full ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-sm font-medium text-gray-500 dark:text-slate-400">{label}</p>
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{value}</h3>
    </div>
  </Card>
);

const AnalyticsDashboard = () => {
  useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      // Use the dedicated analytics endpoint that returns ALL institution questions
      // (staff-added + AI-generated), not filtered by department
      const res = await api.get('/api/questions/analytics/');
      const data = res.data;

      setStats({
        totalQuestions: data.total_questions ?? 0,
        totalPapers: data.total_papers ?? 0,
        subjectData: data.subject_data ?? [],
        difficultyData: data.difficulty_data ?? [],
        bloomData: data.bloom_data ?? [],
        deptData: data.dept_data ?? [],
        trendData: data.trend_data ?? [],
      });
    } catch (err) {
      console.error('Analytics fetch error:', err);
      setError('Failed to load analytics data. Please check that the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-64 gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"></div>
          <p className="text-sm text-gray-400 dark:text-slate-500">Loading analytics…</p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-64 gap-4 text-center">
          <AlertCircle className="w-12 h-12 text-red-500" />
          <p className="text-red-500 font-medium">{error}</p>
          <button
            onClick={fetchStats}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
          >
            Retry
          </button>
        </div>
      </Layout>
    );
  }

  const hasQuestions = (stats?.totalQuestions ?? 0) > 0;

  return (
    <Layout>
      <div className="space-y-6">

        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics &amp; Insights</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
            Institution-wide overview — all staff and AI-generated questions
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            icon={<BookOpen className="w-6 h-6" />}
            label="Total Questions"
            value={stats?.totalQuestions ?? 0}
            color="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
          />
          <StatCard
            icon={<FileText className="w-6 h-6" />}
            label="Papers Generated"
            value={stats?.totalPapers ?? 0}
            color="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
          />
          <StatCard
            icon={<TrendingUp className="w-6 h-6" />}
            label="Platform Usage"
            value="Active"
            color="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
          />
        </div>

        {/* No questions banner */}
        {!hasQuestions && (
          <Card className="p-4 flex items-center space-x-3 border border-yellow-400/30 bg-yellow-50 dark:bg-yellow-900/10">
            <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0" />
            <p className="text-sm text-yellow-700 dark:text-yellow-400">
              No questions found yet across the institution. Staff members and AI generation will populate the charts below.
            </p>
          </Card>
        )}

        {/* Charts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Questions by Subject */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Questions by Subject</h3>
            <div className="h-72">
              {stats?.subjectData?.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.subjectData} margin={{ top: 4, right: 8, left: -10, bottom: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                    <RechartsTooltip
                      contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 8, color: '#f1f5f9' }}
                    />
                    <Legend />
                    <Bar dataKey="value" name="Questions" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <EmptyChart message="Add questions to see subject distribution" />
              )}
            </div>
          </Card>

          {/* Difficulty Spread */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Difficulty Spread</h3>
            <div className="h-72">
              {stats?.difficultyData?.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.difficultyData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {stats.difficultyData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 8, color: '#f1f5f9' }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <EmptyChart message="Add questions to see difficulty spread" />
              )}
            </div>
          </Card>

          {/* Bloom's Taxonomy */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Bloom's Taxonomy Breakdown</h3>
            <div className="h-72">
              {stats?.bloomData?.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.bloomData} layout="vertical" margin={{ top: 4, right: 16, left: 4, bottom: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                    <YAxis dataKey="name" type="category" width={90} tick={{ fontSize: 11 }} />
                    <RechartsTooltip
                      contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 8, color: '#f1f5f9' }}
                    />
                    <Legend />
                    <Bar dataKey="value" name="Questions" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <EmptyChart message="No Bloom's taxonomy data yet" />
              )}
            </div>
          </Card>

          {/* Questions by Department */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              Contributions by Department
            </h3>
            <p className="text-xs text-gray-400 dark:text-slate-500 mb-4">
              Questions added by each department's staff
            </p>
            <div className="h-72">
              {stats?.deptData?.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.deptData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      paddingAngle={4}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {stats.deptData.map((_, index) => (
                        <Cell key={`dept-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 8, color: '#f1f5f9' }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <EmptyChart message="Staff contributions will appear here" />
              )}
            </div>
          </Card>

          {/* Paper Generation Trend */}
          <Card className="p-6 md:col-span-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Paper Generation Activity</h3>
            <div className="h-64">
              {stats?.trendData?.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats.trendData} margin={{ top: 4, right: 24, left: -10, bottom: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                    <RechartsTooltip
                      contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 8, color: '#f1f5f9' }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="papers"
                      name="Papers Created"
                      stroke="#10b981"
                      strokeWidth={2}
                      dot={{ r: 4, fill: '#10b981' }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <EmptyChart message="Generate papers to see activity trend" />
              )}
            </div>
          </Card>

        </div>
      </div>
    </Layout>
  );
};

export default AnalyticsDashboard;
