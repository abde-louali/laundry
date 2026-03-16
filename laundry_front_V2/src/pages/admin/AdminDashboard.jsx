import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  TrendingUp, Search, Bell, ShoppingCart, 
  DollarSign, ClipboardList, Clock, 
  RefreshCw, Loader2, AlertCircle, 
  ArrowUpRight, ArrowDownRight, MoreHorizontal,
  ChevronRight
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, Area, 
  PieChart, Pie, Cell, 
  Tooltip, XAxis, YAxis, CartesianGrid 
} from 'recharts';
import { 
  fetchTodayStatistics, 
  fetchOverallStatistics, 
  fetchLastNDaysStatistics 
} from '../../store/statistics/statisticsThunks';
import { fetchAllCommandes } from '../../store/admin/adminThunk';
import {
  selectTodayStats, selectOverallStats, selectLastNDays,
  selectStatisticsLoading, selectStatisticsError
} from '../../store/statistics/statisticsSelectors';
import { selectAllCommandes } from '../../store/admin/adminSelectors';
import { selectCurrentUser } from '../../store/auth/authSelector';
import { StatusBadge } from '../../components/StatusBadge';

// ─── Helpers ────────────────────────────────────────────────────────────────

const fmt = (n) => (n ?? 0).toLocaleString('fr-MA');

// ─── Sub-components ──────────────────────────────────────────────────────────

