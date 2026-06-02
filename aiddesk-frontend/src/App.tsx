import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import MainLayout from './layouts/MainLayout/MainLayout';
import { Role } from './types';
import Spinner from './components/ui/Spinner/Spinner';

const LoginPage         = lazy(() => import('./pages/Login/LoginPage'));
const RegisterPage      = lazy(() => import('./pages/Register/RegisterPage'));
const DashboardPage     = lazy(() => import('./pages/Dashboard/DashboardPage'));
const TicketsPage       = lazy(() => import('./pages/Tickets/TicketsPage'));
const TicketDetailsPage = lazy(() => import('./pages/TicketDetails/TicketDetailsPage'));
const CreateTicketPage  = lazy(() => import('./pages/CreateTicket/CreateTicketPage'));
const ProfilePage       = lazy(() => import('./pages/Profile/ProfilePage'));
const SupportPage       = lazy(() => import('./pages/Support/SupportPage'));
const ManagerPage       = lazy(() => import('./pages/Manager/ManagerPage'));
const UsersPage         = lazy(() => import('./pages/Users/UsersPage'));
const AuditLogsPage     = lazy(() => import('./pages/AuditLogs/AuditLogsPage'));

const PageLoader = () => <Spinner centered size="lg" />;

const App: React.FC = () => (
  <BrowserRouter>
    <AuthProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: { borderRadius: '10px', fontSize: '14px', boxShadow: '0 4px 12px rgba(0,0,0,0.12)' },
        }}
      />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public */}
          <Route path="/login"    element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Any authenticated user */}
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/dashboard"   element={<DashboardPage />} />
              <Route path="/tickets"     element={<TicketsPage />} />
              <Route path="/tickets/:id" element={<TicketDetailsPage />} />
              <Route path="/profile"     element={<ProfilePage />} />

              {/* Client, Manager, Admin can create tickets */}
              <Route element={<ProtectedRoute requiredRoles={[Role.Client, Role.Manager, Role.Admin]} />}>
                <Route path="/tickets/new" element={<CreateTicketPage />} />
              </Route>

              {/* Support only */}
              <Route element={<ProtectedRoute requiredRoles={[Role.Support]} />}>
                <Route path="/support" element={<SupportPage />} />
              </Route>

              {/* Manager + Admin: shared management pages */}
              <Route element={<ProtectedRoute requiredRoles={[Role.Manager, Role.Admin]} />}>
                <Route path="/manager" element={<ManagerPage />} />
                <Route path="/users"   element={<UsersPage />} />
              </Route>

              {/* Admin only: audit log */}
              <Route element={<ProtectedRoute requiredRoles={[Role.Admin]} />}>
                <Route path="/audit-logs" element={<AuditLogsPage />} />
              </Route>
            </Route>
          </Route>

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Suspense>
    </AuthProvider>
  </BrowserRouter>
);

export default App;
