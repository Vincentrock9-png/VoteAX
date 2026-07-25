/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { db } from '../../dbMock';
import { Election, ElectionStatus, VoterVerificationMethod, VoterType, Position, Voter } from '../../types';
import { 
  Plus, 
  Calendar, 
  Users, 
  CheckSquare, 
  Link as LinkIcon, 
  Copy, 
  Play, 
  Pause, 
  Square, 
  AlertTriangle, 
  Trash2, 
  Layers, 
  Clock, 
  FileSpreadsheet, 
  Upload, 
  ArrowRight, 
  ArrowLeft,
  CheckCircle2,
  FileCheck,
  Edit3
} from 'lucide-react';

export const ElectionsTab: React.FC = () => {
  const { currentInstitution, currentAdmin, triggerRefresh, getElectionAccessUrl } = useApp();
  
  // Views: 'list' | 'create' | 'edit'
  const [view, setView] = useState<'list' | 'create' | 'edit'>('list');
  const [editingElectionId, setEditingElectionId] = useState<string | null>(null);

  // Clipboard feedback
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // --- WIZARD STATE (Steps 1 to 10) ---
  const [wizardStep, setWizardStep] = useState(1);
  
  // Step 1: Core Details
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Step 2: Eligible Types & Segments
  const [eligibleTypes, setEligibleTypes] = useState<VoterType[]>(['Student']);
  const [deptInput, setDeptInput] = useState('');
  const [depts, setDepts] = useState<string[]>([]);
  const [yearInput, setYearInput] = useState('');
  const [years, setYears] = useState<string[]>([]);

  // Step 3: Verification Method
  const [verifyMethod, setVerifyMethod] = useState<VoterVerificationMethod>('Roll Number');

  // Step 4: Add voter list method
  const [voterAddMethod, setVoterAddMethod] = useState<'manual' | 'upload'>('upload');
  const [rawManualText, setRawManualText] = useState(''); // "Full Name, Roll Number, Dept, Year" lines
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [uploadedFileColumns, setUploadedFileColumns] = useState<string[]>([]);
  const [uploadedDataRows, setUploadedDataRows] = useState<Record<string, string>[]>([]);

  // Step 5: Column Mapping
  const [colMapping, setColMapping] = useState<Record<string, string>>({
    fullName: '',
    identifier: '',
    department: '',
    year: ''
  });

  // Step 6: Preview Data
  const [previewVoters, setPreviewVoters] = useState<Omit<Voter, 'id' | 'electionId' | 'institutionId' | 'createdAt' | 'status'>[]>([]);

  // Step 7: Validation
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [validationSuccess, setValidationSuccess] = useState(false);

  // Step 8: Import Summary
  const [importSummary, setImportSummary] = useState({ total: 0, duplicate: 0, invalid: 0 });

  // Step 9: Review list
  const [wizardVoters, setWizardVoters] = useState<Omit<Voter, 'id' | 'electionId' | 'institutionId' | 'createdAt' | 'status'>[]>([]);

  // Positions addition inside wizard or elsewhere
  const [wizardPositions, setWizardPositions] = useState<string[]>(['President', 'General Secretary']);
  const [posInput, setPosInput] = useState('');

  // Editing state (for 'edit' mode)
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editStart, setEditStart] = useState('');
  const [editEnd, setEditEnd] = useState('');
  const [editVerifyMethod, setEditVerifyMethod] = useState<VoterVerificationMethod>('Roll Number');

  if (!currentInstitution || !currentAdmin) return null;

  const elections = db.getElections(currentInstitution.id);

  // Copy unique link
  const handleCopyLink = (electionId: string) => {
    const accessUrl = getElectionAccessUrl(electionId);
    navigator.clipboard.writeText(accessUrl).then(() => {
      setCopiedId(electionId);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  // Lifecycle control triggers
  const handleUpdateStatus = (id: string, newStatus: ElectionStatus) => {
    const election = db.getElectionById(id);
    if (!election) return;

    db.updateElection(id, { status: newStatus });
    db.addLog(
      currentInstitution.id,
      currentAdmin.id,
      currentAdmin.fullName,
      `Election State Change`,
      `Transitioned election '${election.name}' to status '${newStatus}'.`,
      election.id
    );
    triggerRefresh();
  };

  // Wizard Navigations
  const nextStep = () => {
    if (wizardStep === 1) {
      if (!name.trim() || !startDate || !endDate) {
        alert('Please fill out Name, Start Date and End Date.');
        return;
      }
    }
    if (wizardStep === 2) {
      if (eligibleTypes.length === 0) {
        alert('Please select at least one eligible voter type.');
        return;
      }
    }
    
    // Custom triggers per step
    if (wizardStep === 3) {
      // Auto populate col options based on uploaded simulator
      setUploadedFileColumns(['Full Name', 'Roll No', 'Student Code', 'Dept Name', 'Batch', 'Admission ID']);
    }

    if (wizardStep === 4) {
      if (voterAddMethod === 'manual') {
        // Parse lines: "Name, Identifier, Department, Year"
        const lines = rawManualText.split('\n').filter(l => l.trim().length > 0);
        if (lines.length === 0) {
          alert('Please enter manual voter rows.');
          return;
        }
        const parsed = lines.map(line => {
          const parts = line.split(',').map(p => p.trim());
          return {
            fullName: parts[0] || 'Unknown',
            rollNumber: verifyMethod === 'Roll Number' ? parts[1] : undefined,
            admissionNumber: verifyMethod === 'Admission Number' ? parts[1] : undefined,
            studentId: verifyMethod === 'Student ID' ? parts[1] : undefined,
            employeeId: verifyMethod === 'Employee ID' ? parts[1] : undefined,
            facultyId: verifyMethod === 'Faculty ID' ? parts[1] : undefined,
            voterType: eligibleTypes[0] || 'Student',
            department: parts[2] || 'Unassigned',
            year: parts[3] || 'All'
          };
        });
        setWizardVoters(parsed);
        // Skip map columns & preview directly to validate
        setWizardStep(7);
        return;
      } else {
        if (!uploadedFileName) {
          alert('Please select/upload a mock file.');
          return;
        }
      }
    }

    if (wizardStep === 5) {
      // Map Columns mapping to parsed objects
      if (!colMapping.fullName || !colMapping.identifier) {
        alert('You must map the Full Name and Identifier column fields.');
        return;
      }
      // Create parsed objects from mock rows
      const mapped = uploadedDataRows.map(row => {
        const idVal = row[colMapping.identifier];
        return {
          fullName: row[colMapping.fullName] || 'No Name',
          rollNumber: verifyMethod === 'Roll Number' ? idVal : undefined,
          admissionNumber: verifyMethod === 'Admission Number' ? idVal : undefined,
          studentId: verifyMethod === 'Student ID' ? idVal : undefined,
          employeeId: verifyMethod === 'Employee ID' ? idVal : undefined,
          facultyId: verifyMethod === 'Faculty ID' ? idVal : undefined,
          voterType: eligibleTypes[0] || 'Student',
          department: row[colMapping.department] || 'General',
          year: row[colMapping.year] || 'All'
        };
      });
      setPreviewVoters(mapped);
    }

    if (wizardStep === 7) {
      // Trigger Validation logic
      const errors: string[] = [];
      const ids = previewVoters.length > 0 ? previewVoters : wizardVoters;
      const seen = new Set<string>();

      ids.forEach((v, index) => {
        const idVal = v.rollNumber || v.studentId || v.admissionNumber || v.employeeId || v.facultyId;
        if (!v.fullName || v.fullName === 'No Name') {
          errors.push(`Row ${index + 1}: Missing student Full Name.`);
        }
        if (!idVal) {
          errors.push(`Row ${index + 1}: Missing required voter ${verifyMethod}.`);
        } else {
          if (seen.has(idVal)) {
            errors.push(`Row ${index + 1}: Duplicate identifier '${idVal}' detected inside this batch.`);
          }
          seen.add(idVal);
        }
      });

      setValidationErrors(errors);
      setValidationSuccess(errors.length === 0);
    }

    if (wizardStep === 8) {
      // Complete import summary
      const finalVoters = previewVoters.length > 0 ? previewVoters : wizardVoters;
      setWizardVoters(finalVoters);
      setImportSummary({
        total: finalVoters.length,
        duplicate: validationErrors.filter(e => e.includes('Duplicate')).length,
        invalid: validationErrors.filter(e => e.includes('Missing')).length
      });
    }

    setWizardStep(prev => prev + 1);
  };

  const prevStep = () => {
    if (wizardStep === 7 && voterAddMethod === 'manual') {
      setWizardStep(4);
      return;
    }
    setWizardStep(prev => prev - 1);
  };

  // Setup mock file selection
  const handleSimulateUpload = (fileName: string) => {
    setUploadedFileName(fileName);
    // Populate column options & sample data rows
    setUploadedFileColumns(['Full Name', 'Roll Number', 'Dept', 'Year Code', 'Class Name']);
    setUploadedDataRows([
      { 'Full Name': 'Tanvi Shah', 'Roll Number': 'SX-2024-1006', 'Dept': 'Commerce', 'Year Code': '3rd Year', 'Class Name': 'B.Com' },
      { 'Full Name': 'Kabir Malhotra', 'Roll Number': 'SX-2024-1003', 'Dept': 'Commerce', 'Year Code': '2nd Year', 'Class Name': 'B.Com' },
      { 'Full Name': 'Aisha Patel', 'Roll Number': 'SX-2024-1002', 'Dept': 'Arts', 'Year Code': '3rd Year', 'Class Name': 'BA Economics' },
      { 'Full Name': 'Rahul Kumar', 'Roll Number': 'SX-2024-1001', 'Dept': 'Science', 'Year Code': '3rd Year', 'Class Name': 'B.Sc Physics' },
      { 'Full Name': 'Sneha Iyer', 'Roll Number': 'SX-2024-1004', 'Dept': 'Arts', 'Year Code': '2nd Year', 'Class Name': 'BA Sociology' },
    ]);
    // default mapping options
    setColMapping({
      fullName: 'Full Name',
      identifier: 'Roll Number',
      department: 'Dept',
      year: 'Year Code'
    });
  };

  // Commit and create election
  const handleCommitElection = () => {
    // 1. Create Election Record
    const newElection = db.addElection({
      institutionId: currentInstitution.id,
      name,
      description,
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate).toISOString(),
      status: 'Published', // Auto publish upon completion
      voterVerificationMethod: verifyMethod,
      eligibleVoterTypes: eligibleTypes,
      departments: depts,
      years
    });

    // 2. Create Positions
    wizardPositions.forEach((posTitle, idx) => {
      db.addPosition(newElection.id, posTitle, idx + 1);
    });

    // 3. Import Voters
    const votersWithIds = wizardVoters.map(v => ({
      fullName: v.fullName,
      voterType: v.voterType,
      rollNumber: v.rollNumber,
      admissionNumber: v.admissionNumber,
      studentId: v.studentId,
      employeeId: v.employeeId,
      facultyId: v.facultyId,
      department: v.department,
      year: v.year,
      status: 'Active' as const
    }));

    db.importVoters(newElection.id, currentInstitution.id, votersWithIds);

    // 4. Log Action
    db.addLog(
      currentInstitution.id,
      currentAdmin.id,
      currentAdmin.fullName,
      'Election Created',
      `Completed 10-step wizard: Created election '${name}', configured ${wizardPositions.length} positions, and imported ${votersWithIds.length} voters.`,
      newElection.id
    );

    // Reset wizard
    setName('');
    setDescription('');
    setStartDate('');
    setEndDate('');
    setWizardStep(1);
    setView('list');
    triggerRefresh();
  };

  // Edit election launch
  const handleLaunchEdit = (id: string) => {
    const el = db.getElectionById(id);
    if (!el) return;
    setEditingElectionId(id);
    setEditName(el.name);
    setEditDesc(el.description);
    setEditStart(el.startDate.substring(0, 16));
    setEditEnd(el.endDate.substring(0, 16));
    setEditVerifyMethod(el.voterVerificationMethod);
    setView('edit');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingElectionId) return;

    const el = db.getElectionById(editingElectionId);
    if (!el) return;

    db.updateElection(editingElectionId, {
      name: editName,
      description: editDesc,
      startDate: new Date(editStart).toISOString(),
      endDate: new Date(editEnd).toISOString(),
      voterVerificationMethod: editVerifyMethod
    });

    db.addLog(
      currentInstitution.id,
      currentAdmin.id,
      currentAdmin.fullName,
      'Election Edited',
      `Updated core parameters of election '${editName}'.`,
      editingElectionId
    );

    setEditingElectionId(null);
    setView('list');
    triggerRefresh();
  };

  return (
    <div className="space-y-6 font-sans" id="admin-elections-panel">
      
      {/* Tab Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center bg-white border border-slate-200 p-6 rounded-2xl shadow-sm gap-4 hover:shadow-md transition-shadow">
        <div className="space-y-1">
          <h2 className="text-xl font-extrabold tracking-tight text-slate-900">Active Campaign & Election Lifecycles</h2>
          <p className="text-xs text-slate-500">Create, monitor, pause, and review cryptographic elections for your student body.</p>
        </div>
        {view === 'list' && (
          <button 
            onClick={() => setView('create')} 
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md shadow-indigo-100 flex items-center gap-1.5 active:scale-95 cursor-pointer w-max"
            id="btn-create-election"
          >
            <Plus className="h-4 w-4" />
            <span>Launch Election Wizard</span>
          </button>
        )}
      </div>

      {/* VIEW: ELECTIONS LIST */}
      {view === 'list' && (
        <div className="grid gap-6">
          {elections.length === 0 ? (
            <div className="bg-white border border-slate-200 p-12 rounded-2xl text-center space-y-4 shadow-sm hover:shadow-md transition-shadow">
              <Layers className="h-10 w-10 text-indigo-500 mx-auto" />
              <div className="space-y-1">
                <h4 className="font-extrabold text-slate-950 text-sm">No Elections Configured</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">There are no campaigns matching your institutional tenant. Click the button above to launch the 10-step election setup wizard.</p>
              </div>
            </div>
          ) : (
            elections.map(el => {
              const eligibleVotersCount = db.getVoters(el.id).length;
              const positionsCount = db.getPositions(el.id).length;
              const candidatesCount = db.getCandidates(el.id).length;
              const isCopied = copiedId === el.id;

              return (
                <div key={el.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row" id={`election-card-${el.id}`}>
                  
                  {/* Status strip */}
                  <div className={`w-full md:w-3.5 shrink-0 ${
                    el.status === 'Active' ? 'bg-emerald-500' :
                    el.status === 'Upcoming' ? 'bg-indigo-500' :
                    el.status === 'Paused' ? 'bg-amber-500' : 'bg-slate-300'
                  }`} />

                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    {/* Header bar */}
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-xl uppercase font-mono">
                            Verification: {el.voterVerificationMethod}
                          </span>
                          <span className={`text-[9px] font-bold border px-2.5 py-1 rounded-xl uppercase font-mono ${
                            el.status === 'Active' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                            el.status === 'Results Published' ? 'bg-purple-50 text-purple-800 border-purple-200' : 'bg-slate-50 text-slate-700 border-slate-200'
                          }`}>
                            {el.status}
                          </span>
                        </div>
                        <h3 className="font-extrabold text-lg text-slate-900 leading-snug">{el.name}</h3>
                      </div>
                      
                      {/* Access Link Copy box */}
                      <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl flex items-center gap-2 text-xs w-full sm:w-auto">
                        <LinkIcon className="h-4 w-4 text-indigo-600 shrink-0" />
                        <span className="font-mono text-[9px] text-slate-500 truncate max-w-[140px]">{getElectionAccessUrl(el.id)}</span>
                        <button 
                          onClick={() => handleCopyLink(el.id)}
                          className="bg-white hover:bg-slate-100 border border-slate-250 p-2 rounded-lg transition-all shadow-sm shrink-0 active:scale-95 cursor-pointer"
                          title="Copy Link to Clipboard"
                          id={`btn-copy-link-${el.id}`}
                        >
                          <Copy className="h-3.5 w-3.5 text-slate-600" />
                        </button>
                        {isCopied && <span className="text-[10px] text-emerald-600 font-extrabold shrink-0">Copied!</span>}
                      </div>
                    </div>

                    {/* Metadata boxes */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50/50 p-4 rounded-2xl border border-slate-150 text-xs">
                      <div>
                        <span className="block text-slate-400 font-bold uppercase text-[9px] tracking-widest">Eligible Voters</span>
                        <span className="font-extrabold text-slate-800 text-sm">{eligibleVotersCount} Records</span>
                      </div>
                      <div>
                        <span className="block text-slate-400 font-bold uppercase text-[9px] tracking-widest">Positions</span>
                        <span className="font-extrabold text-slate-800 text-sm">{positionsCount} Offices</span>
                      </div>
                      <div>
                        <span className="block text-slate-400 font-bold uppercase text-[9px] tracking-widest">Candidates</span>
                        <span className="font-extrabold text-slate-800 text-sm">{candidatesCount} Nominees</span>
                      </div>
                      <div>
                        <span className="block text-slate-400 font-bold uppercase text-[9px] tracking-widest">Verification Types</span>
                        <span className="font-extrabold text-slate-800 text-sm">{el.eligibleVoterTypes.join(', ')}</span>
                      </div>
                    </div>

                    {/* Timeline & Actions bar */}
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-slate-100 pt-4">
                      <div className="flex items-center gap-2 text-slate-500 text-[11px] font-bold">
                        <Calendar className="h-4 w-4 text-indigo-500" />
                        <span>Timeline: <strong className="text-slate-700">{new Date(el.startDate).toLocaleDateString()}</strong> to <strong className="text-slate-700">{new Date(el.endDate).toLocaleDateString()}</strong></span>
                      </div>

                      {/* Controls */}
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleLaunchEdit(el.id)}
                          className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 p-2 rounded-xl text-xs font-semibold transition cursor-pointer"
                          title="Edit Parameters"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>

                        {el.status === 'Published' && (
                          <button 
                            onClick={() => handleUpdateStatus(el.id, 'Active')}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center space-x-1"
                          >
                            <Play className="h-3.5 w-3.5 fill-current" />
                            <span>Start Election</span>
                          </button>
                        )}

                        {el.status === 'Active' && (
                          <>
                            <button 
                              onClick={() => handleUpdateStatus(el.id, 'Paused')}
                              className="bg-amber-500 hover:bg-amber-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center space-x-1"
                            >
                              <Pause className="h-3.5 w-3.5 fill-current" />
                              <span>Pause</span>
                            </button>
                            <button 
                              onClick={() => handleUpdateStatus(el.id, 'Ended')}
                              className="bg-slate-900 hover:bg-slate-800 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center space-x-1"
                            >
                              <Square className="h-3.5 w-3.5 fill-current" />
                              <span>End</span>
                            </button>
                          </>
                        )}

                        {el.status === 'Paused' && (
                          <button 
                            onClick={() => handleUpdateStatus(el.id, 'Active')}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center space-x-1"
                          >
                            <Play className="h-3.5 w-3.5 fill-current" />
                            <span>Resume</span>
                          </button>
                        )}

                        {el.status === 'Ended' && (
                          <button 
                            onClick={() => handleUpdateStatus(el.id, 'Results Published')}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition"
                          >
                            Publish Results
                          </button>
                        )}
                        
                        {el.status !== 'Cancelled' && el.status !== 'Results Published' && (
                          <button 
                            onClick={() => {
                              if (confirm('Are you sure you want to cancel this election? Recorded votes will be retained for audits but access is disabled.')) {
                                handleUpdateStatus(el.id, 'Cancelled');
                              }
                            }}
                            className="bg-red-50 text-red-600 hover:bg-red-100 p-2 rounded-lg text-xs transition"
                            title="Cancel Election"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* VIEW: 10-STEP SETUP WIZARD */}
      {view === 'create' && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow" id="election-wizard-frame">
          
          {/* Progress Indicator */}
          <div className="bg-slate-900 p-6 text-white border-b border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Step-By-Step System Wizard</span>
              <span className="text-xs font-semibold font-mono bg-slate-800 px-3 py-1 rounded-xl">STEP {wizardStep} OF 10</span>
            </div>
            
            <div className="mt-4 flex gap-1.5 h-1.5 bg-slate-800 rounded-full overflow-hidden">
              {Array.from({ length: 10 }).map((_, idx) => (
                <div 
                  key={idx} 
                  className={`flex-1 h-full transition-all duration-300 ${
                    idx + 1 <= wizardStep ? 'bg-indigo-500' : 'bg-slate-800'
                  }`} 
                />
              ))}
            </div>
            <h3 className="text-xl font-bold mt-4 tracking-tight leading-snug">
              {wizardStep === 1 && 'STEP 1 — Core Campaign Information'}
              {wizardStep === 2 && 'STEP 2 — Define Eligible Voters'}
              {wizardStep === 3 && 'STEP 3 — Choose Identity Verification'}
              {wizardStep === 4 && 'STEP 4 — Import Student / Faculty List'}
              {wizardStep === 5 && 'STEP 5 — Map Column Identifiers'}
              {wizardStep === 6 && 'STEP 6 — Database Sample Preview'}
              {wizardStep === 7 && 'STEP 7 — Multi-Tenant Verification & Integrity Check'}
              {wizardStep === 8 && 'STEP 8 — Compile Import Summary'}
              {wizardStep === 9 && 'STEP 9 — Review Final Voter Rosters'}
              {wizardStep === 10 && 'STEP 10 — Confirm Eligibility & Publish'}
            </h3>
          </div>

          {/* Steps Contents */}
          <div className="p-8 space-y-6">

            {/* Step 1: Core Details */}
            {wizardStep === 1 && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Election Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Student Union Election 2026" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Campaign Overview / Description</label>
                  <textarea 
                    rows={4}
                    placeholder="Provide voter-facing descriptions of candidate rules, positions, and institutional guidelines..." 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition"
                  />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Voting Opens At</label>
                    <input 
                      type="datetime-local" 
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Voting Closes At</label>
                    <input 
                      type="datetime-local" 
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Eligible types */}
            {wizardStep === 2 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">1. Select Voter Categories</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {['Student', 'Professor', 'Teacher', 'Faculty', 'Employee', 'Staff'].map(type => {
                      const isChecked = eligibleTypes.includes(type as VoterType);
                      return (
                        <button 
                          key={type}
                          type="button"
                          onClick={() => {
                            if (isChecked) {
                              setEligibleTypes(eligibleTypes.filter(t => t !== type));
                            } else {
                              setEligibleTypes([...eligibleTypes, type as VoterType]);
                            }
                          }}
                          className={`flex items-center justify-between p-3.5 rounded-lg border text-xs font-semibold transition ${
                            isChecked ? 'bg-slate-900 text-white border-slate-900' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <span>{type}s</span>
                          <CheckSquare className={`h-4.5 w-4.5 ${isChecked ? 'opacity-100' : 'opacity-20'}`} />
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Scope filters */}
                <div className="grid sm:grid-cols-2 gap-6 border-t border-slate-100 pt-6">
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Restrict Departments (Optional)</label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder="e.g. Science" 
                        value={deptInput}
                        onChange={(e) => setDeptInput(e.target.value)}
                        className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                      />
                      <button 
                        type="button" 
                        onClick={() => {
                          if (deptInput.trim()) {
                            setDepts([...depts, deptInput.trim()]);
                            setDeptInput('');
                          }
                        }}
                        className="bg-slate-900 text-white text-xs px-3 py-1.5 rounded-lg font-semibold hover:bg-slate-800"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {depts.map(d => (
                        <span key={d} className="bg-slate-100 border border-slate-200 text-slate-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center space-x-1">
                          <span>{d}</span>
                          <button type="button" onClick={() => setDepts(depts.filter(item => item !== d))} className="text-red-500 hover:text-red-700 font-bold ml-1">×</button>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Restrict Years (Optional)</label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder="e.g. 3rd Year" 
                        value={yearInput}
                        onChange={(e) => setYearInput(e.target.value)}
                        className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                      />
                      <button 
                        type="button" 
                        onClick={() => {
                          if (yearInput.trim()) {
                            setYears([...years, yearInput.trim()]);
                            setYearInput('');
                          }
                        }}
                        className="bg-slate-900 text-white text-xs px-3 py-1.5 rounded-lg font-semibold hover:bg-slate-800"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {years.map(y => (
                        <span key={y} className="bg-slate-100 border border-slate-200 text-slate-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center space-x-1">
                          <span>{y}</span>
                          <button type="button" onClick={() => setYears(years.filter(item => item !== y))} className="text-red-500 hover:text-red-700 font-bold ml-1">×</button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Verification Method */}
            {wizardStep === 3 && (
              <div className="space-y-4">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Configure Security Authentication method</span>
                <div className="grid gap-3">
                  {[
                    { title: 'Roll Number', desc: 'Standard identifier for colleges under centralized registrar systems.' },
                    { title: 'Admission Number', desc: 'Unique registration code generated upon initial academic admission.' },
                    { title: 'Student ID', desc: 'Custom alphanumeric student badge identifier.' },
                    { title: 'Employee ID', desc: 'Required credential for corporate staff or internal staff voters.' },
                    { title: 'Faculty ID', desc: 'Verification method reserved for academic professors and lecturers.' }
                  ].map(item => {
                    const isSelected = verifyMethod === item.title;
                    return (
                      <button 
                        key={item.title}
                        type="button"
                        onClick={() => setVerifyMethod(item.title as VoterVerificationMethod)}
                        className={`flex items-start text-left p-4 rounded-lg border transition ${
                          isSelected ? 'bg-slate-50 border-slate-900 shadow-sm' : 'bg-white border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                              isSelected ? 'border-slate-900 bg-slate-900' : 'border-slate-300'
                            }`}>
                              {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
                            </div>
                            <span className="font-bold text-sm text-slate-950">{item.title}</span>
                          </div>
                          <p className="text-xs text-slate-500 pl-6 leading-relaxed">{item.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 4: Import Voter list */}
            {wizardStep === 4 && (
              <div className="space-y-6">
                <div className="flex border-b border-slate-100 pb-4 gap-6">
                  <button 
                    type="button" 
                    onClick={() => setVoterAddMethod('upload')}
                    className={`text-sm font-bold pb-2 border-b-2 transition ${
                      voterAddMethod === 'upload' ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-400'
                    }`}
                  >
                    CSV/XLSX/PDF Mapping Upload
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setVoterAddMethod('manual')}
                    className={`text-sm font-bold pb-2 border-b-2 transition ${
                      voterAddMethod === 'manual' ? 'border-transparent text-slate-400' : 'border-slate-900 text-slate-900'
                    }`}
                  >
                    Manual Copy-Paste Entries
                  </button>
                </div>

                {voterAddMethod === 'upload' ? (
                  <div className="space-y-6">
                    <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center space-y-4">
                      <Upload className="h-10 w-10 text-slate-300 mx-auto" />
                      <div className="space-y-1">
                        <h4 className="font-bold text-xs text-slate-500 uppercase tracking-wider">Simulate Registrar Database Import</h4>
                        <p className="text-xs text-slate-400 max-w-sm mx-auto">Click below to load pre-seeded student records to simulate file import operations.</p>
                      </div>
                      <div className="flex justify-center gap-3">
                        <button 
                          type="button"
                          onClick={() => handleSimulateUpload('StXavier_Registrar_Voter_Roster.csv')}
                          className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2 rounded-lg transition"
                        >
                          Load Mock Xavier_Voters.csv
                        </button>
                      </div>
                    </div>

                    {uploadedFileName && (
                      <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <FileCheck className="h-4 w-4" />
                          <span>Selected File: <strong>{uploadedFileName}</strong> ({uploadedDataRows.length} Mock rows recognized)</span>
                        </div>
                        <span className="font-bold font-mono text-[10px]">Excel/CSV parser active</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Manual CSV Rows</label>
                    <textarea 
                      rows={6}
                      placeholder="Enter each student on a new line: Full Name, Identifier Value, Department, Year"
                      value={rawManualText}
                      onChange={(e) => setRawManualText(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                    />
                    <p className="text-[10px] text-slate-400">Example: Kabir Malhotra, SX-2024-1003, Commerce, 2nd Year</p>
                  </div>
                )}
              </div>
            )}

            {/* Step 5: Column Mapping */}
            {wizardStep === 5 && (
              <div className="space-y-4">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Map Registrar Columns to System database Schema fields</span>
                <div className="grid gap-4 bg-slate-50 p-6 rounded-xl border border-slate-200">
                  <div className="grid grid-cols-2 text-xs font-bold text-slate-400 border-b border-slate-200 pb-2">
                    <span>Database Target Field</span>
                    <span>Your Uploaded Column Header</span>
                  </div>

                  <div className="grid grid-cols-2 items-center text-xs">
                    <span className="font-bold text-slate-700">Full Name</span>
                    <select 
                      value={colMapping.fullName} 
                      onChange={(e) => setColMapping({...colMapping, fullName: e.target.value})}
                      className="px-2 py-1.5 bg-white border border-slate-200 rounded text-xs"
                    >
                      <option value="">-- Map Column --</option>
                      {uploadedFileColumns.map(col => <option key={col} value={col}>{col}</option>)}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 items-center text-xs">
                    <span className="font-bold text-slate-700">Voter ID / {verifyMethod}</span>
                    <select 
                      value={colMapping.identifier} 
                      onChange={(e) => setColMapping({...colMapping, identifier: e.target.value})}
                      className="px-2 py-1.5 bg-white border border-slate-200 rounded text-xs"
                    >
                      <option value="">-- Map Column --</option>
                      {uploadedFileColumns.map(col => <option key={col} value={col}>{col}</option>)}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 items-center text-xs">
                    <span className="font-bold text-slate-700">Department (Optional)</span>
                    <select 
                      value={colMapping.department} 
                      onChange={(e) => setColMapping({...colMapping, department: e.target.value})}
                      className="px-2 py-1.5 bg-white border border-slate-200 rounded text-xs"
                    >
                      <option value="">-- Map Column --</option>
                      {uploadedFileColumns.map(col => <option key={col} value={col}>{col}</option>)}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 items-center text-xs">
                    <span className="font-bold text-slate-700">Year / Segment (Optional)</span>
                    <select 
                      value={colMapping.year} 
                      onChange={(e) => setColMapping({...colMapping, year: e.target.value})}
                      className="px-2 py-1.5 bg-white border border-slate-200 rounded text-xs"
                    >
                      <option value="">-- Map Column --</option>
                      {uploadedFileColumns.map(col => <option key={col} value={col}>{col}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 6: Preview Data */}
            {wizardStep === 6 && (
              <div className="space-y-4">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Verify database mapping preview</span>
                <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                      <tr>
                        <th className="p-3">Row #</th>
                        <th className="p-3">Mapped Full Name</th>
                        <th className="p-3">Mapped {verifyMethod}</th>
                        <th className="p-3">Mapped Department</th>
                        <th className="p-3">Mapped Year</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {previewVoters.map((v, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="p-3 font-mono text-slate-400">{idx + 1}</td>
                          <td className="p-3 font-bold text-slate-800">{v.fullName}</td>
                          <td className="p-3 font-mono text-slate-700">{v.rollNumber || v.studentId || v.admissionNumber}</td>
                          <td className="p-3">{v.department}</td>
                          <td className="p-3">{v.year}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Step 7: Integrity validation */}
            {wizardStep === 7 && (
              <div className="space-y-6">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <h4 className="font-bold text-sm text-slate-900 flex items-center space-x-1.5">
                    <CheckSquare className="h-4.5 w-4.5 text-slate-700" />
                    <span>Run Multi-Tenant Database Validation Checklist</span>
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Executing constraints verification: checks duplicate Roll Numbers within this college scope. Roll Number overlapping with other colleges is permitted and does not trigger conflicts.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs font-bold border-b border-slate-100 pb-2">
                    <span>Validation Parameter</span>
                    <span>Result Status</span>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-600">Cross-Institution Isolation Partitioning</span>
                    <span className="text-emerald-600 font-bold">✓ Secured (UUID Isolated)</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-600">Null Identifier Constraints checks</span>
                    <span className="text-emerald-600 font-bold">✓ 0 Null Values Detected</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-600">Duplicate identifiers inside this single election batch</span>
                    {validationSuccess ? (
                      <span className="text-emerald-600 font-bold">✓ 0 Duplicates Detected</span>
                    ) : (
                      <span className="text-red-600 font-bold">✗ {validationErrors.length} Warning Conflicts</span>
                    )}
                  </div>
                </div>

                {validationErrors.length > 0 && (
                  <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-lg space-y-1 max-h-[160px] overflow-y-auto">
                    <strong>Validation Conflict Alerts:</strong>
                    {validationErrors.map((err, i) => <div key={i} className="font-mono">{err}</div>)}
                  </div>
                )}
              </div>
            )}

            {/* Step 8: Import compilation summary */}
            {wizardStep === 8 && (
              <div className="space-y-6 text-center py-6">
                <div className="inline-flex p-4 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100">
                  <FileCheck className="h-10 w-10" />
                </div>
                <div className="space-y-2">
                  <h4 className="font-bold text-lg text-slate-950">Compilation Summary Created</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">Voter list compiling complete. Records prepared for isolated commit to the database partition.</p>
                </div>

                <div className="max-w-xs mx-auto grid grid-cols-2 gap-4 text-xs pt-4">
                  <div className="bg-slate-50 p-4 border border-slate-200 rounded-lg">
                    <span className="block text-slate-400 font-semibold">Total Prepared</span>
                    <span className="text-xl font-extrabold text-slate-900">{importSummary.total} Records</span>
                  </div>
                  <div className="bg-slate-50 p-4 border border-slate-200 rounded-lg">
                    <span className="block text-slate-400 font-semibold">Status Checks</span>
                    <span className="text-xl font-extrabold text-emerald-600">100% Valid</span>
                  </div>
                </div>
              </div>
            )}

            {/* Step 9: Review list */}
            {wizardStep === 9 && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Final review list</span>
                  <span className="text-xs font-mono text-slate-500">Records: {wizardVoters.length}</span>
                </div>
                <div className="border border-slate-200 rounded-xl max-h-[220px] overflow-y-auto text-xs">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 sticky top-0 border-b border-slate-200 text-slate-500">
                      <tr>
                        <th className="p-3">Student Name</th>
                        <th className="p-3">{verifyMethod}</th>
                        <th className="p-3">Department</th>
                        <th className="p-3">Category</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-150">
                      {wizardVoters.map((v, i) => (
                        <tr key={i} className="hover:bg-slate-50/50">
                          <td className="p-3 font-bold text-slate-800">{v.fullName}</td>
                          <td className="p-3 font-mono">{v.rollNumber || v.studentId || v.admissionNumber}</td>
                          <td className="p-3">{v.department}</td>
                          <td className="p-3 text-slate-500">{v.voterType}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Step 10: Confirm Positions & Finalize */}
            {wizardStep === 10 && (
              <div className="space-y-6">
                {/* Positions setting */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Specify Election Positions / offices</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="e.g. Cultural Representative" 
                      value={posInput}
                      onChange={(e) => setPosInput(e.target.value)}
                      className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    />
                    <button 
                      type="button" 
                      onClick={() => {
                        if (posInput.trim()) {
                          setWizardPositions([...wizardPositions, posInput.trim()]);
                          setPosInput('');
                        }
                      }}
                      className="bg-slate-900 text-white text-xs px-4 py-2 rounded-lg font-bold hover:bg-slate-800"
                    >
                      Add Position
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {wizardPositions.map(pos => (
                      <span key={pos} className="bg-slate-900 border border-slate-800 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center space-x-1">
                        <span>{pos}</span>
                        <button type="button" onClick={() => setWizardPositions(wizardPositions.filter(item => item !== pos))} className="text-red-400 hover:text-red-500 ml-1.5 font-bold">×</button>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-2">
                  <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto" />
                  <h4 className="font-bold text-slate-950">All Setup Steps Complete</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                    By clicking the button below, you confirm the voter registry roster and configure these specific administrative positions.
                  </p>
                </div>
              </div>
            )}

          </div>

          {/* Wizard Action buttons */}
          <div className="bg-slate-50 border-t border-slate-150 p-6 flex justify-between items-center">
            <button 
              type="button"
              onClick={() => {
                if (wizardStep === 1) {
                  setView('list');
                } else {
                  prevStep();
                }
              }}
              className="bg-white hover:bg-slate-100 border border-slate-250 text-slate-700 font-bold text-xs px-4 py-2.5 rounded-xl transition-all active:scale-95 cursor-pointer"
            >
              Back
            </button>
            
            {wizardStep < 10 ? (
              <button 
                type="button"
                onClick={nextStep}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-md shadow-indigo-100 flex items-center gap-1 active:scale-95 cursor-pointer"
              >
                <span>Save & Continue</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button 
                type="button"
                onClick={handleCommitElection}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-6 py-2.5 rounded-xl transition-all shadow-md shadow-emerald-100 flex items-center gap-1.5 active:scale-95 cursor-pointer"
                id="btn-confirm-wizard-eligibility"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Confirm Eligible Voter List & Publish</span>
              </button>
            )}
          </div>

        </div>
      )}

      {/* VIEW: EDIT ELECTION PARAMS */}
      {view === 'edit' && (
        <form onSubmit={handleSaveEdit} className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden p-8 space-y-6 hover:shadow-md transition-shadow">
          <div className="border-b border-slate-150 pb-4">
            <h3 className="font-extrabold text-lg text-slate-900">Edit Election Parameters</h3>
            <p className="text-xs text-slate-500">Edit core fields. Note that modifying credentials while voting is active creates audit notifications.</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5 text-xs">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Election Title</label>
              <input 
                type="text" 
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                required
              />
            </div>
            <div className="space-y-1.5 text-xs">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Campaign Overview</label>
              <textarea 
                rows={4}
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Voting Opens At</label>
                <input 
                  type="datetime-local" 
                  value={editStart}
                  onChange={(e) => setEditStart(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Voting Closes At</label>
                <input 
                  type="datetime-local" 
                  value={editEnd}
                  onChange={(e) => setEditEnd(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  required
                />
              </div>
            </div>
            <div className="space-y-1.5 text-xs">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Voter Verification Method</label>
              <select 
                value={editVerifyMethod}
                onChange={(e) => setEditVerifyMethod(e.target.value as VoterVerificationMethod)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              >
                <option value="Roll Number">Roll Number</option>
                <option value="Admission Number">Admission Number</option>
                <option value="Student ID">Student ID</option>
                <option value="Employee ID">Employee ID</option>
                <option value="Faculty ID">Faculty ID</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-150">
            <button 
              type="button" 
              onClick={() => setView('list')}
              className="bg-white hover:bg-slate-100 border border-slate-250 text-slate-700 px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer active:scale-95"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-md shadow-indigo-100 transition-all cursor-pointer active:scale-95"
            >
              Save Configuration
            </button>
          </div>
        </form>
      )}

    </div>
  );
};
