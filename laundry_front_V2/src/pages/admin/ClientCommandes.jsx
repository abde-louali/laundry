import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, ChevronRight, ClipboardList, DollarSign } from 'lucide-react';
import { fetchAllClients, fetchClientCommandes } from '../../store/admin/adminThunk';
import { clearClientCommandes } from '../../store/admin/adminSlice';
import { StatusBadge } from '../../components/StatusBadge';

export default function ClientCommandes() {
  const { clientId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { clientCommandes, clients, loading } = useSelector(s => s.admin);

  useEffect(() => {
    dispatch(fetchClientCommandes(clientId));
    if (clients.length === 0) dispatch(fetchAllClients());
    return () => { dispatch(clearClientCommandes()); };
  }, [clientId, dispatch]);

  const client = clients.find(c => String(c.id) === String(clientId));

  if (loading && !clientCommandes.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 size={32} className="animate-spin text-primary-600 mb-3" />
        <p className="text-sm text-text-muted">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto pb-8 space-y-5">
      {/* Back */}
      <button onClick={() => navigate('/admin/clients')} className="flex items-center gap-2 text-sm text-text-muted hover:text-text-primary">
        <ArrowLeft size={16} />
        Tous les clients
      </button>

      {/* Client Header Card */}
      <div className="bg-primary-600 rounded-2xl p-5 text-white flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-2xl font-bold flex-shrink-0">
          {client?.name?.[0]?.toUpperCase() || '?'}
        </div>
        <div>
          <h2 className="text-xl font-bold">{client?.name || `Client #${clientId}`}</h2>
          <p className="text-primary-200 text-sm">{clientCommandes.length} commandes</p>
        </div>
      </div>

      {/* Commandes */}
      <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
        <ClipboardList size={16} className="text-primary-600" />
        Historique des Commandes
      </h3>

      {clientCommandes.length === 0 ? (
        <div className="bg-surface rounded-2xl shadow-card py-16 flex flex-col items-center text-center">
          <ClipboardList size={36} className="text-text-muted mb-3" />
          <h3 className="font-semibold text-text-primary mb-1">Aucune commande</h3>
          <p className="text-sm text-text-muted">Ce client n&apos;a pas encore de commandes.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {clientCommandes.map(c => (
            <button key={c.id} onClick={() => navigate(`/admin/commandes/${c.id}`)}
              className="w-full bg-surface rounded-2xl shadow-card p-4 flex items-center gap-4 text-left hover:shadow-card-hover hover:-translate-y-0.5 transition-all group">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-text-muted mb-1">#{c.numeroCommande}</p>
                <StatusBadge status={c.status} />
              </div>
              {c.montantTotal != null && (
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-semibold text-text-primary">{c.montantTotal} DH</p>
                </div>
              )}
              <ChevronRight size={16} className="text-text-muted group-hover:text-primary-600 transition-colors flex-shrink-0" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
