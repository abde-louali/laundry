import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
    ClipboardList, Search, Loader2, ChevronRight,
    Clock, CheckCircle2, Wrench, PackageCheck, Truck, CreditCard, XCircle, DollarSign
} from 'lucide-react';
import { fetchAllCommandes } from '../../store/admin/adminThunk';

const STATUS_LIST = ['all', 'en_attente', 'validee', 'en_traitement', 'prete', 'livree', 'payee', 'annulee'];

const STATUS_CONFIG = {
    all: { label: 'Toutes', bg: 'bg-laundry-background', text: 'text-laundry-text-primary', border: 'border-laundry-border', dot: 'bg-laundry-text-muted', Icon: ClipboardList },
    en_attente: { label: 'En Attente', bg: 'bg-laundry-warning-light', text: 'text-laundry-warning', border: 'border-laundry-warning/20', dot: 'bg-laundry-warning', Icon: Clock },
    validee: { label: 'Validée', bg: 'bg-blue-50', text: 'text-laundry-primary-light', border: 'border-laundry-primary-light/20', dot: 'bg-laundry-primary-light', Icon: CheckCircle2 },
    en_traitement: { label: 'En Traitement', bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200', dot: 'bg-purple-500', Icon: Wrench },
    prete: { label: 'Prête', bg: 'bg-laundry-success-light', text: 'text-laundry-success', border: 'border-laundry-success/20', dot: 'bg-laundry-success', Icon: PackageCheck },
    livree: { label: 'Livrée', bg: 'bg-cyan-50', text: 'text-laundry-accent', border: 'border-laundry-accent/20', dot: 'bg-laundry-accent', Icon: Truck },
    payee: { label: 'Payée', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-600', Icon: CreditCard },
    annulee: { label: 'Annulée', bg: 'bg-laundry-error-light', text: 'text-laundry-error', border: 'border-laundry-error/20', dot: 'bg-laundry-error', Icon: XCircle },
};

const StatusBadge = ({ status }) => {
    const cfg = STATUS_CONFIG[status] || { label: status, bg: 'bg-laundry-background', text: 'text-laundry-text-secondary', dot: 'bg-laundry-border' };
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded inline-block text-[10px] font-semibold uppercase tracking-wider border border-transparent ${cfg.bg} ${cfg.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}></span>
            {cfg.label}
        </span>
    );
};

export default function AllCommandes() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { commandes, loading } = useSelector(s => s.admin);

    const [activeFilter, setActiveFilter] = useState('all');
    const [search, setSearch] = useState('');

    useEffect(() => { dispatch(fetchAllCommandes()); }, [dispatch]);

    const filtered = commandes.filter(c => {
        const matchStatus = activeFilter === 'all' || c.status === activeFilter;
        const matchSearch = c.numeroCommande?.toLowerCase().includes(search.toLowerCase());
        return matchStatus && matchSearch;
    });

    return (
        <div className="space-y-6 animate-fade-in p-4 sm:p-6 lg:p-8">

            {/* HEADER */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-2">
                <div>
                    <h1 className="text-2xl font-bold text-laundry-primary">
                        Toutes les Commandes
                    </h1>
                    <p className="text-sm text-laundry-text-muted mt-1">
                        Gérez et suivez l'ensemble de vos commandes ({commandes.length} au total)
                    </p>
                </div>
            </div>

            {/* ACTIONS BAR (Search & Filters) */}
            <div className="bg-white p-4 rounded-xl shadow-card border border-laundry-border flex flex-col gap-4">
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-laundry-text-muted" size={16} />
                    <input
                        type="text"
                        placeholder="Rechercher par numéro de commande..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full bg-laundry-background border border-laundry-border focus:border-laundry-primary focus:ring-1 focus:ring-laundry-primary rounded-md py-2 pl-9 pr-4 text-sm outline-none transition-all shadow-sm"
                    />
                </div>

                <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                    {STATUS_LIST.map(s => {
                        const cfg = STATUS_CONFIG[s];
                        const count = s === 'all' ? commandes.length : commandes.filter(c => c.status === s).length;
                        if (count === 0 && s !== 'all') return null;
                        
                        const isActive = activeFilter === s;
                        
                        return (
                            <button
                                key={s}
                                onClick={() => setActiveFilter(s)}
                                className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wider transition-all border ${
                                    isActive 
                                    ? `bg-white border-laundry-primary text-laundry-primary shadow-sm` 
                                    : `bg-laundry-background border-transparent text-laundry-text-secondary hover:bg-white hover:border-laundry-border`
                                }`}
                            >
                                {s !== 'all' && <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}></span>}
                                {cfg.label} <span className="text-laundry-text-muted ml-0.5">({count})</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* COMMANDES TABLE/GRID */}
            {loading && filtered.length === 0 ? (
                <div className="flex justify-center py-20 bg-white rounded-xl border border-laundry-border shadow-sm">
                    <Loader2 size={32} className="animate-spin text-laundry-primary" />
                </div>
            ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-laundry-border shadow-sm text-center">
                    <ClipboardList size={40} className="text-laundry-text-muted opacity-50 mb-4" />
                    <p className="text-sm font-semibold text-laundry-text-secondary">Aucune commande trouvée</p>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-card border border-laundry-border overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-laundry-background border-b border-laundry-border">
                                    <th className="px-6 py-4 text-xs font-semibold text-laundry-text-secondary uppercase tracking-wider">N° Commande</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-laundry-text-secondary uppercase tracking-wider">Statut</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-laundry-text-secondary uppercase tracking-wider">Prix Total</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-laundry-text-secondary uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-laundry-border">
                                {filtered.map(c => (
                                    <tr 
                                        key={c.id} 
                                        onClick={() => navigate(`/admin/commandes/${c.id}`)}
                                        className="hover:bg-laundry-background/50 cursor-pointer transition-colors group"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-laundry-text-primary group-hover:text-laundry-primary transition-colors">#{c.numeroCommande}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <StatusBadge status={c.status} />
                                        </td>
                                        <td className="px-6 py-4">
                                            {c.montantTotal != null ? (
                                                <span className="text-sm font-semibold text-laundry-text-primary">{c.montantTotal} DH</span>
                                            ) : (
                                                <span className="text-sm font-medium text-laundry-text-muted">—</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="text-laundry-text-muted group-hover:text-laundry-primary transition-colors p-1">
                                                <ChevronRight size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
