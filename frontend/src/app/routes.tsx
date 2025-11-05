import { createBrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import ProtectedRoute from '../components/ProtectedRoute';
import ConsentModalWrapper from '../components/ConsentModalWrapper';
import Home from '../pages/Home';
import TabDetail from '../pages/TabDetail';
import Customers from '../pages/Customers';
import Items from '../pages/Items';
import Reports from '../pages/Reports';
import Debts from '../pages/Debts';
import OfflineData from '../pages/OfflineData';
import Settings from '../pages/Settings';
import Login from '../pages/Login';
import Register from '../pages/Register';
import AuthCallback from '../pages/AuthCallback';
import PendingApproval from '../pages/PendingApproval';
import AdminDashboard from '../pages/AdminDashboard';
import PoliticaPrivacidade from '../pages/PoliticaPrivacidade';
import TermosUso from '../pages/TermosUso';
import PrivacySettings from '../pages/PrivacySettings';

// Wrapper para incluir o AuthProvider em todas as rotas
const AuthWrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>
    <ConsentModalWrapper />
    {children}
  </AuthProvider>
);

export const router = createBrowserRouter([
  {
    path: '/login',
    element: (
      <AuthWrapper>
        <Login />
      </AuthWrapper>
    ),
  },
  {
    path: '/register',
    element: (
      <AuthWrapper>
        <Register />
      </AuthWrapper>
    ),
  },
  {
    path: '/auth/callback',
    element: (
      <AuthWrapper>
        <AuthCallback />
      </AuthWrapper>
    ),
  },
  {
    path: '/pending-approval',
    element: (
      <AuthWrapper>
        <ProtectedRoute>
          <PendingApproval />
        </ProtectedRoute>
      </AuthWrapper>
    ),
  },
  {
    path: '/',
    element: (
      <AuthWrapper>
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      </AuthWrapper>
    ),
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: 'tab/:id',
        element: <TabDetail />,
      },
      {
        path: 'customers',
        element: <Customers />,
      },
      {
        path: 'items',
        element: <Items />,
      },
      {
        path: 'reports',
        element: <Reports />,
      },
      {
        path: 'debts',
        element: <Debts />,
      },
      {
        path: 'offline-data',
        element: <OfflineData />,
      },
      {
        path: 'settings',
        element: <Settings />,
      },
      {
        path: 'admin',
        element: <AdminDashboard />,
      },
      {
        path: 'privacy-settings',
        element: <PrivacySettings />,
      },
    ],
  },
  // Rotas públicas (sem autenticação) para documentos legais
  {
    path: '/politica-privacidade',
    element: (
      <AuthWrapper>
        <PoliticaPrivacidade />
      </AuthWrapper>
    ),
  },
  {
    path: '/termos-uso',
    element: (
      <AuthWrapper>
        <TermosUso />
      </AuthWrapper>
    ),
  },
]);
