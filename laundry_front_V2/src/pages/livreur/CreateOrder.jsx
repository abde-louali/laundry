import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  ArrowLeft,
  Plus,
  Minus,
  Trash2,
  Check,
  MapPin,
  User,
  Package,
  Sparkles,
  ShoppingBag,
  Info,
  DollarSign,
  ClipboardCheck,
  ChevronRight,
  TrendingUp
} from 'lucide-react';
import { createOrder } from '../../store/livreur/livreurThunk';
import { selectLoading, selectPendingClient } from '../../store/livreur/livreurSelectors';

export default function CreateOrder() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const pendingClient = useSelector(selectPendingClient);
  const loading = useSelector(selectLoading);

  const [carpetItems, setCarpetItems] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCarpet, setNewCarpet] = useState({
    nom: '',
    description: '',
    prixUnitaire: '',
    quantite: 1
  });

  useEffect(() => {
    if (!pendingClient && !loading?.pendingClient) {
      toast.warning("Aucun client en attente.");
      navigate('/livreur/dashboard');
    }
  }, [pendingClient, loading, navigate]);

  const handleAddCarpet = () => {
    if (!newCarpet.nom || !newCarpet.prixUnitaire) {
      return toast.warning("Veuillez remplir le nom et le prix");
    }

    const carpet = {
      id: Date.now(),
      nom: newCarpet.nom,
      description: newCarpet.description,
      prixUnitaire: parseFloat(newCarpet.prixUnitaire),
      quantite: parseInt(newCarpet.quantite)
    };

    setCarpetItems([...carpetItems, carpet]);
    resetNewCarpet();
    setShowAddForm(false);
    toast.success("Tapis ajouté");
  };

  const resetNewCarpet = () => {
    setNewCarpet({
      nom: '',
      description: '',
      prixUnitaire: '',
      quantite: 1
    });
  };

  const handleRemoveCarpet = (id) => {
    setCarpetItems(carpetItems.filter(item => item.id !== id));
    toast.info("Tapis supprimé");
  };

  const handleUpdateQuantity = (id, delta) => {
    setCarpetItems(carpetItems.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantite + delta);
        return { ...item, quantite: newQty };
      }
      return item;
    }));
  };

  const totalItems = carpetItems.reduce((sum, item) => sum + item.quantite, 0);
  const totalPrice = carpetItems.reduce((sum, item) => sum + (item.prixUnitaire * item.quantite), 0);

  const handleCreateOrder = async () => {
    if (carpetItems.length === 0) {
      return toast.warning("Veuillez ajouter au moins un tapis");
    }

    const tapisPayload = carpetItems.map(item => ({
      nom: item.nom,
      description: item.description || '',
      prixUnitaire: item.prixUnitaire,
      quantite: item.quantite
    }));

    try {
      await dispatch(createOrder({
        clientId: pendingClient.id,
        tapis: tapisPayload
      })).unwrap();

      toast.success("Commande créée avec succès !");
      navigate('/livreur/dashboard');
    } catch (err) {
      toast.error(err || "Erreur lors de la création de la commande");
    }
  };

  if (!pendingClient) return null;

  return (
    <div className="space-y-10 animate-fade-in pb-40">

      {/* 1. WIZARD PROGRESS HEADER */}
      <div className="flex items-center gap-4 px-2 overflow-x-auto no-scrollbar pb-2">
        {[
          { step: 1, label: 'Client', active: true, done: true },
          { step: 2, label: 'Items', active: true, done: false },
          { step: 3, label: 'Résumé', active: false, done: false },
        ].map((s, i) => (
          <React.Fragment key={i}>
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black ${s.done ? 'bg-laundry-fresh text-white' : s.active ? 'bg-laundry-primary text-white' : 'bg-laundry-sky text-laundry-deep/30'}`}>
                {s.done ? <Check size={14} strokeWidth={4} /> : s.step}
              </div>
              <span className={`text-[10px] font-black uppercase tracking-widest ${s.active ? 'text-laundry-deep' : 'text-laundry-deep/20'}`}>{s.label}</span>
            </div>
            {i < 2 && <div className="w-8 h-px bg-laundry-sky"></div>}
          </React.Fragment>
        ))}
      </div>

      {/* 2. CLIENT CONTEXT SECTION */}
      <section className="animate-slide-up">
        <div className="bg-laundry-deep rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-laundry-deep/20">
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -mr-24 -mt-24 blur-3xl"></div>
          <div className="relative z-10 space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-black text-laundry-fresh uppercase tracking-[0.2em]">Collecte en cours</span>
                <h2 className="text-3xl font-black uppercase tracking-tighter leading-none">{pendingClient.name}</h2>
              </div>
              <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
                <User size={24} className="text-laundry-fresh" />
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/10">
              <MapPin size={18} className="text-laundry-fresh flex-shrink-0" />
              <p className="text-xs font-bold text-white/70 uppercase tracking-tight line-clamp-1">{pendingClient.address}</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. ITEM SELECTION GRID / HEADER */}
      <section className="space-y-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <div className="flex items-center justify-between px-2">
          <div className="flex flex-col">
            <h3 className="text-sm font-black text-laundry-deep uppercase tracking-widest flex items-center gap-2">
              <Package size={18} className="text-laundry-primary" /> Inventaire Collecté
            </h3>
            <span className="text-[10px] font-bold text-laundry-deep/30 uppercase tracking-widest mt-1">Ajoutez les tapis à traiter</span>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg transition-all active:scale-95 ${showAddForm ? 'bg-red-50 text-red-500' : 'bg-laundry-primary text-white shadow-laundry-primary/20'
              }`}
          >
            {showAddForm ? <Minus size={16} strokeWidth={3} /> : <Plus size={16} strokeWidth={3} />}
            <span>{showAddForm ? 'Annuler' : 'Ajouter Tapis'}</span>
          </button>
        </div>

        {/* ADD FORM OVERLAY-LIKE SECTION */}
        {showAddForm && (
          <div className="glass rounded-[2.5rem] p-8 border-laundry-primary/10 shadow-2xl shadow-laundry-primary/10 space-y-8 animate-zoom-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-laundry-deep/40 uppercase tracking-widest ml-1">Type de Tapis</label>
                <input
                  type="text"
                  placeholder="Ex: Salon Oriental"
                  value={newCarpet.nom}
                  onChange={(e) => setNewCarpet({ ...newCarpet, nom: e.target.value })}
                  className="w-full bg-laundry-sky/30 border-2 border-transparent focus:border-laundry-primary focus:bg-white p-4 rounded-2xl outline-none font-bold text-laundry-deep transition-all shadow-inner"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-laundry-deep/40 uppercase tracking-widest ml-1">Prix Estimé (DH)</label>
                <div className="relative">
                  <DollarSign size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-laundry-primary" />
                  <input
                    type="number"
                    placeholder="0.00"
                    value={newCarpet.prixUnitaire}
                    onChange={(e) => setNewCarpet({ ...newCarpet, prixUnitaire: e.target.value })}
                    className="w-full bg-laundry-sky/30 border-2 border-transparent focus:border-laundry-primary focus:bg-white p-4 pl-12 rounded-2xl outline-none font-bold text-laundry-deep transition-all shadow-inner"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-laundry-deep/40 uppercase tracking-widest ml-1">État / Notes</label>
              <textarea
                placeholder="Ex: Taches visibles, bords usés..."
                rows="2"
                value={newCarpet.description}
                onChange={(e) => setNewCarpet({ ...newCarpet, description: e.target.value })}
                className="w-full bg-laundry-sky/30 border-2 border-transparent focus:border-laundry-primary focus:bg-white p-4 rounded-2xl outline-none font-bold text-laundry-deep transition-all shadow-inner resize-none"
              />
            </div>

            <button
              onClick={handleAddCarpet}
              className="w-full bg-laundry-primary text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl hover:bg-laundry-deep transition-all active:scale-95"
            >
              Confirmer l'ajout
            </button>
          </div>
        )}

        {/* BAG REVIEW LIST */}
        <div className="space-y-4">
          {carpetItems.length === 0 ? (
            <div className="py-20 bg-white rounded-[2.5rem] border-2 border-dashed border-laundry-sky flex flex-col items-center justify-center text-center gap-4 text-laundry-deep/20">
              <ShoppingBag size={48} className="opacity-10" />
              <p className="text-[10px] font-black uppercase tracking-widest">Le sac est vide</p>
            </div>
          ) : (
            carpetItems.map((item, idx) => (
              <div key={item.id} className="bg-white rounded-3xl p-6 border border-laundry-sky/50 shadow-sm flex items-center gap-6 group hover:shadow-lg transition-all">
                <div className="w-14 h-14 bg-laundry-sky rounded-2xl flex items-center justify-center text-laundry-primary font-black text-xl">
                  {idx + 1}
                </div>
                <div className="flex-1 space-y-1 overflow-hidden">
                  <h4 className="font-black text-laundry-deep uppercase tracking-tighter truncate">{item.nom}</h4>
                  <div className="flex items-center gap-3">
                    <span className="text-[9px] font-bold text-laundry-primary bg-laundry-sky px-2 py-0.5 rounded-full uppercase tracking-widest">{item.prixUnitaire} DH/u</span>
                    {item.description && <span className="text-[9px] font-bold text-laundry-deep/40 truncate italic">"{item.description}"</span>}
                  </div>
                </div>

                {/* QUANTITY CONTROLS */}
                <div className="flex items-center gap-3 bg-laundry-sky/50 p-1.5 rounded-2xl">
                  <button
                    onClick={() => handleUpdateQuantity(item.id, -1)}
                    disabled={item.quantite <= 1}
                    className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-laundry-deep/30 hover:text-red-500 transition-all disabled:opacity-0"
                  >
                    <Minus size={14} strokeWidth={4} />
                  </button>
                  <span className="w-6 text-center text-xs font-black text-laundry-deep">{item.quantite}</span>
                  <button
                    onClick={() => handleUpdateQuantity(item.id, 1)}
                    className="w-8 h-8 rounded-xl bg-laundry-primary text-white flex items-center justify-center shadow-md shadow-laundry-primary/20 active:scale-90 transition-all"
                  >
                    <Plus size={14} strokeWidth={4} />
                  </button>
                </div>

                <button
                  onClick={() => handleRemoveCarpet(item.id)}
                  className="p-3 text-red-300 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))
          )}
        </div>
      </section>

      {/* 4. STICKY FOOTER SUMMARY */}
      {carpetItems.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-6 z-50 pointer-events-none md:ml-64">
          <div className="max-w-xl mx-auto glass rounded-[2.5rem] border-2 border-white/60 shadow-2xl p-6 pointer-events-auto overflow-hidden animate-slide-up">
            <div className="absolute top-0 right-0 w-32 h-32 bg-laundry-fresh/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>

            <div className="flex items-center justify-between mb-6 px-2 relative z-10">
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-laundry-deep/40 uppercase tracking-[0.2em]">Total Articles</span>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-black text-laundry-deep">{totalItems}</span>
                  <span className="text-[10px] font-black text-laundry-deep/30 uppercase tracking-widest mt-1">Tapis</span>
                </div>
              </div>

              <div className="flex flex-col items-end">
                <span className="text-[10px] font-black text-laundry-primary uppercase tracking-[0.2em]">Estimation Finale</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-laundry-primary tracking-tighter">{totalPrice.toFixed(0)}</span>
                  <span className="text-xs font-black text-laundry-primary uppercase tracking-widest">DH</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleCreateOrder}
              disabled={loading?.createOrder}
              className="w-full bg-laundry-fresh text-white py-5 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-sm shadow-xl shadow-laundry-fresh/20 hover:bg-laundry-deep transition-all active:scale-95 flex items-center justify-center gap-3 relative z-10 overflow-hidden group"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform"></div>
              {loading?.createOrder ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <ClipboardCheck size={20} strokeWidth={3} />
                  <span>Valider la Collecte</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
