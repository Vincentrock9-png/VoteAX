/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  Institution, 
  Admin, 
  Election, 
  Position, 
  Voter, 
  Candidate, 
  Vote, 
  ElectionDocument, 
  AdminActivityLog,
  AdminRole,
  VoterVerificationMethod,
  generateUUID 
} from './types';

// Simple hashing simulation
export function hashPasswordSim(password: string): string {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return 'sim_hash_' + Math.abs(hash).toString(16);
}

// Initial seed data
const SEED_INSTITUTIONS: Institution[] = [
  {
    id: 'inst-xavier-uuid',
    name: "St. Xavier's College, Mumbai",
    slug: 'st-xaviers',
    logoUrl: '',
    createdAt: new Date('2026-01-10').toISOString(),
  },
  {
    id: 'inst-iitb-uuid',
    name: 'IIT Bombay, Mumbai',
    slug: 'iit-bombay',
    logoUrl: '',
    createdAt: new Date('2026-01-12').toISOString(),
  }
];

const SEED_ADMINS: Admin[] = [
  {
    id: 'admin-xavier-uuid',
    institutionId: 'inst-xavier-uuid',
    fullName: 'Prof. Sandeep Kelkar',
    username: 'xavier_admin',
    passwordHash: hashPasswordSim('admin123'),
    role: 'Super Admin',
    createdAt: new Date('2026-01-10').toISOString(),
  },
  {
    id: 'admin-iitb-uuid',
    institutionId: 'inst-iitb-uuid',
    fullName: 'Dr. Ramesh Kulkarni',
    username: 'iit_admin',
    passwordHash: hashPasswordSim('iitb123'),
    role: 'Election Admin',
    createdAt: new Date('2026-01-12').toISOString(),
  }
];

const SEED_ELECTIONS: Election[] = [
  {
    id: 'elect-xavier-sue',
    institutionId: 'inst-xavier-uuid',
    name: 'Student Union Election 2026',
    description: 'The annual general election for selecting the Student Council Cabinet representing Arts, Science, and Commerce faculties at St. Xavier\'s College, Mumbai.',
    startDate: '2026-07-20T08:00:00.000Z',
    endDate: '2026-07-30T17:00:00.000Z',
    status: 'Active',
    voterVerificationMethod: 'Roll Number',
    eligibleVoterTypes: ['Student'],
    departments: ['Arts', 'Science', 'Commerce'],
    years: ['1st Year', '2nd Year', '3rd Year'],
    createdAt: new Date('2026-06-01').toISOString(),
  },
  {
    id: 'elect-xavier-fac',
    institutionId: 'inst-xavier-uuid',
    name: 'Faculty Representative Polls 2026',
    description: 'Election of the faculty representative to the College Governing Body and Academic Council.',
    startDate: '2026-08-05T09:00:00.000Z',
    endDate: '2026-08-06T17:00:00.000Z',
    status: 'Upcoming',
    voterVerificationMethod: 'Faculty ID',
    eligibleVoterTypes: ['Faculty', 'Professor'],
    departments: [],
    years: [],
    createdAt: new Date('2026-06-15').toISOString(),
  },
  {
    id: 'elect-iitb-senate',
    institutionId: 'inst-iitb-uuid',
    name: 'Student Senate Election 2026',
    description: 'General elections for the Student Senate at IIT Bombay. Choose your academic, athletic, and cultural general secretaries.',
    startDate: '2026-07-22T08:00:00.000Z',
    endDate: '2026-07-29T18:00:00.000Z',
    status: 'Active',
    voterVerificationMethod: 'Student ID',
    eligibleVoterTypes: ['Student'],
    departments: ['CSE', 'Electrical', 'Mechanical', 'Aerospace', 'Civil'],
    years: ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Postgraduate'],
    createdAt: new Date('2026-06-05').toISOString(),
  }
];

const SEED_POSITIONS: Position[] = [
  // St Xavier's Student Union positions
  {
    id: 'pos-xavier-pres',
    electionId: 'elect-xavier-sue',
    title: 'College President',
    maxVotes: 1,
    order: 1,
  },
  {
    id: 'pos-xavier-vpres',
    electionId: 'elect-xavier-sue',
    title: 'Vice President',
    maxVotes: 1,
    order: 2,
  },
  {
    id: 'pos-xavier-gsec',
    electionId: 'elect-xavier-sue',
    title: 'General Secretary',
    maxVotes: 1,
    order: 3,
  },
  // IIT Bombay Student Senate positions
  {
    id: 'pos-iitb-gsec-acad',
    electionId: 'elect-iitb-senate',
    title: 'General Secretary (Academic Affairs)',
    maxVotes: 1,
    order: 1,
  },
  {
    id: 'pos-iitb-gsec-cul',
    electionId: 'elect-iitb-senate',
    title: 'General Secretary (Cultural Affairs)',
    maxVotes: 1,
    order: 2,
  }
];

