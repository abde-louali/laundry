import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Loader2, Package, Hash, User, CalendarDays,
    ClipboardList, MapPin, Phone, CreditCard, CheckCircle2,
    Clock, Wrench, Truck, XCircle, DollarSign, ChevronRight
} from 'lucide-react';
import { fetchCommandeById } from '../../store/admin/adminThunk';
import { clearSelectedCommande } from '../../store/admin/adminSlice';

const STATUS_CONFIG = {
    en_attente: { label: 'En Attente', bg: 'bg-amber-50', text: 'text-amber-600', Icon: Clock },
    validee: { label: 'Validée', bg: 'bg-blue-50', text: 'text-blue-600', Icon: CheckCircle2 },
    en_traitement: { label: 'En Traitement', bg: 'bg-purple-50', text: 'text-purple-600', Icon: Wrench },
    prete: { label: 'Prête', bg: 'bg-green-50', text: 'text-green-600', Icon: CheckCircle2 },
    livree: { label: 'Livrée', bg: 'bg-teal-50', text: 'text-teal-600', Icon: Truck },
    payee: { label: 'Payée', bg: 'bg-emerald-50', text: 'text-emerald-600', Icon: CreditCard },
    annulee: { label: 'Annulée', bg: 'bg-red-50', text: 'text-red-500', Icon: XCircle },
};

const ETAT_CONFIG = {
    en_attente: { label: 'En Attente', color: 'text-amber-500', bg: 'bg-amber-50', Icon: Clock },
    en_nettoyage: { label: 'En Nettoyage', color: 'text-blue-500', bg: 'bg-blue-50', Icon: Wrench },
    nettoye: { label: 'Nettoyé', color: 'text-green-500', bg: 'bg-green-50', Icon: CheckCircle2 },
    livre: { label: 'Livré', color: 'text-emerald-500', bg: 'bg-emerald-50', Icon: Truck },
};

const InfoChip = ({ icon: Icon, label, value }) => (
    <div className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/10">
        <Icon size={16} className="text-laundry-fresh flex-shrink-0" />
        <div>
            <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">{label}</p>
            <p className="text-xs font-black text-white">{value || '—'}</p>
        </div>
    </div>
);

