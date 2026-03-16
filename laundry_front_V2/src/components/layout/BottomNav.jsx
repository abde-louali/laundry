import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, ClipboardList, UserPlus, Package, User, Wrench, XCircle, Shield, Users, RefreshCw } from 'lucide-react';

const BottomNav = ({ user }) => {
  const location = useLocation();

  if (!user) return null;

  const adminLinks = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: Home },
    { name: 'Contrôle', path: '/admin/users-management', icon: Shield },
    { name: 'Commandes', path: '/admin/commandes', icon: ClipboardList },
    { name: 'Clients', path: '/admin/clients', icon: Users },
  ];

  const livreurLinks = [
    { name: 'Home', path: '/livreur/dashboard', icon: Home },
    { name: 'Gestion', path: '/livreur/register-client', icon: UserPlus },
    { name: 'Collecte', path: '/livreur/create-order', icon: Package },
    { name: 'Prêtes', path: '/livreur/ready-for-delivery', icon: ClipboardList },
    { name: 'Annulées', path: '/livreur/canceled-deliveries', icon: XCircle },
  ];

  const employeLinks = [
    { name: 'Atelier', path: '/employe/dashboard', icon: Wrench },
    { name: 'Retours', path: '/employe/retours', icon: RefreshCw },
  ];

  const links = user?.role === 'admin' ? adminLinks : user?.role === 'livreur' ? livreurLinks : user?.role === 'employe' ? employeLinks : [];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 h-16 bg-surface border-t border-border flex items-center justify-around px-2 shadow-modal">
      {links.map((link) => {
        const Icon = link.icon;
        const isActive = location.pathname === link.path;

        return (
          <Link
            key={link.path}
            to={link.path}
            className={`relative flex flex-col items-center justify-center min-w-[64px] transition-all duration-200 ${isActive
              ? 'text-primary-600'
              : 'text-text-muted hover:text-text-primary'
              }`}
          >
            <div className={`p-1.5 rounded-xl transition-colors ${isActive ? 'bg-primary-50' : ''}`}>
              <Icon
                size={20}
                className={`transition-transform ${isActive ? 'scale-110' : ''}`}
              />
            </div>
            
            {isActive && (
              <div className="absolute -bottom-1 w-1 h-1 rounded-full bg-primary-500 shadow-[0_0_8px_rgba(249,115,22,0.6)]" />
            )}
            <span className={`text-[10px] font-bold mt-0.5 transition-all ${isActive ? 'opacity-100' : 'opacity-70'}`}>
              {link.name}
            </span>
          </Link>
        );
      })}
    </nav>
  );
};

export default BottomNav;
