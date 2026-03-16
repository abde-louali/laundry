import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Loader2, Package, Hash, User, CalendarDays,
    ClipboardList, MapPin, Phone, CreditCard, CheckCircle2,
    Clock, Wrench, Truck, XCircle, DollarSign
} from 'lucide-react';
import { fetchCommandeById } from '../../store/admin/adminThunk';
import { clearSelectedCommande } from '../../store/admin/adminSlice';

const STATUS_CONFIG = {
    en_attente: { label: 'En Attente', bg: 'bg-laundry-warning-light', text: 'text-laundry-warning', Icon: Clock },
    validee: { label: 'Validée', bg: 'bg-blue-50', text: 'text-laundry-primary-light', Icon: CheckCircle2 },
    en_traitement: { label: 'En Traitement', bg: 'bg-purple-50', text: 'text-purple-600', Icon: Wrench },
    prete: { label: 'Prête', bg: 'bg-laundry-success-light', text: 'text-laundry-success', Icon: CheckCircle2 },
    livree: { label: 'Livrée', bg: 'bg-cyan-50', text: 'text-laundry-accent', Icon: Truck },
    payee: { label: 'Payée', bg: 'bg-emerald-50', text: 'text-emerald-700', Icon: CreditCard },
    annulee: { label: 'Annulée', bg: 'bg-laundry-error-light', text: 'text-laundry-error', Icon: XCircle },
};

const ETAT_CONFIG = {
    en_attente: { label: 'En Attente', color: 'text-laundry-warning', bg: 'bg-laundry-warning-light', Icon: Clock },
    en_nettoyage: { label: 'En Nettoyage', color: 'text-laundry-primary-light', bg: 'bg-blue-50', Icon: Wrench },
    nettoye: { label: 'Nettoyé', color: 'text-laundry-success', bg: 'bg-laundry-success-light', Icon: CheckCircle2 },
    livre: { label: 'Livré', color: 'text-emerald-700', bg: 'bg-emerald-50', Icon: Truck },
};

