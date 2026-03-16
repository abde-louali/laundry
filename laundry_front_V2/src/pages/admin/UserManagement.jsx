import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchActiveUsers,
  fetchInactiveUsers,
  createNewUser,
  updateExistingUser,
  deactivateUser,
  reactivateUser,
  removeUser,
} from '../../store/admin/adminThunk';
import {
  UserPlus, Edit2, Trash2, Shield, Power, Search, Users,
  CheckCircle2, ChevronRight, Activity, History, Lock, Loader2
} from 'lucide-react';
import { clearError, clearSuccess } from '../../store/admin/adminSlice';
import ConfirmModal from '../../components/ui/ConfirmModal';

const UserManagement = () => {
  const dispatch = useDispatch();
  const { activeUsers, inactiveUsers, loading, error, success } = useSelector((state) => state.admin);

  const [activeTab, setActiveTab] = useState('active');
  const [selectedUser, setSelectedUser] = useState(null);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'warning',
    onConfirm: null
  });

  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', role: 'employe', password: ''
  });

  useEffect(() => {
    dispatch(fetchActiveUsers());
    dispatch(fetchInactiveUsers());
  }, [dispatch]);

  useEffect(() => {
    if (success) {
      dispatch(fetchActiveUsers());
      dispatch(fetchInactiveUsers());
      setIsAddingUser(false);
      setConfirmModal(prev => ({ ...prev, isOpen: false }));
      const timer = setTimeout(() => dispatch(clearSuccess()), 3000);
      return () => clearTimeout(timer);
    }
  }, [success, dispatch]);

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setIsAddingUser(false);
    setFormData({
      name: user.name, email: user.email, phone: user.phone, role: user.role, password: ''
    });
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    const { password, ...dataWithoutPassword } = formData;
    dispatch(updateExistingUser({ id: selectedUser.id, data: dataWithoutPassword }));
  };

  const handleCreate = (e) => {
    e.preventDefault();
    dispatch(createNewUser(formData));
  };

  const handleToggleStatus = (user, isActive) => {
    setConfirmModal({
      isOpen: true,
      title: isActive ? 'Désactiver le compte ?' : 'Réactiver le compte ?',
      message: `${user.name} ne pourra plus se connecter. Confirmer ?`,
      type: isActive ? 'warning' : 'success',
      onConfirm: () => {
        dispatch(isActive ? deactivateUser(user.id) : reactivateUser(user.id));
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const currentUsers = (activeTab === 'active' ? activeUsers : inactiveUsers) || [];
  const filteredUsers = currentUsers.filter(u =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-60px)] -m-4 sm:-m-6 lg:-m-8 bg-laundry-background">
      
      {/* LEFT: MASTER LIST */}
      <aside className="w-full lg:w-[380px] bg-white border-r border-laundry-border flex flex-col h-full shrink-0">
        <div className="p-4 sm:p-6 border-b border-laundry-border">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-laundry-text-primary tracking-tight">Utilisateurs</h2>
            <button
              onClick={() => { setIsAddingUser(true); setSelectedUser(null); setFormData({ name: '', email: '', phone: '', role: 'employe', password: '' }); }}
              className="px-3 py-1.5 bg-laundry-primary text-white rounded-md text-sm font-medium hover:bg-laundry-primary-light transition-colors flex items-center gap-2"
            >
              <UserPlus size={16} /> <span className="hidden sm:inline">Nouveau</span>
            </button>
          </div>

          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-laundry-text-muted" size={16} />
            <input
              type="text"
              placeholder="Rechercher par nom ou email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-laundry-background border border-laundry-border rounded-md py-2 pl-9 pr-4 text-sm font-medium text-laundry-text-primary focus:border-laundry-primary focus:ring-1 focus:ring-laundry-primary outline-none transition-all placeholder:text-laundry-text-muted"
            />
          </div>

          <div className="flex bg-laundry-background p-1 rounded-md border border-laundry-border">
            {['active', 'inactive'].map(t => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={`flex-1 py-1.5 rounded text-xs font-semibold uppercase tracking-wider transition-colors ${activeTab === t ? 'bg-white text-laundry-primary shadow-sm' : 'text-laundry-text-secondary hover:text-laundry-text-primary'}`}
              >
                {t === 'active' ? 'Actifs' : 'Inactifs'}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto w-full">
          {loading && filteredUsers.length === 0 ? (
            <div className="flex justify-center p-8"><Loader2 className="animate-spin text-laundry-primary" /></div>
          ) : filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center text-laundry-text-muted">
              <Users size={32} className="mb-2 opacity-50" />
              <p className="text-sm font-medium">Aucun utilisateur trouvé</p>
            </div>
          ) : (
            <div className="divide-y divide-laundry-border">
              {filteredUsers.map(user => (
                <div
                  key={user.id}
                  onClick={() => handleSelectUser(user)}
                  className={`flex items-center gap-3 p-4 cursor-pointer transition-colors ${selectedUser?.id === user.id ? 'bg-blue-50/50' : 'hover:bg-laundry-background/50'}`}
                >
                  <div className={`w-10 h-10 rounded-full flex flex-shrink-0 items-center justify-center font-bold text-sm text-white ${activeTab === 'active' ? 'bg-laundry-primary' : 'bg-laundry-text-muted'}`}>
                    {user.name[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-laundry-text-primary truncate">{user.name}</p>
                    <p className="text-xs text-laundry-text-secondary capitalize truncate">{user.role}</p>
                  </div>
                  {selectedUser?.id === user.id && <ChevronRight size={16} className="text-laundry-primary flex-shrink-0" />}
                </div>
              ))}
            </div>
          )}
        </div>
      </aside>

      {/* RIGHT: DETAIL / EDIT VIEW */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        {!selectedUser && !isAddingUser ? (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-sm mx-auto animate-fade-in">
            <div className="w-16 h-16 bg-white rounded-full shadow-card flex items-center justify-center mb-6 text-laundry-text-muted">
              <Shield size={32} />
            </div>
            <h3 className="text-xl font-bold text-laundry-text-primary mb-2">Gestion des accès</h3>
            <p className="text-sm text-laundry-text-secondary leading-relaxed">
              Sélectionnez un membre de votre équipe dans la liste de gauche pour configurer ses permissions, ou ajoutez un nouveau profil.
            </p>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-6 animate-slide-up">
            {/* HEADER */}
            <div className="bg-white border border-laundry-border rounded-xl shadow-card p-6 flex flex-col sm:flex-row items-center sm:items-start gap-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-laundry-primary to-laundry-accent"></div>
              <div className="w-20 h-20 bg-laundry-background rounded-full border border-laundry-border flex items-center justify-center flex-shrink-0 text-3xl font-bold text-laundry-primary mt-2 sm:mt-0">
                {isAddingUser ? <UserPlus size={32} /> : selectedUser?.name[0].toUpperCase()}
              </div>
              <div className="text-center sm:text-left pt-2">
                <h2 className="text-2xl font-bold text-laundry-text-primary">
                  {isAddingUser ? 'Nouveau Collaborateur' : selectedUser.name}
                </h2>
                <div className="flex flex-wrap justify-center sm:justify-start gap-3 mt-3">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-laundry-background rounded text-xs font-semibold text-laundry-text-secondary uppercase tracking-wider border border-laundry-border">
                    <Shield size={14} /> {isAddingUser ? 'À définir' : selectedUser.role}
                  </span>
                  {!isAddingUser && (
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold uppercase tracking-wider border ${activeTab === 'active' ? 'bg-laundry-success-light text-laundry-success border-laundry-success/20' : 'bg-laundry-error-light text-laundry-error border-laundry-error/20'}`}>
                      <Activity size={14} /> {activeTab === 'active' ? 'Opérationnel' : 'Désactivé'}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* FORM */}
              <div className="lg:col-span-2 bg-white border border-laundry-border rounded-xl shadow-card p-6">
                <div className="flex items-center gap-2 mb-6 border-b border-laundry-border pb-4">
                  <Edit2 size={18} className="text-laundry-text-muted" />
                  <h3 className="font-semibold text-laundry-text-primary">Informations du Profil</h3>
                </div>

                <form onSubmit={isAddingUser ? handleCreate : handleUpdate} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-laundry-text-secondary mb-1">Nom Complet</label>
                    <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-white border border-laundry-border focus:border-laundry-primary focus:ring-1 focus:ring-laundry-primary rounded-md px-3 py-2 text-sm outline-none transition-all shadow-sm" placeholder="Ex: Jean Dupont" required />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-laundry-text-secondary mb-1">Adresse Email</label>
                    <input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full bg-white border border-laundry-border focus:border-laundry-primary focus:ring-1 focus:ring-laundry-primary rounded-md px-3 py-2 text-sm outline-none transition-all shadow-sm" placeholder="email@exemple.com" required />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-laundry-text-secondary mb-1">Téléphone</label>
                      <input type="tel" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="w-full bg-white border border-laundry-border focus:border-laundry-primary focus:ring-1 focus:ring-laundry-primary rounded-md px-3 py-2 text-sm outline-none transition-all shadow-sm" placeholder="06..." required />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-laundry-text-secondary mb-1">Rôle</label>
                      <select value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })} className="w-full bg-white border border-laundry-border focus:border-laundry-primary focus:ring-1 focus:ring-laundry-primary rounded-md px-3 py-2 text-sm outline-none transition-all shadow-sm">
                        <option value="employe">Employé</option>
                        <option value="livreur">Livreur</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                  </div>
                  {isAddingUser && (
                    <div>
                      <label className="block text-xs font-semibold text-laundry-text-secondary mb-1">Mot de Passe Provisoire</label>
                      <input type="password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} className="w-full bg-white border border-laundry-border focus:border-laundry-primary focus:ring-1 focus:ring-laundry-primary rounded-md px-3 py-2 text-sm outline-none transition-all shadow-sm" required />
                    </div>
                  )}
                  
                  <div className="pt-4 border-t border-laundry-border mt-6">
                    <button type="submit" disabled={loading} className="w-full bg-laundry-primary text-white py-2.5 rounded-md text-sm font-semibold hover:bg-laundry-primary-light transition-colors disabled:opacity-50 shadow-sm">
                      {loading ? 'Enregistrement...' : isAddingUser ? 'Créer le compte' : 'Sauvegarder les modifications'}
                    </button>
                  </div>
                </form>
              </div>

              {/* SECURITY ACTIONS */}
              <div className="space-y-6">
                {!isAddingUser && (
                  <div className="bg-white border border-laundry-border rounded-xl shadow-card p-6">
                    <div className="flex items-center gap-2 mb-6 border-b border-laundry-border pb-4">
                      <Lock size={18} className="text-laundry-text-muted" />
                      <h3 className="font-semibold text-laundry-text-primary">Sécurité</h3>
                    </div>
                    <div className="space-y-3">
                      <button
                        onClick={() => handleToggleStatus(selectedUser, activeTab === 'active')}
                        className={`w-full py-4 border rounded-md flex flex-col items-center justify-center gap-2 transition-colors ${activeTab === 'active' ? 'bg-laundry-error-light border-laundry-error/20 text-laundry-error hover:bg-laundry-error hover:text-white' : 'bg-laundry-success-light border-laundry-success/20 text-laundry-success hover:bg-laundry-success hover:text-white'}`}
                      >
                        <Power size={20} />
                        <span className="font-semibold text-sm">{activeTab === 'active' ? 'Désactiver le compte' : 'Réactiver le compte'}</span>
                      </button>

                      {activeTab === 'inactive' && (
                        <button
                          onClick={() => { setConfirmModal({ isOpen: true, title: 'Suppression Définitive', message: `Supprimer ${selectedUser.name} de la base de données ?`, type: 'danger', onConfirm: () => { dispatch(removeUser(selectedUser.id)); setSelectedUser(null); setConfirmModal(prev => ({ ...prev, isOpen: false })); } }); }}
                          className="w-full py-2.5 bg-white border border-laundry-error text-laundry-error rounded-md text-sm font-semibold hover:bg-laundry-error hover:text-white transition-colors"
                        >
                          Supprimer définitivement
                        </button>
                      )}
                    </div>
                  </div>
                )}

                <div className="bg-white border border-laundry-border rounded-xl shadow-card p-6">
                  <div className="flex items-center gap-2 mb-4 border-b border-laundry-border pb-4">
                    <History size={18} className="text-laundry-text-muted" />
                    <h3 className="font-semibold text-laundry-text-primary">Journal d'Audit</h3>
                  </div>
                  <div className="space-y-0 relative">
                    <div className="absolute left-[7px] top-2 bottom-2 w-px bg-laundry-border"></div>
                    {[
                      { action: 'Connexion réussie', date: 'Aujourd\'hui', type: 'success' },
                      { action: 'Profil modifié', date: 'Il y a 2 jours', type: 'info' },
                    ].map((log, i) => (
                      <div key={i} className="flex items-start gap-4 py-3 relative z-10">
                        <div className="w-3.5 h-3.5 rounded-full bg-white border-2 border-laundry-text-muted mt-1 shadow-sm"></div>
                        <div>
                          <p className="text-sm font-medium text-laundry-text-primary">{log.action}</p>
                          <p className="text-xs text-laundry-text-secondary mt-0.5">{log.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
      />
    </div>
  );
};

export default UserManagement;
