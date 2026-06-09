import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bot, Sparkles, Loader2, CheckCircle, AlertCircle, Lightbulb } from 'lucide-react';
import api from '../utils/api';
import { Layout } from '../components/Layout';
import { useNavigate } from 'react-router-dom';

const suggestionPresets = [
  {
    title: 'Foundations Check',
    topic: 'Core concepts and definitions',
    question_type: 'Short Questions',
    difficulty: 'Easy',
    marks: 2,
    count: 10
  },
  {
    title: 'Problem Solving Set',
    topic: 'Numerical and application problems',
    question_type: 'Long Questions',
    difficulty: 'Medium',
    marks: 5,
    count: 6
  },
  {
    title: 'Case Study Paper',
    topic: 'Real-world scenario analysis',
    question_type: 'Case Study',
    difficulty: 'Hard',
    marks: 10,
    count: 3
  },
  {
    title: 'Quick MCQ Round',
    topic: 'Important exam revision topics',
    question_type: 'MCQ',
    difficulty: 'Medium',
    marks: 1,
    count: 20
  }
];

const AIGenerator = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    topic: '',
    difficulty: 'Medium',
    marks: 5,
    question_type: 'Short Questions',
    count: 5
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // 'idle', 'generating', 'success', 'error'
  const [message, setMessage] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const applySuggestion = (suggestion) => {
    setFormData(prev => ({
      ...prev,
      ...suggestion,
      topic: prev.topic ? `${prev.topic} - ${suggestion.topic}` : suggestion.topic
    }));
  };

  const pollTaskStatus = async (taskId) => {
    try {
      const response = await api.get(`/api/questions/check_ai_status/?task_id=${taskId}`);
      const data = response.data;
      if (data.status === 'SUCCESS') {
        setLoading(false);
        if (data.result && data.result.error) {
          setStatus('error');
          setMessage(data.result.error);
        } else if (data.result && data.result.used_fallback) {
          setStatus('fallback');
          setMessage(`✅ ${data.result.created_count} template-based questions generated and saved! (OpenAI quota exceeded — add billing at platform.openai.com to enable AI generation)`);
        } else {
          setStatus('success');
          setMessage(`✅ Successfully generated ${data.result.created_count} AI questions! Opening paper...`);
          
          if (data.result.paper_id) {
            try {
              const paperResponse = await api.get(`/api/papers/${data.result.paper_id}/`);
              const paper = paperResponse.data;
              const paperData = {
                subject: paper.subject,
                questions: paper.questions_detail,
                distribution: paper.distribution,
              };
              sessionStorage.setItem('generated_paper', JSON.stringify(paperData));
              navigate('/question-paper');
            } catch (err) {
              setMessage('✅ Questions generated successfully, but failed to open paper view.');
            }
          }
        }
      } else if (data.status === 'FAILURE') {
        setLoading(false);
        setStatus('error');
        setMessage('Task failed during generation. Please try again.');
      } else {
        // Continue polling
        setTimeout(() => pollTaskStatus(taskId), 2000);
      }
    } catch (err) {
      setLoading(false);
      setStatus('error');
      setMessage('Error checking task status. Is the backend running?');
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!formData.topic) return;

    setLoading(true);
    setStatus('generating');
    setMessage('Initiating AI Engine...');

    try {
      const response = await api.post('/api/questions/generate_ai/', formData);
      setMessage('AI is processing your request. This may take a moment...');
      pollTaskStatus(response.data.task_id);
    } catch (error) {
      setLoading(false);
      setStatus('error');
      setMessage(error.response?.data?.error || 'Failed to start generation. Is the backend running?');
    }
  };

  return (
    <Layout fullWidth>
      <div className="h-full w-full">
        <div className="h-full w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700 flex flex-col">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-5 text-white flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <Bot size={26} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">AI Question Generator</h1>
                <p className="text-blue-100 mt-1 text-sm">Generate high-quality questions instantly using advanced AI.</p>
              </div>
            </div>
          </div>

          <div className="p-5 flex-1 min-h-0 overflow-y-auto">
            <form onSubmit={handleGenerate} className="h-full flex flex-col gap-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 xl:gap-4 flex-shrink-0">
                <div className="col-span-1 md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Topic / Sub-Topic <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="topic"
                    value={formData.topic}
                    onChange={handleInputChange}
                    placeholder="e.g. Thermodynamics, Neural Networks, Matrix Multiplication"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-700 dark:text-white transition-all duration-200"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Question Type
                  </label>
                  <select
                    name="question_type"
                    value={formData.question_type}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="MCQ">Multiple Choice Questions (MCQ)</option>
                    <option value="Short Questions">Short Answer</option>
                    <option value="Long Questions">Long Answer / Essay</option>
                    <option value="Case Study">Case Study / Scenario</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Difficulty Level
                  </label>
                  <select
                    name="difficulty"
                    value={formData.difficulty}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Marks per Question
                  </label>
                  <input
                    type="number"
                    name="marks"
                    min="1"
                    max="100"
                    value={formData.marks}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                    Number of Questions
                  </label>
                  <input
                    type="number"
                    name="count"
                    min="1"
                    max="20"
                    value={formData.count}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              {status && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-3 rounded-lg flex items-start gap-3 ${
                    status === 'error'    ? 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/30 dark:border-red-800 dark:text-red-300' :
                    status === 'success'  ? 'bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/30 dark:border-green-800 dark:text-green-300' :
                    status === 'fallback' ? 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-900/30 dark:border-amber-800 dark:text-amber-300' :
                    'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-300'
                  }`}
                >
                  {status === 'generating' && <Loader2 className="w-5 h-5 animate-spin mt-0.5" />}
                  {status === 'success' && <CheckCircle className="w-5 h-5 mt-0.5" />}
                  {status === 'error' && <AlertCircle className="w-5 h-5 mt-0.5" />}
                  <div>
                    <p className="font-semibold text-sm">{message}</p>
                  </div>
                </motion.div>
              )}

              <div className="mt-auto flex-shrink-0 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-900/40 p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="w-4 h-4 text-amber-400" />
                  <h2 className="text-sm font-bold text-gray-900 dark:text-white">Question Paper Suggestions</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
                  {suggestionPresets.map((suggestion) => (
                    <button
                      type="button"
                      key={suggestion.title}
                      onClick={() => applySuggestion(suggestion)}
                      className="h-20 overflow-hidden text-left rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors"
                    >
                      <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{suggestion.title}</p>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 truncate">
                        {suggestion.count} questions, {suggestion.marks} marks each
                      </p>
                      <p className="mt-2 text-xs font-semibold text-blue-600 dark:text-blue-300 truncate">
                        {suggestion.question_type} · {suggestion.difficulty}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 dark:border-gray-700 flex-shrink-0">
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-3 rounded-lg text-white font-bold text-base flex items-center justify-center gap-2 transition-all duration-300 shadow-lg ${
                    loading 
                      ? 'bg-blue-400 cursor-not-allowed' 
                      : 'bg-blue-600 hover:bg-blue-700 hover:shadow-blue-500/30 transform hover:-translate-y-1'
                  }`}
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={24} />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles size={24} />
                      Generate Questions
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AIGenerator;
