import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { BlissScenicBackdrop } from './components/BlissScenicBackdrop';
import { Navbar } from './components/Navbar';
import { AppProvider, useApp } from './context/AppContext';
import { LandingPage } from './pages/LandingPage';

const CourtOfPeoplePage = lazy(() =>
  import('./pages/CourtOfPeoplePage').then((m) => ({ default: m.CourtOfPeoplePage }))
);
const LeaderboardPage = lazy(() =>
  import('./pages/LeaderboardPage').then((m) => ({ default: m.LeaderboardPage }))
);
const AuthPage = lazy(() =>
  import('./pages/AuthPage').then((m) => ({ default: m.AuthPage }))
);
const ClientDashboard = lazy(() =>
  import('./pages/ClientDashboard').then((m) => ({ default: m.ClientDashboard }))
);
const LawyerDashboard = lazy(() =>
  import('./pages/LawyerDashboard').then((m) => ({ default: m.LawyerDashboard }))
);

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
            <Suspense
              fallback={
                <div className="mx-auto max-w-xl p-10 text-center text-xs font-bold text-[var(--text-secondary)]">
                  Loading...
                </div>
              }
            >
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
            </Suspense>
          </main>
        </div>
      </BrowserRouter>
    </AppProvider>
  );
};

export default App;
