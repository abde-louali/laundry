import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  MapPin,
  Package,
  ChevronRight,
  Phone,
  Navigation,
  Sparkles,
  Search,
  CheckCircle2,
  CreditCard,
  Image as ImageIcon,
  Loader2,
  X,
  Maximize2,
  Calendar,
  Banknote,
  FileText,
  Printer,
  AlertTriangle,
  ChevronLeft,
  XCircle
} from 'lucide-react';

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
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>

      {/* Main Container */}
      <div className="relative w-full max-w-5xl bg-white rounded-xl shadow-modal flex flex-col overflow-hidden animate-zoom-in">
        <div className="flex items-center justify-between p-4 border-b border-laundry-border">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-laundry-primary" />
            <h2 className="text-sm font-bold text-laundry-text-primary">
              {images[currentIndex]?.carpetName || 'Image Tapis'} • {images[currentIndex]?.imageType || 'VUE'}
            </h2>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-laundry-background rounded-full text-laundry-text-secondary transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="relative h-[60vh] bg-laundry-background flex items-center justify-center p-4">
          {images.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); onPrev(); }}
              className="absolute left-4 p-2 bg-white/80 hover:bg-white rounded-full shadow-sm text-laundry-text-primary transition-colors z-10 hidden sm:block"
            >
              <ChevronLeft size={24} />
            </button>
          )}

          <img
            src={images[currentIndex]?.imageUrl?.startsWith('http') ? images[currentIndex].imageUrl : (images[currentIndex]?.imageUrl ? `${baseUrl}${images[currentIndex].imageUrl}` : '')}
            alt="Preview"
            className="max-w-full max-h-full object-contain shadow-sm"
          />

          {images.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); onNext(); }}
              className="absolute right-4 p-2 bg-white/80 hover:bg-white rounded-full shadow-sm text-laundry-text-primary transition-colors z-10 hidden sm:block"
            >
              <ChevronRight size={24} />
            </button>
          )}
        </div>

        {images.length > 1 && (
          <div className="p-4 border-t border-laundry-border bg-white flex justify-center gap-2 overflow-x-auto no-scrollbar">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => onNext(idx)}
                className={`w-16 h-16 shrink-0 rounded-md overflow-hidden border-2 transition-all ${idx === currentIndex ? 'border-laundry-primary shadow-sm' : 'border-transparent opacity-50 hover:opacity-100'}`}
              >
                <img
                  src={img.imageUrl?.startsWith('http') ? img.imageUrl : (img.imageUrl ? `${baseUrl}${img.imageUrl}` : '')}
                  className="w-full h-full object-cover"
                  alt="Thumb"
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

const ImageGallery = ({ carpets, onImageClick }) => {
  const baseUrl = "http://localhost:8080";

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
      <div className="w-full h-40 bg-laundry-background flex flex-col items-center justify-center text-laundry-text-muted border-b border-laundry-border">
        <ImageIcon size={24} />
        <span className="text-[10px] font-semibold mt-2 uppercase">Aucune Photo</span>
      </div>
    );
  }

  return (
    <div className="relative group w-full h-40 bg-laundry-background overflow-hidden border-b border-laundry-border">
      <div className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar h-full">
        {allImages.map((img, idx) => (
          <div
            key={idx}
            className="min-w-full h-full snap-start cursor-pointer relative"
            onClick={() => onImageClick(allImages, idx)}
          >
            <img
              src={img.imageUrl?.startsWith('http') ? img.imageUrl : `${baseUrl}${img.imageUrl}`}
              alt={img.carpetName}
              className="w-full h-full object-cover"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/50 text-white rounded text-[10px] font-bold backdrop-blur-sm shadow-sm">
              {img.carpetName || 'Tapis'} • {img.imageType || 'Vue'}
            </div>
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
              <Maximize2 size={24} className="text-white opacity-0 group-hover:opacity-100 drop-shadow-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const DeliveryCard = ({ order, onNavigate, onPay, onCancel, onImageClick }) => {
  const primaryAddress = order.client?.addresses?.[0] || {};
  const phones = order.client?.phones?.map(p => p.phoneNumber).join(' • ') || 'N/A';

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-xl border border-laundry-border shadow-card flex flex-col overflow-hidden transition-shadow hover:shadow-lg">
      <ImageGallery carpets={order.commandeTapis} onImageClick={onImageClick} />

      <div className="p-4 sm:p-5 flex flex-col flex-1 gap-4">
        {/* Header */}
        <div>
            <h3 className="text-base font-bold text-laundry-text-primary uppercase tracking-tight truncate pb-1">
              {order.client?.name || 'Client Inconnu'}
            </h3>
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-laundry-text-secondary w-full truncate">
              <Phone size={12} className="shrink-0" />
              <span className="truncate">{phones}</span>
            </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-3 py-3 border-y border-laundry-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-laundry-background flex items-center justify-center text-laundry-text-muted shrink-0">
              <Package size={14} />
            </div>
            <div className="min-w-0 pr-1">
              <p className="text-[10px] font-semibold text-laundry-text-secondary uppercase">Cmd</p>
              <p className="text-xs font-bold text-laundry-text-primary truncate">#{order.numeroCommande}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-laundry-background flex items-center justify-center text-laundry-text-muted shrink-0">
              <Calendar size={14} />
            </div>
            <div className="min-w-0 pr-1">
              <p className="text-[10px] font-semibold text-laundry-text-secondary uppercase">Date</p>
              <p className="text-xs font-bold text-laundry-text-primary truncate">{formatDate(order.dateCreation)}</p>
            </div>
          </div>
        </div>

        {/* Address Box */}
        <div className="bg-laundry-background rounded-lg p-3 flex gap-3 border border-laundry-border">
          <MapPin size={16} className="text-laundry-primary shrink-0 mt-0.5" />
          <div className="space-y-0.5 overflow-hidden">
            <p className="text-[11px] font-bold text-laundry-text-primary leading-snug line-clamp-2">
              {primaryAddress.address || 'Adresse non spécifiée'}
            </p>
            {primaryAddress.notes && (
              <p className="text-[10px] font-medium text-laundry-text-secondary italic line-clamp-1">
                Note: {primaryAddress.notes}
              </p>
            )}
          </div>
        </div>

        {/* Amount Row */}
        <div className="flex items-center justify-between pb-1">
          <span className="text-[10px] font-bold text-laundry-text-secondary uppercase tracking-wider">A Encaisser</span>
          <span className="text-lg font-bold text-laundry-primary">{order.montantTotal} <span className="text-sm">DH</span></span>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 mt-auto">
          <button
            onClick={() => onPay(order)}
            className="w-full bg-laundry-success text-white py-2.5 rounded-md text-xs font-bold flex items-center justify-center gap-2 shadow-sm hover:bg-opacity-90 transition-opacity"
          >
            <CreditCard size={16} />
            Payer & Imprimer
          </button>

          <div className="flex gap-2">
            <button
              onClick={() => onNavigate(primaryAddress)}
              className="flex-1 bg-white border border-laundry-border text-laundry-text-primary py-2.5 rounded-md text-xs font-semibold flex items-center justify-center gap-2 hover:bg-laundry-background shadow-sm transition-colors"
            >
              <Navigation size={14} />
              GPS
            </button>
            <button
              onClick={() => onCancel(order)}
              className="flex-1 bg-white border border-laundry-error text-laundry-error py-2.5 rounded-md text-xs font-semibold flex items-center justify-center gap-2 hover:bg-laundry-error/5 shadow-sm transition-colors"
            >
              <XCircle size={14} />
              Annuler
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

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

  // 🔄 AUTO-REFRESH
  useEffect(() => {
    const fetchData = () => { dispatch(fetchReadyForDelivery()); dispatch(fetchPreteCount()); };
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
      toast.warning("Coordonnées GPS non disponibles.");
      return;
    }
    const url = `https://www.google.com/maps/dir/?api=1&destination=${address.latitude},${address.longitude}`;
    window.open(url, '_blank');
  };

  const handlePayment = (order) => setPaymentState({ isOpen: true, order, method: 'especes' });

  const confirmPayment = async () => {
    const { order, method } = paymentState;
    if (!order) return;
    try {
      await dispatch(submitPayment({ orderId: order.id, data: { modePaiement: method } })).unwrap();
      toast.success("Livraison validée !");
      handlePrintReceipt(order);
      setPaymentState({ isOpen: false, order: null, method: 'especes' });
      dispatch(fetchReadyForDelivery());
    } catch (err) {
      toast.error(err || "Erreur de paiement");
    }
  };

  const handleCancelRequest = (order) => setCancelState({ isOpen: true, orderId: order.id, orderNum: order.numeroCommande });

  const confirmCancelDelivery = async () => {
    try {
      await dispatch(cancelDelivery(cancelState.orderId)).unwrap();
      toast.success(`Livraison #${cancelState.orderNum} annulée.`);
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
                body { font-family: sans-serif; padding: 20px; font-size: 12px; }
                .text-center { text-align: center; }
                .fw-bold { font-weight: bold; }
                .mb-1 { margin-bottom: 5px; }
                .mb-3 { margin-bottom: 15px; }
                .border-bottom { border-bottom: 1px dashed #000; padding-bottom: 10px; margin-bottom: 10px; }
                table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
                th, td { text-align: left; padding: 5px 0; border-bottom: 1px solid #eee; }
                .total { font-size: 16px; font-weight: bold; border-top: 2px solid #000; padding-top: 10px; text-align: right; }
            </style>
        </head>
        <body>
            <div class="text-center mb-3">
                <h2 style="margin:0 0 5px 0">PURECLEAN</h2>
                <p style="margin:0">Tél: +212 5 22 12 34 56</p>
                <p style="margin:0">Date: ${new Date().toLocaleDateString('fr-FR')} ${new Date().toLocaleTimeString('fr-FR')}</p>
            </div>
            <div class="border-bottom">
                <p class="mb-1"><span class="fw-bold">Client:</span> ${orderToPrint.client.name}</p>
                <p class="mb-1"><span class="fw-bold">Tél:</span> ${orderToPrint.client.phones?.[0]?.phoneNumber || '-'}</p>
                <p class="mb-1"><span class="fw-bold">Cmd #:</span> ${orderToPrint.numeroCommande}</p>
            </div>
            <table>
                <thead><tr><th>Article</th><th>Qté</th><th style="text-align:right">S.Total</th></tr></thead>
                <tbody>
                    ${orderToPrint.commandeTapis.map(i => `
                        <tr>
                            <td>${i.tapis.nom}</td>
                            <td>${i.quantite}</td>
                            <td style="text-align:right">${(i.quantite * i.prixUnitaire).toFixed(2)} DH</td>
                        </tr>`).join('')}
                </tbody>
            </table>
            <div class="total">TOTAL: ${orderToPrint.montantTotal.toFixed(2)} DH</div>
            <p class="text-center" style="margin-top: 30px; font-style: italic;">Merci de votre confiance.</p>
        </body>
        </html>`;

    const doc = iframe.contentWindow || iframe.contentDocument.document || iframe.contentDocument;
    doc.document.open(); doc.document.write(html); doc.document.close();
    setTimeout(() => { iframe.contentWindow.focus(); iframe.contentWindow.print(); }, 500);
  };

  const handleImageZoom = (images, index) => setZoomState({ isOpen: true, images, index });

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in p-4 sm:p-6 pb-20">
      
      {/* Zoom Modal */}
      {zoomState.isOpen && (
        <ImageViewer
          images={zoomState.images}
          currentIndex={zoomState.index}
          onClose={() => setZoomState({ ...zoomState, isOpen: false })}
          onNext={(idx) => setZoomState({ ...zoomState, index: typeof idx === 'number' ? idx : (zoomState.index + 1) % zoomState.images.length })}
          onPrev={() => setZoomState({ ...zoomState, index: (zoomState.index - 1 + zoomState.images.length) % zoomState.images.length })}
        />
      )}

      {/* Payment Selection Modal */}
      {paymentState.isOpen && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setPaymentState({ ...paymentState, isOpen: false })}></div>
          <div className="relative bg-white w-full max-w-sm rounded-xl shadow-modal overflow-hidden animate-zoom-in">
            <div className="p-6">
              <h3 className="text-xl font-bold text-laundry-text-primary mb-1">Finaliser la Livraison</h3>
              <p className="text-xs font-semibold text-laundry-text-secondary mb-4">Commande #{paymentState.order?.numeroCommande} • <span className="text-laundry-primary">{paymentState.order?.montantTotal} DH</span></p>

              <div className="space-y-3 mb-6">
                {[
                  { id: 'especes', label: 'Espèces (Cash)', icon: Banknote },
                  { id: 'carte', label: 'Carte (TPE)', icon: CreditCard },
                  { id: 'cheque', label: 'Chèque', icon: FileText }
                ].map(method => (
                  <button
                    key={method.id}
                    onClick={() => setPaymentState({ ...paymentState, method: method.id })}
                    className={`flex items-center gap-3 w-full p-3 rounded-lg border text-sm font-semibold transition-colors ${paymentState.method === method.id
                      ? 'border-laundry-primary bg-blue-50 text-laundry-primary'
                      : 'border-laundry-border bg-white text-laundry-text-secondary hover:bg-laundry-background'}`}
                  >
                    <method.icon size={18} />
                    <span>{method.label}</span>
                    {paymentState.method === method.id && <CheckCircle2 className="ml-auto" size={18} />}
                  </button>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setPaymentState({ ...paymentState, isOpen: false })}
                  className="flex-1 py-2.5 rounded-md font-semibold text-sm border border-laundry-border text-laundry-text-primary hover:bg-laundry-background transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={confirmPayment}
                  disabled={loading?.payment}
                  className="flex-1 bg-laundry-success text-white py-2.5 rounded-md font-semibold text-sm flex items-center justify-center gap-2 hover:bg-opacity-90 transition-colors disabled:opacity-50"
                >
                  {loading?.payment ? <Loader2 className="animate-spin" size={16} /> : <><Printer size={16} /> Imprimer</>}
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Cancel Delivery Modal */}
      {cancelState.isOpen && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setCancelState({ isOpen: false, orderId: null, orderNum: null })}></div>
          <div className="relative bg-white w-full max-w-sm rounded-xl shadow-modal overflow-hidden animate-zoom-in">
            <div className="p-6 text-center">
              <div className="w-12 h-12 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-xl font-bold text-laundry-text-primary mb-2">Annuler la livraison</h3>
              <p className="text-sm font-medium text-laundry-text-secondary mb-6">
                Voulez-vous vraiment annuler la livraison de la commande <span className="font-bold">#{cancelState.orderNum}</span> ?
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setCancelState({ isOpen: false, orderId: null, orderNum: null })}
                  className="flex-1 py-2.5 rounded-md font-semibold text-sm border border-laundry-border text-laundry-text-primary hover:bg-laundry-background transition-colors"
                >
                  Garder
                </button>
                <button
                  onClick={confirmCancelDelivery}
                  disabled={loading?.action}
                  className="flex-1 bg-laundry-error text-white py-2.5 rounded-md font-semibold text-sm flex items-center justify-center gap-2 hover:bg-opacity-90 transition-colors disabled:opacity-50"
                >
                  {loading?.action ? <Loader2 className="animate-spin" size={16} /> : "Confirmer"}
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="text-2xl font-bold text-laundry-text-primary flex items-center gap-3">
            Livraisons à Domicile
            <span className="bg-blue-50 text-laundry-primary text-xs font-bold px-2 py-0.5 rounded-full border border-blue-100">
              {filteredOrders.length} prêtes
            </span>
          </h1>
          {preteCount > 0 && (
             <p className="text-xs font-semibold text-amber-600 flex items-center gap-1 mt-1 bg-amber-50 inline-flex px-2 py-0.5 rounded border border-amber-200">
                <AlertTriangle size={12} /> {preteCount} commande(s) prête(s) en atelier
             </p>
          )}
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-laundry-text-muted" />
            <input
              type="text"
              placeholder="Rechercher (Nom, N° Cmd...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-laundry-border rounded-md py-2 pl-9 pr-3 text-sm focus:outline-none focus:border-laundry-primary focus:ring-1 focus:ring-laundry-primary transition-all shadow-sm"
            />
          </div>
          <button
            onClick={() => { dispatch(fetchReadyForDelivery()); dispatch(fetchPreteCount()); }}
            className="p-2.5 bg-white border border-laundry-border rounded-md text-laundry-text-secondary hover:text-laundry-primary hover:bg-laundry-background transition-colors shadow-sm shrink-0"
          >
            <Loader2 size={18} className={loading?.readyForDelivery ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Main Grid */}
      {loading?.readyForDelivery && orders.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-laundry-background h-80 rounded-xl animate-pulse border border-laundry-border"></div>
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-laundry-border shadow-sm text-center">
          <div className="p-4 bg-laundry-background rounded-full text-laundry-text-muted mb-4 opacity-50">
            <Package size={40} />
          </div>
          <h3 className="text-base font-bold text-laundry-text-primary mb-1">Aucune livraison en cours</h3>
          <p className="text-sm font-medium text-laundry-text-secondary max-w-sm">
            Vous n'avez pas de commandes à livrer actuellement.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredOrders.map((order) => (
            <DeliveryCard
              key={order.id}
              order={order}
              onNavigate={handleNavigate}
              onPay={handlePayment}
              onCancel={handleCancelRequest}
              onImageClick={handleImageZoom}
            />
          ))}
        </div>
      )}
    </div>
  );
}
