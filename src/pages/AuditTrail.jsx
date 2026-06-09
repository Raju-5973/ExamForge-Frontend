import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { Card } from '../components/Card';
import {
  Shield, Search, Filter, Download, RefreshCw, Loader2,
  FileText, User, CheckCircle, XCircle, Clock, AlertTriangle,
  BookOpen, Layers, ChevronDown
} from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const ACTION_COLORS = {
  created:  { bg: 'bg-green-100 dark:bg-green-500/20',  text: 'text-green-700 dark:text-green-300',  icon: CheckCircle },
  updated:  { bg: 'bg-blue-100 dark:bg-blue-500/20',    text: 'text-blue-700 dark:text-blue-300',    icon: FileText },
  deleted:  { bg: 'bg-red-100 dark:bg-red-500/20',      text: 'text-red-700 dark:text-red-300',      icon: XCircle },
  approved: { bg: 'bg-purple-100 dark:bg-purple-500/20',text: 'text-purple-700 dark:text-purple-300',icon: CheckCircle },
  rejected: { bg: 'bg-orange-100 dark:bg-orange-500/20',text: 'text-orange-700 dark:text-orange-300',icon: XCircle },
  generated:{ bg: 'bg-teal-100 dark:bg-teal-500/20',   text: 'text-teal-700 dark:text-teal-300',   icon: Layers },
  login:    { bg: 'bg-gray-100 dark:bg-gray-700',       text: 'text-gray-700 dark:text-gray-300',   icon: User },
};

const MOCK_LOGS = [
  { id: 1, user: 'Dr. Raju K', role: 'principal', action: 'approved', resource: 'Question Paper — CS301', timestamp: '2026-06-03T14:32:00Z', ip: '192.168.1.5' },
  { id: 2, user: 'Prof. Sharma', role: 'staff', action: 'created', resource: 'Question: "Explain Binary Search Tree"', timestamp: '2026-06-03T13:15:00Z', ip: '192.168.1.12' },
  { id: 3, user: 'Prof. Sharma', role: 'staff', action: 'generated', resource: 'Blueprint — Mid-Sem CS301', timestamp: '2026-06-03T12:55:00Z', ip: '192.168.1.12' },
  { id: 4, user: 'Dr. Raju K', role: 'principal', action: 'rejected', resource: 'Question Paper — Math201', timestamp: '2026-06-03T11:40:00Z', ip: '192.168.1.5' },
  { id: 5, user: 'Prof. Mehta', role: 'staff', action: 'deleted', resource: 'Question: "What is a pointer?"', timestamp: '2026-06-03T10:22:00Z', ip: '192.168.1.18' },
  { id: 6, user: 'Dr. Raju K', role: 'principal', action: 'login', resource: 'System Login', timestamp: '2026-06-03T09:05:00Z', ip: '192.168.1.5' },
  { id: 7, user: 'Prof. Mehta', role: 'staff', action: 'updated', resource: 'Question: "Explain OOPS concepts"', timestamp: '2026-06-02T17:30:00Z', ip: '192.168.1.18' },
  { id: 8, user: 'Prof. Sharma', role: 'staff', action: 'created', resource: 'Question: "Define Recursion"', timestamp: '2026-06-02T16:10:00Z', ip: '192.168.1.12' },
  { id: 9, user: 'Dr. Raju K', role: 'principal', action: 'approved', resource: 'Question Paper — Physics101', timestamp: '2026-06-02T15:45:00Z', ip: '192.168.1.5' },
  { id: 10, user: 'Prof. Mehta', role: 'staff', action: 'generated', resource: 'AI Questions — Data Structures (5 Qs)', timestamp: '2026-06-02T14:20:00Z', ip: '192.168.1.18' },
];

