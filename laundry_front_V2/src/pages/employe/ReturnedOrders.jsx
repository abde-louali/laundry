import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
    RefreshCw, 
    ChevronLeft, 
    ChevronRight, 
    Loader2, 
    Trello, 
    CalendarDays,
    AlertCircle,
    PackageCheck
} from 'lucide-react';
import { fetchReturnedOrders } from '../../store/employe/employeThunk';
import { selectCommandes, selectLoading } from '../../store/employe/employeSelectors';
import { COMMANDE_STATUS } from '../../store/employe/employeSlice';

const StatusBadge = () => (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-red-50 text-red-600 border border-current/10">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
        <span className="text-[9px] font-black uppercase tracking-widest leading-none">Retournée</span>
    </div>
);

export default function ReturnedOrders() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const allCommandes = useSelector(selectCommandes);
    const loading = useSelector(selectLoading);

    useEffect(() => {
        dispatch(fetchReturnedOrders());
    }, [dispatch]);

    const returnedOrders = useMemo(() => {
        return allCommandes
            .filter(c => c.status === COMMANDE_STATUS.RETOURNEE)
            .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));
    }, [allCommandes]);

    if (loading.commandes && returnedOrders.length === 0) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-8 min-h-[60vh]">
                <Loader2 size={40} className="text-laundry-primary animate-spin mb-4" />
                <p className="text-[10px] font-black text-laundry-deep/30 uppercase tracking-widest">Chargement des retours...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-8 p-2 animate-fade-in max-w-[1200px] mx-auto pb-20">
            {/* Header Area */}
            <div className="flex flex-col gap-6">
                <button
                    onClick={() => navigate('/employe/dashboard')}
                    className="flex items-center gap-2 text-laundry-deep/50 font-black uppercase tracking-widest text-[9px] hover:text-laundry-primary transition-all group self-start"
                >
                    <ChevronLeft size={14} strokeWidth={3} className="group-hover:-translate-x-1 transition-transform" />
                    <span>Retour à l'atelier</span>
                </button>

                <div className="flex items-end justify-between border-b-2 border-laundry-sky/20 pb-6">
                    <div>
                        <h1 className="text-4xl font-black text-laundry-deep uppercase tracking-tighter leading-none mb-3">
                            Commandes <span className="text-red-500">Retournées</span>
                        </h1>
                        <div className="flex items-center gap-3">
                            <div className="px-3 py-1 bg-red-50 text-red-600 rounded-full border border-red-100 flex items-center gap-2">
                                <AlertCircle size={12} />
                                <span className="text-[9px] font-black uppercase tracking-widest">{returnedOrders.length} Articles en attente de traitement</span>
                            </div>
                        </div>
                    </div>
                    <div className="p-4 bg-white border-2 border-laundry-sky rounded-3xl text-laundry-primary shadow-sm">
                        <RefreshCw size={24} strokeWidth={3} />
                    </div>
                </div>
            </div>

            {/* Content Section */}
            {returnedOrders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[2.5rem] border-2 border-dashed border-laundry-sky/50 shadow-sm transition-all hover:border-laundry-primary/30">
                    <div className="p-6 bg-laundry-sky/10 rounded-full mb-6 text-laundry-primary">
                        <PackageCheck size={40} />
                    </div>
                    <h3 className="text-xl font-black text-laundry-deep uppercase tracking-tight mb-2">Aucun retour</h3>
                    <p className="text-xs font-bold text-laundry-deep/30 mb-8 max-w-xs text-center">Toutes les commandes retournées ont été remises en livraison ou traitées.</p>
                    <button 
                        onClick={() => navigate('/employe/dashboard')}
                        className="px-8 py-4 bg-laundry-deep text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-laundry-deep/20 hover:bg-laundry-primary transition-all active:scale-95"
                    >
                        Explorer l'atelier
                    </button>
                </div>
            ) : (
                <div className="bg-white rounded-[2.5rem] border-2 border-laundry-sky/50 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-laundry-sky/5">
                                    <th className="px-8 py-5 text-left text-[10px] font-black text-laundry-deep/40 uppercase tracking-[0.2em]">Commande</th>
                                    <th className="px-8 py-5 text-left text-[10px] font-black text-laundry-deep/40 uppercase tracking-[0.2em]">Détails</th>
                                    <th className="px-8 py-5 text-left text-[10px] font-black text-laundry-deep/40 uppercase tracking-[0.2em]">Statut</th>
                                    <th className="px-8 py-5 text-left text-[10px] font-black text-laundry-deep/40 uppercase tracking-[0.2em]">Dernière MAJ</th>
                                    <th className="px-8 py-5 text-right text-[10px] font-black text-laundry-deep/40 uppercase tracking-[0.2em]">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-laundry-sky/10">
                                {returnedOrders.map((order) => (
                                    <tr key={order.id} className="hover:bg-laundry-sky/5 transition-colors group">
                                        <td className="px-8 py-7">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-laundry-sky/20 flex items-center justify-center text-laundry-primary group-hover:scale-110 transition-transform duration-300">
                                                    <Trello size={20} />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-black text-laundry-deep uppercase tracking-tight">#{order.numeroCommande}</p>
                                                    <p className="text-[9px] font-bold text-laundry-deep/30">ID: {order.id}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-7">
                                            <div className="space-y-1">
                                                <p className="text-[11px] font-black text-laundry-deep uppercase">{order.commandeTapis?.length || 0} Tapis</p>
                                                <p className="text-[10px] font-bold text-laundry-primary uppercase tracking-tighter">{order.montantTotal} DH</p>
                                            </div>
                                        </td>
                                        <td className="px-8 py-7">
                                            <StatusBadge />
                                        </td>
                                        <td className="px-8 py-7">
                                            <div className="flex items-center gap-2 text-laundry-deep/50">
                                                <CalendarDays size={14} />
                                                <span className="text-[11px] font-bold">
                                                    {new Date(order.updatedAt || order.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-7 text-right">
                                            <button
                                                onClick={() => navigate(`/employe/commandes/${order.id}`)}
                                                className="inline-flex items-center gap-2 px-6 py-3.5 bg-laundry-deep text-white rounded-2xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-laundry-deep/10 hover:bg-laundry-primary transition-all active:scale-95 group/btn"
                                            >
                                                Traiter le retour
                                                <ChevronRight size={12} strokeWidth={3} className="group-hover/btn:translate-x-1 transition-transform" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Info Card */}
            <div className="bg-laundry-deep rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-laundry-primary/10 rounded-full -mr-32 -mt-32 blur-3xl animate-pulse"></div>
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                    <div className="p-5 bg-white/10 rounded-3xl backdrop-blur-xl border border-white/20">
                        <RefreshCw size={40} className="text-laundry-fresh" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black uppercase tracking-tighter mb-2">Gestion des Retours</h3>
                        <p className="text-xs font-medium text-white/60 leading-relaxed max-w-2xl">
                            Les commandes ici sont celles rapportées par les livreurs après une annulation client. 
                            Vérifiez l'état des tapis puis cliquez sur <strong>"Remettre en Livraison"</strong> dans les détails 
                            pour que le livreur puisse à nouveau présenter la commande au client.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
