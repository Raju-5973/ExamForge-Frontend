import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { Card } from '../components/Card';
import { Link2, Download, Loader2, CheckCircle, Globe } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';

const LMS_FORMATS = [
  { id: 'moodle', name: 'Moodle', description: 'GIFT format compatible with Moodle LMS', color: 'bg-orange-500', ext: '.gift.txt' },
  { id: 'canvas', name: 'Canvas LMS', description: 'QTI 1.2 XML for Canvas / Blackboard', color: 'bg-blue-600', ext: '.qti.xml' },
  { id: 'google_forms', name: 'Google Forms', description: 'Google Apps Script to auto-generate forms', color: 'bg-green-600', ext: '.js' },
  { id: 'scorm', name: 'SCORM Package', description: 'JSON manifest for SCORM-compatible LMS', color: 'bg-purple-600', ext: '.scorm.json' },
];

export const LMSIntegration = () => {
  const [subject, setSubject] = useState('');
  const [format, setFormat] = useState('moodle');
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  const SUBJECTS = ['Mathematics','Physics','Chemistry','Biology','English','Computer Science','Electronics','Electrical','Mechanical','Civil'];

  const sanitize = text => text ? String(text).replace(/\n/g, ' ').replace(/\t/g, ' ') : '';

  const fetchAndExport = async () => {
    if (!subject) { toast.error('Select a subject first'); return; }
    setLoading(true);
    try {
      const res = await api.get('/api/questions/', { params: { subject } });
      const qs = res.data.results || res.data;
      if (!Array.isArray(qs) || qs.length === 0) { toast.error('No questions found for this subject'); return; }
      exportLMS(qs, format);
    } catch {
      toast.error('Failed to fetch questions');
    } finally {
      setLoading(false);
    }
  };

  const exportLMS = (qs, fmt) => {
    setExporting(true);
    const chosen = LMS_FORMATS.find(f => f.id === fmt);
    let content = '';
    let mime = 'text/plain';

    if (fmt === 'moodle') {
      // GIFT format
      content = qs.map(q => {
        const text = sanitize(q.text).replace(/:/g, '\\:').replace(/\{/g, '\\{').replace(/\}/g, '\\}');
        return `// Question ${q.id}\n::Q${q.id}:: ${text} { ~Wrong Answer 1 ~Wrong Answer 2 =Correct Answer }`;
      }).join('\n\n');
    } else if (fmt === 'canvas') {
      // Simplified QTI 1.2 XML
      const items = qs.map(q => `  <item ident="q${q.id}" title="Q${q.id}">
    <presentation><material><mattext>${sanitize(q.text)}</mattext></material></presentation>
    <response_lid><render_choice>
      <response_label ident="a"><material><mattext>Choice A</mattext></material></response_label>
      <response_label ident="b"><material><mattext>Choice B</mattext></material></response_label>
    </render_choice></response_lid>
  </item>`).join('\n');
      content = `<?xml version="1.0" encoding="UTF-8"?>\n<questestinterop>\n<assessment title="${subject} Quiz">\n${items}\n</assessment>\n</questestinterop>`;
      mime = 'text/xml';
    } else if (fmt === 'google_forms') {
      // Google Apps Script
      const scriptLines = [
        `/**`,
        ` * EXAMFORGE GOOGLE FORMS GENERATOR`,
        ` * `,
        ` * INSTRUCTIONS:`,
        ` * 1. Go to https://script.google.com/ and click "New Project"`,
        ` * 2. Delete all existing code and paste this entire file`,
        ` * 3. Click the "Run" button at the top`,
        ` * 4. Grant the permissions requested by Google`,
        ` * 5. Check your Google Drive! Your form is ready.`,
        ` */`,
        ``,
        `function createExamForgeForm() {`,
        `  var form = FormApp.create("${subject} Question Bank");`,
        `  form.setDescription("Generated automatically by ExamForge.");`,
        `  form.setIsQuiz(true);`,
        ``
      ];

      qs.forEach((q, i) => {
        // Escape quotes to prevent breaking the JS string
        const safeText = sanitize(q.text).replace(/"/g, '\\"');
        const points = q.marks || 1;
        scriptLines.push(`  var q${i} = form.addParagraphTextItem();`);
        scriptLines.push(`  q${i}.setTitle("${safeText}");`);
        scriptLines.push(`  q${i}.setPoints(${points});`);
      });

      scriptLines.push(``);
      scriptLines.push(`  Logger.log("Form created successfully!");`);
      scriptLines.push(`}`);
      
      content = scriptLines.join('\n');
      mime = 'text/javascript';
    } else if (fmt === 'scorm') {
      // JSON manifest
      const manifest = {
        scorm_version: '1.2',
        course: { title: `${subject} Question Bank`, subject },
        items: qs.map((q, i) => ({
          id: `item_${i + 1}`,
          title: `Q${i + 1}`,
          text: sanitize(q.text),
          marks: q.marks,
          difficulty: q.difficulty,
          bloom_level: q.bloom_level,
        }))
      };
      content = JSON.stringify(manifest, null, 2);
      mime = 'application/json';
    }

    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ExamForge_${subject}_${fmt}${chosen?.ext || '.txt'}`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${qs.length} questions as ${chosen?.name} format!`);
    setExporting(false);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="relative bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 rounded-2xl p-7 text-white shadow-xl overflow-hidden">
          <div className="absolute -top-16 -right-16 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <Globe className="w-5 h-5 text-cyan-200" />
              <span className="text-cyan-200 text-sm font-medium uppercase tracking-wider">Module 15</span>
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight">LMS Integration Engine</h2>
            <p className="text-blue-100 mt-1 text-sm">Export question banks to Moodle, Canvas, Google Forms, and SCORM</p>
          </div>
        </div>

        {/* Format selector */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {LMS_FORMATS.map(f => (
            <div key={f.id} onClick={() => setFormat(f.id)}
              className={`cursor-pointer p-4 rounded-2xl border-2 transition-all ${format === f.id ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg' : 'border-gray-100 dark:border-slate-700 hover:border-blue-200'}`}>
              <div className={`w-8 h-8 ${f.color} rounded-xl flex items-center justify-center mb-3`}>
                <Link2 className="w-4 h-4 text-white" />
              </div>
              <p className="font-bold text-gray-900 dark:text-white text-sm">{f.name}</p>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">{f.description}</p>
              {format === f.id && (
                <div className="flex items-center gap-1 mt-2">
                  <CheckCircle className="w-3.5 h-3.5 text-blue-500" />
                  <span className="text-xs font-bold text-blue-500">Selected</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Export config */}
        <Card className="p-6">
          <h3 className="font-bold text-gray-900 dark:text-white mb-4">Export Settings</h3>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1">Subject</label>
              <select value={subject} onChange={e => setSubject(e.target.value)}
                className="w-full px-3 py-2.5 border-2 rounded-xl bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none">
                <option value="">Select Subject</option>
                {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="flex items-end">
              <button onClick={fetchAndExport} disabled={loading || exporting}
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 text-white text-sm font-bold rounded-xl hover:from-cyan-700 hover:to-blue-700 disabled:opacity-50 transition-all shadow-lg shadow-blue-500/30">
                {loading || exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                {loading ? 'Loading...' : exporting ? 'Exporting...' : `Export to ${LMS_FORMATS.find(f => f.id === format)?.name}`}
              </button>
            </div>
          </div>
        </Card>

        {/* Info cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { title: 'GIFT Format', body: 'Moodle\'s native quiz import format. Supports Multiple Choice, True/False, Short Answer and more.', color: 'text-orange-600' },
            { title: 'QTI 1.2 XML', body: 'IMS Question and Test Interoperability spec used by Canvas, Blackboard, and D2L Brightspace.', color: 'text-blue-600' },
            { title: 'SCORM JSON', body: 'SCORM-compatible question manifest for packaging into full eLearning modules.', color: 'text-purple-600' },
          ].map(info => (
            <Card key={info.title} className="p-4">
              <p className={`text-sm font-bold ${info.color} mb-1`}>{info.title}</p>
              <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed">{info.body}</p>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default LMSIntegration;