const STATS = [
  { label: 'Total Events', value: 248, icon: Shield, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-500/10' },
  { label: 'Papers Approved', value: 32, icon: CheckCircle, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-500/10' },
  { label: 'Questions Added', value: 156, icon: BookOpen, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-500/10' },
  { label: 'Rejected Papers', value: 8, icon: XCircle, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-500/10' },
];

export default function AuditTrail() {
  const [logs, setLogs] = useState(MOCK_LOGS);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAction, setFilterAction] = useState('all');
  const [filterRole, setFilterRole] = useState('all');
  const [expandedLog, setExpandedLog] = useState(null);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/api/papers/audit-logs/');
      if (response.data && response.data.length > 0) {
        setLogs(response.data);
      }
    } catch {
      // Fall back to mock data if backend endpoint not yet ready
    } finally {
      setIsLoading(false);
    }
  };

  const exportCSV = () => {
    const header = 'ID,User,Role,Action,Resource,Timestamp,IP\n';
    const rows = filteredLogs.map(l =>
      `${l.id},"${l.user}","${l.role}","${l.action}","${l.resource}","${l.timestamp}","${l.ip}"`
    ).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit_trail_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success('Audit log exported as CSV!');
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch =
      log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.resource.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAction = filterAction === 'all' || log.action === filterAction;
    const matchesRole = filterRole === 'all' || log.role === filterRole;
    return matchesSearch && matchesAction && matchesRole;
  });

  const formatTimestamp = (ts) => {
    const date = new Date(ts);
    return date.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Shield className="w-7 h-7 text-blue-600 dark:text-blue-400" />
              Audit Trail
            </h1>
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
              Full activity log across all users, roles, and modules.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={fetchLogs}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={exportCSV}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {STATS.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label} className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${stat.bg}`}>
                    <Icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                    <p className="text-xs text-gray-500 dark:text-slate-400">{stat.label}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Filters */}
        <Card className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by user, action or resource..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <select
                  value={filterAction}
                  onChange={(e) => setFilterAction(e.target.value)}
                  className="pl-9 pr-8 py-2 text-sm rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                >
                  <option value="all">All Actions</option>
                  <option value="created">Created</option>
                  <option value="updated">Updated</option>
                  <option value="deleted">Deleted</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="generated">Generated</option>
                  <option value="login">Login</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="pl-9 pr-8 py-2 text-sm rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                >
                  <option value="all">All Roles</option>
                  <option value="principal">Principal</option>
                  <option value="staff">Staff</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>
        </Card>

        {/* Log Table */}
        <Card className="overflow-hidden">
          <div className="p-4 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900 dark:text-white">Activity Log</h2>
            <span className="text-xs text-gray-500 dark:text-slate-400 bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded-full">
              {filteredLogs.length} events
            </span>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-16 text-gray-500 dark:text-slate-400">
              <AlertTriangle className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p className="font-medium">No logs match your filters</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-slate-700">
              {filteredLogs.map((log) => {
                const style = ACTION_COLORS[log.action] || ACTION_COLORS.login;
                const Icon = style.icon;
                const isExpanded = expandedLog === log.id;

                return (
                  <div
                    key={log.id}
                    className="p-4 hover:bg-gray-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                    onClick={() => setExpandedLog(isExpanded ? null : log.id)}
                  >
                    <div className="flex items-center gap-4">
                      {/* Action Badge */}
                      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${style.bg} ${style.text}`}>
                        <Icon className="w-3.5 h-3.5" />
                        {log.action.charAt(0).toUpperCase() + log.action.slice(1)}
                      </div>

                      {/* Main Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {log.resource}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                          by <span className="font-medium text-gray-700 dark:text-slate-300">{log.user}</span>
                          <span className={`ml-2 px-1.5 py-0.5 rounded text-xs font-medium ${
                            log.role === 'principal'
                              ? 'bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300'
                              : 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300'
                          }`}>
                            {log.role}
                          </span>
                        </p>
                      </div>

                      {/* Timestamp */}
                      <div className="flex items-center gap-1 text-xs text-gray-400 dark:text-slate-500 flex-shrink-0">
                        <Clock className="w-3.5 h-3.5" />
                        {formatTimestamp(log.timestamp)}
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className="mt-3 ml-4 pl-4 border-l-2 border-blue-200 dark:border-blue-500/40 space-y-1 text-xs text-gray-600 dark:text-slate-400">
                        <p><span className="font-semibold text-gray-700 dark:text-slate-300">Event ID:</span> #{log.id}</p>
                        <p><span className="font-semibold text-gray-700 dark:text-slate-300">IP Address:</span> {log.ip}</p>
                        <p><span className="font-semibold text-gray-700 dark:text-slate-300">Full Timestamp:</span> {new Date(log.timestamp).toLocaleString()}</p>
                        <p><span className="font-semibold text-gray-700 dark:text-slate-300">Resource:</span> {log.resource}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </Layout>
  );
}
