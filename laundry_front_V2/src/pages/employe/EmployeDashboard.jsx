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
    Trello,
    AlertCircle,
    Truck
} from 'lucide-react';
import { fetchAllCommandes } from '../../store/employe/employeThunk';
import { selectCommandes, selectLoading } from '../../store/employe/employeSelectors';
import { COMMANDE_STATUS } from '../../store/employe/employeSlice';

// ─── Status Configs ───────────────────────────────────────────────────────────
const STATUS_CONFIG = {
    [COMMANDE_STATUS.EN_ATTENTE]: {
        label: 'En Attente',
        color: 'text-amber-600',
        bg: 'bg-amber-100/50',
        border: 'border-amber-200',
        dot: 'bg-amber-400',
        icon: Clock
    },
    [COMMANDE_STATUS.VALIDEE]: {
        label: 'Validée',
        color: 'text-blue-600',
        bg: 'bg-blue-100/50',
        border: 'border-blue-200',
        dot: 'bg-blue-400',
        icon: CheckCircle2
    },
    [COMMANDE_STATUS.EN_TRAITEMENT]: {
        label: 'En Traitement',
        color: 'text-purple-600',
        bg: 'bg-purple-100/50',
        border: 'border-purple-200',
        dot: 'bg-purple-400',
        icon: Wrench
    },
    [COMMANDE_STATUS.PRETE]: {
        label: 'Prête',
        color: 'text-green-600',
        bg: 'bg-green-100/50',
        border: 'border-green-200',
        dot: 'bg-green-400',
        icon: PackageCheck
    },
    [COMMANDE_STATUS.LIVREE]: {
        label: 'Sortie',
        color: 'text-teal-600',
        bg: 'bg-teal-100/50',
        border: 'border-teal-200',
        dot: 'bg-teal-400',
        icon: Truck
    }
};

// ─── Sub-Components ───────────────────────────────────────────────────────────

const DashboardStatsCard = ({ title, count, status, onClick, active }) => {
    const config = STATUS_CONFIG[status];
    const Icon = config.icon;

    return (
        <button
            onClick={onClick}
            className={`flex-1 min-w-[240px] p-6 rounded-[2.5rem] border-2 transition-all duration-300 hover:scale-[1.05] hover:shadow-2xl active:scale-95 group text-left ${config.bg} ${config.border} ${active
                    ? `shadow-xl ring-4 ring-offset-2 ${config.color.replace('text-', 'ring-')} z-10 scale-[1.05]`
                    : 'hover:border-current/30 shadow-sm'
                }`}
        >
            <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-2xl bg-white/80 shadow-sm transition-all ${config.color} ${active ? 'scale-110 shadow-md' : ''}`}>
                    <Icon size={20} strokeWidth={3} />
                </div>
                {active && (
                    <div className="flex items-center gap-1 animate-fade-in bg-white/50 px-2 py-0.5 rounded-full border border-white/20">
                        <span className={`text-[9px] font-black uppercase tracking-widest ${config.color}`}>Actif</span>
                        <div className={`w-1.5 h-1.5 rounded-full ${config.dot} animate-pulse`}></div>
                    </div>
                )}
            </div>
            <div className="relative">
                <h3 className={`text-4xl font-black mb-1 tracking-tighter transition-colors text-laundry-deep`}>
                    {count}
                </h3>
                <p className={`text-[10px] font-black uppercase tracking-[0.2em] transition-colors ${config.color}`}>
                    {title}
                </p>
            </div>
        </button>
    );
};

const StatusBadge = ({ status }) => {
    const config = STATUS_CONFIG[status] || { label: status, color: 'text-slate-500', bg: 'bg-slate-50', dot: 'bg-slate-400' };
    return (
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl ${config.bg} ${config.color} border border-current/10`}>
            <span className={`w-1.5 h-1.5 rounded-full ${config.dot} animate-pulse`}></span>
            <span className="text-[9px] font-black uppercase tracking-widest leading-none">{config.label}</span>
        </div>
    );
};

