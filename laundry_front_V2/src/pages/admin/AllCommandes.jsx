import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  ClipboardList, Search, Loader2, Download, 
  Filter, Calendar, X, RefreshCw, FileText,
  Clock, Users
} from 'lucide-react';
import { fetchAllCommandes, downloadCommandesCsv } from '../../store/admin/adminThunk';
import { selectAllCommandes, selectAdminLoading } from '../../store/admin/adminSelectors';
import { StatusBadge } from '../../components/StatusBadge';
import { toast } from 'react-toastify';

const STATUS_LIST = [
  { value: 'all', label: 'Toutes' },
  { value: 'en_attente', label: 'En attente' },
  { value: 'validee', label: 'Validée' },
  { value: 'en_traitement', label: 'Traitement' },
  { value: 'prete', label: 'Prête' },
  { value: 'livree', label: 'Livrée' },
  { value: 'payee', label: 'Payée' },
  { value: 'annulee', label: 'Annulée' }
];

export default function AllCommandes() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const commandes = useSelector(selectAllCommandes);
  const loading = useSelector(selectAdminLoading);

  // Filters State
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const loadData = useCallback(() => {
    const params = {
      search: search || undefined,
      status: status !== 'all' ? status : undefined,
      dateDebut: dateDebut || undefined,
      dateFin: dateFin || undefined
    };
    dispatch(fetchAllCommandes(params));
  }, [dispatch, search, status, dateDebut, dateFin]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 500);
    return () => clearTimeout(timer);
  }, [loadData]);

  const handleExportCSV = async () => {
    try {
      await dispatch(downloadCommandesCsv()).unwrap();
      toast.success('Exportation réussie');
    } catch (err) {
      toast.error('Erreur lors de l’exportation');
    }
  };

  const clearFilters = () => {
    setSearch('');
    setStatus('all');
    setDateDebut('');
    setDateFin('');
  };

  // KPI Calculations (on the current local list for speed, or could be from backend)
  const totalAmount = Array.isArray(commandes) ? commandes.reduce((acc, c) => acc + (c.montantTotal || 0), 0) : 0;
  const pendingCount = Array.isArray(commandes) ? commandes.filter(c => c.status === 'en_attente').length : 0;

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-text-primary tracking-tight">Gestion des Commandes</h1>
          <p className="text-sm text-text-muted font-medium">Consultez et gérez l'ensemble des transactions.</p>
        </div>
        <button 
          onClick={handleExportCSV}
          className="flex items-center justify-center gap-2 px-6 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-primary-500/20 hover:bg-primary-700 transition-all active:scale-95"
        >
          <Download size={18} />
          <span>Exporter CSV</span>
        </button>
      </div>

      {/* MINI KPI ROW */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-surface p-4 rounded-2xl border border-border/50 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center">
            <ClipboardList size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Total</p>
            <p className="text-lg font-black text-text-primary">{commandes?.length || 0}</p>
          </div>
        </div>
        <div className="bg-surface p-4 rounded-2xl border border-border/50 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center">
            <RefreshCw size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Revenus</p>
            <p className="text-lg font-black text-text-primary">{totalAmount.toLocaleString()} DH</p>
          </div>
        </div>
        <div className="bg-surface p-4 rounded-2xl border border-border/50 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
            <Clock size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">En Attente</p>
            <p className="text-lg font-black text-text-primary">{pendingCount}</p>
          </div>
        </div>
        <div className="bg-surface p-4 rounded-2xl border border-border/50 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-500 flex items-center justify-center">
            <Download size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Articles</p>
            <p className="text-lg font-black text-text-primary">
              {commandes?.reduce((acc, c) => acc + (c.commandeItems?.length || 0), 0) || 0}
            </p>
          </div>
        </div>
      </div>

      {/* FILTERS SECTION */}
      <div className="bg-surface rounded-2xl border border-border/50 shadow-card overflow-hidden">
        <div className="p-4 border-b border-border flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input 
              type="text" 
              placeholder="Rechercher par numéro, client..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-background border-none rounded-xl pl-10 pr-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-primary-500/20 outline-none placeholder:text-text-muted"
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${showFilters ? 'bg-primary-50 text-primary-600' : 'bg-background text-text-secondary hover:bg-border/50'}`}
            >
              <Filter size={18} />
              <span>Filtres</span>
              {(status !== 'all' || dateDebut || dateFin) && <div className="w-2 h-2 rounded-full bg-primary-500" />}
            </button>
            <button 
              onClick={loadData}
              disabled={loading}
              className="px-4 py-2.5 bg-background text-text-secondary rounded-xl hover:bg-border/50 transition-all disabled:opacity-50"
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* EXPANDABLE FILTERS */}
        {showFilters && (
          <div className="p-6 bg-background/30 border-b border-border grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-slide-down">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Statut</label>
              <select 
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-sm font-medium outline-none focus:border-primary-500"
              >
                {STATUS_LIST.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Date Début</label>
              <div className="relative">
                <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input 
                  type="date" 
                  value={dateDebut}
                  onChange={(e) => setDateDebut(e.target.value)}
                  className="w-full bg-surface border border-border rounded-xl pl-9 pr-3 py-2 text-sm font-medium outline-none focus:border-primary-500"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Date Fin</label>
              <div className="relative">
                <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input 
                  type="date" 
                  value={dateFin}
                  onChange={(e) => setDateFin(e.target.value)}
                  className="w-full bg-surface border border-border rounded-xl pl-9 pr-3 py-2 text-sm font-medium outline-none focus:border-primary-500"
                />
              </div>
            </div>
            <div className="flex items-end gap-2">
              <button 
                onClick={clearFilters}
                className="flex-1 bg-surface border border-border text-text-secondary px-4 py-2 rounded-xl text-sm font-bold hover:bg-white transition-all flex items-center justify-center gap-2"
              >
                <X size={16} />
                Réinitialiser
              </button>
            </div>
          </div>
        )}

        {/* TABLE VIEW */}
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-background">
                <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">Référence</th>
                <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">Client</th>
                <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">Date / Heure</th>
                <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest text-center">Articles</th>
                <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">Montant</th>
                <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest text-center">Statut</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border relative">
              {loading && Array.isArray(commandes) && commandes.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-24 text-center">
                    <Loader2 size={40} className="animate-spin text-primary-200 mx-auto mb-4" />
                    <p className="text-text-muted font-medium">Chargement des données...</p>
                  </td>
                </tr>
              ) : Array.isArray(commandes) && commandes.length > 0 ? (
                commandes.map((c) => (
                  <tr 
                    key={c.id} 
                    onClick={() => navigate(`/admin/commandes/${c.id}`)}
                    className="group hover:bg-primary-50/30 transition-all cursor-pointer"
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-background border border-border group-hover:border-primary-200 flex items-center justify-center text-primary-600 transition-colors">
                          <FileText size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-black text-text-primary group-hover:text-primary-600 transition-colors">#{c.numeroCommande}</p>
                          <p className="text-[10px] text-text-muted mt-0.5 uppercase font-bold tracking-tighter">ID: {c.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-xs font-bold">
                            {c.client?.nom?.[0]?.toUpperCase() || 'C'}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-text-primary">{c.client?.nom || 'Inconnu'}</p>
                          <p className="text-[10px] text-text-muted font-medium">{c.client?.telephone || 'No phone'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-sm font-semibold text-text-primary">
                        {new Date(c.dateCreation).toLocaleDateString('fr-FR')}
                      </p>
                      <p className="text-[10px] text-text-muted font-medium mt-0.5">
                        {new Date(c.dateCreation).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className="inline-flex items-center justify-center px-2 py-1 rounded-lg bg-background border border-border text-[10px] font-black text-text-secondary">
                        {c.commandeItems?.length || 0}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-sm font-black text-text-primary">{c.montantTotal?.toLocaleString()} DH</p>
                      <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider mt-0.5">{c.modePaiement || 'Espèces'}</p>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex justify-center">
                        <StatusBadge status={c.status} />
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end">
                        <div className="p-2 rounded-lg bg-background text-text-muted group-hover:bg-primary-600 group-hover:text-white transition-all">
                           <RefreshCw size={14} />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                   <td colSpan="7" className="py-24 text-center">
                    <ClipboardList size={48} className="text-text-muted/20 mx-auto mb-4" />
                    <p className="text-text-primary font-bold">Aucune commande trouvée</p>
                    <p className="text-sm text-text-muted mt-1">Essayez de modifier vos filtres ou de rafraîchir la page.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION / FOOTER INFO */}
        <div className="p-4 bg-background/50 border-t border-border flex items-center justify-between">
          <p className="text-xs text-text-muted font-medium">
            Affichage de <span className="text-text-primary font-bold">{commandes?.length || 0}</span> résultats
          </p>
          <div className="flex gap-2">
             <button disabled className="px-3 py-1.5 rounded-lg border border-border text-xs font-bold opacity-50">Précédent</button>
             <button disabled className="px-3 py-1.5 rounded-lg border border-border text-xs font-bold opacity-50">Suivant</button>
          </div>
        </div>
      </div>
    </div>
  );
}

