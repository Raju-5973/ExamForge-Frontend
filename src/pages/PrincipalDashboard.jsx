import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Card } from '../components/Card';
import { Select } from '../components/Select';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { FileText, Plus, Trash2, Sparkles, Loader2, BarChart3, Clock, Award, CheckCircle, X, PieChart as PieIcon, UserCheck, LineChart } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, AreaChart, Area
} from 'recharts';
import toast from 'react-hot-toast';


const SUBJECTS = [
  { value: 'Mathematics', label: 'Mathematics' },
  { value: 'Physics', label: 'Physics' },
  { value: 'Chemistry', label: 'Chemistry' },
  { value: 'Biology', label: 'Biology' },
  { value: 'English', label: 'English' },
  { value: 'Computer Science', label: 'Computer Science' },
  { value: 'Electronics', label: 'Electronics' },
  { value: 'Electrical', label: 'Electrical' },
  { value: 'Mechanical', label: 'Mechanical' },
  { value: 'Civil', label: 'Civil' },
];

export const PrincipalDashboard = () => {
  const { user, API_URL } = useAuth();
  const navigate = useNavigate();
  const [subject, setSubject] = useState('');
  const [marksRows, setMarksRows] = useState([
    { id: '1', marks: '', count: '' },
  ]);
  const [error, setError] = useState('');
  const [availableQuestions, setAvailableQuestions] = useState([]);
  const [recentPapers, setRecentPapers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [backendOnline, setBackendOnline] = useState(null); // null = checking
  const [staffCount, setStaffCount] = useState(null);

   const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [questionsRes, papersRes] = await Promise.all([
        fetch(`${API_URL}/api/questions/`, {
          headers: { 'Authorization': `Token ${user?.token}` },
        }),
        fetch(`${API_URL}/api/papers/`, {
          headers: { 'Authorization': `Token ${user?.token}` },
        })
      ]);

      if (questionsRes.ok) {
        const questionsData = await questionsRes.json();
        setAvailableQuestions(questionsData);
      }

      if (papersRes.ok) {
        const papersData = await papersRes.json();
        setRecentPapers(papersData);
      }
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [API_URL, user?.token]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Fetch staff account count
  useEffect(() => {
    const fetchStaffCount = async () => {
      try {
        const res = await fetch(`${API_URL}/api/staff-accounts/`, {
          headers: { Authorization: `Token ${user?.token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setStaffCount(data.length);
        }
      } catch {
        // silent
      }
    };
    fetchStaffCount();
  }, [API_URL, user?.token]);

  // Backend health-check — runs on mount and every 30 s
  useEffect(() => {
    const checkBackend = async () => {
      try {
        const res = await fetch(`${API_URL}/api/questions/`, {
          headers: { 'Authorization': `Token ${user?.token}` },
          signal: AbortSignal.timeout(5000),
        });
        setBackendOnline(res.ok || res.status === 401);
      } catch {
        setBackendOnline(false);
      }
    };
    checkBackend();
    const interval = setInterval(checkBackend, 30000);
    return () => clearInterval(interval);
  }, [API_URL, user?.token]);

  const addMarksRow = () => {
    setMarksRows([...marksRows, { id: Date.now().toString(), marks: '', count: '' }]);
  };

  const removeMarksRow = (id) => {
    if (marksRows.length > 1) {
      setMarksRows(marksRows.filter((row) => row.id !== id));
    }
  };

  const updateMarksRow = (id, field, value) => {
    setMarksRows(marksRows.map((row) => (row.id === id ? { ...row, [field]: value } : row)));
  };

  const handleGenerate = async () => {
    setError('');

    if (!subject) {
      setError('Please select a subject');
      return;
    }

    // Validate marks distribution
    const distribution = marksRows
      .filter((row) => row.marks && row.count)
      .map((row) => ({
        marks: parseInt(row.marks),
        count: parseInt(row.count),
      }));

    if (distribution.length === 0) {
      setError('Please add at least one marks distribution');
      return;
    }

    if (distribution.some((d) => isNaN(d.marks) || isNaN(d.count) || d.marks <= 0 || d.count <= 0)) {
      setError('All marks and counts must be positive numbers');
      return;
    }

    // Get questions for the selected subject (or department)
    const subjectQuestions = availableQuestions.filter((q) => q.subject === subject || q.department === subject);

    if (subjectQuestions.length === 0) {
      setError(`No questions available for ${subject}`);
      return;
    }

    // Check if we have enough questions
    const totalRequired = distribution.reduce((sum, d) => sum + d.count, 0);
    if (subjectQuestions.length < totalRequired) {
      setError(
        `Not enough questions available. Required: ${totalRequired}, Available: ${subjectQuestions.length}`
      );
      return;
    }

    // Generate the paper
    const selectedQuestions = [];
    const usedQuestions = new Set();

    for (const { marks, count } of distribution) {
      const matchingQuestions = subjectQuestions.filter(
        (q) => q.marks === marks && !usedQuestions.has(q.id)
      );

      if (matchingQuestions.length < count) {
        setError(
          `Not enough ${marks}-mark questions available. Required: ${count}, Available: ${matchingQuestions.length}`
        );
        return;
      }

      // Randomly select questions
      const shuffled = [...matchingQuestions].sort(() => Math.random() - 0.5);
      for (let i = 0; i < count; i++) {
        selectedQuestions.push(shuffled[i]);
        usedQuestions.add(shuffled[i].id);
      }
    }

     // Save to Backend and navigate
    try {
      setIsGenerating(true);
      const payload = {
        subject,
        questions: selectedQuestions.map(q => q.id),
        distribution,
      };

      const response = await fetch(`${API_URL}/api/papers/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${user?.token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        // Custom Toast Notification
        toast.custom((t) => (
          <div
            className={`${
              t.visible ? 'animate-enter' : 'animate-leave'
            } max-w-md w-full bg-white dark:bg-slate-800 shadow-xl rounded-2xl pointer-events-auto flex ring-1 ring-black ring-opacity-5 overflow-hidden transition-all duration-300`}
          >
            <div className="flex-1 w-0 p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 pt-0.5">
                   <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center">
                     <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                   </div>
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-bold text-gray-900 dark:text-white">
                    Question Paper Generated!
                  </p>
                  <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
                    The {subject} paper is ready for review and download.
                  </p>
                </div>
              </div>
            </div>
            <div className="flex border-l border-gray-200 dark:border-slate-700">
              <button
                onClick={() => toast.dismiss(t.id)}
                className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-gray-400 hover:text-gray-500 dark:hover:text-slate-300 focus:outline-none"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        ), { duration: 4000 });

        const paperData = {
          subject,
          questions: selectedQuestions,
          distribution,
        };
        sessionStorage.setItem('generated_paper', JSON.stringify(paperData));
        navigate('/question-paper');
      } else {
        const data = await response.json();
        const msg = data.message || 'Failed to save question paper';
        setError(msg);
        toast.error(msg);
      }
    } catch (err) {
      setError('Network error. Please try again.');
      toast.error('Connection failed.');
    } finally {
      setIsGenerating(false);
    }
  };

  const getQuestionCount = (subject) => {
    return availableQuestions.filter((q) => q.subject === subject || q.department === subject).length;
  };

  // Prepare chart data
  const safeQuestions = Array.isArray(availableQuestions) ? availableQuestions : [];

  const SUBJECT_SHORT = {
    'Mathematics':      'Math',
    'Physics':          'Phys',
    'Chemistry':        'Chem',
    'Biology':          'Bio',
    'English':          'Eng',
    'Computer Science': 'CS',
    'Electronics':      'ECE',
    'Electrical':       'EEE',
    'Mechanical':       'Mech',
    'Civil':            'Civil',
  };

  const subjectData = SUBJECTS.map(s => ({
    name: s.label,
    short: SUBJECT_SHORT[s.label] || s.label,
    count: safeQuestions.filter(q => q.subject === s.value || q.department === s.value).length
  }));

  // Custom XAxis tick: show short label always, full name on hover via title
  const CustomXAxisTick = ({ x, y, payload }) => {
    const full  = payload.value;
    const short = SUBJECT_SHORT[full] || full;
    return (
      <g transform={`translate(${x},${y})`}>
        <title>{full}</title>
        <text
          x={0} y={0} dy={12}
          textAnchor="middle"
          fill="#888"
          fontSize={10}
          fontWeight={500}
        >
          {short}
        </text>
      </g>
    );
  };

  const difficultyData = [
    { name: 'Easy', count: safeQuestions.filter(q => q.difficulty === 'Easy').length, color: '#10B981' },
    { name: 'Medium', count: safeQuestions.filter(q => q.difficulty === 'Medium').length, color: '#F59E0B' },
    { name: 'Hard', count: safeQuestions.filter(q => q.difficulty === 'Hard').length, color: '#EF4444' },
  ];

  // Combined activity data
  
  // 1. Low Question Alerts
  const LOW_THRESHOLD = 5;
  const lowStockAlerts = SUBJECTS
    .map(s => ({
      subject: s.label,
      count: getQuestionCount(s.value)
    }))
    .filter(s => s.count < LOW_THRESHOLD)
    .sort((a, b) => a.count - b.count);

  // 2. Activity Feed (Combined Questions and Papers)
  const activityItems = [
    ...safeQuestions.map(q => ({
      id: `q-${q.id}`,
      type: 'question',
      user: q.created_by_name || 'Staff',
      subject: q.subject,
      time: new Date(q.created_at),
      desc: `added a new ${q.difficulty} question`
    })),
    ...recentPapers.map(p => ({
      id: `p-${p.id}`,
      type: 'paper',
      user: p.created_by_name || 'Principal',
      subject: p.subject,
      time: new Date(p.created_at),
      desc: `generated a question paper`
    }))
  ]
  .sort((a, b) => b.time - a.time)
  .slice(0, 10);

  // 3. Heatmap Data (Subject vs Difficulty)
  const heatmapData = SUBJECTS.map(s => ({
    subject: s.label,
    easy: safeQuestions.filter(q => (q.subject === s.value || q.department === s.value) && q.difficulty === 'Easy').length,
    medium: safeQuestions.filter(q => (q.subject === s.value || q.department === s.value) && q.difficulty === 'Medium').length,
    hard: safeQuestions.filter(q => (q.subject === s.value || q.department === s.value) && q.difficulty === 'Hard').length,
  }));

  // 4. Paper Trends (Last 7 Days)
  const last7Days = [...Array(7)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().split('T')[0];
  }).reverse();

  const trendData = last7Days.map(date => ({
    date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    count: recentPapers.filter(p => p.created_at.startsWith(date)).length
  }));


  return (
    <Layout>
      <div className="space-y-6">
        {/* Premium Institutional Banner */}
        <div className="relative bg-gradient-to-r from-purple-600 via-indigo-600 to-indigo-700 rounded-2xl p-8 text-white shadow-xl overflow-hidden">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-16 -right-16 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-1/3 w-48 h-48 bg-purple-400/20 rounded-full blur-2xl" />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-xl">
              <div className="flex items-center space-x-2 mb-2">
                <Award className="w-5 h-5 text-purple-200" />
                <span className="text-purple-200 text-sm font-medium uppercase tracking-wider">Principal Dashboard</span>
              </div>
              <h2 className="text-4xl font-extrabold tracking-tight mb-2">
                Welcome back, {user?.name}!
              </h2>
              <p className="text-purple-100 text-lg leading-relaxed">
                Overseeing the academic excellence of <span className="font-bold text-white underline underline-offset-4 decoration-purple-400">ExamForge Institutional Repository</span>.
              </p>
            </div>
            <div className="flex-shrink-0">
               <div className="flex gap-3">
                 <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 text-center">
                   <p className="text-xs uppercase tracking-widest text-purple-200 font-bold mb-1">Total Repository</p>
                   <p className="text-3xl font-black">{availableQuestions.length}</p>
                   <p className="text-[10px] text-purple-200 mt-1">QUESTIONS STORED</p>
                 </div>
                 <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 text-center">
                   <p className="text-xs uppercase tracking-widest text-purple-200 font-bold mb-1">Staff Members</p>
                   <p className="text-3xl font-black">{staffCount ?? '…'}</p>
                   <p className="text-[10px] text-purple-200 mt-1">ACCOUNTS</p>
                 </div>
               </div>
            </div>
          </div>
        </div>

        {isLoading && (
          <Card className="p-6 text-center text-gray-600 dark:text-slate-300">
            <div className="flex items-center justify-center gap-3">
              <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
              Loading dashboard data...
            </div>
          </Card>
        )}

        {/* Enhanced Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card noPadding className="overflow-hidden border border-gray-100 dark:border-slate-700">
            <div className="px-6 py-4 border-b border-gray-50 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/50 flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-gray-900 dark:text-white">Institution-wide Distribution</h3>
            </div>
            <div className="p-6">
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={subjectData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                    <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} tick={<CustomXAxisTick />} interval={0} />
                    <YAxis fontSize={10} tick={{fill: '#888'}} axisLine={false} tickLine={false} />
                    <Tooltip 
                      cursor={{fill: 'rgba(59, 130, 246, 0.05)'}}
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="count" fill="#3B82F6" radius={[6, 6, 0, 0]} barSize={30} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Card>

          <Card noPadding className="overflow-hidden border border-gray-100 dark:border-slate-700">
            <div className="px-6 py-4 border-b border-gray-50 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/50 flex items-center space-x-2">
              <PieIcon className="w-5 h-5 text-purple-600" />
              <h3 className="font-bold text-gray-900 dark:text-white">Difficulty Metrics</h3>
            </div>
            <div className="p-6">
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={difficultyData.filter(d => d.count > 0)}
                      cx="50%" cy="50%" innerRadius={65} outerRadius={85} paddingAngle={8} dataKey="count"
                    >
                      {difficultyData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '16px', border: 'none' }} />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Card>
        </div>

        {/* Paper Generation Trends & Activity Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card noPadding className="lg:col-span-2 overflow-hidden border border-gray-100 dark:border-slate-700">
             <div className="px-6 py-4 border-b border-gray-50 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/50 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <LineChart className="w-5 h-5 text-indigo-600" />
                  <h3 className="font-bold text-gray-900 dark:text-white">Paper Generation Velocity</h3>
                </div>
                <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md uppercase">Last 7 Days</span>
             </div>
             <div className="p-6">
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendData}>
                      <defs>
                        <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                      <XAxis dataKey="date" fontSize={10} axisLine={false} tickLine={false} />
                      <YAxis fontSize={10} axisLine={false} tickLine={false} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      />
                      <Area type="monotone" dataKey="count" stroke="#6366f1" fillOpacity={1} fill="url(#colorCount)" strokeWidth={3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
             </div>
          </Card>

          <Card noPadding className="overflow-hidden border border-gray-100 dark:border-slate-700">
             <div className="px-6 py-4 border-b border-gray-50 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/50 flex items-center space-x-2">
                <Clock className="w-5 h-5 text-orange-600" />
                <h3 className="font-bold text-gray-900 dark:text-white">Recent Activity</h3>
             </div>
             <div className="p-4 h-[220px] overflow-hidden">
                <div className="space-y-4">
                  {activityItems.length > 0 ? activityItems.map((item) => (
                    <div key={item.id} className="flex gap-3 items-start">
                      <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${item.type === 'question' ? 'bg-blue-500' : 'bg-purple-500'}`} />
                      <div>
                        <p className="text-xs text-gray-800 dark:text-slate-200">
                          <span className="font-bold">{item.user}</span> {item.desc} for <span className="font-bold text-indigo-600">{item.subject}</span>
                        </p>
                        <p className="text-[10px] text-gray-400 mt-0.5">{item.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </div>
                  )) : (
                    <p className="text-center text-xs text-gray-400 py-10">No recent activity</p>
                  )}
                </div>
             </div>
          </Card>
        </div>

        {/* Question Coverage Heatmap & Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           <Card noPadding className="lg:col-span-2 overflow-hidden border border-gray-100 dark:border-slate-700">
              <div className="px-6 py-4 border-b border-gray-50 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/50 flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-gray-900 dark:text-white">Quality Coverage Matrix</h3>
              </div>
              <div className="p-6 overflow-x-auto">
                 <table className="w-full table-fixed min-w-[500px]">
                    <thead>
                      <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50 dark:border-slate-800">
                        <th className="pb-4 text-left w-1/3">Subject Name</th>
                        <th className="pb-4 text-center">Easy</th>
                        <th className="pb-4 text-center">Medium</th>
                        <th className="pb-4 text-center">Hard</th>
                        <th className="pb-4 text-right pr-2">Stock Health</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-slate-800/50">
                      {heatmapData.map((row, i) => {
                        const total = row.easy + row.medium + row.hard;
                        const health = Math.min(100, (total / 15) * 100);
                        return (
                          <tr key={i} className="group hover:bg-gray-50/30 dark:hover:bg-slate-800/30 transition-colors">
                            <td className="py-4 text-xs font-extrabold text-gray-700 dark:text-slate-200">{row.subject}</td>
                            <td className="py-4">
                              <div className="flex justify-center">
                                <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black shadow-sm transition-transform group-hover:scale-110 ${row.easy > 0 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-gray-100 text-gray-400 dark:bg-slate-800 dark:text-slate-600'}`}>
                                  {row.easy}
                                </span>
                              </div>
                            </td>
                            <td className="py-4">
                              <div className="flex justify-center">
                                <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black shadow-sm transition-transform group-hover:scale-110 ${row.medium > 0 ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' : 'bg-gray-100 text-gray-400 dark:bg-slate-800 dark:text-slate-600'}`}>
                                  {row.medium}
                                </span>
                              </div>
                            </td>
                            <td className="py-4">
                              <div className="flex justify-center">
                                <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black shadow-sm transition-transform group-hover:scale-110 ${row.hard > 0 ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400' : 'bg-gray-100 text-gray-400 dark:bg-slate-800 dark:text-slate-600'}`}>
                                  {row.hard}
                                </span>
                              </div>
                            </td>
                            <td className="py-4">
                              <div className="flex flex-col items-end pr-2 gap-1.5">
                                <div className="w-20 bg-gray-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden border border-gray-200/50 dark:border-slate-700/50">
                                  <div 
                                    className={`h-full rounded-full transition-all duration-1000 ${health > 70 ? 'bg-gradient-to-r from-emerald-400 to-emerald-600' : health > 30 ? 'bg-gradient-to-r from-amber-400 to-amber-600' : 'bg-gradient-to-r from-rose-400 to-rose-600'}`} 
                                    style={{ width: `${health}%` }} 
                                  />
                                </div>
                                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">{health.toFixed(0)}% Coverage</span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                 </table>
              </div>
           </Card>

           <div className="space-y-6">
              {lowStockAlerts.length > 0 && (
                <Card noPadding className="overflow-hidden border border-rose-100 dark:border-rose-900/30 bg-rose-50/30 dark:bg-rose-900/10">
                  <div className="px-6 py-4 border-b border-rose-100 dark:border-rose-900/30 flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-rose-600" />
                    <h3 className="font-bold text-rose-900 dark:text-rose-400">Inventory Alerts</h3>
                  </div>
                  <div className="p-4 space-y-3">
                    {lowStockAlerts.slice(0, 4).map((alert, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-white/50 dark:bg-slate-900/50 rounded-xl border border-rose-100 dark:border-rose-900/30">
                        <span className="text-xs font-bold text-gray-700 dark:text-slate-300">{alert.subject}</span>
                        <span className="text-xs font-black text-rose-600 px-2 py-1 bg-rose-100 rounded-lg">{alert.count} Qs</span>
                      </div>
                    ))}
                    {lowStockAlerts.length > 4 && (
                      <p className="text-center text-[10px] font-bold text-rose-400 uppercase">+{lowStockAlerts.length - 4} More Subjects Low</p>
                    )}
                  </div>
                </Card>
              )}

              <Card className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white border-none shadow-xl">
                 <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Award className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-lg">Academic Health</h3>
                </div>
                <p className="text-xs opacity-80 leading-relaxed">
                  The institutional repository is currently at <span className="font-bold">{(availableQuestions.length / 500 * 100).toFixed(1)}%</span> of its quarterly target of 500 questions.
                </p>
                <div className="mt-4 bg-white/10 h-2 rounded-full overflow-hidden">
                  <div className="bg-white h-full rounded-full" style={{ width: `${Math.min(100, (availableQuestions.length / 500 * 100))}%` }} />
                </div>
              </Card>
           </div>
        </div>


        {/* Generation Form and Staff Row */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2">
            <Card noPadding className="overflow-hidden border border-gray-100 dark:border-slate-700">
              <div className="px-6 py-4 border-b border-gray-50 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/50 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-500/20 rounded-xl">
                    <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">Automated Paper Generator</h3>
                    <p className="text-xs text-gray-500 dark:text-slate-400">Define criteria to build a balanced exam paper</p>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300">Target Subject</label>
                    <Select
                      placeholder="Choose a subject..."
                      options={SUBJECTS}
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                    />
                    {subject && (
                      <p className="text-[10px] text-blue-600 font-bold uppercase mt-1">
                        {getQuestionCount(subject)} Questions Available
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <label className="block text-sm font-semibold text-transparent select-none mb-1">Spacer</label>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      onClick={addMarksRow} 
                      className="w-full h-11 border-2 border-dashed border-purple-200 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                    >
                      <Plus className="w-4 h-4 mr-2" /> Add Marks Criteria
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Blueprint Configuration</h4>
                  <div className="space-y-3">
                    {marksRows.map((row, index) => (
                      <div key={row.id} className="group flex items-start gap-3 p-4 bg-gray-50 dark:bg-slate-900/50 rounded-2xl border-2 border-transparent hover:border-purple-100 transition-all">
                        <div className="flex-1">
                          <Input
                            label={index === 0 ? 'Marks per Question' : <span className="invisible select-none">Marks per Question</span>}
                            type="number"
                            min="1"
                            placeholder="e.g. 5"
                            value={row.marks}
                            onChange={(e) => updateMarksRow(row.id, 'marks', e.target.value)}
                          />
                        </div>
                        <div className="flex-1">
                          <Input
                            label={index === 0 ? 'Question Count' : <span className="invisible select-none">Question Count</span>}
                            type="number"
                            min="1"
                            placeholder="e.g. 10"
                            value={row.count}
                            onChange={(e) => updateMarksRow(row.id, 'count', e.target.value)}
                          />
                        </div>
                        <div className="flex flex-col">
                          {index === 0 && <label className="block text-sm font-medium text-transparent mb-1 select-none">Action</label>}
                          <Button
                            type="button"
                            variant="danger"
                            size="md"
                            onClick={() => removeMarksRow(row.id)}
                            disabled={marksRows.length === 1}
                            className="h-11 w-11 p-0 rounded-xl"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {error && (
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-100 dark:border-red-900/30 rounded-2xl flex items-center gap-3">
                    <X className="w-5 h-5 text-red-600" />
                    <p className="text-sm font-bold text-red-700 dark:text-red-400">{error}</p>
                  </div>
                )}

                <Button 
                  type="button" 
                  variant="primary" 
                  size="lg" 
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="w-full py-4 text-lg font-black shadow-xl shadow-blue-500/20"
                >
                  {isGenerating ? (
                    <><Loader2 className="w-6 h-6 mr-2 animate-spin" /> Crafting Paper...</>
                  ) : (
                    <><Sparkles className="w-6 h-6 mr-2" /> GENERATE FINAL PAPER</>
                  )}
                </Button>
              </div>
            </Card>
          </div>

          <div className="space-y-6">

            {/* View All Staff link */}
            <button
              onClick={() => navigate('/staff-accounts')}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 text-sm font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-all shadow-sm hover:shadow-md"
            >
              <UserCheck className="w-4 h-4" />
              View All Staff Accounts
            </button>

            <Card className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white border-none shadow-xl">
               <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Clock className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-lg">Live Status</h3>
              </div>
              <div className="space-y-4">
                 <div className="flex justify-between items-center text-xs">
                   <span className="opacity-70">Backend Connectivity</span>
                   {backendOnline === null ? (
                     <span className="flex items-center gap-1 opacity-70">
                       <span className="w-2 h-2 bg-yellow-300 rounded-full animate-pulse"></span> Checking…
                     </span>
                   ) : backendOnline ? (
                     <span className="flex items-center gap-1">
                       <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span> Server Online
                     </span>
                   ) : (
                     <span className="flex items-center gap-1 text-red-300 font-bold">
                       <span className="w-2 h-2 bg-red-400 rounded-full"></span> Server Offline
                     </span>
                   )}
                 </div>
                 <div className="flex justify-between items-center text-xs">
                   <span className="opacity-70">Question Bank Stability</span>
                   <span className="font-bold">100% SECURE</span>
                 </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Recent Papers */}
        {recentPapers.length > 0 && (
          <Card noPadding className="overflow-hidden border border-gray-100 dark:border-slate-700">
            <div className="px-6 py-4 border-b border-gray-50 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/50 flex items-center space-x-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-gray-900 dark:text-white">Recent Generated Blueprints</h3>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentPapers.map((paper) => (
                <div 
                  key={paper.id}
                  className="p-5 bg-white dark:bg-slate-900 border-2 border-gray-50 dark:border-slate-800 rounded-2xl hover:border-purple-300 dark:hover:border-purple-500/50 transition-all cursor-pointer group shadow-sm hover:shadow-lg"
                  onClick={() => {
                    const paperData = {
                      subject: paper.subject,
                      questions: paper.questions_detail,
                      distribution: paper.distribution,
                    };
                    sessionStorage.setItem('generated_paper', JSON.stringify(paperData));
                    navigate('/question-paper');
                  }}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="p-2 bg-purple-50 dark:bg-purple-900/30 rounded-lg group-hover:scale-110 transition-transform">
                      <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <span className="text-[10px] font-bold text-gray-400">{new Date(paper.created_at).toLocaleDateString()}</span>
                  </div>
                  <h4 className="text-lg font-black text-gray-900 dark:text-white mb-1">{paper.subject}</h4>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">{paper.questions.length} QUESTIONS</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </Layout>
  );

};
