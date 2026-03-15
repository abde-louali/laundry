import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  MapPin,
  Package,
  ChevronRight,
  Phone,
  Navigation,
  Sparkles,
  Search,
  CheckCircle2,
  ExternalLink,
  CreditCard,
  Image as ImageIcon,
  Loader2,
  Filter,
  X,
  Maximize2,
  Calendar,
  User as UserIcon,
  Info,
  ChevronLeft,
  Banknote,
  FileText,
  Printer,
  AlertCircle,
  XCircle,
  AlertTriangle,
  Bell
} from 'lucide-react';
import { toast } from 'react-toastify';
import {
  fetchReadyForDelivery,
  fetchPreteCount,
  submitPayment,
  cancelDelivery
} from '../../store/livreur/livreurThunk';
import { selectLoading, selectReadyForDelivery, selectPreteCount } from '../../store/livreur/livreurSelectors';

// ─── Sub-Components ───────────────────

const ImageViewer = ({ images, currentIndex, onClose, onNext, onPrev }) => {
  if (!images || images.length === 0) return null;
  const baseUrl = "http://localhost:8080";

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-500 overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-laundry-deep/90 backdrop-blur-2xl" onClick={onClose}></div>

      {/* Close Button - Detached/Floating */}
      <button
        onClick={onClose}
        className="absolute top-8 right-8 z-[10000] p-6 bg-white/10 hover:bg-laundry-primary hover:rotate-90 rounded-full text-white transition-all border border-white/20 shadow-2xl backdrop-blur-md group"
      >
        <X size={24} strokeWidth={3} className="group-hover:scale-110" />
      </button>

      {/* Main Container */}
      <div className="relative w-full max-w-7xl h-full flex flex-col items-center justify-between py-12 px-6 z-10 pointer-events-none">

        {/* Header Branding */}
        <div className="w-full flex justify-between items-center px-10 pointer-events-auto">
          <div className="space-y-1">
            <div className="flex items-center gap-3 text-laundry-primary">
              <Sparkles size={16} strokeWidth={3} />
              <span className="text-[10px] font-black uppercase tracking-[0.4em]">Inspection Qualité</span>
            </div>
            <h2 className="text-3xl font-black text-white uppercase tracking-tighter">
              {images[currentIndex]?.carpetName || 'Commande'} • <span className="text-laundry-primary">{images[currentIndex]?.imageType || 'VUE'}</span>
            </h2>
          </div>
        </div>

        {/* Viewport - Maximized */}
        <div className="relative w-full h-[65vh] flex items-center justify-center pointer-events-auto">
          {images.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); onPrev(); }}
              className="absolute left-0 p-6 bg-white/5 hover:bg-laundry-primary rounded-full text-white transition-all border border-white/10 backdrop-blur-md z-20 hidden md:block hover:scale-110 active:scale-95 shadow-2xl"
            >
              <ChevronLeft size={32} strokeWidth={4} />
            </button>
          )}

          <div className="w-full h-full bg-white/5 rounded-[4rem] p-4 border border-white/10 overflow-hidden flex items-center justify-center shadow-[0_0_80px_rgba(0,0,0,0.5)] transition-all duration-500">
            <img
              src={images[currentIndex]?.imageUrl?.startsWith('http') ? images[currentIndex].imageUrl : (images[currentIndex]?.imageUrl ? `${baseUrl}${images[currentIndex].imageUrl}` : '')}
              alt="Preview"
              className="max-w-full max-h-full object-contain rounded-3xl animate-in zoom-in-90 duration-500 select-none shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {images.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); onNext(); }}
              className="absolute right-0 p-6 bg-white/5 hover:bg-laundry-primary rounded-full text-white transition-all border border-white/10 backdrop-blur-md z-20 hidden md:block hover:scale-110 active:scale-95 shadow-2xl"
            >
              <ChevronRight size={32} strokeWidth={4} />
            </button>
          )}
        </div>

        {/* Navigation Tools */}
        <div className="w-full max-w-4xl space-y-8 pointer-events-auto">
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-4">
              <span className="text-[10px] font-black text-laundry-primary uppercase tracking-[0.3em]">{currentIndex + 1}</span>
              <div className="w-80 h-1.5 bg-white/10 rounded-full overflow-hidden border border-white/5 p-[1px]">
                <div
                  className="h-full bg-laundry-primary shadow-[0_0_15px_rgba(34,211,238,0.8)] transition-all duration-500 ease-out rounded-full"
                  style={{ width: `${((currentIndex + 1) / images.length) * 100}%` }}
                ></div>
              </div>
              <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">{images.length}</span>
            </div>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-4 px-8 no-scrollbar justify-center items-center h-24">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => onNext(idx)}
                className={`relative group w-20 h-20 rounded-[1.5rem] overflow-hidden border-2 transition-all duration-500 shrink-0 ${idx === currentIndex ? 'border-laundry-primary scale-110 shadow-2xl shadow-laundry-primary/40 -translate-y-2' : 'border-white/10 opacity-40 hover:opacity-100 hover:scale-105'}`}
              >
                <img
                  src={img.imageUrl?.startsWith('http') ? img.imageUrl : (img.imageUrl ? `${baseUrl}${img.imageUrl}` : '')}
                  className="w-full h-full object-cover"
                  alt="Thumb"
                />
                <div className={`absolute inset-0 bg-laundry-primary/20 transition-opacity ${idx === currentIndex ? 'opacity-100' : 'opacity-0'}`}></div>
              </button>
            ))}
          </div>

          <p className="text-center text-[8px] font-black text-white/20 uppercase tracking-[0.6em]">
            PureClean Live View • High Precision Rendering
          </p>
        </div>
      </div>
    </div>,
    document.body
  );
};

