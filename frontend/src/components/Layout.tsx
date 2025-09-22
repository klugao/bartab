import { Outlet, Link, useLocation } from 'react-router-dom';
import { HomeIcon, UsersIcon, CubeIcon, Bars3Icon } from '@heroicons/react/24/outline';

const Layout = () => {
  const location = useLocation();

  const navigation = [
    { name: 'Contas', href: '/', icon: HomeIcon },
    { name: 'Clientes', href: '/customers', icon: UsersIcon },
    { name: 'Produtos', href: '/items', icon: CubeIcon },
  ];

  return (
    <div>
      {/* Header */}
      <header className="header">
        <div className="container">
          <div className="nav">
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Bars3Icon style={{ width: '1.25rem', height: '1.25rem', color: '#2563eb' }} />
              <h1 style={{ marginLeft: '0.75rem', fontSize: '1.25rem', fontWeight: '600' }}>
                Bartab
              </h1>
            </div>
            <nav className="nav-links">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`nav-link ${isActive ? 'active' : ''}`}
                  >
                    <item.icon style={{ width: '0.875rem', height: '0.875rem', marginRight: '0.25rem' }} />
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
    </div>
  );
};

export default Layout;
