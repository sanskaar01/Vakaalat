import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { BlissScenicBackdrop } from './components/BlissScenicBackdrop';
import { Navbar } from './components/Navbar';
import { AppProvider, useApp } from './context/AppContext';
import { AuthPage } from './pages/AuthPage';
import { ClientDashboard } from './pages/ClientDashboard';
import { CourtOfPeoplePage } from './pages/CourtOfPeoplePage';
import { LandingPage } from './pages/LandingPage';
import { LawyerDashboard } from './pages/LawyerDashboard';
import { LeaderboardPage } from './pages/LeaderboardPage';

const ProtectedRoute: React.FC<{ role: 'client' | 'lawyer'; children: React.ReactNode }> = ({
  role,
  children,
}) => {
  const { user } = useApp();
  if (!user) return <Navigate to="/auth" replace />;
  if (user.role !== role) {
    return <Navigate to={user.role === 'lawyer' ? '/lawyer/dashboard' : '/client/dashboard'} replace />;
  }
  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <AppProvider>
      <BrowserRouter>
        <div className="xp-desktop-bg xp-pixel-grid relative min-h-screen flex flex-col">
          <BlissScenicBackdrop />
          <Navbar />
          <main className="relative z-10 flex-1">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/court" element={<CourtOfPeoplePage />} />
              <Route path="/leaderboard" element={<LeaderboardPage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route
                path="/client/dashboard"
                element={
                  <ProtectedRoute role="client">
                    <ClientDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/lawyer/dashboard"
                element={
                  <ProtectedRoute role="lawyer">
                    <LawyerDashboard />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AppProvider>
  );
};

export default App;
