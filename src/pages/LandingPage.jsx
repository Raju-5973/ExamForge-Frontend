import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import {
  BookOpen, Sparkles, BarChart3,
  Users, CheckCircle2, Brain, FileText, GitBranch,
  Sun, Moon, Zap, Lock, ClipboardCheck, Download,
  Target, Layers, Bell, ArrowRight, Star, Bot,
  FileOutput, DatabaseZap,
  CheckCheck, GraduationCap, Building2, ChevronDown
} from 'lucide-react';

// ── Counter Hook ──────────────────────────────────────────────
const useCounter = (end, duration = 2000, start = false) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [end, duration, start]);
  return count;
};

// ── Animated Stat ─────────────────────────────────────────────
const AnimatedStat = ({ value, suffix, label, start }) => {
  const num = parseInt(value.replace(/\D/g, ''));
  const count = useCounter(num, 2000, start);
  return (
    <div className="text-center group">
      <p className="text-4xl lg:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-b from-white to-blue-200">
        {count}{suffix}
      </p>
      <p className="text-sm font-bold text-blue-300 uppercase tracking-widest mt-1">{label}</p>
    </div>
  );
};

// ── Feature Card ──────────────────────────────────────────────
const FeatureCard = ({ icon, title, desc, gradient, delay = 0 }) => (
  <div
    className="group relative p-7 rounded-3xl bg-white dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 hover:border-transparent hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden cursor-default"
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className={`absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-500 ${gradient}`} />
    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
      {icon}
    </div>
    <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{title}</h3>
    <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed font-medium">{desc}</p>
  </div>
);



