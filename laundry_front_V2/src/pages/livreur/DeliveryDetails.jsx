import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  ArrowLeft, MapPin, Phone, CreditCard, Banknote,
  FileText, CheckCircle, Loader2, Package
} from 'lucide-react';
import { submitPayment } from '../../store/livreur/livreurThunk';
import { selectReadyForDelivery, selectLoading } from '../../store/livreur/livreurSelectors';
import { StatusBadge } from '../../components/StatusBadge';

export default function DeliveryDetails() {
  const { orderId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const orders = useSelector(selectReadyForDelivery);
  const loading = useSelector(selectLoading);

  const order = orders.find(o => o.id === parseInt(orderId));
  const [paymentMethod, setPaymentMethod] = useState('especes');

  const handleRecordPayment = async () => {
    try {
      await dispatch(submitPayment({ orderId: order.id, data: { modePaiement: paymentMethod } })).unwrap();
      toast.success('Livraison validée avec succès !');
      navigate('/livreur/ready-for-delivery');
    } catch (err) {
      toast.error(err || "Erreur lors de l'enregistrement du paiement");
    }
  };

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
          <Package size={28} className="text-text-muted" />
        </div>
        <h3 className="font-semibold text-text-primary">Commande introuvable</h3>
        <button onClick={() => navigate('/livreur/ready-for-delivery')} className="bg-primary-600 text-white rounded-xl px-5 py-2.5 text-sm font-medium hover:bg-primary-700 transition-colors">
          Retour à la liste
        </button>
      </div>
    );
  }

  const paymentOptions = [
    { value: 'especes', label: 'Espèces', icon: Banknote },
    { value: 'carte', label: 'Carte', icon: CreditCard },
    { value: 'cheque', label: 'Chèque', icon: FileText },
  ];

  return (
    <div className="max-w-xl mx-auto pb-8 space-y-4">

      {/* Back */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-text-muted hover:text-text-primary mb-2">
        <ArrowLeft size={16} />
        Retour
      </button>

      {/* Order Header Card */}
      <div className="bg-surface rounded-2xl shadow-card p-5">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs text-text-muted uppercase tracking-wide">Commande</span>
          <StatusBadge status="PRETE" />
        </div>
        <p className="text-2xl font-bold text-text-primary mb-4">#{order.numeroCommande}</p>

        {/* Client info */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 bg-background rounded-xl px-3 py-2">
            <Phone size={14} className="text-text-muted" />
            <span className="text-sm text-text-secondary">{order.client?.phones?.[0]?.phoneNumber || '—'}</span>
          </div>
          <div className="flex items-center gap-2 bg-background rounded-xl px-3 py-2">
            <MapPin size={14} className="text-text-muted" />
            <span className="text-sm text-text-secondary truncate">{order.client?.addresses?.[0]?.address || '—'}</span>
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="bg-surface rounded-2xl shadow-card p-5">
        <h3 className="text-sm font-semibold text-text-primary mb-4">Articles</h3>
        <div className="space-y-3">
          {order.commandeTapis?.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between py-2 border-b border-border last:border-0">
              <div>
                <p className="text-sm font-medium text-text-primary">{item.tapis?.nom}</p>
                <p className="text-xs text-text-muted">{item.quantite} x {item.prixUnitaire} DH</p>
              </div>
              <p className="font-semibold text-text-primary">{(item.quantite * item.prixUnitaire).toFixed(2)} DH</p>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between pt-3 border-t border-border mt-2">
          <span className="text-sm font-semibold text-text-primary">Total</span>
          <span className="text-xl font-bold text-primary-600">{order.montantTotal} DH</span>
        </div>
      </div>

      {/* Payment Method */}
      <div className="bg-surface rounded-2xl shadow-card p-5">
        <h3 className="text-sm font-semibold text-text-primary mb-4">Mode de paiement</h3>
        <div className="space-y-2">
          {paymentOptions.map(opt => {
            const Icon = opt.icon;
            return (
              <button
                key={opt.value}
                onClick={() => setPaymentMethod(opt.value)}
                className={`w-full text-left px-4 py-3.5 rounded-xl flex items-center gap-3 transition-all ${
                  paymentMethod === opt.value
                    ? 'bg-primary-50 border-2 border-primary-400 text-primary-700'
                    : 'bg-gray-50 border-2 border-transparent text-text-secondary hover:bg-gray-100'
                }`}
              >
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${paymentMethod === opt.value ? 'border-primary-500' : 'border-gray-300'}`}>
                  {paymentMethod === opt.value && <div className="w-2 h-2 rounded-full bg-primary-500" />}
                </div>
                <Icon size={16} />
                <span className="text-sm font-medium">{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Submit Button */}
      <button
        onClick={handleRecordPayment}
        disabled={loading?.payment}
        className="w-full bg-primary-600 hover:bg-primary-700 text-white rounded-xl py-3.5 text-sm font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm min-h-[48px]"
      >
        {loading?.payment ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
        Finaliser &amp; Encaisser
      </button>
    </div>
  );
}
