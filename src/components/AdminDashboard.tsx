/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { db } from '../dbMock';
import { ElectionsTab } from './admin/ElectionsTab';
import { VotersTab } from './admin/VotersTab';
import { CandidatesTab } from './admin/CandidatesTab';
import { DocumentsTab } from './admin/DocumentsTab';
import { ResultsTab } from './admin/ResultsTab';
import { LogsTab } from './admin/LogsTab';

import { 
  Vote, 
  Layers, 
  Users, 
  Award, 
  FileText, 
  BarChart2, 
  ShieldAlert, 
  LogOut, 
  UserCheck, 
  Landmark,
  ExternalLink
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { currentAdmin, currentInstitution, adminLogout, navigateTo, refreshTrigger } = useApp();
  const [activeTab, setActiveTab] = useState<'elections' | 'voters' | 'candidates' | 'documents' | 'results' | 'logs'>('elections');

  if (!currentAdmin || !currentInstitution) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center">
        <div className="max-w-md bg-white border border-slate-200 rounded-xl p-8 shadow-sm space-y-4 animate-scaleUp">
          <ShieldAlert className="h-12 w-12 text-red-500 mx-auto" />
          <h2 className="text-xl font-bold">Access Unauthorized</h2>
          <p className="text-slate-600 text-sm">
            Please log in with valid institution credentials to view the secure administrative console.
          </p>
          <button 
            onClick={() => navigateTo('admin-login')} 
            className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2 rounded-lg transition"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // Aggregate institution-wide metrics
  const elections = db.getElections(currentInstitution.id);
  const totalElections = elections.length;
  
  // Count total voters & candidates
  let totalVoters = 0;
  let totalCandidates = 0;
  let totalVotesCount = 0;

  elections.forEach(el => {
    totalVoters += db.getVoters(el.id).length;
    totalCandidates += db.getCandidates(el.id).length;
    totalVotesCount += db.getVotes(el.id).length;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between font-sans" id="admin-dashboard-root">
      
      {/* Top Banner / Header */}
      <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-50 px-8 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigateTo('landing')}>
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-md shadow-indigo-100">
            <Vote className="h-4.5 w-4.5" />
          </div>
          <div>
            <span className="text-xl font-bold text-slate-900 tracking-tight">Vote<span className="text-indigo-600">AX</span> Admin</span>
            <div className="px-2.5 py-0.5 bg-slate-100 rounded text-[9px] font-bold text-slate-500 uppercase tracking-wider inline-block ml-2">{currentInstitution.name}</div>
          </div>
        </div>

        {/* Admin profile and sign out */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 border-r pr-6 border-slate-200 hidden sm:flex">
            <div className="text-right">
              <p className="text-xs font-bold text-slate-950">{currentAdmin.fullName}</p>
              <p className="text-[10px] text-slate-500 font-medium">{currentAdmin.role}</p>
            </div>
            <div className="w-10 h-10 bg-indigo-50 border border-indigo-200 text-indigo-600 rounded-full flex items-center justify-center font-bold shadow-sm text-xs">
              {currentAdmin.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
            </div>
          </div>
          <button 
            onClick={adminLogout}
            id="btn-admin-logout"
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-all flex items-center space-x-1.5 shadow-sm active:scale-95"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* Stats Summary cards (Bento pattern) */}
      <div className="max-w-7xl w-full mx-auto px-6 pt-8 grid grid-cols-2 md:grid-cols-4 gap-5">
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Total Campaigns</span>
          <div>
            <span className="text-2xl font-bold text-slate-900 mt-2 block">{totalElections} Elections</span>
            <span className="text-[10px] text-indigo-600 font-bold bg-indigo-50 border border-indigo-100/50 px-2.5 py-0.5 rounded-md mt-1.5 inline-block">Active Partition</span>
          </div>
        </div>
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Eligible Voters</span>
          <div>
            <span className="text-2xl font-bold text-slate-900 mt-2 block">{totalVoters} Records</span>
            <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 border border-emerald-100/50 px-2.5 py-0.5 rounded-md mt-1.5 inline-block">Voter Registries</span>
          </div>
        </div>
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Registered Nominees</span>
          <div>
            <span className="text-2xl font-bold text-slate-900 mt-2 block">{totalCandidates} Candidates</span>
            <span className="text-[10px] text-amber-600 font-bold bg-amber-50 border border-amber-100/50 px-2.5 py-0.5 rounded-md mt-1.5 inline-block">Authorized Nominees</span>
          </div>
        </div>
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Secure Ballots Cast</span>
          <div>
            <span className="text-2xl font-bold text-slate-900 mt-2 block">{totalVotesCount} Votes</span>
            <span className="text-[10px] text-purple-600 font-bold bg-purple-50 border border-purple-100/50 px-2.5 py-0.5 rounded-md mt-1.5 inline-block">Secure Audited</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Sidebar + Active Tab Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 grid md:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Navigation Tabs (Bento Pattern) */}
        <div className="md:col-span-3 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-2">
          <div className="border-b border-slate-100 pb-3 mb-2 px-2">
            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Control Panels</span>
          </div>

          {[
            { id: 'elections', label: 'Elections Lifecycle', icon: Layers },
            { id: 'voters', label: 'Student Registries', icon: Users },
            { id: 'candidates', label: 'Candidate Approvals', icon: Award },
            { id: 'documents', label: 'Regulatory Docs', icon: FileText },
            { id: 'results', label: 'Tally stand Analytics', icon: BarChart2 },
            { id: 'logs', label: 'Immutable Audit Trail', icon: UserCheck }
          ].map(tab => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;

            return (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  isSelected 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100 font-bold' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
                id={`tab-btn-${tab.id}`}
              >
                <Icon className={`h-4.5 w-4.5 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}

          <div className="border-t border-slate-100 pt-4 mt-4 px-2 space-y-2">
            <button 
              onClick={() => navigateTo('landing')}
              className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1.5 transition-colors"
            >
              <ExternalLink className="h-3 w-3" />
              <span>Open Public Landing</span>
            </button>
          </div>
        </div>

        {/* Right Side: Render Active Tab component */}
        <div className="md:col-span-9">
          {activeTab === 'elections' && <ElectionsTab />}
          {activeTab === 'voters' && <VotersTab />}
          {activeTab === 'candidates' && <CandidatesTab />}
          {activeTab === 'documents' && <DocumentsTab />}
          {activeTab === 'results' && <ResultsTab />}
          {activeTab === 'logs' && <LogsTab />}
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto h-12 bg-slate-100 border-t border-slate-200 flex items-center px-8 justify-between flex-shrink-0 text-slate-500 text-[10px] font-bold tracking-widest uppercase">
        <span>CIVICCAMPUS MULTI-TENANT CONSOLE • IMMUTABLE DATA PARTITIONS ACTIVE</span>
        <span>ENC. AES-256</span>
      </footer>
    </div>
  );
};
