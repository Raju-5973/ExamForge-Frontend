import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Layout } from '../components/Layout';
import { Card } from '../components/Card';
import { CheckCircle, XCircle, Clock, Send, FileText, Loader2, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_CONFIG = {
  draft:               { label: 'Draft',                   color: 'bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-slate-400',   icon: FileText },
  pending_hod:         { label: 'Pending HOD',             color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', icon: Clock },
  pending_controller:  { label: 'Pending Controller',      color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',   icon: Clock },
  approved:            { label: 'Approved ✅',              color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: CheckCircle },
  rejected:            { label: 'Rejected ❌',              color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',       icon: XCircle },
};

export const ApprovalWorkflowPage = () => {
  const { user, API_URL } = useAuth();
  const [approvals, setApprovals] = useState([]);
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [remarksModal, setRemarksModal] = useState(null); // { workflowId, action }
  const [remarks, setRemarks] = useState('');
  const [isActing, setIsActing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [approvalsRes, papersRes] = await Promise.all([
        fetch(`${API_URL}/api/approvals/`, { headers: { 'Authorization': `Token ${user?.token}` } }),
        fetch(`${API_URL}/api/papers/`, { headers: { 'Authorization': `Token ${user?.token}` } }),
      ]);
      if (approvalsRes.ok) {
        const aData = await approvalsRes.json();
        setApprovals(Array.isArray(aData) ? aData : (aData.results || []));
      }
      if (papersRes.ok) {
        const pData = await papersRes.json();
        setPapers(Array.isArray(pData) ? pData : (pData.results || []));
      }
    } catch { toast.error('Failed to load approvals'); }
    finally { setLoading(false); }
  }, [API_URL, user?.token]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Papers not yet submitted or previously rejected (can be resubmitted)
  const unsubmittedPapers = papers.filter(p => {
    const approval = approvals.find(a => String(a.paper) === String(p.id));
    // Show paper if: no approval record exists, OR the approval was rejected (allow resubmit)
    return !approval || approval.status === 'rejected';
  });

  const submitForApproval = async (paperId) => {
    try {
      setIsSubmitting(true);
      const res = await fetch(`${API_URL}/api/approvals/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Token ${user?.token}` },
        body: JSON.stringify({ paper: paperId }),
      });
      if (res.ok) { toast.success('Paper submitted for HOD approval!'); loadData(); }
      else { const d = await res.json(); toast.error(d.error || 'Failed to submit'); }
    } catch { toast.error('Network error'); }
    finally { setIsSubmitting(false); }
  };

  const handleAction = async () => {
    if (!remarksModal) return;
    const { workflowId, action } = remarksModal;
    try {
      setIsActing(true);
      const res = await fetch(`${API_URL}/api/approvals/${workflowId}/${action}/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Token ${user?.token}` },
        body: JSON.stringify({ remarks }),
      });
      if (res.ok) {
        toast.success(action === 'approve' ? '✅ Paper approved successfully!' : '❌ Paper rejected.');
        setRemarksModal(null);
        setRemarks('');
        loadData();
      } else { toast.error('Action failed'); }
    } catch { toast.error('Network error'); }
    finally { setIsActing(false); }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-indigo-700 via-purple-700 to-pink-700 rounded-2xl p-7 text-white shadow-xl overflow-hidden">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-16 -right-16 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          </div>
          <div className="relative z-10">
            <h2 className="text-3xl font-extrabold tracking-tight">Approval Workflow</h2>
            <p className="text-indigo-100 mt-1 text-sm">Multi-stage review: Staff → HOD → Exam Controller → Approved</p>
          </div>
        </div>

        {/* Submit Unreviewed Papers */}
        {unsubmittedPapers.length > 0 && (
          <Card className="border border-blue-200 dark:border-blue-800/40">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Send className="w-5 h-5 text-blue-600" /> Papers Ready to Submit
            </h3>
            <div className="space-y-3">
              {unsubmittedPapers.map(p => (
                <div key={p.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{p.subject}</p>
                    <p className="text-xs text-gray-500">{p.questions.length} questions • {new Date(p.created_at).toLocaleDateString()}</p>
                  </div>
                  <button
                    onClick={() => submitForApproval(p.id)}
                    disabled={isSubmitting}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-all disabled:opacity-50"
                  >
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    Submit for Approval
                  </button>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Approval Queue */}
        <Card noPadding className="overflow-hidden border border-gray-200 dark:border-slate-700">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/60 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-purple-600" />
            <h3 className="font-bold text-gray-900 dark:text-white">Approval Queue</h3>
            <span className="ml-auto text-xs font-bold bg-purple-100 text-purple-700 px-2 py-1 rounded-full">{approvals.length} items</span>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>
          ) : approvals.length === 0 ? (
            <div className="py-16 text-center text-gray-400">No approval requests yet.</div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-slate-700/60">
              {approvals.map(a => {
                const cfg = STATUS_CONFIG[a.status] || STATUS_CONFIG.draft;
                const StatusIcon = cfg.icon;
                return (
                  <div key={a.id} className="p-6 flex flex-col md:flex-row md:items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <p className="font-bold text-gray-900 dark:text-white">{a.paper_subject}</p>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${cfg.color}`}>
                          <StatusIcon className="w-3 h-3" /> {cfg.label}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-slate-400">
                        Submitted by <strong>{a.submitted_by_name || 'Unknown'}</strong> · {new Date(a.submitted_at).toLocaleDateString()}
                      </p>
                      {a.hod_remarks && (
                        <p className="text-xs mt-1 text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-md">
                          HOD: {a.hod_remarks}
                        </p>
                      )}
                      {a.controller_remarks && (
                        <p className="text-xs mt-1 text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-md">
                          Controller: {a.controller_remarks}
                        </p>
                      )}
                    </div>

                    {/* Action buttons for principal */}
                    {user?.role === 'principal' && (a.status === 'pending_hod' || a.status === 'pending_controller') && (
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={() => setRemarksModal({ workflowId: a.id, action: 'approve' })}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-green-500 text-white text-sm font-bold hover:bg-green-600 transition-all shadow-sm"
                        >
                          <CheckCircle className="w-4 h-4" /> Approve
                        </button>
                        <button
                          onClick={() => setRemarksModal({ workflowId: a.id, action: 'reject' })}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition-all shadow-sm"
                        >
                          <XCircle className="w-4 h-4" /> Reject
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Remarks Modal */}
        {remarksModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-purple-500" />
                {remarksModal.action === 'approve' ? 'Approve Paper' : 'Reject Paper'}
              </h3>
              <p className="text-sm text-gray-500 mb-4">Add optional remarks for the submitter.</p>
              <textarea
                value={remarks}
                onChange={e => setRemarks(e.target.value)}
                placeholder="Enter your remarks (optional)..."
                rows={4}
                className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:border-purple-500 bg-gray-50 dark:bg-slate-900 border-gray-200 dark:border-slate-600 text-gray-900 dark:text-white resize-none mb-4"
              />
              <div className="flex gap-3 justify-end">
                <button onClick={() => { setRemarksModal(null); setRemarks(''); }} className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-slate-700 transition-all">Cancel</button>
                <button
                  onClick={handleAction}
                  disabled={isActing}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all shadow-md disabled:opacity-60 ${remarksModal.action === 'approve' ? 'bg-green-500 hover:bg-green-600 shadow-green-500/30' : 'bg-red-500 hover:bg-red-600 shadow-red-500/30'}`}
                >
                  {isActing ? <Loader2 className="w-4 h-4 animate-spin" /> : (remarksModal.action === 'approve' ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />)}
                  {isActing ? 'Processing...' : (remarksModal.action === 'approve' ? 'Confirm Approve' : 'Confirm Reject')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ApprovalWorkflowPage;
