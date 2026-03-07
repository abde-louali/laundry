import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { LogIn, User, Bell, Search } from 'lucide-react';
import { selectCurrentUser } from '../../store/auth/authSelector';

const Header = () => {
  const user = useSelector(selectCurrentUser);
  const location = useLocation();
  const navigate = useNavigate();

  // CONTEXTUAL TITLE LOGIC
  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('/admin/users-management')) return 'Gestion Utilisateurs';
    if (path.includes('/livreur/dashboard')) return 'Tableau de Bord';
    if (path.includes('/livreur/register-client')) return 'Enregistrement Client';
    if (path.includes('/livreur/create-order')) return 'Nouvelle Commande';
    if (path.includes('/livreur/ready-for-delivery')) return 'Livraisons Prêtes';
    if (path.includes('/livreur/delivery')) return 'Détails Livraison';
    return 'Pure Clean';
  };

  return (
    <header className="h-16 md:h-20 bg-white/50 backdrop-blur-sm border-b border-laundry-sky/30 px-4 md:px-8 flex items-center justify-between sticky top-0 z-40 transition-all">

      {/* LEFT: CONTEXTUAL TITLE */}
      <div className="flex flex-col">
        <h2 className="text-lg md:text-xl font-black text-laundry-deep uppercase tracking-tighter leading-none">
          {getPageTitle()}
        </h2>
        <div className="flex items-center gap-2 mt-1">
          <div className="w-1.5 h-1.5 rounded-full bg-laundry-fresh"></div>
          <span className="text-[10px] font-black text-laundry-primary uppercase tracking-[0.2em]">Live System</span>
        </div>
      </div>

      {/* RIGHT: SEARCH & USER ACTIONS */}
      <div className="flex items-center gap-3 md:gap-6">
        {/* DESKTOP SEARCH (Placeholder) */}
        <div className="hidden sm:flex items-center bg-laundry-sky/50 rounded-2xl px-4 py-2 border border-laundry-sky/50 group focus-within:bg-white transition-all">
          <Search size={16} className="text-laundry-primary" />
          <input
            type="text"
            placeholder="Rechercher..."
            className="bg-transparent border-none outline-none text-xs font-bold text-laundry-deep px-2 placeholder:text-laundry-primary/40 w-32 md:w-48"
          />
        </div>

        {/* NOTIFICATIONS */}
        <button className="relative p-2 text-laundry-deep/60 hover:text-laundry-primary hover:bg-laundry-sky rounded-xl transition-all">
          <Bell size={20} strokeWidth={2.5} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        {/* MOBILE USER AVATAR (Simplified) */}
        {!user ? (
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 bg-laundry-primary text-white px-4 py-2 rounded-xl text-xs font-black shadow-lg shadow-laundry-primary/20 hover:bg-laundry-deep transition-all active:scale-95"
          >
            <LogIn size={18} strokeWidth={3} />
            <span className="hidden sm:inline uppercase">Connexion</span>
          </button>
        ) : (
          <div className="md:hidden flex items-center gap-2 p-1 pr-3 bg-laundry-sky rounded-full border border-laundry-sky">
            <div className="w-8 h-8 bg-laundry-primary text-white rounded-full flex items-center justify-center font-black text-xs">
              {user.name?.[0].toUpperCase()}
            </div>
            <span className="text-[10px] font-black text-laundry-primary uppercase tracking-tighter truncate max-w-[60px]">{user.name}</span>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
