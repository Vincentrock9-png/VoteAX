/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { db, hashPasswordSim } from '../dbMock';
import { Institution, Admin, Voter, Election, AdminRole } from '../types';

interface AppContextType {
  // Authentication & Session
  currentAdmin: Admin | null;
  currentInstitution: Institution | null;
  currentVoter: Voter | null;
  currentVoterElection: Election | null;
  
  // Routing/Path
  currentPath: string; // 'landing' | 'admin-login' | 'admin-register' | 'admin-dashboard' | 'voter-verify' | 'voter-voting' | 'voter-success' | 'results-public' | 'voter-login'
  activeElectionId: string | null;
  
  // Database Triggers
  refreshTrigger: number;
  triggerRefresh: () => void;

  // Actions
  adminLogin: (username: string, password: string) => { success: boolean; error?: string };
  adminRegister: (fullName: string, username: string, password: string, institutionName: string, role: AdminRole) => { success: boolean; error?: string };
  adminLogout: () => void;
  voterVerify: (fullName: string, identifierValue: string) => { success: boolean; error?: string };
  voterLogout: () => void;
  navigateTo: (path: string, electionId?: string | null) => void;
  selectVoterElection: (electionId: string) => void;
  
  // Host Address Helper
  getElectionAccessUrl: (electionId: string) => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentAdmin, setCurrentAdmin] = useState<Admin | null>(null);
  const [currentInstitution, setCurrentInstitution] = useState<Institution | null>(null);
  const [currentVoter, setCurrentVoter] = useState<Voter | null>(null);
  const [currentVoterElection, setCurrentVoterElection] = useState<Election | null>(null);
  
  const [currentPath, setCurrentPath] = useState<string>('landing');
  const [activeElectionId, setActiveElectionId] = useState<string | null>(null);
  
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  const triggerRefresh = () => setRefreshTrigger(prev => prev + 1);

  // Initialize from hash routing or session
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#/election/')) {
        const electionId = hash.replace('#/election/', '');
        const election = db.getElectionById(electionId);
        if (election) {
          setActiveElectionId(electionId);
          setCurrentPath('voter-verify');
          // Automatically set active voter election
          setCurrentVoterElection(election);
        } else {
          setCurrentPath('landing');
        }
      } else if (hash === '#/admin/dashboard' && currentAdmin) {
        setCurrentPath('admin-dashboard');
      } else if (hash === '#/admin/login') {
        setCurrentPath('admin-login');
      } else if (hash === '#/admin/register') {
        setCurrentPath('admin-register');
      } else if (hash === '#/voter/login') {
        setCurrentPath('voter-login');
      } else if (hash.startsWith('#/results/')) {
        const electionId = hash.replace('#/results/', '');
        setActiveElectionId(electionId);
        setCurrentPath('results-public');
      } else if (!hash || hash === '#/' || hash === '#/landing') {
        setCurrentPath('landing');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    // Initial parse
    handleHashChange();

    // Check if there is an active session
    try {
      const savedAdminJson = localStorage.getItem('session_admin');
      if (savedAdminJson) {
        const savedAdmin = JSON.parse(savedAdminJson) as Admin;
        const adminInst = db.getInstitutionById(savedAdmin.institutionId);
        if (adminInst) {
          setCurrentAdmin(savedAdmin);
          setCurrentInstitution(adminInst);
          // Only redirect if they are on a generic admin path
          if (window.location.hash === '#/admin/login' || window.location.hash === '') {
            setCurrentPath('admin-dashboard');
            window.location.hash = '#/admin/dashboard';
          }
        }
      }
    } catch (e) {
      console.error('Failed to parse saved session', e);
    }

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateTo = (path: string, electionId: string | null = null) => {
    setCurrentPath(path);
    setActiveElectionId(electionId);

    if (path === 'landing') {
      window.location.hash = '#/landing';
    } else if (path === 'admin-login') {
      window.location.hash = '#/admin/login';
    } else if (path === 'admin-register') {
      window.location.hash = '#/admin/register';
    } else if (path === 'admin-dashboard') {
      window.location.hash = '#/admin/dashboard';
    } else if (path === 'voter-login') {
      window.location.hash = '#/voter/login';
    } else if (path === 'voter-verify' && electionId) {
      const election = db.getElectionById(electionId);
      if (election) {
        setCurrentVoterElection(election);
        window.location.hash = `#/election/${electionId}`;
      }
    } else if (path === 'results-public' && electionId) {
      window.location.hash = `#/results/${electionId}`;
    }
  };

  const selectVoterElection = (electionId: string) => {
    const election = db.getElectionById(electionId);
    if (election) {
      setCurrentVoterElection(election);
      setActiveElectionId(electionId);
    }
  };

  const adminLogin = (username: string, password: string) => {
    const admin = db.findAdminByUsername(username);
    if (!admin) {
      return { success: false, error: 'Invalid admin username.' };
    }

    const hashedInput = hashPasswordSim(password);
    if (admin.passwordHash !== hashedInput) {
      return { success: false, error: 'Invalid admin password.' };
    }

    const inst = db.getInstitutionById(admin.institutionId);
    if (!inst) {
      return { success: false, error: 'Associated institution not found.' };
    }

    setCurrentAdmin(admin);
    setCurrentInstitution(inst);
    localStorage.setItem('session_admin', JSON.stringify(admin));
    
    // Log Activity
    db.addLog(inst.id, admin.id, admin.fullName, 'Admin Login', `Administrator ${admin.fullName} authenticated successfully.`);
    triggerRefresh();

    navigateTo('admin-dashboard');
    return { success: true };
  };

  const adminRegister = (fullName: string, username: string, password: string, institutionName: string, role: AdminRole) => {
    // Check duplicate username
    const existing = db.findAdminByUsername(username);
    if (existing) {
      return { success: false, error: 'Username is already taken.' };
    }

    // Check if institution already exists or create new
    const insts = db.getInstitutions();
    let inst = insts.find(i => i.name.trim().toLowerCase() === institutionName.trim().toLowerCase());
    if (!inst) {
      inst = db.addInstitution(institutionName);
    }

    const passwordHash = hashPasswordSim(password);
    const newAdmin = db.addAdmin(inst.id, fullName, username, passwordHash, role);

    // Auto-login
    setCurrentAdmin(newAdmin);
    setCurrentInstitution(inst);
    localStorage.setItem('session_admin', JSON.stringify(newAdmin));

    // Log Activity
    db.addLog(inst.id, newAdmin.id, newAdmin.fullName, 'Admin Registered', `New administrator profile created with role ${role} for ${inst.name}.`);
    triggerRefresh();

    navigateTo('admin-dashboard');
    return { success: true };
  };

  const adminLogout = () => {
    if (currentAdmin && currentInstitution) {
      db.addLog(currentInstitution.id, currentAdmin.id, currentAdmin.fullName, 'Admin Logout', 'Administrator logged out of session.');
    }
    setCurrentAdmin(null);
    setCurrentInstitution(null);
    localStorage.removeItem('session_admin');
    navigateTo('landing');
  };

  const voterVerify = (fullName: string, identifierValue: string) => {
    if (!currentVoterElection || !activeElectionId) {
      return { success: false, error: 'No active election selected for voter login.' };
    }

    const result = db.verifyVoterIdentity(
      currentVoterElection.institutionId,
      currentVoterElection.id,
      fullName,
      identifierValue,
      currentVoterElection.voterVerificationMethod
    );

    if (result.success && result.voter) {
      setCurrentVoter(result.voter);
      setCurrentPath('voter-voting');
      return { success: true };
    } else {
      return { success: false, error: result.error || 'Verification failed.' };
    }
  };

  const voterLogout = () => {
    setCurrentVoter(null);
    setCurrentVoterElection(null);
    setActiveElectionId(null);
    navigateTo('landing');
  };

  // SECURE LINK HELPER FUNCTION (Requirement 6)
  const getElectionAccessUrl = (electionId: string): string => {
    const origin = window.location.origin;
    // Build election route using hash router path so it works everywhere instantly
    return `${origin}/#/election/${electionId}`;
  };

  return (
    <AppContext.Provider value={{
      currentAdmin,
      currentInstitution,
      currentVoter,
      currentVoterElection,
      currentPath,
      activeElectionId,
      refreshTrigger,
      triggerRefresh,
      adminLogin,
      adminRegister,
      adminLogout,
      voterVerify,
      voterLogout,
      navigateTo,
      selectVoterElection,
      getElectionAccessUrl
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
