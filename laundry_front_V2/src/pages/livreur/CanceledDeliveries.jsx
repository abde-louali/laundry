import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createPortal } from 'react-dom';
import {
  Phone,
  Navigation,
  Search,
  Package,
  Calendar,
  AlertTriangle,
  RefreshCw,
  XCircle,
  RotateCcw,
  Loader2,
  Maximize2,
  Image as ImageIcon,
  CheckCircle2,
  MapPin,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { toast } from 'react-toastify';
import {
  fetchCanceledDeliveries,
  returnToWorkplace
} from '../../store/livreur/livreurThunk';
import { selectLoading } from '../../store/livreur/livreurSelectors';

// ─── Sub-Components ───────────────────

const ImageViewer = ({ images, onClose, onNext, onPrev, currentIndex }) => {
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
            <ImageIcon size={16} className="text-laundry-primary" />
            <h2 className="text-sm font-bold text-laundry-text-primary">
              {images[currentIndex]?.carpetName || 'Aperçu'}
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
            src={images[currentIndex]?.imageUrl?.startsWith('http') ? images[currentIndex].imageUrl : `${baseUrl}${images[currentIndex]?.imageUrl}`}
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
                  src={img.imageUrl?.startsWith('http') ? img.imageUrl : (`${baseUrl}${img.imageUrl}`)}
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
      <div className="w-full h-40 bg-laundry-background flex flex-col items-center justify-center text-laundry-text-muted border-b border-laundry-border border-dashed">
        <ImageIcon size={24} />
        <span className="text-[10px] font-semibold mt-2 uppercase text-laundry-text-secondary">Aucune Photo</span>
      </div>
    );
  }

  return (
    <div className="relative group w-full h-40 bg-laundry-background overflow-hidden border-b border-laundry-error/20">
      <div className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar h-full filter grayscale-[100%] group-hover:grayscale-0 transition-all duration-300">
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
            <div className="absolute top-2 left-2 px-2 py-0.5 bg-laundry-error text-white rounded text-[10px] font-bold shadow-sm flex items-center gap-1">
              <AlertTriangle size={10} /> Annulée
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

const CanceledCard = ({ order, onReturn, onImageClick }) => {
  const primaryAddress = order.client?.addresses?.[0] || {};
  const phones = order.client?.phones?.map(p => p.phoneNumber).join(' • ') || 'N/A';

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-xl border border-laundry-error/30 shadow-sm flex flex-col overflow-hidden transition-shadow hover:shadow-card relative">
      <div className="absolute top-2 right-2 z-10 w-8 h-8 rounded-full bg-white text-laundry-error border border-laundry-error/20 flex items-center justify-center shadow-sm">
        <XCircle size={16} />
      </div>

      <ImageGallery carpets={order.commandeTapis} onImageClick={onImageClick} />

      <div className="p-4 sm:p-5 flex flex-col flex-1 gap-4">
        {/* Header */}
        <div>
          <h3 className="text-base font-bold text-laundry-text-primary uppercase tracking-tight truncate pb-1 text-laundry-error">
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
          <MapPin size={16} className="text-laundry-text-muted shrink-0 mt-0.5" />
          <div className="space-y-0.5 overflow-hidden">
            <p className="text-[11px] font-bold text-laundry-text-secondary leading-snug line-clamp-2 line-through decoration-laundry-error/30">
              {primaryAddress.address || 'Adresse non spécifiée'}
            </p>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="pt-2 mt-auto">
          <button
            onClick={() => onReturn(order)}
            className="w-full bg-amber-500 text-white py-2.5 rounded-md text-xs font-semibold flex items-center justify-center gap-2 hover:bg-amber-600 shadow-sm transition-colors group"
          >
            <RotateCcw size={16} className="group-hover:-rotate-90 transition-transform" />
            Retourner à l'Atelier
          </button>
        </div>
      </div>
    </div>
  );
};

