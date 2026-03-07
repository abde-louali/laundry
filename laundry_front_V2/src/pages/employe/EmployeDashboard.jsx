import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
    ClipboardList,
    CheckCircle2,
    Clock,
    Wrench,
    PackageCheck,
    Truck,
    XCircle,
    CreditCard,
    ChevronRight,
    RefreshCw,
    Loader2,
    CalendarDays
} from 'lucide-react';
import { fetchAllCommandes, updateCommandeStatus } from '../../store/employe/employeThunk';
import { selectCommandes, selectLoading } from '../../store/employe/employeSelectors';
import { COMMANDE_STATUS } from '../../store/employe/employeSlice';

// Status config: label, colors, icon
const STATUS_CONFIG = {
    [COMMANDE_STATUS.EN_ATTENTE]: { label: 'En Attente', bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200', dot: 'bg-amber-400', Icon: Clock },
    [COMMANDE_STATUS.VALIDEE]: { label: 'Validée', bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200', dot: 'bg-blue-500', Icon: CheckCircle2 },
    [COMMANDE_STATUS.EN_TRAITEMENT]: { label: 'En Traitement', bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200', dot: 'bg-purple-500', Icon: Wrench },
    [COMMANDE_STATUS.PRETE]: { label: 'Prête', bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-200', dot: 'bg-green-500', Icon: PackageCheck },
    [COMMANDE_STATUS.LIVREE]: { label: 'Sortie', bg: 'bg-teal-50', text: 'text-teal-600', border: 'border-teal-200', dot: 'bg-teal-500', Icon: Truck },
    [COMMANDE_STATUS.PAYEE]: { label: 'Payée', bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200', dot: 'bg-emerald-500', Icon: CreditCard },
    [COMMANDE_STATUS.ANNULEE]: { label: 'Annulée', bg: 'bg-red-50', text: 'text-red-500', border: 'border-red-200', dot: 'bg-red-400', Icon: XCircle },
};

// Status flow — what the employee can advance to
const NEXT_STATUS = {
    [COMMANDE_STATUS.EN_ATTENTE]: COMMANDE_STATUS.VALIDEE,
    [COMMANDE_STATUS.VALIDEE]: COMMANDE_STATUS.EN_TRAITEMENT,
    [COMMANDE_STATUS.EN_TRAITEMENT]: COMMANDE_STATUS.PRETE,
    [COMMANDE_STATUS.PRETE]: COMMANDE_STATUS.LIVREE,
};

const StatusBadge = ({ status }) => {
    const config = STATUS_CONFIG[status] || { label: status, bg: 'bg-slate-50', text: 'text-slate-500', dot: 'bg-slate-400' };
    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${config.bg} ${config.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`}></span>
            {config.label}
        </span>
    );
};

const CommandCard = ({ commande, onAdvance, onView, isUpdating }) => {
    const nextStatus = NEXT_STATUS[commande.status];
    const formatDate = (d) => d ? new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }) : '—';

    return (
        <div className="bg-white rounded-3xl border border-laundry-sky/50 p-5 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all group">
            <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                    <p className="text-[9px] font-black text-laundry-primary uppercase tracking-[0.2em] mb-1">
                        #{commande.numeroCommande}
                    </p>
                    <h4 className="font-black text-laundry-deep text-sm uppercase tracking-tight">
                        {commande.livreur?.name || 'Livreur'}
                    </h4>
                    <div className="flex items-center gap-1 mt-1 text-laundry-deep/30">
                        <CalendarDays size={10} />
                        <span className="text-[9px] font-bold">{formatDate(commande.createdAt)}</span>
                    </div>
                </div>
                <StatusBadge status={commande.status} />
            </div>

            <div className="flex gap-2 mt-4">
                {nextStatus && (
                    <button
                        onClick={() => onAdvance(commande.id, nextStatus)}
                        disabled={isUpdating}
                        className="flex-1 flex items-center justify-center gap-2 py-3 bg-laundry-primary text-white rounded-2xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-laundry-primary/20 hover:bg-laundry-deep transition-all active:scale-95 disabled:opacity-50"
                    >
                        {isUpdating ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={12} strokeWidth={3} />}
                        <span>→ {STATUS_CONFIG[nextStatus]?.label}</span>
                    </button>
                )}
                <button
                    onClick={() => onView(commande.id)}
                    className={`flex items-center justify-center gap-1 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest text-laundry-primary bg-laundry-sky/50 hover:bg-laundry-sky transition-all active:scale-95 ${nextStatus ? 'px-4' : 'flex-1 px-4'}`}
                >
                    <span>Détails</span>
                    <ChevronRight size={12} strokeWidth={3} />
                </button>
            </div>
        </div>
    );
};

const PipelineColumn = ({ status, commandes, onAdvance, onView, isUpdating }) => {
    const config = STATUS_CONFIG[status];
    const Icon = config?.Icon || ClipboardList;

    return (
        <div className={`flex-shrink-0 w-72 lg:w-80 flex flex-col rounded-[2rem] border-2 ${config?.border || 'border-laundry-sky'} overflow-hidden`}>
            {/* Column Header */}
            <div className={`p-5 ${config?.bg || 'bg-laundry-sky/20'} border-b-2 ${config?.border || 'border-laundry-sky'}`}>
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${config?.bg} ${config?.text}`}>
                        <Icon size={18} strokeWidth={3} />
                    </div>
                    <div>
                        <h3 className={`font-black uppercase tracking-tight text-sm ${config?.text}`}>{config?.label}</h3>
                        <p className="text-[10px] font-bold text-laundry-deep/30">{commandes.length} commande{commandes.length !== 1 ? 's' : ''}</p>
                    </div>
                </div>
            </div>

            {/* Cards */}
            <div className="flex-1 p-3 space-y-3 overflow-y-auto bg-laundry-sky/5 min-h-[200px]">
                {commandes.length === 0 ? (
                    <div className="flex items-center justify-center h-24 text-laundry-deep/20">
                        <p className="text-[10px] font-black uppercase tracking-widest">Vide</p>
                    </div>
                ) : (
                    commandes.map(c => (
                        <CommandCard
                            key={c.id}
                            commande={c}
                            onAdvance={onAdvance}
                            onView={onView}
                            isUpdating={isUpdating}
                        />
                    ))
                )}
            </div>
        </div>
    );
};

const PIPELINE_COLUMNS = [
    COMMANDE_STATUS.EN_ATTENTE,
    COMMANDE_STATUS.VALIDEE,
    COMMANDE_STATUS.EN_TRAITEMENT,
    COMMANDE_STATUS.PRETE,
    COMMANDE_STATUS.LIVREE,
];

export default function EmployeDashboard() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const commandes = useSelector(selectCommandes);
    const loading = useSelector(selectLoading);

    useEffect(() => {
        dispatch(fetchAllCommandes());
    }, [dispatch]);

    const handleAdvanceStatus = async (commandeId, newStatus) => {
        try {
            await dispatch(updateCommandeStatus({ id: commandeId, newStatus })).unwrap();
            toast.success(`Commande avancée → ${STATUS_CONFIG[newStatus]?.label}`);
        } catch (err) {
            toast.error(err || 'Erreur lors de la mise à jour');
        }
    };

    const handleViewDetail = (id) => {
        navigate(`/employe/commandes/${id}`);
    };

    const handleRefresh = () => {
        dispatch(fetchAllCommandes());
    };

    // Group commandes by status
    const grouped = PIPELINE_COLUMNS.reduce((acc, status) => {
        acc[status] = commandes.filter(c => c.status === status);
        return acc;
    }, {});

    const totalActive = commandes.filter(c =>
        [COMMANDE_STATUS.EN_ATTENTE, COMMANDE_STATUS.VALIDEE, COMMANDE_STATUS.EN_TRAITEMENT, COMMANDE_STATUS.PRETE].includes(c.status)
    ).length;

    return (
        <div className="flex flex-col h-full animate-fade-in">

            {/* HEADER */}
            <div className="flex items-center justify-between mb-8 px-1">
                <div>
                    <h1 className="text-3xl font-black text-laundry-deep uppercase tracking-tighter">
                        Atelier <span className="text-laundry-primary">Lavage</span>
                    </h1>
                    <p className="text-[10px] font-black text-laundry-deep/30 uppercase tracking-[0.2em] mt-1">
                        {totalActive} commandes actives en cours
                    </p>
                </div>
                <button
                    onClick={handleRefresh}
                    disabled={loading.commandes}
                    className="p-4 bg-white border-2 border-laundry-sky rounded-2xl text-laundry-primary hover:bg-laundry-sky hover:border-laundry-primary/20 transition-all active:scale-95 shadow-sm"
                >
                    <RefreshCw size={20} className={loading.commandes ? 'animate-spin' : ''} strokeWidth={3} />
                </button>
            </div>

            {/* PIPELINE BOARD */}
            {loading.commandes && commandes.length === 0 ? (
                <div className="flex-1 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-4 text-laundry-primary">
                        <Loader2 size={48} className="animate-spin" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-laundry-deep/30">Chargement...</p>
                    </div>
                </div>
            ) : (
                <div className="flex-1 overflow-x-auto pb-8">
                    <div className="flex gap-4 h-full min-w-max">
                        {PIPELINE_COLUMNS.map(status => (
                            <PipelineColumn
                                key={status}
                                status={status}
                                commandes={grouped[status] || []}
                                onAdvance={handleAdvanceStatus}
                                onView={handleViewDetail}
                                isUpdating={loading.updateStatus}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
