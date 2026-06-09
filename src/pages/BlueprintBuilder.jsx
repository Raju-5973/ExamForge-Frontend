import React, { useState, useEffect, useCallback } from 'react';
import { Layout } from '../components/Layout';
import { Card } from '../components/Card';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Plus, Save, PieChart, BarChart3, Settings2, FileText, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export const BlueprintBuilder = () => {
  const { user, API_URL } = useAuth();
  const navigate = useNavigate();
  const [blueprints, setBlueprints] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(null);

  // Blueprint Form State
  const [name, setName] = useState('');
  const [subject, setSubject] = useState(user?.department || '');
  const [totalMarks, setTotalMarks] = useState(100);
  const [duration, setDuration] = useState(180);

  // Configuration States
  const [bloomDist, setBloomDist] = useState({
    Remember: 20,
    Understand: 20,
    Apply: 30,
    Analyze: 15,
    Evaluate: 10,
    Create: 5
  });

  const [difficultyDist, setDifficultyDist] = useState({
    Easy: 30,
    Medium: 50,
    Hard: 20
  });

  const [unitWeightage, setUnitWeightage] = useState({
    1: 20,
    2: 20,
    3: 20,
    4: 20,
    5: 20
  });

  const loadBlueprints = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/blueprints/`, {
        headers: { 'Authorization': `Token ${user?.token}` }
      });
      if (response.ok) {
        const data = await response.json();
        // Handle both paginated ({results: [...]}) and plain array responses
        setBlueprints(Array.isArray(data) ? data : (data.results || []));
      } else {
        toast.error(`Failed to load blueprints (${response.status})`);
      }
    } catch (err) {
      toast.error('Network error loading blueprints');
    } finally {
      setLoading(false);
    }
  }, [API_URL, user?.token]);

  useEffect(() => {
    loadBlueprints();
  }, [loadBlueprints]);

  const calculateTotal = (obj) => Object.values(obj).reduce((a, b) => a + Number(b), 0);

  const normalizeTo100 = (obj) => {
    const total = calculateTotal(obj);
    if (total === 100 || total === 0) return obj;
    const normalized = {};
    let sum = 0;
    const entries = Object.entries(obj);
    for (let i = 0; i < entries.length - 1; i++) {
      const [k, v] = entries[i];
      const val = Math.round((v / total) * 100);
      normalized[k] = val;
      sum += val;
    }
    const [lastKey] = entries[entries.length - 1];
    normalized[lastKey] = Math.max(0, 100 - sum);
    return normalized;
  };

  const handleSave = async () => {
    if (!name || !subject) {
      toast.error('Name and Subject are required');
      return;
    }

    const normalizedBloom = normalizeTo100(bloomDist);
    const normalizedDifficulty = normalizeTo100(difficultyDist);
    const normalizedUnit = normalizeTo100(unitWeightage);

    // Update the local state so the user sees the normalized values immediately
    setBloomDist(normalizedBloom);
    setDifficultyDist(normalizedDifficulty);
    setUnitWeightage(normalizedUnit);

    const payload = {
      name,
      subject,
      total_marks: totalMarks,
      duration_minutes: duration,
      configuration: {
        bloom_distribution: normalizedBloom,
        difficulty: normalizedDifficulty,
        unit_weightage: normalizedUnit
      }
    };

    try {
      const response = await fetch(`${API_URL}/api/blueprints/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${user?.token}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        toast.success('Blueprint saved successfully!');
        setIsCreating(false);
        loadBlueprints();
      } else {
        try {
          const errorData = await response.json();
          const errorMsg = typeof errorData === 'object' ? JSON.stringify(errorData) : errorData;
          toast.error(`Failed to save blueprint: ${errorMsg}`);
        } catch (e) {
          toast.error('Failed to save blueprint. Server returned an error.');
        }
      }
    } catch (err) {
      toast.error('Network error');
    }
  };

  const handleGeneratePaper = async (blueprintId) => {
    try {
      setIsGenerating(blueprintId);
      const response = await fetch(`${API_URL}/api/papers/generate_from_blueprint/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${user?.token}`
        },
        body: JSON.stringify({ blueprint_id: blueprintId })
      });

      if (response.ok) {
        const result = await response.json();
        toast.success('Paper generated successfully based on Blueprint rules!');
        
        // Fetch the created paper details
        const paperResponse = await fetch(`${API_URL}/api/papers/${result.paper_id}/`, {
          headers: { 'Authorization': `Token ${user?.token}` }
        });
        
        if (paperResponse.ok) {
          const paper = await paperResponse.json();
          const paperData = {
            subject: paper.subject,
            questions: paper.questions_detail,
            distribution: paper.distribution,
          };
          sessionStorage.setItem('generated_paper', JSON.stringify(paperData));
          navigate('/question-paper');
        } else {
          navigate('/dashboard');
        }
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to generate paper from blueprint');
      }
    } catch (err) {
      toast.error('Network error while generating paper');
    } finally {
      setIsGenerating(null);
    }
  };

  const renderSliders = (dataObj, setter, title, icon) => {
    const total = calculateTotal(dataObj);
    return (
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
            {icon} {title}
          </h3>
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${total === 100 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
            Total: {total}% (Auto-normalizes)
          </span>
        </div>
        <div className="space-y-4">
          {Object.entries(dataObj).map(([key, value]) => (
            <div key={key}>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-gray-700 dark:text-slate-300">{key}</span>
                <span className="text-gray-500">{value}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={value}
                onChange={(e) => setter({ ...dataObj, [key]: Number(e.target.value) })}
                className="w-full h-2 bg-gray-200 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="relative bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-800 rounded-2xl p-7 text-white shadow-xl overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-3xl font-extrabold tracking-tight">Blueprint Builder</h2>
              <p className="text-blue-100 mt-1 text-sm">Design intelligent exam structures using Bloom's Taxonomy and CO mappings.</p>
            </div>
            {!isCreating && (
              <button onClick={() => setIsCreating(true)} className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-blue-700 font-bold hover:bg-blue-50 transition-all shadow-md">
                <Plus className="w-5 h-5" /> Create New Blueprint
              </button>
            )}
          </div>
        </div>

        {isCreating && (
          <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            <Card className="p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 border-b pb-4 border-gray-100 dark:border-slate-700">Basic Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">Blueprint Name</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-slate-600 focus:border-blue-500 bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white" placeholder="e.g. Midterm Physics Pattern A" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">Subject</label>
                  <input type="text" value={subject} onChange={e => setSubject(e.target.value)} className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-slate-600 focus:border-blue-500 bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">Total Marks</label>
                  <input type="number" value={totalMarks} onChange={e => setTotalMarks(e.target.value)} className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-slate-600 focus:border-blue-500 bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">Duration (minutes)</label>
                  <input type="number" value={duration} onChange={e => setDuration(e.target.value)} className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-slate-600 focus:border-blue-500 bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white" />
                </div>
              </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {renderSliders(bloomDist, setBloomDist, "Bloom's Taxonomy", <PieChart className="w-5 h-5 text-purple-500" />)}
              {renderSliders(difficultyDist, setDifficultyDist, "Difficulty Level", <BarChart3 className="w-5 h-5 text-orange-500" />)}
              {renderSliders(unitWeightage, setUnitWeightage, "Unit Weightage", <Settings2 className="w-5 h-5 text-blue-500" />)}
            </div>

            <div className="flex justify-end gap-4 mt-6">
              <button onClick={() => setIsCreating(false)} className="px-6 py-3 rounded-xl font-bold text-gray-600 hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-all">Cancel</button>
              <button onClick={handleSave} className="flex items-center gap-2 px-8 py-3 rounded-xl font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all transform hover:-translate-y-0.5">
                <Save className="w-5 h-5" /> Save Blueprint
              </button>
            </div>
          </div>
        )}

        {!isCreating && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blueprints.map(bp => (
              <Card key={bp.id} className="hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-blue-500/20 group">
                <div className="p-1">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{bp.name}</h3>
                      <p className="text-sm text-gray-500">{bp.subject}</p>
                    </div>
                    <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-lg text-xs font-bold border border-blue-200 dark:border-blue-800">
                      {bp.total_marks} Marks
                    </span>
                  </div>
                  
                  <div className="space-y-3 mt-6">
                    <div className="bg-gray-50 dark:bg-slate-800/50 p-3 rounded-xl">
                      <p className="text-xs text-gray-500 font-semibold mb-2 uppercase tracking-wider">Top Bloom Levels</p>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(bp.configuration.bloom_distribution || {})
                          .sort(([,a], [,b]) => b - a).slice(0, 3)
                          .map(([k, v]) => (
                            <span key={k} className="text-xs bg-white dark:bg-slate-700 px-2 py-1 rounded-md shadow-sm border border-gray-100 dark:border-slate-600 text-gray-700 dark:text-slate-300">
                              {k}: {v}%
                            </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-4 border-t border-gray-100 dark:border-slate-700">
                    <button
                      onClick={() => handleGeneratePaper(bp.id)}
                      disabled={isGenerating === bp.id}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 font-bold hover:bg-blue-600 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isGenerating === bp.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                      {isGenerating === bp.id ? 'Generating...' : 'Generate Paper'}
                    </button>
                  </div>
                </div>
              </Card>
            ))}
            {blueprints.length === 0 && !loading && (
              <div className="col-span-full py-12 text-center text-gray-500">
                No blueprints created yet. Click "Create New Blueprint" to get started.
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default BlueprintBuilder;
