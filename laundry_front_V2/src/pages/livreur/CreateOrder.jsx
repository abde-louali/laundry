import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  Plus, Minus, Trash2, Check, MapPin, Phone,
  Package, DollarSign, Camera, Image as ImageIcon,
  X, Star, ChevronRight, ShoppingBag
} from 'lucide-react';
import { createOrder, uploadImages } from '../../store/livreur/livreurThunk';
import { selectLoading, selectPendingClient } from '../../store/livreur/livreurSelectors';

export default function CreateOrder() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const pendingClient = useSelector(selectPendingClient);
  const loading = useSelector(selectLoading);

  const [carpetItems, setCarpetItems] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCarpet, setNewCarpet] = useState({ nom: '', description: '', prixUnitaire: '', quantite: 1, imageUrls: [], mainImageIndex: 0 });
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    if (!pendingClient && !loading?.pendingClient) {
      toast.warning('Aucun client en attente.');
      navigate('/livreur/dashboard');
    }
  }, [pendingClient, loading, navigate]);

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploadingImage(true);
    try {
      const results = await dispatch(uploadImages(files)).unwrap();
      const newUrls = results.map(r => r.imageUrl);
      setNewCarpet(prev => ({ ...prev, imageUrls: [...prev.imageUrls, ...newUrls] }));
      toast.success(`${files.length} image(s) ajoutée(s)`);
    } catch (err) {
      toast.error("Échec de l'upload: " + err);
    } finally {
      setUploadingImage(false);
      e.target.value = null;
    }
  };

  const removeImage = (i) => setNewCarpet(prev => {
    const urls = prev.imageUrls.filter((_, idx) => idx !== i);
    let main = prev.mainImageIndex;
    if (i === main) main = 0;
    else if (i < main) main--;
    return { ...prev, imageUrls: urls, mainImageIndex: Math.max(0, main) };
  });

  const setMainImage = (i) => setNewCarpet(prev => ({ ...prev, mainImageIndex: i }));

  const resetNewCarpet = () => setNewCarpet({ nom: '', description: '', prixUnitaire: '', quantite: 1, imageUrls: [], mainImageIndex: 0 });

  const handleAddCarpet = () => {
    if (!newCarpet.nom || !newCarpet.prixUnitaire) return toast.warning('Veuillez remplir le nom et le prix');
    const carpet = { id: Date.now(), nom: newCarpet.nom, description: newCarpet.description, prixUnitaire: parseFloat(newCarpet.prixUnitaire), quantite: parseInt(newCarpet.quantite), imageUrls: newCarpet.imageUrls, mainImageIndex: newCarpet.mainImageIndex };
    setCarpetItems([...carpetItems, carpet]);
    resetNewCarpet();
    setShowAddForm(false);
    toast.success('Tapis ajouté');
  };

  const handleRemoveCarpet = (id) => { setCarpetItems(carpetItems.filter(item => item.id !== id)); toast.info('Tapis supprimé'); };

  const handleUpdateQuantity = (id, delta) => setCarpetItems(carpetItems.map(item => item.id === id ? { ...item, quantite: Math.max(1, item.quantite + delta) } : item));

  const totalItems = carpetItems.reduce((s, i) => s + i.quantite, 0);
  const totalPrice = carpetItems.reduce((s, i) => s + i.prixUnitaire * i.quantite, 0);

  const handleCreateOrder = async () => {
    if (!carpetItems.length) return toast.warning('Veuillez ajouter au moins un tapis');
    try {
      await dispatch(createOrder({ clientId: pendingClient.id, tapis: carpetItems.map(item => ({ nom: item.nom, description: item.description || '', prixUnitaire: item.prixUnitaire, quantite: item.quantite, imageUrls: item.imageUrls, mainImageIndex: item.mainImageIndex })) })).unwrap();
      toast.success('Commande créée avec succès !');
      navigate('/livreur/dashboard');
    } catch (err) {
      toast.error(err || 'Erreur lors de la création de la commande');
    }
  };

  if (!pendingClient) return null;

  return (
    <div className="max-w-xl mx-auto pb-32 space-y-4">

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-2">
        {[
          { label: 'Client', done: true },
          { label: 'Articles', active: true },
          { label: 'Résumé', active: false },
        ].map((s, i, arr) => (
          <React.Fragment key={i}>
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
              s.done ? 'bg-green-100 text-green-700' : s.active ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-text-muted'
            }`}>
              {s.done && <Check size={12} />}
              {s.label}
            </div>
            {i < arr.length - 1 && <div className="flex-1 h-px bg-border" />}
          </React.Fragment>
        ))}
      </div>

      {/* Client Summary */}
      <div className="bg-surface rounded-2xl shadow-card p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary-100 text-primary-700 flex items-center justify-center font-semibold flex-shrink-0">
          {pendingClient.name?.[0]?.toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-text-primary truncate">{pendingClient.name}</p>
          {pendingClient.phones?.[0] && (
            <p className="text-xs text-text-muted flex items-center gap-1 mt-0.5"><Phone size={11} />{pendingClient.phones[0].phoneNumber}</p>
          )}
        </div>
        <button onClick={() => navigate('/livreur/register-client')} className="text-xs text-primary-600 hover:text-primary-700 font-medium">Modifier</button>
      </div>

      {/* Carpet Cards */}
      {carpetItems.map((item, idx) => (
        <div key={item.id} className="bg-surface rounded-2xl shadow-card p-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <span className="text-xs text-text-muted uppercase tracking-wide">Tapis #{idx + 1}</span>
              <h4 className="font-semibold text-text-primary">{item.nom}</h4>
            </div>
            <button onClick={() => handleRemoveCarpet(item.id)} className="w-8 h-8 flex items-center justify-center rounded-xl bg-red-50 text-red-400 hover:bg-red-100 transition-colors">
              <X size={15} />
            </button>
          </div>

          {item.imageUrls?.length > 0 && (
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 mb-3">
              {item.imageUrls.map((url, i) => (
                <div key={i} className="relative flex-shrink-0">
                  <img src={url} alt="" className="w-20 h-20 rounded-xl object-cover" />
                  {i === item.mainImageIndex && (
                    <span className="absolute top-1 left-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center">
                      <Star size={11} className="text-white fill-white" />
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
              <button onClick={() => handleUpdateQuantity(item.id, -1)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface transition-colors">
                <Minus size={14} />
              </button>
              <span className="w-8 text-center text-sm font-semibold">{item.quantite}</span>
              <button onClick={() => handleUpdateQuantity(item.id, 1)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface transition-colors">
                <Plus size={14} />
              </button>
            </div>
            <div className="text-right">
              <p className="text-xs text-text-muted">Sous-total</p>
              <p className="font-semibold text-text-primary">{(item.prixUnitaire * item.quantite).toFixed(2)} DH</p>
            </div>
          </div>
        </div>
      ))}

      {/* Add Carpet Form */}
      {showAddForm ? (
        <div className="bg-surface rounded-2xl shadow-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-text-primary">Nouveau Tapis</h3>
            <button onClick={() => { setShowAddForm(false); resetNewCarpet(); }} className="text-text-muted hover:text-text-secondary">
              <X size={18} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-sm font-medium text-text-primary mb-1.5 block">Nom / Type *</label>
              <input type="text" placeholder="Ex: Tapis Berbère" value={newCarpet.nom} onChange={e => setNewCarpet(p => ({ ...p, nom: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 placeholder:text-text-muted min-h-[48px]" />
            </div>
            <div>
              <label className="text-sm font-medium text-text-primary mb-1.5 block">Prix (DH) *</label>
              <div className="relative">
                <DollarSign size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input type="number" placeholder="0.00" value={newCarpet.prixUnitaire} onChange={e => setNewCarpet(p => ({ ...p, prixUnitaire: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 pl-8 text-sm focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 min-h-[48px]" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-text-primary mb-1.5 block">Quantité</label>
              <div className="flex items-center gap-1 border border-gray-200 rounded-xl p-1">
                <button type="button" onClick={() => setNewCarpet(p => ({ ...p, quantite: Math.max(1, p.quantite - 1) }))} className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-background text-text-secondary">
                  <Minus size={14} />
                </button>
                <span className="flex-1 text-center text-sm font-semibold">{newCarpet.quantite}</span>
                <button type="button" onClick={() => setNewCarpet(p => ({ ...p, quantite: p.quantite + 1 }))} className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-background text-text-secondary">
                  <Plus size={14} />
                </button>
              </div>
            </div>
            <div className="col-span-2">
              <label className="text-sm font-medium text-text-primary mb-1.5 block">Notes (facultatif)</label>
              <textarea rows={2} placeholder="Dimensions, état, remarques..." value={newCarpet.description} onChange={e => setNewCarpet(p => ({ ...p, description: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 placeholder:text-text-muted" />
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="text-sm font-medium text-text-primary mb-2 block">Photos</label>
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
              {newCarpet.imageUrls.map((url, i) => (
                <div key={i} className="relative flex-shrink-0 group">
                  <img src={url} alt="" className="w-20 h-20 rounded-xl object-cover" />
                  {i === newCarpet.mainImageIndex && (
                    <span className="absolute top-1 left-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center">
                      <Star size={11} className="text-white fill-white" />
                    </span>
                  )}
                  <div className="absolute inset-0 bg-black/40 rounded-xl opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1 transition-opacity">
                    <button type="button" onClick={() => setMainImage(i)} className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center"><Star size={11} className="text-white" /></button>
                    <button type="button" onClick={() => removeImage(i)} className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center"><X size={11} className="text-white" /></button>
                  </div>
                </div>
              ))}
              <label className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:border-primary-300 hover:bg-primary-50 transition-colors flex-shrink-0">
                {uploadingImage ? <div className="w-5 h-5 border-2 border-primary-300 border-t-primary-600 rounded-full animate-spin" /> : <><Camera size={18} className="text-text-muted mb-1" /><span className="text-[10px] text-text-muted">Ajouter</span></>}
                <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
              </label>
            </div>
          </div>

          <button onClick={handleAddCarpet} className="w-full bg-primary-600 hover:bg-primary-700 text-white rounded-xl py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors min-h-[48px]">
            <Check size={16} />
            Ajouter ce tapis
          </button>
        </div>
      ) : (
        <button onClick={() => setShowAddForm(true)}
          className="w-full border-2 border-dashed border-gray-200 rounded-2xl py-4 flex items-center justify-center gap-2 text-text-muted hover:border-primary-300 hover:text-primary-600 transition-colors">
          <Plus size={18} />
          <span className="text-sm font-medium">Ajouter un tapis</span>
        </button>
      )}

      {/* Sticky Bottom Bar */}
      {carpetItems.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 md:left-16 lg:left-60 bg-surface border-t border-border p-4 z-20">
          <div className="max-w-xl mx-auto flex items-center gap-4">
            <div>
              <p className="text-xs text-text-muted">{totalItems} tapis</p>
              <p className="text-base font-bold text-text-primary">{totalPrice.toFixed(2)} DH</p>
            </div>
            <button
              onClick={handleCreateOrder}
              disabled={loading?.createOrder}
              className="flex-1 bg-primary-600 hover:bg-primary-700 text-white rounded-xl py-3 text-sm font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm"
            >
              {loading?.createOrder ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <ChevronRight size={16} />}
              Finaliser la Commande
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
