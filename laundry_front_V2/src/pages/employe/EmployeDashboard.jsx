import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Clock, CheckCircle2, Wrench, PackageCheck, ChevronRight,
  RefreshCw, Loader2, CalendarDays, ClipboardList, Truck, Package
} from 'lucide-react';
import { fetchAllCommandes } from '../../store/employe/employeThunk';
import { selectCommandes, selectLoading } from '../../store/employe/employeSelectors';
import { COMMANDE_STATUS } from '../../store/employe/employeSlice';
import { StatusBadge } from '../../components/StatusBadge';

const STATUS_CONFIG = {
  [COMMANDE_STATUS.EN_ATTENTE]:    { label: 'En Attente',    accentBg: 'bg-orange-50',  accentText: 'text-orange-500',  icon: Clock },
  [COMMANDE_STATUS.VALIDEE]:       { label: 'Validée',       accentBg: 'bg-blue-50',    accentText: 'text-blue-500',    icon: CheckCircle2 },
  [COMMANDE_STATUS.EN_TRAITEMENT]: { label: 'En Traitement', accentBg: 'bg-violet-50',  accentText: 'text-violet-500',  icon: Wrench },
  [COMMANDE_STATUS.PRETE]:         { label: 'Prête',         accentBg: 'bg-teal-50',    accentText: 'text-teal-500',    icon: PackageCheck },
  [COMMANDE_STATUS.LIVREE]:        { label: 'Sortie',        accentBg: 'bg-green-50',   accentText: 'text-green-500',   icon: Truck },
};

