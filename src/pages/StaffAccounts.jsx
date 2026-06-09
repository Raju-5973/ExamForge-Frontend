import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Layout } from '../components/Layout';
import { Card } from '../components/Card';
import {
  Search, RefreshCw, Loader2, GraduationCap,
  Mail, CalendarDays, Building2, UserCheck
} from 'lucide-react';

const DEPT_COLORS = [
  'from-blue-500 to-indigo-600',
  'from-emerald-500 to-teal-600',
  'from-purple-500 to-pink-600',
  'from-amber-500 to-orange-600',
  'from-rose-500 to-red-600',
  'from-cyan-500 to-blue-600',
  'from-violet-500 to-purple-600',
  'from-lime-500 to-emerald-600',
];

const colorForDept = (dept) => {
  let hash = 0;
  for (let i = 0; i < dept.length; i++) hash = dept.charCodeAt(i) + ((hash << 5) - hash);
  return DEPT_COLORS[Math.abs(hash) % DEPT_COLORS.length];
};

export const StaffAccounts = () => {
  const { user, API_URL } = useAuth();
  const [staffList, setStaffList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');

  const fetchStaff = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');
      const res = await fetch(`${API_URL}/api/staff-accounts/`, {
        headers: { Authorization: `Token ${user?.token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setStaffList(data);
      } else {
        setError('Failed to load staff accounts.');
      }
    } catch {
      setError('Network error. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  }, [API_URL, user?.token]);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  const filtered = staffList.filter((s) => {
    const q = searchQuery.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q) ||
      (s.department || '').toLowerCase().includes(q)
    );
  });

  // Department breakdown stats
  const deptMap = staffList.reduce((acc, s) => {
    const d = s.department || 'Not Assigned';
    acc[d] = (acc[d] || 0) + 1;
    return acc;
  }, {});
  const deptStats = Object.entries(deptMap).sort((a, b) => b[1] - a[1]);

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header Banner */}
        <div className="relative bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 rounded-2xl p-8 text-white shadow-xl overflow-hidden">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-16 -right-16 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-1/3 w-48 h-48 bg-cyan-400/20 rounded-full blur-2xl" />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-xl">
              <div className="flex items-center space-x-2 mb-2">
                <UserCheck className="w-5 h-5 text-cyan-200" />
                <span className="text-cyan-200 text-sm font-medium uppercase tracking-wider">
                  Principal View
                </span>
              </div>
              <h2 className="text-4xl font-extrabold tracking-tight mb-2">
                Staff Accounts
              </h2>
              <p className="text-blue-100 text-lg leading-relaxed">
                All <span className="font-bold text-white">staff members</span> who have registered an account in ExamForge.
              </p>
            </div>
            <div className="flex gap-4 flex-shrink-0">
              <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 text-center min-w-[90px]">
                <p className="text-xs uppercase tracking-widest text-cyan-200 font-bold mb-1">Total Staff</p>
                <p className="text-3xl font-black">{staffList.length}</p>
                <p className="text-[10px] text-cyan-200 mt-1">REGISTERED</p>
              </div>
              <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 text-center min-w-[90px]">
                <p className="text-xs uppercase tracking-widest text-cyan-200 font-bold mb-1">Departments</p>
                <p className="text-3xl font-black">{deptStats.length}</p>
                <p className="text-[10px] text-cyan-200 mt-1">ACTIVE</p>
              </div>
            </div>
          </div>
        </div>

        {/* Department Summary Chips */}
        {deptStats.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {deptStats.map(([dept, count]) => (
              <div
                key={dept}
                className={`flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${colorForDept(dept)} text-white text-sm font-bold shadow-md`}
              >
                <Building2 className="w-3.5 h-3.5" />
                {dept}
                <span className="bg-white/20 px-1.5 py-0.5 rounded-full text-xs">{count}</span>
              </div>
            ))}
          </div>
        )}

        {/* Search + Refresh */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email or department…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
          <button
            onClick={fetchStaff}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-sm font-semibold text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
            <p className="text-gray-500 dark:text-slate-400 font-medium">Loading staff accounts…</p>
          </div>
        ) : error ? (
          <Card className="text-center py-12">
            <p className="text-red-500 font-semibold">{error}</p>
            <button
              onClick={fetchStaff}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors"
            >
              Retry
            </button>
          </Card>
        ) : filtered.length === 0 ? (
          <Card className="text-center py-16">
            <GraduationCap className="w-16 h-16 text-gray-200 dark:text-slate-700 mx-auto mb-4" />
            <p className="text-xl font-bold text-gray-400 dark:text-slate-500">
              {searchQuery ? 'No matching staff found' : 'No staff accounts yet'}
            </p>
            <p className="text-sm text-gray-400 dark:text-slate-500 mt-1">
              {searchQuery ? 'Try adjusting your search query.' : 'Staff accounts will appear here once they register.'}
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((staff, i) => (
              <div
                key={staff.id}
                className="group relative bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-200 overflow-hidden"
              >
                {/* Top accent bar */}
                <div className={`h-1.5 bg-gradient-to-r ${colorForDept(staff.department || 'Not Assigned')}`} />

                <div className="p-5">
                  <div className="flex items-start gap-4 mb-4">
                    {/* Avatar */}
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorForDept(staff.department || 'Not Assigned')} flex items-center justify-center text-white font-black text-lg flex-shrink-0 shadow-md`}>
                      {staff.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-black text-gray-900 dark:text-white truncate">{staff.name}</p>
                      <p className="text-xs text-gray-400 dark:text-slate-400 truncate">@{staff.username}</p>
                    </div>
                    {/* Rank badge */}
                    <span className="text-xs font-bold text-blue-500 bg-blue-50 dark:bg-blue-500/15 px-2 py-0.5 rounded-full flex-shrink-0">
                      #{i + 1}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-slate-400">
                      <Mail className="w-3.5 h-3.5 flex-shrink-0 text-blue-400" />
                      <span className="truncate">{staff.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-slate-400">
                      <Building2 className="w-3.5 h-3.5 flex-shrink-0 text-emerald-400" />
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">{staff.department}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-slate-400">
                      <CalendarDays className="w-3.5 h-3.5 flex-shrink-0 text-purple-400" />
                      <span>Joined {staff.date_joined}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer count */}
        {!isLoading && !error && filtered.length > 0 && (
          <p className="text-center text-xs text-gray-400 dark:text-slate-500">
            Showing <span className="font-bold text-gray-600 dark:text-slate-300">{filtered.length}</span> of{' '}
            <span className="font-bold text-gray-600 dark:text-slate-300">{staffList.length}</span> staff members
          </p>
        )}
      </div>
    </Layout>
  );
};
