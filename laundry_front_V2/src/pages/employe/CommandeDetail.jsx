import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
    ArrowLeft,
    Loader2,
    Package,
    CheckCircle2,
    Clock,
    Wrench,
    Truck,
    Hash,
    User,
    CalendarDays,
    ClipboardList,
    ChevronRight
} from 'lucide-react';
import { fetchCommandeById, updateCommandeStatus, updateTapisEtat } from '../../store/employe/employeThunk';
import {
    selectSelectedCommande,
    selectIsLoadingSelectedCommande,
    selectIsUpdatingStatus,
    selectIsUpdatingTapis
} from '../../store/employe/employeSelectors';
import { COMMANDE_STATUS, TAPIS_ETAT, clearSelectedCommande } from '../../store/employe/employeSlice';

// ─── Status Configs ───────────────────────────────────────────────────────────
const STATUS_CONFIG = {
    [COMMANDE_STATUS.EN_ATTENTE]: { label: 'En Attente', bg: 'bg-amber-50', text: 'text-amber-600', Icon: Clock },
    [COMMANDE_STATUS.VALIDEE]: { label: 'Validée', bg: 'bg-blue-50', text: 'text-blue-600', Icon: CheckCircle2 },
    [COMMANDE_STATUS.EN_TRAITEMENT]: { label: 'En Traitement', bg: 'bg-purple-50', text: 'text-purple-600', Icon: Wrench },
    [COMMANDE_STATUS.PRETE]: { label: 'Prête', bg: 'bg-green-50', text: 'text-green-600', Icon: CheckCircle2 },
    [COMMANDE_STATUS.LIVREE]: { label: 'Sortie', bg: 'bg-teal-50', text: 'text-teal-600', Icon: Truck },
    [COMMANDE_STATUS.PAYEE]: { label: 'Payée', bg: 'bg-emerald-50', text: 'text-emerald-600', Icon: CheckCircle2 },
    [COMMANDE_STATUS.ANNULEE]: { label: 'Annulée', bg: 'bg-red-50', text: 'text-red-500', Icon: ClipboardList },
};

const ETAT_CONFIG = {
    [TAPIS_ETAT.EN_ATTENTE]: { label: 'En Attente', color: 'text-amber-500', bg: 'bg-amber-50', ring: 'ring-amber-200', Icon: Clock, next: TAPIS_ETAT.EN_NETTOYAGE },
    [TAPIS_ETAT.EN_NETTOYAGE]: { label: 'En Nettoyage', color: 'text-blue-500', bg: 'bg-blue-50', ring: 'ring-blue-200', Icon: Wrench, next: TAPIS_ETAT.NETTOYE },
    [TAPIS_ETAT.NETTOYE]: { label: 'Nettoyé', color: 'text-green-500', bg: 'bg-green-50', ring: 'ring-green-200', Icon: CheckCircle2, next: TAPIS_ETAT.LIVRE },
    [TAPIS_ETAT.LIVRE]: { label: 'Livré', color: 'text-emerald-500', bg: 'bg-emerald-50', ring: 'ring-emerald-200', Icon: Truck, next: null },
};

const NEXT_COMMANDE_STATUS = {
    [COMMANDE_STATUS.EN_ATTENTE]: COMMANDE_STATUS.VALIDEE,
    [COMMANDE_STATUS.VALIDEE]: COMMANDE_STATUS.EN_TRAITEMENT,
    [COMMANDE_STATUS.EN_TRAITEMENT]: COMMANDE_STATUS.PRETE,
    [COMMANDE_STATUS.PRETE]: COMMANDE_STATUS.LIVREE,
};

