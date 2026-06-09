import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LogOut, 
  BookOpen, 
  Sun, 
  Moon, 
  LayoutDashboard, 
  FileText, 
  Settings,
  Menu,
  X,
  ChevronRight,
  Users,
  Bot,
  Bell,
  ClipboardCheck,
  BarChart3,
  Target,
  Sparkles,
  Lock,
  Download,
  Palette,
  Globe,
  ClipboardList
} from 'lucide-react';
import api from '../utils/api';

export const Layout = ({ children, fullWidth = false }) => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  React.useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000); // Check every 30s
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/api/notifications/');
      setNotifications(response.data);
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.post(`/api/notifications/${id}/mark_read/`);
      fetchNotifications();
    } catch (error) {
      console.error('Failed to mark notification as read', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { label: 'Analytics', icon: BarChart3, path: '/analytics', role: 'principal' },
    { label: 'Question Bank', icon: BookOpen, path: '/question-bank', role: 'staff' },
    { label: 'OBE Mapping', icon: Target, path: '/obe-mapping' },
    { label: 'AI Generator', icon: Bot, path: '/ai-generator', role: 'staff' },
    { label: 'Blueprints', icon: FileText, path: '/blueprints' },
    { label: 'Generated Papers', icon: FileText, path: '/generated-papers' },
    { label: 'Approvals', icon: ClipboardCheck, path: '/approvals' },
    { label: 'AI Recommendations', icon: Sparkles, path: '/recommendations', role: 'staff' },
    { label: 'Secure Papers', icon: Lock, path: '/secure-papers', role: 'principal' },
    { label: 'Export Options', icon: Download, path: '/export-formats' },
    { label: 'Templates', icon: Palette, path: '/templates', role: 'principal' },
    { label: 'LMS Sync', icon: Globe, path: '/lms-integration', role: 'principal' },
    { label: 'Audit Trail', icon: ClipboardList, path: '/audit-trail', role: 'principal' },
    { label: 'Staff Accounts', icon: Users, path: '/staff-accounts', role: 'principal' },
    { label: 'Settings', icon: Settings, path: '/settings' },
  ];

  const filteredNavItems = navItems.filter(item => !item.role || item.role === user?.role);

  return (
    <div className="h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-200 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 shadow-md border-b border-gray-200 dark:border-slate-700 sticky top-0 z-50">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-700 md:hidden"
              >
                {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
              <div className="bg-blue-600 p-2 rounded-lg cursor-pointer" onClick={() => navigate('/dashboard')}>
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  ExamForge
                </h1>
                {user && (
                  <p className="text-xs text-gray-600 dark:text-slate-300">
                    {user.role === 'principal' ? 'Principal' : 'Staff'} Dashboard
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg text-gray-500 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                aria-label="Toggle theme"
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 rounded-lg text-gray-500 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors relative"
                >
                  <Bell className="w-5 h-5" />
                  {notifications.filter(n => !n.is_read).length > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
                  )}
                </button>
                
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-gray-100 dark:border-slate-700 overflow-hidden z-50">
                    <div className="p-3 border-b border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50">
                      <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-gray-500 dark:text-slate-400 text-sm">
                          No notifications
                        </div>
                      ) : (
                        notifications.map((notif) => (
                          <div 
                            key={notif.id}
                            className={`p-3 border-b border-gray-100 dark:border-slate-700 text-sm hover:bg-gray-50 dark:hover:bg-slate-700/50 cursor-pointer ${notif.is_read ? 'opacity-60' : ''}`}
                            onClick={() => {
                              markAsRead(notif.id);
                              if (notif.message.includes('Workflow')) {
                                navigate('/approvals');
                                setShowNotifications(false);
                              }
                            }}
                          >
                            <p className="text-gray-900 dark:text-white font-medium">{notif.title}</p>
                            <p className="text-gray-600 dark:text-slate-300 text-xs mt-1">{notif.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-blue-50 dark:bg-blue-500/20 px-3 py-1 rounded-full border border-blue-200 dark:border-blue-400/40">
                <span className="text-xs font-semibold text-blue-700 dark:text-blue-300 uppercase tracking-wider">
                  {user?.role}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside 
          className={`
            fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700 
            transform transition-transform duration-300 ease-in-out mt-16 md:relative md:translate-x-0 md:mt-0
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          `}
        >
          <div className="h-full flex flex-col">
            {/* Scrollable Navigation Area */}
            <div className="flex-1 overflow-y-auto py-6 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700">
              <nav className="px-4 space-y-2">
                {filteredNavItems.map((item, index) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <button
                      key={index}
                      onClick={() => item.path !== '#' && navigate(item.path)}
                      className={`
                        w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all group
                        ${isActive 
                          ? 'bg-blue-100 dark:bg-blue-500/25 text-blue-700 dark:text-blue-300 font-semibold' 
                          : 'text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700'}
                      `}
                    >
                      <div className="flex items-center">
                        <Icon className={`w-5 h-5 mr-3 transition-colors ${isActive ? 'text-blue-600 dark:text-blue-300' : 'text-gray-400 dark:text-slate-400 group-hover:text-gray-700 dark:group-hover:text-white'}`} />
                        {item.label}
                      </div>
                      {isActive && <ChevronRight className="w-4 h-4" />}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* User & Logout Section - Always visible at the bottom */}
            {user && (
              <div className="mt-auto border-t border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/60 p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold flex-shrink-0 shadow-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                      {user.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-slate-400 truncate">
                      {user.email}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center px-4 py-2 text-sm font-semibold text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 rounded-lg transition-colors group"
                >
                  <LogOut className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                  Logout
                </button>
              </div>
            )}
          </div>


        </aside>


        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-slate-900 p-4 sm:p-6 lg:p-8">
          <div className={fullWidth ? 'w-full h-full' : 'max-w-7xl mx-auto'}>
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};