const SEED_CANDIDATES: Candidate[] = [
  // Xavier Union - President Candidates
  {
    id: 'cand-xavier-priya',
    electionId: 'elect-xavier-sue',
    institutionId: 'inst-xavier-uuid',
    fullName: 'Priya Sharma',
    candidateId: 'CAND-XAV-001',
    rollNumber: 'SX-2024-042',
    voterType: 'Student',
    department: 'Economics',
    year: '3rd Year',
    positionId: 'pos-xavier-pres',
    party: 'St. Xavier Democratic Alliance (SXDA)',
    slogan: 'Empowering Voices, Elevating Campus.',
    manifesto: "1. Library Upgrade: Extend hours to 24/7 during exams, add extra beanbags and quiet pods.\n2. Cafeteria Subsidies: Negotiate with vendors for standard high-nutrition student meal packets under ₹50.\n3. Transparent Funding: Publish real-time expense spreadsheets for all campus cultural fests on the portal.",
    status: 'Approved',
    createdAt: new Date('2026-06-10').toISOString(),
  },
  {
    id: 'cand-xavier-aditya',
    electionId: 'elect-xavier-sue',
    institutionId: 'inst-xavier-uuid',
    fullName: 'Aditya Roy',
    candidateId: 'CAND-XAV-002',
    rollNumber: 'SX-2024-118',
    voterType: 'Student',
    department: 'Sociology',
    year: '3rd Year',
    positionId: 'pos-xavier-pres',
    party: 'Independent Students Forum (ISF)',
    slogan: 'Inclusion, Innovation, Action.',
    manifesto: "1. Digital Infrastructure: Establish a consolidated student-run helpline and lost-and-found mobile dashboard.\n2. Sustainable Campus: Implement structured waste separation and install solar phone-charging docks in common areas.\n3. Mental Wellness: Hire peer counselors and sponsor bi-weekly pet therapy sessions on the quad.",
    status: 'Approved',
    createdAt: new Date('2026-06-11').toISOString(),
  },
  {
    id: 'cand-xavier-rahul',
    electionId: 'elect-xavier-sue',
    institutionId: 'inst-xavier-uuid',
    fullName: 'Rahul Singh',
    candidateId: 'CAND-XAV-003',
    rollNumber: 'SX-2024-009',
    voterType: 'Student',
    department: 'Physics',
    year: '3rd Year',
    positionId: 'pos-xavier-pres',
    party: 'Youth Congress League',
    slogan: 'Physics & Progress: A Scientific Campus.',
    manifesto: "1. Advanced Lab Access: Permit students to use university computer labs and editing workstations after hours.\n2. Academic Grievance Cell: A rapid-response liaison group between students and academic deans.\n3. Sports League: Revive the inter-departmental cup with updated gear and professional trainers.",
    status: 'Pending', // Seeded as PENDING to showcase approval flow!
    createdAt: new Date('2026-06-12').toISOString(),
  },

  // Xavier Union - Vice President Candidates
  {
    id: 'cand-xavier-kavita',
    electionId: 'elect-xavier-sue',
    institutionId: 'inst-xavier-uuid',
    fullName: 'Kavita Joshi',
    candidateId: 'CAND-XAV-004',
    rollNumber: 'SX-2024-204',
    voterType: 'Student',
    department: 'English Literature',
    year: '2nd Year',
    positionId: 'pos-xavier-vpres',
    party: 'St. Xavier Democratic Alliance (SXDA)',
    slogan: 'United in Diversity.',
    manifesto: "Amplify representation for international and out-of-state students. Sponsor language exchanges and cultural food festivals.",
    status: 'Approved',
    createdAt: new Date('2026-06-13').toISOString(),
  },
  {
    id: 'cand-xavier-arjun',
    electionId: 'elect-xavier-sue',
    institutionId: 'inst-xavier-uuid',
    fullName: 'Arjun Sen',
    candidateId: 'CAND-XAV-005',
    rollNumber: 'SX-2024-098',
    voterType: 'Student',
    department: 'Chemistry',
    year: '2nd Year',
    positionId: 'pos-xavier-vpres',
    party: 'Independent Students Forum (ISF)',
    slogan: 'Concrete Steps, Not Promises.',
    manifesto: "Install proper water purifiers in all academic wings and repair faulty projector screens in classrooms.",
    status: 'Approved',
    createdAt: new Date('2026-06-13').toISOString(),
  },

  // Xavier Union - General Secretary Candidates
  {
    id: 'cand-xavier-rohan',
    electionId: 'elect-xavier-sue',
    institutionId: 'inst-xavier-uuid',
    fullName: 'Rohan Mehta',
    candidateId: 'CAND-XAV-006',
    rollNumber: 'SX-2024-055',
    voterType: 'Student',
    department: 'Management',
    year: '2nd Year',
    positionId: 'pos-xavier-gsec',
    party: 'St. Xavier Democratic Alliance (SXDA)',
    slogan: 'Efficiency First.',
    manifesto: "Streamline campus club bookings, eliminate paper permissions, and implement a digital booking system.",
    status: 'Approved',
    createdAt: new Date('2026-06-14').toISOString(),
  },
  {
    id: 'cand-xavier-anjali',
    electionId: 'elect-xavier-sue',
    institutionId: 'inst-xavier-uuid',
    fullName: 'Anjali Kapoor',
    candidateId: 'CAND-XAV-007',
    rollNumber: 'SX-2024-156',
    voterType: 'Student',
    department: 'Life Sciences',
    year: '2nd Year',
    positionId: 'pos-xavier-gsec',
    party: 'Independent Students Forum (ISF)',
    slogan: 'Transparency in Action.',
    manifesto: "Open Senate general meetings to all students via live broadcast to ensure complete organizational transparency.",
    status: 'Approved',
    createdAt: new Date('2026-06-14').toISOString(),
  },

  // IIT Bombay Student Senate - Academic GSec Candidates
  {
    id: 'cand-iitb-sameer',
    electionId: 'elect-iitb-senate',
    institutionId: 'inst-iitb-uuid',
    fullName: 'Sameer Phadke',
    candidateId: 'CAND-IITB-001',
    studentId: '22D070014',
    voterType: 'Student',
    department: 'CSE',
    year: '4th Year',
    positionId: 'pos-iitb-gsec-acad',
    party: 'Progressive Student Council (PSC)',
    slogan: 'Code, Curricula, and Change.',
    manifesto: "Simplify academic registration timelines, establish robust feedback for introductory courses, and increase elective availability.",
    status: 'Approved',
    createdAt: new Date('2026-06-10').toISOString(),
  },
  {
    id: 'cand-iitb-neha',
    electionId: 'elect-iitb-senate',
    institutionId: 'inst-iitb-uuid',
    fullName: 'Neha Deshmukh',
    candidateId: 'CAND-IITB-002',
    studentId: '22D120033',
    voterType: 'Student',
    department: 'Electrical',
    year: '4th Year',
    positionId: 'pos-iitb-gsec-acad',
    party: 'Student Action Alliance (SAA)',
    slogan: 'Excellence in Education.',
    manifesto: "Establish central research project portal for undergraduates, secure funding for international symposium representation.",
    status: 'Approved',
    createdAt: new Date('2026-06-11').toISOString(),
  }
];

