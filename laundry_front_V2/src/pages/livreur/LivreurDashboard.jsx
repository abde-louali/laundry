import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { MapPin, Phone, Trash2, PlusCircle, Package, Truck, ChevronRight, CheckCircle2, UserPlus, AlertCircle, History } from 'lucide-react';
import { deleteClient, fetchPendingClient } from '../../store/livreur/livreurThunk';
import { StatusBadge } from '../../components/StatusBadge';
import { selectLoading, selectPendingClient } from '../../store/livreur/livreurSelectors';

export default function Dashboard() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const pendingClient = useSelector(selectPendingClient);
    const loading = useSelector(selectLoading);
    const [activeTab, setActiveTab] = useState('current');

    useEffect(() => {
        dispatch(fetchPendingClient());
    }, [dispatch]);

    const handleDeleteClient = async () => {
        if (window.confirm("Voulez-vous vraiment annuler ce client en attente ?")) {
            try {
                await dispatch(deleteClient(pendingClient.id)).unwrap();
                toast.success("Client annulé");
            } catch (err) {
                toast.error("Erreur lors de la suppression");
            }
        }
    };

    return (
        <div className="space-y-6 animate-fade-in pb-10 max-w-5xl mx-auto p-4 sm:p-6">
            <div className="mb-2">
                <h1 className="text-2xl font-bold text-laundry-text-primary">Tableau de bord</h1>
                <p className="text-sm font-medium text-laundry-text-secondary">Aperçu de vos missions et activités</p>
            </div>

            {/* HORIZONTAL SUMMARY PIPELINE */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'À Collecter', count: pendingClient ? 1 : 0, icon: UserPlus, color: 'text-laundry-primary', bg: 'bg-laundry-primary/10' },
                    { label: 'En Cours', count: 0, icon: Package, color: 'text-laundry-warning', bg: 'bg-laundry-warning-light' },
                    { label: 'À Livrer', count: 0, icon: Truck, color: 'text-laundry-accent', bg: 'bg-cyan-50' },
                    { label: 'Terminées', count: 0, icon: CheckCircle2, color: 'text-laundry-success', bg: 'bg-laundry-success-light' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white rounded-xl p-4 border border-laundry-border shadow-sm flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                            <div className={`p-2 rounded-lg ${stat.bg} ${stat.color}`}>
                                <stat.icon size={20} />
                            </div>
                            <span className="text-2xl font-bold text-laundry-text-primary">{stat.count}</span>
                        </div>
                        <span className="text-xs font-semibold uppercase tracking-wider text-laundry-text-secondary">{stat.label}</span>
                    </div>
                ))}
            </div>

            {/* PRIORITY "PROCHAINE MISSION" SECTION */}
            <section>
                <h3 className="text-sm font-bold text-laundry-text-primary mb-3">Mission Prioritaire</h3>
                {!pendingClient ? (
                    <div className="bg-white border border-laundry-border rounded-xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-laundry-background rounded-full text-laundry-text-muted mt-1">
                                <AlertCircle size={24} />
                            </div>
                            <div className="space-y-1">
                                <h2 className="text-xl font-bold text-laundry-text-primary">Aucune collecte en attente</h2>
                                <p className="text-sm font-medium text-laundry-text-secondary max-w-md">
                                    Votre file d'attente est vide. Enregistrez un nouveau client pour démarrer une collecte sur le terrain.
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => navigate('/livreur/register-client')}
                            className="bg-laundry-primary text-white px-6 py-2.5 rounded-md font-semibold text-sm shadow-sm hover:bg-laundry-primary-hover transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
                        >
                            <UserPlus size={18} />
                            Nouveau Client
                        </button>
                    </div>
                ) : (
                    <div className="bg-white border-2 border-laundry-primary rounded-xl p-6 shadow-card flex flex-col md:flex-row gap-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-2 h-full bg-laundry-primary"></div>
                        
                        <div className="flex-shrink-0 flex flex-col items-center gap-3">
                            <div className="w-16 h-16 bg-laundry-primary/10 text-laundry-primary rounded-full flex items-center justify-center font-bold text-2xl border border-laundry-primary/20">
                                {pendingClient.name[0].toUpperCase()}
                            </div>
                            <StatusBadge status="EN_ATTENTE" />
                        </div>

                        <div className="flex-1 space-y-4">
                            <div className="space-y-1">
                                <h4 className="text-lg font-bold text-laundry-text-primary">{pendingClient.name}</h4>
                                <p className="text-sm font-medium text-laundry-text-secondary flex items-start gap-1">
                                    <MapPin size={16} className="mt-0.5" />
                                    <span>{pendingClient.address || 'Adresse à collecter'}</span>
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 bg-laundry-background rounded-lg border border-laundry-border">
                                    <p className="text-[10px] font-semibold text-laundry-text-secondary uppercase tracking-wider mb-1">Contact</p>
                                    <p className="text-sm font-bold text-laundry-text-primary">{pendingClient.phone}</p>
                                </div>
                                <div className="p-3 bg-laundry-background rounded-lg border border-laundry-border">
                                    <p className="text-[10px] font-semibold text-laundry-text-secondary uppercase tracking-wider mb-1">Statut</p>
                                    <p className="text-sm font-bold text-laundry-text-primary">Attente de récupération</p>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3 pt-2">
                                <button
                                    onClick={() => navigate('/livreur/create-order')}
                                    className="flex-1 bg-laundry-primary text-white py-2.5 rounded-md font-semibold text-sm shadow-sm hover:bg-laundry-primary-hover transition-colors flex items-center justify-center gap-2"
                                >
                                    <PlusCircle size={18} />
                                    Démarrer la commande
                                </button>
                                <button
                                    onClick={handleDeleteClient}
                                    className="px-6 py-2.5 bg-white border border-laundry-error text-laundry-error rounded-md text-sm font-semibold hover:bg-laundry-error-light transition-colors flex justify-center items-center"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </section>

            {/* TABS: CURRENT TASKS vs HISTORY */}
            <section>
                <div className="flex items-center gap-6 border-b border-laundry-border mb-4">
                    <button
                        onClick={() => setActiveTab('current')}
                        className={`pb-3 px-1 text-sm font-bold transition-colors border-b-2 ${activeTab === 'current' ? 'text-laundry-primary border-laundry-primary' : 'text-laundry-text-muted border-transparent hover:text-laundry-text-primary'}`}
                    >
                        Missions en cours
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`pb-3 px-1 text-sm font-bold transition-colors border-b-2 ${activeTab === 'history' ? 'text-laundry-primary border-laundry-primary' : 'text-laundry-text-muted border-transparent hover:text-laundry-text-primary'}`}
                    >
                        Historique
                    </button>
                </div>

                {activeTab === 'current' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Link to="/livreur/ready-for-delivery" className="bg-white p-5 rounded-xl border border-laundry-border flex items-center gap-4 hover:border-laundry-primary hover:shadow-card transition-all group">
                            <div className="w-12 h-12 bg-cyan-50 text-laundry-accent rounded-lg flex items-center justify-center border border-laundry-accent/20 group-hover:scale-105 transition-transform">
                                <Truck size={24} />
                            </div>
                            <div className="flex flex-col flex-1">
                                <h5 className="text-sm font-bold text-laundry-text-primary">Livraisons Prêtes</h5>
                                <p className="text-xs font-medium text-laundry-text-secondary mt-0.5">Consulter vos commandes à livrer</p>
                            </div>
                            <ChevronRight size={20} className="text-laundry-text-muted group-hover:text-laundry-primary" />
                        </Link>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl p-12 flex flex-col items-center justify-center text-center gap-4 border border-laundry-border border-dashed">
                        <div className="text-laundry-text-muted opacity-50">
                            <History size={48} />
                        </div>
                        <div className="space-y-1">
                            <h5 className="text-base font-bold text-laundry-text-primary">Aucun historique</h5>
                            <p className="text-sm font-medium text-laundry-text-secondary">Vos missions terminées apparaîtront ici</p>
                        </div>
                    </div>
                )}
            </section>
        </div>
    );
}
