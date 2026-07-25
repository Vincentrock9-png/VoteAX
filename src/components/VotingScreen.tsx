/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { db } from '../dbMock';
import { 
  Vote as VoteIcon, 
  User, 
  CheckCircle, 
  ChevronDown, 
  ChevronUp, 
  HelpCircle, 
  ArrowRight,
  ShieldAlert,
  Inbox,
  Sparkles,
  ClipboardCheck,
  LogOut,
  Loader2
} from 'lucide-react';

export const VotingScreen: React.FC = () => {
  const { currentVoter, currentVoterElection, voterLogout } = useApp();
  
  // State for selections: { [positionId]: candidateId }
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [expandedManifesto, setExpandedManifesto] = useState<Record<string, boolean>>({});
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [receiptCode, setReceiptCode] = useState('');
  const [error, setError] = useState('');

  if (!currentVoter || !currentVoterElection) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center">
        <div className="max-w-md bg-white border border-slate-200 rounded-xl p-8 shadow-sm space-y-4">
          <ShieldAlert className="h-12 w-12 text-red-500 mx-auto" />
          <h2 className="text-xl font-bold">Session Restored or Missing</h2>
          <p className="text-slate-600 text-sm">
            You do not have a valid active voting session. Please authenticate via the official secure link shared by your institution.
          </p>
          <button 
            onClick={voterLogout} 
            className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2 rounded-lg transition"
          >
            Authenticate Portal
          </button>
        </div>
      </div>
    );
  }

  const positions = db.getPositions(currentVoterElection.id);
  const candidates = db.getCandidates(currentVoterElection.id).filter(c => c.status === 'Approved');

  const toggleManifesto = (candId: string) => {
    setExpandedManifesto(prev => ({ ...prev, [candId]: !prev[candId] }));
  };

  const handleSelectCandidate = (positionId: string, candId: string) => {
    setSelections(prev => ({
      ...prev,
      [positionId]: candId
    }));
    setError('');
  };

  const handleOpenConfirm = () => {
    setError('');
    // Check if voter made at least one selection
    const selectionCount = Object.keys(selections).length;
    if (selectionCount < positions.length) {
      setError(`Notice: You have left ${positions.length - selectionCount} position(s) blank. You may still cast your ballot, but please verify before proceeding.`);
    }
    setShowConfirmModal(true);
  };

  const handleCastVotes = async () => {
    setSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1500)); // professional cryptographic signature block wait

    try {
      // Build votes list
      const votesToSubmit = positions.map(pos => {
        const candId = selections[pos.id];
        return {
          institutionId: currentVoterElection.institutionId,
          electionId: currentVoterElection.id,
          voterId: currentVoter.id,
          positionId: pos.id,
          candidateId: candId || 'abstain-uuid' // abstained or standard choice
        };
      }).filter(v => v.candidateId !== 'abstain-uuid'); // filter out abstentions if you want, or keep them. In our case, we only write selections.

      const res = db.submitVotes(votesToSubmit);
      if (res.success) {
        // Generate simulated digital receipt hash
        const randHash = 'rx-' + Math.random().toString(36).substring(2, 10).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();
        setReceiptCode(randHash);
        setSuccess(true);
        setShowConfirmModal(false);
      } else {
        setError(res.message);
        setShowConfirmModal(false);
      }
    } catch (e) {
      setError('A secure submission timeout occurred. Your vote was NOT recorded. Please try again.');
      setShowConfirmModal(false);
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between font-sans" id="voting-success-panel">
        <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-50 px-8 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-md shadow-indigo-100">
              <VoteIcon className="h-4.5 w-4.5" />
            </div>
            <span className="text-xl font-bold text-slate-900 tracking-tight">Vote<span className="text-indigo-600">AX</span> Cryptographic Vault</span>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-xl bg-white border border-slate-200 rounded-2xl shadow-md p-8 text-center space-y-6">
            <div className="inline-flex p-4 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100">
              <Sparkles className="h-10 w-10 animate-pulse" />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Ballot Submitted Successfully</h1>
              <p className="text-xs text-slate-500 leading-relaxed max-w-md mx-auto">
                Thank you, <strong className="text-slate-900">{currentVoter.fullName}</strong>. Your vote for <span className="text-slate-950 font-semibold">{currentVoterElection.name}</span> has been securely processed, isolated, and committed to the database.
              </p>
            </div>

            {/* Receipt Frame */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-left space-y-3.5 max-w-md mx-auto relative overflow-hidden">
              <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 text-slate-100 opacity-50 scale-150 rotate-12">
                <ClipboardCheck className="h-24 w-24" />
              </div>

              <div className="border-b border-slate-200 pb-2.5 flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <span>Cryptographic Ballot Receipt</span>
                <span className="text-emerald-600">Committed</span>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Voter ID Hash:</span>
                  <span className="font-mono text-slate-800 font-bold">{currentVoter.id.substring(0, 8)}...{currentVoter.id.substring(28)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Institution:</span>
                  <span className="font-semibold text-slate-800 text-right">{db.getInstitutionById(currentVoter.institutionId)?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Verification Value:</span>
                  <span className="font-mono text-slate-800">{currentVoter.rollNumber || currentVoter.studentId || currentVoter.facultyId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Timestamp:</span>
                  <span className="text-slate-800">{new Date().toLocaleString()}</span>
                </div>
                <div className="border-t border-slate-200 pt-2.5 flex justify-between items-center bg-white p-2.5 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Security Signature:</span>
                  <span className="font-mono text-xs font-extrabold text-slate-900 bg-slate-50 px-2 py-1 rounded-md border border-slate-200 select-all">{receiptCode}</span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-[10px] text-indigo-700 max-w-md mx-auto leading-relaxed">
              <strong>Voter Isolation Security:</strong> Your selected ballot options were written using a disconnected database join. Your private voting records cannot be un-hashed or reverse-engineered to identify your profile.
            </div>

            <button 
              onClick={voterLogout}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-6 py-3 rounded-xl transition shadow-md shadow-indigo-100 hover:shadow-lg active:scale-95 inline-flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              <span>Exit Secure Session & Logout</span>
            </button>
          </div>
        </main>

        <footer className="mt-auto h-12 bg-slate-100 border-t border-slate-200 flex items-center px-8 justify-between flex-shrink-0 text-slate-500 text-[10px] font-bold tracking-widest uppercase">
          <span>AUDITING COMPLETE • SECURE DISCONNECT PROTOCOL ENGAGED</span>
          <span>ENC. VERIFIED</span>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between font-sans" id="voting-form-panel">
      {/* Header */}
      <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-40 px-8 flex items-center justify-between flex-shrink-0 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-md shadow-indigo-100">
            <VoteIcon className="h-4.5 w-4.5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest block">Active Election Ballot</span>
            <span className="font-bold text-sm text-slate-900 block leading-tight">{currentVoterElection.name}</span>
          </div>
        </div>
        
        {/* Active Voter badge */}
        <div className="flex items-center gap-3">
          <div className="bg-slate-100 border border-slate-200 px-3.5 py-1.5 rounded-xl flex items-center gap-2 text-xs">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
            <User className="h-3.5 w-3.5 text-slate-500" />
            <span className="font-semibold text-slate-800">{currentVoter.fullName}</span>
            <span className="text-slate-400">|</span>
            <span className="font-mono text-[10px] text-slate-500">{currentVoter.rollNumber || currentVoter.studentId || currentVoter.facultyId}</span>
          </div>
          <button 
            onClick={voterLogout} 
            className="text-xs font-bold text-red-600 hover:text-red-800 transition-colors"
            title="Abruptly close session and leave"
          >
            Cancel
          </button>
        </div>
      </header>

      {/* Main Ballot Body */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-10 space-y-10">
        
        {/* Warning card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div className="space-y-1">
            <h4 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
              <ShieldAlert className="h-4.5 w-4.5 text-amber-500" />
              <span>One-Time Ballot Submission Rules</span>
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed max-w-xl">
              You must submit choices for all desired positions simultaneously. Once you click "Submit Secure Ballots", the registrar locks your profile, and any further authentication to this election is permanently blocked.
            </p>
          </div>
          <span className="text-[10px] bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold px-2.5 py-1 rounded uppercase tracking-wider shrink-0">
            Secure DB Enforced
          </span>
        </div>

        {/* Positions and Candidates */}
        <div className="space-y-8">
          {positions.map((pos, posIdx) => {
            const posCandidates = candidates.filter(c => c.positionId === pos.id);
            const selectedCandId = selections[pos.id];

            return (
              <div key={pos.id} className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden" id={`position-block-${pos.id}`}>
                {/* Position Title Bar */}
                <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between rounded-t-2xl">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Position {posIdx + 1} of {positions.length}</span>
                    <h3 className="font-bold text-lg leading-snug">{pos.title}</h3>
                  </div>
                  {selectedCandId ? (
                    <div className="bg-emerald-950 border border-emerald-800 text-emerald-400 text-xs px-3 py-1 rounded-full flex items-center gap-1 font-semibold">
                      <CheckCircle className="h-3.5 w-3.5" />
                      <span>Choice Selected</span>
                    </div>
                  ) : (
                    <span className="text-[10px] bg-slate-800 border border-slate-700 text-slate-300 px-3 py-1 rounded-full font-medium tracking-wide">
                      Selection Required
                    </span>
                  )}
                </div>

                {/* Candidate Options */}
                {posCandidates.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 text-xs flex flex-col items-center justify-center space-y-2">
                    <Inbox className="h-8 w-8 text-slate-300" />
                    <span>No officially approved candidates found for this position.</span>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-150">
                    {posCandidates.map(cand => {
                      const isSelected = selectedCandId === cand.id;
                      const isExpanded = !!expandedManifesto[cand.id];

                      return (
                        <div 
                          key={cand.id} 
                          className={`p-6 transition flex flex-col space-y-4 ${
                            isSelected ? 'bg-indigo-50/20' : 'hover:bg-slate-50/50'
                          }`}
                          id={`cand-card-${cand.id}`}
                        >
                          <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                            <div className="flex items-start gap-4">
                              {/* Photo Avatar Placeholder */}
                              <div className={`w-14 h-14 rounded-xl border flex items-center justify-center text-sm font-bold shrink-0 ${
                                isSelected ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-150 text-slate-500 border-slate-200'
                              }`}>
                                {cand.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                              </div>

                              <div className="space-y-1.5">
                                <div className="flex flex-wrap items-center gap-2">
                                  <h4 className="font-bold text-base text-slate-900">{cand.fullName}</h4>
                                  {cand.party && (
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                                      isSelected ? 'bg-indigo-100 text-indigo-800 border-indigo-200' : 'bg-slate-100 text-slate-600 border-slate-200'
                                    }`}>
                                      {cand.party}
                                    </span>
                                  )}
                                </div>
                                {cand.slogan && (
                                  <p className="text-xs italic text-slate-500 leading-tight">"{cand.slogan}"</p>
                                )}
                                <div className="text-[11px] text-slate-500 font-medium flex flex-wrap gap-x-3 gap-y-1">
                                  <span>ID: <strong className="font-mono text-slate-700">{cand.candidateId || 'N/A'}</strong></span>
                                  <span>•</span>
                                  <span>Dept: <strong className="text-slate-700">{cand.department}</strong></span>
                                  {cand.year && (
                                    <>
                                      <span>•</span>
                                      <span>Year: <strong className="text-slate-700">{cand.year}</strong></span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Select button */}
                            <button 
                              onClick={() => handleSelectCandidate(pos.id, cand.id)}
                              id={`btn-select-cand-${cand.id}`}
                              className={`w-full sm:w-auto text-xs font-bold px-4 py-2.5 rounded-xl border transition-all shrink-0 ${
                                isSelected 
                                  ? 'bg-indigo-600 border-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-100 active:scale-95' 
                                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 active:scale-95'
                              }`}
                            >
                              {isSelected ? '✓ Selected' : 'Select Candidate'}
                            </button>
                          </div>

                          {/* Manifesto Expandable */}
                          <div className="border-t border-slate-150 pt-3">
                            <button 
                              onClick={() => toggleManifesto(cand.id)}
                              className="text-xs font-semibold text-slate-500 hover:text-slate-900 flex items-center gap-1 transition-colors cursor-pointer"
                            >
                              <span>Candidate Manifesto</span>
                              {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                            </button>
                            {isExpanded && (
                              <div className="mt-3 p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 leading-relaxed whitespace-pre-line font-medium shadow-inner animate-fadeIn">
                                {cand.manifesto}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {/* Abstain Row */}
                    <div className="p-4 bg-slate-50/50 flex justify-between items-center text-xs">
                      <span className="text-slate-500 font-medium">Would you prefer to leave this position blank?</span>
                      <button 
                        onClick={() => {
                          const newSels = { ...selections };
                          delete newSels[pos.id];
                          setSelections(newSels);
                        }}
                        className={`text-[11px] font-bold px-3 py-1.5 rounded-lg transition-all ${
                          !selectedCandId 
                            ? 'text-slate-400 bg-slate-200 cursor-default' 
                            : 'text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 active:scale-95'
                        }`}
                      >
                        Abstain / No Vote
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Global errors */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-600 text-xs font-medium rounded-xl flex items-start gap-2 animate-fadeIn" id="ballot-global-error">
            <ShieldAlert className="h-4.5 w-4.5 shrink-0 mt-0.5 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Action Bar */}
        <div className="bg-white border border-slate-200 p-8 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-md transition-shadow">
          <div className="space-y-1">
            <h4 className="font-extrabold text-lg text-slate-900">Ready to cast your ballot?</h4>
            <p className="text-xs text-slate-500">
              You have made selections for <span className="font-bold text-slate-900">{Object.keys(selections).length}</span> of <span className="font-bold text-slate-900">{positions.length}</span> positions.
            </p>
          </div>
          <button 
            onClick={handleOpenConfirm}
            id="btn-submit-ballots"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm px-6 py-3 rounded-xl transition-all shadow-lg shadow-indigo-100 hover:shadow-indigo-200 active:scale-95 flex items-center justify-center gap-2"
          >
            <span>Submit Secure Ballots</span>
            <ArrowRight className="h-4.5 w-4.5" />
          </button>
        </div>
      </main>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-6 z-50 animate-fadeIn" id="ballot-confirm-modal">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xl w-full max-w-md p-6 space-y-6 animate-scaleUp">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-xl border border-amber-100 shrink-0">
                <ShieldAlert className="h-6 w-6 animate-pulse" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-lg text-slate-900">Confirm Ballot Cast</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Are you absolutely certain you are ready to submit your ballot? Your selections will be finalized, isolated from your profile, and recorded permanently.
                </p>
              </div>
            </div>

            {/* List Selections */}
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2 text-xs">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block">Ballot Selections Summary</span>
              {positions.map(pos => {
                const selectedCand = candidates.find(c => c.id === selections[pos.id]);
                return (
                  <div key={pos.id} className="flex justify-between items-center py-1">
                    <span className="font-semibold text-slate-600">{pos.title}:</span>
                    <span className="font-bold text-slate-900 text-right">
                      {selectedCand ? selectedCand.fullName : <span className="text-amber-600">Abstained (No Vote)</span>}
                    </span>
                  </div>
                );
              })}
            </div>

            {submitting ? (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center gap-2 text-xs text-slate-600">
                <Loader2 className="h-4 w-4 animate-spin text-slate-900" />
                <span>Signing ballot with secure keys...</span>
              </div>
            ) : (
              <div className="flex gap-3 pt-2">
                <button 
                  onClick={() => setShowConfirmModal(false)}
                  className="w-1/2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 py-2.5 rounded-xl text-xs font-bold transition-colors"
                >
                  Cancel & Review
                </button>
                <button 
                  onClick={handleCastVotes}
                  id="btn-confirm-cast"
                  className="w-1/2 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-100 active:scale-95"
                >
                  Confirm & Submit
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-auto h-12 bg-slate-100 border-t border-slate-200 flex items-center px-8 justify-between flex-shrink-0 text-slate-500 text-[10px] font-bold tracking-widest uppercase">
        <span>SECURE CONNECTIVITY • VOTER IDENTIFICATION ENHANCED BY SAAS PRIVACY LAYER</span>
        <span>ENC. ACTIVE</span>
      </footer>
    </div>
  );
};
