import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Loader2, ChevronRight, ClipboardList,
    Clock, CheckCircle2, Wrench, PackageCheck, Truck, CreditCard, XCircle, DollarSign
} from 'lucide-react';
import { fetchAllClients, fetchClientCommandes } from '../../store/admin/adminThunk';
import { clearClientCommandes } from '../../store/admin/adminSlice';

const STATUS_CONFIG = {
    en_attente: { label: 'En Attente', bg: 'bg-amber-50', text: 'text-amber-600', dot: 'bg-amber-400', Icon: Clock },
    validee: { label: 'Validée', bg: 'bg-blue-50', text: 'text-blue-600', dot: 'bg-blue-500', Icon: CheckCircle2 },
    en_traitement: { label: 'En Traitement', bg: 'bg-purple-50', text: 'text-purple-600', dot: 'bg-purple-500', Icon: Wrench },
    prete: { label: 'Prête', bg: 'bg-green-50', text: 'text-green-600', dot: 'bg-green-500', Icon: PackageCheck },
    livree: { label: 'Livrée', bg: 'bg-teal-50', text: 'text-teal-600', dot: 'bg-teal-500', Icon: Truck },
    payee: { label: 'Payée', bg: 'bg-emerald-50', text: 'text-emerald-600', dot: 'bg-emerald-500', Icon: CreditCard },
    annulee: { label: 'Annulée', bg: 'bg-red-50', text: 'text-red-500', dot: 'bg-red-400', Icon: XCircle },
};

export default function ClientCommandes() {
    const { clientId } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { clientCommandes, clients, loading } = useSelector(s => s.admin);

    useEffect(() => {
        dispatch(fetchClientCommandes(clientId));
        // Fetch clients list if not already loaded (to get the client's name)
        if (clients.length === 0) dispatch(fetchAllClients());
        return () => { dispatch(clearClientCommandes()); };
    }, [clientId, dispatch]);

    const client = clients.find(c => String(c.id) === String(clientId));

    if (loading && clientCommandes.length === 0) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 min-h-[60vh] text-laundry-primary">
                <Loader2 size={48} className="animate-spin" />
                <p className="text-[10px] font-black uppercase tracking-widest text-laundry-deep/30">Chargement...</p>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto space-y-8 animate-fade-in pb-16">

            {/* BACK */}
            <button
                onClick={() => navigate('/admin/clients')}
                className="flex items-center gap-2 text-laundry-primary font-black uppercase tracking-widest text-[10px] hover:gap-3 transition-all group"
            >
                <ArrowLeft size={16} strokeWidth={3} className="group-hover:-translate-x-1 transition-transform" />
                <span>Tous les clients</span>
            </button>

            {/* CLIENT HEADER */}
            <div className="bg-laundry-deep rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-60 h-60 bg-laundry-primary/10 rounded-full -mr-32 -mt-32 blur-3xl animate-pulse" />
                <div className="relative z-10 flex items-center gap-6">
                    <div className="w-20 h-20 bg-white/10 backdrop-blur rounded-[1.5rem] flex items-center justify-center text-3xl font-black text-laundry-fresh border border-white/10">
                        {client?.name?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div>
                        <h2 className="text-2xl font-black uppercase tracking-tighter leading-tight">
                            {client?.name || `Client #${clientId}`}
                        </h2>
                        <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mt-1">
                            {clientCommandes.length} commandes
                        </p>
                    </div>
                </div>
            </div>

            {/* COMMANDES LIST */}
            <div className="space-y-4">
                <h3 className="font-black text-laundry-deep uppercase tracking-widest text-sm px-2 flex items-center gap-2">
                    <ClipboardList size={18} className="text-laundry-primary" />
                    Historique des Commandes
                </h3>

                {clientCommandes.length === 0 ? (
                    <div className="text-center py-20 border-2 border-dashed border-laundry-sky rounded-[2rem]">
                        <ClipboardList size={40} className="mx-auto text-laundry-deep/10 mb-3" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-laundry-deep/20">Aucune commande</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {clientCommandes.map(c => {
                            const cfg = STATUS_CONFIG[c.status] || {};
                            return (
                                <div
                                    key={c.id}
                                    onClick={() => navigate(`/admin/commandes/${c.id}`)}
                                    className="bg-white border-2 border-laundry-sky/50 hover:border-laundry-primary rounded-3xl p-5 cursor-pointer hover:shadow-xl hover:-translate-y-0.5 transition-all group flex items-center gap-5"
                                >
                                    {/* Status dot */}
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${cfg.bg} flex-shrink-0`}>
                                        {cfg.Icon && <cfg.Icon size={20} className={cfg.text} strokeWidth={2.5} />}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[9px] font-black text-laundry-primary uppercase tracking-[0.2em]">
                                            #{c.numeroCommande}
                                        </p>
                                        <span className={`inline-flex items-center gap-1.5 mt-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${cfg.bg} ${cfg.text}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}></span>
                                            {cfg.label}
                                        </span>
                                    </div>

                                    {/* Amount */}
                                    {c.montantTotal != null && (
                                        <div className="text-right flex-shrink-0">
                                            <p className="font-black text-laundry-deep">{c.montantTotal}</p>
                                            <p className="text-[9px] font-black text-laundry-deep/30">DH</p>
                                        </div>
                                    )}

                                    <ChevronRight size={16} className="text-laundry-deep/20 group-hover:text-laundry-primary transition-colors flex-shrink-0" />
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
