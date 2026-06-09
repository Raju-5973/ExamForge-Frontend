import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Card } from '../components/Card';
import { FileText, ArrowLeft, Calendar, BookOpen, Search } from 'lucide-react';
import toast from 'react-hot-toast';

export const GeneratedPapers = () => {
  const { user, API_URL } = useAuth();
  const navigate = useNavigate();
  const [papers, setPapers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'ai', 'faculty'

  const loadPapers = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/api/papers/`, {
        headers: { 'Authorization': `Token ${user?.token}` },
      });
      if (response.ok) {
        const data = await response.json();
        // Handle both paginated ({results: [...]}) and plain array responses
        setPapers(Array.isArray(data) ? data : (data.results || []));
      } else {
        toast.error(`Failed to load papers (${response.status})`);
      }
    } catch (err) {
      console.error('Failed to load papers:', err);
      toast.error('Network error. Is the backend running?');
    } finally {
      setIsLoading(false);
    }
  }, [API_URL, user?.token]);

  useEffect(() => {
    loadPapers();
  }, [loadPapers]);

  const filteredPapers = papers.filter(paper => {
    const matchesSearch = paper.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const isAI = paper.distribution?.some(d => d.type === 'AI Generated Set');
    
    if (activeTab === 'ai' && !isAI) return false;
    if (activeTab === 'faculty' && isAI) return false;
    
    return matchesSearch;
  });

  return (
    <Layout>
      <div className="space-y-6">
        {/* Premium Header Banner */}
        <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 rounded-2xl p-8 text-white shadow-xl overflow-hidden">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-16 -right-16 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-1/3 w-48 h-48 bg-blue-400/20 rounded-full blur-2xl" />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <FileText className="w-5 h-5 text-blue-200" />
                <span className="text-blue-200 text-sm font-medium uppercase tracking-wider">Repository Archive</span>
              </div>
              <h2 className="text-4xl font-extrabold tracking-tight mb-2">Generated Papers</h2>
              <p className="text-blue-100 text-lg max-w-lg leading-relaxed">
                Access your complete history of generated exam papers and blueprints.
              </p>
            </div>
            <div className="flex-shrink-0">
               <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 text-center">
                 <p className="text-xs uppercase tracking-widest text-blue-200 font-bold mb-1">Total Archive</p>
                 <p className="text-3xl font-black">{papers.length}</p>
                 <p className="text-[10px] text-blue-200 mt-1">PAPERS STORED</p>
               </div>
            </div>
          </div>
        </div>

        {/* Search Strip */}
        <Card noPadding className="overflow-hidden border border-gray-100 dark:border-slate-700">
          <div className="p-2 flex flex-col md:flex-row md:items-center gap-4 bg-white dark:bg-slate-900">
            <div className="flex flex-1 items-center bg-gray-50 dark:bg-slate-800/50 rounded-xl px-2 border border-transparent focus-within:border-blue-500 focus-within:bg-white dark:focus-within:bg-slate-800 transition-all">
              <div className="pl-3 pr-2 text-gray-400">
                <Search className="w-5 h-5" />
              </div>
              <input
                type="text"
                placeholder="Search by subject (e.g. Physics, Mathematics)..."
                className="w-full px-2 py-3 bg-transparent border-none focus:ring-0 outline-none text-gray-900 dark:text-white placeholder-gray-400 font-medium"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex p-1 bg-gray-100 dark:bg-slate-800 rounded-xl overflow-x-auto hide-scrollbar shrink-0">
              {['all', 'ai', 'faculty'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${
                    activeTab === tab
                      ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200'
                  }`}
                >
                  {tab === 'all' ? 'All Papers' : tab === 'ai' ? '🤖 AI Generated' : '👨‍🏫 Faculty Generated'}
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* Papers List */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-blue-100 dark:border-slate-800 rounded-full animate-spin border-t-blue-600" />
              <FileText className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-blue-600" />
            </div>
            <p className="mt-6 text-gray-500 dark:text-gray-400 font-bold animate-pulse">Scanning Archive...</p>
          </div>
        ) : filteredPapers.length === 0 ? (
          <Card noPadding className="py-24 text-center border-2 border-dashed border-gray-100 dark:border-slate-800">
            <div className="bg-gray-50 dark:bg-slate-800/50 w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-6 transform -rotate-12">
              <Search className="w-10 h-10 text-gray-300 dark:text-slate-600" />
            </div>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2">
              {searchTerm ? 'No blueprints found' : 'Archive is empty'}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto font-medium">
              {searchTerm 
                ? `We couldn't find any papers matching "${searchTerm}". Try a broader term.`
                : "Your institutional repository is waiting for its first entry. Start by generating a paper from the dashboard!"}
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">
            {filteredPapers.map((paper) => (
              <div 
                key={paper.id}
                className="group relative bg-white dark:bg-slate-900 rounded-3xl border-2 border-gray-50 dark:border-slate-800 p-6 hover:shadow-2xl hover:border-blue-500/50 transition-all cursor-pointer overflow-hidden flex flex-col h-full"
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
                {/* Visual Accent */}
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-blue-600/5 rounded-full group-hover:scale-150 transition-transform duration-700" />
                
                <div className="flex justify-between items-start mb-6 relative z-10">
                  <div className="p-3 bg-blue-50 dark:bg-blue-600/10 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 text-blue-600 dark:text-blue-400">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div className="flex items-center text-[10px] font-black text-gray-400 bg-gray-50 dark:bg-slate-800 px-3 py-1.5 rounded-full tracking-widest uppercase">
                    <Calendar className="w-3 h-3 mr-2" />
                    {new Date(paper.created_at).toLocaleDateString()}
                  </div>
                </div>

                <h4 className="text-2xl font-black text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-tight">
                  {paper.subject}
                </h4>

                {paper.distribution?.some(d => d.type === 'AI Generated Set') && (
                  <div className="absolute top-6 right-6 px-3 py-1 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-[10px] font-black rounded-full shadow-md uppercase tracking-wider">
                    AI Generated
                  </div>
                )}

                <div className="flex flex-wrap gap-2 mb-8 relative z-10">
                  {paper.distribution?.map((dist, idx) => (
                    <span key={idx} className="text-[10px] px-3 py-1 bg-gray-50 dark:bg-slate-800 text-gray-600 dark:text-slate-400 rounded-lg font-bold border border-gray-100 dark:border-slate-700 uppercase tracking-tighter">
                      {dist.count}×{dist.marks}M
                    </span>
                  ))}
                </div>

                <div className="mt-auto pt-6 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Questions</p>
                    <p className="text-xl font-black text-gray-900 dark:text-white">{paper.questions.length}</p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-slate-800 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                    <ArrowLeft className="w-5 h-5 rotate-180" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );

};
