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
        <div className="space-y-8 animate-fade-in">

            {/* HEADER */}
            <div>
                <h1 className="text-3xl font-black text-laundry-deep uppercase tracking-tighter">
                    Tous les <span className="text-laundry-primary">Clients</span>
                </h1>
                <p className="text-[10px] font-black text-laundry-deep/30 uppercase tracking-[0.2em] mt-1">
                    {clients.length} clients enregistrés
                </p>
            </div>

            {/* SEARCH */}
            <div className="relative">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-laundry-primary" size={18} />
                <input
                    type="text"
                    placeholder="Rechercher par nom ou téléphone..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full bg-white border-2 border-laundry-sky/50 focus:border-laundry-primary p-4 pl-14 rounded-2xl font-bold outline-none transition-all"
                />
            </div>

            {/* CLIENT LIST */}
            {loading && filtered.length === 0 ? (
                <div className="flex justify-center py-20">
                    <Loader2 size={40} className="animate-spin text-laundry-primary" />
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-20 border-2 border-dashed border-laundry-sky rounded-[2rem]">
                    <Users size={40} className="mx-auto text-laundry-deep/10 mb-3" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-laundry-deep/20">Aucun client trouvé</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filtered.map(client => (
                        <div
                            key={client.id}
                            onClick={() => navigate(`/admin/clients/${client.id}`)}
                            className="bg-white border-2 border-laundry-sky/50 hover:border-laundry-primary rounded-3xl p-6 cursor-pointer hover:shadow-xl hover:-translate-y-0.5 transition-all group"
                        >
                            <div className="flex items-start justify-between gap-3">
                                {/* Avatar */}
                                <div className="w-14 h-14 bg-laundry-sky rounded-[1.2rem] flex items-center justify-center font-black text-laundry-primary text-xl flex-shrink-0">
                                    {client.name?.[0]?.toUpperCase() || '?'}
                                </div>
                                <ChevronRight size={16} className="text-laundry-deep/20 group-hover:text-laundry-primary transition-colors mt-1 flex-shrink-0" />
                            </div>

                            <div className="mt-4 space-y-2">
                                <h3 className="font-black text-laundry-deep uppercase tracking-tight truncate">{client.name}</h3>

                                <div className="flex items-center gap-2 text-laundry-deep/40">
                                    <Phone size={12} />
                                    <span className="text-[11px] font-bold">{client.phone || '—'}</span>
                                </div>

                                {client.address && (
                                    <div className="flex items-start gap-2 text-laundry-deep/40">
                                        <MapPin size={12} className="flex-shrink-0 mt-0.5" />
                                        <span className="text-[11px] font-bold truncate">{client.address}</span>
                                    </div>
                                )}

                                <div className="flex items-center gap-2 text-laundry-deep/30 pt-2 border-t border-laundry-sky/50">
                                    <CalendarDays size={11} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Depuis {formatDate(client.createdAt)}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
