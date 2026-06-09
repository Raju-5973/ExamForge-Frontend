import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Layout } from '../components/Layout';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { BookOpen, Plus, TrendingUp, HelpCircle, CheckCircle, PieChart as PieIcon, BarChart3, Sparkles, X } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';
import { useNavigate } from 'react-router-dom';

export const StaffDashboard = () => {
  const { user, API_URL } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    total: 0,
    bySubject: {},
    byDifficulty: { Easy: 0, Medium: 0, Hard: 0 }
  });
  const [showHelp, setShowHelp] = useState(false);

  const loadStats = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/questions/`, {
        headers: {
          'Authorization': `Token ${user?.token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        const newStats = {
          total: data.length,
          bySubject: {},
          byDifficulty: { Easy: 0, Medium: 0, Hard: 0 }
        };

        data.forEach(q => {
          newStats.bySubject[q.subject] = (newStats.bySubject[q.subject] || 0) + 1;
          newStats.byDifficulty[q.difficulty] = (newStats.byDifficulty[q.difficulty] || 0) + 1;
        });

        setStats(newStats);
      }
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  }, [API_URL, user?.token]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return (
    <Layout>
      <div className="space-y-6">
        {/* Premium Welcome Banner */}
        <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 rounded-2xl p-8 text-white shadow-xl overflow-hidden">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-16 -right-16 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-1/3 w-48 h-48 bg-blue-400/20 rounded-full blur-2xl" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="w-5 h-5 text-blue-200" />
              <span className="text-blue-200 text-sm font-medium uppercase tracking-wider">Staff Dashboard</span>
            </div>
            <h2 className="text-4xl font-extrabold tracking-tight mb-2">
              Welcome back, {user?.name}!
            </h2>
            <p className="text-blue-100 text-lg mb-8 max-w-lg leading-relaxed">
              Managing the <span className="font-bold text-white underline decoration-blue-400 underline-offset-4">{user?.department || 'General'}</span> department bank. 
              You've contributed {stats.total} questions so far.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button 
                onClick={() => navigate('/question-bank')} 
                className="bg-white text-blue-600 hover:bg-blue-50 border-none shadow-lg shadow-blue-900/20 transform hover:-translate-y-1 transition-all duration-200"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add New Question
              </Button>
              <Button 
                onClick={() => navigate('/question-bank')} 
                variant="outline" 
                className="text-white border-white/30 hover:bg-white/10 backdrop-blur-sm transform hover:-translate-y-1 transition-all duration-200"
              >
                <BookOpen className="w-5 h-5 mr-2" />
                Explore Question Bank
              </Button>
            </div>
          </div>
        </div>

        {/* Modern Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card noPadding className="p-6 group hover:border-blue-400 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Total Questions</p>
                <p className="text-3xl font-black text-gray-900 dark:text-white mt-1">{stats.total}</p>
              </div>
              <div className="p-4 bg-blue-100 dark:bg-blue-500/20 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                <HelpCircle className="w-7 h-7 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs font-bold text-blue-600 dark:text-blue-400">
              <span className="bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full">ACTIVE BANK</span>
            </div>
          </Card>

          <Card noPadding className="p-6 group hover:border-green-400 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Easy Level</p>
                <p className="text-3xl font-black text-gray-900 dark:text-white mt-1">{stats.byDifficulty.Easy}</p>
              </div>
              <div className="p-4 bg-green-100 dark:bg-green-500/20 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                <CheckCircle className="w-7 h-7 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs font-bold text-green-600 dark:text-green-400">
              <span className="bg-green-50 dark:bg-green-900/30 px-2 py-0.5 rounded-full">READY</span>
            </div>
          </Card>

          <Card noPadding className="p-6 group hover:border-amber-400 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Medium Level</p>
                <p className="text-3xl font-black text-gray-900 dark:text-white mt-1">{stats.byDifficulty.Medium}</p>
              </div>
              <div className="p-4 bg-amber-100 dark:bg-amber-500/20 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="w-7 h-7 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs font-bold text-amber-600 dark:text-amber-400">
              <span className="bg-amber-50 dark:bg-amber-900/30 px-2 py-0.5 rounded-full">STEADY</span>
            </div>
          </Card>

          <Card noPadding className="p-6 group hover:border-red-400 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Hard Level</p>
                <p className="text-3xl font-black text-gray-900 dark:text-white mt-1">{stats.byDifficulty.Hard}</p>
              </div>
              <div className="p-4 bg-red-100 dark:bg-red-500/20 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="w-7 h-7 text-red-600 dark:text-red-400 rotate-45" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs font-bold text-red-600 dark:text-red-400">
              <span className="bg-red-50 dark:bg-red-900/30 px-2 py-0.5 rounded-full">ADVANCED</span>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Enhanced Charts */}
          <Card noPadding className="overflow-hidden border border-gray-100 dark:border-slate-700">
            <div className="px-6 py-4 border-b border-gray-50 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/50 flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-gray-900 dark:text-white">Questions per Subject</h3>
            </div>
            <div className="p-6">
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={Object.entries(stats.bySubject).map(([name, count]) => ({ name, count }))}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                    <XAxis dataKey="name" fontSize={10} tick={{fill: '#888'}} axisLine={false} tickLine={false} />
                    <YAxis fontSize={10} tick={{fill: '#888'}} axisLine={false} tickLine={false} />
                    <Tooltip 
                      cursor={{fill: 'rgba(59, 130, 246, 0.05)'}}
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', backgroundColor: '#fff' }}
                    />
                    <Bar dataKey="count" fill="url(#blueGradient)" radius={[6, 6, 0, 0]} barSize={35} />
                    <defs>
                      <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3B82F6" />
                        <stop offset="100%" stopColor="#60A5FA" />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Card>

          <Card noPadding className="overflow-hidden border border-gray-100 dark:border-slate-700">
            <div className="px-6 py-4 border-b border-gray-50 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/50 flex items-center space-x-2">
              <PieIcon className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-gray-900 dark:text-white">Difficulty Breakdown</h3>
            </div>
            <div className="p-6">
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={Object.entries(stats.byDifficulty).map(([name, count]) => ({ name, count })).filter(d => d.count > 0)}
                      cx="50%" cy="50%" innerRadius={65} outerRadius={85} paddingAngle={8} dataKey="count"
                    >
                      <Cell fill="#10B981" stroke="none" />
                      <Cell fill="#F59E0B" stroke="none" />
                      <Cell fill="#EF4444" stroke="none" />
                    </Pie>
                    <Tooltip 
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions and Help */}
          <Card className="lg:col-span-2">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
              <Sparkles className="w-5 h-5 mr-2 text-yellow-500" />
              Quick Actions
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button 
                onClick={() => navigate('/question-bank')}
                className="group p-5 rounded-2xl bg-blue-50 dark:bg-blue-900/20 border-2 border-transparent hover:border-blue-200 dark:hover:border-blue-800 transition-all text-left"
              >
                <div className="p-3 bg-blue-600 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform">
                  <Plus className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-bold text-gray-900 dark:text-white">Add New Question</h4>
                <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Populate your department's question bank with new content.</p>
              </button>

              <button 
                onClick={() => navigate('/question-bank')}
                className="group p-5 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 border-2 border-transparent hover:border-indigo-200 dark:hover:border-indigo-800 transition-all text-left"
              >
                <div className="p-3 bg-indigo-600 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-bold text-gray-900 dark:text-white">Explore Bank</h4>
                <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Review, edit, or delete existing questions in your bank.</p>
              </button>
            </div>
          </Card>

          <div className="space-y-6">
            <Card className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white border-none shadow-blue-500/20">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-white/20 rounded-lg">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-lg">Need Support?</h3>
              </div>
              <p className="text-blue-100 text-sm mb-6 leading-relaxed">
                New to ExamForge? Learn how to structure questions and manage your department's bank effectively.
              </p>
              <Button 
                onClick={() => setShowHelp(true)}
                className="w-full bg-white text-blue-600 hover:bg-blue-50 border-none font-bold"
              >
                Open Guide
              </Button>
            </Card>
          </div>
        </div>

        {/* Help Guide Modal */}
        {showHelp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <Card noPadding className="w-full max-w-lg max-h-[72vh] overflow-hidden relative shadow-2xl border-none">
              <div className="p-6 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center bg-gray-50/50 dark:bg-slate-800/50">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-600 rounded-xl">
                    <HelpCircle className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-black text-gray-900 dark:text-white">Staff Guide</h2>
                </div>
                <button 
                  onClick={() => setShowHelp(false)}
                  className="p-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-gray-500" />
                </button>
              </div>

              <div className="p-5 overflow-y-auto max-h-[calc(72vh-150px)] space-y-6 text-sm">
                <section className="space-y-4">
                  <div className="flex items-center space-x-3 text-blue-600 dark:text-blue-400">
                    <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                      <Plus className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-lg">Creating Questions</h3>
                  </div>
                  <div className="pl-12 space-y-4">
                    <div className="flex items-start space-x-4">
                      <div className="w-8 h-8 bg-gray-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 rounded-full flex-shrink-0 flex items-center justify-center font-bold">1</div>
                      <p className="text-gray-600 dark:text-slate-300 leading-relaxed">Go to <span className="font-bold text-gray-900 dark:text-white">Add Question</span> and fill in the text, subject, and marks.</p>
                    </div>
                    <div className="flex items-start space-x-4">
                      <div className="w-8 h-8 bg-gray-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 rounded-full flex-shrink-0 flex items-center justify-center font-bold">2</div>
                      <p className="text-gray-600 dark:text-slate-300 leading-relaxed">Assign a <span className="font-bold text-gray-900 dark:text-white">Difficulty Level</span> (Easy, Medium, Hard) to help with balanced paper generation.</p>
                    </div>
                  </div>
                </section>

                <section className="space-y-4">
                  <div className="flex items-center space-x-3 text-indigo-600 dark:text-indigo-400">
                    <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-lg">Bank Management</h3>
                  </div>
                  <div className="pl-12 space-y-4">
                    <p className="text-gray-600 dark:text-slate-300 leading-relaxed italic">
                      You are limited to managing questions within your assigned department: <span className="font-bold text-indigo-600">{user?.department || 'General'}</span>.
                    </p>
                  </div>
                </section>
              </div>

              <div className="p-6 bg-gray-50 dark:bg-slate-800/50 border-t border-gray-100 dark:border-slate-700">
                <Button 
                  onClick={() => setShowHelp(false)}
                  className="w-full font-bold h-12"
                >
                  Got it, let's go!
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  );

};

