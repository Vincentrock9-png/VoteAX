/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { LandingPage } from './components/LandingPage';
import { AdminAuth } from './components/AdminAuth';
import { VoterPortal } from './components/VoterPortal';
import { VotingScreen } from './components/VotingScreen';
import { AdminDashboard } from './components/AdminDashboard';
import { PublicResults } from './components/PublicResults';
import { VoterLogin } from './components/VoterLogin';

const AppContent: React.FC = () => {
  const { currentPath } = useApp();

  // Dynamic Routing Switcher based on the App State Managed Hash Listener
  switch (currentPath) {
    case 'landing':
      return <LandingPage />;
      
    case 'admin-login':
    case 'admin-register':
      return <AdminAuth />;
      
    case 'admin-dashboard':
      return <AdminDashboard />;
      
    case 'voter-verify':
      return <VoterPortal />;
      
    case 'voter-login':
      return <VoterLogin />;
      
    case 'voter-voting':
      return <VotingScreen />;
      
    case 'results-public':
      return <PublicResults />;
      
    default:
      return <LandingPage />;
  }
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