// ── Workflow Step ─────────────────────────────────────────────
const WorkflowStep = ({ step, icon, title, desc, color, isLast }) => (
  <div className="flex gap-4 relative">
    <div className="flex flex-col items-center">
      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center text-white shadow-lg flex-shrink-0 z-10`}>
        {icon}
      </div>
      {!isLast && <div className="w-0.5 flex-1 bg-gradient-to-b from-slate-200 to-transparent dark:from-slate-700 mt-2 min-h-[2rem]" />}
    </div>
    <div className="pb-8">
      <span className="text-xs font-black text-blue-500 uppercase tracking-widest">Step {step}</span>
      <h4 className="text-lg font-black text-slate-900 dark:text-white mt-0.5">{title}</h4>
      <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 leading-relaxed font-medium">{desc}</p>
    </div>
  </div>
);

// ── Main Landing Page ─────────────────────────────────────────
export const LandingPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);
  const [statsVisible, setStatsVisible] = useState(false);
  const statsRef = useRef(null);
  const [activeFaq, setActiveFaq] = useState(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStatsVisible(true); },
      { threshold: 0.3 }
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  const features = [
    { icon: <Bot className="w-6 h-6" />, title: "AI Question Generator", desc: "Powered by Groq's Llama 3.3 with multi-tier fallback (Gemini → OpenAI) for guaranteed uptime.", gradient: "from-violet-500 to-purple-600", delay: 0 },
    { icon: <Sparkles className="w-6 h-6" />, title: "Smart Recommendations", desc: "AI engine scores and ranks questions by Bloom's Taxonomy, CO mapping, and difficulty budget.", gradient: "from-pink-500 to-rose-600", delay: 50 },
    { icon: <Layers className="w-6 h-6" />, title: "Blueprint Builder", desc: "Design exam templates with custom Bloom's distribution, difficulty ratios, and unit weightage.", gradient: "from-blue-500 to-indigo-600", delay: 100 },
    { icon: <DatabaseZap className="w-6 h-6" />, title: "Question Bank", desc: "Centralized, institution-scoped bank with AI duplicate detection using semantic similarity scoring.", gradient: "from-emerald-500 to-teal-600", delay: 150 },
    { icon: <Target className="w-6 h-6" />, title: "OBE Mapping", desc: "Align every question to Course Outcomes (CO) and Program Outcomes (PO) for accreditation compliance.", gradient: "from-amber-500 to-orange-600", delay: 200 },
    { icon: <ClipboardCheck className="w-6 h-6" />, title: "Approval Workflow", desc: "Multi-stage paper approval — Staff → HOD → Exam Controller — with real-time notifications.", gradient: "from-cyan-500 to-blue-600", delay: 250 },
    { icon: <BarChart3 className="w-6 h-6" />, title: "Analytics Dashboard", desc: "Visual heatmaps and distribution charts showing Bloom's coverage gaps across departments.", gradient: "from-indigo-500 to-violet-600", delay: 300 },
    { icon: <FileOutput className="w-6 h-6" />, title: "Export Formats", desc: "Download papers as Word (.doc), LaTeX (.tex), or CSV — print-ready in one click.", gradient: "from-teal-500 to-emerald-600", delay: 350 },
    { icon: <Lock className="w-6 h-6" />, title: "Secure Paper Vault", desc: "Encrypted time-locked paper distribution with access controls and watermarking.", gradient: "from-red-500 to-rose-600", delay: 400 },
    { icon: <GitBranch className="w-6 h-6" />, title: "Role-Based Access", desc: "Granular permissions for Principal, HOD, Staff and Exam Controller roles per institution.", gradient: "from-purple-500 to-violet-600", delay: 450 },
    { icon: <Bell className="w-6 h-6" />, title: "Notification Centre", desc: "Instant in-app notifications for approvals, rejections, and paper status changes.", gradient: "from-yellow-500 to-amber-600", delay: 500 },
    { icon: <FileText className="w-6 h-6" />, title: "Audit Trail", desc: "Full chronological log of every paper, question edit, approval action, and user activity.", gradient: "from-slate-500 to-gray-600", delay: 550 },
  ];

  const faqs = [
    { q: "Which AI model powers ExamForge?", a: "ExamForge uses Groq's ultra-fast Llama 3.3 70B as the primary AI model. If Groq is unavailable, it automatically falls back to Google Gemini, then OpenAI GPT-4o-mini, and finally academic templates — ensuring 100% uptime." },
    { q: "Is ExamForge suitable for multiple departments?", a: "Yes! ExamForge is built as a multi-tenant SaaS. Each institution has fully isolated data. Within an institution, departments are scoped separately so staff only see their own subject's question bank." },
    { q: "Can I upload existing question banks?", a: "Absolutely. ExamForge supports bulk CSV upload with automatic duplicate detection. The system compares new questions against your existing bank using semantic similarity scoring and warns you before importing." },
    { q: "How does the Approval Workflow work?", a: "When a staff member generates a paper, they submit it for HOD review. The HOD can approve or reject with remarks. If approved, it moves to the Exam Controller for final sign-off. All stakeholders receive real-time notifications at each step." },
    { q: "What export formats are supported?", a: "Papers can be exported as Microsoft Word (.doc), LaTeX (.tex) for academic typesetting, and CSV for data analysis. All exports are properly formatted and print-ready." },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFF] dark:bg-[#09090F] transition-colors duration-500 font-sans">

      {/* ── Navbar ── */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled
        ? 'bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl shadow-lg shadow-slate-200/20 dark:shadow-slate-900/40 border-b border-slate-100 dark:border-slate-800/60 py-3'
        : 'bg-transparent py-5'
      }`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2.5 rounded-2xl group-hover:rotate-12 transition-transform duration-300 shadow-lg shadow-blue-500/30">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 tracking-tight">
              ExamForge
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-8 mr-4">
              {[['#features', 'Features'], ['#workflow', 'How It Works'], ['#modules', 'Modules'], ['#faq', 'FAQ']].map(([href, label]) => (
                <a key={href} href={href} className="text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  {label}
                </a>
              ))}
            </div>
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all border border-slate-200 dark:border-slate-700"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-blue-600" />}
            </button>
            <button
              onClick={() => navigate(user ? '/dashboard' : '/login')}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-black transition-all shadow-lg shadow-blue-500/25 hover:-translate-y-0.5 active:scale-95"
            >
              {user ? 'Go to Dashboard' : 'Get Started →'}
            </button>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative min-h-screen flex items-center pt-24 pb-16 overflow-hidden">
        {/* Layered background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50/50 to-purple-50/30 dark:from-slate-950 dark:via-indigo-950/20 dark:to-purple-950/10" />
        <div className="absolute top-20 left-10 w-[500px] h-[500px] bg-blue-400/20 dark:bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-purple-400/20 dark:bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-300/10 dark:bg-indigo-600/5 rounded-full blur-[150px] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-6 w-full">


          <div className="text-center max-w-5xl mx-auto">
            <h1 className="text-6xl lg:text-8xl font-black text-slate-900 dark:text-white leading-[1.05] tracking-tight mb-6">
              The Future of
              <br />
              <span className="relative inline-block">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
                  Exam Creation
                </span>
                <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 400 12" fill="none">
                  <path d="M4 8 Q100 2 200 8 Q300 14 396 8" stroke="url(#underline)" strokeWidth="3" strokeLinecap="round" fill="none" />
                  <defs>
                    <linearGradient id="underline" x1="0" y1="0" x2="400" y2="0" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#3B82F6" />
                      <stop offset="0.5" stopColor="#6366F1" />
                      <stop offset="1" stopColor="#9333EA" />
                    </linearGradient>
                  </defs>
                </svg>
              </span>
              <br />
              is Here.
            </h1>

            <p className="text-xl lg:text-2xl text-slate-600 dark:text-slate-400 font-medium leading-relaxed max-w-3xl mx-auto mb-10">
              ExamForge combines AI question generation, Blueprint-based paper creation, OBE compliance mapping, and multi-stage approval workflows into one unified academic platform.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <button
                onClick={() => navigate(user ? '/dashboard' : '/login')}
                className="group w-full sm:w-auto px-10 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-lg transition-all shadow-2xl shadow-blue-500/30 hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2"
              >
                Start Building Papers
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}
                className="w-full sm:w-auto px-10 py-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-md"
              >
                Explore Features
              </button>
            </div>

            {/* Feature pills */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              {['AI Generation', 'OBE Mapping', 'Blueprint Builder', 'Approval Workflow', 'Analytics', 'Export Formats', 'Audit Trail', 'Secure Vault'].map(pill => (
                <span key={pill} className="px-4 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-full shadow-sm">
                  {pill}
                </span>
              ))}
            </div>
          </div>

          {/* Hero Dashboard Preview */}
          <div className="mt-16 relative max-w-5xl mx-auto">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-[2rem] blur-2xl" />
            <div className="relative bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200/80 dark:border-slate-700/80 shadow-2xl overflow-hidden">
              {/* Browser chrome */}
              <div className="bg-slate-100 dark:bg-slate-800 px-5 py-3 flex items-center gap-3 border-b border-slate-200 dark:border-slate-700">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-rose-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400" />
                </div>
                <div className="flex-1 mx-4 bg-white dark:bg-slate-700 rounded-lg px-4 py-1 text-xs text-slate-400 font-mono">
                  localhost:3000/dashboard
                </div>
              </div>
              {/* Fake dashboard UI */}
              <div className="p-6 grid grid-cols-3 gap-4 bg-slate-50 dark:bg-slate-950">
                {[
                  { label: 'Questions', value: '2,847', color: 'from-blue-500 to-indigo-500', icon: '📚' },
                  { label: 'Papers Generated', value: '142', color: 'from-violet-500 to-purple-500', icon: '📄' },
                  { label: 'AI Generated', value: '89', color: 'from-emerald-500 to-teal-500', icon: '🤖' },
                ].map(card => (
                  <div key={card.label} className={`p-4 rounded-2xl bg-gradient-to-br ${card.color} text-white shadow-lg`}>
                    <div className="text-2xl mb-1">{card.icon}</div>
                    <div className="text-2xl font-black">{card.value}</div>
                    <div className="text-xs font-bold opacity-80 mt-0.5">{card.label}</div>
                  </div>
                ))}
                <div className="col-span-2 bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700">
                  <p className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3">Bloom's Coverage</p>
                  <div className="space-y-2">
                    {[['Remember', 85, 'bg-blue-500'], ['Understand', 72, 'bg-indigo-500'], ['Apply', 60, 'bg-violet-500'], ['Analyze', 45, 'bg-purple-500']].map(([label, pct, color]) => (
                      <div key={label} className="flex items-center gap-3">
                        <span className="text-xs w-20 font-bold text-slate-500 dark:text-slate-400">{label}</span>
                        <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div className={`h-full ${color} rounded-full`} style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs font-bold text-slate-400">{pct}%</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700">
                  <p className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3">AI Status</p>
                  <div className="flex flex-col gap-2">
                    {[['Groq Llama 3.3', 'Active', 'bg-emerald-500'], ['Gemini', 'Standby', 'bg-amber-500'], ['OpenAI', 'Fallback', 'bg-slate-400']].map(([name, status, color]) => (
                      <div key={name} className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{name}</span>
                        <div className="flex items-center gap-1.5">
                          <div className={`w-1.5 h-1.5 rounded-full ${color} ${status === 'Active' ? 'animate-pulse' : ''}`} />
                          <span className="text-[10px] font-bold text-slate-400">{status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section ref={statsRef} className="py-16 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djZoNnYtNmgtNnptMC0zNHY2aDZ2LTZoLTZ6TTYgMzR2Nmg2di02SDZ6bTAtMzR2Nmg2VjBINnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-40" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-12">
            {[
              { value: '100', suffix: '+', label: 'Institutions' },
              { value: '50', suffix: 'k+', label: 'Questions Stored' },
              { value: '10', suffix: 'k+', label: 'Papers Generated' },
              { value: '99', suffix: '.9%', label: 'AI Uptime' },
            ].map((s, i) => (
              <AnimatedStat key={i} {...s} start={statsVisible} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Features Grid ── */}
      <section id="features" className="py-28 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-100/50 dark:bg-indigo-900/10 rounded-full blur-[150px] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-black uppercase tracking-widest mb-6">
              <Star className="w-3.5 h-3.5" />
              15 Integrated Modules
            </div>
            <h2 className="text-5xl font-black text-slate-900 dark:text-white leading-tight mb-4">
              Everything Built In.
              <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">Nothing Held Back.</span>
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-lg font-medium leading-relaxed">
              From AI-powered generation to audit-ready compliance tracking — ExamForge covers every step of the academic assessment lifecycle.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <FeatureCard key={i} {...f} />
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="workflow" className="py-28 bg-slate-50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-50 dark:bg-violet-950/50 border border-violet-200 dark:border-violet-800 text-violet-700 dark:text-violet-300 text-xs font-black uppercase tracking-widest mb-6">
                <GitBranch className="w-3.5 h-3.5" />
                End-to-End Workflow
              </div>
              <h2 className="text-5xl font-black text-slate-900 dark:text-white leading-tight mb-4">
                From Prompt to
                <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-purple-600">Printed Paper</span>
              </h2>
              <p className="text-slate-500 dark:text-slate-400 font-medium text-lg leading-relaxed mb-12">
                ExamForge orchestrates the entire exam creation process — from AI generation through institutional approval to final export.
              </p>

              <div className="space-y-0">
                <WorkflowStep step={1} icon={<Brain className="w-6 h-6" />} title="Define Your Blueprint" desc="Set Bloom's Taxonomy distribution, difficulty ratios, unit weightage, and total marks using the visual Blueprint Builder." color="from-blue-500 to-indigo-600" />
                <WorkflowStep step={2} icon={<Bot className="w-6 h-6" />} title="AI Generates Questions" desc="Groq's Llama 3.3 model generates contextually relevant questions matching your blueprint criteria instantly." color="from-violet-500 to-purple-600" />
                <WorkflowStep step={3} icon={<Target className="w-6 h-6" />} title="Smart Recommendation" desc="The AI Recommender engine scores and selects the best questions from your bank to fill the marks budget optimally." color="from-emerald-500 to-teal-600" />
                <WorkflowStep step={4} icon={<CheckCircle2 className="w-6 h-6" />} title="Approval & Finalization" desc="Paper routes through Staff → HOD → Exam Controller with remarks, notifications, and an immutable audit trail." color="from-amber-500 to-orange-600" />
                <WorkflowStep step={5} icon={<Download className="w-6 h-6" />} title="Export & Distribute" desc="Download as Word, LaTeX, or CSV. Encrypted vault controls when and who can access the final paper." color="from-rose-500 to-pink-600" isLast />
              </div>
            </div>

            <div className="lg:sticky lg:top-24 space-y-6">
              {/* AI Tier Card */}
              <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-3xl p-6 border border-indigo-900/50 shadow-2xl text-white">
                <div className="flex items-center gap-3 mb-5">
                  <div className="p-2 bg-violet-500/20 rounded-xl">
                    <Zap className="w-5 h-5 text-violet-400" />
                  </div>
                  <div>
                    <p className="font-black text-sm">AI Provider Tier System</p>
                    <p className="text-slate-400 text-xs font-medium">Guaranteed 100% generation uptime</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {[
                    { tier: '1st', name: 'Groq Llama 3.3', speed: 'Ultra-fast · Free', status: 'primary', color: 'border-emerald-500/40 bg-emerald-500/10' },
                    { tier: '2nd', name: 'Google Gemini', speed: 'Fast · Fallback', status: 'standby', color: 'border-blue-500/40 bg-blue-500/10' },
                    { tier: '3rd', name: 'OpenAI GPT-4o', speed: 'Reliable · Fallback', status: 'fallback', color: 'border-amber-500/40 bg-amber-500/10' },
                    { tier: '4th', name: 'Academic Templates', speed: 'Always available', status: 'safety-net', color: 'border-slate-500/40 bg-slate-500/10' },
                  ].map(p => (
                    <div key={p.name} className={`flex items-center justify-between p-3 rounded-xl border ${p.color}`}>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black text-slate-400 w-6">{p.tier}</span>
                        <div>
                          <p className="text-sm font-bold">{p.name}</p>
                          <p className="text-xs text-slate-400">{p.speed}</p>
                        </div>
                      </div>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${p.status === 'primary' ? 'bg-emerald-500/20 text-emerald-400' : p.status === 'standby' ? 'bg-blue-500/20 text-blue-400' : p.status === 'fallback' ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-500/20 text-slate-400'}`}>
                        {p.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Module Map */}
              <div className="bg-white dark:bg-slate-800/60 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-lg">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">All 15 Modules Included</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { n: 1, l: 'Question Bank', c: 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-300' },
                    { n: 2, l: 'Paper Generator', c: 'border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300' },
                    { n: 3, l: 'AI Generator', c: 'border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-800 dark:bg-violet-950/40 dark:text-violet-300' },
                    { n: 4, l: 'OBE Mapping', c: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300' },
                    { n: 5, l: 'Analytics', c: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300' },
                    { n: 6, l: 'Multi-Tenant', c: 'border-cyan-200 bg-cyan-50 text-cyan-700 dark:border-cyan-800 dark:bg-cyan-950/40 dark:text-cyan-300' },
                    { n: 7, l: 'Blueprint Builder', c: 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-300' },
                    { n: 8, l: 'Duplicate Detection', c: 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300' },
                    { n: 9, l: 'AI Recommender', c: 'border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-800 dark:bg-purple-950/40 dark:text-purple-300' },
                    { n: 10, l: 'Secure Vault', c: 'border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300' },
                    { n: 11, l: 'Export Formats', c: 'border-teal-200 bg-teal-50 text-teal-700 dark:border-teal-800 dark:bg-teal-950/40 dark:text-teal-300' },
                    { n: 12, l: 'LMS Integration', c: 'border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-800 dark:bg-orange-950/40 dark:text-orange-300' },
                    { n: 13, l: 'Approval Flow', c: 'border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-800 dark:bg-yellow-950/40 dark:text-yellow-300' },
                    { n: 14, l: 'Notifications', c: 'border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300' },
                    { n: 15, l: 'Audit Trail', c: 'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300' },
                  ].map(m => (
                    <span key={m.n} className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-bold ${m.c}`}>
                      <span className="opacity-50 text-[9px]">M{m.n}</span>{m.l}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Roles Section ── */}
      <section id="modules" className="py-28 relative overflow-hidden">
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-100/50 dark:bg-blue-900/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-black uppercase tracking-widest mb-6">
              <Users className="w-3.5 h-3.5" />
              Role-Based Platform
            </div>
            <h2 className="text-5xl font-black text-slate-900 dark:text-white leading-tight mb-4">
              Built for Every Role
              <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-600">in Your Institution</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                role: 'Principal / Admin',
                icon: <Building2 className="w-8 h-8" />,
                gradient: 'from-blue-600 to-indigo-700',
                bg: 'from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30',
                border: 'border-blue-200 dark:border-blue-800',
                perks: [
                  'Full institution-wide dashboard & analytics',
                  'Generate AI question papers with one click',
                  'Final approval authority for all papers',
                  'Manage staff accounts and departments',
                  'View complete audit trail and activity logs',
                  'Access secure paper vault with encryption',
                ]
              },
              {
                role: 'Staff / Faculty',
                icon: <GraduationCap className="w-8 h-8" />,
                gradient: 'from-violet-600 to-purple-700',
                bg: 'from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30',
                border: 'border-violet-200 dark:border-violet-800',
                perks: [
                  'Department-scoped question bank access',
                  'Add questions with Bloom\'s taxonomy tagging',
                  'Bulk upload via CSV with duplicate detection',
                  'Submit papers for HOD approval with remarks',
                  'Use AI Generator and Blueprint Builder tools',
                  'Export papers as Word, LaTeX, or CSV formats',
                ]
              }
            ].map(role => (
              <div key={role.role} className={`relative p-8 rounded-3xl bg-gradient-to-br ${role.bg} border ${role.border} overflow-hidden group hover:shadow-2xl transition-all duration-500`}>
                <div className={`absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br ${role.gradient} opacity-5 rounded-full group-hover:opacity-10 transition-opacity`} />
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${role.gradient} flex items-center justify-center text-white mb-5 shadow-xl`}>
                  {role.icon}
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-6">{role.role}</h3>
                <ul className="space-y-3">
                  {role.perks.map(perk => (
                    <li key={perk} className="flex items-start gap-3">
                      <CheckCheck className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">{perk}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="py-28 bg-slate-50 dark:bg-slate-900/50">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black text-slate-900 dark:text-white mb-4">Frequently Asked</h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">Everything you need to know about ExamForge.</p>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden transition-all">
                <button
                  className="w-full flex items-center justify-between p-6 text-left"
                  onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                >
                  <span className="font-black text-slate-900 dark:text-white pr-4">{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 text-slate-400 flex-shrink-0 transition-transform duration-300 ${activeFaq === i ? 'rotate-180' : ''}`} />
                </button>
                {activeFaq === i && (
                  <div className="px-6 pb-6 text-slate-600 dark:text-slate-400 font-medium leading-relaxed text-sm border-t border-slate-100 dark:border-slate-700 pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-28 mx-6 mb-16">
        <div className="max-w-6xl mx-auto relative">
          <div className="relative bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 rounded-[3rem] p-16 text-center text-white overflow-hidden shadow-2xl shadow-blue-500/20">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNCI+PHBhdGggZD0iTTM2IDM0djZoNnYtNmgtNnptMC0zNHY2aDZ2LTZoLTZ6TTYgMzR2Nmg2di02SDZ6bTAtMzR2Nmg2VjBINnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-40" />
            <div className="absolute -top-20 -left-20 w-60 h-60 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-purple-400/20 rounded-full blur-3xl" />

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white/80 text-xs font-black uppercase tracking-widest mb-8">
                <Zap className="w-3.5 h-3.5" />
                Ready in 60 Seconds
              </div>
              <h2 className="text-5xl lg:text-7xl font-black leading-tight mb-6">
                Ready to Forge
                <br />
                Smarter Exams?
              </h2>
              <p className="text-xl text-blue-100 font-medium mb-10 max-w-xl mx-auto">
                Join institutions already automating their entire academic assessment workflow with ExamForge.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={() => navigate(user ? '/dashboard' : '/login')}
                  className="group px-10 py-4 rounded-2xl bg-white text-blue-700 font-black text-lg hover:bg-blue-50 transition-all shadow-2xl active:scale-95 flex items-center gap-2"
                >
                  Get Started for Free
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-12 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2 rounded-xl">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-black text-slate-900 dark:text-white">ExamForge</span>
            <span className="text-sm text-slate-400 font-medium">· AI Academic Assessment Platform</span>
          </div>
          <p className="text-sm font-medium text-slate-400">© 2026 ExamForge. Built with 🤖 AI + ❤️ for Educators.</p>
          <div className="flex items-center gap-6 text-sm font-bold text-slate-400">
            <a href="/" className="hover:text-blue-600 transition-colors">Privacy</a>
            <a href="/" className="hover:text-blue-600 transition-colors">Terms</a>
            <a href="/login" className="hover:text-blue-600 transition-colors">Support</a>
          </div>
        </div>
      </footer>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        html { scroll-behavior: smooth; }
      `}} />
    </div>
  );
};
