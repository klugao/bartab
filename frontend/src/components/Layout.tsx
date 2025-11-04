import { useEffect, useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { HomeIcon, UsersIcon, CubeIcon, ChartBarIcon, BanknotesIcon, Bars3Icon, XMarkIcon, ArrowRightOnRectangleIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { SyncManager } from './SyncManager';

const Layout = () => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const navigation = [
    { name: 'Contas', href: '/', icon: HomeIcon },
    { name: 'Clientes', href: '/customers', icon: UsersIcon },
    { name: 'Produtos', href: '/items', icon: CubeIcon },
    { name: 'Dívidas', href: '/debts', icon: BanknotesIcon },
    { name: 'Relatórios', href: '/reports', icon: ChartBarIcon },
  ];

  // Adiciona link de admin se for administrador
  const isAdmin = user?.role === 'AdministradorSistema';
  if (isAdmin) {
    navigation.push({ name: 'Admin', href: '/admin', icon: ShieldCheckIcon });
  }

  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const closeDrawer = () => setMobileOpen(false);

  return (
    <div>
      {/* Header */}
      <header className="header">
        <div className="container">
          <div className="nav">
            <div className="flex items-center">
              <button
                type="button"
                className="md:hidden -ml-1 p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Abrir menu"
                onClick={() => setMobileOpen(true)}
              >
                <Bars3Icon className="w-6 h-6 text-blue-600" />
              </button>
              <h1 className="ml-2 text-xl font-bold">
                Bartab
              </h1>
            </div>
            {/* Navegação desktop */}
            <nav className="hidden md:flex gap-4">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`nav-link flex items-center gap-1 ${isActive ? 'active' : ''}`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
            {/* User menu */}
            <div className="flex items-center gap-3">
              <div className="hidden md:block text-right">
                <div className="text-sm font-medium text-gray-900">{user?.establishment.name}</div>
                <div className="text-xs text-gray-500">{user?.name}</div>
              </div>
              {user?.picture && (
                <img 
                  src={user.picture} 
                  alt={user.name} 
                  className="w-8 h-8 rounded-full"
                />
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="flex items-center gap-1"
              >
                <ArrowRightOnRectangleIcon className="w-4 h-4" />
                <span className="hidden md:inline">Sair</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="main">
        <div className="container">
          <Outlet />
        </div>
      </main>

      {/* Gerenciador de sincronização offline */}
      <SyncManager />

      {/* Drawer lateral mobile */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/40" onClick={closeDrawer} />
          <div className="absolute left-0 top-0 h-full w-72 max-w-[80vw] bg-white shadow-xl transform transition-transform duration-200 translate-x-0">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <span className="text-lg font-semibold">Menu</span>
              <button
                type="button"
                className="p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Fechar menu"
                onClick={closeDrawer}
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <div className="px-4 py-3 border-b bg-gray-50">
              <div className="flex items-center gap-3">
                {user?.picture && (
                  <img 
                    src={user.picture} 
                    alt={user.name} 
                    className="w-10 h-10 rounded-full"
                  />
                )}
                <div>
                  <div className="text-sm font-medium text-gray-900">{user?.establishment.name}</div>
                  <div className="text-xs text-gray-500">{user?.name}</div>
                </div>
              </div>
            </div>
            <nav className="px-2 py-2">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={closeDrawer}
                    className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm ${isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'}`}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                );
              })}
              <button
                onClick={() => {
                  closeDrawer();
                  logout();
                }}
                className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-red-600 hover:bg-red-50 w-full mt-2"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5" />
                Sair
              </button>
            </nav>
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout;