const SEED_VOTERS: Voter[] = [
  // St Xavier's Student Union voters (Roll Numbers)
  {
    id: 'voter-xavier-1',
    electionId: 'elect-xavier-sue',
    institutionId: 'inst-xavier-uuid',
    fullName: 'Rahul Kumar',
    voterType: 'Student',
    rollNumber: 'SX-2024-1001',
    department: 'Science',
    year: '3rd Year',
    className: 'B.Sc Physics',
    section: 'A',
    status: 'Active',
    createdAt: new Date('2026-06-20').toISOString(),
  },
  {
    id: 'voter-xavier-2',
    electionId: 'elect-xavier-sue',
    institutionId: 'inst-xavier-uuid',
    fullName: 'Aisha Patel',
    voterType: 'Student',
    rollNumber: 'SX-2024-1002',
    department: 'Arts',
    year: '3rd Year',
    className: 'BA Economics',
    section: 'B',
    status: 'Active',
    createdAt: new Date('2026-06-20').toISOString(),
  },
  {
    id: 'voter-xavier-3',
    electionId: 'elect-xavier-sue',
    institutionId: 'inst-xavier-uuid',
    fullName: 'Kabir Malhotra',
    voterType: 'Student',
    rollNumber: 'SX-2024-1003',
    department: 'Commerce',
    year: '2nd Year',
    className: 'B.Com',
    section: 'A',
    status: 'Active',
    createdAt: new Date('2026-06-21').toISOString(),
  },
  {
    id: 'voter-xavier-4',
    electionId: 'elect-xavier-sue',
    institutionId: 'inst-xavier-uuid',
    fullName: 'Sneha Iyer',
    voterType: 'Student',
    rollNumber: 'SX-2024-1004',
    department: 'Arts',
    year: '2nd Year',
    className: 'BA Sociology',
    section: 'C',
    status: 'Active',
    createdAt: new Date('2026-06-21').toISOString(),
  },
  {
    id: 'voter-xavier-5',
    electionId: 'elect-xavier-sue',
    institutionId: 'inst-xavier-uuid',
    fullName: 'Vikram Seth',
    voterType: 'Student',
    rollNumber: 'SX-2024-1005',
    department: 'Science',
    year: '1st Year',
    className: 'B.Sc Chemistry',
    section: 'B',
    status: 'Active',
    createdAt: new Date('2026-06-22').toISOString(),
  },
  {
    id: 'voter-xavier-6',
    electionId: 'elect-xavier-sue',
    institutionId: 'inst-xavier-uuid',
    fullName: 'Tanvi Shah',
    voterType: 'Student',
    rollNumber: 'SX-2024-1006',
    department: 'Commerce',
    year: '3rd Year',
    className: 'B.Com Management',
    section: 'A',
    status: 'Active',
    createdAt: new Date('2026-06-22').toISOString(),
  },

  // IIT Bombay Student Senate voters (Student IDs)
  {
    id: 'voter-iitb-1',
    electionId: 'elect-iitb-senate',
    institutionId: 'inst-iitb-uuid',
    fullName: 'Atharva Patil',
    voterType: 'Student',
    studentId: '22D070010',
    department: 'CSE',
    year: '4th Year',
    className: 'B.Tech',
    status: 'Active',
    createdAt: new Date('2026-06-22').toISOString(),
  },
  {
    id: 'voter-iitb-2',
    electionId: 'elect-iitb-senate',
    institutionId: 'inst-iitb-uuid',
    fullName: 'Rhea Sen',
    voterType: 'Student',
    studentId: '22D120015',
    department: 'Electrical',
    year: '4th Year',
    className: 'B.Tech',
    status: 'Active',
    createdAt: new Date('2026-06-22').toISOString(),
  },
  {
    id: 'voter-iitb-3',
    electionId: 'elect-iitb-senate',
    institutionId: 'inst-iitb-uuid',
    fullName: 'Amit Kumar',
    voterType: 'Student',
    studentId: '23D080005',
    department: 'Mechanical',
    year: '3rd Year',
    className: 'B.Tech',
    status: 'Active',
    createdAt: new Date('2026-06-23').toISOString(),
  }
];

