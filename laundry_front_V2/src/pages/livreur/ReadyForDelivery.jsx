import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Package,
  ChevronRight,
  Phone,
  Navigation,
  Sparkles,
  Clock,
  Smartphone,
  Search,
  CheckCircle2,
  ExternalLink,
  MoreHorizontal
} from 'lucide-react';
import { fetchReadyForDelivery } from '../../store/livreur/livreurThunk';
import { selectLoading, selectReadyForDelivery } from '../../store/livreur/livreurSelectors';

export default function ReadyForDelivery() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const orders = useSelector(selectReadyForDelivery);
  const loading = useSelector(selectLoading);
  console.log(orders);

  const [activeTab, setActiveTab] = useState('all'); // all, near
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    dispatch(fetchReadyForDelivery());
  }, [dispatch]);

  const filteredOrders = orders.filter(order =>
    order.client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.numeroCommande.toString().includes(searchQuery)
  );

  return (
    <div className="space-y-8 animate-fade-in pb-32">

      {/* 1. SEARCH & FILTER SECTION */}
      <section className="space-y-6">
        <div className="relative group">
          <div className="absolute left-6 top-1/2 -translate-y-1/2 text-laundry-primary">
            <Search size={20} strokeWidth={3} />
          </div>
          <input
            type="text"
            placeholder="Rechercher un client ou Numéro..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border-2 border-laundry-sky rounded-[2rem] p-5 pl-14 font-bold text-laundry-deep outline-none focus:border-laundry-primary transition-all shadow-sm placeholder:text-laundry-deep/20"
          />
        </div>

        {/* SEGMENTED CONTROL */}
        <div className="bg-laundry-sky/50 p-1.5 rounded-2xl flex items-center justify-between">
          {[
            { id: 'all', label: 'Toutes les commandes', count: orders.length },
            { id: 'near', label: 'À Proximité', count: 0 },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id
                ? 'bg-white text-laundry-primary shadow-sm'
                : 'text-laundry-deep/40 hover:text-laundry-deep/60'
                }`}
            >
              {tab.label} <span className="ml-1 opacity-50">({tab.count})</span>
            </button>
          ))}
        </div>
      </section>

      {/* 2. ORDER CARDS GRID */}
      <section className="space-y-6">
        {loading?.readyForDelivery ? (
          <div className="space-y-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse bg-white/50 h-56 rounded-[2.5rem] border border-laundry-sky/50 shadow-sm"></div>
            ))}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-24 gap-6 animate-fade-in border-2 border-dashed border-laundry-sky rounded-[3rem]">
            <Package size={48} className="text-laundry-primary/10" />
            <div className="space-y-1">
              <h3 className="font-black text-laundry-deep uppercase tracking-tighter">Aucune livraison trouvée</h3>
              <p className="font-bold uppercase tracking-widest text-[9px] text-laundry-deep/30">Vérifiez vos filtres ou attendez de nouvelles commandes</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-slide-up">
            {filteredOrders.map((order, index) => (
              <div
                key={order.id}
                className="group bg-white rounded-[2.5rem] p-8 border border-white shadow-xl shadow-laundry-primary/5 hover:shadow-2xl hover:shadow-laundry-primary/10 hover:-translate-y-1 transition-all relative overflow-hidden"
              >
                {/* STATUS BADGE */}
                <div className="absolute top-0 right-0 p-8">
                  <div className="bg-laundry-fresh/10 text-laundry-primary p-2 rounded-xl backdrop-blur-md border border-laundry-fresh/20">
                    <CheckCircle2 size={16} strokeWidth={3} />
                  </div>
                </div>

                <div className="space-y-6">
                  {/* CLIENT INFO */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-black text-laundry-primary uppercase tracking-[0.2em] flex items-center gap-1">
                      <Sparkles size={12} /> Commande Prête
                    </span>
                    <h3 className="text-2xl font-black text-laundry-deep uppercase tracking-tighter leading-none group-hover:text-laundry-primary transition-colors">
                      {order.client.name}
                    </h3>
                    <p className="text-[10px] font-black text-laundry-deep/30 uppercase tracking-widest">
                      Ref: <span className="text-laundry-deep/60">#{order.numeroCommande}</span>
                    </p>
                  </div>

                  {/* ADDRESS BOX */}
                  <div className="bg-laundry-sky/30 rounded-2xl p-4 flex items-start gap-4 border border-laundry-sky/20">
                    <MapPin size={18} className="text-laundry-primary shrink-0 mt-0.5" />
                    <span className="text-[11px] font-bold text-laundry-deep/70 leading-relaxed uppercase tracking-tight line-clamp-2">
                      {order.client.address}
                    </span>
                  </div>

                  {/* QUICK ACTIONS BAR */}
                  <div className="flex items-center gap-3">
                    <a
                      href={`tel:${order.client.phone}`}
                      className="flex-1 bg-laundry-sky/50 text-laundry-primary py-4 rounded-2xl flex items-center justify-center gap-2 font-black uppercase tracking-widest text-[10px] hover:bg-laundry-primary hover:text-white transition-all active:scale-95"
                    >
                      <Phone size={14} strokeWidth={3} /> Appeler
                    </a>
                    <button
                      onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${order.client.latitude},${order.client.longitude}`, '_blank')}
                      className="flex-1 bg-laundry-sky/50 text-laundry-primary py-4 rounded-2xl flex items-center justify-center gap-2 font-black uppercase tracking-widest text-[10px] hover:bg-laundry-primary hover:text-white transition-all active:scale-95"
                    >
                      <Navigation size={14} strokeWidth={3} /> Itinéraire
                    </button>
                    <button
                      onClick={() => navigate(`/livreur/delivery/${order.id}`)}
                      className="w-14 h-14 bg-laundry-deep text-white rounded-2xl flex items-center justify-center group-hover:bg-laundry-primary transition-all active:scale-95"
                    >
                      <ChevronRight size={20} strokeWidth={3} />
                    </button>
                  </div>

                  {/* BOTTOM PRICE ROW */}
                  <div className="pt-2 flex items-center justify-between border-t border-laundry-sky/20">
                    <span className="text-[10px] font-black text-laundry-deep/30 uppercase tracking-widest">Total à encaisser</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-black text-laundry-primary tracking-tighter">{order.montantTotal}</span>
                      <span className="text-xs font-black text-laundry-primary">DH</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
