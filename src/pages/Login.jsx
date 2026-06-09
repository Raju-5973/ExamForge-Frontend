import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Select } from '../components/Select';
import {
  BookOpen, Zap, Moon, Sun, ArrowLeft,
  CheckCircle2, X, Mail, ShieldCheck,
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

/* ═══════════════════════════ Toast System ═══════════════════════════ */
const ToastContainer = ({ toasts, removeToast }) => (
  <div style={{
    position: 'fixed', top: '20px', right: '20px', zIndex: 9999,
    display: 'flex', flexDirection: 'column', gap: '10px', pointerEvents: 'none',
  }}>
    {toasts.map((t) => (
      <div key={t.id} style={{
        pointerEvents: 'all',
        display: 'flex', alignItems: 'center', gap: '10px',
        padding: '14px 18px', borderRadius: '14px',
        minWidth: '300px', maxWidth: '380px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
        backdropFilter: 'blur(12px)',
        border: `1.5px solid ${t.type === 'success' ? 'rgba(34,197,94,0.4)' : t.type === 'error' ? 'rgba(239,68,68,0.4)' : 'rgba(59,130,246,0.4)'}`,
        background: t.type === 'success'
          ? 'linear-gradient(135deg,rgba(20,83,45,0.97),rgba(21,128,61,0.93))'
          : t.type === 'error'
          ? 'linear-gradient(135deg,rgba(127,29,29,0.97),rgba(185,28,28,0.93))'
          : 'linear-gradient(135deg,rgba(30,58,138,0.97),rgba(37,99,235,0.93))',
        animation: 'slideInRight 0.35s cubic-bezier(0.34,1.56,0.64,1)',
        color: '#fff',
      }}>
        <span style={{ fontSize: '20px', flexShrink: 0 }}>
          {t.type === 'success' ? '✅' : t.type === 'error' ? '❌' : 'ℹ️'}
        </span>
        <p style={{ margin: 0, fontSize: '13.5px', fontWeight: 500, flex: 1, lineHeight: 1.4 }}>
          {t.message}
        </p>
        <button onClick={() => removeToast(t.id)} style={{
          background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)',
          cursor: 'pointer', padding: '2px', flexShrink: 0,
        }}>
          <X size={14} />
        </button>
      </div>
    ))}
  </div>
);

