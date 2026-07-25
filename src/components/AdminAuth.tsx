/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AdminRole } from '../types';
import { Vote, ArrowLeft, Shield, Landmark, KeySquare, HelpCircle, User, Loader2 } from 'lucide-react';

export const AdminAuth: React.FC = () => {
  const { adminLogin, adminRegister, navigateTo, currentPath } = useApp();
  const isRegisterMode = currentPath === 'admin-register';

  // State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [institutionName, setInstitutionName] = useState('');
  const [role, setRole] = useState<AdminRole>('Election Admin');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!username.trim() || !password) {
      setError('Username and password are required.');
      return;
    }

    setLoading(true);

    // Artificial tiny delay for premium responsive feel
    await new Promise(resolve => setTimeout(resolve, 600));

    try {
      if (isRegisterMode) {
        if (!fullName.trim()) {
          setError('Full name is required.');
          setLoading(false);
          return;
        }
        if (!institutionName.trim()) {
          setError('Institution name is required.');
          setLoading(false);
          return;
        }
        if (password !== confirmPassword) {
          setError('Passwords do not match.');
          setLoading(false);
          return;
        }
        if (password.length < 6) {
          setError('Password must be at least 6 characters.');
          setLoading(false);
          return;
        }

        const res = adminRegister(fullName, username, password, institutionName, role);
        if (!res.success) {
          setError(res.error || 'Failed to register administrative account.');
        }
      } else {
        const res = adminLogin(username, password);
        if (!res.success) {
          setError(res.error || 'Failed to authenticate administrator.');
        }
      }
    } catch (e) {
      setError('A system error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between font-sans" id="admin-auth">
      {/* Header */}
      <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-50 px-8 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigateTo('landing')}>
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-md shadow-indigo-100">
            <Vote className="h-4.5 w-4.5" />
          </div>
          <span className="text-xl font-bold text-slate-900 tracking-tight">Vote<span className="text-indigo-600">AX</span></span>
        </div>
        <button 
          onClick={() => navigateTo('landing')} 
          className="text-xs font-bold text-slate-500 hover:text-slate-900 flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Home</span>
        </button>
      </header>

      {/* Main Content Card */}
      <main className="flex-1 flex items-center justify-center px-6 py-12 md:py-16">
        <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
          
          {/* Accent Header */}
          <div className="bg-slate-900 text-white p-6 text-center space-y-2">
            <div className="inline-flex p-2.5 bg-slate-800 text-indigo-400 rounded-xl border border-slate-700/50">
              <Shield className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold tracking-tight">
              {isRegisterMode ? 'Institutional Onboarding' : 'Academic Admin Console'}
            </h2>
            <p className="text-xs text-slate-400">
              {isRegisterMode 
                ? 'Register your college and setup administrative control.' 
                : 'Authenticate credentials to manage authorized college elections.'}
            </p>
          </div>

          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {isRegisterMode && (
                <>
                  {/* Full Name */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Your Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input 
                        type="text" 
                        id="reg-fullname"
                        placeholder="e.g. Dean Sandeep Kelkar" 
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                        required
                      />
                    </div>
                  </div>

                  {/* College Name */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Institution Name</label>
                    <div className="relative">
                      <Landmark className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input 
                        type="text" 
                        id="reg-institution"
                        placeholder="e.g. St. Xavier's College, Mumbai" 
                        value={institutionName}
                        onChange={(e) => setInstitutionName(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                        required
                      />
                    </div>
                    <p className="text-[10px] text-slate-400">If this college exists, you will join it as an administrator.</p>
                  </div>

                  {/* Role Type */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center space-x-1">
                      <span>Role Allocation</span>
                      <HelpCircle className="h-3.5 w-3.5 text-slate-400 cursor-help" title="Super Admins can configure everything. Election Admins manage voter lists. Moderators review nominations." />
                    </label>
                    <select 
                      id="reg-role"
                      value={role}
                      onChange={(e) => setRole(e.target.value as AdminRole)}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                    >
                      <option value="Super Admin">Super Admin (Full Access)</option>
                      <option value="Election Admin">Election Admin (Voters & Lifecycles)</option>
                      <option value="Moderator">Moderator (Candidate Approvals)</option>
                    </select>
                  </div>
                </>
              )}

              {/* Username */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Admin Username</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input 
                    type="text" 
                    id="auth-username"
                    placeholder="e.g. xavier_admin" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Password</label>
                <div className="relative">
                  <KeySquare className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input 
                    type="password" 
                    id="auth-password"
                    placeholder="••••••••" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                    required
                  />
                </div>
              </div>

              {isRegisterMode && (
                /* Confirm Password */
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Confirm Password</label>
                  <div className="relative">
                    <KeySquare className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input 
                      type="password" 
                      id="reg-confirmpass"
                      placeholder="••••••••" 
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Error messages */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-medium text-red-600" id="auth-error">
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <button 
                type="submit" 
                id="btn-auth-submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 text-white py-3 rounded-xl text-sm font-bold shadow-lg shadow-indigo-100 hover:shadow-xl hover:shadow-indigo-200 active:scale-95 transition-all flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Processing Securing Protocols...</span>
                  </>
                ) : (
                  <span>{isRegisterMode ? 'Complete Institutional Setup' : 'Authorize Console Access'}</span>
                )}
              </button>
            </form>

            {/* Mode Toggle */}
            <div className="mt-6 text-center text-xs text-slate-500">
              {isRegisterMode ? (
                <p>
                  Already have an administrative portal?{' '}
                  <button 
                    onClick={() => navigateTo('admin-login')} 
                    className="font-bold text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer"
                  >
                    Admin Sign In
                  </button>
                </p>
              ) : (
                <p>
                  Need to register a new college or university?{' '}
                  <button 
                    onClick={() => navigateTo('admin-register')} 
                    className="font-bold text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer"
                  >
                    Onboard Institution
                  </button>
                </p>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto h-12 bg-slate-100 border-t border-slate-200 flex items-center px-8 justify-between flex-shrink-0 text-slate-500 text-[10px] font-bold tracking-widest uppercase">
        <span>SECURE GATEWAY • HIGHLY COMPLIANT ENCRYPTION ENFORCED</span>
        <span>ENC. RSA-4096</span>
      </footer>
    </div>
  );
};
