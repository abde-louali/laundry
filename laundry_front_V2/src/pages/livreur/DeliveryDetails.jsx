import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  ArrowLeft, MapPin, Phone, CreditCard, Banknote,
  FileText, CheckCircle, Loader2, Package, 
  Map as MapIcon, ChevronRight, Hash, Calendar, 
  User, Receipt, Sparkles, Wallet, ArrowRight
} from 'lucide-react';
import { confirmPayment, fetchReadyForDelivery, fetchPaymentTypes } from '../../store/livreur/livreurThunk';
import { selectReadyForDelivery, selectLoading, selectPaymentTypes } from '../../store/livreur/livreurSelectors';

export default function DeliveryDetails() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const orders = useSelector(selectReadyForDelivery);
  const loading = useSelector(selectLoading);
  const paymentTypes = useSelector(selectPaymentTypes);
  
  const order = orders.find(o => o.id === parseInt(id));
  const [paymentMethod, setPaymentMethod] = useState('');

  useEffect(() => {
    if (!orders.length) {
      dispatch(fetchReadyForDelivery());
    }
    dispatch(fetchPaymentTypes());
  }, [dispatch, orders.length]);

  useEffect(() => {
    if (paymentTypes?.length > 0 && !paymentMethod) {
      setPaymentMethod(paymentTypes[0].code);
    }
  }, [paymentTypes, paymentMethod]);

  const handleRecordPayment = async () => {
    if (!paymentMethod) return toast.warning('Veuillez choisir un mode de paiement');
    try {
      await dispatch(confirmPayment({ orderId: order.id, data: { modePaiement: paymentMethod } })).unwrap();
      toast.success('Livraison validée avec succès !');
      navigate('/livreur/delivery');
    } catch (err) {
      toast.error(err || "Erreur lors de l'enregistrement du paiement");
    }
  };

  if (loading?.readyForDelivery) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4 animate-pulse">
        <Loader2 size={48} className="text-primary-500 animate-spin" />
        <p className="text-sm font-black text-text-muted uppercase tracking-widest">Chargement des détails...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center px-6 animate-fade-in">
        <div className="w-24 h-24 rounded-[2rem] bg-gray-50 flex items-center justify-center mb-6 shadow-card">
          <Package size={40} className="text-text-muted opacity-20" />
        </div>
        <h3 className="text-xl font-black text-text-primary uppercase tracking-tight mb-2">Commande introuvable</h3>
        <p className="text-sm text-text-muted mb-8 max-w-xs">Il se peut que la commande ait déjà été traitée ou n'existe plus.</p>
        <button 
          onClick={() => navigate('/livreur/delivery')} 
          className="bg-primary-600 text-white rounded-2xl px-10 py-5 text-xs font-black uppercase tracking-widest hover:bg-primary-700 transition-all shadow-xl shadow-primary-500/20 active:scale-95"
        >
          Retourner aux livraisons
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-20 px-4">
      
      {/* HEADER & BACK */}
      <div className="flex flex-col gap-4">
        <button 
          onClick={() => navigate('/livreur/delivery')}
          className="flex items-center gap-2 text-text-muted hover:text-primary-600 transition-colors text-xs font-black uppercase tracking-widest self-start"
        >
          <ArrowLeft size={16} /> Retour à la liste
        </button>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h1 className="text-3xl font-black text-text-primary uppercase tracking-tighter flex items-center gap-3">
               Détails Livraison
            </h1>
            <div className="bg-teal-500/10 text-teal-600 px-4 py-1.5 rounded-full flex items-center gap-2 self-start sm:self-center">
               <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></span>
               <span className="text-[10px] font-black uppercase tracking-widest">Prête pour livraison</span>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        
        {/* LEFT COLUMN: ORDER INFO */}
        <div className="lg:col-span-3 space-y-8">
            {/* MAIN INFO CARD */}
            <div className="bg-white rounded-[2.5rem] shadow-card border border-border/50 overflow-hidden">
                <div className="bg-gray-50/50 p-8 border-b border-border/50 flex flex-col sm:flex-row justify-between items-start gap-6">
                   <div>
                      <div className="flex items-center gap-2 text-primary-600 font-black text-xs uppercase tracking-widest mb-1">
                         <Hash size={14} strokeWidth={3} /> Numéro Commande
                      </div>
                      <p className="text-4xl font-black text-text-primary tracking-tighter">#{order.numeroCommande}</p>
                   </div>
                   <div className="sm:text-right">
                      <div className="flex items-center sm:justify-end gap-2 text-text-muted font-black text-xs uppercase tracking-widest mb-1">
                         <Calendar size={14} strokeWidth={3} /> Date de Prête
                      </div>
                      <p className="text-sm font-bold text-text-primary uppercase">AUJOURD'HUI • 14:30</p>
                   </div>
                </div>

                <div className="p-8 space-y-6">
                   <div className="flex items-start gap-5 p-4 rounded-3xl bg-primary-50/30 border border-primary-100/50">
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-primary-600 shadow-sm border border-primary-100 shrink-0">
                         <User size={24} />
                      </div>
                      <div className="min-w-0">
                         <p className="text-[10px] font-black text-primary-500 uppercase tracking-widest mb-0.5">Destinataire</p>
                         <h3 className="text-lg font-black text-text-primary uppercase truncate">{order.client?.nom || order.client?.name}</h3>
                         <div className="flex flex-wrap gap-4 mt-2">
                            <span className="text-xs font-bold text-text-muted flex items-center gap-1.5">
                               <Phone size={14} className="text-primary-500" /> {order.client?.phones?.[0]?.phoneNumber || order.client?.telephone || '—'}
                            </span>
                         </div>
                      </div>
                   </div>
 
                   <div className="flex items-start gap-4 p-4 rounded-3xl bg-teal-50/40 border border-teal-100/50">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-teal-600 shadow-sm border border-teal-100 shrink-0">
                         <MapPin size={20} />
                      </div>
                      <div className="min-w-0">
                         <p className="text-[10px] font-black text-teal-500 uppercase tracking-widest mb-0.5">Adresse</p>
                         <p className="text-xs font-bold text-text-primary leading-relaxed">{order.client?.addresses?.[0]?.address || 'Adresse non spécifiée'}</p>
                         <button 
                           onClick={() => {
                             const lat = order.client?.addresses?.[0]?.latitude;
                             const lng = order.client?.addresses?.[0]?.longitude;
                             if (lat && lng) window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank');
                             else window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.client?.addresses?.[0]?.address || '')}`, '_blank');
                           }}
                           className="flex items-center gap-2 mt-3 text-xs font-black text-teal-600 hover:text-teal-700 tracking-widest uppercase transition-colors"
                         >
                            Itinéraire <MapIcon size={14} strokeWidth={3} />
                         </button>
                      </div>
                   </div>
                </div>
            </div>

            {/* ARTICULES LIST */}
            <div className="bg-white rounded-[2.5rem] shadow-card border border-border/50 p-8 space-y-6">
               <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-text-primary">
                     <Package size={20} />
                  </div>
                  <h3 className="text-lg font-black text-text-primary uppercase tracking-tight">Articles du colis</h3>
               </div>

               <div className="divide-y divide-gray-100">
                  {order.commandeTapis?.map((item, idx) => (
                    <div key={idx} className="py-4 flex items-center justify-between group">
                      <div className="flex items-center gap-4">
                         <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-text-muted group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors">
                            <span className="text-[10px] font-black">{idx + 1}</span>
                         </div>
                         <div>
                            <p className="text-sm font-black text-text-primary uppercase group-hover:text-primary-600 transition-colors">{item.tapis?.nom}</p>
                            <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">{item.quantite} x {item.prixUnitaire.toFixed(2)} dh</p>
                         </div>
                      </div>
                      <p className="text-sm font-black text-text-primary">{(item.quantite * item.prixUnitaire).toFixed(2)} DH</p>
                    </div>
                  ))}
               </div>

               <div className="pt-6 mt-2 border-t border-dashed border-border flex items-center justify-between">
                  <p className="text-xs font-black text-text-muted uppercase tracking-[0.2em]">Total Commande</p>
                  <div className="text-right">
                     <p className="text-3xl font-black text-primary-600 tracking-tighter">{order.montantTotal.toFixed(0)} <span className="text-base font-bold">DH</span></p>
                  </div>
               </div>
            </div>
        </div>

        {/* RIGHT COLUMN: ACTION / PAYMENT */}
        <div className="lg:col-span-2 space-y-8">
            
            <div className="bg-white rounded-[2.5rem] shadow-2xl border-4 border-primary-500 overflow-hidden sticky top-24">
                <div className="bg-primary-500 p-8 text-white relative">
                   <div className="absolute top-0 right-0 p-4 opacity-10">
                      <Wallet size={80} strokeWidth={1} />
                   </div>
                   <h3 className="text-sm font-black uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                      <CreditCard size={18} strokeWidth={3} /> Résumé Règlement
                   </h3>
                   <div className="flex items-baseline gap-1">
                      <span className="text-5xl font-black tracking-tighter">{order.montantTotal.toFixed(0)}</span>
                      <span className="text-lg font-bold opacity-80 uppercase">.{(order.montantTotal % 1).toFixed(2).substring(2)} DH</span>
                   </div>
                </div>

                <div className="p-8 space-y-8">
                   <div className="space-y-4">
                      <p className="text-[10px] font-black text-text-muted uppercase tracking-widest px-2">Mode de paiement reçu</p>
                      <div className="grid grid-cols-1 gap-3">
                         {paymentTypes?.length > 0 ? (
                           paymentTypes.map(opt => (
                            <button
                                key={opt.code}
                                onClick={() => setPaymentMethod(opt.code)}
                                className={`flex items-center justify-between px-6 py-5 rounded-2xl border-2 transition-all group ${
                                  paymentMethod === opt.code
                                    ? 'bg-primary-50 border-primary-500 shadow-md'
                                    : 'bg-gray-50 border-transparent hover:border-border'
                                }`}
                              >
                                 <div className="flex items-center gap-4">
                                    <div className={`w-6 h-6 rounded-full border-4 flex items-center justify-center transition-all ${
                                      paymentMethod === opt.code ? 'border-primary-500 bg-white' : 'border-gray-200 bg-gray-100'
                                    }`}>
                                       {paymentMethod === opt.code && <div className="w-2 h-2 rounded-full bg-primary-500 animate-in zoom-in-0" />}
                                    </div>
                                    <span className={`text-sm font-black uppercase tracking-widest transition-colors ${
                                      paymentMethod === opt.code ? 'text-primary-700' : 'text-text-muted group-hover:text-text-primary'
                                    }`}>{opt.label}</span>
                                 </div>
                                 {opt.code === 'especes' ? <Banknote className={paymentMethod === opt.code ? 'text-primary-500' : 'text-text-muted'} /> : 
                                  opt.code === 'carte' ? <CreditCard className={paymentMethod === opt.code ? 'text-primary-500' : 'text-text-muted'} /> :
                                  <FileText className={paymentMethod === opt.code ? 'text-primary-500' : 'text-text-muted'} />}
                              </button>
                           ))
                         ) : (
                           <div className="py-4 px-6 bg-red-50 text-red-600 rounded-2xl text-[10px] font-black uppercase tracking-widest text-center">
                              Erreur: Modes de paiement non disponibles
                           </div>
                         )}
                      </div>
                   </div>

                   <button
                     onClick={handleRecordPayment}
                     disabled={loading?.confirmPayment}
                     className="w-full bg-primary-500 text-white rounded-[2rem] py-8 font-black uppercase text-sm tracking-[0.2em] shadow-xl shadow-primary-500/40 hover:bg-primary-600 transition-all flex items-center justify-center gap-4 active:scale-95 group"
                   >
                     {loading?.confirmPayment ? (
                       <Loader2 className="animate-spin" size={24} />
                     ) : (
                       <>
                         VALIDER LA LIVRAISON
                         <ArrowRight size={20} strokeWidth={3} className="group-hover:translate-x-2 transition-transform" />
                       </>
                     )}
                   </button>
                   
                   <p className="text-[9px] text-center font-bold text-text-muted uppercase tracking-widest px-4">
                      Cette action marquera la commande comme livrée et encaissée définitivement.
                   </p>
                </div>
            </div>

        </div>
      </div>

    </div>
  );
}
