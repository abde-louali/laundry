import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  User,
  Phone,
  MapPin,
  Navigation,
  PlusCircle,
  ArrowLeft,
  Sparkles,
  Locate,
  CheckCircle2,
  Info,
  Search,
  UserPlus,
  ChevronRight,
  UserCheck
} from 'lucide-react';
import { registerClient, searchClient } from '../../store/livreur/livreurThunk';
import { selectLoading, selectSearchResult } from '../../store/livreur/livreurSelectors';
import { setPendingClient, clearSearchResult } from '../../store/livreur/livreurSlice';

export default function RegisterClient() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const loading = useSelector(selectLoading);
  const searchResult = useSelector(selectSearchResult);

  const [viewMode, setViewMode] = useState('search'); // 'search' or 'register'
  const [phoneQuery, setPhoneQuery] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    latitude: '',
    longitude: '',
  });

  const [isLocating, setIsLocating] = useState(false);

  // Auto-fill phone from search if moving to register
  useEffect(() => {
    if (viewMode === 'register' && phoneQuery && !formData.phone) {
      setFormData(prev => ({ ...prev, phone: phoneQuery }));
    }
  }, [viewMode, phoneQuery, formData.phone]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!phoneQuery) return toast.warning("Entrez un numéro");

    try {
      const result = await dispatch(searchClient(phoneQuery)).unwrap();
      if (!result?.found) {
        toast.info("Aucun client trouvé avec ce numéro.");
      }
    } catch (err) {
      toast.error(err || "Erreur de recherche");
    }
  };

  const handleSelectExisting = (client) => {
    dispatch(setPendingClient(client));
    toast.success(`Client ${client.name} sélectionné !`);
    navigate('/livreur/create-order');
  };

  const handleGetLocation = () => {
    setIsLocating(true);
    if (!navigator.geolocation) {
      toast.error("Géolocalisation non supportée");
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData(prev => ({
          ...prev,
          latitude: position.coords.latitude.toString(),
          longitude: position.coords.longitude.toString()
        }));
        setIsLocating(false);
        toast.success("Position capturée !");
      },
      (error) => {
        toast.error("Erreur de géolocalisation");
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSubmitRegister = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.address) {
      toast.error("Veuillez remplir les champs obligatoires");
      return;
    }

    try {
      await dispatch(registerClient(formData)).unwrap();
      toast.success("Client enregistré avec succès");
      navigate('/livreur/create-order'); // Go straight to order creation
    } catch (err) {
      toast.error(err || "Erreur lors de l'enregistrement");
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-100px)] animate-fade-in flex flex-col">

      {/* 1. SELECTION HEADER (Search vs Register) */}
      <div className="bg-white border-b border-laundry-sky/50 p-4 sticky top-0 z-30">
        <div className="max-w-md mx-auto flex bg-laundry-sky/30 p-1.5 rounded-2xl">
          <button
            onClick={() => { setViewMode('search'); dispatch(clearSearchResult()); }}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'search' ? 'bg-white text-laundry-primary shadow-xl' : 'text-laundry-deep/40'}`}
          >
            <Search size={14} /> Rechercher
          </button>
          <button
            onClick={() => setViewMode('register')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'register' ? 'bg-white text-laundry-primary shadow-xl' : 'text-laundry-deep/40'}`}
          >
            <UserPlus size={14} /> Nouveau
          </button>
        </div>
      </div>

      <div className="flex-1 max-w-xl mx-auto w-full p-4 md:p-8 space-y-10">

        {/* VIEW: SEARCH MODE */}
        {viewMode === 'search' && (
          <div className="space-y-10 animate-slide-up">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-black text-laundry-deep uppercase tracking-tighter">Trouver un <span className="text-laundry-primary">Client</span></h2>
              <p className="text-[10px] font-black text-laundry-deep/30 uppercase tracking-[0.2em]">Saisissez son numéro de téléphone</p>
            </div>

            <form onSubmit={handleSearch} className="space-y-4">
              <div className="relative group">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-laundry-primary">
                  <Phone size={24} strokeWidth={3} />
                </div>
                <input
                  type="tel"
                  placeholder="06XXXXXXXX"
                  value={phoneQuery}
                  onChange={(e) => setPhoneQuery(e.target.value)}
                  className="w-full bg-white border-2 border-laundry-sky rounded-[2rem] p-6 pl-16 text-xl font-black text-laundry-deep outline-none focus:border-laundry-primary transition-all shadow-2xl shadow-laundry-primary/5 placeholder:text-laundry-deep/10"
                />
              </div>
              <button
                type="submit"
                disabled={loading?.search}
                className="w-full bg-laundry-deep text-white py-6 rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-2xl shadow-laundry-deep/20 hover:bg-laundry-primary transition-all active:scale-95 flex items-center justify-center gap-3"
              >
                {loading?.search ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Search size={20} strokeWidth={3} />
                    <span>Lancer la recherche</span>
                  </>
                )}
              </button>
            </form>

            {/* SEARCH RESULT CARD */}
            {searchResult && (
              <div className="glass bg-white rounded-[2.5rem] p-8 md:p-10 border-white shadow-2xl shadow-laundry-primary/10 space-y-8 animate-zoom-in relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-laundry-primary/5 rounded-full -mr-16 -mt-16 animate-pulse"></div>

                <div className="flex items-center gap-6 relative z-10">
                  <div className="w-20 h-20 bg-laundry-sky rounded-[1.5rem] flex items-center justify-center text-laundry-primary shadow-inner">
                    <UserCheck size={40} strokeWidth={3} />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-laundry-primary uppercase tracking-widest">Client Trouvé</span>
                    <h3 className="text-2xl font-black text-laundry-deep uppercase tracking-tighter leading-none">{searchResult.name}</h3>
                    <p className="text-[10px] font-bold text-laundry-deep/40 uppercase tracking-widest flex items-center gap-1">
                      <Phone size={10} /> {searchResult.phone}
                    </p>
                    <p className="text-[10px] font-bold text-laundry-deep/40 uppercase tracking-widest flex items-center gap-1">
                      <MapPin size={10} /> {searchResult.address}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleSelectExisting(searchResult)}
                  className="w-full bg-laundry-fresh text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-xl hover:bg-laundry-primary transition-all active:scale-95"
                >
                  <span>Sélectionner ce client</span>
                  <ChevronRight size={20} strokeWidth={3} />
                </button>
              </div>
            )}

            {!searchResult && !loading?.search && phoneQuery.length >= 8 && (
              <div className="text-center p-10 border-2 border-dashed border-laundry-sky rounded-[2rem] space-y-4">
                <UserPlus size={48} className="mx-auto text-laundry-deep/10" />
                <p className="text-[10px] font-black text-laundry-deep/30 uppercase tracking-widest">Client inconnu ?</p>
                <button
                  onClick={() => setViewMode('register')}
                  className="text-laundry-primary font-black uppercase tracking-widest text-xs hover:underline"
                >
                  Créer un nouveau profil
                </button>
              </div>
            )}
          </div>
        )}

        {/* VIEW: REGISTER MODE */}
        {viewMode === 'register' && (
          <form onSubmit={handleSubmitRegister} className="space-y-10 animate-slide-up">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-black text-laundry-deep uppercase tracking-tighter">Nouveau <span className="text-laundry-primary">Profil</span></h2>
              <p className="text-[10px] font-black text-laundry-deep/30 uppercase tracking-[0.2em]">Enregistrez les détails du ramassage</p>
            </div>

            {/* GPS MAP CONTEXT (Mini version) */}
            <div className="h-48 bg-laundry-sky/50 rounded-[2.5rem] p-6 relative overflow-hidden flex flex-col justify-end">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-20">
                <MapPin size={64} className="text-laundry-primary" />
              </div>
              <button
                type="button"
                onClick={handleGetLocation}
                disabled={isLocating}
                className={`relative z-10 w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl transition-all active:scale-95 ${formData.latitude ? 'bg-green-500 text-white' : 'bg-laundry-primary text-white'}`}
              >
                {isLocating ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Locate size={18} strokeWidth={3} />}
                <span>{formData.latitude ? 'Position Capturée' : 'Capturer GPS'}</span>
              </button>
            </div>

            <div className="space-y-6">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-laundry-deep/30 px-2 uppercase tracking-widest">Nom Complet</label>
                <div className="relative">
                  <User className="absolute left-5 top-1/2 -translate-y-1/2 text-laundry-primary" size={18} />
                  <input type="text" placeholder="Ex: Jean Dupont" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-white border-2 border-laundry-sky/50 focus:border-laundry-primary p-5 pl-14 rounded-2xl font-bold outline-none transition-all shadow-sm" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-laundry-deep/30 px-2 uppercase tracking-widest">Téléphone</label>
                <div className="relative">
                  <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-laundry-primary" size={18} />
                  <input type="tel" placeholder="06XXXXXXXX" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="w-full bg-white border-2 border-laundry-sky/50 focus:border-laundry-primary p-5 pl-14 rounded-2xl font-bold outline-none transition-all shadow-sm" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-laundry-deep/30 px-2 uppercase tracking-widest">Adresse Physique</label>
                <div className="relative">
                  <Navigation className="absolute left-5 top-5 text-laundry-primary" size={18} />
                  <textarea rows="3" placeholder="Quartier, Rue, Immeuble..." value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} className="w-full bg-white border-2 border-laundry-sky/50 focus:border-laundry-primary p-5 pl-14 rounded-2xl font-bold outline-none transition-all shadow-sm resize-none" />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading?.registerClient}
              className="w-full bg-laundry-deep text-white py-6 rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-2xl shadow-laundry-deep/20 hover:bg-laundry-primary transition-all active:scale-95 flex items-center justify-center gap-3"
            >
              {loading?.registerClient ? (
                <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <UserPlus size={20} strokeWidth={3} />
                  <span>Créer Profile & Continuer</span>
                </>
              )}
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