const SEED_VOTES: Vote[] = [
  // St Xavier's - Some preloaded votes to showcase charts
  // Kabir Malhotra (voter-xavier-3) voted
  {
    id: 'vote-v3-pres',
    institutionId: 'inst-xavier-uuid',
    electionId: 'elect-xavier-sue',
    voterId: 'voter-xavier-3',
    positionId: 'pos-xavier-pres',
    candidateId: 'cand-xavier-priya',
    timestamp: new Date('2026-07-24T09:12:00.000Z').toISOString(),
  },
  {
    id: 'vote-v3-vpres',
    institutionId: 'inst-xavier-uuid',
    electionId: 'elect-xavier-sue',
    voterId: 'voter-xavier-3',
    positionId: 'pos-xavier-vpres',
    candidateId: 'cand-xavier-kavita',
    timestamp: new Date('2026-07-24T09:12:00.000Z').toISOString(),
  },
  {
    id: 'vote-v3-gsec',
    institutionId: 'inst-xavier-uuid',
    electionId: 'elect-xavier-sue',
    voterId: 'voter-xavier-3',
    positionId: 'pos-xavier-gsec',
    candidateId: 'cand-xavier-rohan',
    timestamp: new Date('2026-07-24T09:12:00.000Z').toISOString(),
  },

  // Aisha Patel (voter-xavier-2) voted
  {
    id: 'vote-v2-pres',
    institutionId: 'inst-xavier-uuid',
    electionId: 'elect-xavier-sue',
    voterId: 'voter-xavier-2',
    positionId: 'pos-xavier-pres',
    candidateId: 'cand-xavier-aditya',
    timestamp: new Date('2026-07-24T10:05:00.000Z').toISOString(),
  },
  {
    id: 'vote-v2-vpres',
    institutionId: 'inst-xavier-uuid',
    electionId: 'elect-xavier-sue',
    voterId: 'voter-xavier-2',
    positionId: 'pos-xavier-vpres',
    candidateId: 'cand-xavier-arjun',
    timestamp: new Date('2026-07-24T10:05:00.000Z').toISOString(),
  },
  {
    id: 'vote-v2-gsec',
    institutionId: 'inst-xavier-uuid',
    electionId: 'elect-xavier-sue',
    voterId: 'voter-xavier-2',
    positionId: 'pos-xavier-gsec',
    candidateId: 'cand-xavier-anjali',
    timestamp: new Date('2026-07-24T10:05:00.000Z').toISOString(),
  }
];

