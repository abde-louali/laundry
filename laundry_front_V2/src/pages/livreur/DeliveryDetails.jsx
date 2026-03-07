import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  ArrowLeft,
  MapPin,
  Phone,
  CreditCard,
  Banknote,
  FileText,
  CheckCircle,
  Smartphone,
  Sparkles,
  Navigation,
  Wallet,
  Receipt as ReceiptIcon,
  Loader2,
  Calendar,
  Hash,
  ShoppingBag,
  Ticket
} from 'lucide-react';

import { submitPayment } from '../../store/livreur/livreurThunk';
import { selectReadyForDelivery, selectLoading } from '../../store/livreur/livreurSelectors';

export default function DeliveryDetails() {
  const { orderId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const orders = useSelector(selectReadyForDelivery);
  const loading = useSelector(selectLoading);

  const order = orders.find(o => o.id === parseInt(orderId));
  const [paymentMethod, setPaymentMethod] = useState('ESPECES');

  const handleRecordPayment = async () => {
    try {
      await dispatch(submitPayment({
        orderId: order.id,
        data: { modePaiement: paymentMethod }
      })).unwrap();

      toast.success("Livraison validée avec succès !");
      navigate('/livreur/ready-for-delivery');
    } catch (err) {
      toast.error(err || "Erreur lors de l'enregistrement du paiement");
    }
  };

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center gap-6 animate-fade-in">
        <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-xl border border-laundry-sky mb-4">
          <ReceiptIcon size={32} className="text-laundry-deep/10" />
        </div>
        <h3 className="text-xl font-black text-laundry-deep uppercase tracking-tighter">Commande Introuvable</h3>
        <button
          onClick={() => navigate('/livreur/ready-for-delivery')}
          className="px-8 py-3 bg-laundry-deep text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg shadow-laundry-deep/20 hover:bg-laundry-primary transition-all active:scale-95"
        >
          Retour à la liste
        </button>
      </div>
    );
  }

  const paymentOptions = [
    { value: 'especes', label: 'Cash', icon: Banknote, color: 'text-green-500', bg: 'bg-green-500/10' },
    { value: 'carte', label: 'TPE', icon: CreditCard, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { value: 'cheque', label: 'Chèque', icon: FileText, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  ];

  return (
    <div className="space-y-10 animate-fade-in pb-32">

      {/* 1. RECEIPT SECTION (THE MASTER VIEW) */}
      <section className="relative group mx-2">
        {/* THE RECEIPT CONTAINER */}
        <div className="bg-white rounded-t-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden flex flex-col items-center text-center">
          {/* BRANDING */}
          <div className="mb-10 space-y-2">
            <div className="w-16 h-16 bg-laundry-primary text-white rounded-[1.25rem] flex items-center justify-center mx-auto shadow-xl shadow-laundry-primary/20 animate-float mb-4 rotate-3">
              <ReceiptIcon size={32} strokeWidth={3} />
            </div>
            <h2 className="text-2xl font-black text-laundry-deep uppercase tracking-tighter">Laundry <span className="text-laundry-primary">Fresh</span></h2>
            <div className="flex items-center justify-center gap-4 text-[9px] font-black text-laundry-deep/30 uppercase tracking-[0.2em]">
              <span className="flex items-center gap-1"><Hash size={12} /> {order.numeroCommande}</span>
              <span className="w-1.5 h-1.5 bg-laundry-sky rounded-full"></span>
              <span className="flex items-center gap-1"><Calendar size={12} /> {new Date().toLocaleDateString()}</span>
            </div>
          </div>

          {/* DIVIDER */}
          <div className="w-full border-b-2 border-dashed border-laundry-sky/50 mb-10"></div>

          {/* CLIENT CONTEXT */}
          <div className="w-full space-y-6 text-left">
            <div className="space-y-1">
              <span className="text-[10px] font-black text-laundry-primary uppercase tracking-widest">Client Destinataire</span>
              <h3 className="text-xl font-black text-laundry-deep uppercase tracking-tighter">{order.client.name}</h3>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3 text-laundry-deep/60">
                <MapPin size={16} className="text-laundry-primary" strokeWidth={3} />
                <span className="text-[11px] font-bold uppercase tracking-tight line-clamp-1">{order.client.address}</span>
              </div>
              <div className="flex items-center gap-3 text-laundry-deep/60">
                <Phone size={16} className="text-laundry-primary" strokeWidth={3} />
                <span className="text-[11px] font-bold uppercase tracking-tight">{order.client.phone}</span>
              </div>
            </div>
          </div>

          {/* ITEM TABLE */}
          <div className="w-full mt-10">
            <div className="flex justify-between text-[10px] font-black text-laundry-deep/30 uppercase tracking-[0.2em] mb-4 px-1">
              <span>Désignation</span>
              <span>Montant</span>
            </div>
            <div className="space-y-4">
              {order.commandeTapis.map((item, idx) => (
                <div key={idx} className="flex items-end gap-3 group">
                  <div className="flex flex-col text-left">
                    <span className="text-sm font-black text-laundry-deep uppercase tracking-tighter">{item.tapis.nom}</span>
                    <span className="text-[9px] font-bold text-laundry-deep/40 uppercase tracking-widest">{item.quantite} x {item.prixUnitaire} DH</span>
                  </div>
                  <div className="flex-1 border-b border-dotted border-laundry-sky mb-2 opacity-50"></div>
                  <span className="text-sm font-black text-laundry-primary">{(item.quantite * item.prixUnitaire).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* TOTAL FOOTER OF RECEIPT */}
          <div className="w-full mt-12 bg-laundry-sky/10 rounded-2xl p-6 border-2 border-laundry-sky/20">
            <div className="flex justify-between items-center">
              <span className="text-xs font-black text-laundry-deep uppercase tracking-tighter">Total à Encaisser</span>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-laundry-deep tracking-tighter">{order.montantTotal}</span>
                <span className="text-sm font-black text-laundry-deep uppercase">DH</span>
              </div>
            </div>
          </div>
        </div>

        {/* THE SERRATED BOTTOM EDGE (CSS TRICK) */}
        <div className="h-4 bg-white relative overflow-hidden" style={{ clipPath: 'polygon(0 0, 5% 100%, 10% 0, 15% 100%, 20% 0, 25% 100%, 30% 0, 35% 100%, 40% 0, 45% 100%, 50% 0, 55% 100%, 60% 0, 65% 100%, 70% 0, 75% 100%, 80% 0, 85% 100%, 90% 0, 95% 100%, 100% 0)' }}></div>
      </section>

      {/* 2. PAYMENT METHOD SECTION */}
      <section className="space-y-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <div className="flex flex-col items-center gap-1">
          <h4 className="text-[10px] font-black text-laundry-deep/30 uppercase tracking-[0.3em]">Mode de Paiement</h4>
          <div className="w-8 h-1 bg-laundry-primary/20 rounded-full"></div>
        </div>

        <div className="flex items-center gap-4 px-2">
          {paymentOptions.map(opt => (
            <button
              key={opt.value}
              onClick={() => setPaymentMethod(opt.value)}
              className={`flex-1 flex flex-col items-center gap-3 p-6 rounded-[2rem] border-2 transition-all active:scale-95 ${paymentMethod === opt.value
                ? 'bg-white border-laundry-primary shadow-xl shadow-laundry-primary/10'
                : 'bg-white/30 border-transparent text-laundry-deep/30'
                }`}
            >
              <div className={`p-3 rounded-2xl ${paymentMethod === opt.value ? 'bg-laundry-primary text-white shadow-lg' : 'bg-laundry-sky/50'}`}>
                <opt.icon size={20} strokeWidth={3} />
              </div>
              <span className={`text-[10px] font-black uppercase tracking-widest ${paymentMethod === opt.value ? 'text-laundry-primary' : ''}`}>{opt.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* 3. FINAL ACTION */}
      <div className="px-2 animate-slide-up" style={{ animationDelay: '0.2s' }}>
        <button
          onClick={handleRecordPayment}
          disabled={loading?.payment}
          className="w-full bg-laundry-fresh text-laundry-deep py-6 rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-2xl shadow-laundry-fresh/20 flex items-center justify-center gap-4 hover:bg-laundry-primary hover:text-white transition-all active:scale-95"
        >
          {loading?.payment ? (
            <Loader2 size={24} className="animate-spin" />
          ) : (
            <>
              <CheckCircle size={24} strokeWidth={3} />
              <span>Finaliser & Encaisser</span>
            </>
          )}
        </button>
        <button
          onClick={() => navigate(-1)}
          className="w-full py-6 text-[10px] font-black text-laundry-deep/20 uppercase tracking-widest hover:text-laundry-deep transition-colors"
        >
          Abandonner la livraison
        </button>
      </div>
    </div>
  );
}
