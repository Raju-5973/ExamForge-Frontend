import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { Card } from '../components/Card';
import { Sparkles, Loader2, CheckCircle, BookOpen, Target, RefreshCw, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';

const BLOOM_LEVELS = ['Remember', 'Understand', 'Apply', 'Analyze', 'Evaluate', 'Create'];

// Fallback subjects always shown even if API fails
const FALLBACK_SUBJECTS = [
  'Mathematics', 'Physics', 'Chemistry', 'Biology',
  'Computer Science', 'Data Structures', 'Operating Systems',
  'Electronics', 'Digital Electronics', 'Microprocessors',
  'Circuit Theory', 'Control Systems',
  'Electrical', 'Mechanical', 'Thermodynamics', 'Fluid Mechanics',
  'Civil', 'Structural Analysis', 'Surveying',
  'Linear Algebra', 'English',
];

export const RecommendationEngine = () => {
  const [subject, setSubject] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [bloomLevel, setBloomLevel] = useState('');
  const [totalMarks, setTotalMarks] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingQuestions, setFetchingQuestions] = useState(true);
  const [selected, setSelected] = useState(new Set());
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [allQuestions, setAllQuestions] = useState([]);
  const [fetchError, setFetchError] = useState(false);

  const fetchQuestions = async () => {
    setFetchingQuestions(true);
    setFetchError(false);
    try {
      const res = await api.get('/api/questions/');
      // Handle both paginated ({results: [...]}) and plain array responses
      const questions = Array.isArray(res.data) ? res.data : (res.data.results || []);
      setAllQuestions(questions);

      // Extract unique subjects from loaded questions
      const apiSubjects = [...new Set(questions.map(q => q.subject))].filter(Boolean).sort();

      // Merge API subjects with fallback list, deduplicating
      const merged = [...new Set([...apiSubjects, ...FALLBACK_SUBJECTS])].sort();
      setAvailableSubjects(merged);

      if (questions.length === 0) {
        // No questions yet – still show fallback subjects for selection
        setAvailableSubjects(FALLBACK_SUBJECTS);
      }
    } catch (err) {
      console.error('Failed to load questions:', err);
      setFetchError(true);
      // Use fallback subjects so the page is still functional
      setAvailableSubjects(FALLBACK_SUBJECTS);
      toast.error('Could not load questions from server – showing default subjects');
    } finally {
      setFetchingQuestions(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const handleRecommend = async () => {
    if (!subject || !totalMarks) {
      toast.error('Select a subject and enter total marks first');
      return;
    }
    setLoading(true);
    setSelected(new Set());
    setRecommendations([]);
    try {
      let pool = allQuestions;

      // Smart filter based on criteria
      if (subject) {
        pool = pool.filter(q => q.subject?.toLowerCase().includes(subject.toLowerCase()));
      }
      if (difficulty) pool = pool.filter(q => q.difficulty === difficulty);
      if (bloomLevel) pool = pool.filter(q => q.bloom_level === bloomLevel);

      if (pool.length === 0) {
        toast.error(`No questions found for "${subject}" in the question bank. Add questions first!`);
        setLoading(false);
        return;
      }

      // Score each question by relevance
      const scored = pool.map(q => ({
        ...q,
        score: (
          (difficulty && q.difficulty === difficulty ? 30 : 0) +
          (bloomLevel && q.bloom_level === bloomLevel ? 25 : 0) +
          (q.co_mapping ? 15 : 0) +
          (q.sub_topic ? 10 : 0) +
          Math.random() * 20
        )
      })).sort((a, b) => b.score - a.score);

      // Greedy select up to totalMarks budget
      const budget = parseInt(totalMarks);
      const result = [];
      let used = 0;
      for (const q of scored) {
        if (used + q.marks <= budget) {
          result.push(q);
          used += q.marks;
          if (used === budget) break;
        }
      }

      if (result.length === 0) {
        toast.error(`Could not fill ${budget} marks with available questions. Try a different total or fewer filters.`);
      } else {
        setRecommendations(result);
        toast.success(`${result.length} questions recommended (${used}/${budget} marks)`);
      }
    } catch (err) {
      toast.error('Failed to generate recommendations');
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (id) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const totalSelected = recommendations.filter(q => selected.has(q.id)).reduce((s, q) => s + q.marks, 0);

  return (
    <Layout>
      <div className="space-y-6">
        <div className="relative bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 rounded-2xl p-7 text-white shadow-xl overflow-hidden">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-16 -right-16 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-pink-200" />
              <span className="text-pink-200 text-sm font-medium uppercase tracking-wider">Module 9</span>
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight">AI Question Recommender</h2>
            <p className="text-purple-100 mt-1 text-sm">Smart question selection based on your exam blueprint criteria</p>
          </div>
        </div>

        {/* Status Bar */}
        {fetchError && (
          <div className="flex items-center gap-3 px-4 py-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl text-amber-700 dark:text-amber-300 text-sm font-medium">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>Could not connect to the question bank. Showing default subjects. Make sure the backend is running.</span>
            <button onClick={fetchQuestions} className="ml-auto flex items-center gap-1.5 px-3 py-1 bg-amber-100 dark:bg-amber-800 rounded-lg hover:bg-amber-200 transition-colors text-xs font-bold">
              <RefreshCw className="w-3.5 h-3.5" /> Retry
            </button>
          </div>
        )}

        {/* Filter Panel */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-500" /> Define Criteria
            </h3>
            {fetchingQuestions && (
              <span className="flex items-center gap-2 text-xs text-gray-400 font-medium">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Loading question bank...
              </span>
            )}
            {!fetchingQuestions && !fetchError && allQuestions.length > 0 && (
              <span className="text-xs font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-3 py-1 rounded-full">
                ✓ {allQuestions.length} questions loaded
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1">Subject *</label>
              <select
                value={subject}
                onChange={e => setSubject(e.target.value)}
                className="w-full px-3 py-2.5 border-2 rounded-xl bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white focus:border-purple-500 focus:outline-none"
                disabled={fetchingQuestions}
              >
                <option value="">
                  {fetchingQuestions ? 'Loading subjects...' : 'Select Subject'}
                </option>
                {availableSubjects.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1">Difficulty</label>
              <select value={difficulty} onChange={e => setDifficulty(e.target.value)}
                className="w-full px-3 py-2.5 border-2 rounded-xl bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white focus:border-purple-500 focus:outline-none">
                <option value="">Any</option>
                {['Easy', 'Medium', 'Hard'].map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1">Bloom's Level</label>
              <select value={bloomLevel} onChange={e => setBloomLevel(e.target.value)}
                className="w-full px-3 py-2.5 border-2 rounded-xl bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white focus:border-purple-500 focus:outline-none">
                <option value="">Any</option>
                {BLOOM_LEVELS.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1">Total Marks *</label>
              <input type="number" min="1" placeholder="e.g. 100" value={totalMarks}
                onChange={e => setTotalMarks(e.target.value)}
                className="w-full px-3 py-2.5 border-2 rounded-xl bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white focus:border-purple-500 focus:outline-none" />
            </div>
          </div>

          <button
            onClick={handleRecommend}
            disabled={loading || fetchingQuestions}
            className="mt-5 flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white text-sm font-bold rounded-xl hover:from-violet-700 hover:to-purple-700 disabled:opacity-50 transition-all shadow-lg shadow-purple-500/30"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {loading ? 'Analyzing...' : 'Get AI Recommendations'}
          </button>
        </Card>

        {/* Results */}
        {recommendations.length > 0 && (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-purple-500" />
                {recommendations.length} Recommended Questions
              </h3>
              <span className="text-sm font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 px-3 py-1 rounded-full">
                {selected.size} selected · {totalSelected} marks
              </span>
            </div>
            <div className="space-y-3">
              {recommendations.map((q, i) => (
                <div key={q.id}
                  onClick={() => toggleSelect(q.id)}
                  className={`cursor-pointer p-4 rounded-2xl border-2 transition-all ${selected.has(q.id) ? 'border-purple-400 bg-purple-50 dark:bg-purple-900/20' : 'border-gray-100 dark:border-slate-700 hover:border-purple-200'}`}>
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${selected.has(q.id) ? 'border-purple-500 bg-purple-500' : 'border-gray-300'}`}>
                      {selected.has(q.id) && <CheckCircle className="w-3 h-3 text-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 dark:text-slate-200 leading-relaxed">{q.text}</p>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">{q.subject}</span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${q.difficulty === 'Easy' ? 'bg-green-50 text-green-700' : q.difficulty === 'Medium' ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'}`}>{q.difficulty}</span>
                        <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">{q.marks} marks</span>
                        {q.bloom_level && <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-orange-50 text-orange-700">🧠 {q.bloom_level}</span>}
                        {q.co_mapping && <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-teal-50 text-teal-700">🎯 {q.co_mapping}</span>}
                      </div>
                    </div>
                    <span className="flex-shrink-0 text-xs font-bold text-gray-400">#{i + 1}</span>
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

export default RecommendationEngine;
