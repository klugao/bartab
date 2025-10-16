import { createBrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import ProtectedRoute from '../components/ProtectedRoute';
import Home from '../pages/Home';
import TabDetail from '../pages/TabDetail';
import Customers from '../pages/Customers';
import Items from '../pages/Items';
import Reports from '../pages/Reports';
import Debts from '../pages/Debts';
import Login from '../pages/Login';
import Register from '../pages/Register';
import AuthCallback from '../pages/AuthCallback';

// Wrapper para incluir o AuthProvider em todas as rotas
const AuthWrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
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
    ],
  },
]);
