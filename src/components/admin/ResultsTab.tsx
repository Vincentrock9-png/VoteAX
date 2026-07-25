/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { db } from '../../dbMock';
import { 
  BarChart2, 
  Download, 
  Users, 
  Award, 
  Printer, 
  HelpCircle, 
  Clock, 
  Inbox,
  TrendingUp,
  Percent
} from 'lucide-react';

export const ResultsTab: React.FC = () => {
  const { currentInstitution } = useApp();

  // Selection
  const elections = db.getElections(currentInstitution?.id || '');
  const [selectedElectionId, setSelectedElectionId] = useState(elections[0]?.id || '');

  if (!currentInstitution) return null;

  const currentElection = selectedElectionId ? db.getElectionById(selectedElectionId) : null;
  const positions = selectedElectionId ? db.getPositions(selectedElectionId) : [];
  const candidates = selectedElectionId ? db.getCandidates(selectedElectionId).filter(c => c.status === 'Approved') : [];
  const voters = selectedElectionId ? db.getVoters(selectedElectionId) : [];
  const votes = selectedElectionId ? db.getVotes(selectedElectionId) : [];

  // Compute metrics
  const totalEligibleVoters = voters.length;
  // Unique voters who casted at least one ballot
  const uniqueVotersVoted = Array.from(new Set(votes.map(v => v.voterId))).length;
  const turnoutPercentage = totalEligibleVoters > 0 
    ? Math.round((uniqueVotersVoted / totalEligibleVoters) * 100) 
    : 0;

  // Print text report simulation
  const handleDownloadReport = () => {
    if (!currentElection) return;

    let reportText = `====================================================\n`;
    reportText += `       CIVICCAMPUS SECURE DIGITAL BALLOT REPORT\n`;
    reportText += `====================================================\n`;
    reportText += `Institution: ${currentInstitution.name}\n`;
    reportText += `Election: ${currentElection.name}\n`;
    reportText += `Status: ${currentElection.status}\n`;
    reportText += `Turnout Rate: ${turnoutPercentage}% (${uniqueVotersVoted} / ${totalEligibleVoters} Voters)\n`;
    reportText += `Date Generated: ${new Date().toLocaleString()}\n`;
    reportText += `----------------------------------------------------\n\n`;

    positions.forEach(pos => {
      reportText += `POSITION: ${pos.title}\n`;
      reportText += `----------------------------------------------------\n`;
      const posCandidates = candidates.filter(c => c.positionId === pos.id);
      const posVotes = votes.filter(v => v.positionId === pos.id);

      posCandidates.forEach(cand => {
        const candVotesCount = posVotes.filter(v => v.candidateId === cand.id).length;
        const share = posVotes.length > 0 ? Math.round((candVotesCount / posVotes.length) * 100) : 0;
        reportText += `- ${cand.fullName} (${cand.party || 'Independent'}): ${candVotesCount} votes (${share}% share)\n`;
      });

      const abstainCount = uniqueVotersVoted - posVotes.length;
      reportText += `- Abstain / No Ballot Choices: ${abstainCount} votes\n\n`;
    });

    reportText += `====================================================\n`;
    reportText += `             END OF CRYPTOGRAPHIC EXPORT            \n`;
    reportText += `====================================================`;

    // Download file
    const element = document.createElement('a');
    const file = new Blob([reportText], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `${currentElection.name.replace(/\s+/g, '_')}_Secure_Report.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="space-y-6 font-sans" id="admin-results-panel">
      
      {/* Top selector */}
      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 hover:shadow-md transition-shadow">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex items-center gap-2 text-slate-800">
            <BarChart2 className="h-5 w-5 text-indigo-600" />
            <span className="font-bold text-xs uppercase tracking-widest text-slate-500">Select Election Partition:</span>
          </div>
          <select 
            value={selectedElectionId}
            onChange={(e) => setSelectedElectionId(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          >
            <option value="">-- Choose Campaign --</option>
            {elections.map(el => (
              <option key={el.id} value={el.id}>{el.name}</option>
            ))}
          </select>
        </div>

        {selectedElectionId && (
          <button 
            onClick={handleDownloadReport}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md shadow-indigo-100 flex items-center gap-1.5 active:scale-95 cursor-pointer"
          >
            <Download className="h-4 w-4" />
            <span>Download Certified Audit Report</span>
          </button>
        )}
      </div>

      {selectedElectionId ? (
        <div className="space-y-6">
          
          {/* CORE STATS GRID */}
          <div className="grid sm:grid-cols-3 gap-6">
            <div className="bg-white border border-slate-200 p-6 rounded-2xl flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Ballots Cast</span>
                <span className="text-2xl font-extrabold text-slate-900">{uniqueVotersVoted} / {totalEligibleVoters}</span>
                <span className="text-[10px] text-slate-500 block font-bold">Verified student voters</span>
              </div>
            </div>

            <div className="bg-white border border-slate-200 p-6 rounded-2xl flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
                <Percent className="h-6 w-6" />
              </div>
              <div>
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Turnout Percentage</span>
                <span className="text-2xl font-extrabold text-slate-900">{turnoutPercentage}%</span>
                <span className="text-[10px] text-slate-500 block font-bold">Cryptographic turn-out index</span>
              </div>
            </div>

            <div className="bg-white border border-slate-200 p-6 rounded-2xl flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="p-3 bg-slate-50 text-slate-700 rounded-xl border border-slate-200">
                <TrendingUp className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Database Status</span>
                <span className="text-lg font-extrabold text-emerald-600 flex items-center gap-1.5 mt-0.5">
                  <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span>Syncing Live</span>
                </span>
                <span className="text-[10px] text-slate-500 block font-bold">Aggregating isolated joins</span>
              </div>
            </div>
          </div>

          {/* CANDIDATE STANDINGS PER POSITION */}
          <div className="space-y-6">
            {positions.map(pos => {
              const posCandidates = candidates.filter(c => c.positionId === pos.id);
              const posVotes = votes.filter(v => v.positionId === pos.id);

              return (
                <div key={pos.id} className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-4 hover:shadow-md transition-shadow">
                  <div className="border-b border-slate-150 pb-3 flex justify-between items-center">
                    <div>
                      <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-xl uppercase block w-max mb-1 font-mono">
                        Ballot standings
                      </span>
                      <h4 className="font-extrabold text-lg text-slate-900">{pos.title}</h4>
                    </div>
                    <span className="text-xs text-slate-400 font-mono font-bold">{posVotes.length} Ballots tallied</span>
                  </div>

                  {posCandidates.length === 0 ? (
                    <div className="py-6 text-center text-slate-400 text-xs space-y-1.5">
                      <Inbox className="h-6 w-6 text-slate-300 mx-auto" />
                      <p>No candidates approved to calculate standings.</p>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      {posCandidates.map(cand => {
                        const candVotesCount = posVotes.filter(v => v.candidateId === cand.id).length;
                        const voteShare = posVotes.length > 0 
                          ? Math.round((candVotesCount / posVotes.length) * 100) 
                          : 0;

                        return (
                          <div key={cand.id} className="space-y-1.5">
                            <div className="flex justify-between text-xs">
                              <span className="text-slate-800">
                                <strong className="font-bold text-slate-900">{cand.fullName}</strong>{' '}
                                <span className="text-slate-400 font-medium font-mono text-[10px]">({cand.party || 'Independent'})</span>
                              </span>
                              <span className="text-slate-900 font-extrabold font-mono">
                                {candVotesCount} votes ({voteShare}% share)
                              </span>
                            </div>
                            
                            {/* Visual Progress bar */}
                            <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                              <div 
                                className="h-full bg-indigo-600 transition-all duration-1000" 
                                style={{ width: `${voteShare}%` }} 
                              />
                            </div>
                          </div>
                        );
                      })}

                      {/* Abstentions tally */}
                      <div className="pt-2 flex justify-between text-[11px] text-slate-400 italic">
                        <span>Abstentions / Blank Selections:</span>
                        <span>{uniqueVotersVoted - posVotes.length} ballots</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      ) : (
        <div className="bg-white border border-slate-200 p-12 rounded-2xl text-center text-slate-400 text-xs shadow-sm">
          Please select or configure an election partition above to monitor voting statistics.
        </div>
      )}

    </div>
  );
};
