/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { db } from '../../dbMock';
import { Voter, VoterType } from '../../types';
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  Layers, 
  UserPlus, 
  Briefcase, 
  GraduationCap 
} from 'lucide-react';

export const VotersTab: React.FC = () => {
  const { currentInstitution, triggerRefresh, refreshTrigger } = useApp();
  
  // Selection
  const elections = db.getElections(currentInstitution?.id || '');
  const [selectedElectionId, setSelectedElectionId] = useState(elections[0]?.id || '');

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [voterTypeFilter, setVoterTypeFilter] = useState<string>('All');

  // Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [fullName, setFullName] = useState('');
  const [voterType, setVoterType] = useState<VoterType>('Student');
  const [rollNumber, setRollNumber] = useState('');
  const [admissionNumber, setAdmissionNumber] = useState('');
  const [studentId, setStudentId] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [facultyId, setFacultyId] = useState('');
  const [department, setDepartment] = useState('');
  const [year, setYear] = useState('');

  if (!currentInstitution) return null;

  const currentElection = db.getElectionById(selectedElectionId);
  const voters = currentElection ? db.getVoters(currentElection.id) : [];

  // Filter logic
  const filteredVoters = voters.filter(v => {
    const searchLower = searchQuery.toLowerCase();
    const idVal = (v.rollNumber || v.studentId || v.admissionNumber || v.employeeId || v.facultyId || '').toLowerCase();
    const matchesSearch = v.fullName.toLowerCase().includes(searchLower) || idVal.includes(searchLower);
    const matchesType = voterTypeFilter === 'All' || v.voterType === voterTypeFilter;
    return matchesSearch && matchesType;
  });

  const handleAddVoter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedElectionId) {
      alert('Please select or create an election first.');
      return;
    }
    if (!fullName.trim()) {
      alert('Full Name is required.');
      return;
    }

    const verificationMethod = currentElection?.voterVerificationMethod;
    const identifierVal = 
      verificationMethod === 'Roll Number' ? rollNumber :
      verificationMethod === 'Admission Number' ? admissionNumber :
      verificationMethod === 'Student ID' ? studentId :
      verificationMethod === 'Employee ID' ? employeeId : facultyId;

    if (!identifierVal.trim()) {
      alert(`Voter identifier value matching '${verificationMethod}' is required.`);
      return;
    }

    // Call addVoter
    db.addVoter({
      electionId: selectedElectionId,
      institutionId: currentInstitution.id,
      fullName,
      voterType,
      rollNumber: rollNumber || undefined,
      admissionNumber: admissionNumber || undefined,
      studentId: studentId || undefined,
      employeeId: employeeId || undefined,
      facultyId: facultyId || undefined,
      department: department || undefined,
      year: year || undefined,
      status: 'Active'
    });

    // Reset
    setFullName('');
    setRollNumber('');
    setAdmissionNumber('');
    setStudentId('');
    setEmployeeId('');
    setFacultyId('');
    setDepartment('');
    setYear('');
    setShowAddForm(false);
    triggerRefresh();
  };

  const toggleVoterStatus = (voterId: string, currentStatus: 'Active' | 'Inactive') => {
    const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
    db.updateVoter(voterId, { status: newStatus });
    triggerRefresh();
  };

  const handleDeleteVoter = (voterId: string) => {
    if (confirm('Are you sure you want to delete this voter? This action is irreversible.')) {
      db.deleteVoter(voterId);
      triggerRefresh();
    }
  };

  return (
    <div className="space-y-6 font-sans" id="admin-voters-panel">
      
      {/* Selection & Search Bar */}
      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 hover:shadow-md transition-shadow">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex items-center gap-2 text-slate-800">
            <Users className="h-5 w-5 text-indigo-600" />
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
            <span>Add Single Voter Manually</span>
          </button>
        )}
      </div>

      {/* FORM: ADD VOTER MANUALLY */}
      {showAddForm && currentElection && (
        <form onSubmit={handleAddVoter} className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-4 hover:shadow-md transition-shadow">
          <div className="border-b border-slate-150 pb-3 flex justify-between items-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Add Voter Manually</span>
            <button type="button" onClick={() => setShowAddForm(false)} className="text-xs font-bold text-slate-500 hover:text-slate-700 cursor-pointer">Cancel</button>
          </div>

          <div className="grid sm:grid-cols-3 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Full Name</label>
              <input 
                type="text" 
                placeholder="e.g. Rahul Kumar" 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Voter Category</label>
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

            {/* Verification-specific input field */}
            {currentElection.voterVerificationMethod === 'Roll Number' && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Roll Number</label>
                <input 
                  type="text" 
                  placeholder="e.g. SX-2024-1001" 
                  value={rollNumber}
                  onChange={(e) => setRollNumber(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  required
                />
              </div>
            )}

            {currentElection.voterVerificationMethod === 'Admission Number' && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Admission Number</label>
                <input 
                  type="text" 
                  placeholder="e.g. ADM-2024-0019" 
                  value={admissionNumber}
                  onChange={(e) => setAdmissionNumber(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  required
                />
              </div>
            )}

            {currentElection.voterVerificationMethod === 'Student ID' && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Student ID</label>
                <input 
                  type="text" 
                  placeholder="e.g. 22D070010" 
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  required
                />
              </div>
            )}

            {currentElection.voterVerificationMethod === 'Employee ID' && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Employee ID</label>
                <input 
                  type="text" 
                  placeholder="e.g. EMP-99824" 
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  required
                />
              </div>
            )}

            {currentElection.voterVerificationMethod === 'Faculty ID' && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Faculty ID</label>
                <input 
                  type="text" 
                  placeholder="e.g. FAC-88219" 
                  value={facultyId}
                  onChange={(e) => setFacultyId(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  required
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Department (Optional)</label>
              <input 
                type="text" 
                placeholder="e.g. Commerce" 
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Year / Batch (Optional)</label>
              <input 
                type="text" 
                placeholder="e.g. 3rd Year" 
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>
          </div>

          <div className="flex justify-end pt-3 border-t border-slate-150">
            <button 
              type="submit" 
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-md shadow-indigo-100 active:scale-95 cursor-pointer"
            >
              Commit Voter Record
            </button>
          </div>
        </form>
      )}

      {/* FILTER & TABLE RENDER */}
      {selectedElectionId ? (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm space-y-4 p-6 hover:shadow-md transition-shadow">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
            {/* Search */}
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search by name or identifier..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>

            {/* Filter type */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <Filter className="h-4 w-4 text-slate-400" />
              <select 
                value={voterTypeFilter} 
                onChange={(e) => setVoterTypeFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              >
                <option value="All">All Categories</option>
                <option value="Student">Students Only</option>
                <option value="Faculty">Faculty Only</option>
                <option value="Professor">Professors Only</option>
                <option value="Employee">Employees Only</option>
                <option value="Staff">Staff Only</option>
              </select>
            </div>
          </div>

          {/* Table */}
          {filteredVoters.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2 text-xs">
              <Layers className="h-8 w-8 text-slate-200 mx-auto" />
              <p>No matching voter records found in this partition.</p>
            </div>
          ) : (
            <div className="overflow-x-auto text-xs border border-slate-150 rounded-2xl bg-white">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-4">Eligible Voter</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Department</th>
                    <th className="p-4">Year / Batch</th>
                    <th className="p-4">Credential Verification</th>
                    <th className="p-4">Security Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150">
                  {filteredVoters.map(voter => {
                    const verificationMethod = currentElection?.voterVerificationMethod;
                    const idVal = 
                      verificationMethod === 'Roll Number' ? voter.rollNumber :
                      verificationMethod === 'Admission Number' ? voter.admissionNumber :
                      verificationMethod === 'Student ID' ? voter.studentId :
                      verificationMethod === 'Employee ID' ? voter.employeeId : voter.facultyId;

                    return (
                      <tr key={voter.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4 font-bold text-slate-900">{voter.fullName}</td>
                        <td className="p-4">
                          <span className="flex items-center gap-1.5 font-semibold text-slate-700">
                            {voter.voterType === 'Student' ? (
                              <GraduationCap className="h-3.5 w-3.5 text-indigo-500" />
                            ) : (
                              <Briefcase className="h-3.5 w-3.5 text-indigo-500" />
                            )}
                            <span>{voter.voterType}</span>
                          </span>
                        </td>
                        <td className="p-4 font-medium text-slate-600">{voter.department || '—'}</td>
                        <td className="p-4 font-medium text-slate-600">{voter.year || '—'}</td>
                        <td className="p-4">
                          <span className="font-mono bg-slate-100 border border-slate-200 px-2 py-1 rounded-lg text-[9px] text-slate-800 font-bold">
                            {verificationMethod}: {idVal || 'Empty'}
                          </span>
                        </td>
                        <td className="p-4">
                          <button 
                            type="button"
                            onClick={() => toggleVoterStatus(voter.id, voter.status)}
                            className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full font-bold border text-[9px] uppercase transition-all cursor-pointer hover:scale-105 active:scale-95 ${
                              voter.status === 'Active' 
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100' 
                                : 'bg-red-50 text-red-800 border-red-200 hover:bg-red-100'
                            }`}
                          >
                            {voter.status === 'Active' ? (
                              <>
                                <CheckCircle className="h-3 w-3 text-emerald-600" />
                                <span>Active</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="h-3 w-3 text-red-600" />
                                <span>Suspended</span>
                              </>
                            )}
                          </button>
                        </td>
                        <td className="p-4 text-right">
                          <button 
                            onClick={() => handleDeleteVoter(voter.id)}
                            className="text-red-500 hover:text-red-700 p-1.5 rounded-xl hover:bg-red-50 transition inline-flex cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white border border-slate-200 p-12 rounded-2xl text-center text-slate-400 text-xs shadow-sm">
          Please select or configure an election partition above to manage student and staff voter registries.
        </div>
      )}

    </div>
  );
};
