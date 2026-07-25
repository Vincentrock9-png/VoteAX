/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Institution {
  id: string; // UUID
  name: string;
  slug: string;
  logoUrl?: string;
  createdAt: string;
}

export type AdminRole = 'Super Admin' | 'Election Admin' | 'Moderator';

export interface Admin {
  id: string; // UUID
  institutionId: string; // UUID
  fullName: string;
  username: string;
  passwordHash: string; // Stored securely in simulated state
  role: AdminRole;
  createdAt: string;
}

export type ElectionStatus = 
  | 'Draft' 
  | 'Upcoming' 
  | 'Published' 
  | 'Active' 
  | 'Paused' 
  | 'Ended' 
  | 'Cancelled' 
  | 'Results Published';

export type VoterVerificationMethod = 
  | 'Roll Number' 
  | 'Admission Number' 
  | 'Student ID' 
  | 'Employee ID' 
  | 'Faculty ID';

export type VoterType = 
  | 'Student' 
  | 'Professor' 
  | 'Teacher' 
  | 'Faculty' 
  | 'Employee' 
  | 'Staff';

export interface Election {
  id: string; // UUID
  institutionId: string; // UUID
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: ElectionStatus;
  voterVerificationMethod: VoterVerificationMethod;
  eligibleVoterTypes: VoterType[];
  departments: string[]; // empty list = all departments
  years: string[]; // empty list = all years
  createdAt: string;
}

export interface Position {
  id: string; // UUID
  electionId: string; // UUID
  title: string;
  maxVotes: number; // default 1
  order: number;
}

export interface Voter {
  id: string; // UUID
  electionId: string; // UUID
  institutionId: string; // UUID
  fullName: string;
  voterType: VoterType;
  rollNumber?: string;
  admissionNumber?: string;
  studentId?: string;
  employeeId?: string;
  facultyId?: string;
  department?: string;
  year?: string;
  className?: string;
  section?: string;
  status: 'Active' | 'Inactive';
  createdAt: string;
}

export type CandidateStatus = 
  | 'Draft' 
  | 'Pending' 
  | 'Approved' 
  | 'Rejected' 
  | 'Disqualified';

export interface Candidate {
  id: string; // UUID
  electionId: string; // UUID
  institutionId: string; // UUID
  fullName: string;
  candidateId?: string;
  rollNumber?: string;
  admissionNumber?: string;
  studentId?: string;
  voterType: VoterType;
  department: string;
  year?: string;
  designation?: string;
  positionId: string; // Position UUID
  party?: string; // Slogan/Student group
  slogan?: string;
  photoUrl?: string;
  manifesto: string;
  introduction?: string;
  status: CandidateStatus;
  createdAt: string;
}

export interface Vote {
  id: string; // UUID
  institutionId: string; // UUID
  electionId: string; // UUID
  voterId: string; // Voter UUID
  positionId: string; // Position UUID
  candidateId: string; // Candidate UUID
  timestamp: string;
}

export interface ElectionDocument {
  id: string; // UUID
  electionId: string; // UUID
  title: string;
  fileName: string;
  fileSize: string;
  content?: string;
  visibility: 'Admin Only' | 'Visible to Voters';
  createdAt: string;
}

export interface AdminActivityLog {
  id: string; // UUID
  adminId: string; // UUID
  adminName: string;
  institutionId: string; // UUID
  action: string;
  electionId?: string; // UUID
  description: string;
  timestamp: string;
}

export function generateUUID(): string {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.randomUUID) {
    try {
      return window.crypto.randomUUID();
    } catch (e) {
      // Fallback
    }
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
