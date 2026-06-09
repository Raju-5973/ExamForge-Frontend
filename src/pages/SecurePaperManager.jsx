import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Layout } from '../components/Layout';
import { Card } from '../components/Card';
import { Shield, Download, Lock, FileText, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';

export const SecurePaperManager = () => {
  const { user } = useAuth();
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [watermarkText, setWatermarkText] = useState('CONFIDENTIAL');
  const [accessPin, setAccessPin] = useState('');
  const [expiryDays, setExpiryDays] = useState('7');

  useEffect(() => {
    fetchPapers();
  }, []);

  const fetchPapers = async () => {
    try {
      const res = await api.get('/api/papers/');
      const data = res.data;
      // Handle both paginated ({results: [...]}) and plain array responses
      setPapers(Array.isArray(data) ? data : (data.results || []));
    } catch {
      toast.error('Failed to load papers');
    } finally {
      setLoading(false);
    }
  };

  const handleSecureDownload = async (paper) => {
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pageW = doc.internal.pageSize.getWidth();
      const pageH = doc.internal.pageSize.getHeight();

      // -- Watermark diagonal text --
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(48);
      doc.setTextColor(220, 220, 220);
      doc.setGState(doc.GState({ opacity: 0.25 }));
      const wm = watermarkText || 'CONFIDENTIAL';
      for (let y = 50; y < pageH; y += 70) {
        doc.text(wm, pageW / 2, y, { angle: 45, align: 'center' });
      }
      doc.setGState(doc.GState({ opacity: 1 }));

      // -- Header --
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.setTextColor(30, 30, 30);
      doc.text('QUESTION PAPER', pageW / 2, 20, { align: 'center' });
      doc.setFontSize(13);
      doc.text(paper.subject || 'Exam', pageW / 2, 29, { align: 'center' });

      // -- Security badge --
      doc.setFontSize(8);
      doc.setTextColor(200, 0, 0);
      doc.text(`🔒 SECURE COPY | PIN: ${accessPin || 'N/A'} | Expires: ${expiryDays} days`, pageW / 2, 36, { align: 'center' });

      doc.setDrawColor(100, 100, 200);
      doc.setLineWidth(0.5);
      doc.line(14, 39, pageW - 14, 39);

      // -- Questions --
      doc.setTextColor(30, 30, 30);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      let y = 48;
      const questions = paper.questions_detail || [];
      questions.forEach((q, i) => {
        const text = typeof q === 'string' ? q : q.text || '';
        const marks = typeof q === 'object' ? q.marks : '';
        const lines = doc.splitTextToSize(`Q${i + 1}. ${text}`, pageW - 28);
        if (y + lines.length * 7 > pageH - 20) {
          doc.addPage();
          y = 20;
          // Re-apply watermark on new page
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(48);
          doc.setTextColor(220, 220, 220);
          doc.setGState(doc.GState({ opacity: 0.25 }));
          for (let wy = 50; wy < pageH; wy += 70) {
            doc.text(wm, pageW / 2, wy, { angle: 45, align: 'center' });
          }
          doc.setGState(doc.GState({ opacity: 1 }));
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(11);
          doc.setTextColor(30, 30, 30);
        }
        doc.text(lines, 14, y);
        if (marks) {
          doc.setFont('helvetica', 'bold');
          doc.text(`[${marks} marks]`, pageW - 14, y, { align: 'right' });
          doc.setFont('helvetica', 'normal');
        }
        y += lines.length * 7 + 4;
      });

      // -- Footer --
      const total = doc.internal.getNumberOfPages();
      for (let p = 1; p <= total; p++) {
        doc.setPage(p);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(`Page ${p} of ${total} | Generated: ${new Date().toLocaleString()} | ${user?.name || ''}`, pageW / 2, pageH - 6, { align: 'center' });
      }

      doc.save(`SECURE_${paper.subject}_${Date.now()}.pdf`);
      toast.success('Secure PDF downloaded with watermark!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate PDF');
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="relative bg-gradient-to-r from-slate-700 via-gray-800 to-zinc-800 rounded-2xl p-7 text-white shadow-xl overflow-hidden">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-16 -right-16 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-5 h-5 text-blue-300" />
              <span className="text-blue-300 text-sm font-medium uppercase tracking-wider">Module 10</span>
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight">Secure Paper Manager</h2>
            <p className="text-slate-300 mt-1 text-sm">Watermarked PDFs, access PINs and expiry controls</p>
          </div>
        </div>

        {/* Security Settings */}
        <Card className="p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Lock className="w-5 h-5 text-slate-600" /> Security Settings
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1">Watermark Text</label>
              <input type="text" value={watermarkText} onChange={e => setWatermarkText(e.target.value)}
                placeholder="CONFIDENTIAL"
                className="w-full px-3 py-2.5 border-2 rounded-xl bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white focus:border-slate-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1">Access PIN (shown on PDF)</label>
              <input type="text" value={accessPin} onChange={e => setAccessPin(e.target.value)}
                placeholder="e.g. EF-2026"
                className="w-full px-3 py-2.5 border-2 rounded-xl bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white focus:border-slate-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1">Expiry Period</label>
              <select value={expiryDays} onChange={e => setExpiryDays(e.target.value)}
                className="w-full px-3 py-2.5 border-2 rounded-xl bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white focus:border-slate-500 focus:outline-none">
                {['1','3','7','14','30'].map(d => <option key={d} value={d}>{d} days</option>)}
              </select>
            </div>
          </div>
        </Card>

        {/* Paper List */}
        <Card className="p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-slate-600" /> Generated Papers
          </h3>
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-slate-500" />
            </div>
          ) : papers.length === 0 ? (
            <div className="text-center py-12 text-gray-400">No papers generated yet.</div>
          ) : (
            <div className="space-y-3">
              {papers.map(paper => (
                <div key={paper.id} className="flex items-center justify-between p-4 rounded-2xl border border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50 hover:border-slate-300 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-xl">
                      <Shield className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white text-sm">{paper.subject}</p>
                      <p className="text-xs text-gray-400">{(paper.questions || []).length} questions · Created {new Date(paper.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleSecureDownload(paper)}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white text-xs font-bold rounded-xl hover:bg-slate-700 transition-all">
                    <Download className="w-3.5 h-3.5" /> Secure PDF
                  </button>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </Layout>
  );
};

export default SecurePaperManager;
