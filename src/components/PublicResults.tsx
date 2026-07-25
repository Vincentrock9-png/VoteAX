/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useApp } from '../context/AppContext';
import { db } from '../dbMock';
import { Landmark, ArrowLeft, BarChart2, Users, FileCheck, Inbox } from 'lucide-react';

export const PublicResults: React.FC = () => {
  const { activeElectionId, navigateTo } = useApp();

  const election = activeElectionId ? db.getElectionById(activeElectionId) : null;
  const institution = election ? db.getInstitutionById(election.institutionId) : null;

  if (!election || !institution) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center">
        <div className="max-w-md bg-white border border-slate-200 rounded-xl p-8 shadow-sm space-y-4">
          <BarChart2 className="h-10 w-10 text-slate-300 mx-auto" />
          <h2 className="text-lg font-extrabold text-slate-900">Election Results Unavailable</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            The results for this campaign are not published yet, or the parameter keys do not match a valid tenant.
          </p>
          <button 
            onClick={() => navigateTo('landing')} 
            className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2 rounded-lg transition"
          >
            Back to Public Portal
          </button>
        </div>
      </div>
    );
  }

  const positions = db.getPositions(election.id);
  const candidates = db.getCandidates(election.id).filter(c => c.status === 'Approved');
  const voters = db.getVoters(election.id);
  const votes = db.getVotes(election.id);

  // Stats
  const totalEligible = voters.length;
  const uniqueVoted = Array.from(new Set(votes.map(v => v.voterId))).length;
  const turnout = totalEligible > 0 ? Math.round((uniqueVoted / totalEligible) * 100) : 0;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between font-sans" id="public-results-root">
      
      {/* Header */}
      <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-50 px-8 flex items-center justify-between flex-shrink-0">
        <button 
          onClick={() => navigateTo('landing')}
          className="text-xs font-bold text-slate-500 hover:text-slate-900 flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Public Portal</span>
        </button>
        
        <div className="text-right">
          <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-xl uppercase font-mono">
            Audit-Locked Results
          </span>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-10 space-y-6">
        
        {/* Intro */}
        <div className="bg-white border border-slate-200 p-8 rounded-2xl shadow-sm text-center space-y-4 hover:shadow-md transition-shadow">
          <div className="inline-flex p-3 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-2xl">
            <Landmark className="h-6 w-6" />
          </div>
          <div className="space-y-2">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest block">{institution.name}</span>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight leading-tight">{election.name}</h1>
            <p className="text-xs text-slate-500 max-w-lg mx-auto leading-relaxed">
              Certified, audit-locked outcome partition. Recorded votes have been compiled and verified by institutional registrars.
            </p>
          </div>
        </div>

        {/* Turnout Summary */}
        <div className="grid sm:grid-cols-2 gap-6">
          <div className="bg-white border border-slate-200 p-6 rounded-2xl flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Turnout Ratio</span>
              <span className="text-xl font-extrabold text-slate-900">{uniqueVoted} / {totalEligible} Voters</span>
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-6 rounded-2xl flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <FileCheck className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Participation Index</span>
              <span className="text-xl font-extrabold text-emerald-600">{turnout}% Turnout</span>
            </div>
          </div>
        </div>

        {/* Tally Cards */}
        <div className="space-y-6">
          {positions.map(pos => {
            const posCandidates = candidates.filter(c => c.positionId === pos.id);
            const posVotes = votes.filter(v => v.positionId === pos.id);

            // Find winner
            let winnerId = '';
            let maxVotes = -1;
            posCandidates.forEach(c => {
              const count = posVotes.filter(v => v.candidateId === c.id).length;
              if (count > maxVotes && count > 0) {
                maxVotes = count;
                winnerId = c.id;
              }
            });

            return (
              <div key={pos.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4 hover:shadow-md transition-shadow">
                <div className="border-b border-slate-150 pb-3 flex justify-between items-center">
                  <h3 className="font-extrabold text-base text-slate-900">{pos.title}</h3>
                  <span className="text-xs text-slate-400 font-mono font-bold">{posVotes.length} Valid tallies</span>
                </div>

                {posCandidates.length === 0 ? (
                  <div className="text-center py-6 text-slate-400 text-xs">
                    <Inbox className="h-6 w-6 mx-auto text-slate-200 mb-1" />
                    No candidates nominated.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {posCandidates.map(cand => {
                      const count = posVotes.filter(v => v.candidateId === cand.id).length;
                      const share = posVotes.length > 0 ? Math.round((count / posVotes.length) * 100) : 0;
                      const isWinner = cand.id === winnerId;

                      return (
                        <div key={cand.id} className="space-y-1.5">
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-800 font-semibold flex items-center gap-1.5">
                              <span className="text-slate-900 font-bold">{cand.fullName}</span>
                              <span className="text-[10px] text-slate-400 font-normal font-mono">({cand.party || 'Independent'})</span>
                              {isWinner && (
                                <span className="bg-emerald-50 border border-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[9px] uppercase font-mono">
                                  Elected
                                </span>
                              )}
                            </span>
                            <span className="font-mono font-bold text-slate-900">{count} votes ({share}%)</span>
                          </div>

                          <div className="h-2.5 bg-slate-100 border border-slate-200 rounded-full overflow-hidden">
                            <div 
                              className={`h-full transition-all duration-1000 ${isWinner ? 'bg-indigo-600' : 'bg-slate-450'}`} 
                              style={{ width: `${share}%` }} 
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </main>

      {/* Footer */}
      <footer className="mt-auto h-12 bg-slate-100 border-t border-slate-200 flex items-center px-8 justify-between flex-shrink-0 text-slate-500 text-[10px] font-bold tracking-widest uppercase">
        <span>CIVICCAMPUS AUDIT PROTOCOL ACTIVE • ENFORCED TENANT ISOLATION</span>
        <span>ENC. PUBLIC</span>
      </footer>
    </div>
  );
};