const SEED_DOCUMENTS: ElectionDocument[] = [
  {
    id: 'doc-xavier-rules',
    electionId: 'elect-xavier-sue',
    title: 'Official Election Code of Conduct 2026',
    fileName: 'Xavier_Election_Code_Of_Conduct.pdf',
    fileSize: '420 KB',
    content: 'Full election regulatory framework. Includes restrictions on campaigning, post-budget caps, digital media regulations, and disciplinary guidelines.',
    visibility: 'Visible to Voters',
    createdAt: new Date('2026-06-05').toISOString(),
  },
  {
    id: 'doc-xavier-voter-guide',
    electionId: 'elect-xavier-sue',
    title: 'Voter Identity Verification & Authentication Guidelines',
    fileName: 'Voter_Verification_Guide.pdf',
    fileSize: '1.2 MB',
    content: 'Detailed explanation on how student roll numbers are cross-referenced with the registrar\'s database to grant access to the voting dashboard.',
    visibility: 'Visible to Voters',
    createdAt: new Date('2026-06-06').toISOString(),
  },
  {
    id: 'doc-xavier-internal-ops',
    electionId: 'elect-xavier-sue',
    title: 'Election Observer Checklist (Internal)',
    fileName: 'Internal_Observer_Checklist.pdf',
    fileSize: '150 KB',
    content: 'Private document for college moderators and observers outlining auditing protocols, server log checking, and dispute resolution workflows.',
    visibility: 'Admin Only',
    createdAt: new Date('2026-06-08').toISOString(),
  }
];

const SEED_LOGS: AdminActivityLog[] = [
  {
    id: 'log-1',
    adminId: 'admin-xavier-uuid',
    adminName: 'Prof. Sandeep Kelkar',
    institutionId: 'inst-xavier-uuid',
    action: 'Election Created',
    electionId: 'elect-xavier-sue',
    description: "Created Student Union Election 2026 with Roll Number verification.",
    timestamp: new Date('2026-06-01T10:15:00.000Z').toISOString(),
  },
  {
    id: 'log-2',
    adminId: 'admin-xavier-uuid',
    adminName: 'Prof. Sandeep Kelkar',
    institutionId: 'inst-xavier-uuid',
    action: 'Voter List Imported',
    electionId: 'elect-xavier-sue',
    description: "Imported 6 eligible student voter records via registrar CSV batch upload.",
    timestamp: new Date('2026-06-20T14:30:00.000Z').toISOString(),
  },
  {
    id: 'log-3',
    adminId: 'admin-xavier-uuid',
    adminName: 'Prof. Sandeep Kelkar',
    institutionId: 'inst-xavier-uuid',
    action: 'Candidate Added',
    electionId: 'elect-xavier-sue',
    description: "Added Priya Sharma as President Nominee.",
    timestamp: new Date('2026-06-10T11:00:00.000Z').toISOString(),
  },
  {
    id: 'log-4',
    adminId: 'admin-xavier-uuid',
    adminName: 'Prof. Sandeep Kelkar',
    institutionId: 'inst-xavier-uuid',
    action: 'Candidate Approved',
    electionId: 'elect-xavier-sue',
    description: "Approved Priya Sharma as an official candidate for College President.",
    timestamp: new Date('2026-06-11T09:00:00.000Z').toISOString(),
  }
];

// Memory state sync helper
class Database {
  private institutions: Institution[] = [];
  private admins: Admin[] = [];
  private elections: Election[] = [];
  private positions: Position[] = [];
  private voters: Voter[] = [];
  private candidates: Candidate[] = [];
  private votes: Vote[] = [];
  private documents: ElectionDocument[] = [];
  private logs: AdminActivityLog[] = [];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    if (typeof window === 'undefined') return;

