import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
    Clock,
    CheckCircle2,
    Wrench,
    PackageCheck,
    ChevronRight,
    RefreshCw,
    Loader2,
    CalendarDays,
    ClipboardList,
    AlertCircle,
    Truck
} from 'lucide-react';
import { fetchAllCommandes } from '../../store/employe/employeThunk';
import { selectCommandes, selectLoading } from '../../store/employe/employeSelectors';
import { COMMANDE_STATUS } from '../../store/employe/employeSlice';

const STATUS_CONFIG = {
    [COMMANDE_STATUS.EN_ATTENTE]: { label: 'En Attente', color: 'text-laundry-warning', bg: 'bg-laundry-warning-light', border: 'border-laundry-warning/20', dot: 'bg-laundry-warning', icon: Clock },
    [COMMANDE_STATUS.VALIDEE]: { label: 'Validée', color: 'text-laundry-primary-light', bg: 'bg-blue-50', border: 'border-laundry-primary-light/20', dot: 'bg-laundry-primary-light', icon: CheckCircle2 },
    [COMMANDE_STATUS.EN_TRAITEMENT]: { label: 'En Traitement', color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200', dot: 'bg-purple-500', icon: Wrench },
    [COMMANDE_STATUS.PRETE]: { label: 'Prête', color: 'text-laundry-success', bg: 'bg-laundry-success-light', border: 'border-laundry-success/20', dot: 'bg-laundry-success', icon: PackageCheck },
    [COMMANDE_STATUS.LIVREE]: { label: 'Sortie', color: 'text-laundry-accent', bg: 'bg-cyan-50', border: 'border-laundry-accent/20', dot: 'bg-laundry-accent', icon: Truck }
};

const DashboardStatsCard = ({ title, count, status, onClick, active }) => {
    const config = STATUS_CONFIG[status];
    const Icon = config.icon;

    return (
        <button
            onClick={onClick}
            className={`flex-1 min-w-[200px] p-5 rounded-xl border transition-all text-left bg-white
                ${active 
                    ? `border-laundry-primary shadow-card outline-none ring-1 ring-laundry-primary scale-[1.02]` 
                    : `border-laundry-border shadow-sm hover:border-laundry-primary/50 hover:shadow-card`
                }
            `}
        >
            <div className="flex items-center justify-between mb-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${config.bg} ${config.color}`}>
                    <Icon size={20} />
                </div>
                {active && (
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-laundry-background border border-laundry-border text-laundry-primary">
                        <span>Actif</span>
                        <div className="w-1.5 h-1.5 rounded-full bg-laundry-primary animate-pulse"></div>
                    </div>
                )}
            </div>
            <div>
                <h3 className="text-3xl font-bold text-laundry-text-primary mb-1">{count}</h3>
                <p className="text-xs font-semibold text-laundry-text-secondary uppercase tracking-wider">{title}</p>
            </div>
        </button>
    );
};

const StatusBadge = ({ status }) => {
    const config = STATUS_CONFIG[status] || { label: status, color: 'text-laundry-text-secondary', bg: 'bg-laundry-background', dot: 'bg-laundry-border' };
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-semibold uppercase tracking-wider border border-transparent ${config.bg} ${config.color}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`}></span>
            {config.label}
        </span>
    );
};

const OrdersTable = ({ orders, onViewDetail }) => {
    if (orders.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-laundry-border shadow-sm text-center">
                <ClipboardList size={40} className="text-laundry-text-muted opacity-50 mb-4" />
                <h3 className="text-sm font-bold text-laundry-text-secondary">Aucune commande</h3>
                <p className="text-xs font-medium text-laundry-text-muted mt-1">Votre file d'attente est vide.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-card border border-laundry-border overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-laundry-background border-b border-laundry-border">
                            <th className="px-6 py-4 text-xs font-semibold text-laundry-text-secondary uppercase tracking-wider">Commande</th>
                            <th className="px-6 py-4 text-xs font-semibold text-laundry-text-secondary uppercase tracking-wider">Articles</th>
                            <th className="px-6 py-4 text-xs font-semibold text-laundry-text-secondary uppercase tracking-wider">Statut</th>
                            <th className="px-6 py-4 text-xs font-semibold text-laundry-text-secondary uppercase tracking-wider">Date</th>
                            <th className="px-6 py-4 text-xs font-semibold text-laundry-text-secondary uppercase tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-laundry-border">
                        {orders.map((order) => (
                            <tr key={order.id} className="hover:bg-laundry-background/50 transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-laundry-primary/10 flex items-center justify-center text-laundry-primary flex-shrink-0">
                                            <PackageCheck size={18} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-laundry-text-primary uppercase">#{order.numeroCommande}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 font-semibold text-sm text-laundry-text-primary">
                                    {order.commandeTapis?.length || 0} Tapis
                                </td>
                                <td className="px-6 py-4">
                                    <StatusBadge status={order.status} />
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2 text-laundry-text-secondary">
                                        <CalendarDays size={14} className="text-laundry-text-muted" />
                                        <span className="text-xs font-semibold">
                                            {new Date(order.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button
                                        onClick={() => onViewDetail(order.id)}
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-laundry-border text-laundry-text-primary rounded-md text-xs font-semibold hover:bg-laundry-background hover:text-laundry-primary transition-all shadow-sm"
                                    >
                                        Gérer
                                        <ChevronRight size={14} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const RecentActivityList = ({ activities, onViewDetail }) => {
    return (
        <div className="bg-white rounded-xl shadow-card border border-laundry-border p-6">
            <h3 className="font-bold text-laundry-text-primary mb-6 flex items-center gap-2">
                <AlertCircle size={18} className="text-laundry-text-muted" />
                Dernières Activités
            </h3>
            <div className="space-y-0 relative">
                <div className="absolute left-[7px] top-2 bottom-2 w-px bg-laundry-border"></div>
                {activities.length === 0 ? (
                    <p className="text-xs font-medium text-laundry-text-muted italic py-2 pl-6">Aucune activité récente.</p>
                ) : (
                    activities.map((activity, idx) => (
                        <div
                            key={idx}
                            className="flex gap-4 py-3 relative z-10 hover:bg-laundry-background/50 rounded-lg -mx-2 px-2 cursor-pointer transition-colors"
                            onClick={() => onViewDetail(activity.id)}
                        >
                            <div className={`w-3.5 h-3.5 rounded-full border-2 mt-1 shadow-sm flex-shrink-0 bg-white ${STATUS_CONFIG[activity.status]?.border?.replace('border-', 'border-') || 'border-laundry-border'} ${STATUS_CONFIG[activity.status]?.dot?.replace('bg-', 'border-') || 'border-laundry-primary'}`}></div>
                            <div className="flex-1">
                                <div className="flex items-center justify-between gap-2 mb-0.5">
                                    <p className="text-sm font-semibold text-laundry-text-primary transition-colors">
                                        #{activity.numeroCommande}
                                    </p>
                                    <span className="text-xs font-medium text-laundry-text-muted">
                                        {new Date(activity.updatedAt || activity.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <p className="text-xs text-laundry-text-secondary">
                                    Passé en <span className={`font-semibold ${STATUS_CONFIG[activity.status]?.color || 'text-laundry-text-primary'}`}>
                                        {(STATUS_CONFIG[activity.status]?.label || activity.status).toUpperCase()}
                                    </span>
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default function EmployeDashboard() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const commandes = useSelector(selectCommandes);
    const loading = useSelector(selectLoading);
    const [filterStatus, setFilterStatus] = useState(null);

    useEffect(() => {
        dispatch(fetchAllCommandes());
    }, [dispatch]);

    const stats = useMemo(() => {
        return {
            enAttente: commandes.filter(c => c.status === COMMANDE_STATUS.EN_ATTENTE).length,
            enTraitement: commandes.filter(c => c.status === COMMANDE_STATUS.EN_TRAITEMENT).length,
            prete: commandes.filter(c => c.status === COMMANDE_STATUS.PRETE).length,
            livree: commandes.filter(c => c.status === COMMANDE_STATUS.LIVREE).length,
        };
    }, [commandes]);

    const filteredCommandes = useMemo(() => {
        let list = commandes.filter(c =>
            [COMMANDE_STATUS.EN_ATTENTE, COMMANDE_STATUS.VALIDEE, COMMANDE_STATUS.EN_TRAITEMENT, COMMANDE_STATUS.PRETE, COMMANDE_STATUS.LIVREE].includes(c.status)
        );

        if (filterStatus) {
            list = list.filter(c => c.status === filterStatus);
        }

        return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }, [commandes, filterStatus]);

    const recentActivities = useMemo(() => {
        return [...commandes]
            .filter(c => c.updatedAt || c.createdAt)
            .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))
            .slice(0, 5);
    }, [commandes]);

    const handleRefresh = () => {
        dispatch(fetchAllCommandes());
    };

    const toggleFilter = (status) => {
        setFilterStatus(prev => prev === status ? null : status);
    };

    if (loading.commandes && commandes.length === 0) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-8 bg-laundry-background min-h-[60vh] rounded-xl">
                <Loader2 size={32} className="text-laundry-primary animate-spin mb-4" />
                <p className="text-xs font-semibold text-laundry-text-secondary uppercase tracking-wider">Chargement de l'atelier...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-4 sm:p-6 lg:p-8 animate-fade-in max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-2">
                <div>
                    <h1 className="text-2xl font-bold text-laundry-primary">
                        Atelier de Traitement
                    </h1>
                    <div className="flex items-center gap-3 mt-1">
                        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-laundry-success-light rounded border border-laundry-success/20">
                            <div className="w-1.5 h-1.5 rounded-full bg-laundry-success animate-pulse"></div>
                            <span className="text-[10px] font-bold text-laundry-success uppercase tracking-widest">Actif</span>
                        </div>
                        <span className="text-sm font-medium text-laundry-text-muted">
                            {filteredCommandes.length} Commandes {filterStatus ? `(${STATUS_CONFIG[filterStatus]?.label})` : 'au total'}
                        </span>
                    </div>
                </div>

                <button
                    onClick={handleRefresh}
                    disabled={loading.commandes}
                    className="flex items-center justify-center gap-2 p-2 bg-white border border-laundry-border rounded-md text-laundry-text-secondary hover:bg-laundry-background hover:text-laundry-primary transition-colors active:scale-95 disabled:opacity-50 shadow-sm"
                    title="Actualiser"
                >
                    <RefreshCw size={20} className={loading.commandes ? 'animate-spin' : ''} />
                </button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <DashboardStatsCard title="En Attente" count={stats.enAttente} status={COMMANDE_STATUS.EN_ATTENTE} onClick={() => toggleFilter(COMMANDE_STATUS.EN_ATTENTE)} active={filterStatus === COMMANDE_STATUS.EN_ATTENTE} />
                <DashboardStatsCard title="En Traitement" count={stats.enTraitement} status={COMMANDE_STATUS.EN_TRAITEMENT} onClick={() => toggleFilter(COMMANDE_STATUS.EN_TRAITEMENT)} active={filterStatus === COMMANDE_STATUS.EN_TRAITEMENT} />
                <DashboardStatsCard title="Prêtes" count={stats.prete} status={COMMANDE_STATUS.PRETE} onClick={() => toggleFilter(COMMANDE_STATUS.PRETE)} active={filterStatus === COMMANDE_STATUS.PRETE} />
                <DashboardStatsCard title="Sorties" count={stats.livree} status={COMMANDE_STATUS.LIVREE} onClick={() => toggleFilter(COMMANDE_STATUS.LIVREE)} active={filterStatus === COMMANDE_STATUS.LIVREE} />
            </div>

            {/* Content Split */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between pt-2">
                        <h2 className="text-lg font-bold text-laundry-text-primary">
                            File d'attente
                        </h2>
                        {filterStatus && (
                            <button
                                onClick={() => setFilterStatus(null)}
                                className="text-xs font-semibold text-laundry-text-secondary hover:text-laundry-primary flex items-center gap-1 transition-colors"
                            >
                                Effacer le filtre ×
                            </button>
                        )}
                    </div>
                    <OrdersTable
                        orders={filteredCommandes}
                        onViewDetail={(id) => navigate(`/employe/commandes/${id}`)}
                    />
                </div>

                <div className="space-y-6">
                    <RecentActivityList
                        activities={recentActivities}
                        onViewDetail={(id) => navigate(`/employe/commandes/${id}`)}
                    />

                    <div className="p-5 bg-laundry-background border border-laundry-border rounded-xl">
                        <div className="flex items-center gap-3 mb-3">
                            <PackageCheck size={18} className="text-laundry-primary" />
                            <h3 className="font-bold text-laundry-text-primary text-sm">Performance</h3>
                        </div>
                        <p className="text-xs text-laundry-text-secondary leading-relaxed">
                            Maintenez un flux de travail régulier. N'oubliez pas d'ajouter les photos après nettoyage pour garantir la qualité.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
