import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  MapPin, Phone, Trash2, PlusCircle, Package, Truck,
  ChevronRight, UserPlus, CheckCircle2, AlertCircle,
  History, Calendar, ArrowRight
} from 'lucide-react';
import { deleteClient, fetchPendingClient } from '../../store/livreur/livreurThunk';
import { StatusBadge } from '../../components/StatusBadge';
import { selectLoading, selectPendingClient } from '../../store/livreur/livreurSelectors';
import { selectCurrentUser } from '../../store/auth/authSelector';

export default function Dashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const pendingClient = useSelector(selectPendingClient);
  const loading = useSelector(selectLoading);
  const user = useSelector(selectCurrentUser);
  const [activeTab, setActiveTab] = useState('current');

  useEffect(() => {
    dispatch(fetchPendingClient());
  }, [dispatch]);

  const handleDeleteClient = async () => {
    if (window.confirm('Voulez-vous vraiment annuler ce client en attente ?')) {
      try {
        await dispatch(deleteClient(pendingClient.id)).unwrap();
        toast.success('Client annulé');
      } catch (err) {
        toast.error('Erreur lors de la suppression');
      }
    }
  };

  const today = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });

  const stats = [
    { label: 'À Collecter',  count: pendingClient ? 1 : 0, icon: UserPlus,     accentBg: 'bg-orange-50',  accentText: 'text-orange-500' },
    { label: 'En Cours',     count: 0,                     icon: Package,       accentBg: 'bg-violet-50',  accentText: 'text-violet-500' },
    { label: 'À Livrer',     count: 0,                     icon: Truck,         accentBg: 'bg-teal-50',    accentText: 'text-teal-500' },
    { label: 'Terminées',    count: 0,                     icon: CheckCircle2,  accentBg: 'bg-green-50',   accentText: 'text-green-500' },
  ];

  return (
    <div className="space-y-6 pb-8">

      {/* 1. GREETING CARD */}
      <div className="bg-primary-600 rounded-2xl p-5 flex items-center justify-between text-white">
        <div>
          <p className="text-primary-200 text-sm capitalize">{today}</p>
          <h1 className="text-xl font-bold mt-0.5">Bonjour, {user?.name?.split(' ')[0] || 'Livreur'} 👋</h1>
        </div>
        <div className="w-11 h-11 rounded-full bg-white/20 flex items-center justify-center text-white font-semibold text-base">
          {user?.name?.[0]?.toUpperCase() || 'L'}
        </div>
      </div>

      {/* 2. STAT CARDS */}
      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-surface rounded-2xl shadow-card p-4 hover:shadow-card-hover hover:-translate-y-0.5 transition-all">
              <div className={`w-10 h-10 rounded-xl ${stat.accentBg} ${stat.accentText} flex items-center justify-center mb-3`}>
                <Icon size={20} />
              </div>
              <p className="text-2xl font-bold text-text-primary">{stat.count}</p>
              <p className="text-xs text-text-muted uppercase tracking-wide mt-0.5">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* 3. PRIORITY MISSION BANNER */}
      {!pendingClient ? (
        <div className="bg-gradient-to-r from-primary-600 to-indigo-500 rounded-2xl p-5 text-white">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle size={16} className="text-primary-200" />
                <span className="text-primary-200 text-xs font-medium uppercase tracking-wide">Aucune Mission</span>
              </div>
              <h2 className="text-lg font-bold">Prêt pour un nouveau client ?</h2>
              <p className="text-primary-200 text-sm mt-1">Votre file est vide. Enregistrez un client pour démarrer.</p>
            </div>
            <button
              onClick={() => navigate('/livreur/register-client')}
              className="bg-white text-primary-600 px-5 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 hover:bg-primary-50 transition-colors whitespace-nowrap flex-shrink-0"
            >
              <UserPlus size={16} />
              Enregistrer Client
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-surface rounded-2xl shadow-card p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-xs text-text-muted uppercase tracking-wide mb-1">Mission Prioritaire</p>
              <StatusBadge status="EN_ATTENTE" />
            </div>
            <button
              onClick={handleDeleteClient}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
            >
              <Trash2 size={16} />
            </button>
          </div>

          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-primary-100 text-primary-700 flex items-center justify-center text-lg font-bold flex-shrink-0">
              {pendingClient.name[0].toUpperCase()}
            </div>
            <div>
              <h3 className="font-semibold text-text-primary">{pendingClient.name}</h3>
              {pendingClient.phones?.[0] && (
                <p className="text-sm text-text-muted flex items-center gap-1 mt-0.5">
                  <Phone size={12} />
                  {pendingClient.phones[0].phoneNumber}
                </p>
              )}
            </div>
          </div>

          {pendingClient.addresses?.[0] && (
            <div className="flex items-center gap-2 mb-4 bg-background rounded-xl px-3 py-2">
              <MapPin size={14} className="text-text-muted flex-shrink-0" />
              <span className="text-sm text-text-secondary truncate">{pendingClient.addresses[0].address}</span>
            </div>
          )}

          <button
            onClick={() => navigate('/livreur/create-order')}
            className="w-full bg-primary-600 text-white py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-primary-700 transition-colors"
          >
            <PlusCircle size={16} />
            Démarrer Commande
          </button>
        </div>
      )}

      {/* 4. TABS */}
      <div>
        <div className="bg-gray-100 rounded-xl p-1 flex mb-4">
          {[
            { key: 'current', label: 'Missions en cours' },
            { key: 'history', label: 'Historique' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                activeTab === tab.key
                  ? 'bg-surface shadow-sm text-primary-600'
                  : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'current' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link
              to="/livreur/ready-for-delivery"
              className="bg-surface rounded-2xl shadow-card p-4 flex items-center gap-4 hover:shadow-card-hover hover:-translate-y-0.5 transition-all group"
            >
              <div className="w-11 h-11 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                <Truck size={22} />
              </div>
              <div className="flex-1">
                <p className="text-xs text-text-muted mb-0.5">Logistique</p>
                <h5 className="font-semibold text-text-primary">Livraisons Prêtes</h5>
              </div>
              <ArrowRight size={18} className="text-text-muted group-hover:text-primary-600 transition-colors" />
            </Link>

            <div className="bg-surface rounded-2xl shadow-card p-4 flex items-center justify-center border-2 border-dashed border-border">
              <span className="text-sm text-text-muted text-center">Plus de fonctionnalités bientôt</span>
            </div>
          </div>
        ) : (
          <div className="bg-surface rounded-2xl shadow-card p-10 flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
              <History size={28} className="text-text-muted" />
            </div>
            <h5 className="font-semibold text-text-primary mb-1">Aucun historique</h5>
            <p className="text-sm text-text-muted">Vos missions terminées apparaîtront ici.</p>
          </div>
        )}
      </div>
    </div>
  );
}
