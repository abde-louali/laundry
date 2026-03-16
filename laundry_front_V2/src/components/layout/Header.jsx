import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { LogIn, Bell, Search } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { selectCurrentUser } from '../../store/auth/authSelector';
import { fetchPreteCount, fetchReadyOrders } from '../../store/livreur/livreurThunk';
import { selectReadyOrders, selectSeenNotificationIds } from '../../store/livreur/livreurSelectors';
import { markNotificationsAsSeen } from '../../store/livreur/livreurSlice';
import { fetchPendingCount, fetchPendingOrders } from '../../store/employe/employeThunk';
import { selectPendingOrders, selectSeenNotificationIdsEmploye } from '../../store/employe/employeSelectors';
import { markNotificationsAsSeen as markNotificationsAsSeenEmploye } from '../../store/employe/employeSlice';

const Header = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);
  const isLivreur = user?.role === 'livreur';
  const isEmploye = user?.role === 'employe';
  const isAdmin = user?.role === 'admin';

  // Livreur selectors
  const readyOrders = useSelector(selectReadyOrders);
  const seenIdsLivreur = useSelector(selectSeenNotificationIds);

  // Employe selectors
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
        title: "Nouvelle commande prȇte",
        body: `Commande #${order.numeroCommande} est disponible.`,
        path: '/livreur/ready-for-delivery'
      } : {
        title: "Nouvelle commande",
        body: `Commande #${order.numeroCommande} créée.`,
        path: '/employe/dashboard'
      };

      toast.info(
        <div onClick={() => navigate(toastConfig.path)} className="cursor-pointer">
          <p className="font-semibold text-sm">{toastConfig.title}</p>
          <p className="text-xs text-laundry-text-secondary mt-1">
            {toastConfig.body}
          </p>
        </div>,
        { 
          icon: <Bell size={16} className="text-laundry-primary" />,
          toastId: `order-${order.id}`,
          className: "rounded-lg shadow-card border border-laundry-border"
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
    return 'Dashboard';
  };

  return (
    <header className="h-[60px] bg-white border-b border-laundry-border px-4 md:px-8 flex items-center justify-between sticky top-0 z-40 transition-all">

      {/* LEFT: CONTEXTUAL TITLE */}
      <div className="flex items-center gap-4">
        <h2 className="text-lg md:text-xl font-bold text-laundry-text-primary tracking-tight">
          {getPageTitle()}
        </h2>
      </div>

      {/* RIGHT: SEARCH & USER ACTIONS */}
      <div className="flex items-center gap-4 md:gap-6">
        {/* DESKTOP SEARCH */}
        <div className="hidden sm:flex items-center bg-laundry-background rounded-full px-4 py-1.5 border border-laundry-border focus-within:ring-2 focus-within:ring-laundry-primary-light/50 transition-all">
          <Search size={16} className="text-laundry-text-muted" />
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent border-none outline-none text-sm text-laundry-text-primary px-3 w-40 md:w-56"
          />
        </div>

        {/* NOTIFICATIONS */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={handleToggleNotifications}
            className="relative p-2 rounded-full text-laundry-text-secondary hover:text-laundry-primary hover:bg-laundry-background transition-all outline-none focus:ring-2 focus:ring-laundry-primary/30"
          >
            <Bell size={20} strokeWidth={2} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1.5 min-w-[8px] h-[8px] bg-red-500 rounded-full border-2 border-white"></span>
            )}
          </button>

          {/* DROPDOWN */}
          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white rounded-xl shadow-modal border border-laundry-border overflow-hidden z-50">
              <div className="p-4 border-b border-laundry-border flex items-center justify-between bg-laundry-background/50">
                <h3 className="text-sm font-semibold text-laundry-text-primary">Notifications</h3>
                <span className="text-xs font-medium text-laundry-text-secondary bg-white px-2 py-0.5 rounded-full border border-laundry-border">
                  {notifications.length} au total
                </span>
              </div>

              <div className="max-h-[350px] overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map((order) => (
                    <div 
                      key={order.id}
                      onClick={() => {
                        const targetPath = isLivreur ? '/livreur/ready-for-delivery' : (isAdmin ? '/admin/dashboard' : '/employe/dashboard');
                        navigate(targetPath);
                        setIsNotificationsOpen(false);
                      }}
                      className="p-4 border-b border-laundry-border last:border-0 hover:bg-laundry-background/80 cursor-pointer transition-colors flex items-start gap-3"
                    >
                      <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0">
                        <Bell size={16} className="text-laundry-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-laundry-text-primary">
                          {isLivreur ? (
                            <>Commande <span className="font-semibold text-laundry-primary">#{order.numeroCommande}</span> prête !</>
                          ) : (
                            <>Commande <span className="font-semibold text-laundry-primary">#{order.numeroCommande}</span> créée</>
                          )}
                        </p>
                        <p className="text-xs text-laundry-text-secondary mt-1">
                          {isLivreur ? "Récupérez-la à l'atelier." : "Nouvelle commande en attente."}
                        </p>
                      </div>
                      {!seenIds.includes(order.id) && <div className="w-2 h-2 rounded-full bg-laundry-primary mt-2 flex-shrink-0"></div>}
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-laundry-text-muted">
                    <p className="text-sm font-medium">Aucune nouvelle notification</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* USER PROFILE */}
        {!user ? (
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 bg-laundry-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-laundry-primary-light transition-all shadow-sm"
          >
            <LogIn size={16} />
            <span className="hidden sm:inline">Connexion</span>
          </button>
        ) : (
          <div className="flex items-center gap-3 pl-4 border-l-2 border-laundry-border">
            <div className="hidden lg:flex flex-col items-end">
              <span className="text-sm font-semibold text-laundry-text-primary truncate max-w-[120px]">{user.name}</span>
            </div>
            <div className="w-8 h-8 bg-laundry-sidebar-bg text-white rounded-full flex items-center justify-center font-bold text-sm shadow-sm cursor-pointer hover:ring-2 hover:ring-offset-2 hover:ring-laundry-primary transition-all">
              {user.name?.[0].toUpperCase()}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