export default function CanceledDeliveries() {
  const dispatch = useDispatch();
  const orders = useSelector((state) => state.livreur.canceledDeliveries || []);
  const loading = useSelector(selectLoading);

  const [searchQuery, setSearchQuery] = useState('');
  const [zoomState, setZoomState] = useState({ isOpen: false, images: [], index: 0 });
  const [returnState, setReturnState] = useState({ isOpen: false, orderId: null, orderNum: null });

  useEffect(() => {
    dispatch(fetchCanceledDeliveries());
  }, [dispatch]);

  const filteredOrders = useMemo(() => {
    return orders.filter(order =>
      (order.client?.name?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      order.numeroCommande.toString().includes(searchQuery) ||
      (order.client?.addresses?.[0]?.address?.toLowerCase().includes(searchQuery.toLowerCase()))
    ).sort((a, b) => new Date(b.dateCreation) - new Date(a.dateCreation));
  }, [orders, searchQuery]);

  const handleReturnRequest = (order) => {
    setReturnState({ isOpen: true, orderId: order.id, orderNum: order.numeroCommande });
  };

  const confirmReturn = async () => {
    try {
      await dispatch(returnToWorkplace(returnState.orderId)).unwrap();
      toast.success(`Commande #${returnState.orderNum} retournée à l'atelier.`);
      setReturnState({ isOpen: false, orderId: null, orderNum: null });
    } catch (err) {
      toast.error(err || "Erreur lors du retour");
    }
  };

  const handleImageZoom = (images, index) => {
    setZoomState({ isOpen: true, images, index });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in p-4 sm:p-6 pb-20">

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

      {/* Return Confirmation Modal */}
      {returnState.isOpen && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setReturnState({ isOpen: false, orderId: null, orderNum: null })}></div>
          <div className="relative bg-white w-full max-w-sm rounded-xl shadow-modal overflow-hidden animate-zoom-in">
            <div className="p-6 text-center">
              <div className="w-12 h-12 bg-amber-100 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <RotateCcw size={24} />
              </div>
              <h3 className="text-xl font-bold text-laundry-text-primary mb-2">Retourner à l'Atelier</h3>
              <p className="text-sm font-medium text-laundry-text-secondary mb-6">
                Confirmez-vous le retour de la commande <span className="font-bold text-laundry-text-primary">#{returnState.orderNum}</span> à l'atelier ?
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setReturnState({ isOpen: false, orderId: null, orderNum: null })}
                  className="flex-1 py-2.5 rounded-md font-semibold text-sm border border-laundry-border text-laundry-text-primary hover:bg-laundry-background transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={confirmReturn}
                  disabled={loading?.action}
                  className="flex-1 bg-amber-500 text-white py-2.5 rounded-md font-semibold text-sm shadow-sm flex items-center justify-center gap-2 hover:bg-amber-600 transition-colors outline-none disabled:opacity-50"
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
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-laundry-error flex items-center gap-3">
            <AlertTriangle size={24} />
            Livraisons Annulées
            <span className="bg-laundry-error/10 text-laundry-error text-xs font-bold px-2 py-0.5 rounded-full border border-laundry-error/20 inline-flex items-center">
              {orders.length}
            </span>
          </h1>
          <p className="text-sm font-medium text-laundry-text-secondary">
            Retours clients à gérer et ramener à l'atelier
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-laundry-text-muted" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-laundry-border rounded-md py-2 pl-9 pr-3 text-sm focus:outline-none focus:border-laundry-primary focus:ring-1 focus:ring-laundry-primary transition-all shadow-sm"
            />
          </div>
          <button
            onClick={() => dispatch(fetchCanceledDeliveries())}
            title="Rafraîchir"
            className="p-2.5 bg-white border border-laundry-border rounded-md text-laundry-text-secondary hover:text-laundry-primary hover:bg-laundry-background transition-colors shadow-sm shrink-0"
          >
            <RefreshCw size={18} className={loading?.canceledDeliveries ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Main Grid */}
      {loading?.canceledDeliveries && orders.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-laundry-background h-80 rounded-xl animate-pulse border border-laundry-border"></div>
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-laundry-border shadow-sm text-center">
          <div className="p-4 bg-laundry-success-light rounded-full text-laundry-success mb-4 opacity-70">
            <CheckCircle2 size={40} />
          </div>
          <h3 className="text-base font-bold text-laundry-text-primary mb-1">Aucune annulation</h3>
          <p className="text-sm font-medium text-laundry-text-secondary">
            Vous n'avez aucun retour client à gérer actuellement.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {filteredOrders.map((order) => (
            <CanceledCard
              key={order.id}
              order={order}
              onReturn={handleReturnRequest}
              onImageClick={handleImageZoom}
            />
          ))}
        </div>
      )}
    </div>
  );
}
