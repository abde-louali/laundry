import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { MapPin, Phone, Trash2, PlusCircle, Package, Truck, ChevronRight, User, Clock, CheckCircle2, UserPlus, ClipboardList, TrendingUp, AlertCircle, History } from 'lucide-react';
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
    <div className="space-y-8 animate-fade-in pb-10">

      {/* 1. HORIZONTAL SUMMARY PIPELINE */}
      <section className="flex gap-4 overflow-x-auto pb-4 no-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
        {[
          { label: 'À Collecter', count: pendingClient ? 1 : 0, icon: UserPlus, color: 'text-laundry-primary', bg: 'bg-laundry-sky' },
          { label: 'En Cours', count: 0, icon: Package, color: 'text-amber-500', bg: 'bg-amber-50' },
          { label: 'À Livrer', count: 0, icon: Truck, color: 'text-laundry-fresh', bg: 'bg-laundry-fresh/10' },
          { label: 'Terminées', count: 0, icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-50' },
        ].map((stat, i) => (
          <div key={i} className="flex-shrink-0 min-w-[140px] bg-white rounded-3xl p-4 border border-laundry-sky/50 shadow-sm flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className={`p-2 rounded-xl ${stat.bg} ${stat.color}`}>
                <stat.icon size={18} strokeWidth={3} />
              </div>
              <span className="text-xl font-black text-laundry-deep">{stat.count}</span>
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-laundry-deep/40">{stat.label}</span>
          </div>
        ))}
      </section>

      {/* 2. PRIORITY "PROCHAINE MISSION" SECTION */}
      <section className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <h3 className="text-[10px] font-black text-laundry-deep/30 uppercase tracking-[0.2em] mb-4 ml-2">Mission Prioritaire</h3>

        {!pendingClient ? (
          <div className="bg-laundry-primary rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-laundry-primary/20">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-3 text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full text-[10px] font-black uppercase tracking-widest">
                  <AlertCircle size={14} /> Aucune Action
                </div>
                <h2 className="text-3xl font-black uppercase tracking-tighter leading-tight">
                  Prêt pour un <br /><span className="text-laundry-fresh uppercase">Nouveau Client ?</span>
                </h2>
                <p className="text-white/70 font-bold text-sm max-w-sm">
                  Votre file d'attente est vide. Enregistrez un nouveau client pour démarrer une collecte.
                </p>
              </div>
              <button
                onClick={() => navigate('/livreur/register-client')}
                className="bg-white text-laundry-primary px-8 py-5 rounded-[1.5rem] font-black uppercase tracking-[0.1em] text-sm shadow-xl hover:bg-laundry-sky transition-all active:scale-95 flex items-center gap-3"
              >
                <UserPlus size={20} strokeWidth={3} />
                Enregistrer Client
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-[2.5rem] p-1 border-2 border-laundry-primary shadow-2xl shadow-laundry-primary/10 transition-all hover:scale-[1.01]">
            <div className="bg-white rounded-[2.2rem] p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-laundry-sky rounded-full -mr-24 -mt-24"></div>

              <div className="relative z-10 flex flex-col md:flex-row gap-8">
                {/* CLIENT AVATAR/TYPE */}
                <div className="flex-shrink-0 flex flex-col items-center gap-3">
                  <div className="w-20 h-20 bg-laundry-primary text-white rounded-3xl flex items-center justify-center font-black text-3xl shadow-lg shadow-laundry-primary/30 border-4 border-laundry-sky">
                    {pendingClient.name[0].toUpperCase()}
                  </div>
                  <StatusBadge status="EN_ATTENTE" />
                </div>

                {/* INFO */}
                <div className="flex-1 space-y-6">
                  <div className="space-y-1">
                    <h4 className="text-2xl font-black text-laundry-deep uppercase tracking-tighter">{pendingClient.name}</h4>
                    <p className="text-laundry-primary font-bold text-xs uppercase tracking-widest flex items-center gap-2">
                      <MapPin size={14} /> {pendingClient.address}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-laundry-sky/30 rounded-2xl border border-laundry-sky flex flex-col gap-1">
                      <span className="text-[9px] font-black text-laundry-deep/40 uppercase tracking-widest">Contact</span>
                      <span className="text-xs font-black text-laundry-deep">{pendingClient.phone}</span>
                    </div>
                    <div className="p-4 bg-laundry-sky/30 rounded-2xl border border-laundry-sky flex flex-col gap-1">
                      <span className="text-[9px] font-black text-laundry-deep/40 uppercase tracking-widest">Temps écoulé</span>
                      <span className="text-xs font-black text-laundry-deep">~ 15 mins</span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => navigate('/livreur/create-order')}
                      className="flex-1 bg-laundry-primary text-white py-4 rounded-[1.2rem] font-black uppercase tracking-widest text-xs shadow-lg shadow-laundry-primary/20 hover:bg-laundry-deep transition-all flex items-center justify-center gap-2"
                    >
                      <PlusCircle size={18} strokeWidth={3} />
                      Démarrer Commande
                    </button>
                    <button
                      onClick={handleDeleteClient}
                      className="p-4 bg-red-50 text-red-500 rounded-[1.2rem] hover:bg-red-500 hover:text-white transition-all shadow-sm"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* 3. TABS: CURRENT TASKS vs HISTORY */}
      <section className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
        <div className="flex items-center gap-6 border-b border-laundry-sky/30 mb-6 px-2">
          <button
            onClick={() => setActiveTab('current')}
            className={`pb-4 px-2 text-xs font-black uppercase tracking-[0.2em] transition-all relative ${activeTab === 'current' ? 'text-laundry-primary' : 'text-laundry-deep/30'}`}
          >
            Missions en cours
            {activeTab === 'current' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-laundry-primary rounded-t-full"></div>}
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`pb-4 px-2 text-xs font-black uppercase tracking-[0.2em] transition-all relative ${activeTab === 'history' ? 'text-laundry-primary' : 'text-laundry-deep/30'}`}
          >
            Historique
            {activeTab === 'history' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-laundry-primary rounded-t-full"></div>}
          </button>
        </div>

        {activeTab === 'current' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link to="/livreur/ready-for-delivery" className="group glass p-6 rounded-[2rem] border-laundry-sky/50 flex items-center gap-6 hover:bg-laundry-primary transition-all">
              <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-laundry-primary shadow-sm group-hover:scale-110 transition-transform">
                <Truck size={32} strokeWidth={2.5} />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-laundry-primary group-hover:text-white/60 uppercase tracking-[0.2em] mb-1">Logistique</span>
                <h5 className="text-lg font-black text-laundry-deep group-hover:text-white uppercase tracking-tighter">Livraisons Prêtes</h5>
                <p className="text-[10px] font-bold text-laundry-deep/40 group-hover:text-white/40 uppercase">Consulter les commandes prêtes</p>
              </div>
              <ChevronRight className="ml-auto text-laundry-sky group-hover:text-white" />
            </Link>

            <div className="glass p-6 rounded-[2rem] border-dashed border-2 border-laundry-sky/50 flex items-center justify-center text-laundry-deep/20">
              <span className="text-xs font-black uppercase tracking-widest text-center">Plus de fonctionnalités <br /> bientôt disponibles</span>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-[2rem] p-10 flex flex-col items-center justify-center text-center gap-4 border border-laundry-sky/30">
            <div className="p-5 bg-laundry-sky rounded-3xl text-laundry-primary">
              <History size={40} strokeWidth={2.5} />
            </div>
            <div className="space-y-1">
              <h5 className="text-lg font-black text-laundry-deep uppercase tracking-tighter">Aucun historique</h5>
              <p className="text-xs font-bold text-laundry-deep/40 uppercase tracking-tight">Vos missions terminées apparaîtront ici</p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
