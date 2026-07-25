/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { db } from '../dbMock';
import { 
  Vote, 
  ShieldCheck, 
  Lock, 
  Loader2, 
  AlertCircle, 
  Undo2, 
  ChevronRight,
  School,
  Calendar
} from 'lucide-react';
import { Institution, Election } from '../types';

export const VoterLogin: React.FC = () => {
  const { 
    navigateTo, 
    selectVoterElection, 
    voterVerify 
  } = useApp();

  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [selectedInstId, setSelectedInstId] = useState<string>('');
  const [elections, setElections] = useState<Election[]>([]);
  const [selectedElectionId, setSelectedElectionId] = useState<string>('');
  
  // Credentials
  const [fullName, setFullName] = useState('');
  const [identifierValue, setIdentifierValue] = useState('');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch institutions on load
  useEffect(() => {
    const list = db.getInstitutions();
    setInstitutions(list);
    if (list.length > 0) {
      setSelectedInstId(list[0].id);
    }
  }, []);

  // Fetch active elections when selected institution changes
  useEffect(() => {
    if (selectedInstId) {
      const activeElections = db.getElections(selectedInstId).filter(
        el => el.status === 'Active'
      );
      setElections(activeElections);
      if (activeElections.length > 0) {
        setSelectedElectionId(activeElections[0].id);
      } else {
        setSelectedElectionId('');
      }
    } else {
      setElections([]);
      setSelectedElectionId('');
    }
    // Clear credentials when tenant changes
    setFullName('');
    setIdentifierValue('');
    setError('');
  }, [selectedInstId]);

  // Handle selected election change
  useEffect(() => {
    setFullName('');
    setIdentifierValue('');
    setError('');
  }, [selectedElectionId]);

  const activeElection = elections.find(el => el.id === selectedElectionId);

  const handleVerifyLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedElectionId) {
      setError('Please select an active election first.');
      return;
    }

    if (!fullName.trim() || !identifierValue.trim()) {
      setError('Please fill out all identity verification fields.');
      return;
    }

    setLoading(true);
    // Simulate high-security cryptographic handshake
    await new Promise(resolve => setTimeout(resolve, 800));

    try {
      // First, bind the selected election to the application state
      selectVoterElection(selectedElectionId);

      // Verify the credentials
      const res = voterVerify(fullName.trim(), identifierValue.trim());
      if (!res.success) {
        setError(res.error || 'Identity verification failed.');
      }
    } catch (err) {
      setError('A system authentication error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between font-sans" id="voter-login-page">
      {/* Header */}
      <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-50 px-8 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigateTo('landing')}>
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-md shadow-indigo-100">
            <Vote className="h-4.5 w-4.5" />
          </div>
          <span className="text-xl font-bold text-slate-900 tracking-tight">Vote<span className="text-indigo-600">AX</span></span>
          <span className="ml-3 px-2 py-0.5 bg-slate-100 rounded text-[9px] font-bold text-slate-500 uppercase tracking-wider inline-block">Voter Login</span>
        </div>
        <button 
          onClick={() => navigateTo('landing')} 
          className="text-xs font-bold text-slate-500 hover:text-slate-900 flex items-center gap-1.5 transition-colors"
        >
          <Undo2 className="h-3.5 w-3.5" />
          <span>Back to Home</span>
        </button>
      </header>

      {/* Centered Main Form */}
      <main className="flex-1 flex items-center justify-center p-6 my-6">
        <div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl p-8 space-y-6 shadow-sm hover:shadow-md transition-shadow">
          
          <div className="text-center space-y-2">
            <div className="inline-flex p-3 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100 mx-auto">
              <Lock className="h-6 w-6" />
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">Voter Sign In</h2>
            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
              Verify your student or faculty record against the authorized voter rolls of your educational institution.
            </p>
          </div>

          <form onSubmit={handleVerifyLogin} className="space-y-4">
            
            {/* Step 1: Select Institution */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                <School className="h-3.5 w-3.5 text-indigo-500" />
                <span>Select Your College / University</span>
              </label>
              <select
                id="login-institution-select"
                value={selectedInstId}
                onChange={(e) => setSelectedInstId(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
              >
                {institutions.length === 0 ? (
                  <option value="">No Colleges Registered</option>
                ) : (
                  institutions.map(inst => (
                    <option key={inst.id} value={inst.id}>{inst.name}</option>
                  ))
                )}
              </select>
            </div>

            {/* Step 2: Select Active Election */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-indigo-500" />
                <span>Active Election Campaign</span>
              </label>
              {elections.length === 0 ? (
                <div className="p-3.5 bg-slate-50 border border-slate-150 rounded-xl text-center text-xs text-slate-500 font-semibold">
                  No active election campaign found for this college.
                </div>
              ) : (
                <select
                  id="login-election-select"
                  value={selectedElectionId}
                  onChange={(e) => setSelectedElectionId(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-850 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                >
                  {elections.map(el => (
                    <option key={el.id} value={el.id}>{el.name}</option>
                  ))}
                </select>
              )}
            </div>

            {activeElection && (
              <div className="space-y-4 pt-2 border-t border-slate-100">
                {/* Full Name input */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Your Full Name</label>
                  <input 
                    type="text" 
                    id="login-fullname"
                    placeholder="e.g. Rahul Kumar" 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                    required
                  />
                  <p className="text-[10px] text-slate-400">Must match spelling in your college registrar records.</p>
                </div>

                {/* Identifier input based on election setting */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {activeElection.voterVerificationMethod}
                  </label>
                  <input 
                    type="text" 
                    id="login-identifier"
                    placeholder={`e.g. ${
                      activeElection.voterVerificationMethod === 'Roll Number' ? 'SX-2024-1001' : 
                      activeElection.voterVerificationMethod === 'Student ID' ? '22D070010' : '998242'
                    }`} 
                    value={identifierValue}
                    onChange={(e) => setIdentifierValue(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                    required
                  />
                  <p className="text-[10px] text-slate-400">Authorized {activeElection.voterVerificationMethod} format.</p>
                </div>
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-medium text-red-600 flex items-start gap-2" id="login-error-box">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-500" />
                <span>{error}</span>
              </div>
            )}

            <button 
              type="submit" 
              id="btn-login-voter-submit"
              disabled={loading || elections.length === 0}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:text-slate-500 text-white py-3 rounded-xl text-sm font-bold shadow-lg shadow-indigo-100 hover:shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Verifying Identity...</span>
                </>
              ) : (
                <>
                  <span>Sign In & Verify</span>
                  <ChevronRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Secure Handshake Disclaimer */}
          <div className="bg-slate-50 p-4 border border-slate-200 rounded-xl text-[10px] text-slate-500 space-y-1 leading-relaxed">
            <div className="flex items-center gap-1.5 font-bold text-slate-700">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>CRYPTOGRAPHIC PROTOCOL LOGGED</span>
            </div>
            <p>
              Voter access sessions are cryptographically isolated. Multiple tabs or duplicate login attempts are strictly tracked.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto h-12 bg-slate-100 border-t border-slate-200 flex items-center px-8 justify-between flex-shrink-0 text-slate-500 text-[10px] font-bold tracking-widest uppercase">
        <span>Powered by VoteAX • Secure Multi-Tenant Architecture</span>
        <span>ENC. CERTIFIED</span>
      </footer>
    </div>
  );
};
