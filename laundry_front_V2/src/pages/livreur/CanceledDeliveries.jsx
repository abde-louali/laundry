import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Phone, Package, Calendar, RefreshCw, XCircle, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import { fetchCanceledDeliveries, returnToWorkplace } from '../../store/livreur/livreurThunk';
import { selectLoading } from '../../store/livreur/livreurSelectors';
import { StatusBadge } from '../../components/StatusBadge';

export default function CanceledDeliveries() {
  const dispatch = useDispatch();
  const loading = useSelector(selectLoading);
  const [orders, setOrders] = useState([]);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    dispatch(fetchCanceledDeliveries()).unwrap()
      .then(data => setOrders(data || []))
      .catch(() => setOrders([]));
  }, [dispatch]);

  const handleReturn = async (orderId) => {
    setProcessingId(orderId);
    try {
      await dispatch(returnToWorkplace(orderId)).unwrap();
      toast.success('Commande retournée à l\'atelier');
      setOrders(prev => prev.filter(o => o.id !== orderId));
    } catch (err) {
      toast.error(err || 'Erreur lors du retour');
    } finally {
      setProcessingId(null);
    }
  };

  if (loading?.canceledDeliveries) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => <div key={i} className="bg-surface rounded-2xl shadow-card animate-pulse h-44" />)}
      </div>
    );
  }

  return (
    <div className="pb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-lg font-semibold text-text-primary">Commandes Annulées</h1>
          <p className="text-sm text-text-muted">Commandes nécessitant un retour</p>
        </div>
        {orders.length > 0 && (
          <span className="bg-red-100 text-red-600 text-xs font-semibold px-3 py-1 rounded-full">
            {orders.length} commande{orders.length > 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Info Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3 mb-5">
        <AlertCircle size={18} className="text-amber-500 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-amber-800">Ces commandes ont été annulées. Utilisez le bouton &quot;Retour à l&apos;atelier&quot; pour les restituer.</p>
      </div>

      {/* Empty State */}
      {orders.length === 0 && (
        <div className="bg-surface rounded-2xl shadow-card py-16 flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
            <XCircle size={28} className="text-text-muted" />
          </div>
          <h3 className="font-semibold text-text-primary mb-1">Aucune commande annulée</h3>
          <p className="text-sm text-text-muted max-w-xs">Les commandes annulées apparaîtront ici.</p>
        </div>
      )}

      {/* Order Cards */}
      <div className="space-y-3">
        {orders.map(order => {
          const client = order.client;
          const phones = client?.phones || [];
          const createdAt = order.dateCreation ? new Date(order.dateCreation).toLocaleDateString('fr-FR') : '—';
          const isProcessing = processingId === order.id;

          return (
            <div key={order.id} className="bg-surface rounded-2xl shadow-card p-4">
              {/* Top row */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-text-muted">#{order.numeroCommande}</span>
                <StatusBadge status="ANNULEE" />
              </div>

              {/* Client Info */}
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-semibold flex-shrink-0">
                  {client?.name?.[0]?.toUpperCase() || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-text-primary truncate">{client?.name || 'Client inconnu'}</p>
                  {phones.length > 0 && (
                    <p className="text-xs text-text-muted flex items-center gap-1 mt-0.5">
                      <Phone size={11} />{phones[0].phoneNumber}
                    </p>
                  )}
                </div>
              </div>

              {/* Date + carpet count */}
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1.5 text-xs text-text-muted">
                  <Calendar size={13} />
                  <span>{createdAt}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-text-muted">
                  <Package size={13} />
                  <span>{order.commandeTapis?.length || 0} tapis</span>
                </div>
              </div>

              {/* Return Button */}
              <button
                onClick={() => handleReturn(order.id)}
                disabled={isProcessing}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-orange-50 text-orange-600 border border-orange-200 text-sm font-medium hover:bg-orange-100 transition-colors min-h-[48px]"
              >
                {isProcessing ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                Retour à l&apos;atelier
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
