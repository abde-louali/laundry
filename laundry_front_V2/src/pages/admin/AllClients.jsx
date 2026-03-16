import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
    Users, Search, Loader2, ChevronRight,
    Phone, MapPin, CalendarDays, ClipboardList
} from 'lucide-react';
import { fetchAllClients } from '../../store/admin/adminThunk';

export default function AllClients() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { clients, loading } = useSelector(s => s.admin);
    const [search, setSearch] = useState('');

    useEffect(() => { dispatch(fetchAllClients()); }, [dispatch]);

    const filtered = clients.filter(c =>
        c.name?.toLowerCase().includes(search.toLowerCase()) ||
        c.phone?.includes(search)
    );

    const formatDate = (d) => d ? new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

    return (
        <div className="space-y-6 animate-fade-in p-4 sm:p-6 lg:p-8">

            {/* HEADER */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-2">
                <div>
                    <h1 className="text-2xl font-bold text-laundry-primary">
                        Tous les Clients
                    </h1>
                    <p className="text-sm text-laundry-text-muted mt-1">
                        Crm & Gestion des clients ({clients.length} enregistrés)
                    </p>
                </div>
            </div>

            {/* ACTIONS BAR (Search) */}
            <div className="bg-white p-4 rounded-xl shadow-card border border-laundry-border">
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-laundry-text-muted" size={16} />
                    <input
                        type="text"
                        placeholder="Rechercher par nom ou téléphone..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full bg-laundry-background border border-laundry-border focus:border-laundry-primary focus:ring-1 focus:ring-laundry-primary rounded-md py-2 pl-9 pr-4 text-sm outline-none transition-all shadow-sm"
                    />
                </div>
            </div>

            {/* CLIENT TABLE */}
            {loading && filtered.length === 0 ? (
                <div className="flex justify-center py-20 bg-white rounded-xl border border-laundry-border shadow-sm">
                    <Loader2 size={32} className="animate-spin text-laundry-primary" />
                </div>
            ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-laundry-border shadow-sm text-center">
                    <Users size={40} className="text-laundry-text-muted opacity-50 mb-4" />
                    <p className="text-sm font-semibold text-laundry-text-secondary">Aucun client trouvé</p>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-card border border-laundry-border overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-laundry-background border-b border-laundry-border">
                                    <th className="px-6 py-4 text-xs font-semibold text-laundry-text-secondary uppercase tracking-wider">Client</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-laundry-text-secondary uppercase tracking-wider">Contact</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-laundry-text-secondary uppercase tracking-wider">Adresse</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-laundry-text-secondary uppercase tracking-wider">Inscrit le</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-laundry-text-secondary uppercase tracking-wider text-right">Détails</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-laundry-border">
                                {filtered.map(client => (
                                    <tr 
                                        key={client.id}
                                        onClick={() => navigate(`/admin/clients/${client.id}`)}
                                        className="hover:bg-laundry-background/50 cursor-pointer transition-colors group"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-laundry-primary/10 text-laundry-primary flex items-center justify-center font-bold text-xs flex-shrink-0">
                                                    {client.name?.[0]?.toUpperCase() || '?'}
                                                </div>
                                                <span className="text-sm font-semibold text-laundry-text-primary group-hover:text-laundry-primary transition-colors truncate max-w-[150px]">
                                                    {client.name}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-laundry-text-secondary">
                                                <Phone size={14} className="text-laundry-text-muted" />
                                                <span className="text-sm">{client.phone || '—'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {client.address ? (
                                                <div className="flex items-center gap-2 text-laundry-text-secondary">
                                                    <MapPin size={14} className="text-laundry-text-muted flex-shrink-0" />
                                                    <span className="text-sm truncate max-w-[200px]">{client.address}</span>
                                                </div>
                                            ) : (
                                                <span className="text-sm text-laundry-text-muted">—</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-laundry-text-secondary">
                                                <CalendarDays size={14} className="text-laundry-text-muted flex-shrink-0" />
                                                <span className="text-sm">{formatDate(client.createdAt)}</span>
                                            </div>
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
