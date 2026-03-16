import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  User, Phone, MapPin, Navigation, PlusCircle, Locate,
  Search, UserPlus, ChevronRight, UserCheck, Trash2, CheckCircle2
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
  const [isLocating, setIsLocating] = useState(false);

  useEffect(() => {
    if (viewMode === 'register' && phoneQuery && formData.phones[0].phoneNumber === '') {
      const newPhones = [...formData.phones];
      newPhones[0].phoneNumber = phoneQuery;
      setFormData(prev => ({ ...prev, phones: newPhones }));
    }
  }, [viewMode]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!phoneQuery) return toast.warning('Entrez un numéro');
    try {
      const result = await dispatch(searchClient(phoneQuery)).unwrap();
      if (!result?.found) toast.info('Aucun client trouvé avec ce numéro.');
    } catch (err) {
      toast.error(err || 'Erreur de recherche');
    }
  };

  const handleSelectExisting = (client) => {
    dispatch(setPendingClient(client));
    toast.success(`Client ${client.name} sélectionné !`);
    navigate('/livreur/create-order');
  };

  const handleSetCurrentLocation = (index) => {
    setIsLocating(true);
    if (!navigator.geolocation) {
      toast.error('Géolocalisation non supportée'); setIsLocating(false); return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        updateAddressField(index, 'latitude', pos.coords.latitude.toString());
        updateAddressField(index, 'longitude', pos.coords.longitude.toString());
        setIsLocating(false);
        toast.success('Position capturée !');
      },
      () => { toast.error('Erreur de géolocalisation'); setIsLocating(false); },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSubmitRegister = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phones[0].phoneNumber || !formData.addresses[0].address) {
      return toast.error('Veuillez remplir les champs obligatoires');
    }
    try {
      await dispatch(registerClient(formData)).unwrap();
      toast.success('Client enregistré avec succès');
      navigate('/livreur/create-order');
    } catch (err) {
      toast.error(err || "Erreur lors de l'enregistrement");
    }
  };

  const addPhoneField = () => setFormData(p => ({ ...p, phones: [...p.phones, { phoneNumber: '' }] }));
  const removePhoneField = (i) => { if (formData.phones.length > 1) setFormData(p => ({ ...p, phones: p.phones.filter((_, idx) => idx !== i) })); };
  const updatePhoneField = (i, val) => { const arr = [...formData.phones]; arr[i].phoneNumber = val; setFormData(p => ({ ...p, phones: arr })); };
  const addAddressField = () => setFormData(p => ({ ...p, addresses: [...p.addresses, { address: '', latitude: '', longitude: '', notes: '' }] }));
  const removeAddressField = (i) => { if (formData.addresses.length > 1) setFormData(p => ({ ...p, addresses: p.addresses.filter((_, idx) => idx !== i) })); };
  const updateAddressField = (i, field, val) => { const arr = [...formData.addresses]; arr[i][field] = val; setFormData(p => ({ ...p, addresses: arr })); };

  return (
    <div className="max-w-xl mx-auto pb-10">
      {/* Tab Toggle */}
      <div className="bg-gray-100 rounded-xl p-1 flex mb-6">
        {[
          { key: 'search', label: 'Rechercher', icon: Search },
          { key: 'register', label: 'Nouveau Client', icon: UserPlus },
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => { setViewMode(tab.key); if (tab.key === 'search') dispatch(clearSearchResult()); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all ${
                viewMode === tab.key ? 'bg-surface shadow-sm text-primary-600' : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* SEARCH MODE */}
      {viewMode === 'search' && (
        <div className="space-y-5 animate-fade-in">
          <div className="bg-surface rounded-2xl shadow-card p-5">
            <h2 className="text-base font-semibold text-text-primary mb-1">Trouver un client</h2>
            <p className="text-sm text-text-muted mb-4">Recherchez par numéro de téléphone</p>
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  type="tel"
                  placeholder="06XXXXXXXX"
                  value={phoneQuery}
                  onChange={e => setPhoneQuery(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 pl-9 text-sm bg-surface focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 placeholder:text-text-muted min-h-[48px]"
                />
              </div>
              <button
                type="submit"
                disabled={loading?.search}
                className="bg-primary-600 hover:bg-primary-700 text-white rounded-xl px-5 text-sm font-medium flex items-center gap-2 transition-colors min-h-[48px]"
              >
                {loading?.search ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Search size={16} />}
                Rechercher
              </button>
            </form>
          </div>

          {/* Search Result */}
          {searchResult && (
            <div className="bg-surface rounded-2xl shadow-card p-5 animate-fade-in">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-primary-100 text-primary-700 flex items-center justify-center font-semibold text-lg flex-shrink-0">
                  {searchResult.name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Client trouvé</span>
                  </div>
                  <h3 className="font-semibold text-text-primary">{searchResult.name}</h3>
                  {searchResult.phones?.map((p, i) => (
                    <p key={i} className="text-sm text-text-muted flex items-center gap-1 mt-0.5"><Phone size={12} />{p.phoneNumber}</p>
                  ))}
                  {searchResult.addresses?.map((a, i) => (
                    <p key={i} className="text-sm text-text-muted flex items-center gap-1 mt-0.5"><MapPin size={12} />{a.address}</p>
                  ))}
                </div>
              </div>
              <button
                onClick={() => handleSelectExisting(searchResult)}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white rounded-xl py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors min-h-[48px]"
              >
                <CheckCircle2 size={16} />
                Sélectionner ce client
                <ChevronRight size={16} />
              </button>
            </div>
          )}

          {/* No result + create CTA */}
          {!searchResult && !loading?.search && phoneQuery.length >= 8 && (
            <div className="bg-surface rounded-2xl shadow-card p-6 flex flex-col items-center text-center">
              <UserPlus size={36} className="text-text-muted mb-3" />
              <p className="text-sm text-text-muted mb-3">Aucun client trouvé avec ce numéro</p>
              <button
                onClick={() => setViewMode('register')}
                className="bg-primary-50 text-primary-600 border border-primary-200 rounded-xl px-5 py-2.5 text-sm font-medium hover:bg-primary-100 transition-colors"
              >
                Créer un nouveau profil
              </button>
            </div>
          )}
        </div>
      )}

      {/* REGISTER MODE */}
      {viewMode === 'register' && (
        <form onSubmit={handleSubmitRegister} className="space-y-4 animate-fade-in">

          {/* Informations Card */}
          <div className="bg-surface rounded-2xl shadow-card p-5">
            <h3 className="text-sm font-semibold text-text-primary mb-4">Informations</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-text-primary mb-1.5 block">Nom complet *</label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input
                    type="text" placeholder="Ex: Ahmed Ben Ali"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 pl-9 text-sm bg-surface focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 placeholder:text-text-muted min-h-[48px]"
                  />
                </div>
              </div>

              {/* Phones */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm font-medium text-text-primary">Téléphones *</label>
                  <button type="button" onClick={addPhoneField} className="text-primary-600 text-xs flex items-center gap-1 hover:text-primary-700">
                    <PlusCircle size={14} /> Ajouter
                  </button>
                </div>
                <div className="space-y-2">
                  {formData.phones.map((phone, index) => (
                    <div key={index} className="flex gap-2">
                      <div className="relative flex-1">
                        <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                        <input
                          type="tel" placeholder="06XXXXXXXX"
                          value={phone.phoneNumber}
                          onChange={e => updatePhoneField(index, e.target.value)}
                          className="w-full border border-gray-200 rounded-xl px-4 py-3 pl-9 text-sm focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 placeholder:text-text-muted min-h-[48px]"
                        />
                      </div>
                      {formData.phones.length > 1 && (
                        <button type="button" onClick={() => removePhoneField(index)} className="w-11 flex items-center justify-center text-red-400 hover:bg-red-50 rounded-xl transition-colors">
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Address Cards */}
          {formData.addresses.map((address, index) => (
            <div key={index} className="bg-surface rounded-2xl shadow-card p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-text-primary">Adresse {index + 1}</h3>
                {formData.addresses.length > 1 && (
                  <button type="button" onClick={() => removeAddressField(index)} className="text-red-400 hover:text-red-500 text-xs flex items-center gap-1">
                    <Trash2 size={14} /> Supprimer
                  </button>
                )}
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-text-primary mb-1.5 block">Adresse *</label>
                  <div className="relative">
                    <Navigation size={16} className="absolute left-3 top-3.5 text-text-muted" />
                    <textarea
                      rows={2} placeholder="Quartier, Rue, Immeuble..."
                      value={address.address}
                      onChange={e => updateAddressField(index, 'address', e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 pl-9 text-sm resize-none focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 placeholder:text-text-muted"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-text-primary mb-1.5 block">Notes (facultatif)</label>
                  <input
                    type="text" placeholder="Ex: 2ème étage, porte gauche"
                    value={address.notes}
                    onChange={e => updateAddressField(index, 'notes', e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 placeholder:text-text-muted"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleSetCurrentLocation(index)}
                  disabled={isLocating}
                  className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium border transition-colors min-h-[48px] ${
                    address.latitude
                      ? 'bg-green-50 text-green-600 border-green-200'
                      : 'bg-primary-50 text-primary-600 border-primary-200 hover:bg-primary-100'
                  }`}
                >
                  {isLocating ? <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" /> : <Locate size={16} />}
                  {address.latitude ? `GPS: ${parseFloat(address.latitude).toFixed(4)}, ${parseFloat(address.longitude).toFixed(4)}` : 'Capturer Position GPS'}
                </button>
              </div>
            </div>
          ))}

          {/* Add address */}
          <button
            type="button" onClick={addAddressField}
            className="w-full border-2 border-dashed border-gray-200 rounded-xl py-3 text-sm text-text-muted hover:border-primary-300 hover:text-primary-600 transition-colors flex items-center justify-center gap-2"
          >
            <PlusCircle size={16} />
            Ajouter une adresse
          </button>

          <button
            type="submit"
            disabled={loading?.registerClient}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white rounded-xl py-3.5 text-sm font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm min-h-[48px]"
          >
            {loading?.registerClient ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <UserPlus size={16} />}
            Créer Profil &amp; Continuer
          </button>
        </form>
      )}
    </div>
  );
}
