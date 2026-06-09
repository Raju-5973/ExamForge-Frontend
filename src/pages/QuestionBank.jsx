import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Layout } from '../components/Layout';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Plus, Edit2, Trash2, BookOpen, Loader2, Search, AlertTriangle, Upload, CheckCircle, X } from 'lucide-react';

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


export const QuestionBank = () => {
  const { user, API_URL } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Search and Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSubject, setFilterSubject] = useState('');

  // Form state
  const [questionText, setQuestionText] = useState('');
  const [subject, setSubject] = useState(user?.department || '');
  const [difficulty, setDifficulty] = useState('');
  const [marks, setMarks] = useState('');
  const [unit, setUnit] = useState('');
  const [bloomLevel, setBloomLevel] = useState('');
  const [coMapping, setCoMapping] = useState('');
  const [subTopic, setSubTopic] = useState('');
  const [tags, setTags] = useState('');
  const [error, setError] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Module 8: Duplicate Detection state
  const [duplicateWarning, setDuplicateWarning] = useState(null);
  const [isCheckingDuplicate, setIsCheckingDuplicate] = useState(false);
  const duplicateDebounceRef = useRef(null);

  const loadQuestions = useCallback(async () => {
    try {
      setIsLoadingQuestions(true);
      const response = await fetch(`${API_URL}/api/questions/`, {
        headers: {
          'Authorization': `Token ${user?.token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setQuestions(data);
        setFilteredQuestions(data);
      }
    } catch (err) {
      console.error('Failed to load questions:', err);
    } finally {
      setIsLoadingQuestions(false);
    }
  }, [API_URL, user?.token]);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  useEffect(() => {
    let result = questions;
    if (searchTerm) {
      result = result.filter(q => q.text.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    if (filterSubject) {
      result = result.filter(q => q.subject === filterSubject);
    }
    setFilteredQuestions(result);
  }, [searchTerm, filterSubject, questions]);

  const resetForm = () => {
    setQuestionText('');
    setSubject('');
    setDifficulty('');
    setMarks('');
    setUnit('');
    setBloomLevel('');
    setCoMapping('');
    setSubTopic('');
    setTags('');
    setEditingId(null);
    setError('');
    setDuplicateWarning(null);
  };

  // Module 8: Debounced duplicate check — fires 800ms after user stops typing
  const handleQuestionTextChange = (e) => {
    const value = e.target.value;
    setQuestionText(value);
    setDuplicateWarning(null);
    if (duplicateDebounceRef.current) clearTimeout(duplicateDebounceRef.current);
    if (value.trim().length < 15 || editingId) return;
    duplicateDebounceRef.current = setTimeout(async () => {
      try {
        setIsCheckingDuplicate(true);
        const res = await fetch(`${API_URL}/api/questions/duplicate_check/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Token ${user?.token}` },
          body: JSON.stringify({ text: value }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.is_duplicate) setDuplicateWarning(data);
        }
      } catch {}
      finally { setIsCheckingDuplicate(false); }
    }, 800);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!questionText.trim() || !subject || !difficulty || !marks) {
      setError('All fields are required');
      return;
    }

    const marksNum = parseInt(marks);
    if (isNaN(marksNum) || marksNum <= 0) {
      setError('Marks must be a positive number');
      return;
    }

    const payload = {
      text: questionText,
      subject,
      difficulty,
      marks: marksNum,
      unit: unit ? parseInt(unit) : null,
      bloom_level: bloomLevel || null,
      co_mapping: coMapping || null,
      sub_topic: subTopic,
      tags: tags,
    };

    try {
      setIsSubmitting(true);
      const url = editingId 
        ? `${API_URL}/api/questions/${editingId}/` 
        : `${API_URL}/api/questions/`;
      
      const response = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
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
                   <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-500/20 flex items-center justify-center">
                     <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                   </div>
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-bold text-gray-900 dark:text-white">
                    {editingId ? 'Question Updated!' : 'Question Submitted!'}
                  </p>
                  <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
                    Verified and added to the {user?.department || 'Department'} Bank.
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

        loadQuestions();
        resetForm();
      } else {
        const data = await response.json();
        const msg = data.message || (data.text ? data.text[0] : 'Failed to save question');
        setError(msg);
        toast.error(msg);
      }
    } catch (err) {
      setError('Network error. Please try again.');
      toast.error('Connection failed. Please check your internet.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (question) => {
    setEditingId(question.id);
    setQuestionText(question.text);
    setSubject(question.subject);
    setDifficulty(question.difficulty);
    setMarks(question.marks.toString());
    setUnit(question.unit ? question.unit.toString() : '');
    setBloomLevel(question.bloom_level || '');
    setCoMapping(question.co_mapping || '');
    setSubTopic(question.sub_topic || '');
    setTags(question.tags || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast.error('Please upload a valid CSV file');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      setIsUploading(true);
      const response = await fetch(`${API_URL}/api/questions/bulk_upload/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${user?.token}`,
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(data.message || 'Questions imported successfully!');
        loadQuestions();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to import questions');
      }
    } catch (err) {
      toast.error('Network error during upload');
    } finally {
      setIsUploading(false);
      e.target.value = null; // Reset input
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      try {
        const response = await fetch(`${API_URL}/api/questions/${id}/`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Token ${user?.token}`,
          },
        });
        if (response.ok) {
          toast.success('Question deleted successfully');
          loadQuestions();
        } else {
          toast.error('Failed to delete question');
        }
      } catch (err) {
        toast.error('Network error. Please try again.');
      }
    }
  };

  const userSubjects = user?.department 
    ? SUBJECTS.filter(s => s.value === user.department)
    : SUBJECTS;

  return (
    <Layout>
      <div className="space-y-6">

        {/* Premium Header Banner */}
        <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 rounded-2xl p-7 text-white shadow-xl overflow-hidden">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-16 -right-16 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-1/3 w-48 h-48 bg-blue-400/20 rounded-full blur-2xl" />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <BookOpen className="w-5 h-5 text-blue-200" />
                <span className="text-blue-200 text-sm font-medium uppercase tracking-wider">Question Bank</span>
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight">
                {editingId ? 'Edit Question' : 'Add New Question'}
              </h2>
              <p className="text-blue-100 mt-1 text-sm">
                Department: <span className="font-semibold text-white">{user?.department || 'General'}</span>
                {' · '}{filteredQuestions.length} question{filteredQuestions.length !== 1 ? 's' : ''} stored
              </p>
            </div>
            <div className="flex gap-3">
              <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-sm font-semibold transition-all backdrop-blur-sm border border-white/20 cursor-pointer">
                {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                {isUploading ? 'Uploading...' : 'Bulk CSV'}
                <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} disabled={isUploading} />
              </label>
              {editingId && (
                <button onClick={resetForm} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-sm font-semibold transition-all backdrop-blur-sm border border-white/20">
                  <X className="w-4 h-4" /> Cancel Edit
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Add/Edit Question Form - Only for Staff */}
        {user?.role === 'staff' && (
          <Card id="question-form" noPadding className="overflow-hidden border border-gray-200 dark:border-slate-700">
            {/* Form Header */}
            <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/60 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${editingId ? 'bg-amber-100 dark:bg-amber-500/20' : 'bg-blue-100 dark:bg-blue-500/20'}`}>
                  {editingId
                    ? <Edit2 className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    : <Plus className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  }
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">
                    {editingId ? 'Editing Question' : 'New Question'}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-slate-400">
                    {editingId ? 'Modify the fields below and save' : 'Fill in the details to add to the bank'}
                  </p>
                </div>
              </div>
              {questionText && (
                <span className="text-xs text-gray-400 dark:text-slate-500">{questionText.length} chars</span>
              )}
            </div>

            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Question Text */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">
                    Question Text <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={questionText}
                    onChange={handleQuestionTextChange}
                    className="w-full px-4 py-3 border-2 rounded-xl transition-all focus:outline-none focus:ring-0 focus:border-blue-500 bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 resize-none leading-relaxed"
                    rows={4}
                    placeholder="Type the full question here..."
                    required
                  />

                  {/* Module 8: Duplicate Detection Warning */}
                  {isCheckingDuplicate && (
                    <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                      <Loader2 className="w-3 h-3 animate-spin" /> Checking for duplicates...
                    </div>
                  )}
                  {duplicateWarning && !isCheckingDuplicate && (
                    <div className="mt-2 p-4 bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-200 dark:border-amber-800/40 rounded-xl">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-bold text-amber-800 dark:text-amber-300">
                            ⚠️ {duplicateWarning.count} Potential Duplicate{duplicateWarning.count > 1 ? 's' : ''} Detected
                          </p>
                          <div className="mt-2 space-y-1.5">
                            {duplicateWarning.matches.slice(0, 2).map(m => (
                              <div key={m.id} className="text-xs bg-white dark:bg-slate-800 p-2 rounded-lg border border-amber-100 dark:border-amber-800/30">
                                <span className="font-bold text-amber-700 dark:text-amber-400">{m.similarity}% similar:</span>
                                <span className="ml-1 text-gray-600 dark:text-slate-400 line-clamp-1">{m.text}</span>
                              </div>
                            ))}
                          </div>
                          <button onClick={() => setDuplicateWarning(null)} className="mt-2 text-xs text-amber-600 hover:underline">Dismiss & continue anyway</button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Metadata Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300">
                      Subject <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        required
                        className="w-full px-4 py-2.5 border-2 rounded-xl transition-all focus:outline-none focus:border-blue-500 bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white appearance-none"
                      >
                        <option value="" disabled hidden>Select Subject</option>
                        {userSubjects.map(s => (
                          <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                      </select>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">▾</div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300">
                      Difficulty <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-2">
                      {['Easy', 'Medium', 'Hard'].map(d => (
                        <button
                          key={d}
                          type="button"
                          onClick={() => setDifficulty(d)}
                          className={`flex-1 py-2.5 rounded-xl text-xs font-bold border-2 transition-all ${
                            difficulty === d
                              ? d === 'Easy' ? 'bg-green-500 border-green-500 text-white shadow-md shadow-green-200 dark:shadow-green-900/30'
                                : d === 'Medium' ? 'bg-amber-500 border-amber-500 text-white shadow-md shadow-amber-200 dark:shadow-amber-900/30'
                                : 'bg-red-500 border-red-500 text-white shadow-md shadow-red-200 dark:shadow-red-900/30'
                              : 'bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-600 text-gray-600 dark:text-slate-400 hover:border-gray-300'
                          }`}
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                    <input type="hidden" value={difficulty} required />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300">
                      Marks <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-2">
                      {[1, 2, 5, 10].map(m => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setMarks(String(m))}
                          className={`flex-1 py-2.5 rounded-xl text-xs font-bold border-2 transition-all ${
                            marks === String(m)
                              ? 'bg-purple-500 border-purple-500 text-white shadow-md shadow-purple-200 dark:shadow-purple-900/30'
                              : 'bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-600 text-gray-600 dark:text-slate-400 hover:border-gray-300'
                          }`}
                        >
                          {m}
                        </button>
                      ))}
                      <input
                        type="number"
                        min="1"
                        value={marks}
                        onChange={(e) => setMarks(e.target.value)}
                        placeholder="Custom"
                        className="flex-1 px-2 py-2.5 border-2 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500 bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white text-center min-w-0"
                      />
                    </div>
                  </div>
                </div>

                {/* Advanced Metadata Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300">
                      Unit <span className="text-gray-400 font-normal">(optional)</span>
                    </label>
                    <select
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      className="w-full px-4 py-2.5 border-2 rounded-xl transition-all focus:outline-none focus:border-blue-500 bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white"
                    >
                      <option value="">Select Unit</option>
                      {[1, 2, 3, 4, 5].map(u => (
                        <option key={u} value={u}>Unit {u}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300">
                      Bloom's Taxonomy
                    </label>
                    <select
                      value={bloomLevel}
                      onChange={(e) => setBloomLevel(e.target.value)}
                      className="w-full px-4 py-2.5 border-2 rounded-xl transition-all focus:outline-none focus:border-blue-500 bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white"
                    >
                      <option value="">Select Level</option>
                      {['Remember', 'Understand', 'Apply', 'Analyze', 'Evaluate', 'Create'].map(b => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300">
                      CO Mapping
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. CO1, CO2"
                      value={coMapping}
                      onChange={(e) => setCoMapping(e.target.value)}
                      className="w-full px-4 py-2.5 border-2 rounded-xl transition-all focus:outline-none focus:border-blue-500 bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white placeholder-gray-400"
                    />
                  </div>
                </div>

                {/* Optional Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300">Sub-Topic <span className="text-gray-400 font-normal">(optional)</span></label>
                    <input
                      type="text"
                      placeholder="e.g., Algebra, Thermodynamics"
                      value={subTopic}
                      onChange={(e) => setSubTopic(e.target.value)}
                      className="w-full px-4 py-2.5 border-2 rounded-xl transition-all focus:outline-none focus:border-blue-500 bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300">Tags <span className="text-gray-400 font-normal">(optional, comma-separated)</span></label>
                    <input
                      type="text"
                      placeholder="e.g., chapter1, important, final"
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                      className="w-full px-4 py-2.5 border-2 rounded-xl transition-all focus:outline-none focus:border-blue-500 bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500"
                    />
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800/40 rounded-xl">
                    <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center flex-shrink-0">
                      <X className="w-4 h-4 text-red-600 dark:text-red-400" />
                    </div>
                    <p className="text-sm font-medium text-red-700 dark:text-red-400">{error}</p>
                  </div>
                )}

                {/* Submit Row */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-slate-700">
                  <div className="text-xs text-gray-400 dark:text-slate-500">
                    {difficulty && marks ? (
                      <span className="text-green-600 dark:text-green-400 font-medium">✓ Ready to submit</span>
                    ) : (
                      'Complete required fields'
                    )}
                  </div>
                  <div className="flex gap-3">
                    {editingId && (
                      <Button type="button" variant="secondary" onClick={resetForm}>Cancel</Button>
                    )}
                    <Button type="submit" variant="primary" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" />{editingId ? 'Saving...' : 'Adding...'}</>
                      ) : (
                        editingId ? '💾 Save Changes' : '➕ Add to Bank'
                      )}
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          </Card>
        )}

        {/* Questions List with Filters */}
        <Card noPadding className="overflow-hidden border border-gray-200 dark:border-slate-700">
          {/* List Header */}
          <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/60">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-500/20 rounded-lg">
                  <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">Stored Questions</h3>
                  <p className="text-xs text-gray-500 dark:text-slate-400">
                    {filteredQuestions.length} of {questions.length} shown
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search questions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 pr-4 py-2 border-2 rounded-xl bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-600 text-gray-900 dark:text-slate-100 text-sm focus:border-blue-500 outline-none w-full sm:w-52 transition-all"
                  />
                </div>
                <div className="relative">
                  <select
                    value={filterSubject}
                    onChange={(e) => setFilterSubject(e.target.value)}
                    className="px-3 py-2 border-2 rounded-xl bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-600 text-gray-900 dark:text-slate-100 text-sm focus:border-blue-500 outline-none appearance-none pr-7 transition-all"
                  >
                    <option value="">All Subjects</option>
                    {userSubjects.map(s => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 text-xs">▾</div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4">
            {isLoadingQuestions ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
                <p className="text-sm text-gray-400 dark:text-slate-500">Loading questions...</p>
              </div>
            ) : filteredQuestions.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-gray-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-8 h-8 text-gray-300 dark:text-slate-600" />
                </div>
                <p className="font-semibold text-gray-500 dark:text-slate-400">
                  {searchTerm || filterSubject ? 'No matches found' : 'No questions yet'}
                </p>
                <p className="text-sm text-gray-400 dark:text-slate-500 mt-1">
                  {searchTerm || filterSubject ? 'Try adjusting your search or filters' : 'Add your first question using the form above'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredQuestions.map((question, index) => (
                  <div
                    key={question.id}
                    className="group relative p-5 border-2 border-gray-100 dark:border-slate-700/80 rounded-2xl hover:border-blue-200 dark:hover:border-blue-500/40 hover:shadow-lg hover:shadow-blue-50 dark:hover:shadow-blue-900/10 transition-all duration-200 bg-white dark:bg-slate-800/50"
                  >
                    <div className="flex items-start gap-4">
                      {/* Number Badge */}
                      <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm">
                        <span className="text-white text-xs font-bold">{index + 1}</span>
                      </div>

                      {/* Question Content */}
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-900 dark:text-slate-100 mb-3 leading-relaxed text-sm font-medium">
                          {question.text}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <span className="inline-flex items-center px-2.5 py-1 text-xs font-bold rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-800/40">
                            📚 {question.subject}
                          </span>
                          <span className={`inline-flex items-center px-2.5 py-1 text-xs font-bold rounded-lg border ${
                            question.difficulty === 'Easy'
                              ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-100 dark:border-green-800/40'
                              : question.difficulty === 'Medium'
                              ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-100 dark:border-amber-800/40'
                              : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-100 dark:border-red-800/40'
                          }`}>
                            {question.difficulty === 'Easy' ? '🟢' : question.difficulty === 'Medium' ? '🟡' : '🔴'} {question.difficulty}
                          </span>
                          <span className="inline-flex items-center px-2.5 py-1 text-xs font-bold rounded-lg bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border border-purple-100 dark:border-purple-800/40">
                            ⭐ {question.marks} {question.marks === 1 ? 'Mark' : 'Marks'}
                          </span>
                          {question.unit && (
                            <span className="inline-flex items-center px-2.5 py-1 text-xs font-bold rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800/40">
                              Unit {question.unit}
                            </span>
                          )}
                          {question.bloom_level && (
                            <span className="inline-flex items-center px-2.5 py-1 text-xs font-bold rounded-lg bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border border-orange-100 dark:border-orange-800/40">
                              🧠 {question.bloom_level}
                            </span>
                          )}
                          {question.co_mapping && (
                            <span className="inline-flex items-center px-2.5 py-1 text-xs font-bold rounded-lg bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 border border-teal-100 dark:border-teal-800/40">
                              🎯 {question.co_mapping}
                            </span>
                          )}
                          {question.sub_topic && (
                            <span className="inline-flex items-center px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-800/40">
                              📌 {question.sub_topic}
                            </span>
                          )}
                        </div>
                        {question.tags && (
                          <div className="flex flex-wrap gap-1.5 mt-2.5">
                            {question.tags.split(',').map((tag, i) => (
                              <span key={i} className="text-[10px] uppercase tracking-widest font-bold text-gray-400 dark:text-slate-500 bg-gray-50 dark:bg-slate-700/50 px-2 py-0.5 rounded-md">
                                #{tag.trim()}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Action Buttons - only for staff */}
                      {user?.role === 'staff' && (
                        <div className="flex-shrink-0 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                          <button
                            onClick={() => handleEdit(question)}
                            className="p-2 rounded-xl text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors"
                            title="Edit question"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(question.id)}
                            className="p-2 rounded-xl text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                            title="Delete question"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>
    </Layout>
  );
};
