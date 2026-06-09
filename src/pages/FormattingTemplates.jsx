import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { Card } from '../components/Card';
import { Palette, Download, Loader2, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';

const TEMPLATES = [
  {
    id: 'classic',
    name: 'Classic Academic',
    description: 'Traditional exam format with section dividers',
    accent: '#1e3a8a',
    preview: 'bg-blue-50 border-blue-200',
  },
  {
    id: 'modern',
    name: 'Modern Minimal',
    description: 'Clean lines, bold headers, contemporary feel',
    accent: '#7c3aed',
    preview: 'bg-purple-50 border-purple-200',
  },
  {
    id: 'government',
    name: 'Government / Board',
    description: 'Formal style matching board examination format',
    accent: '#b45309',
    preview: 'bg-amber-50 border-amber-200',
  },
];

export const FormattingTemplates = () => {
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState('classic');
  const [institutionName, setInstitutionName] = useState('');
  const [examTitle, setExamTitle] = useState('');
  const [instructions, setInstructions] = useState(
    '1. Answer all questions.\n2. Use blue ink only.\n3. Mobile phones not allowed.'
  );
  const [generating, setGenerating] = useState(null);

  useEffect(() => { fetchPapers(); }, []);

  const fetchPapers = async () => {
    try {
      const res = await api.get('/api/papers/');
      setPapers(res.data);
    } catch { toast.error('Failed to load papers'); }
    finally { setLoading(false); }
  };

  const generateFormattedPDF = async (paper) => {
    setGenerating(paper.id);
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const W = doc.internal.pageSize.getWidth();
      const tmpl = TEMPLATES.find(t => t.id === selectedTemplate) || TEMPLATES[0];
      const accentRGB = tmpl.accent.match(/\w\w/g).map(h => parseInt(h, 16));

      // === HEADER ===
      doc.setFillColor(...accentRGB);
      doc.rect(0, 0, W, 30, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(255, 255, 255);
      const instLine = institutionName || 'ExamForge Institution';
      doc.text(instLine, W / 2, 12, { align: 'center' });
      doc.setFontSize(11);
      doc.text(examTitle || `${paper.subject} Examination`, W / 2, 21, { align: 'center' });
      doc.setFontSize(9);
      doc.text(`Date: ${new Date().toLocaleDateString()}    Subject: ${paper.subject}`, W / 2, 27, { align: 'center' });

      // === INSTRUCTIONS ===
      let y = 38;
      doc.setFillColor(245, 245, 245);
      const instrLines = instructions.split('\n');
      doc.rect(12, y - 4, W - 24, instrLines.length * 6 + 4, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(...accentRGB);
      doc.text('INSTRUCTIONS:', 15, y);
      y += 5;
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(50, 50, 50);
      instrLines.forEach(line => {
        doc.text(line, 15, y);
        y += 6;
      });
      y += 4;

      // Divider
      doc.setDrawColor(...accentRGB);
      doc.setLineWidth(0.5);
      doc.line(12, y, W - 12, y);
      y += 8;

      // === QUESTIONS ===
      const questions = paper.questions_detail || [];
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.setTextColor(20, 20, 20);

      questions.forEach((q, i) => {
        const text = typeof q === 'string' ? q : q.text || '';
        const marks = typeof q === 'object' ? q.marks : '';
        const lines = doc.splitTextToSize(`Q${i + 1}. ${text}`, W - 30);
        const blockH = lines.length * 7 + 6;

        if (y + blockH > doc.internal.pageSize.getHeight() - 20) {
          doc.addPage();
          y = 20;
        }

        if (i % 2 === 0) {
          doc.setFillColor(249, 249, 255);
          doc.rect(12, y - 4, W - 24, blockH, 'F');
        }

        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...accentRGB);
        doc.text(`Q${i + 1}.`, 14, y);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(20, 20, 20);
        const qlines = doc.splitTextToSize(text, W - 36);
        doc.text(qlines, 24, y);
        if (marks) {
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(...accentRGB);
          doc.text(`[${marks} M]`, W - 14, y, { align: 'right' });
        }
        y += blockH;
      });

      // === FOOTER ===
      const total = doc.internal.getNumberOfPages();
      for (let p = 1; p <= total; p++) {
        doc.setPage(p);
        doc.setFillColor(...accentRGB);
        doc.rect(0, doc.internal.pageSize.getHeight() - 10, W, 10, 'F');
        doc.setFontSize(8);
        doc.setTextColor(255, 255, 255);
        doc.text(`${instLine} | Template: ${tmpl.name} | Page ${p} of ${total}`,
          W / 2, doc.internal.pageSize.getHeight() - 4, { align: 'center' });
      }

      doc.save(`${paper.subject}_${tmpl.id}.pdf`);
      toast.success(`PDF generated with "${tmpl.name}" template!`);
    } catch (err) {
      console.error(err);
      toast.error('PDF generation failed');
    } finally {
      setGenerating(null);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="relative bg-gradient-to-r from-rose-600 via-pink-600 to-fuchsia-600 rounded-2xl p-7 text-white shadow-xl overflow-hidden">
          <div className="absolute -top-16 -right-16 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <Palette className="w-5 h-5 text-pink-200" />
              <span className="text-pink-200 text-sm font-medium uppercase tracking-wider">Module 13</span>
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight">Custom Formatting Templates</h2>
            <p className="text-pink-100 mt-1 text-sm">Brand your papers with institution logos and custom styles</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Config Panel */}
          <Card className="p-6 space-y-4">
            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Palette className="w-4 h-4 text-pink-500" /> Template Config
            </h3>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">Choose Template</label>
              <div className="space-y-2">
                {TEMPLATES.map(t => (
                  <div key={t.id} onClick={() => setSelectedTemplate(t.id)}
                    className={`cursor-pointer p-3 rounded-xl border-2 transition-all ${selectedTemplate === t.id ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/20' : 'border-gray-200 dark:border-slate-700 hover:border-pink-300'}`}>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: t.accent }} />
                      <p className="text-sm font-bold text-gray-900 dark:text-white">{t.name}</p>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-slate-400 mt-1 ml-6">{t.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1">Institution Name</label>
              <input type="text" value={institutionName} onChange={e => setInstitutionName(e.target.value)}
                placeholder="Your University Name"
                className="w-full px-3 py-2.5 border-2 rounded-xl bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white focus:border-pink-500 focus:outline-none text-sm" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1">Exam Title Override</label>
              <input type="text" value={examTitle} onChange={e => setExamTitle(e.target.value)}
                placeholder="e.g. End Semester Examination"
                className="w-full px-3 py-2.5 border-2 rounded-xl bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white focus:border-pink-500 focus:outline-none text-sm" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1">Instructions</label>
              <textarea value={instructions} onChange={e => setInstructions(e.target.value)} rows={4}
                className="w-full px-3 py-2.5 border-2 rounded-xl bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white focus:border-pink-500 focus:outline-none text-sm resize-none" />
            </div>
          </Card>

          {/* Papers List */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 px-1">
              <FileText className="w-4 h-4 text-pink-500" /> Select Paper to Format
            </h3>
            {loading ? (
              <div className="flex items-center justify-center h-40"><Loader2 className="w-7 h-7 animate-spin text-pink-500" /></div>
            ) : papers.length === 0 ? (
              <Card className="p-10 text-center text-gray-400">No papers found. Generate one from the dashboard first.</Card>
            ) : (
              papers.map(paper => (
                <Card key={paper.id} className="p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white">{paper.subject}</p>
                      <p className="text-xs text-gray-400">{(paper.questions || []).length} questions · {new Date(paper.created_at).toLocaleDateString()}</p>
                    </div>
                    <button onClick={() => generateFormattedPDF(paper)} disabled={!!generating}
                      className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-sm font-bold rounded-xl hover:from-rose-600 hover:to-pink-600 disabled:opacity-50 transition-all shadow-md shadow-pink-500/30">
                      {generating === paper.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                      {generating === paper.id ? 'Generating...' : 'Apply & Download'}
                    </button>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default FormattingTemplates;