/* ═══════════════════════════ OTP Modal ═══════════════════════════ */
const OTPModal = ({ email, onSuccess, onClose, API_URL, addToast }) => {
  const [otp, setOtp]           = useState(['', '', '', '', '', '']);
  const [loading, setLoading]   = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const inputRefs = React.useRef(Array.from({ length: 6 }, () => React.createRef()));

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { inputRefs.current[0].current?.focus(); }, []);

  useEffect(() => {
    if (resendCooldown > 0) {
      const t = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [resendCooldown]);

  const handleChange = (idx, val) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp];
    next[idx] = val;
    setOtp(next);
    if (val && idx < 5) inputRefs.current[idx + 1].current?.focus();
  };

  const handleKeyDown = (idx, e) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0)
      inputRefs.current[idx - 1].current?.focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const next = [...otp];
    paste.split('').forEach((ch, i) => { next[i] = ch; });
    setOtp(next);
    inputRefs.current[Math.min(paste.length, 5)].current?.focus();
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length < 6) { addToast('Please enter all 6 digits', 'error'); return; }
    setLoading(true);
    try {
      const res  = await fetch(`${API_URL}/api/verify-otp/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: code }),
      });
      const data = await res.json();
      if (data.success) {
        addToast('✅ Email verified successfully!', 'success');
        onSuccess();
      } else {
        addToast(data.message || 'Invalid OTP. Please try again.', 'error');
      }
    } catch {
      addToast('Network error. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    try {
      const res  = await fetch(`${API_URL}/api/send-otp/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.success) {
        addToast(`✉️ New OTP sent to ${email}`, 'success');
        setResendCooldown(60);
        setOtp(['', '', '', '', '', '']);
        setTimeout(() => inputRefs.current[0].current?.focus(), 50);
      } else {
        addToast(data.message || 'Failed to resend OTP', 'error');
      }
    } catch {
      addToast('Network error. Please try again.', 'error');
    }
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)',
        animation: 'fadeIn 0.2s ease',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: 'linear-gradient(145deg,#1e293b,#0f172a)',
        borderRadius: '24px', padding: '40px 32px',
        width: '100%', maxWidth: '420px',
        boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
        border: '1px solid rgba(99,102,241,0.3)',
        animation: 'slideUp 0.3s cubic-bezier(0.34,1.56,0.64,1)',
      }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: 68, height: 68, borderRadius: '50%', margin: '0 auto 18px',
            background: 'linear-gradient(135deg,#6366f1,#818cf8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(99,102,241,0.45)',
          }}>
            <Mail size={30} color="#fff" />
          </div>
          <h2 style={{ color: '#f1f5f9', fontSize: '22px', fontWeight: 700, margin: '0 0 8px' }}>
            Check your inbox
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '13.5px', margin: 0, lineHeight: 1.6 }}>
            We sent a 6-digit verification code to<br />
            <strong style={{ color: '#818cf8' }}>{email}</strong>
          </p>
        </div>

        {/* OTP Boxes */}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '28px' }}>
          {otp.map((digit, idx) => (
            <input
              key={idx}
              ref={inputRefs.current[idx]}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              onPaste={handlePaste}
              style={{
                width: '50px', height: '58px',
                textAlign: 'center', fontSize: '24px', fontWeight: 700,
                borderRadius: '12px',
                border: `2px solid ${digit ? '#6366f1' : 'rgba(99,102,241,0.25)'}`,
                background: digit ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.04)',
                color: '#f1f5f9', outline: 'none',
                transition: 'all 0.2s', caretColor: '#818cf8',
              }}
            />
          ))}
        </div>

        {/* Verify Button */}
        <button
          onClick={handleVerify}
          disabled={loading}
          style={{
            width: '100%', padding: '14px', borderRadius: '12px',
            border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
            background: loading
              ? 'rgba(99,102,241,0.4)'
              : 'linear-gradient(135deg,#6366f1,#818cf8)',
            color: '#fff', fontSize: '15px', fontWeight: 600,
            boxShadow: '0 4px 20px rgba(99,102,241,0.4)',
            transition: 'all 0.2s', marginBottom: '18px',
          }}
        >
          {loading ? 'Verifying…' : 'Verify OTP'}
        </button>

        {/* Resend + Cancel */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            onClick={handleResend}
            disabled={resendCooldown > 0}
            style={{
              background: 'none', border: 'none',
              cursor: resendCooldown > 0 ? 'not-allowed' : 'pointer',
              color: resendCooldown > 0 ? '#475569' : '#818cf8',
              fontSize: '13px', fontWeight: 500,
            }}
          >
            {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP'}
          </button>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', fontSize: '13px' }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════ Main Login Page ═══════════════════════════ */
export const Login = () => {
  const [isLogin, setIsLogin]             = useState(true);
  const [email, setEmail]                 = useState('');
  const [username, setUsername]           = useState('');
  const [password, setPassword]           = useState('');
  const [role, setRole]                   = useState('staff');
  const [error, setError]                 = useState('');
  const [loading, setLoading]             = useState(false);
  const [accountLocked, setAccountLocked] = useState(false);
  const [principalExists, setPrincipalExists] = useState(false);
  const [department, setDepartment]       = useState('');
  const [emailVerified, setEmailVerified] = useState(false);
  const [otpSending, setOtpSending]       = useState(false);
  const [showOTPModal, setShowOTPModal]   = useState(false);
  const [toasts, setToasts]               = useState([]);

  const { login, register, API_URL } = useAuth();
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();

  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 5000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Reset verification whenever email changes
  useEffect(() => { setEmailVerified(false); }, [email]);

  useEffect(() => {
    const checkPrincipal = async () => {
      try {
        const res = await fetch(`${API_URL}/api/check-principal/`);
        if (res.ok) { const d = await res.json(); setPrincipalExists(d.exists); }
      } catch (err) { console.error(err); }
    };
    if (!isLogin) checkPrincipal();
  }, [isLogin, API_URL]);

  /* ── Send OTP ── */
  const handleSendOTP = async () => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      addToast('Please enter a valid email address first.', 'error');
      return;
    }
    setOtpSending(true);
    try {
      const res  = await fetch(`${API_URL}/api/send-otp/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.success) {
        addToast(`✉️ OTP sent to ${email} — check your inbox!`, 'success');
        setShowOTPModal(true);
      } else {
        addToast(data.message || 'Failed to send OTP. Try again.', 'error');
      }
    } catch {
      addToast('Network error. Is the backend running?', 'error');
    } finally {
      setOtpSending(false);
    }
  };

  /* ── Submit form ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setAccountLocked(false); setLoading(true);
    try {
      if (isLogin) {
        const res = await login(email, password);
        if (res.success) { navigate('/dashboard'); }
        else { if (res.locked) { setAccountLocked(true); } setError(res.message); }
      } else {
        if (!username.trim())                     { setError('Username is required');    setLoading(false); return; }
        if (!department && role !== 'principal')  { setError('Department is required');  setLoading(false); return; }
        if (!emailVerified)                       { addToast('Please verify your email before signing up.', 'error'); setLoading(false); return; }
        const res = await register(email, password, username.trim(), role, username.trim(), department);
        if (res.success) { navigate('/dashboard'); } else { setError(res.message); }
      }
    } catch { setError('An error occurred. Please try again.'); }
    finally  { setLoading(false); }
  };

  const roleOptions = [
    { value: 'staff',     label: 'Staff' },
    { value: 'principal', label: 'Principal', disabled: principalExists },
  ];

  const departmentOptions = [
    'Physics','Chemistry','Mathematics','Computer Science',
    'Electronics','Electrical','Mechanical','Civil',
  ].map((d) => ({ value: d, label: d }));

  return (
    <>
      {/* Global Animations */}
      <style>{`
        @keyframes slideInRight {
          from { opacity:0; transform:translateX(60px) scale(0.9); }
          to   { opacity:1; transform:translateX(0)   scale(1);   }
        }
        @keyframes fadeIn  { from{opacity:0;} to{opacity:1;} }
        @keyframes slideUp {
          from { opacity:0; transform:translateY(40px) scale(0.95); }
          to   { opacity:1; transform:translateY(0)    scale(1);    }
        }
        @keyframes popIn {
          0%  { transform:scale(0);   opacity:0; }
          60% { transform:scale(1.2); }
          100%{ transform:scale(1);   opacity:1; }
        }
        .verify-btn:hover:not(:disabled){
          transform:translateY(-1px);
          box-shadow:0 6px 20px rgba(99,102,241,0.5)!important;
        }
      `}</style>

      {/* Toasts */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* OTP Modal */}
      {showOTPModal && (
        <OTPModal
          email={email}
          API_URL={API_URL}
          addToast={addToast}
          onSuccess={() => { setEmailVerified(true); setShowOTPModal(false); }}
          onClose={() => setShowOTPModal(false)}
        />
      )}

      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-4 py-8 transition-colors duration-500">

        {/* Nav */}
        <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-10">
          <button
            onClick={() => navigate('/')}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-white/40 dark:bg-gray-800/40 backdrop-blur-md border border-white/50 dark:border-gray-700/50 shadow-sm text-gray-700 dark:text-gray-300 hover:scale-105 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-bold">Back to Home</span>
          </button>
          <button
            onClick={toggleTheme}
            className="p-3 rounded-xl bg-white/40 dark:bg-gray-800/40 backdrop-blur-md border border-white/50 dark:border-gray-700/50 shadow-sm text-gray-700 dark:text-gray-300 hover:scale-105 transition-all"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>

        <div className="w-full max-w-4xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 bg-transparent rounded-3xl overflow-hidden shadow-2xl dark:shadow-gray-900/50">

            {/* Left panel */}
            <div className="hidden lg:block relative p-12 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 dark:from-blue-900 dark:via-indigo-900 dark:to-purple-900 text-white overflow-hidden">
              <div className="absolute inset-0 overflow-hidden opacity-20 pointer-events-none">
                <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-white blur-3xl opacity-30" />
                <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-blue-300 blur-3xl opacity-20" />
              </div>
              <div className="relative h-full flex flex-col justify-between z-10">
                <div>
                  <h2 className="text-4xl font-extrabold mb-6 tracking-tight leading-tight">Welcome to<br />ExamForge</h2>
                  <p className="text-blue-100 mb-10 text-lg leading-relaxed max-w-md">
                    A modern platform for managing questions and generating customized exam papers
                  </p>
                  <div className="space-y-4">
                    {[
                      { Icon: BookOpen, title: 'Question Bank Management', desc: 'Add, edit, and organize questions with subjects, difficulty levels, and marks' },
                      { Icon: Zap,      title: 'Smart Paper Generation',    desc: 'Generate customized question papers with flexible marks distribution' },
                    ].map(({ Icon, title, desc }) => (
                      <div key={title} className="flex items-start space-x-3">
                        <div className="bg-white/20 rounded-lg p-2 mt-1"><Icon className="w-5 h-5" /></div>
                        <div>
                          <h3 className="font-semibold mb-1">{title}</h3>
                          <p className="text-sm text-blue-100">{desc}</p>
                        </div>
                      </div>
                    ))}
                    <div className="flex items-start space-x-3">
                      <div className="bg-white/20 rounded-lg p-2 mt-1">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">Role-Based Access</h3>
                        <p className="text-sm text-blue-100">Separate interfaces for Staff and Principal users</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-12 pt-8 border-t border-white/20">
                  <p className="text-sm font-medium text-blue-100 flex items-center space-x-4">
                    <span>✨ Fully responsive</span><span>•</span><span>📄 PDF export</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Right panel — form */}
            <div className="w-full bg-white dark:bg-gray-800 p-6 sm:p-10 transition-colors duration-300 flex flex-col justify-center">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg mb-4 transform rotate-3 hover:rotate-0 transition-all duration-300">
                  <BookOpen className="w-7 h-7 text-white" />
                </div>
                <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2">ExamForge</h1>
                <p className="text-gray-500 dark:text-gray-400 font-medium text-sm">
                  {isLogin ? 'Sign in to your account' : 'Create a new account'}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">

                {/* Username (signup only) */}
                {!isLogin && (
                  <Input label="Username" type="text" placeholder="Choose a username"
                    value={username} onChange={(e) => setUsername(e.target.value)} required />
                )}

                {/* ── Email + Verify button ── */}
                <div className="w-full">
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">
                    Email
                  </label>
                  <div className="flex items-center gap-2">
                    {/* Input */}
                    <div className="relative flex-1">
                      <input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full px-4 py-2 border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600 text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-400"
                        style={{
                          paddingRight: emailVerified ? '38px' : '14px',
                          borderColor: emailVerified ? '#22c55e' : undefined,
                          boxShadow: emailVerified ? '0 0 0 2px rgba(34,197,94,0.2)' : undefined,
                        }}
                      />
                      {/* ✅ green tick inside input */}
                      {emailVerified && (
                        <div style={{
                          position: 'absolute', right: '10px', top: '50%',
                          transform: 'translateY(-50%)',
                          animation: 'popIn 0.4s cubic-bezier(0.34,1.56,0.64,1)',
                        }}>
                          <CheckCircle2 size={20} color="#22c55e" strokeWidth={2.5} />
                        </div>
                      )}
                    </div>

                    {/* Verify button — signup only, before verification */}
                    {!isLogin && !emailVerified && (
                      <button
                        type="button"
                        onClick={handleSendOTP}
                        disabled={otpSending || !email}
                        className="verify-btn"
                        style={{
                          flexShrink: 0, display: 'flex', alignItems: 'center', gap: '6px',
                          padding: '8px 14px', borderRadius: '10px', border: 'none',
                          cursor: otpSending || !email ? 'not-allowed' : 'pointer',
                          background: otpSending || !email
                            ? 'rgba(99,102,241,0.35)'
                            : 'linear-gradient(135deg,#6366f1,#818cf8)',
                          color: '#fff', fontSize: '13px', fontWeight: 600,
                          whiteSpace: 'nowrap',
                          boxShadow: '0 4px 14px rgba(99,102,241,0.35)',
                          transition: 'all 0.2s',
                        }}
                      >
                        <ShieldCheck size={15} />
                        {otpSending ? 'Sending…' : 'Verify'}
                      </button>
                    )}

                    {/* Verified badge — after success */}
                    {!isLogin && emailVerified && (
                      <div style={{
                        flexShrink: 0, display: 'flex', alignItems: 'center', gap: '5px',
                        padding: '7px 12px', borderRadius: '10px',
                        background: 'rgba(34,197,94,0.12)',
                        border: '1.5px solid rgba(34,197,94,0.4)',
                        color: '#16a34a', fontSize: '12.5px', fontWeight: 600,
                        animation: 'popIn 0.4s cubic-bezier(0.34,1.56,0.64,1)',
                      }}>
                        <CheckCircle2 size={14} strokeWidth={2.5} />
                        Verified
                      </div>
                    )}
                  </div>

                  {/* Mandatory hint */}
                  {!isLogin && !emailVerified && (
                    <p style={{ fontSize: '11.5px', color: '#f59e0b', marginTop: '5px', marginLeft: '2px' }}>
                      ⚠️ Email verification is mandatory before sign up
                    </p>
                  )}
                </div>

                {/* Password */}
                <Input label="Password" type="password" placeholder="Enter your password"
                  value={password} onChange={(e) => setPassword(e.target.value)} required />

                {/* Role + Department (signup only) */}
                {!isLogin && (
                  <div className={`grid gap-4 ${role === 'staff' ? 'grid-cols-2' : 'grid-cols-1'}`}>
                    <Select label="Role" options={roleOptions} value={role}
                      onChange={(e) => { setRole(e.target.value); if (e.target.value === 'principal') setDepartment(''); }}
                    />
                    {role === 'staff' && (
                      <Select label="Department" placeholder="Select Department"
                        options={departmentOptions} value={department}
                        onChange={(e) => setDepartment(e.target.value)} required />
                    )}
                  </div>
                )}

                {/* Error */}
                {error && (
                  <div className={`p-3 border rounded-lg ${accountLocked ? 'bg-orange-50 border-orange-200' : 'bg-red-50 border-red-200'}`}>
                    <p className={`text-sm font-medium ${accountLocked ? 'text-orange-600' : 'text-red-600'}`}>
                      {accountLocked ? '🔒 ' : '⚠️ '}{error}
                    </p>
                  </div>
                )}

                <Button type="submit" variant="primary" className="w-full"
                  disabled={loading || accountLocked || (!isLogin && !emailVerified)}>
                  {accountLocked
                    ? 'Account Locked – Please Wait'
                    : loading ? 'Please wait…'
                    : isLogin  ? 'Sign In' : 'Sign Up'}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={() => { setIsLogin(!isLogin); setError(''); setEmailVerified(false); }}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-semibold transition-colors"
                >
                  {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};


