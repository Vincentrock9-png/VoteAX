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
  Clock, 
  FileText, 
  AlertCircle, 
  UserCheck, 
  ChevronRight, 
  HelpCircle,
  Undo2,
  Lock,
  Loader2
} from 'lucide-react';

export const VoterPortal: React.FC = () => {
  const { 
    currentVoterElection, 
    activeElectionId, 
    voterVerify, 
    navigateTo, 
    currentPath 
  } = useApp();

  // Inputs
  const [fullName, setFullName] = useState('');
  const [identifierValue, setIdentifierValue] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Read associated institution and documents
  const election = currentVoterElection || (activeElectionId ? db.getElectionById(activeElectionId) : null);
  const institution = election ? db.getInstitutionById(election.institutionId) : null;
  const docs = election ? db.getDocuments(election.id).filter(d => d.visibility === 'Visible to Voters') : [];

  useEffect(() => {
    // Reset state on load
    setError('');
    setFullName('');
    setIdentifierValue('');
  }, [election]);

  if (!election || !institution) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center">
        <div className="max-w-md bg-white border border-slate-200 rounded-xl p-8 shadow-sm space-y-4">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
          <h2 className="text-xl font-bold">Election Link Invalid</h2>
          <p className="text-slate-600 text-sm">
            This secure election access link is expired, invalid, or does not correspond to an active institution. Please consult your administrator.
          </p>
          <button 
            onClick={() => navigateTo('landing')} 
            className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2 rounded-lg transition"
          >
            Go to Landing Page
          </button>
        </div>
      </div>
    );
  }

  // Determine active status colors
  const isElectionActive = election.status === 'Active';
  const statusColors = {
    Active: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    Upcoming: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    Paused: 'bg-amber-100 text-amber-800 border-amber-200',
    Ended: 'bg-slate-100 text-slate-800 border-slate-200',
    Cancelled: 'bg-red-100 text-red-800 border-red-200',
    Draft: 'bg-slate-100 text-slate-600 border-slate-200',
    Published: 'bg-blue-100 text-blue-800 border-blue-200',
    'Results Published': 'bg-purple-100 text-purple-800 border-purple-200'
  }[election.status] || 'bg-slate-100 text-slate-800';

  const formatDateTime = (isoStr: string) => {
    return new Date(isoStr).toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!fullName.trim() || !identifierValue.trim()) {
      setError('Please fill out all identity verification fields.');
      return;
    }

    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800)); // professional encryption wait

    try {
      const res = voterVerify(fullName, identifierValue);
      if (!res.success) {
        setError(res.error || 'Identity verification failed.');
      }
    } catch (e) {
      setError('A system authentication error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between font-sans" id="voter-portal">
      {/* Header */}
      <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-50 px-8 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-md shadow-indigo-100">
            <Vote className="h-4.5 w-4.5" />
          </div>
          <div>
            <span className="text-xl font-bold text-slate-900 tracking-tight">Vote<span className="text-indigo-600">AX</span></span>
            <span className="ml-3 px-2 py-0.5 bg-slate-100 rounded text-[9px] font-bold text-slate-500 uppercase tracking-wider inline-block">Voting Engine</span>
          </div>
        </div>
        <button 
          onClick={() => navigateTo('landing')} 
          className="text-xs font-bold text-slate-500 hover:text-slate-900 flex items-center gap-1.5 transition-colors"
        >
          <Undo2 className="h-3.5 w-3.5" />
          <span>Exit Portal</span>
        </button>
      </header>

      {/* Main Grid: Election Metadata vs Identity Verification Form */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-10 grid lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Election details, Rules, Documents */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Card 1: Core Details */}
          <div className="bg-white border border-slate-200 rounded-2xl p-8 space-y-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 bg-slate-100 px-3 py-1 rounded-md border border-slate-200">
                {institution.name}
              </span>
              <span className={`text-[10px] font-bold uppercase tracking-widest border px-3 py-1 rounded-md ${statusColors}`}>
                {election.status}
              </span>
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 leading-tight">{election.name}</h1>
              <p className="text-sm text-slate-600 leading-relaxed">{election.description}</p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 border-t border-slate-150 pt-6 text-xs text-slate-600">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-slate-50 text-slate-400 rounded-lg">
                  <Clock className="h-4.5 w-4.5" />
                </div>
                <div>
                  <span className="block font-bold text-slate-400 uppercase text-[9px] tracking-wider">Polls Opened At</span>
                  <span className="font-bold text-slate-800">{formatDateTime(election.startDate)}</span>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-slate-50 text-slate-400 rounded-lg">
                  <Clock className="h-4.5 w-4.5" />
                </div>
                <div>
                  <span className="block font-bold text-slate-400 uppercase text-[9px] tracking-wider">Polls Closing At</span>
                  <span className="font-bold text-slate-800">{formatDateTime(election.endDate)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Official Guidelines */}
          <div className="bg-white border border-slate-200 rounded-2xl p-8 space-y-5 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-lg font-bold flex items-center gap-2 text-slate-900">
              <FileText className="h-5 w-5 text-indigo-500" />
              <span>Official Election Guidelines & Rules</span>
            </h3>
            
            <div className="space-y-3.5 text-xs text-slate-600 leading-relaxed">
              <p>
                This election is governed by the official campus policies and regulations. By verifying your identity, you confirm your registration under the active student/faculty directory.
              </p>
              
              <ul className="list-disc list-inside space-y-2.5 bg-slate-50 p-4 rounded-xl border border-slate-200 text-slate-700">
                <li>Every authorized voter is strictly allocated <strong className="text-slate-950">one secure ballot submission</strong>.</li>
                <li>Your voting choices remain completely anonymous. The database records your participation timestamp to prevent duplicates, but does not link individual choices to your name.</li>
                <li>Do not reload the browser after verification, as it may lock your temporary access session.</li>
              </ul>
            </div>

            {/* Documents list */}
            {docs.length > 0 && (
              <div className="border-t border-slate-150 pt-4 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block">Voter Access Documents</span>
                <div className="space-y-2">
                  {docs.map(doc => (
                    <div key={doc.id} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                      <div className="flex items-center gap-2.5">
                        <FileText className="h-4 w-4 text-indigo-500" />
                        <div>
                          <span className="font-bold text-slate-800 block">{doc.title}</span>
                          <span className="text-[10px] text-slate-400 font-medium font-mono">{doc.fileName} ({doc.fileSize})</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => alert(`Reviewing PDF simulation:\n\n${doc.title}\n\nContent Excerpt:\n${doc.content || 'No content preview available.'}`)}
                        className="text-[11px] text-indigo-600 font-bold bg-white border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 hover:text-indigo-800 transition shadow-sm"
                      >
                        Read Document
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Verify Your Identity */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-8 space-y-6 shadow-sm sticky top-24">
          <div className="space-y-2">
            <div className="inline-flex p-2.5 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">
              <Lock className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">Voter Verification</h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              Verify your records against the authorized voter roll. The credentials must correspond exactly with the academic registrar records uploaded by the administration.
            </p>
          </div>

          {/* Verification form */}
          {isElectionActive ? (
            <form onSubmit={handleVerify} className="space-y-4">
              
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Your Full Name</label>
                <input 
                  type="text" 
                  id="voter-fullname"
                  placeholder="e.g. Rahul Kumar" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                  required
                />
                <p className="text-[10px] text-slate-400">Must match spelling in official directory.</p>
              </div>

              {/* Identifier based on configured validation */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  {election.voterVerificationMethod}
                </label>
                <input 
                  type="text" 
                  id="voter-identifier"
                  placeholder={`e.g. ${
                    election.voterVerificationMethod === 'Roll Number' ? 'SX-2024-1001' : 
                    election.voterVerificationMethod === 'Student ID' ? '22D070010' : '998242'
                  }`} 
                  value={identifierValue}
                  onChange={(e) => setIdentifierValue(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                  required
                />
                <p className="text-[10px] text-slate-400">Authorized {election.voterVerificationMethod} format.</p>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-medium text-red-600 flex items-start gap-2" id="verification-error">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-500" />
                  <span>{error}</span>
                </div>
              )}

              <button 
                type="submit" 
                id="btn-voter-verify"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 text-white py-3 rounded-xl text-sm font-bold shadow-lg shadow-indigo-100 hover:shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Verifying Identity Credentials...</span>
                  </>
                ) : (
                  <>
                    <span>Authenticate & Access Ballot</span>
                    <ChevronRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-3">
              <Clock className="h-8 w-8 text-slate-400 mx-auto" />
              <h4 className="font-bold text-sm text-slate-800">Ballot Access Suspended</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Identity verification forms are only available when the election is in an <strong className="text-slate-950">Active</strong> state. The current status is '{election.status}'.
              </p>
              {election.status === 'Results Published' && (
                <button 
                  onClick={() => navigateTo('results-public', election.id)}
                  className="mt-3 w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2 px-4 rounded-xl transition shadow-md shadow-indigo-100"
                >
                  View Published Results
                </button>
              )}
            </div>
          )}

          {/* Secure Audit Notice */}
          <div className="bg-slate-50 p-4 border border-slate-200 rounded-xl text-[10px] text-slate-500 space-y-1 leading-relaxed">
            <div className="flex items-center gap-1.5 font-bold text-slate-700">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>CRYPTOGRAPHIC PROTOCOL LOGGED</span>
            </div>
            <p>
              All authorization attempts are timestamped and recorded. Unauthorized attempts will trigger account locking and campus observer alerts.
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