    try {
      const savedInsts = localStorage.getItem('elec_institutions');
      if (savedInsts) {
        this.institutions = JSON.parse(savedInsts);
        this.admins = JSON.parse(localStorage.getItem('elec_admins') || '[]');
        this.elections = JSON.parse(localStorage.getItem('elec_elections') || '[]');
        this.positions = JSON.parse(localStorage.getItem('elec_positions') || '[]');
        this.voters = JSON.parse(localStorage.getItem('elec_voters') || '[]');
        this.candidates = JSON.parse(localStorage.getItem('elec_candidates') || '[]');
        this.votes = JSON.parse(localStorage.getItem('elec_votes') || '[]');
        this.documents = JSON.parse(localStorage.getItem('elec_documents') || '[]');
        this.logs = JSON.parse(localStorage.getItem('elec_logs') || '[]');
      } else {
        // Run seed
        this.institutions = [...SEED_INSTITUTIONS];
        this.admins = [...SEED_ADMINS];
        this.elections = [...SEED_ELECTIONS];
        this.positions = [...SEED_POSITIONS];
        this.voters = [...SEED_VOTERS];
        this.candidates = [...SEED_CANDIDATES];
        this.votes = [...SEED_VOTES];
        this.documents = [...SEED_DOCUMENTS];
        this.logs = [...SEED_LOGS];
        this.saveAllToStorage();
      }
    } catch (e) {
      console.error('Failed to load database from localStorage, utilizing RAM state', e);
    }
  }

  private saveAllToStorage() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('elec_institutions', JSON.stringify(this.institutions));
      localStorage.setItem('elec_admins', JSON.stringify(this.admins));
      localStorage.setItem('elec_elections', JSON.stringify(this.elections));
      localStorage.setItem('elec_positions', JSON.stringify(this.positions));
      localStorage.setItem('elec_voters', JSON.stringify(this.voters));
      localStorage.setItem('elec_candidates', JSON.stringify(this.candidates));
      localStorage.setItem('elec_votes', JSON.stringify(this.votes));
      localStorage.setItem('elec_documents', JSON.stringify(this.documents));
      localStorage.setItem('elec_logs', JSON.stringify(this.logs));
    } catch (e) {
      console.error('Failed to write database to localStorage', e);
    }
  }

  // --- QUERY IMPLEMENTATIONS (Isolated to institution and election contexts where applicable) ---

  public getInstitutions(): Institution[] {
    return this.institutions;
  }

  public getInstitutionBySlug(slug: string): Institution | undefined {
    return this.institutions.find(inst => inst.slug.toLowerCase() === slug.toLowerCase());
  }

  public getInstitutionById(id: string): Institution | undefined {
    return this.institutions.find(inst => inst.id === id);
  }

  public addInstitution(name: string, logoUrl?: string): Institution {
    // Generate simple friendly slug
    const slug = name.toLowerCase()
      .replace(/[^a-z0-9 ]/g, '')
      .replace(/\s+/g, '-');
    
    // Check if slug already exists
    const duplicate = this.institutions.find(inst => inst.slug === slug);
    const finalSlug = duplicate ? `${slug}-${Math.floor(Math.random() * 1000)}` : slug;

    const newInst: Institution = {
      id: generateUUID(),
      name,
      slug: finalSlug,
      logoUrl,
      createdAt: new Date().toISOString()
    };
    this.institutions.push(newInst);
    this.saveAllToStorage();
    return newInst;
  }

  // Admins
  public getAdmins(institutionId: string): Admin[] {
    return this.admins.filter(admin => admin.institutionId === institutionId);
  }

  public findAdminByUsername(username: string): Admin | undefined {
    return this.admins.find(admin => admin.username.toLowerCase() === username.toLowerCase());
  }

  public addAdmin(institutionId: string, fullName: string, username: string, passwordHash: string, role: AdminRole): Admin {
    const newAdmin: Admin = {
      id: generateUUID(),
      institutionId,
      fullName,
      username,
      passwordHash,
      role,
      createdAt: new Date().toISOString()
    };
    this.admins.push(newAdmin);
    this.saveAllToStorage();
    return newAdmin;
  }

  // Elections (Isolated per Institution)
  public getElections(institutionId: string): Election[] {
    return this.elections.filter(el => el.institutionId === institutionId);
  }

  public getElectionById(id: string): Election | undefined {
    return this.elections.find(el => el.id === id);
  }

  public addElection(election: Omit<Election, 'id' | 'createdAt'>): Election {
    const newEl: Election = {
      ...election,
      id: generateUUID(),
      createdAt: new Date().toISOString()
    };
    this.elections.push(newEl);
    this.saveAllToStorage();
    return newEl;
  }

  public updateElection(id: string, updated: Partial<Election>) {
    this.elections = this.elections.map(el => {
      if (el.id === id) {
        return { ...el, ...updated };
      }
      return el;
    });
    this.saveAllToStorage();
  }

  // Positions (Belongs to Election)
  public getPositions(electionId: string): Position[] {
    return this.positions
      .filter(p => p.electionId === electionId)
      .sort((a, b) => a.order - b.order);
  }

  public addPosition(electionId: string, title: string, order: number, maxVotes: number = 1): Position {
    const newPos: Position = {
      id: generateUUID(),
      electionId,
      title,
      maxVotes,
      order
    };
    this.positions.push(newPos);
    this.saveAllToStorage();
    return newPos;
  }

  public deletePosition(id: string) {
    this.positions = this.positions.filter(p => p.id !== id);
    this.saveAllToStorage();
  }

  // Voters (Scoped strictly within Institution + Election)
  public getVoters(electionId: string): Voter[] {
    return this.voters.filter(v => v.electionId === electionId);
  }

  public getVoterById(id: string): Voter | undefined {
    return this.voters.find(v => v.id === id);
  }

  public addVoter(voter: Omit<Voter, 'id' | 'createdAt'>): Voter {
    const newVoter: Voter = {
      ...voter,
      id: generateUUID(),
      createdAt: new Date().toISOString()
    };
    this.voters.push(newVoter);
    this.saveAllToStorage();
    return newVoter;
  }

  public updateVoter(id: string, updated: Partial<Voter>) {
    this.voters = this.voters.map(v => {
      if (v.id === id) {
        return { ...v, ...updated };
      }
      return v;
    });
    this.saveAllToStorage();
  }

  public deleteVoter(id: string) {
    this.voters = this.voters.filter(v => v.id !== id);
    this.saveAllToStorage();
  }

  // Batch insert voters
  public importVoters(electionId: string, institutionId: string, list: Omit<Voter, 'id' | 'electionId' | 'institutionId' | 'createdAt' | 'status'>[]) {
    const created: Voter[] = [];
    for (const item of list) {
      const newVoter: Voter = {
        ...item,
        id: generateUUID(),
        electionId,
        institutionId,
        status: 'Active',
        createdAt: new Date().toISOString()
      };
      this.voters.push(newVoter);
      created.push(newVoter);
    }
    this.saveAllToStorage();
    return created;
  }

  // Candidates (Scoped to Election/Institution)
  public getCandidates(electionId: string): Candidate[] {
    return this.candidates.filter(c => c.electionId === electionId);
  }

  public getCandidateById(id: string): Candidate | undefined {
    return this.candidates.find(c => c.id === id);
  }

  public addCandidate(candidate: Omit<Candidate, 'id' | 'createdAt'>): Candidate {
    const newCand: Candidate = {
      ...candidate,
      id: generateUUID(),
      createdAt: new Date().toISOString()
    };
    this.candidates.push(newCand);
    this.saveAllToStorage();
    return newCand;
  }

  public updateCandidate(id: string, updated: Partial<Candidate>) {
    this.candidates = this.candidates.map(c => {
      if (c.id === id) {
        return { ...c, ...updated };
      }
      return c;
    });
    this.saveAllToStorage();
  }

  public deleteCandidate(id: string) {
    this.candidates = this.candidates.filter(c => c.id !== id);
    this.saveAllToStorage();
  }

  // Votes (Secure submission & auditing)
  public getVotes(electionId: string): Vote[] {
    return this.votes.filter(v => v.electionId === electionId);
  }

  // Checks if voter has already submitted a vote for a specific position in this election
  public checkHasVoted(electionId: string, voterId: string, positionId: string): boolean {
    return this.votes.some(v => 
      v.electionId === electionId && 
      v.voterId === voterId && 
      v.positionId === positionId
    );
  }

  // Enforce secure ONE VOTE per voter per position
  public submitVotes(votes: Omit<Vote, 'id' | 'timestamp'>[]): { success: boolean; message: string } {
    const timestamp = new Date().toISOString();
    
    // Validate first
    for (const v of votes) {
      if (this.checkHasVoted(v.electionId, v.voterId, v.positionId)) {
        return { 
          success: false, 
          message: "A vote has already been submitted for one or more positions under this voter record." 
        };
      }
    }

    // Write all votes atomically
    for (const v of votes) {
      const newVote: Vote = {
        ...v,
        id: generateUUID(),
        timestamp
      };
      this.votes.push(newVote);
    }

    this.saveAllToStorage();
    return { success: true, message: "Your secure votes have been submitted successfully." };
  }

  // Documents
  public getDocuments(electionId: string): ElectionDocument[] {
    return this.documents.filter(doc => doc.electionId === electionId);
  }

  public addDocument(doc: Omit<ElectionDocument, 'id' | 'createdAt'>): ElectionDocument {
    const newDoc: ElectionDocument = {
      ...doc,
      id: generateUUID(),
      createdAt: new Date().toISOString()
    };
    this.documents.push(newDoc);
    this.saveAllToStorage();
    return newDoc;
  }

  public deleteDocument(id: string) {
    this.documents = this.documents.filter(doc => doc.id !== id);
    this.saveAllToStorage();
  }

  // Activity Logs
  public getLogs(institutionId: string): AdminActivityLog[] {
    return this.logs
      .filter(l => l.institutionId === institutionId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  public addLog(institutionId: string, adminId: string, adminName: string, action: string, description: string, electionId?: string) {
    const newLog: AdminActivityLog = {
      id: generateUUID(),
      adminId,
      adminName,
      institutionId,
      action,
      electionId,
      description,
      timestamp: new Date().toISOString()
    };
    this.logs.push(newLog);
    this.saveAllToStorage();
    return newLog;
  }

  // Voter Verification API (Strictly scoped within Institution + Election)
  public verifyVoterIdentity(
    institutionId: string, 
    electionId: string, 
    fullName: string, 
    identifierValue: string,
    verificationMethod: VoterVerificationMethod
  ): { success: boolean; voter?: Voter; error?: string } {
    
    // Find election first
    const election = this.getElectionById(electionId);
    if (!election) {
      return { success: false, error: "Election record not found." };
    }

    if (election.institutionId !== institutionId) {
      return { success: false, error: "Access violation. Election does not belong to your institution." };
    }

    if (election.status !== 'Active') {
      return { 
        success: false, 
        error: `Voting is not open. Election is currently in '${election.status}' state.` 
      };
    }

    // Get election voter list
    const eligibleVoters = this.getVoters(electionId);

    // Search strictly inside this list
    const voter = eligibleVoters.find(v => {
      // Name matches case-insensitively, trimmed
      const nameMatch = v.fullName.trim().toLowerCase() === fullName.trim().toLowerCase();
      if (!nameMatch) return false;

      // Match correct identifier based on configured verification method
      let identifierMatch = false;
      const compareVal = identifierValue.trim().toLowerCase();

      switch (verificationMethod) {
        case 'Roll Number':
          identifierMatch = v.rollNumber?.trim().toLowerCase() === compareVal;
          break;
        case 'Admission Number':
          identifierMatch = v.admissionNumber?.trim().toLowerCase() === compareVal;
          break;
        case 'Student ID':
          identifierMatch = v.studentId?.trim().toLowerCase() === compareVal;
          break;
        case 'Employee ID':
          identifierMatch = v.employeeId?.trim().toLowerCase() === compareVal;
          break;
        case 'Faculty ID':
          identifierMatch = v.facultyId?.trim().toLowerCase() === compareVal;
          break;
      }

      return identifierMatch;
    });

    if (!voter) {
      return { 
        success: false, 
        error: `Identity verification failed. No matching student or faculty record found under the specified ${verificationMethod} in this election's database.` 
      };
    }

    if (voter.status !== 'Active') {
      return { 
        success: false, 
        error: "Your voter profile has been marked as Inactive or Suspended. Please contact your election administrator." 
      };
    }

    // Determine if voter has already completed voting for ALL positions in this election
    const positions = this.getPositions(electionId);
    let allPositionsVoted = true;
    for (const pos of positions) {
      if (!this.checkHasVoted(electionId, voter.id, pos.id)) {
        allPositionsVoted = false;
        break;
      }
    }

    if (positions.length > 0 && allPositionsVoted) {
      return { 
        success: false, 
        error: "You have already completed voting and submitted ballots for all positions in this election. Multiple submissions are strictly blocked." 
      };
    }

    return { success: true, voter };
  }
}

export const db = new Database();
