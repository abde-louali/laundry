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
  Locate,
  Search,
  UserPlus,
  ChevronRight,
  UserCheck,
  Trash2,
  Loader2
} from 'lucide-react';
import { registerClient, searchClient } from '../../store/livreur/livreurThunk';
import { selectLoading, selectSearchResult } from '../../store/livreur/livreurSelectors';
import { setPendingClient, clearSearchResult } from '../../store/livreur/livreurSlice';

export default function RegisterClient() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const loading = useSelector(selectLoading);
  const searchResult = useSelector(selectSearchResult);

  const [viewMode, setViewMode] = useState('search'); 
  const [phoneQuery, setPhoneQuery] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    phones: [{ phoneNumber: '' }],
    addresses: [{ address: '', latitude: '', longitude: '', notes: '' }],
  });

  useEffect(() => {
    if (viewMode === 'register' && phoneQuery && formData.phones[0].phoneNumber === '') {
      const newPhones = [...formData.phones];
      newPhones[0].phoneNumber = phoneQuery;
      setFormData(prev => ({ ...prev, phones: newPhones }));
    }
  }, [viewMode, phoneQuery, formData.phones]);

  const [isLocating, setIsLocating] = useState(false);

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

  const handleSubmitRegister = async (e) => {
    e.preventDefault();
    if (!formData.name || formData.phones[0].phoneNumber === '' || formData.addresses[0].address === '') {
      toast.error("Veuillez remplir les champs obligatoires");
      return;
    }

    try {
      await dispatch(registerClient(formData)).unwrap();
      toast.success("Client enregistré avec succès");
      navigate('/livreur/create-order');
    } catch (err) {
      toast.error(err || "Erreur lors de l'enregistrement");
    }
  };

  const addPhoneField = () => {
    setFormData(prev => ({
      ...prev,
      phones: [...prev.phones, { phoneNumber: '' }]
    }));
  };

  const removePhoneField = (index) => {
    if (formData.phones.length > 1) {
      const newPhones = formData.phones.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, phones: newPhones }));
    }
  };

  const updatePhoneField = (index, value) => {
    const newPhones = [...formData.phones];
    newPhones[index].phoneNumber = value;
    setFormData(prev => ({ ...prev, phones: newPhones }));
  };

  const addAddressField = () => {
    setFormData(prev => ({
      ...prev,
      addresses: [...prev.addresses, { address: '', latitude: '', longitude: '', notes: '' }]
    }));
  };

  const removeAddressField = (index) => {
    if (formData.addresses.length > 1) {
      const newAddresses = formData.addresses.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, addresses: newAddresses }));
    }
  };

  const updateAddressField = (index, field, value) => {
    const newAddresses = [...formData.addresses];
    newAddresses[index][field] = value;
    setFormData(prev => ({ ...prev, addresses: newAddresses }));
  };

  const handleSetCurrentLocation = (index) => {
    setIsLocating(true);
    if (!navigator.geolocation) {
      toast.error("Géolocalisation non supportée");
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        updateAddressField(index, 'latitude', position.coords.latitude.toString());
        updateAddressField(index, 'longitude', position.coords.longitude.toString());
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

  return (
    <div className="max-w-xl mx-auto space-y-6 animate-fade-in p-4 sm:p-6 pb-20">

      {/* SELECTION HEADER */}
      <div className="bg-laundry-background border border-laundry-border p-1.5 rounded-lg flex items-center mb-6">
        <button
          onClick={() => { setViewMode('search'); dispatch(clearSearchResult()); }}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-xs font-semibold transition-colors ${viewMode === 'search' ? 'bg-white text-laundry-primary shadow-sm border border-laundry-border' : 'text-laundry-text-secondary hover:text-laundry-text-primary'}`}
        >
          <Search size={16} /> Rechercher
        </button>
        <button
          onClick={() => setViewMode('register')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-xs font-semibold transition-colors ${viewMode === 'register' ? 'bg-white text-laundry-primary shadow-sm border border-laundry-border' : 'text-laundry-text-secondary hover:text-laundry-text-primary'}`}
        >
          <UserPlus size={16} /> Nouveau
        </button>
      </div>

      {/* VIEW: SEARCH MODE */}
      {viewMode === 'search' && (
        <div className="space-y-6 animate-slide-up">
          <div className="mb-2">
            <h2 className="text-2xl font-bold text-laundry-text-primary">Rechercher un Client</h2>
            <p className="text-sm font-medium text-laundry-text-secondary">Entrez son numéro de téléphone ou son nom</p>
          </div>

          <form onSubmit={handleSearch} className="space-y-4">
            <div className="relative">
              <Phone size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-laundry-text-muted" />
              <input
                type="tel"
                placeholder="06XXXXXXXX"
                value={phoneQuery}
                onChange={(e) => setPhoneQuery(e.target.value)}
                className="w-full bg-white border border-laundry-border focus:border-laundry-primary focus:ring-1 focus:ring-laundry-primary rounded-md py-4 pl-12 pr-4 font-bold text-laundry-text-primary outline-none transition-all shadow-sm"
              />
            </div>
            <button
              type="submit"
              disabled={loading?.search}
              className="w-full bg-laundry-primary text-white py-3.5 rounded-md font-semibold text-sm shadow-sm hover:bg-laundry-primary-hover transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading?.search ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <>
                  <Search size={18} />
                  Lancer la recherche
                </>
              )}
            </button>
          </form>

          {/* SEARCH RESULT CARD */}
          {searchResult && (
            <div className="bg-white rounded-xl border border-laundry-border p-6 shadow-sm space-y-6 animate-zoom-in">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-laundry-primary/10 rounded-full flex items-center justify-center text-laundry-primary border border-laundry-primary/20 shrink-0">
                  <UserCheck size={24} />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-laundry-success uppercase tracking-wider bg-laundry-success-light px-2 py-0.5 rounded border border-laundry-success/20">Client Trouvé</span>
                  <h3 className="text-xl font-bold text-laundry-text-primary">{searchResult.name}</h3>
                  <div className="space-y-1 mt-2">
                    {searchResult.phones?.map((p, i) => (
                      <p key={i} className="text-xs font-semibold text-laundry-text-secondary flex items-center gap-1.5">
                        <Phone size={12} className="text-laundry-text-muted" /> {p.phoneNumber}
                      </p>
                    ))}
                    {searchResult.addresses?.map((a, i) => (
                      <p key={i} className="text-xs font-semibold text-laundry-text-secondary flex items-start gap-1.5 line-clamp-2">
                        <MapPin size={12} className="text-laundry-text-muted shrink-0 mt-0.5" /> {a.address}
                      </p>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleSelectExisting(searchResult)}
                className="w-full bg-white border border-laundry-primary text-laundry-primary hover:bg-laundry-background py-3 rounded-md font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
              >
                <span>Sélectionner ce client</span>
                <ChevronRight size={18} />
              </button>
            </div>
          )}

          {!searchResult && !loading?.search && phoneQuery.length >= 8 && (
            <div className="text-center p-8 border border-dashed border-laundry-border rounded-xl space-y-3 bg-laundry-background">
              <UserPlus size={32} className="mx-auto text-laundry-text-muted opacity-50" />
              <p className="text-sm font-semibold text-laundry-text-primary">Client introuvable</p>
              <button
                onClick={() => setViewMode('register')}
                className="text-laundry-primary font-semibold text-sm hover:underline flex items-center justify-center mx-auto gap-1"
              >
                <PlusCircle size={14} /> Créer un nouveau profil
              </button>
            </div>
          )}
        </div>
      )}

      {/* VIEW: REGISTER MODE */}
      {viewMode === 'register' && (
        <form onSubmit={handleSubmitRegister} className="space-y-6 animate-slide-up">
          <div className="mb-2">
            <h2 className="text-2xl font-bold text-laundry-text-primary">Nouveau Client</h2>
            <p className="text-sm font-medium text-laundry-text-secondary">Enregistrez les informations pour la collecte</p>
          </div>

          <div className="bg-white rounded-xl border border-laundry-border p-6 shadow-sm space-y-5">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-laundry-text-secondary">Nom Complet</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-laundry-text-muted" size={18} />
                <input 
                  type="text" 
                  placeholder="Ex: Jean Dupont" 
                  value={formData.name} 
                  onChange={e => setFormData({ ...formData, name: e.target.value })} 
                  className="w-full bg-white border border-laundry-border focus:border-laundry-primary focus:ring-1 focus:ring-laundry-primary p-2.5 pl-10 rounded-md text-sm font-semibold outline-none transition-all" 
                />
              </div>
            </div>

            {/* PHONES SECTION */}
            <div className="space-y-3 pt-4 border-t border-laundry-border">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-laundry-text-secondary">Téléphones</label>
                <button type="button" onClick={addPhoneField} className="text-laundry-primary text-xs font-semibold flex items-center gap-1 hover:underline">
                  <PlusCircle size={14} /> Ajouter
                </button>
              </div>
              {formData.phones.map((phone, index) => (
                <div key={index} className="flex gap-2">
                  <div className="relative flex-1">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-laundry-text-muted" size={18} />
                    <input 
                        type="tel" 
                        placeholder="06XXXXXXXX" 
                        value={phone.phoneNumber} 
                        onChange={e => updatePhoneField(index, e.target.value)} 
                        className="w-full bg-white border border-laundry-border focus:border-laundry-primary focus:ring-1 focus:ring-laundry-primary p-2.5 pl-10 rounded-md text-sm font-semibold outline-none transition-all" 
                    />
                  </div>
                  {formData.phones.length > 1 && (
                    <button type="button" onClick={() => removePhoneField(index)} className="p-2.5 bg-white border border-laundry-border text-laundry-error rounded-md hover:bg-laundry-error/5 transition-colors">
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* ADDRESSES SECTION */}
            <div className="space-y-4 pt-4 border-t border-laundry-border">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-laundry-text-secondary">Adresses</label>
                <button type="button" onClick={addAddressField} className="text-laundry-primary text-xs font-semibold flex items-center gap-1 hover:underline">
                  <PlusCircle size={14} /> Ajouter
                </button>
              </div>
              
              {formData.addresses.map((address, index) => (
                <div key={index} className="bg-laundry-background p-4 rounded-lg space-y-4 border border-laundry-border relative">
                  {formData.addresses.length > 1 && (
                    <button type="button" onClick={() => removeAddressField(index)} className="absolute top-2 right-2 p-1.5 text-laundry-text-muted hover:text-laundry-error transition-colors bg-white rounded-md shadow-sm border border-laundry-border">
                      <Trash2 size={14} />
                    </button>
                  )}
                  
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-laundry-text-secondary uppercase">Adresse {index + 1}</label>
                    <div className="relative">
                      <Navigation className="absolute left-3 top-3 text-laundry-text-muted" size={16} />
                      <textarea 
                          rows="2" 
                          placeholder="Quartier, Rue, Immeuble..." 
                          value={address.address} 
                          onChange={e => updateAddressField(index, 'address', e.target.value)} 
                          className="w-full bg-white border border-laundry-border focus:border-laundry-primary focus:ring-1 focus:ring-laundry-primary p-2.5 pl-10 rounded-md text-sm font-semibold outline-none transition-all resize-none shadow-sm" 
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-laundry-text-secondary uppercase">Notes (facultatif)</label>
                    <input 
                        type="text" 
                        placeholder="Ex: 2ème étage, porte gauche" 
                        value={address.notes} 
                        onChange={e => updateAddressField(index, 'notes', e.target.value)} 
                        className="w-full bg-white border border-laundry-border focus:border-laundry-primary focus:ring-1 focus:ring-laundry-primary p-2.5 rounded-md text-sm font-semibold outline-none transition-all shadow-sm" 
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSetCurrentLocation(index)}
                    className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-md font-semibold text-xs transition-colors border ${address.latitude ? 'bg-green-50 text-green-600 border-green-200' : 'bg-white text-laundry-text-primary border-laundry-border hover:bg-laundry-background'}`}
                  >
                    <Locate size={14} />
                    <span>{address.latitude ? 'Position GPS Capturée' : 'Détecter ma position GPS'}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading?.registerClient}
            className="w-full bg-laundry-primary text-white py-3.5 rounded-md font-bold text-sm shadow-sm hover:bg-laundry-primary-hover transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading?.registerClient ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <>
                <UserPlus size={18} />
                Créer & Continuer
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
