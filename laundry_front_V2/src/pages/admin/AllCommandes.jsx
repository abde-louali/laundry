import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
    ClipboardList, Search, Loader2, ChevronRight,
    Clock, CheckCircle2, Wrench, PackageCheck, Truck, CreditCard, XCircle, DollarSign
} from 'lucide-react';
import { fetchAllCommandes } from '../../store/admin/adminThunk';

const STATUS_LIST = ['en_attente', 'validee', 'en_traitement', 'prete', 'livree', 'payee', 'annulee'];

const STATUS_CONFIG = {
    en_attente: { label: 'En Attente', bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200', dot: 'bg-amber-400', Icon: Clock },
    validee: { label: 'Validée', bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-200', dot: 'bg-blue-500', Icon: CheckCircle2 },
    en_traitement: { label: 'En Traitement', bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-200', dot: 'bg-purple-500', Icon: Wrench },
    prete: { label: 'Prête', bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-200', dot: 'bg-green-500', Icon: PackageCheck },
    livree: { label: 'Livrée', bg: 'bg-teal-50', text: 'text-teal-600', border: 'border-teal-200', dot: 'bg-teal-500', Icon: Truck },
    payee: { label: 'Payée', bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200', dot: 'bg-emerald-500', Icon: CreditCard },
    annulee: { label: 'Annulée', bg: 'bg-red-50', text: 'text-red-500', border: 'border-red-200', dot: 'bg-red-400', Icon: XCircle },
};

const StatusBadge = ({ status }) => {
    const cfg = STATUS_CONFIG[status] || { label: status, bg: 'bg-slate-50', text: 'text-slate-500', dot: 'bg-slate-400' };
    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${cfg.bg} ${cfg.text}`}>
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
        <div className="space-y-8 animate-fade-in">

            {/* HEADER */}
            <div>
                <h1 className="text-3xl font-black text-laundry-deep uppercase tracking-tighter">
                    Toutes les <span className="text-laundry-primary">Commandes</span>
                </h1>
                <p className="text-[10px] font-black text-laundry-deep/30 uppercase tracking-[0.2em] mt-1">
                    {commandes.length} commandes au total
                </p>
            </div>

            {/* SEARCH */}
            <div className="relative">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-laundry-primary" size={18} />
                <input
                    type="text"
                    placeholder="Rechercher par numéro..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full bg-white border-2 border-laundry-sky/50 focus:border-laundry-primary p-4 pl-14 rounded-2xl font-bold outline-none transition-all"
                />
            </div>

            {/* STATUS FILTER TABS */}
            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                <button
                    onClick={() => setActiveFilter('all')}
                    className={`flex-shrink-0 px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${activeFilter === 'all' ? 'bg-laundry-deep text-white' : 'bg-white border-2 border-laundry-sky text-laundry-deep/50 hover:border-laundry-primary'}`}
                >
                    Toutes ({commandes.length})
                </button>
                {STATUS_LIST.map(s => {
                    const cfg = STATUS_CONFIG[s];
                    const count = commandes.filter(c => c.status === s).length;
                    if (count === 0) return null;
                    return (
                        <button
                            key={s}
                            onClick={() => setActiveFilter(s)}
                            className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${activeFilter === s ? `${cfg.bg} ${cfg.text} border-2 ${cfg.border}` : 'bg-white border-2 border-laundry-sky text-laundry-deep/50 hover:border-laundry-primary'}`}
                        >
                            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}></span>
                            {cfg.label} ({count})
                        </button>
                    );
                })}
            </div>

            {/* COMMANDES GRID */}
            {loading && filtered.length === 0 ? (
                <div className="flex justify-center py-20">
                    <Loader2 size={40} className="animate-spin text-laundry-primary" />
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-20 border-2 border-dashed border-laundry-sky rounded-[2rem]">
                    <ClipboardList size={40} className="mx-auto text-laundry-deep/10 mb-3" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-laundry-deep/20">Aucune commande trouvée</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filtered.map(c => {
                        const cfg = STATUS_CONFIG[c.status] || {};
                        return (
                            <div
                                key={c.id}
                                onClick={() => navigate(`/admin/commandes/${c.id}`)}
                                className="bg-white border-2 border-laundry-sky/50 hover:border-laundry-primary rounded-3xl p-6 cursor-pointer hover:shadow-xl hover:-translate-y-0.5 transition-all group"
                            >
                                <div className="flex items-start justify-between gap-2 mb-4">
                                    <div>
                                        <p className="text-[9px] font-black text-laundry-primary uppercase tracking-[0.2em] mb-1">
                                            #{c.numeroCommande}
                                        </p>
                                        <StatusBadge status={c.status} />
                                    </div>
                                    <ChevronRight size={16} className="text-laundry-deep/20 group-hover:text-laundry-primary transition-colors mt-1" />
                                </div>

                                {c.montantTotal != null && (
                                    <div className="flex items-center gap-2 mt-4 pt-4 border-t border-laundry-sky/50">
                                        <DollarSign size={16} className="text-laundry-primary" />
                                        <span className="font-black text-laundry-deep">{c.montantTotal} DH</span>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