const InfoChip = ({ icon: Icon, label, value }) => (
    <div className="flex items-center gap-3 p-4 bg-laundry-background rounded-lg border border-laundry-border transition-colors hover:bg-white hover:border-laundry-text-muted/30">
        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center border border-laundry-border flex-shrink-0">
            <Icon size={16} className="text-laundry-text-muted" />
        </div>
        <div>
            <p className="text-xs font-semibold text-laundry-text-secondary uppercase tracking-wider">{label}</p>
            <p className="text-sm font-bold text-laundry-text-primary mt-0.5">{value || '—'}</p>
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
            <div className="flex-1 flex flex-col items-center justify-center gap-4 min-h-[60vh] bg-laundry-background rounded-xl">
                <Loader2 size={32} className="animate-spin text-laundry-primary" />
                <p className="text-xs font-semibold uppercase tracking-wider text-laundry-text-secondary">Chargement...</p>
            </div>
        );
    }

    const statusCfg = STATUS_CONFIG[commande.status] || {};
    const StatusIcon = statusCfg.Icon || ClipboardList;
    const tapis = commande.commandeTapis || [];
    const totalPrice = tapis.reduce((sum, t) => sum + (parseFloat(t.sousTotal) || 0), 0);

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-fade-in p-4 sm:p-6 lg:p-8">

            {/* BACK & HEADER */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-laundry-text-secondary font-medium text-sm hover:text-laundry-primary transition-all group"
                >
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                    <span>Retour</span>
                </button>

                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider border border-transparent ${statusCfg.bg} ${statusCfg.text}`}>
                    <StatusIcon size={14} />
                    {statusCfg.label}
                </div>
            </div>

            {/* MAIN CARD */}
            <div className="bg-white rounded-xl shadow-card border border-laundry-border overflow-hidden">
                <div className="p-6 md:p-8 border-b border-laundry-border relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-2 h-full bg-laundry-primary"></div>
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <Hash size={16} className="text-laundry-text-muted" />
                                <span className="text-xs font-bold text-laundry-text-secondary uppercase tracking-widest">Commande #{commande.id}</span>
                            </div>
                            <h2 className="text-2xl font-bold text-laundry-text-primary tracking-tight">{commande.numeroCommande}</h2>
                        </div>
                        {commande.montantTotal != null && (
                            <div className="flex flex-col items-end">
                                <span className="text-xs font-semibold text-laundry-text-secondary uppercase tracking-wider mb-1">Montant Total</span>
                                <span className="text-2xl font-bold text-laundry-primary">{commande.montantTotal} <span className="text-sm text-laundry-text-muted">DH</span></span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-6 md:p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <InfoChip icon={User} label="Client" value={commande.client?.name} />
                    <InfoChip icon={Phone} label="Téléphone" value={commande.client?.phone} />
                    {commande.client?.address && (
                        <div className="sm:col-span-2 lg:col-span-1 border border-laundry-border rounded-lg bg-laundry-background p-4 flex gap-3">
                            <MapPin size={16} className="text-laundry-text-muted flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-xs font-semibold text-laundry-text-secondary uppercase tracking-wider">Adresse</p>
                                <p className="text-sm font-bold text-laundry-text-primary mt-1">{commande.client.address}</p>
                            </div>
                        </div>
                    )}
                    <InfoChip icon={User} label="Livreur Assigné" value={commande.livreur?.name} />
                    <InfoChip icon={CalendarDays} label="Créée le" value={formatDate(commande.dateCreation)} />
                    {commande.dateLivraison && (
                        <InfoChip icon={Truck} label="Livrée le" value={formatDate(commande.dateLivraison)} />
                    )}
                    {commande.modePaiement && (
                        <InfoChip icon={CreditCard} label="Paiement" value={commande.modePaiement} />
                    )}
                </div>
            </div>

            {/* INVENTORY */}
            {tapis.length > 0 && (
                <div className="bg-white rounded-xl shadow-card border border-laundry-border p-6 md:p-8">
                    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-laundry-border">
                        <Package size={20} className="text-laundry-text-muted" />
                        <h3 className="font-bold text-laundry-text-primary text-lg tracking-tight">
                            Inventaire
                        </h3>
                        <span className="text-xs font-semibold text-laundry-text-secondary bg-laundry-background px-2 py-0.5 rounded-full border border-laundry-border">
                            {tapis.length} articles
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-laundry-background/50 border-b border-laundry-border">
                                    <th className="px-4 py-3 text-xs font-semibold text-laundry-text-secondary uppercase tracking-wider">Id</th>
                                    <th className="px-4 py-3 text-xs font-semibold text-laundry-text-secondary uppercase tracking-wider">Article</th>
                                    <th className="px-4 py-3 text-xs font-semibold text-laundry-text-secondary uppercase tracking-wider text-center">Qté</th>
                                    <th className="px-4 py-3 text-xs font-semibold text-laundry-text-secondary uppercase tracking-wider text-right">Prix</th>
                                    <th className="px-4 py-3 text-xs font-semibold text-laundry-text-secondary uppercase tracking-wider text-center">État</th>
                                    <th className="px-4 py-3 text-xs font-semibold text-laundry-text-secondary uppercase tracking-wider text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-laundry-border">
                                {tapis.map((t, i) => {
                                    const etatCfg = ETAT_CONFIG[t.etat] || ETAT_CONFIG.en_attente;
                                    const EtatIcon = etatCfg.Icon;
                                    const tapisInfo = t.tapis || {};
                                    return (
                                        <tr key={t.id} className="hover:bg-laundry-background/30 transition-colors">
                                            <td className="px-4 py-4 text-xs font-bold text-laundry-text-muted">#{i + 1}</td>
                                            <td className="px-4 py-4 font-semibold text-sm text-laundry-text-primary truncate max-w-[200px]">
                                                {tapisInfo.nom || tapisInfo.name || `Tapis ${i + 1}`}
                                            </td>
                                            <td className="px-4 py-4 text-center text-sm font-medium">{t.quantite || 1}</td>
                                            <td className="px-4 py-4 text-right text-sm text-laundry-text-secondary">{t.prixUnitaire ? `${t.prixUnitaire} DH` : '—'}</td>
                                            <td className="px-4 py-4 text-center">
                                                <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-semibold uppercase tracking-wider border border-transparent ${etatCfg.bg} ${etatCfg.color}`}>
                                                    <EtatIcon size={12} /> {etatCfg.label}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-right font-bold text-laundry-text-primary">
                                                {t.sousTotal ? `${t.sousTotal} DH` : '—'}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {totalPrice > 0 && (
                        <div className="flex items-center justify-between p-5 bg-laundry-background border border-laundry-border rounded-lg mt-6">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-wider text-laundry-text-secondary">Sous-total Calculé</p>
                                <p className="text-sm font-medium text-laundry-text-muted mt-0.5">{tapis.reduce((s, t) => s + (t.quantite || 0), 0)} unités</p>
                            </div>
                            <p className="text-2xl font-bold text-laundry-text-primary">{totalPrice.toFixed(2)} <span className="text-sm text-laundry-text-secondary">DH</span></p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
