import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireAdmin = false }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  // Se não estiver autenticado, redireciona para login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Se requer admin mas não é admin, redireciona para home
  if (requireAdmin && user.role !== 'AdministradorSistema') {
    return <Navigate to="/" replace />;
  }

  // Se é admin, permite acesso total
  if (user.role === 'AdministradorSistema') {
    return <>{children}</>;
  }

  // Se for proprietário, verifica status de aprovação e se está ativo
  const isApproved = user.establishment?.statusAprovacao === 'Aprovado';
  const isActive = user.establishment?.active !== false; // undefined ou true = ativo
  const isPendingRoute = location.pathname === '/pending-approval';

  // Se não foi aprovado OU está inativo, redireciona para pending
  if ((!isApproved || !isActive) && !isPendingRoute) {
    return <Navigate to="/pending-approval" replace />;
  }

  // Se está aprovado E ativo, não deixa acessar a página de pending
  if (isApproved && isActive && isPendingRoute) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;

