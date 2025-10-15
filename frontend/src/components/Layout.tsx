import { useEffect, useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { HomeIcon, UsersIcon, CubeIcon, ChartBarIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

const Layout = () => {
  const location = useLocation();

  const navigation = [
    { name: 'Contas', href: '/', icon: HomeIcon },
    { name: 'Clientes', href: '/customers', icon: UsersIcon },
    { name: 'Produtos', href: '/items', icon: CubeIcon },
    { name: 'Relatórios', href: '/reports', icon: ChartBarIcon },
  ];

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
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="main">
        <div className="container">
          <Outlet />
        </div>
      </main>

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
            </nav>
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout;