const ImageGallery = ({ carpets, onImageClick }) => {
  const baseUrl = "http://localhost:8080";

  // Flatten both tapisImages (direct) and tapis.images (nested)
  const allImages = useMemo(() => {
    return carpets?.flatMap(c => {
      const images = [
        ...(c.tapisImages || []),
        ...(c.tapis?.images || [])
      ].filter((img, index, self) =>
        index === self.findIndex((t) => t.imageUrl === img.imageUrl)
      );
      return images.map(img => ({ ...img, carpetName: c.tapis?.nom }));
    }) || [];
  }, [carpets]);

  if (allImages.length === 0) {
    return (
      <div className="w-full h-48 bg-slate-100 rounded-t-[2.5rem] flex flex-col items-center justify-center text-slate-400 gap-2 border-b border-slate-200">
        <ImageIcon size={32} strokeWidth={1.5} />
        <span className="text-[9px] font-black uppercase tracking-widest opacity-50">Aucune Image</span>
      </div>
    );
  }

  return (
    <div className="relative group w-full h-56 bg-white rounded-t-[2.5rem] overflow-hidden border-b border-laundry-sky/20">
      <div className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar h-full">
        {allImages.map((img, idx) => (
          <div
            key={idx}
            className="relative min-w-full h-full snap-start cursor-zoom-in"
            onClick={() => onImageClick(allImages, idx)}
          >
            <img
              src={img.imageUrl?.startsWith('http') ? img.imageUrl : `${baseUrl}${img.imageUrl}`}
              alt={img.carpetName}
              className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            {/* Overlay Info */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60"></div>

            <div className="absolute top-4 left-6 px-3 py-1 bg-black/40 backdrop-blur-md rounded-full border border-white/20">
              <p className="text-[9px] font-bold text-white uppercase tracking-widest">
                {img.carpetName || 'Tapis'} • {img.imageType || 'Photo'}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Indicators */}
      {allImages.length > 1 && (
        <div className="absolute bottom-4 left-6 flex gap-1.5 px-3 py-2 bg-black/10 backdrop-blur-sm rounded-full">
          {allImages.map((_, idx) => (
            <div
              key={idx}
              className="w-1.5 h-1.5 rounded-full bg-white/40"
            ></div>
          ))}
        </div>
      )}

      {/* Zoom Icon Hint */}
      <div className="absolute bottom-4 right-6 p-2 bg-white/20 backdrop-blur-md rounded-xl border border-white/20 text-white opacity-0 group-hover:opacity-100 transition-opacity">
        <Maximize2 size={16} />
      </div>
    </div>
  );
};

const DeliveryStatusBadge = ({ count }) => (
  <div className="inline-flex items-center gap-2 px-4 py-2 bg-laundry-primary/10 text-laundry-primary rounded-full border border-laundry-primary/20 animate-fade-in">
    <div className="w-2 h-2 rounded-full bg-laundry-primary animate-pulse"></div>
    <span className="text-[10px] font-black uppercase tracking-widest">
      {count} {count > 1 ? 'Commandes Prêtes' : 'Commande Prête'}
    </span>
  </div>
);

const DeliveryCard = ({ order, onNavigate, onPay, onCancel, onViewDetail, onImageClick }) => {
  const primaryAddress = order.client?.addresses?.[0] || {};
  const phones = order.client?.phones?.map(p => p.phoneNumber).join(' • ') || 'N/A';

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="group bg-white rounded-[2.5rem] border border-laundry-sky/30 shadow-xl shadow-laundry-primary/5 hover:shadow-2xl hover:shadow-laundry-primary/15 transition-all duration-300 flex flex-col overflow-hidden">
      <ImageGallery carpets={order.commandeTapis} onImageClick={onImageClick} />

      <div className="p-6 flex flex-col flex-1 space-y-5">
        {/* Header: Client & Progress */}
        <div className="flex justify-between items-start gap-4">
          <div className="space-y-1.5 flex-1">
            <h3 className="text-xl font-black text-laundry-deep uppercase tracking-tighter group-hover:text-laundry-primary transition-colors leading-tight">
              {order.client?.name || 'Client Inconnu'}
            </h3>
            <div className="flex items-center gap-2 text-[10px] font-black text-laundry-primary uppercase tracking-widest">
              <Phone size={12} strokeWidth={3} />
              <span>{phones}</span>
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-3 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-laundry-sky/30 flex items-center justify-center text-laundry-primary">
              <Package size={14} />
            </div>
            <div>
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Commande</p>
              <p className="text-[10px] font-black text-laundry-deep">#{order.numeroCommande}</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
              <Calendar size={14} />
            </div>
            <div>
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Date</p>
              <p className="text-[10px] font-black text-laundry-deep">{formatDate(order.dateCreation)}</p>
            </div>
          </div>
        </div>

        {/* Address Box */}
        <div className="bg-slate-50 rounded-2xl p-4 flex flex-col gap-3 border border-slate-100 transition-colors group-hover:bg-laundry-sky/10 group-hover:border-laundry-sky/20">
          <div className="flex items-start gap-3">
            <MapPin size={18} className="text-laundry-primary shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-[11px] font-bold text-laundry-deep/70 leading-relaxed uppercase tracking-tight line-clamp-2">
                {primaryAddress.address || 'Adresse non spécifiée'}
              </p>
              {primaryAddress.notes && (
                <p className="text-[9px] font-black text-laundry-primary/60 uppercase tracking-widest">
                  Note: {primaryAddress.notes}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Amount Row */}
        <div className="flex items-center justify-between px-2 pt-2">
          <span className="text-[10px] font-black text-laundry-deep/30 uppercase tracking-widest">A Encaisser</span>
          <div className="flex items-baseline gap-1 bg-laundry-primary/5 px-3 py-1 rounded-lg border border-laundry-primary/10">
            <span className="text-xl font-black text-laundry-primary tracking-tighter">{order.montantTotal}</span>
            <span className="text-xs font-black text-laundry-primary">DH</span>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="pt-2 flex flex-col gap-3 mt-auto">
          <button
            onClick={() => onPay(order)}
            className="w-full bg-laundry-fresh text-white h-14 rounded-2xl flex items-center justify-center gap-2 font-black uppercase tracking-widest text-[10px] hover:bg-opacity-90 transition-all active:scale-95 shadow-lg shadow-laundry-fresh/20 group"
            title="Finaliser la livraison"
          >
            <CreditCard size={16} strokeWidth={3} className="group-hover:scale-110 transition-transform" />
            <span>Payer & Imprimer</span>
          </button>

          <div className="flex gap-3">
            <button
              onClick={() => onNavigate(primaryAddress)}
              className="flex-1 bg-laundry-sky/30 text-laundry-primary h-12 rounded-2xl flex items-center justify-center gap-2 font-black uppercase tracking-widest text-[9px] hover:bg-laundry-primary hover:text-white transition-all active:scale-95 border border-laundry-sky/50"
              title="Itinéraire Google Maps"
            >
              <Navigation size={14} strokeWidth={3} />
              <span>Google Maps</span>
            </button>

            <button
              onClick={() => onCancel(order)}
              className="flex-1 bg-red-50 text-red-500 h-12 rounded-2xl flex items-center justify-center gap-2 font-black uppercase tracking-widest text-[9px] hover:bg-red-500 hover:text-white transition-all active:scale-95 border border-red-100/50"
              title="Client introuvable"
            >
              <XCircle size={14} strokeWidth={3} />
              <span>Annuler la Livraison</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ReadyForDelivery() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const orders = useSelector(selectReadyForDelivery);
  const preteCount = useSelector(selectPreteCount);
  const loading = useSelector(selectLoading);

  const [searchQuery, setSearchQuery] = useState('');
  const [zoomState, setZoomState] = useState({ isOpen: false, images: [], index: 0 });
  const [paymentState, setPaymentState] = useState({ isOpen: false, order: null, method: 'especes' });
  const [cancelState, setCancelState] = useState({ isOpen: false, orderId: null, orderNum: null });
  const prevPreteCount = useRef(preteCount);

  // 🔄 AUTO-REFRESH: Poll livree (Sorti) orders every 30s
  useEffect(() => {
    const fetchData = () => {
      dispatch(fetchReadyForDelivery());
    };

    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [dispatch]);

  const filteredOrders = useMemo(() => {
    return orders.filter(order =>
      (order.client?.name?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      order.numeroCommande.toString().includes(searchQuery) ||
      (order.client?.addresses?.[0]?.address?.toLowerCase().includes(searchQuery.toLowerCase()))
    ).sort((a, b) => new Date(b.dateCreation) - new Date(a.dateCreation));
  }, [orders, searchQuery]);

  const handleNavigate = (address) => {
    if (!address?.latitude || !address?.longitude) {
      alert("Coordonnées GPS non disponibles pour ce client.");
      return;
    }
    const url = `https://www.google.com/maps/dir/?api=1&destination=${address.latitude},${address.longitude}`;
    window.open(url, '_blank');
  };

  const handlePayment = (order) => {
    setPaymentState({ isOpen: true, order, method: 'especes' });
  };

  const confirmPayment = async () => {
    const { order, method } = paymentState;
    if (!order) return;

    try {
      await dispatch(submitPayment({ orderId: order.id, data: { modePaiement: method } })).unwrap();

      toast.success("Livraison validée avec succès !");

      // Print Receipt
      handlePrintReceipt(order);

      // Close modal and refresh
      setPaymentState({ isOpen: false, order: null, method: 'especes' });
      dispatch(fetchReadyForDelivery());
    } catch (err) {
      toast.error(err || "Erreur lors du paiement");
    }
  };

  const handleCancelRequest = (order) => {
    setCancelState({ isOpen: true, orderId: order.id, orderNum: order.numeroCommande });
  };

  const confirmCancelDelivery = async () => {
    try {
      await dispatch(cancelDelivery(cancelState.orderId)).unwrap();
      toast.success(`Livraison #${cancelState.orderNum} annulée avec succès.`);
      setCancelState({ isOpen: false, orderId: null, orderNum: null });
    } catch (err) {
      toast.error(err || "Erreur lors de l'annulation");
    }
  };

  const handlePrintReceipt = (orderToPrint) => {
    const existingIframe = document.getElementById('print-iframe');
    if (existingIframe) document.body.removeChild(existingIframe);

    const iframe = document.createElement('iframe');
    iframe.id = 'print-iframe';
    iframe.style.position = 'absolute'; iframe.style.width = '0'; iframe.style.height = '0'; iframe.style.border = 'none';
    document.body.appendChild(iframe);

    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Reçu - #${orderToPrint.numeroCommande}</title>
            <style>
                body { font-family: Arial; padding: 40px; color: #000; }
                .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 20px; margin-bottom: 30px; }
                .title { font-size: 20px; font-weight: bold; text-align: center; margin-bottom: 20px; text-decoration: underline; }
                .info-section { display: flex; justify-content: space-between; margin-bottom: 40px; }
                .info-box { width: 45%; font-size: 14px; }
                table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
                th { text-align: left; padding: 10px; background: #f2f2f2; border: 1px solid #ddd; font-size: 14px; }
                td { padding: 10px; border: 1px solid #ddd; font-size: 14px; }
                .total-section { width: 250px; margin-left: auto; border: 2px solid #000; padding: 15px; font-weight: bold; font-size: 18px; }
                .signatures { display: flex; justify-content: space-between; margin-top: 50px; }
                .sig-box { width: 40%; text-align: center; border-top: 1px solid #000; padding-top: 10px; margin-top: 60px; font-size: 12px; }
            </style>
        </head>
        <body>
            <div class="header">
                <h2>PURECLEAN LAUNDRY</h2>
                <p>123 Boulevard de la Propreté, Casablanca<br>Tél: +212 5 22 12 34 56</p>
            </div>
            <div class="title">RECU DE LIVRAISON</div>
            <div class="info-section">
                <div class="info-box">
                    <strong>Client:</strong> ${orderToPrint.client.name.toUpperCase()}<br>
                    <strong>Tél:</strong> ${orderToPrint.client.phones?.[0]?.phoneNumber || ''}<br>
                    <strong>Adresse:</strong> ${orderToPrint.client.addresses?.[0]?.address || ''}
                </div>
                <div class="info-box" style="text-align:right">
                    <strong>Commande:</strong> #${orderToPrint.numeroCommande}<br>
                    <strong>Date:</strong> ${new Date().toLocaleDateString('fr-FR')}
                </div>
            </div>
            <table>
                <thead><tr><th>Article</th><th>Qté</th><th>Total</th></tr></thead>
                <tbody>
                    ${orderToPrint.commandeTapis.map(i => `
                        <tr>
                            <td>${i.tapis.nom.toUpperCase()}</td>
                            <td>${i.quantite}</td>
                            <td>${(i.quantite * i.prixUnitaire).toFixed(2)} DH</td>
                        </tr>`).join('')}
                </tbody>
            </table>
            <div class="total-section">TOTAL: ${orderToPrint.montantTotal.toFixed(2)} DH</div>
            <div class="signatures">
                <div class="sig-box">Livreur</div>
                <div class="sig-box">Client</div>
            </div>
        </body>
        </html>`;

    const doc = iframe.contentWindow || iframe.contentDocument.document || iframe.contentDocument;
    doc.document.open(); doc.document.write(html); doc.document.close();
    setTimeout(() => { iframe.contentWindow.focus(); iframe.contentWindow.print(); }, 500);
  };

  const handleImageZoom = (images, index) => {
    setZoomState({ isOpen: true, images, index });
  };

  return (
    <div className="relative flex flex-col gap-10 p-2 animate-fade-in max-w-[1400px] mx-auto pb-32">

      {/* Zoom Modal */}
      {zoomState.isOpen && (
        <ImageViewer
          images={zoomState.images}
          currentIndex={zoomState.index}
          onClose={() => setZoomState({ ...zoomState, isOpen: false })}
          onNext={(newIdx) => {
            const nextIndex = typeof newIdx === 'number'
              ? newIdx
              : (zoomState.index + 1) % zoomState.images.length;
            setZoomState({ ...zoomState, index: nextIndex });
          }}
          onPrev={() => setZoomState({ ...zoomState, index: (zoomState.index - 1 + zoomState.images.length) % zoomState.images.length })}
        />
      )}

      {/* Payment Selection Modal - Rendered via Portal */}
      {paymentState.isOpen && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-laundry-deep/60 backdrop-blur-md" onClick={() => setPaymentState({ ...paymentState, isOpen: false })}></div>
          <div className="relative bg-white w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-10 text-center">
              <div className="w-20 h-20 bg-laundry-fresh text-white rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                <CreditCard size={40} />
              </div>
              <h3 className="text-2xl font-black text-laundry-deep uppercase tracking-tighter mb-2">Finaliser la Livraison</h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                Êtes-vous sûr de vouloir finaliser cette livraison et imprimer le reçu ?
              </p>
              <p className="text-sm font-black text-laundry-primary uppercase tracking-widest mb-8">
                Commande #{paymentState.order?.numeroCommande} • {paymentState.order?.montantTotal} DH
              </p>

              <div className="grid grid-cols-1 gap-4 mb-10">
                {[
                  { id: 'especes', label: 'Espèces (Cash)', icon: Banknote },
                  { id: 'carte', label: 'Carte (TPE)', icon: CreditCard },
                  { id: 'cheque', label: 'Chèque', icon: FileText }
                ].map(method => (
                  <button
                    key={method.id}
                    onClick={() => setPaymentState({ ...paymentState, method: method.id })}
                    className={`flex items-center justify-between p-6 rounded-2xl border-2 transition-all ${paymentState.method === method.id
                      ? 'border-laundry-primary bg-laundry-sky/10'
                      : 'border-slate-100 bg-slate-50 grayscale opacity-60 hover:grayscale-0 hover:opacity-100'}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl ${paymentState.method === method.id ? 'bg-laundry-primary text-white' : 'bg-white text-slate-400'}`}>
                        <method.icon size={20} />
                      </div>
                      <span className="font-black uppercase tracking-widest text-[11px]">{method.label}</span>
                    </div>
                    {paymentState.method === method.id && <CheckCircle2 className="text-laundry-primary" size={20} />}
                  </button>
                ))}
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setPaymentState({ ...paymentState, isOpen: false })}
                  className="flex-1 py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] text-laundry-deep/40 hover:bg-slate-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={confirmPayment}
                  disabled={loading?.payment}
                  className="flex-1 bg-laundry-fresh text-white py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-laundry-fresh/30 flex items-center justify-center gap-3 hover:scale-105 active:scale-95 transition-all"
                >
                  {loading?.payment ? <Loader2 className="animate-spin" size={20} /> : <><Printer size={18} /> Confirmer & Imprimer</>}
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Cancel Delivery Confirmation Modal - Rendered via Portal */}
      {cancelState.isOpen && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-laundry-deep/80 backdrop-blur-md" onClick={() => setCancelState({ isOpen: false, orderId: null, orderNum: null })}></div>
          <div className="relative bg-white w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-10 text-center">
              <div className="w-20 h-20 bg-red-100 text-red-500 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                <AlertTriangle size={40} />
              </div>
              <h3 className="text-2xl font-black text-laundry-deep uppercase tracking-tighter mb-2">Annuler Livraison</h3>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-8 leading-relaxed">
                Le client pour la commande <span className="text-red-500 font-black">#{cancelState.orderNum}</span> est introuvable ?<br />
                <span className="text-[10px]">Cette action annulera la livraison en cours.</span>
              </p>

              <div className="flex gap-4 mt-8">
                <button
                  onClick={() => setCancelState({ isOpen: false, orderId: null, orderNum: null })}
                  className="flex-1 py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] text-laundry-deep/40 hover:bg-slate-50 transition-colors"
                >
                  Garder en livraison
                </button>
                <button
                  onClick={confirmCancelDelivery}
                  disabled={loading?.action}
                  className="flex-1 bg-red-500 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-red-500/30 flex items-center justify-center gap-3 hover:scale-105 active:scale-95 transition-all"
                >
                  {loading?.action ? <Loader2 className="animate-spin" size={20} /> : <><XCircle size={18} /> Confirmer l'annulation</>}
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b-2 border-laundry-sky/20">
        <div className="space-y-3">
          <h1 className="text-5xl font-black text-laundry-deep uppercase tracking-tighter leading-none">
            Livraisons en Cours
          </h1>
          <div className="flex flex-wrap items-center gap-4">
            <p className="text-sm font-bold text-laundry-deep/40 uppercase tracking-widest">
              Commandes à livrer • <span className="text-laundry-primary">Mises à jour automatique</span>
            </p>
            <DeliveryStatusBadge count={orders.length} />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative group min-w-[260px]">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-laundry-primary transition-transform group-focus-within:scale-110" strokeWidth={3} />
            <input
              type="text"
              placeholder="Nom, Adresse, N° Commande..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border-2 border-laundry-sky rounded-2xl py-4 pl-12 pr-4 font-bold text-laundry-deep text-xs outline-none focus:border-laundry-primary transition-all shadow-sm"
            />
          </div>
          <button
            onClick={() => { dispatch(fetchReadyForDelivery()); dispatch(fetchPreteCount()); }}
            className="p-4 bg-white border-2 border-laundry-sky rounded-2xl text-laundry-primary hover:bg-laundry-sky transition-all active:scale-95 shadow-sm"
          >
            <Loader2 size={24} className={loading?.readyForDelivery ? 'animate-spin' : ''} strokeWidth={3} />
          </button>
        </div>
      </div>

      {/* Main Grid */}
      {loading?.readyForDelivery && orders.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-slate-50 h-[500px] rounded-[2.5rem] animate-pulse border-2 border-slate-100"></div>
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[3rem] border-2 border-dashed border-laundry-sky/40 gap-6">
          <div className="p-8 bg-laundry-sky/20 rounded-full text-laundry-primary">
            <Package size={64} strokeWidth={1.5} />
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-black text-laundry-deep uppercase tracking-tight">Aucune livraison en cours</h3>
            <p className="text-sm font-bold text-laundry-deep/30 uppercase tracking-widest leading-relaxed">
              Vous n'avez pas encore pris en charge de commandes. <br />
              {preteCount > 0
                ? <span className="text-amber-600">🔔 {preteCount} commande(s) prête(s) vous attendent en atelier.</span>
                : 'Dès qu\'une commande sera prête, le badge de notification apparaîtra.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredOrders.map((order) => (
            <DeliveryCard
              key={order.id}
              order={order}
              onNavigate={handleNavigate}
              onPay={handlePayment}
              onCancel={handleCancelRequest}
              onViewDetail={(id) => navigate(`/livreur/delivery/${id}`)}
              onImageClick={handleImageZoom}
            />
          ))}
        </div>
      )}
    </div>
  );
}
