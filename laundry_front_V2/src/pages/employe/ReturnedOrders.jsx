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
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-laundry-error-light text-laundry-error border border-laundry-error/20">
        <span className="w-1.5 h-1.5 rounded-full bg-laundry-error animate-pulse"></span>
        <span className="text-[10px] font-semibold uppercase tracking-wider leading-none">Retournée</span>
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
            <div className="flex-1 flex flex-col items-center justify-center p-8 bg-laundry-background rounded-xl min-h-[60vh]">
                <Loader2 size={32} className="text-laundry-primary animate-spin mb-4" />
                <p className="text-xs font-semibold text-laundry-text-secondary uppercase tracking-wider">Chargement des retours...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            {/* Header Area */}
            <div className="flex flex-col gap-4 mb-2">
                <button
                    onClick={() => navigate('/employe/dashboard')}
                    className="flex items-center gap-2 text-laundry-text-secondary font-medium text-sm hover:text-laundry-primary transition-all group self-start"
                >
                    <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                    <span>Retour à l'atelier</span>
                </button>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-laundry-text-primary">
                            Commandes <span className="text-laundry-error">Retournées</span>
                        </h1>
                        <div className="flex items-center gap-2 mt-2">
                            <div className="px-2.5 py-0.5 bg-laundry-error-light text-laundry-error rounded flex items-center gap-1.5 border border-laundry-error/20">
                                <AlertCircle size={12} />
                                <span className="text-[10px] font-bold uppercase tracking-wider">{returnedOrders.length} Articles en attente</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            {returnedOrders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-laundry-border shadow-sm text-center">
                    <PackageCheck size={40} className="text-laundry-text-muted opacity-50 mb-4" />
                    <h3 className="text-base font-bold text-laundry-text-primary mb-1">Aucun retour</h3>
                    <p className="text-sm font-medium text-laundry-text-secondary mb-6 max-w-xs mx-auto">Toutes les commandes retournées ont été traitées.</p>
                    <button 
                        onClick={() => navigate('/employe/dashboard')}
                        className="px-6 py-2.5 bg-white border border-laundry-border text-laundry-text-primary rounded-md text-sm font-semibold hover:bg-laundry-background hover:text-laundry-primary transition-colors shadow-sm"
                    >
                        Explorer l'atelier
                    </button>
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-laundry-border overflow-hidden shadow-card">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-laundry-background border-b border-laundry-border">
                                    <th className="px-6 py-4 text-xs font-semibold text-laundry-text-secondary uppercase tracking-wider">Commande</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-laundry-text-secondary uppercase tracking-wider">Détails</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-laundry-text-secondary uppercase tracking-wider">Statut</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-laundry-text-secondary uppercase tracking-wider">Mise à jour</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-laundry-text-secondary uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-laundry-border">
                                {returnedOrders.map((order) => (
                                    <tr key={order.id} className="hover:bg-laundry-background/50 transition-colors group">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-laundry-error-light text-laundry-error flex items-center justify-center flex-shrink-0">
                                                    <Trello size={18} />
                                                </div>
                                                <p className="text-sm font-bold text-laundry-text-primary uppercase">#{order.numeroCommande}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="space-y-0.5">
                                                <p className="text-sm font-semibold text-laundry-text-primary">{order.commandeTapis?.length || 0} Tapis</p>
                                                {order.montantTotal != null && (
                                                    <p className="text-xs font-medium text-laundry-text-secondary">{order.montantTotal} DH</p>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <StatusBadge />
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2 text-laundry-text-secondary">
                                                <CalendarDays size={14} className="text-laundry-text-muted" />
                                                <span className="text-xs font-semibold">
                                                    {new Date(order.updatedAt || order.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <button
                                                onClick={() => navigate(`/employe/commandes/${order.id}`)}
                                                className="inline-flex items-center gap-2 px-4 py-2 bg-laundry-error text-white rounded-md text-xs font-semibold shadow-sm hover:bg-laundry-error/90 transition-colors"
                                            >
                                                Traiter
                                                <ChevronRight size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Info Panel */}
            <div className="bg-laundry-background rounded-xl p-6 border border-laundry-border flex flex-col md:flex-row items-start md:items-center gap-4 mt-6">
                <div className="p-3 bg-white rounded-lg border border-laundry-border text-laundry-text-muted flex-shrink-0">
                    <RefreshCw size={24} />
                </div>
                <div>
                    <h3 className="text-sm font-bold text-laundry-text-primary mb-1">Gestion des Retours</h3>
                    <p className="text-xs font-medium text-laundry-text-secondary leading-relaxed max-w-3xl">
                        Les commandes affichées ici sont celles rapportées par les livreurs suite à une annulation client en cours de livraison. 
                        Vérifiez l'état des tapis puis cliquez sur "Remettre en Livraison" dans les détails pour le réassigner.
                    </p>
                </div>
            </div>
        </div>
    );
}