export default function EmployeDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const commandes = useSelector(selectCommandes);
  const loading = useSelector(selectLoading);
  const [activeFilter, setActiveFilter] = useState(null);

  useEffect(() => {
    dispatch(fetchAllCommandes());
  }, [dispatch]);

  const counts = useMemo(() => ({
    [COMMANDE_STATUS.EN_ATTENTE]:    commandes.filter(c => c.status === COMMANDE_STATUS.EN_ATTENTE).length,
    [COMMANDE_STATUS.EN_TRAITEMENT]: commandes.filter(c => c.status === COMMANDE_STATUS.EN_TRAITEMENT).length,
    [COMMANDE_STATUS.PRETE]:         commandes.filter(c => c.status === COMMANDE_STATUS.PRETE).length,
    [COMMANDE_STATUS.LIVREE]:        commandes.filter(c => c.status === COMMANDE_STATUS.LIVREE).length,
  }), [commandes]);

  const filteredCommandes = useMemo(() => {
    if (!activeFilter) return commandes.filter(c => c.status !== COMMANDE_STATUS.LIVREE);
    return commandes.filter(c => c.status === activeFilter);
  }, [commandes, activeFilter]);

  const stats = [
    { key: COMMANDE_STATUS.EN_ATTENTE,    label: 'En Attente',    count: counts[COMMANDE_STATUS.EN_ATTENTE] },
    { key: COMMANDE_STATUS.EN_TRAITEMENT, label: 'En Traitement', count: counts[COMMANDE_STATUS.EN_TRAITEMENT] },
    { key: COMMANDE_STATUS.PRETE,         label: 'Prêtes',        count: counts[COMMANDE_STATUS.PRETE] },
    { key: COMMANDE_STATUS.LIVREE,        label: 'Sorties',       count: counts[COMMANDE_STATUS.LIVREE] },
  ];

  return (
    <div className="space-y-5 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold text-text-primary">Atelier de Traitement</h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              Actif
            </span>
          </div>
          <p className="text-sm text-text-muted mt-0.5">File d&apos;attente de traitement</p>
        </div>
        <button
          onClick={() => dispatch(fetchAllCommandes())}
          className="w-9 h-9 flex items-center justify-center rounded-xl text-text-muted hover:bg-gray-100 transition-colors"
        >
          {loading?.commandes ? <Loader2 size={18} className="animate-spin" /> : <RefreshCw size={18} />}
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map(stat => {
          const cfg = STATUS_CONFIG[stat.key];
          const Icon = cfg.icon;
          const isActive = activeFilter === stat.key;
          return (
            <button
              key={stat.key}
              onClick={() => setActiveFilter(isActive ? null : stat.key)}
              className={`bg-surface rounded-2xl shadow-card p-4 text-left hover:shadow-card-hover hover:-translate-y-0.5 transition-all ${isActive ? 'ring-2 ring-primary-400' : ''}`}
            >
              <div className={`w-10 h-10 rounded-xl ${cfg.accentBg} ${cfg.accentText} flex items-center justify-center mb-3`}>
                <Icon size={20} />
              </div>
              <p className="text-2xl font-bold text-text-primary">{stat.count}</p>
              <p className="text-xs text-text-muted uppercase tracking-wide mt-0.5">{stat.label}</p>
            </button>
          );
        })}
      </div>

      {/* Main Table / List */}
      <div className="lg:flex lg:gap-5">

        {/* Queue */}
        <div className="lg:flex-1">
          <div className="bg-surface rounded-2xl shadow-card overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <h2 className="text-sm font-semibold text-text-primary">File d&apos;attente</h2>
              <span className="text-xs text-text-muted bg-gray-100 px-2.5 py-1 rounded-full">{filteredCommandes.length} commandes</span>
            </div>

            {/* Desktop Table */}
            {loading?.commandes ? (
              <div className="p-4 space-y-3">
                {[1,2,3].map(i => <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse" />)}
              </div>
            ) : filteredCommandes.length === 0 ? (
              <div className="py-14 flex flex-col items-center text-center">
                <ClipboardList size={32} className="text-text-muted mb-3" />
                <h3 className="text-sm font-semibold text-text-primary mb-1">File vide</h3>
                <p className="text-sm text-text-muted">Aucune commande pour ce filtre.</p>
              </div>
            ) : (
              <>
                {/* Desktop: table */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50/80 border-b border-border">
                        <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">Commande</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">Articles</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">Statut</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">Date</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-text-muted uppercase tracking-wider">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCommandes.map(order => (
                        <tr key={order.id} className="border-b border-border last:border-0 hover:bg-gray-50/60 transition-colors">
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center flex-shrink-0">
                                <Package size={14} />
                              </div>
                              <span className="text-sm font-medium text-text-primary">#{order.numeroCommande}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3.5 text-sm text-text-secondary">{order.commandeTapis?.length || 0} tapis</td>
                          <td className="px-4 py-3.5"><StatusBadge status={order.status} /></td>
                          <td className="px-4 py-3.5">
                            <span className="text-xs text-text-muted">{new Date(order.createdAt).toLocaleDateString('fr-FR')}</span>
                          </td>
                          <td className="px-4 py-3.5 text-right">
                            <button
                              onClick={() => navigate(`/employe/commandes/${order.id}`)}
                              className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-600 border border-primary-200 rounded-xl px-3 py-1.5 text-xs font-medium hover:bg-primary-100 transition-colors"
                            >
                              Gérer <ChevronRight size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile: cards */}
                <div className="lg:hidden divide-y divide-border">
                  {filteredCommandes.map(order => (
                    <div key={order.id} className="p-4 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-text-primary">#{order.numeroCommande}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <StatusBadge status={order.status} />
                          <span className="text-xs text-text-muted">{order.commandeTapis?.length || 0} tapis</span>
                        </div>
                      </div>
                      <button
                        onClick={() => navigate(`/employe/commandes/${order.id}`)}
                        className="w-9 h-9 flex items-center justify-center rounded-xl bg-primary-50 text-primary-600"
                      >
                        <ChevronRight size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Activity Timeline (desktop only) */}
        <div className="hidden lg:block lg:w-72">
          <div className="bg-surface rounded-2xl shadow-card p-5 max-h-[calc(100vh-280px)] overflow-y-auto">
            <h2 className="text-sm font-semibold text-text-primary mb-4">Dernières Activités</h2>
            {commandes.length === 0 ? (
              <p className="text-sm text-text-muted text-center py-6">Aucune activité</p>
            ) : (
              <div className="space-y-3">
                {commandes.slice(0, 15).map((order, idx) => {
                  const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG[COMMANDE_STATUS.EN_ATTENTE];
                  const Icon = cfg.icon;
                  return (
                    <div key={order.id} className="relative pl-6">
                      {idx < 14 && <div className="absolute left-2.5 top-5 bottom-0 w-px bg-border" />}
                      <div className={`absolute left-0 top-1 w-5 h-5 rounded-full flex items-center justify-center ${cfg.accentBg} ${cfg.accentText}`}>
                        <Icon size={11} />
                      </div>
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-xs font-medium text-text-primary">#{order.numeroCommande}</p>
                          <p className="text-xs text-text-muted">Passé en <span className={cfg.accentText + ' font-medium'}>{cfg.label}</span></p>
                        </div>
                        <span className="text-[10px] text-text-muted">{new Date(order.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
