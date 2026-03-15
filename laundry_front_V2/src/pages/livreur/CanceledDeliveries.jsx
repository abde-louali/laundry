import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
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
  Truck,
  RotateCcw,
  Loader2,
  Maximize2,
  ImageIcon,
  CheckCircle2
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
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-500 overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-laundry-deep/90 backdrop-blur-2xl" onClick={onClose}></div>

      {/* Top Bar Navigation */}
      <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-black/80 to-transparent flex items-center justify-between px-8 z-10 transition-opacity hover:opacity-100">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
            <ImageIcon className="text-white" size={24} strokeWidth={1.5} />
          </div>
          <div>
            <h3 className="text-white font-black text-lg uppercase tracking-widest">{images[currentIndex]?.carpetName || 'Aperçu'}</h3>
            <p className="text-white/50 text-[10px] uppercase tracking-[0.3em] font-bold">Image {currentIndex + 1} de {images.length}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-12 h-12 bg-white text-laundry-deep hover:bg-laundry-primary hover:text-white hover:scale-110 active:scale-95 transition-all rounded-full flex items-center justify-center font-black shadow-2xl border-2 border-white/20 group"
          title="Fermer"
        >
          <XCircle size={24} strokeWidth={3} className="group-hover:rotate-90 transition-transform" />
        </button>
      </div>

      {/* Main Image Area */}
      <div className="relative w-full max-w-6xl flex-1 flex items-center justify-center px-4 py-24 select-none">
        <img
          src={images[currentIndex]?.imageUrl?.startsWith('http') ? images[currentIndex].imageUrl : `${baseUrl}${images[currentIndex]?.imageUrl}`}
          alt="Preview"
          className="max-h-full max-w-full object-contain drop-shadow-2xl transition-transform duration-500"
        />

        {/* Navigation Overlays */}
        {images.length > 1 && (
          <>
            {/* Left Zone */}
            <div
              className="absolute left-0 inset-y-0 w-1/4 cursor-w-resize group flex items-center justify-start px-8"
              onClick={(e) => { e.stopPropagation(); onPrev(); }}
            >
              <div className="w-16 h-16 rounded-full bg-black/40 backdrop-blur-xl text-white border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all shadow-2xl">
                {/* Simulated Left Arrow */}
                <div className="w-4 h-4 border-t-4 border-l-4 border-white rotate-[-45deg] ml-2"></div>
              </div>
            </div>

            {/* Right Zone */}
            <div
              className="absolute right-0 inset-y-0 w-1/4 cursor-e-resize group flex items-center justify-end px-8"
              onClick={(e) => { e.stopPropagation(); onNext(); }}
            >
              <div className="w-16 h-16 rounded-full bg-black/40 backdrop-blur-xl text-white border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all shadow-2xl">
                {/* Simulated Right Arrow */}
                <div className="w-4 h-4 border-t-4 border-r-4 border-white rotate-[45deg] mr-2"></div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Bottom Bar Thumbnail Navigation */}
      <div className="absolute bottom-0 inset-x-0 max-h-40 bg-gradient-to-t from-black/90 to-transparent flex flex-col items-center justify-end pb-8 z-10">
        <div className="w-full max-w-3xl px-12">
          {/* Progress Bar Container */}
          <div className="w-full flex items-center gap-4 mb-6 relative">
            <span className="text-white/40 text-[10px] font-black tracking-widest">1</span>
            <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden flex">
              {images.map((_, idx) => (
                <div
                  key={idx}
                  className={`flex-1 h-full mx-[1px] rounded-full transition-all duration-300 ${idx === currentIndex ? 'bg-white shadow-[0_0_10px_white]' : idx < currentIndex ? 'bg-white/40' : 'bg-transparent'}`}
                />
              ))}
            </div>
            <span className="text-white/40 text-[10px] font-black tracking-widest">{images.length}</span>
          </div>

          <div className="flex gap-3 overflow-x-auto no-scrollbar justify-center px-4 snap-x">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={(e) => { e.stopPropagation(); onNext(idx); }}
                className={`relative h-20 w-32 rounded-2xl overflow-hidden shrink-0 snap-start transition-all duration-300 focus:outline-none 
                  ${idx === currentIndex
                    ? 'ring-4 ring-white scale-110 shadow-2xl z-10'
                    : 'ring-1 ring-white/20 opacity-50 hover:opacity-100 object-cover'}`}
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

          <p className="text-center text-[8px] font-black text-white/20 uppercase tracking-[0.6em] mt-6">
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
    <div className="relative group w-full h-56 bg-white rounded-t-[2.5rem] overflow-hidden border-b border-red-500/10">
      <div className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar h-full filter grayscale-[30%] group-hover:grayscale-0 transition-all duration-500">
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
            <div className="absolute inset-0 bg-gradient-to-t from-red-900/60 via-transparent to-transparent opacity-80"></div>

            <div className="absolute top-4 left-6 px-3 py-1 bg-red-950/40 backdrop-blur-md rounded-full border border-red-500/30">
              <p className="text-[9px] font-bold text-red-50 uppercase tracking-widest flex items-center gap-1">
                <AlertTriangle size={10} /> Annulée
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

const CanceledCard = ({ order, onNavigate, onReturn, onImageClick }) => {
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
    <div className="group bg-white rounded-[2.5rem] border-2 border-red-100 shadow-xl shadow-red-500/5 hover:shadow-2xl hover:shadow-red-500/10 transition-all duration-300 flex flex-col overflow-hidden relative">
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <div className="w-10 h-10 rounded-full bg-red-50 text-red-500 border border-red-100 backdrop-blur-sm flex items-center justify-center shadow-lg shadow-red-500/10">
          <XCircle size={18} strokeWidth={3} />
        </div>
      </div>

      <ImageGallery carpets={order.commandeTapis} onImageClick={onImageClick} />

      <div className="p-6 flex flex-col flex-1 space-y-5">
        {/* Header: Client */}
        <div className="flex justify-between items-start gap-4">
          <div className="space-y-1.5 flex-1">
            <h3 className="text-xl font-black text-laundry-deep uppercase tracking-tighter transition-colors leading-tight">
              {order.client?.name || 'Client Inconnu'}
            </h3>
            <div className="flex items-center gap-2 text-[10px] font-black text-red-500 uppercase tracking-widest">
              <Phone size={12} strokeWidth={3} />
              <span>{phones}</span>
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-3 pb-2 border-b border-red-500/5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center text-red-400">
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
        <div className="bg-slate-50 rounded-2xl p-4 flex flex-col gap-3 border border-slate-100">
          <div className="flex items-start gap-3">
            <MapPin size={18} className="text-slate-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-[11px] font-bold text-slate-500 leading-relaxed uppercase tracking-tight line-clamp-2 line-through decoration-red-500/30">
                {primaryAddress.address || 'Adresse non spécifiée'}
              </p>
            </div>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="pt-2 mt-auto">
          <button
            onClick={() => onReturn(order)}
            className="w-full bg-amber-500 text-white h-14 rounded-2xl flex items-center justify-center gap-2 font-black uppercase tracking-widest text-[10px] hover:bg-amber-600 transition-all active:scale-95 shadow-lg shadow-amber-500/20 group border-b-4 border-amber-600"
            title="Retourner à l'atelier"
          >
            <RotateCcw size={16} strokeWidth={3} className="group-hover:-rotate-180 transition-transform duration-500" />
            <span>Retourner à l'Atelier</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// Quick MapPin since I didn't import it directly above
const MapPin = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

// ─── Main Component ───────────────────────────────────────────────────────────

export default function CanceledDeliveries() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Assuming you added canceledDeliveries array to Livreur state next to readyForDelivery
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

      {/* Return Confirmation Modal - Rendered via Portal */}
      {returnState.isOpen && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-laundry-deep/80 backdrop-blur-md" onClick={() => setReturnState({ isOpen: false, orderId: null, orderNum: null })}></div>
          <div className="relative bg-white w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-10 text-center">
              <div className="w-20 h-20 bg-amber-100 text-amber-500 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-inner shadow-amber-500/20">
                <RotateCcw size={40} />
              </div>
              <h3 className="text-2xl font-black text-laundry-deep uppercase tracking-tighter mb-2">Retourner à l'Atelier</h3>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-8 leading-relaxed">
                Confirmez-vous le retour de la commande <span className="text-amber-500 font-black">#{returnState.orderNum}</span> à l'atelier ?<br />
                <span className="text-[10px]">L'atelier sera notifié qu'elle est "En Attente".</span>
              </p>

              <div className="flex gap-4 mt-8">
                <button
                  onClick={() => setReturnState({ isOpen: false, orderId: null, orderNum: null })}
                  className="flex-1 py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] text-laundry-deep/40 hover:bg-slate-50 transition-colors"
                >
                  Annuler l'action
                </button>
                <button
                  onClick={confirmReturn}
                  disabled={loading?.action}
                  className="flex-1 bg-amber-500 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-amber-500/30 flex items-center justify-center gap-3 hover:scale-105 active:scale-95 transition-all outline-none border-b-4 border-amber-600"
                >
                  {loading?.action ? <Loader2 className="animate-spin" size={20} /> : <><RotateCcw size={18} /> Confirmer le Retour</>}
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b-2 border-red-500/20">
        <div className="space-y-3">
          <h1 className="text-5xl font-black text-red-500 uppercase tracking-tighter leading-none flex items-center gap-4">
            <AlertTriangle className="text-red-400" size={40} strokeWidth={3} />
            Annulées
          </h1>
          <div className="flex flex-wrap items-center gap-4">
            <p className="text-sm font-bold text-laundry-deep/40 uppercase tracking-widest">
              Retours à gérer • <span className="text-red-400">Action requise</span>
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-500 rounded-full border border-red-100 animate-fade-in">
              <span className="text-[10px] font-black uppercase tracking-widest">
                {orders.length} {orders.length > 1 ? 'Commandes' : 'Commande'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative group min-w-[300px]">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-red-300 transition-transform group-focus-within:scale-110" strokeWidth={3} />
            <input
              type="text"
              placeholder="Chercher une annulation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border-2 border-red-100 rounded-2xl py-4 pl-12 pr-4 font-bold text-laundry-deep text-xs outline-none focus:border-red-400 transition-all shadow-sm"
            />
          </div>
          <button
            onClick={() => dispatch(fetchCanceledDeliveries())}
            className="p-4 bg-white border-2 border-red-100 rounded-2xl text-red-400 hover:bg-red-50 transition-all active:scale-95 shadow-sm"
          >
            <RefreshCw size={24} className={loading?.canceledDeliveries ? 'animate-spin' : ''} strokeWidth={3} />
          </button>
        </div>
      </div>

      {/* Main Grid */}
      {loading?.canceledDeliveries && orders.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-slate-50 h-[350px] rounded-[2.5rem] animate-pulse border-2 border-slate-100"></div>
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[3rem] border-2 border-dashed border-red-100 gap-6">
          <div className="p-8 bg-green-50 rounded-full text-green-500 border border-green-100">
            <CheckCircle2 size={64} strokeWidth={1.5} />
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-black text-laundry-deep uppercase tracking-tight">Aucune commande annulée</h3>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
              Toutes les livraisons se déroulent sans problème.<br />
              C'est une excellente journée !
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