export default function AdminCommandeDetail() {
    const { id } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { selectedCommande: commande, loading } = useSelector(s => s.admin);

    useEffect(() => {
        if (id) dispatch(fetchCommandeById(id));
        return () => { dispatch(clearSelectedCommande()); };
    }, [id, dispatch]);

    const formatDate = (d) => d ? new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }) : '—';

    if (loading || !commande) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 min-h-[60vh] text-laundry-primary">
                <Loader2 size={48} className="animate-spin" />
                <p className="text-[10px] font-black uppercase tracking-widest text-laundry-deep/30">Chargement...</p>
            </div>
        );
    }

    const statusCfg = STATUS_CONFIG[commande.status] || {};
    const StatusIcon = statusCfg.Icon || ClipboardList;
    const tapis = commande.commandeTapis || [];
    const totalPrice = tapis.reduce((sum, t) => sum + (parseFloat(t.sousTotal) || 0), 0);

    return (
        <div className="max-w-3xl mx-auto space-y-8 animate-fade-in pb-16">

            {/* BACK */}
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-laundry-primary font-black uppercase tracking-widest text-[10px] hover:gap-3 transition-all group"
            >
                <ArrowLeft size={16} strokeWidth={3} className="group-hover:-translate-x-1 transition-transform" />
                <span>Retour</span>
            </button>

            {/* HEADER CARD */}
            <div className="bg-laundry-deep rounded-[2.5rem] p-8 md:p-10 text-white relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-60 h-60 bg-laundry-primary/10 rounded-full -mr-32 -mt-32 blur-3xl animate-pulse"></div>
                <div className="relative z-10 space-y-6">

                    {/* Number + Status */}
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Hash size={14} className="text-laundry-fresh" />
                                <span className="text-[10px] font-black text-laundry-fresh uppercase tracking-[0.2em]">{commande.numeroCommande}</span>
                            </div>
                            <h2 className="text-3xl font-black uppercase tracking-tighter">Commande #{commande.id}</h2>
                        </div>
                        <span className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest ${statusCfg.bg} ${statusCfg.text}`}>
                            <StatusIcon size={14} strokeWidth={3} />
                            {statusCfg.label}
                        </span>
                    </div>

                    {/* Info grid */}
                    <div className="grid grid-cols-2 gap-3">
                        <InfoChip icon={User} label="Livreur" value={commande.livreur?.name} />
                        <InfoChip icon={User} label="Client" value={commande.client?.name} />
                        <InfoChip icon={Phone} label="Téléphone" value={commande.client?.phone} />
                        <InfoChip icon={CalendarDays} label="Créée le" value={formatDate(commande.dateCreation)} />
                        {commande.dateLivraison && (
                            <InfoChip icon={Truck} label="Livrée le" value={formatDate(commande.dateLivraison)} />
                        )}
                        {commande.modePaiement && (
                            <InfoChip icon={CreditCard} label="Paiement" value={commande.modePaiement} />
                        )}
                    </div>

                    {/* Total */}
                    {commande.montantTotal != null && (
                        <div className="flex items-center justify-between p-5 bg-white/5 rounded-2xl border border-white/10">
                            <div className="flex items-center gap-3">
                                <DollarSign size={20} className="text-laundry-fresh" />
                                <span className="font-black uppercase tracking-widest text-xs text-white/60">Montant Total</span>
                            </div>
                            <span className="text-3xl font-black text-laundry-fresh">{commande.montantTotal} <span className="text-sm">DH</span></span>
                        </div>
                    )}

                    {/* Client address */}
                    {commande.client?.address && (
                        <div className="flex items-start gap-3 p-4 bg-white/5 rounded-2xl border border-white/10">
                            <MapPin size={16} className="text-laundry-fresh flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1">Adresse</p>
                                <p className="text-xs font-bold text-white/80">{commande.client.address}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* TAPIS LIST */}
            {tapis.length > 0 && (
                <div className="space-y-4">
                    <div className="flex items-center gap-3 px-2">
                        <Package size={20} className="text-laundry-primary" />
                        <h3 className="font-black text-laundry-deep uppercase tracking-widest text-sm">
                            Inventaire — {tapis.length} tapis
                        </h3>
                    </div>

                    <div className="space-y-3">
                        {tapis.map((t, i) => {
                            const etatCfg = ETAT_CONFIG[t.etat] || ETAT_CONFIG.en_attente;
                            const EtatIcon = etatCfg.Icon;
                            const tapisInfo = t.tapis || {};
                            return (
                                <div key={t.id} className="bg-white rounded-3xl border-2 border-laundry-sky/50 p-5 flex items-center gap-5 shadow-sm">
                                    <div className={`w-12 h-12 rounded-[1.2rem] flex items-center justify-center font-black text-lg ${etatCfg.bg} ${etatCfg.color} flex-shrink-0`}>
                                        {i + 1}
                                    </div>
                                    <div className="flex-1 min-w-0 space-y-1.5">
                                        <h4 className="font-black text-laundry-deep uppercase tracking-tight text-sm truncate">
                                            {tapisInfo.nom || tapisInfo.name || `Tapis ${i + 1}`}
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                            {t.quantite && <span className="text-[9px] font-black text-laundry-deep/50 bg-laundry-sky/50 px-2 py-1 rounded-full">x{t.quantite}</span>}
                                            {t.prixUnitaire && <span className="text-[9px] font-black text-laundry-primary bg-laundry-sky px-2 py-1 rounded-full">{t.prixUnitaire} DH/u</span>}
                                            {t.sousTotal && <span className="text-[9px] font-black text-white bg-laundry-primary px-3 py-1 rounded-full">= {t.sousTotal} DH</span>}
                                        </div>
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${etatCfg.bg} ${etatCfg.color}`}>
                                            <EtatIcon size={10} strokeWidth={3} /> {etatCfg.label}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Total */}
                    {totalPrice > 0 && (
                        <div className="flex items-center justify-between p-5 bg-laundry-deep text-white rounded-3xl shadow-xl">
                            <div>
                                <p className="text-[9px] font-black uppercase tracking-widest text-white/40">Total Calculé</p>
                                <p className="text-[10px] font-bold text-white/60 mt-0.5">{tapis.length} tapis · {tapis.reduce((s, t) => s + (t.quantite || 0), 0)} unités</p>
                            </div>
                            <p className="text-3xl font-black text-laundry-fresh">{totalPrice.toFixed(2)} <span className="text-sm">DH</span></p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
