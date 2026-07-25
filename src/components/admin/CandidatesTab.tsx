/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { db } from '../../dbMock';
import { Candidate, CandidateStatus, VoterType } from '../../types';
import { 
  Plus, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  Layers, 
  Eye, 
  HelpCircle, 
  GraduationCap, 
  Award, 
  UserX,
  FileText
} from 'lucide-react';

export const CandidatesTab: React.FC = () => {
  const { currentInstitution, triggerRefresh } = useApp();
  
  // Election Selection
  const elections = db.getElections(currentInstitution?.id || '');
  const [selectedElectionId, setSelectedElectionId] = useState(elections[0]?.id || '');

  // Form toggles
  const [showAddForm, setShowAddForm] = useState(false);

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [candidateId, setCandidateId] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [studentId, setStudentId] = useState('');
  const [voterType, setVoterType] = useState<VoterType>('Student');
  const [department, setDepartment] = useState('');
  const [year, setYear] = useState('');
  const [positionId, setPositionId] = useState('');
  const [party, setParty] = useState('');
  const [slogan, setSlogan] = useState('');
  const [manifesto, setManifesto] = useState('');
  const [introduction, setIntroduction] = useState('');

  if (!currentInstitution) return null;

  const currentElection = selectedElectionId ? db.getElectionById(selectedElectionId) : null;
  const positions = selectedElectionId ? db.getPositions(selectedElectionId) : [];
  const candidates = selectedElectionId ? db.getCandidates(selectedElectionId) : [];

  // Categorize
  const pendingNominees = candidates.filter(c => c.status === 'Pending' || c.status === 'Draft');
  const approvedCandidates = candidates.filter(c => c.status === 'Approved');
  const otherStatus = candidates.filter(c => c.status === 'Rejected' || c.status === 'Disqualified');

  const handleAddNominee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedElectionId) {
      alert('Please select an election.');
      return;
    }
    if (!positionId) {
      alert('Please select the contesting Position.');
      return;
    }
    if (!fullName.trim() || !manifesto.trim()) {
      alert('Nominee Full Name and Manifesto are required.');
      return;
    }

    // Add Nominee (Seeded as PENDING status for Admin Approval workflows!)
    db.addCandidate({
      electionId: selectedElectionId,
      institutionId: currentInstitution.id,
      fullName,
      candidateId: candidateId || `CAND-${Math.floor(Math.random() * 10000)}`,
      rollNumber: rollNumber || undefined,
      studentId: studentId || undefined,
      voterType,
      department,
      year: year || undefined,
      positionId,
      party: party || undefined,
      slogan: slogan || undefined,
      manifesto,
      introduction: introduction || undefined,
      status: 'Pending' // Requires admin approval
    });

    // Reset
    setFullName('');
    setCandidateId('');
    setRollNumber('');
    setStudentId('');
    setDepartment('');
    setYear('');
    setPositionId('');
    setParty('');
    setSlogan('');
    setManifesto('');
    setIntroduction('');
    setShowAddForm(false);
    triggerRefresh();
  };

  const handleUpdateStatus = (id: string, newStatus: CandidateStatus) => {
    const cand = db.getCandidateById(id);
    if (!cand) return;

    db.updateCandidate(id, { status: newStatus });
    db.addLog(
      currentInstitution.id,
      'admin-system-action',
      'System Moderator',
      'Nominee Review Completed',
      `Modified nominee '${cand.fullName}' standing for '${db.getPositions(cand.electionId).find(p => p.id === cand.positionId)?.title}' to status '${newStatus}'.`,
      cand.electionId
    );
    triggerRefresh();
  };

  const handleDeleteCandidate = (id: string) => {
    if (confirm('Are you sure you want to delete this candidate record?')) {
      db.deleteCandidate(id);
      triggerRefresh();
    }
  };

  return (
    <div className="space-y-6 font-sans" id="admin-candidates-panel">
      
      {/* Top Selector Bar */}
      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 hover:shadow-md transition-shadow">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex items-center gap-2 text-slate-850">
            <Award className="h-5 w-5 text-indigo-600" />
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
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md shadow-indigo-100 flex items-center gap-1 active:scale-95 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Register New Nominee</span>
          </button>
        )}
      </div>

      {/* FORM: REGISTER NOMINEE */}
      {showAddForm && selectedElectionId && (
        <form onSubmit={handleAddNominee} className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-4 hover:shadow-md transition-shadow">
          <div className="border-b border-slate-150 pb-3 flex justify-between items-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Register Candidate Nominee</span>
            <button type="button" onClick={() => setShowAddForm(false)} className="text-xs font-bold text-slate-500 hover:text-slate-700 cursor-pointer">Cancel</button>
          </div>

          <div className="grid sm:grid-cols-3 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nominee Full Name</label>
              <input 
                type="text" 
                placeholder="e.g. Priya Sharma" 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Contesting Office / Position</label>
              <select 
                value={positionId}
                onChange={(e) => setPositionId(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                required
              >
                <option value="">-- Select Office --</option>
                {positions.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Candidate ID (Optional)</label>
              <input 
                type="text" 
                placeholder="e.g. CAND-XAV-001" 
                value={candidateId}
                onChange={(e) => setCandidateId(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Voter Type</label>
              <select 
                value={voterType}
                onChange={(e) => setVoterType(e.target.value as VoterType)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              >
                <option value="Student">Student</option>
                <option value="Professor">Professor</option>
                <option value="Teacher">Teacher</option>
                <option value="Faculty">Faculty</option>
                <option value="Employee">Employee</option>
                <option value="Staff">Staff</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Department</label>
              <input 
                type="text" 
                placeholder="e.g. Economics" 
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Year (Optional)</label>
              <input 
                type="text" 
                placeholder="e.g. 3rd Year" 
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Affiliated Party / Group</label>
              <input 
                type="text" 
                placeholder="e.g. Independent Students Forum" 
                value={party}
                onChange={(e) => setParty(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Campaign Motto / Slogan</label>
              <input 
                type="text" 
                placeholder="e.g. Empowering Voices" 
                value={slogan}
                onChange={(e) => setSlogan(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5 text-xs">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Official Manifesto</label>
            <textarea 
              rows={4}
              placeholder="Detail candidate objectives..." 
              value={manifesto}
              onChange={(e) => setManifesto(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              required
            />
          </div>

          <div className="flex justify-end pt-3 border-t border-slate-150">
            <button 
              type="submit" 
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-md shadow-indigo-100 active:scale-95 cursor-pointer"
            >
              Submit Nominee Profile
            </button>
          </div>
        </form>
      )}

      {/* THREE LIST GROUPS: PENDING NOMINEES vs APPROVED CANDIDATES */}
      {selectedElectionId ? (
        <div className="space-y-8">
          
          {/* SECTION 1: PENDING REVIEW */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
              <span className="w-2.5 h-2.5 bg-amber-400 rounded-full animate-pulse"></span>
              <h3 className="font-extrabold text-base text-slate-900">Pending Nominee Approvals ({pendingNominees.length})</h3>
            </div>

            {pendingNominees.length === 0 ? (
              <p className="text-xs text-slate-450 bg-white border border-slate-200 p-6 rounded-2xl text-center shadow-sm">There are no pending student nominee profiles awaiting authentication review.</p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {pendingNominees.map(cand => {
                  const pos = positions.find(p => p.id === cand.positionId);
                  return (
                    <div key={cand.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded uppercase font-mono tracking-wider">
                            Awaiting verification
                          </span>
                          <h4 className="font-extrabold text-base text-slate-900">{cand.fullName}</h4>
                          <span className="text-xs font-semibold text-slate-500">Contesting: <strong className="text-slate-800">{pos?.title || 'N/A'}</strong></span>
                        </div>
                        <div className="text-[10px] bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg font-bold uppercase tracking-wider text-slate-500 font-mono">
                          {cand.candidateId}
                        </div>
                      </div>

                      <p className="text-xs text-slate-550 italic">Motto: "{cand.slogan || 'No Slogan Provided'}"</p>

                      <div className="bg-slate-50 border border-slate-150 p-4 rounded-xl text-xs space-y-1.5">
                        <div>Dept: <span className="font-semibold text-slate-800">{cand.department}</span></div>
                        <div>Year: <span className="font-semibold text-slate-800">{cand.year || 'N/A'}</span></div>
                        <div className="border-t border-slate-200 pt-2 mt-2 font-medium line-clamp-2 leading-relaxed">
                          <strong className="text-slate-700">Manifesto:</strong> {cand.manifesto}
                        </div>
                      </div>

                      {/* Approval buttons */}
                      <div className="flex gap-2 justify-end pt-3 border-t border-slate-150">
                        <button 
                          onClick={() => handleUpdateStatus(cand.id, 'Rejected')}
                          className="bg-red-50 text-red-600 hover:bg-red-100 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                        >
                          Reject Nominee
                        </button>
                        <button 
                          onClick={() => handleUpdateStatus(cand.id, 'Approved')}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 shadow-sm active:scale-95 cursor-pointer"
                        >
                          <CheckCircle className="h-3.5 w-3.5" />
                          <span>Approve Candidate</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* SECTION 2: APPROVED OFFICIAL CANDIDATES */}
          <div className="space-y-4">
            <h3 className="font-extrabold text-base text-slate-900 border-b border-slate-200 pb-2">Approved Official Candidates ({approvedCandidates.length})</h3>

            {approvedCandidates.length === 0 ? (
              <p className="text-xs text-slate-450 bg-white border border-slate-200 p-6 rounded-2xl text-center shadow-sm">No candidates have been approved to represent student ballots in this election yet.</p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {approvedCandidates.map(cand => {
                  const pos = positions.find(p => p.id === cand.positionId);
                  return (
                    <div key={cand.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4 hover:shadow-md transition-shadow" id={`cand-card-${cand.id}`}>
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          {/* Photo Badge */}
                          <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-extrabold text-xs shadow-sm">
                            {cand.fullName.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h4 className="font-extrabold text-sm text-slate-900">{cand.fullName}</h4>
                              <span className="text-[9px] bg-emerald-50 border border-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-lg uppercase tracking-wider font-mono">Ballot Verified</span>
                            </div>
                            <span className="text-xs font-semibold text-slate-500">Contesting: <strong className="text-slate-800">{pos?.title || 'N/A'}</strong></span>
                          </div>
                        </div>
                        <button 
                          onClick={() => handleDeleteCandidate(cand.id)}
                          className="text-red-500 hover:text-red-700 p-1.5 hover:bg-red-50 rounded-xl transition cursor-pointer"
                          title="Delete Record"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-150 text-xs space-y-1.5 leading-relaxed">
                        <div>Party/Affiliation: <strong className="text-slate-800">{cand.party || 'Independent'}</strong></div>
                        {cand.slogan && <div>Motto: <span className="italic text-slate-500">"{cand.slogan}"</span></div>}
                        <div className="border-t border-slate-200 pt-2 mt-2">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block pb-1">Voter Manifesto</span>
                          <p className="text-slate-600 line-clamp-3 leading-snug">{cand.manifesto}</p>
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <button 
                          onClick={() => handleUpdateStatus(cand.id, 'Disqualified')}
                          className="bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-100 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <UserX className="h-3.5 w-3.5" />
                          <span>Disqualify Candidate</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* SECTION 3: REJECTED / DISQUALIFIED STANDINGS */}
          {otherStatus.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-bold text-xs uppercase tracking-widest text-slate-400 border-b border-slate-200 pb-2">Rejected & Disqualified Standings ({otherStatus.length})</h3>
              <div className="grid gap-3 md:grid-cols-3">
                {otherStatus.map(cand => (
                  <div key={cand.id} className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between text-xs opacity-80">
                    <div>
                      <span className="font-bold text-slate-800 block">{cand.fullName}</span>
                      <span className="text-[10px] text-slate-400 block">{cand.party || 'Independent'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-red-600 text-[10px] bg-red-50 border border-red-250 px-2 py-0.5 rounded-lg uppercase font-mono">{cand.status}</span>
                      <button 
                        onClick={() => handleUpdateStatus(cand.id, 'Pending')}
                        className="text-[10px] font-bold text-slate-700 bg-white border border-slate-200 px-2.5 py-1.5 rounded-xl hover:bg-slate-50 transition cursor-pointer"
                      >
                        Re-Review
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      ) : (
        <div className="bg-white border border-slate-200 p-12 rounded-2xl text-center text-slate-400 text-xs shadow-sm">
          Please select or configure an election partition above to manage student candidate profiles.
        </div>
      )}

    </div>
  );
};
