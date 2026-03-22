import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  Users, Search, Loader2, ChevronRight, Phone, 
  MapPin, Calendar, RefreshCw, Star, 
  TrendingUp, ShieldAlert, ArrowUpRight,
  ShoppingCart, SlidersHorizontal, ChevronLeft
} from 'lucide-react';
import { fetchAllClients, fetchClientStatistics } from '../../store/admin/adminThunk';
import { selectAllClients, selectAdminLoading, selectClientStatistics } from '../../store/admin/adminSelectors';
import { selectCurrentUser } from '../../store/auth/authSelector';
import { toast } from 'react-toastify';

export default function AllClients() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const clients = useSelector(selectAllClients);
  const statistics = useSelector(selectClientStatistics);
  const loading = useSelector(selectAdminLoading);
  const user = useSelector(selectCurrentUser);

  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const loadData = useCallback(() => {
    dispatch(fetchAllClients({ search: search || undefined }));
    dispatch(fetchClientStatistics());
  }, [dispatch, search]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 500);
    return () => clearTimeout(timer);
  }, [loadData]);

  const initials = (name) => {
    if (!name) return '??';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const colorArray = [
    'bg-blue-100 text-blue-700',
    'bg-green-100 text-green-700',
    'bg-yellow-100 text-yellow-700',
    'bg-purple-100 text-purple-700',
    'bg-pink-100 text-pink-700'
  ];

  const getRelativeTime = (dateString) => {
    if (!dateString) return 'Aucune';
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return "À l'instant";
    if (diffInSeconds < 3600) return `Il y a ${Math.floor(diffInSeconds / 60)} min`;
    if (diffInSeconds < 86400) return `Il y a ${Math.floor(diffInSeconds / 3600)} h`;
    
    const diffInDays = Math.floor(diffInSeconds / 86400);
    if (diffInDays === 1) {
      const hours = date.getHours().toString().padStart(2, '0');
      const mins = date.getMinutes().toString().padStart(2, '0');
      return `Hier à ${hours}:${mins}`;
    }
    if (diffInDays < 7) return `Il y a ${diffInDays} jours`;
    
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
  };

  const formatDateShort = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const paginatedClients = useMemo(() => {
    if (!Array.isArray(clients)) return [];
    const startIndex = (currentPage - 1) * itemsPerPage;
    return clients.slice(startIndex, startIndex + itemsPerPage);
  }, [clients, currentPage]);

  const totalPages = Math.ceil((clients?.length || 0) / itemsPerPage);

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">Tous les clients</h1>
          <p className="text-sm text-text-muted font-medium">Gérez votre base de données clients</p>
        </div>
      </div>

        {/* SEARCH BAR */}
        <div className="bg-surface border border-border rounded-xl px-4 py-3 flex items-center gap-3 shadow-sm group focus-within:border-primary-300 focus-within:ring-4 focus-within:ring-primary-500/5 transition-all">
          <Search size={18} className="text-text-muted group-focus-within:text-primary-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Rechercher un client par nom, email ou numéro de téléphone..." 
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="flex-1 text-sm text-text-primary placeholder:text-text-muted outline-none bg-transparent"
          />
          <button className="p-1.5 text-text-muted hover:text-text-primary hover:bg-background rounded-lg transition-all">
            <SlidersHorizontal size={18} />
          </button>
        </div>

        {/* STAT CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-surface rounded-xl shadow-card px-5 py-4 border border-border/50 flex items-center gap-4 hover:border-primary-100 transition-colors group">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-0.5">Total Clients</p>
              <p className="text-2xl font-black text-text-primary tracking-tight">{statistics?.totalClients || clients?.length || 0}</p>
            </div>
          </div>
          
          <div className="bg-surface rounded-xl shadow-card px-5 py-4 border border-border/50 flex items-center gap-4 hover:border-primary-100 transition-colors group">
            <div className="w-12 h-12 rounded-xl bg-green-50 text-green-500 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ShoppingCart size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-0.5">Commandes ce mois</p>
              <p className="text-2xl font-black text-text-primary tracking-tight">{statistics?.commandesCeMois || 0}</p>
            </div>
          </div>

          <div className="bg-surface rounded-xl shadow-card px-5 py-4 border border-border/50 flex items-center gap-4 hover:border-primary-100 transition-colors group">
            <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center group-hover:scale-110 transition-transform">
              <TrendingUp size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-0.5">Nouveaux ce mois</p>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-black text-text-primary tracking-tight">{statistics?.nouveauxCeMois || 0}</p>
                <span className="text-xs font-bold text-green-600">+{Math.round(statistics?.pourcentageNouveaux || 0)}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* TABLE SECTION */}
        <div className="bg-surface rounded-2xl shadow-card border border-border/50 overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-border">
                <tr>
                  <th className="px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Client</th>
                  <th className="px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Contact</th>
                  <th className="px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Dernière commande</th>
                  <th className="px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Commandes</th>
                  <th className="px-4 py-3 text-xs font-semibold text-text-muted uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading && paginatedClients.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-20 text-center">
                      <Loader2 size={32} className="animate-spin text-primary-400 mx-auto mb-3" />
                      <p className="text-sm font-medium text-text-muted">Chargement de la base clients...</p>
                    </td>
                  </tr>
                ) : paginatedClients.length > 0 ? (
                  paginatedClients.map((client, idx) => (
                    <tr key={client.id} className="border-b border-border last:border-0 hover:bg-gray-50 transition-colors group">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm ${colorArray[idx % colorArray.length]}`}>
                            {initials(client.name || client.nom)}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-text-primary">
                              {client.name || client.nom || `Client #${client.id}`}
                            </p>
                            <p className="text-xs text-text-muted mt-0.5">
                              Client depuis le {formatDateShort(client.createdAt)}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-text-primary">
                          {(client.phones && client.phones[0]?.phoneNumber) || 'Non renseigné'}
                        </p>
                        {client.email && (
                          <p className="text-xs text-text-muted mt-0.5 truncate max-w-[200px]">{client.email}</p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-text-secondary">
                          {getRelativeTime(client.lastOrderDate)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                          ${client.totalCommandes > 0 
                            ? 'bg-primary-100 text-primary-600' 
                            : 'bg-gray-100 text-text-muted'}`}>
                          {client.totalCommandes || 0}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <button 
                          onClick={() => navigate(`/admin/clients/${client.id}`)}
                          className="text-primary-500 text-sm font-medium hover:text-primary-600 cursor-pointer whitespace-nowrap"
                        >
                          Voir commandes &gt;
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="py-20 text-center">
                      <div className="w-16 h-16 bg-background rounded-full flex items-center justify-center mx-auto mb-4 border border-dashed border-border">
                        <Search size={24} className="text-text-muted opacity-30" />
                      </div>
                      <p className="text-lg font-bold text-text-primary">Aucun résultat trouvé</p>
                      <p className="text-sm text-text-muted mt-1">Essayez d'ajuster vos critères de recherche.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
                {/* Mobile Stacked Layout (< md) */}
          <div className="md:hidden divide-y divide-border/30 bg-white">
            {paginatedClients.map((client, idx) => (
              <div 
                key={client.id} 
                className="p-5 active:bg-gray-50 transition-all" 
                onClick={() => navigate(`/admin/clients/${client.id}`)}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm shadow-sm border border-white/50 ${colorArray[idx % colorArray.length]}`}>
                    {initials(client.name || client.nom)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-black text-text-primary truncate tracking-tight uppercase">
                        {client.name || client.nom || `Client #${client.id}`}
                      </h3>
                      <div className="px-2 py-0.5 rounded-lg bg-gray-100 text-text-muted text-[9px] font-black uppercase tracking-widest border border-border/50">
                        {client.totalCommandes || 0} CMD
                      </div>
                    </div>
                    <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest opacity-60">
                       Depuis {formatDateShort(client.createdAt)}
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-gray-50/50 rounded-2xl p-3 border border-gray-100">
                    <p className="text-[8px] font-black text-text-muted uppercase tracking-[0.2em] mb-1">Téléphone</p>
                    <p className="text-[11px] font-black text-text-primary truncate">
                       {client.phones?.[0]?.phoneNumber || client.telephone || '—'}
                    </p>
                  </div>
                  <div className="bg-gray-50/50 rounded-2xl p-3 border border-gray-100">
                    <p className="text-[8px] font-black text-text-muted uppercase tracking-[0.2em] mb-1">Dernière activité</p>
                    <p className="text-[11px] font-black text-text-secondary truncate">
                       {getRelativeTime(client.lastOrderDate)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between bg-gray-100/50 px-3 py-2.5 rounded-xl border border-border/30">
                  <div className="flex items-center gap-2 text-text-muted min-w-0">
                    <MapPin size={12} className="shrink-0" />
                    <span className="text-[10px] font-bold truncate opacity-80 uppercase tracking-tight">
                       {client.addresses?.[0]?.address || 'Aucune adresse' }
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] font-black text-primary-500 uppercase tracking-widest shrink-0">
                     Détails <ChevronRight size={14} strokeWidth={3} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          </div>
        </div>

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <p className="text-sm text-text-muted font-medium">
              Affichage de <span className="font-bold text-text-primary">{(currentPage - 1) * itemsPerPage + 1}</span> à <span className="font-bold text-text-primary">{Math.min(currentPage * itemsPerPage, clients?.length || 0)}</span> sur <span className="font-bold text-text-primary">{clients?.length || 0}</span> clients
            </p>
            <div className="flex items-center gap-2">
              <button 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-surface text-sm font-bold text-text-secondary hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft size={16} />
                Précédent
              </button>
              <div className="flex gap-1">
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-9 h-9 rounded-xl text-sm font-bold transition-all ${currentPage === i + 1 ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20' : 'bg-surface border border-border text-text-secondary hover:bg-slate-50'}`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <button 
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-surface text-sm font-bold text-text-secondary hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                Suivant
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

      </div>
  );
}
