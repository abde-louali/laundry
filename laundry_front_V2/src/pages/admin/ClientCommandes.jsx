import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Loader2, ChevronRight, ClipboardList,
    Clock, CheckCircle2, Wrench, PackageCheck, Truck, CreditCard, XCircle
} from 'lucide-react';
import { fetchAllClients, fetchClientCommandes } from '../../store/admin/adminThunk';
import { clearClientCommandes } from '../../store/admin/adminSlice';

const STATUS_CONFIG = {
    en_attente: { label: 'En Attente', bg: 'bg-laundry-warning-light', text: 'text-laundry-warning', dot: 'bg-laundry-warning', Icon: Clock },
    validee: { label: 'Validée', bg: 'bg-blue-50', text: 'text-laundry-primary-light', dot: 'bg-laundry-primary-light', Icon: CheckCircle2 },
    en_traitement: { label: 'En Traitement', bg: 'bg-purple-50', text: 'text-purple-600', dot: 'bg-purple-500', Icon: Wrench },
    prete: { label: 'Prête', bg: 'bg-laundry-success-light', text: 'text-laundry-success', dot: 'bg-laundry-success', Icon: PackageCheck },
    livree: { label: 'Livrée', bg: 'bg-cyan-50', text: 'text-laundry-accent', dot: 'bg-laundry-accent', Icon: Truck },
    payee: { label: 'Payée', bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-600', Icon: CreditCard },
    annulee: { label: 'Annulée', bg: 'bg-laundry-error-light', text: 'text-laundry-error', dot: 'bg-laundry-error', Icon: XCircle },
};

export default function ClientCommandes() {
    const { clientId } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { clientCommandes, clients, loading } = useSelector(s => s.admin);

    useEffect(() => {
        dispatch(fetchClientCommandes(clientId));
        if (clients.length === 0) dispatch(fetchAllClients());
        return () => { dispatch(clearClientCommandes()); };
    }, [clientId, dispatch]);

    const client = clients.find(c => String(c.id) === String(clientId));

    if (loading && clientCommandes.length === 0) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 min-h-[60vh] bg-laundry-background rounded-xl">
                <Loader2 size={32} className="animate-spin text-laundry-primary" />
                <p className="text-xs font-semibold uppercase tracking-wider text-laundry-text-secondary">Chargement...</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-fade-in p-4 sm:p-6 lg:p-8">

            {/* BACK BUTTON */}
            <button
                onClick={() => navigate('/admin/clients')}
                className="flex items-center gap-2 text-laundry-text-secondary font-medium text-sm hover:text-laundry-primary transition-all group w-fit"
            >
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                <span>Tous les clients</span>
            </button>

            {/* CLIENT HEADER */}
            <div className="bg-white rounded-xl shadow-card border border-laundry-border p-6 md:p-8 flex items-center gap-6">
                <div className="w-16 h-16 bg-laundry-background rounded-full flex items-center justify-center text-2xl font-bold text-laundry-primary border border-laundry-border flex-shrink-0">
                    {client?.name?.[0]?.toUpperCase() || '?'}
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-laundry-text-primary tracking-tight">
                        {client?.name || `Client #${clientId}`}
                    </h2>
                    <p className="text-xs font-semibold text-laundry-text-secondary uppercase tracking-wider mt-1">
                        Historique: {clientCommandes.length} commandes
                    </p>
                </div>
            </div>

            {/* COMMANDES LIST */}
            <div className="bg-white rounded-xl shadow-card border border-laundry-border overflow-hidden">
                <div className="p-6 border-b border-laundry-border flex items-center gap-3">
                    <ClipboardList size={18} className="text-laundry-text-muted" />
                    <h3 className="font-bold text-laundry-text-primary text-lg">
                        Commandes
                    </h3>
                </div>

                {clientCommandes.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <ClipboardList size={40} className="text-laundry-text-muted opacity-50 mb-4" />
                        <p className="text-sm font-semibold text-laundry-text-secondary">Aucune commande pour ce client</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-laundry-background border-b border-laundry-border">
                                    <th className="px-6 py-4 text-xs font-semibold text-laundry-text-secondary uppercase tracking-wider">N° Commande</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-laundry-text-secondary uppercase tracking-wider">Statut</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-laundry-text-secondary uppercase tracking-wider text-right">Montant</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-laundry-text-secondary uppercase tracking-wider text-right">Détails</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-laundry-border">
                                {clientCommandes.map(c => {
                                    const cfg = STATUS_CONFIG[c.status] || {};
                                    return (
                                        <tr 
                                            key={c.id}
                                            onClick={() => navigate(`/admin/commandes/${c.id}`)}
                                            className="hover:bg-laundry-background/50 cursor-pointer transition-colors group"
                                        >
                                            <td className="px-6 py-4">
                                                <span className="text-sm font-bold text-laundry-text-primary group-hover:text-laundry-primary transition-colors">#{c.numeroCommande}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-semibold uppercase tracking-wider border border-transparent ${cfg.bg} ${cfg.text}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}></span>
                                                    {cfg.label}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {c.montantTotal != null ? (
                                                    <span className="font-bold text-sm text-laundry-text-primary">{c.montantTotal} DH</span>
                                                ) : (
                                                    <span className="font-medium text-sm text-laundry-text-muted">—</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button className="text-laundry-text-muted group-hover:text-laundry-primary transition-colors p-1">
                                                    <ChevronRight size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