const OrdersTable = ({ orders, onViewDetail }) => {
    if (orders.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2.5rem] border-2 border-dashed border-laundry-sky/50">
                <div className="p-5 bg-laundry-sky/10 rounded-full mb-4 text-laundry-primary">
                    <ClipboardList size={32} />
                </div>
                <h3 className="text-lg font-black text-laundry-deep uppercase tracking-tight">Aucune commande</h3>
                <p className="text-xs font-bold text-laundry-deep/30">Votre file d'attente est vide pour le moment.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-[2.5rem] border-2 border-laundry-sky/50 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-laundry-sky/10">
                            <th className="px-8 py-5 text-left text-[10px] font-black text-laundry-deep/40 uppercase tracking-[0.2em]">Commande</th>
                            <th className="px-8 py-5 text-left text-[10px] font-black text-laundry-deep/40 uppercase tracking-[0.2em]">Articles</th>
                            <th className="px-8 py-5 text-left text-[10px] font-black text-laundry-deep/40 uppercase tracking-[0.2em]">Status</th>
                            <th className="px-8 py-5 text-left text-[10px] font-black text-laundry-deep/40 uppercase tracking-[0.2em]">Date</th>
                            <th className="px-8 py-5 text-right text-[10px] font-black text-laundry-deep/40 uppercase tracking-[0.2em]">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-laundry-sky/20">
                        {orders.map((order) => (
                            <tr key={order.id} className="hover:bg-laundry-sky/5 transition-colors group">
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-laundry-sky flex items-center justify-center text-laundry-primary">
                                            <Trello size={18} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-laundry-deep uppercase tracking-tight">#{order.numeroCommande}</p>
                                            <p className="text-[10px] font-bold text-laundry-deep/30">ID: {order.id}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-6 text-xs font-black text-laundry-deep">
                                    {order.commandeTapis?.length || 0} Tapis
                                </td>
                                <td className="px-8 py-6">
                                    <StatusBadge status={order.status} />
                                </td>
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-2 text-laundry-deep/50">
                                        <CalendarDays size={14} />
                                        <span className="text-[11px] font-bold">
                                            {new Date(order.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-8 py-6 text-right">
                                    <button
                                        onClick={() => onViewDetail(order.id)}
                                        className="inline-flex items-center gap-2 px-6 py-3 bg-laundry-deep text-white rounded-2xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-laundry-deep/20 hover:bg-laundry-primary transition-all active:scale-95 group"
                                    >
                                        Gérer
                                        <ChevronRight size={12} strokeWidth={3} className="group-hover:translate-x-1 transition-transform" />
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
        <div className="bg-laundry-deep rounded-[2.5rem] p-8 text-white shadow-2xl">
            <h3 className="text-lg font-black uppercase tracking-tighter mb-6 flex items-center gap-3">
                <AlertCircle size={20} className="text-laundry-sky" />
                Dernières Activités
            </h3>
            <div className="space-y-6">
                {activities.length === 0 ? (
                    <p className="text-xs font-bold text-white/30 italic">Aucune activité récente.</p>
                ) : (
                    activities.map((activity, idx) => (
                        <div
                            key={idx}
                            className="flex gap-4 group cursor-pointer"
                            onClick={() => onViewDetail(activity.id)}
                        >
                            <div className="relative flex flex-col items-center">
                                <div className={`w-2 h-2 rounded-full ring-4 transition-all group-hover:scale-150 ${STATUS_CONFIG[activity.status]?.dot || 'bg-laundry-sky'
                                    } ${STATUS_CONFIG[activity.status]?.dot ? 'ring-current/20' : 'ring-laundry-sky/20'
                                    }`}></div>
                                {idx !== activities.length - 1 && <div className="w-px flex-1 bg-white/10 my-2"></div>}
                            </div>
                            <div className="flex-1 pb-4 border-b border-white/5 group-last:border-0 group-last:pb-0">
                                <div className="flex items-center justify-between gap-2 mb-1">
                                    <p className="text-[11px] font-black uppercase tracking-tight group-hover:text-laundry-sky transition-colors">
                                        #{activity.numeroCommande}
                                    </p>
                                    <span className="text-[9px] font-bold text-white/30">
                                        {new Date(activity.updatedAt || activity.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <p className="text-[10px] font-bold text-white/60">
                                    Passé en <span className={STATUS_CONFIG[activity.status]?.color || 'text-laundry-sky'}>
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

// ─── Main Dashboard ───────────────────────────────────────────────────────────

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
            <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50 min-h-screen">
                <Loader2 size={48} className="text-laundry-primary animate-spin mb-4" />
                <p className="text-sm font-black text-laundry-deep/30 uppercase tracking-[0.2em]">Chargement de l'atelier...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-10 p-2 animate-fade-in max-w-[1600px] mx-auto pb-20">
            {/* Header Area */}
            <div className="flex items-end justify-between gap-6 pb-2 border-b-2 border-laundry-sky/20">
                <div>
                    <h1 className="text-5xl font-black text-laundry-deep uppercase tracking-tighter leading-none mb-3">
                        Tableau de <span className="text-laundry-primary">Bord</span>
                    </h1>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 px-4 py-1.5 bg-laundry-sky/20 rounded-full border border-laundry-sky/30">
                            <div className="w-2 h-2 rounded-full bg-laundry-primary animate-pulse"></div>
                            <span className="text-[10px] font-black text-laundry-deep/50 uppercase tracking-widest">Atelier Actif</span>
                        </div>
                        <span className="text-laundry-sky/50 font-bold text-xs">—</span>
                        <p className="text-[10px] font-black text-laundry-deep/30 uppercase tracking-[0.2em]">
                            {filteredCommandes.length} Commandes {filterStatus ? `filtrées par ${STATUS_CONFIG[filterStatus]?.label}` : 'au total'}
                        </p>
                    </div>
                </div>

                <button
                    onClick={handleRefresh}
                    disabled={loading.commandes}
                    className="p-5 bg-white border-2 border-laundry-sky rounded-3xl text-laundry-primary hover:bg-laundry-sky hover:shadow-xl transition-all active:scale-95 disabled:opacity-50"
                >
                    <RefreshCw size={24} className={loading.commandes ? 'animate-spin' : ''} strokeWidth={3} />
                </button>
            </div>

            {/* Stats Overview Sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <DashboardStatsCard
                    title="En Attente"
                    count={stats.enAttente}
                    status={COMMANDE_STATUS.EN_ATTENTE}
                    onClick={() => toggleFilter(COMMANDE_STATUS.EN_ATTENTE)}
                    active={filterStatus === COMMANDE_STATUS.EN_ATTENTE}
                />
                <DashboardStatsCard
                    title="En Traitement"
                    count={stats.enTraitement}
                    status={COMMANDE_STATUS.EN_TRAITEMENT}
                    onClick={() => toggleFilter(COMMANDE_STATUS.EN_TRAITEMENT)}
                    active={filterStatus === COMMANDE_STATUS.EN_TRAITEMENT}
                />
                <DashboardStatsCard
                    title="Prêtes"
                    count={stats.prete}
                    status={COMMANDE_STATUS.PRETE}
                    onClick={() => toggleFilter(COMMANDE_STATUS.PRETE)}
                    active={filterStatus === COMMANDE_STATUS.PRETE}
                />
                <DashboardStatsCard
                    title="Sorties"
                    count={stats.livree}
                    status={COMMANDE_STATUS.LIVREE}
                    onClick={() => toggleFilter(COMMANDE_STATUS.LIVREE)}
                    active={filterStatus === COMMANDE_STATUS.LIVREE}
                />
            </div>

            {/* Main Content: Orders Table & Activity List */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-4">
                            <h2 className="text-2xl font-black text-laundry-deep uppercase tracking-tighter">
                                {filterStatus ? `File : ${STATUS_CONFIG[filterStatus]?.label}` : 'Toutes les Commandes'}
                            </h2>
                            {filterStatus && (
                                <button
                                    onClick={() => setFilterStatus(null)}
                                    className="px-3 py-1 bg-laundry-sky/50 text-laundry-primary text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-laundry-primary hover:text-white transition-all"
                                >
                                    Effacer X
                                </button>
                            )}
                        </div>
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

                    {/* Visual Aid/Summary Card */}
                    <div className="p-8 bg-laundry-sky/10 rounded-[2.5rem] border-2 border-laundry-sky/30">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-white rounded-2xl text-laundry-primary border border-laundry-sky">
                                <PackageCheck size={24} />
                            </div>
                            <h3 className="text-lg font-black text-laundry-deep uppercase tracking-tighter">Performance</h3>
                        </div>
                        <p className="text-xs font-bold text-laundry-deep/50 leading-relaxed">
                            Maintenez un flux de travail régulier pour assurer la satisfaction des clients. N'oubliez pas d'ajouter les photos après nettoyage.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
