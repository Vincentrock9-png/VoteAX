/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { db } from '../dbMock';
import { 
  Vote, 
  Shield, 
  School, 
  Users, 
  CheckCircle, 
  ArrowRight, 
  KeySquare, 
  Search, 
  HelpCircle,
  Clock,
  Landmark,
  FileSpreadsheet
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { navigateTo, getElectionAccessUrl } = useApp();
  const [electionIdInput, setElectionIdInput] = useState('');
  const [searchError, setSearchError] = useState('');

  const activeElections = db.getInstitutions().flatMap(inst => 
    db.getElections(inst.id).filter(el => el.status === 'Active' || el.status === 'Results Published')
  );

  const handleSearchElection = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError('');
    if (!electionIdInput.trim()) {
      setSearchError('Please enter an election ID or access code.');
      return;
    }

    const election = db.getElectionById(electionIdInput.trim());
    if (election) {
      // Navigate to election
      navigateTo('voter-verify', election.id);
    } else {
      setSearchError('Election not found. Please verify the ID or check your access link.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between font-sans" id="landing-page">
      {/* Header */}
      <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-50 px-8 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigateTo('landing')}>
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-md shadow-indigo-100">
            <Vote className="h-4.5 w-4.5" />
          </div>
          <span className="text-xl font-bold text-slate-900 tracking-tight">Vote<span className="text-indigo-600">AX</span></span>
          <div className="ml-6 px-3 py-1 bg-slate-100 rounded text-[11px] font-bold text-slate-500 uppercase tracking-wider">Multi-Tenant v2.4</div>
        </div>
        <div className="flex items-center gap-6">
          <button 
            id="btn-voter-login-link"
            onClick={() => navigateTo('voter-login')} 
            className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
          >
            Voter Login
          </button>
          <button 
            id="btn-admin-login"
            onClick={() => navigateTo('admin-login')} 
            className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            Admin Sign In
          </button>
          <button 
            id="btn-admin-register"
            onClick={() => navigateTo('admin-register')} 
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-all shadow-md shadow-indigo-100 hover:shadow-lg active:scale-95"
          >
            Register Institution
          </button>
        </div>
      </header>

      {/* Main Hero & Search Grid */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-12 md:py-16 space-y-16">
        
        {/* Intro */}
        <div className="text-center max-w-3xl mx-auto space-y-6">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Enterprise-Grade Online Elections for Educational Institutions
          </h1>
          <p className="text-base text-slate-600 leading-relaxed">
            A secure, multi-tenant digital balloting network. Isolate voter registries, upload custom guidelines, authorize candidates, and enforce one-vote security rules with cryptographic isolation.
          </p>
        </div>

        {/* Enter Code Card & Search (Bento Pattern) */}
        <div className="grid md:grid-cols-12 gap-6 items-stretch">
          <div className="md:col-span-7 bg-white border border-slate-200 p-8 rounded-2xl shadow-sm flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="inline-flex p-3 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-150">
                <KeySquare className="h-6 w-6" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">Access Your Election Portal</h2>
              <p className="text-slate-600 text-sm leading-relaxed">
                If you were provided with an Election ID or Access Code by your college administration, enter it below to verify your identity and cast your ballot securely.
              </p>
            </div>

            <form onSubmit={handleSearchElection} className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input 
                  type="text" 
                  id="input-election-code"
                  placeholder="e.g. elect-xavier-sue" 
                  value={electionIdInput}
                  onChange={(e) => setElectionIdInput(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                />
              </div>
              {searchError && (
                <p className="text-xs text-red-600 font-medium" id="search-error">{searchError}</p>
              )}
              <button 
                type="submit" 
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl text-sm font-bold shadow-lg shadow-indigo-200 hover:shadow-xl active:scale-95 transition-all flex items-center justify-center space-x-2"
              >
                <span>Access Election</span>
                <ArrowRight className="h-4 w-4" />
              </button>
              <div className="text-center text-xs text-slate-500 pt-2">
                Don't have a direct election code?{' '}
                <button 
                  onClick={() => navigateTo('voter-login')} 
                  className="text-indigo-600 font-bold hover:underline cursor-pointer"
                  type="button"
                >
                  Go to general Voter Login Page
                </button>
              </div>
            </form>
          </div>

          {/* Quick Stats Grid (Bento Pattern) */}
          <div className="md:col-span-5 grid grid-cols-2 gap-5">
            <div className="bg-white border border-slate-200 p-6 rounded-2xl flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Tenants</span>
              <div>
                <div className="text-3xl font-extrabold text-slate-900 mt-2">12+</div>
                <p className="text-xs text-slate-500 mt-1">Colleges Registered</p>
              </div>
            </div>
            <div className="bg-white border border-slate-200 p-6 rounded-2xl flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ballots Cast</span>
              <div>
                <div className="text-3xl font-extrabold text-slate-900 mt-2">14,208</div>
                <p className="text-xs text-slate-500 mt-1">Cryptographically Signed</p>
              </div>
            </div>
            <div className="bg-white border border-slate-200 p-6 rounded-2xl flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Verification Rate</span>
              <div>
                <div className="text-3xl font-extrabold text-slate-900 mt-2">100%</div>
                <p className="text-xs text-slate-500 mt-1">Scoped Identity Match</p>
              </div>
            </div>
            <div className="bg-white border border-slate-200 p-6 rounded-2xl flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Audit Protocols</span>
              <div>
                <div className="text-3xl font-extrabold text-slate-900 mt-2">Active</div>
                <p className="text-xs text-slate-500 mt-1">Immutable Logs</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sandbox Simulation / Sandbox Hub - ESSENTIAL FOR FAST Turnkey testing! */}
        <div className="bg-slate-900 text-white rounded-2xl p-8 border border-slate-800 space-y-6 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
            <div className="space-y-1">
              <span className="text-[10px] font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 px-3 py-1 rounded-full uppercase tracking-wider">
                Developer Sandbox Simulation Mode
              </span>
              <h3 className="text-2xl font-bold tracking-tight mt-2">Immediate Multi-Tenant Demo Scenarios</h3>
              <p className="text-sm text-slate-400">
                Test data isolation and specific flows instantly using preloaded database records.
              </p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => navigateTo('admin-login')} 
                className="bg-white hover:bg-slate-100 text-slate-950 px-5 py-2.5 text-xs font-bold rounded-xl transition-all shadow-md active:scale-95"
              >
                Open Admin Portal
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* College A */}
            <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-slate-200">
                  <Landmark className="h-4.5 w-4.5 text-indigo-400" />
                  <span className="font-bold text-sm">Tenant A: St. Xavier's College, Mumbai</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Conducting: <strong className="text-white">Student Union Election 2026</strong>. Has 3 positions, 5 eligible students, and 2 preloaded votes.
                </p>
                <div className="bg-slate-900 p-3 rounded-lg text-[11px] text-slate-300 font-mono space-y-1.5 mt-2 border border-slate-800">
                  <div>Admin User: <span className="text-indigo-400 font-semibold">xavier_admin</span></div>
                  <div>Admin Pass: <span className="text-indigo-400 font-semibold">admin123</span></div>
                  <div className="border-t border-slate-800 my-1.5"></div>
                  <div>Test Voter 1 Name: <span className="text-amber-400">Rahul Kumar</span></div>
                  <div>Test Voter 1 Roll No: <span className="text-amber-400">SX-2024-1001</span></div>
                  <div>Test Voter 2 Name: <span className="text-amber-400">Tanvi Shah</span> (not voted yet)</div>
                  <div>Test Voter 2 Roll No: <span className="text-amber-400">SX-2024-1006</span></div>
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button 
                  onClick={() => navigateTo('voter-verify', 'elect-xavier-sue')}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold px-4 py-2 rounded-lg shadow-md shadow-indigo-900/30 transition-all active:scale-95"
                >
                  Simulate Student Voting Link
                </button>
                <button 
                  onClick={() => navigateTo('results-public', 'elect-xavier-sue')}
                  className="border border-slate-700 hover:bg-slate-800 text-slate-300 text-[11px] font-bold px-4 py-2 rounded-lg transition-all active:scale-95"
                >
                  View Public Results
                </button>
              </div>
            </div>

            {/* College B */}
            <div className="bg-slate-950 p-6 rounded-xl border border-slate-800 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-slate-200">
                  <Landmark className="h-4.5 w-4.5 text-indigo-400" />
                  <span className="font-bold text-sm">Tenant B: IIT Bombay, Mumbai</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Conducting: <strong className="text-white">Student Senate Election 2026</strong>. Demonstrates completely isolated voter lists and unique identifiers.
                </p>
                <div className="bg-slate-900 p-3 rounded-lg text-[11px] text-slate-300 font-mono space-y-1.5 mt-2 border border-slate-800">
                  <div>Admin User: <span className="text-indigo-400 font-semibold">iit_admin</span></div>
                  <div>Admin Pass: <span className="text-indigo-400 font-semibold">iitb123</span></div>
                  <div className="border-t border-slate-800 my-1.5"></div>
                  <div>Test Voter Name: <span className="text-amber-400">Atharva Patil</span></div>
                  <div>Test Voter Student ID: <span className="text-amber-400">22D070010</span></div>
                  <div>(Roll No SX-2024-1001 will NOT work here!)</div>
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button 
                  onClick={() => navigateTo('voter-verify', 'elect-iitb-senate')}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold px-4 py-2 rounded-lg shadow-md shadow-indigo-900/30 transition-all active:scale-95"
                >
                  Simulate Student Voting Link
                </button>
                <button 
                  onClick={() => navigateTo('results-public', 'elect-iitb-senate')}
                  className="border border-slate-700 hover:bg-slate-800 text-slate-300 text-[11px] font-bold px-4 py-2 rounded-lg transition-all active:scale-95"
                >
                  View Public Results
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Core Principles Section (Bento Grid Style) */}
        <div className="space-y-8">
          <h3 className="text-2xl font-bold tracking-tight text-center text-slate-900">Engineered for Absolute Trust</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow space-y-4">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl w-12 h-12 flex items-center justify-center border border-indigo-100">
                <Shield className="h-6 w-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-900">Strict Tenant Isolation</h4>
              <p className="text-slate-600 text-xs leading-relaxed">
                Database records are partitioned using isolated internal UUID linkages. Student IDs or Roll numbers are only searchable within the correct election context. No overlaps occur.
              </p>
            </div>
            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow space-y-4">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl w-12 h-12 flex items-center justify-center border border-indigo-100">
                <Users className="h-6 w-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-900">Configurable Authentications</h4>
              <p className="text-slate-600 text-xs leading-relaxed">
                Admins configure required credentials: Roll Number, Admission Number, Student ID, or Employee ID. The authentication engine automatically scales to the configured security method.
              </p>
            </div>
            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow space-y-4">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl w-12 h-12 flex items-center justify-center border border-indigo-100">
                <CheckCircle className="h-6 w-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-900">Immutable Audit Logs</h4>
              <p className="text-slate-600 text-xs leading-relaxed">
                All critical admin operations, voter list imports, candidate approvals, and election state transitions are securely written to database audit trails, detailing actors and timestamps.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto h-12 bg-slate-100 border-t border-slate-200 flex items-center px-8 justify-between flex-shrink-0 text-slate-500 text-xs">
        <div className="flex gap-4">
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest italic">Data Isolation: ACTIVE</span>
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest italic">UUID Mapping: SECURE</span>
        </div>
        <p className="text-[10px] text-slate-400">© 2026 VoteAX Platform • Encrypted & Secure</p>
      </footer>
    </div>
  );
};