function KpiCard({ icon: Icon, label, value, trend, trendValue, bgColorClass, iconColorClass }) {
  return (
    <div className="bg-surface rounded-2xl p-4 md:p-6 shadow-card hover:shadow-card-hover transition-all duration-300 border border-border/50 group">
      <div className="flex items-start justify-between mb-3 md:mb-4">
        <div className={`w-10 h-10 md:w-12 md:h-12 ${bgColorClass} rounded-xl md:rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110`}>
          <Icon size={20} className={iconColorClass} md:size={24} />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs md:text-[10px] md:font-bold ${trend === 'up' ? 'text-green-500 md:bg-green-50 md:text-green-600' : 'text-red-500 md:bg-red-50 md:text-red-600'}`}>
            {trend === 'up' ? (
              <span className="flex items-center gap-1">{trendValue}% <ArrowUpRight size={12} className="hidden md:block" /></span>
            ) : (
              <span className="flex items-center gap-1">{trendValue}% <ArrowDownRight size={12} className="hidden md:block" /></span>
            )}
          </div>
        )}
      </div>
      <div>
        <h3 className="text-xs md:font-bold text-text-muted md:uppercase md:tracking-wider mb-1">{label}</h3>
        <p className="text-xl md:text-2xl font-bold md:font-black text-text-primary tracking-tight">{value}</p>
      </div>
    </div>
  );
}

// ─── MAIN PAGE ───────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);
  
  // Stats selectors
  const todayStats = useSelector(selectTodayStats);
  const overall = useSelector(selectOverallStats);
  const lastNDays = useSelector(selectLastNDays);
  const loading = useSelector(selectStatisticsLoading);
  const error = useSelector(selectStatisticsError);
  
  // Admin selectors for recent orders
  const allCommandes = useSelector(selectAllCommandes);
  const recentOrders = useMemo(() => {
    return Array.isArray(allCommandes) ? [...allCommandes].sort((a, b) => new Date(b.dateCreation) - new Date(a.dateCreation)).slice(0, 5) : [];
  }, [allCommandes]);

  const [chartDays, setChartDays] = useState(7);

  useEffect(() => {
    dispatch(fetchTodayStatistics());
    dispatch(fetchOverallStatistics());
    dispatch(fetchLastNDaysStatistics(chartDays));
    dispatch(fetchAllCommandes({ limit: 10 }));
  }, [dispatch, chartDays]);

  const initials = (name) => {
    if (!name) return 'AD';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  };

  // Pie chart data preparation
  const pieData = useMemo(() => {
    if (!overall?.commandesByStatus) return { mobile: [], desktop: [] };
    
    // Normalize keys to uppercase for reliable lookup
    const stats = {};
    Object.entries(overall.commandesByStatus).forEach(([k, v]) => {
      stats[k.toUpperCase()] = v;
    });

    // Special grouping for mobile (simplified)
    const completed = (stats['PAYEE'] || 0) + (stats['LIVREE'] || 0);
    const inProgress = (stats['EN_TRAITEMENT'] || 0) + (stats['VALIDEE'] || 0) + (stats['PRETE'] || 0);
    const cancelled = (stats['ANNULEE'] || 0);

    // Full breakdown for desktop
    const fullBreakdown = Object.entries(stats).map(([key, value]) => ({
      name: key.replace('_', ' ').toUpperCase(),
      value: value
    }));
    
    return {
      mobile: [
        { name: 'Complétées', value: completed, color: '#F97316' },
        { name: 'En cours', value: inProgress, color: '#10B981' },
        { name: 'Annulées', value: cancelled, color: '#14B8A6' }
      ],
      desktop: fullBreakdown
    };
  }, [overall]);

  const COLORS = ['#F97316', '#6366F1', '#14B8A6', '#8B5CF6', '#EC4899', '#FBBF24', '#EF4444'];
  const totalPie = useMemo(() => {
    if (!overall?.commandesByStatus) return 0;
    return Object.values(overall.commandesByStatus).reduce((acc, curr) => acc + (Number(curr) || 0), 0);
  }, [overall]);

  return (
    <div className="space-y-4 md:space-y-8 pb-20 md:pb-12 animate-fade-in -mt-4 md:mt-0">

      {/* MOBILE TOPBAR */}
      <div className="md:hidden bg-white border-b border-border h-14 px-4 flex items-center justify-between sticky top-0 z-50 -mx-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-bold text-sm shadow-sm">
            {initials(user?.name)}
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-text-muted font-medium">Tableau de bord</span>
            <span className="text-lg font-bold text-text-primary leading-tight">Bonjour, {user?.name?.split(' ')[0] || 'Admin'}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-text-primary">
            <Search size={18} />
          </button>
          <div className="relative">
            <button className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-text-primary">
              <Bell size={18} />
            </button>
            <div className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white" />
          </div>
        </div>
      </div>

      {/* ERROR MESSAGE */}
      {error && (
        <div className="bg-red-50 border border-red-100 p-4 rounded-xl flex items-center gap-3 text-red-600 animate-slide-up mx-2 md:mx-0">
          <AlertCircle size={20} />
          <p className="text-sm font-semibold">{typeof error === 'string' ? error : 'Une erreur est survenue'}</p>
        </div>
      )}

      {/* DASHBOARD HEADER (Desktop Only) */}
      <div className="hidden md:flex flex-col md:flex-row md:items-center justify-between gap-4 bg-primary-600 rounded-3xl p-6 md:p-8 text-white shadow-xl shadow-primary-500/20 relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-2xl md:text-3xl font-black tracking-tight mb-2">Performance du Jour</h2>
          <p className="text-primary-100 text-sm font-medium opacity-90 max-w-md">
            Gérez vos opérations en temps réel. Voici un aperçu rapide de l'activité de votre établissement.
          </p>
        </div>
        <div className="flex gap-3 relative z-10">
          <button 
            onClick={() => dispatch(fetchTodayStatistics())}
            className="px-4 py-2.5 bg-white/15 backdrop-blur-md border border-white/20 rounded-xl text-xs font-bold hover:bg-white/25 transition-all flex items-center gap-2"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Actualiser
          </button>
        </div>
        <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* KPI GRID */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 px-2 md:px-0">
        <KpiCard 
          icon={ShoppingCart} 
          label="Total commandes" 
          value={fmt(todayStats?.totalCommandesToday)} 
          trend="up" 
          trendValue="12"
          bgColorClass="bg-blue-50"
          iconColorClass="text-blue-500"
        />
        <KpiCard 
          icon={DollarSign} 
          label="Revenus" 
          value={<>{fmt(todayStats?.revenuesToday)} <span className="text-xs md:text-sm font-normal text-text-muted">DH</span></>} 
          trend="up" 
          trendValue="5"
          bgColorClass="bg-green-50"
          iconColorClass="text-green-500"
        />
        <KpiCard 
          icon={Clock} 
          label="En attente" 
          value={fmt(todayStats?.commandesEnAttente)} 
          trend="down" 
          trendValue="2"
          bgColorClass="bg-orange-50"
          iconColorClass="text-orange-500"
        />
        <KpiCard 
          icon={RefreshCw} 
          label="En traitement" 
          value={fmt(todayStats?.commandesEnTraitement || 0)} 
          bgColorClass="bg-purple-50"
          iconColorClass="text-purple-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8 px-2 md:px-0">
        {/* REVENUE CHART CARD */}
        <div className="lg:col-span-2 bg-white rounded-2xl md:rounded-3xl p-4 md:p-6 shadow-card border border-border/50">
          <div className="flex items-center justify-between mb-4 md:mb-8">
            <div>
              <h3 className="text-base md:text-lg font-bold text-text-primary">Revenu (7 derniers jours)</h3>
              <p className="text-xs text-text-muted mt-0.5">Performance hebdomadaire</p>
            </div>
            <div className="flex bg-gray-100 p-1 rounded-xl">
              {[7, 30].map(d => (
                <button 
                  key={d}
                  onClick={() => setChartDays(d)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${chartDays === d ? 'bg-white shadow-sm text-text-primary' : 'text-text-muted'}`}
                >
                  {d}j
                </button>
              ))}
            </div>
          </div>
          
          <div className="h-40 md:h-80 w-full mt-3 min-w-0">
            <ResponsiveContainer width="100%" height="100%" minHeight={160}>
              <AreaChart data={lastNDays} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F97316" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#F97316" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F3F5" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 10, fill: '#9CA3AF'}}
                  tickFormatter={(str) => {
                    const d = new Date(str);
                    if (isNaN(d.getTime())) return '';
                    const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
                    return days[d.getDay()];
                  }}
                />
                <YAxis hide={true} className="hidden md:block" />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  labelStyle={{ fontWeight: 'bold', fontSize: '12px', color: '#1E293B' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenusTotal" 
                  stroke="#F97316" 
                  strokeWidth={2.5}
                  fillOpacity={1} 
                  fill="url(#colorRev)" 
                  name="Revenus (DH)"
                />
                <Area 
                  type="monotone" 
                  dataKey="nombreCommandes" 
                  stroke="#6366F1" 
                  strokeWidth={2}
                  fill="transparent"
                  name="Commandes"
                  className="hidden md:block"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* DONUT CHART CARD */}
        <div className="bg-white rounded-2xl md:rounded-3xl p-4 md:p-6 shadow-card border border-border/50 flex flex-col">
          <h3 className="text-base md:text-lg font-bold text-text-primary mb-3">Statut des Commandes</h3>
          
          <div className="h-44 md:h-64 relative flex items-center justify-center min-w-0">
            <ResponsiveContainer width="100%" height="100%" minHeight={176}>
              <PieChart>
                <Pie
                  data={window.innerWidth < 768 ? (pieData.mobile || []) : (pieData.desktop || [])}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {(window.innerWidth < 768 ? (pieData.mobile || []) : (pieData.desktop || [])).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            {/* Pie Chart Center Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-bold text-text-primary leading-none">{totalPie || 0}</span>
              <span className="text-[10px] text-text-muted font-bold uppercase tracking-widest mt-1">TOTAL</span>
            </div>
          </div>

          <div className="mt-3 flex flex-col gap-2">
            {(window.innerWidth < 768 ? (pieData.mobile || []) : (pieData.desktop || [])).map((entry, index) => (
              <div key={entry.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color || COLORS[index % COLORS.length] }} />
                  <span className="text-xs md:text-[10px] md:font-bold md:uppercase md:tracking-wider text-text-secondary">{entry.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-text-primary">
                    {entry.value}
                  </span>
                  {window.innerWidth > 768 && (
                    <span className="text-[10px] opacity-40 font-normal">
                      ({totalPie > 0 ? Math.round((entry.value / totalPie) * 100) : 0}%)
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RECENT ORDERS CARD */}
      <div className="bg-white rounded-2xl md:rounded-3xl shadow-card border border-border/50 overflow-hidden mx-2 md:mx-0">
        <div className="p-4 md:p-6 border-b border-border flex items-center justify-between">
          <div>
            <h3 className="text-base md:text-lg font-bold text-text-primary">Commandes Récentes</h3>
          </div>
          <button className="text-sm font-semibold text-primary-500 hover:text-primary-600 transition-colors">Voir tout</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 hidden md:table-header-group">
              <tr>
                <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">Client / ID</th>
                <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">Service</th>
                <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">Date / Heure</th>
                <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">Montant</th>
                <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest text-center">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {recentOrders.length > 0 ? recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-4 py-3 md:px-6 md:py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 md:bg-gray-700 md:text-white flex items-center justify-center text-xs font-bold shrink-0">
                        {order.client?.nom?.[0]?.toUpperCase() || 'C'}
                      </div>
                      <div>
                        <p className="text-sm font-medium md:font-bold text-text-primary line-clamp-2 md:group-hover:text-primary-600 transition-colors">{order.client?.nom || 'Client Inconnu'}</p>
                        <p className="hidden md:block text-[10px] text-text-muted mt-0.5">#{order.numeroCommande}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 md:px-6 md:py-4 md:table-cell">
                    <span className="text-xs text-text-secondary">
                      {order.commandeItems?.[0]?.item?.nom || 'Service standard'}
                    </span>
                  </td>
                  <td className="px-4 py-3 md:px-6 md:py-4 text-right md:text-left">
                    {order.dateCreation ? (
                      <>
                        <div className="flex flex-col md:hidden">
                          <span className="text-[10px] font-bold text-text-primary">
                            {new Date(order.dateCreation).toLocaleDateString('fr-FR', { day: '2-digit' })}
                          </span>
                          <span className="text-[10px] text-text-muted">
                            {new Date(order.dateCreation).toLocaleDateString('fr-FR', { month: 'short' })}
                          </span>
                          <span className="text-[10px] text-text-muted opacity-50">
                            {new Date(order.dateCreation).getFullYear() || ''}
                          </span>
                        </div>
                        <div className="hidden md:block">
                          <p className="text-xs font-medium text-text-primary">
                            {new Date(order.dateCreation).toLocaleDateString('fr-FR')}
                          </p>
                          <p className="text-[10px] text-text-muted mt-0.5">
                            {new Date(order.dateCreation).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </>
                    ) : (
                      <span className="text-xs text-text-muted">N/A</span>
                    )}
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    <p className="text-sm font-bold text-text-primary">{order.montantTotal} DH</p>
                  </td>
                  <td className="px-6 py-4 text-center hidden md:table-cell">
                    <StatusBadge status={order.status} />
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <Loader2 size={32} className="animate-spin text-primary-200 mb-2" />
                      <p className="text-sm text-text-muted">Chargement des commandes...</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

