import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { LogIn, User, Bell, Search } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { selectCurrentUser } from '../../store/auth/authSelector';
import { fetchPreteCount, fetchReadyOrders } from '../../store/livreur/livreurThunk';
import { selectPreteCount, selectReadyOrders, selectSeenNotificationIds } from '../../store/livreur/livreurSelectors';
import { markNotificationsAsSeen } from '../../store/livreur/livreurSlice';
import { fetchPendingCount, fetchPendingOrders } from '../../store/employe/employeThunk';
import { selectPendingCount, selectPendingOrders, selectSeenNotificationIdsEmploye } from '../../store/employe/employeSelectors';
import { markNotificationsAsSeen as markNotificationsAsSeenEmploye } from '../../store/employe/employeSlice';

const Header = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);
  const isLivreur = user?.role === 'livreur';
  const isEmploye = user?.role === 'employe';
  const isAdmin = user?.role === 'admin';

  // Livreur selectors
  const preteCount = useSelector(selectPreteCount);
  const readyOrders = useSelector(selectReadyOrders);
  const seenIdsLivreur = useSelector(selectSeenNotificationIds);

  // Employe selectors
  const pendingCount = useSelector(selectPendingCount);
  const pendingOrders = useSelector(selectPendingOrders);
  const seenIdsEmploye = useSelector(selectSeenNotificationIdsEmploye);

  const location = useLocation();
  const navigate = useNavigate();
  const dropdownRef = React.useRef(null);
  const [isNotificationsOpen, setIsNotificationsOpen] = React.useState(false);

  // Unified Notification Data & Daily Cleanup
  const notifications = React.useMemo(() => {
    const rawList = isLivreur ? readyOrders : (isEmploye || isAdmin ? pendingOrders : []);
    
    // Cleanup: Filter to show only notifications from TODAY
    const today = new Date().setHours(0, 0, 0, 0);
    return rawList.filter(order => {
      const orderDate = new Date(order.createdAt || order.dateCreation).setHours(0, 0, 0, 0);
      return orderDate === today;
    });
  }, [isLivreur, isEmploye, isAdmin, readyOrders, pendingOrders]);

  const seenIds = isLivreur ? seenIdsLivreur : (isEmploye || isAdmin ? seenIdsEmploye : []);
  const unreadCount = notifications.filter(order => !seenIds.includes(order.id)).length;

  // Close dropdown on outside click
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 🔔 GLOBAL NOTIFICATIONS: Poll based on role
  React.useEffect(() => {
    if (!user?.role) return;

    const poll = () => {
      if (isLivreur) {
        dispatch(fetchPreteCount());
        dispatch(fetchReadyOrders());
      } else if (isEmploye || isAdmin) {
        dispatch(fetchPendingCount());
        dispatch(fetchPendingOrders());
      }
    };
    
    poll();
    const interval = setInterval(poll, 30000);
    return () => clearInterval(interval);
  }, [dispatch, user, isLivreur, isEmploye]);

  const handleToggleNotifications = () => {
    const nextState = !isNotificationsOpen;
    setIsNotificationsOpen(nextState);
    
    // Facebook style: mark all as seen as soon as we open the dropdown
    if (nextState && unreadCount > 0) {
      if (isLivreur) {
        dispatch(markNotificationsAsSeen());
      } else if (isEmploye || isAdmin) {
        dispatch(markNotificationsAsSeenEmploye());
      }
    }
  };

  const prevReadyOrdersIds = React.useRef(new Set());
  const isFirstLoad = React.useRef(true);

  // Toast alerts for NEW orders
  React.useEffect(() => {
    if (!user?.role || !notifications) return;

    // Filter for orders that were not in the previous set
    const newItems = notifications.filter(order => !prevReadyOrdersIds.current.has(order.id));

    // skip toasts on first load after refresh - just populate the ref
    if (isFirstLoad.current) {
        notifications.forEach(o => prevReadyOrdersIds.current.add(o.id));
        seenIds.forEach(id => prevReadyOrdersIds.current.add(id));
        isFirstLoad.current = false;
        return;
    }

    newItems.forEach(order => {
      if (seenIds.includes(order.id)) return;

      const toastConfig = isLivreur ? {
        title: "📦 Nouvelle commande prȇte !",
        body: `Commande #${order.numeroCommande} est disponible.`,
        path: '/livreur/ready-for-delivery'
      } : {
        title: "📦 Nouvelle commande !",
        body: `Commande #${order.numeroCommande} créée par ${order.livreur?.name || 'un livreur'}.`,
        path: '/employe/dashboard'
      };

      toast.info(
        <div onClick={() => navigate(toastConfig.path)} className="cursor-pointer">
          <p className="font-black uppercase tracking-widest text-[10px]">{toastConfig.title}</p>
          <p className="text-[10px] font-bold text-laundry-primary mt-1">
            {toastConfig.body}
          </p>
          <p className="text-[9px] opacity-70 mt-1">Cliquez pour voir la liste.</p>
        </div>,
        { 
          icon: <Bell size={16} className="text-laundry-primary" />,
          toastId: `order-${order.id}`
        }
      );
    });

    prevReadyOrdersIds.current = new Set(notifications.map(o => o.id));
  }, [notifications, user, navigate, seenIds, isLivreur]);

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
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={handleToggleNotifications}
            className={`relative p-2 rounded-xl transition-all ${isNotificationsOpen ? 'bg-laundry-sky text-laundry-primary' : 'text-laundry-deep/60 hover:text-laundry-primary hover:bg-laundry-sky'}`}
          >
            <Bell size={20} strokeWidth={2.5} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-black rounded-full border-2 border-white flex items-center justify-center px-1 animate-bounce">
                {unreadCount}
              </span>
            )}
          </button>

          {/* FACEBOOK STYLE DROPDOWN */}
          {isNotificationsOpen && (
            <div className="absolute right-0 mt-3 w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-laundry-sky/30 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="p-4 border-b border-laundry-sky/20 flex items-center justify-between bg-laundry-sky/10">
                <h3 className="text-sm font-black text-laundry-deep uppercase tracking-tighter">Notifications</h3>
                <span className="text-[10px] font-bold text-laundry-primary bg-white px-2 py-0.5 rounded-full border border-laundry-sky">
                  {notifications.length} au total
                </span>
              </div>

              <div className="max-h-[400px] overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map((order) => (
                    <div 
                      key={order.id}
                      onClick={() => {
                        const targetPath = isLivreur ? '/livreur/ready-for-delivery' : (isAdmin ? '/admin/dashboard' : '/employe/dashboard');
                        navigate(targetPath);
                        setIsNotificationsOpen(false);
                      }}
                      className="p-4 border-b border-laundry-sky/10 hover:bg-laundry-sky/20 cursor-pointer transition-colors flex items-start gap-3"
                    >
                      <div className="w-10 h-10 rounded-full bg-laundry-fresh/10 border border-laundry-fresh/20 flex items-center justify-center flex-shrink-0">
                        <Bell size={18} className="text-laundry-fresh" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-laundry-deep leading-relaxed">
                          {isLivreur ? (
                            <>Votre commande <span className="font-black text-laundry-primary">#{order.numeroCommande}</span> est prête à être livrée !</>
                          ) : (
                            <>Nouvelle commande <span className="font-black text-laundry-primary">#{order.numeroCommande}</span> créée par <span className="font-black">{order.livreur?.name}</span></>
                          )}
                        </p>
                        <p className="text-[10px] text-laundry-primary/60 mt-1 font-bold italic">
                          {isLivreur ? "Rendez-vous à l'atelier pour la récupérer." : "Consultez les détails pour commencer le traitement."}
                        </p>
                      </div>
                      {!seenIds.includes(order.id) && <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>}
                    </div>
                  ))
                ) : (
                  <div className="p-12 text-center">
                    <div className="w-16 h-16 bg-laundry-sky/30 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Bell size={24} className="text-laundry-primary/30" />
                    </div>
                    <p className="text-xs font-black text-laundry-primary/40 uppercase tracking-widest leading-tight">Aucune nouvelle<br/>notification</p>
                  </div>
                )}
              </div>

              {notifications.length > 0 && (
                <div className="p-3 bg-laundry-sky/5 text-center border-t border-laundry-sky/10">
                  <button 
                    onClick={() => {
                      const targetPath = isLivreur ? '/livreur/ready-for-delivery' : (isAdmin ? '/admin/dashboard' : '/employe/dashboard');
                      navigate(targetPath);
                      setIsNotificationsOpen(false);
                    }}
                    className="text-[10px] font-black text-laundry-primary uppercase tracking-widest hover:underline"
                  >
                    {isLivreur ? "Voir toutes les livraisons" : "Voir toutes les commandes"}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

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