// ─── Tapis Item Component ─────────────────────────────────────────────────────
const TapisItem = ({ item, onUpdateEtat, isUpdating, index }) => {
    // item is a CommandeTapisDTO:
    // { id, tapis: TapisDTO, quantite, prixUnitaire, sousTotal, etat, ... }
    const etatCfg = ETAT_CONFIG[item.etat] || ETAT_CONFIG[TAPIS_ETAT.EN_ATTENTE];
    const Icon = etatCfg.Icon;
    const tapisInfo = item.tapis || {}; // nested TapisDTO

    return (
        <div className={`flex items-start gap-5 p-5 bg-white rounded-3xl border-2 transition-all shadow-sm hover:shadow-md ${etatCfg.ring} ring-2`}>
            {/* Index badge */}
            <div className={`w-14 h-14 rounded-[1.2rem] flex items-center justify-center font-black text-xl ${etatCfg.bg} ${etatCfg.color} flex-shrink-0 mt-0.5`}>
                {index + 1}
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0 space-y-2">
                <h4 className="font-black text-laundry-deep uppercase tracking-tight text-sm truncate">
                    {tapisInfo.nom || tapisInfo.name || `Tapis ${index + 1}`}
                </h4>
                {tapisInfo.description && (
                    <p className="text-[10px] font-bold text-laundry-deep/30 italic truncate">"{tapisInfo.description}"</p>
                )}

                {/* Pricing row */}
                <div className="flex flex-wrap items-center gap-2">
                    {item.quantite && (
                        <span className="text-[9px] font-black text-laundry-deep/50 bg-laundry-sky/50 px-2 py-1 rounded-full">
                            x{item.quantite}
                        </span>
                    )}
                    {item.prixUnitaire && (
                        <span className="text-[9px] font-black text-laundry-primary bg-laundry-sky px-2 py-1 rounded-full">
                            {item.prixUnitaire} DH / u
                        </span>
                    )}
                    {item.sousTotal && (
                        <span className="text-[9px] font-black text-white bg-laundry-primary px-3 py-1 rounded-full">
                            = {item.sousTotal} DH
                        </span>
                    )}
                </div>

                {/* État badge */}
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${etatCfg.bg} ${etatCfg.color}`}>
                    <Icon size={10} strokeWidth={3} />
                    {etatCfg.label}
                </span>
            </div>

            {/* Action: advance état */}
            {etatCfg.next && (
                <button
                    onClick={() => onUpdateEtat(item.id, etatCfg.next)}
                    disabled={isUpdating}
                    className={`flex-shrink-0 flex flex-col items-center justify-center gap-1 px-4 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50 ${etatCfg.bg} ${etatCfg.color} hover:opacity-80 mt-0.5`}
                >
                    {isUpdating ? (
                        <Loader2 size={16} className="animate-spin" />
                    ) : (
                        <ChevronRight size={16} strokeWidth={3} />
                    )}
                    <span>{ETAT_CONFIG[etatCfg.next]?.label}</span>
                </button>
            )}
        </div>
    );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function CommandeDetail() {
    const { id } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const commande = useSelector(selectSelectedCommande);
    const isLoading = useSelector(selectIsLoadingSelectedCommande);
    const isUpdatingStatus = useSelector(selectIsUpdatingStatus);
    const isUpdatingTapis = useSelector(selectIsUpdatingTapis);

    useEffect(() => {
        if (id) dispatch(fetchCommandeById(id));
        return () => { dispatch(clearSelectedCommande()); };
    }, [id, dispatch]);

    const handleAdvanceStatus = async () => {
        const nextStatus = NEXT_COMMANDE_STATUS[commande.status];
        if (!nextStatus) return;
        try {
            await dispatch(updateCommandeStatus({ id: commande.id, newStatus: nextStatus })).unwrap();
            toast.success(`Statut avancé → ${STATUS_CONFIG[nextStatus]?.label}`);
        } catch (err) {
            toast.error(err || 'Erreur');
        }
    };

    const handleUpdateTapisEtat = async (tapisId, newEtat) => {
        try {
            await dispatch(updateTapisEtat({ tapisId, newEtat })).unwrap();
            toast.success(`Tapis mis à jour → ${ETAT_CONFIG[newEtat]?.label}`);
        } catch (err) {
            toast.error(err || 'Erreur');
        }
    };

    const formatDate = (d) => d ? new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

    // ─── Loading ─────────────────────────────────────────────────────────────
    if (isLoading || !commande) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 animate-fade-in text-laundry-primary min-h-[60vh]">
                <Loader2 size={48} className="animate-spin" />
                <p className="text-[10px] font-black uppercase tracking-widest text-laundry-deep/30">Chargement de la commande...</p>
            </div>
        );
    }

    const statusCfg = STATUS_CONFIG[commande.status] || {};
    const StatusIcon = statusCfg.Icon || ClipboardList;
    const nextStatus = NEXT_COMMANDE_STATUS[commande.status];
    const tapis = commande.commandeTapis || [];

    // Progress: total items vs. done
    const doneTapis = tapis.filter(t => t.etat === TAPIS_ETAT.NETTOYE || t.etat === TAPIS_ETAT.LIVRE).length;
    const progress = tapis.length > 0 ? Math.round((doneTapis / tapis.length) * 100) : 0;

    // Total price from sousTotal fields
    const totalPrice = tapis.reduce((sum, t) => sum + (parseFloat(t.sousTotal) || 0), 0);

    return (
        <div className="max-w-3xl mx-auto space-y-8 animate-fade-in pb-16">

            {/* BACK */}
            <button
                onClick={() => navigate('/employe/dashboard')}
                className="flex items-center gap-2 text-laundry-primary font-black uppercase tracking-widest text-[10px] hover:gap-3 transition-all group"
            >
                <ArrowLeft size={16} strokeWidth={3} className="group-hover:-translate-x-1 transition-transform" />
                <span>Retour au tableau</span>
            </button>

            {/* HEADER CARD */}
            <div className="bg-laundry-deep rounded-[2.5rem] p-8 md:p-10 text-white relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-60 h-60 bg-laundry-primary/10 rounded-full -mr-32 -mt-32 blur-3xl animate-pulse"></div>
                <div className="relative z-10 space-y-6">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Hash size={14} className="text-laundry-fresh" />
                                <span className="text-[10px] font-black text-laundry-fresh uppercase tracking-[0.2em]">{commande.numeroCommande}</span>
                            </div>
                            <h2 className="text-3xl font-black uppercase tracking-tighter leading-tight">Commande {commande.id}</h2>
                        </div>
                        <span className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest ${statusCfg.bg} ${statusCfg.text}`}>
                            <StatusIcon size={14} strokeWidth={3} />
                            {statusCfg.label}
                        </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/10">
                            <User size={16} className="text-laundry-fresh flex-shrink-0" />
                            <div>
                                <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">Livreur</p>
                                <p className="text-xs font-black text-white">{commande.livreur?.name || '—'}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/10">
                            <CalendarDays size={16} className="text-laundry-fresh flex-shrink-0" />
                            <div>
                                <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">Créée le</p>
                                <p className="text-xs font-black text-white">{formatDate(commande.dateCreation)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Progress bar */}
                    {tapis.length > 0 && (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <p className="text-[10px] font-black text-white/50 uppercase tracking-widest">Progression Tapis</p>
                                <p className="text-[10px] font-black text-laundry-fresh">{doneTapis}/{tapis.length} terminés</p>
                            </div>
                            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-laundry-fresh rounded-full transition-all duration-500"
                                    style={{ width: `${progress}%` }}
                                ></div>
                            </div>
                        </div>
                    )}

                    {/* Advance status button */}
                    {nextStatus && (
                        <button
                            onClick={handleAdvanceStatus}
                            disabled={isUpdatingStatus}
                            className="w-full flex items-center justify-center gap-3 py-5 bg-laundry-primary rounded-2xl text-white text-xs font-black uppercase tracking-[0.2em] shadow-xl hover:bg-laundry-fresh hover:text-laundry-deep transition-all active:scale-95 disabled:opacity-50"
                        >
                            {isUpdatingStatus ? (
                                <Loader2 size={18} className="animate-spin" />
                            ) : (
                                <CheckCircle2 size={18} strokeWidth={3} />
                            )}
                            <span>Avancer → {STATUS_CONFIG[nextStatus]?.label}</span>
                        </button>
                    )}
                </div>
            </div>

            {/* TAPIS LIST */}
            <div className="space-y-4">
                <div className="flex items-center gap-3 px-2">
                    <Package size={20} className="text-laundry-primary" />
                    <h3 className="font-black text-laundry-deep uppercase tracking-widest text-sm">
                        Inventaire — {tapis.length} tapis
                    </h3>
                </div>

                {tapis.length === 0 ? (
                    <div className="text-center py-20 border-2 border-dashed border-laundry-sky rounded-[2rem]">
                        <Package size={40} className="mx-auto text-laundry-deep/10 mb-3" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-laundry-deep/20">Aucun tapis enregistré</p>
                    </div>
                ) : (
                    <>
                        <div className="space-y-3">
                            {tapis.map((t, i) => (
                                <TapisItem
                                    key={t.id}
                                    item={t}
                                    index={i}
                                    onUpdateEtat={handleUpdateTapisEtat}
                                    isUpdating={isUpdatingTapis}
                                />
                            ))}
                        </div>

                        {/* TOTAL PRICE SUMMARY */}
                        {totalPrice > 0 && (
                            <div className="flex items-center justify-between p-5 bg-laundry-deep text-white rounded-3xl shadow-xl mt-4">
                                <div>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-white/40">Total Commande</p>
                                    <p className="text-[10px] font-bold text-white/60 mt-0.5">{tapis.length} tapis · {tapis.reduce((s, t) => s + (t.quantite || 0), 0)} unités</p>
                                </div>
                                <p className="text-3xl font-black text-laundry-fresh">{totalPrice.toFixed(2)} <span className="text-sm">DH</span></p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
