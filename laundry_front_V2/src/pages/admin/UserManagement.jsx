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
  UserPlus,
  Edit2,
  Trash2,
  Phone,
  Mail,
  Shield,
  Power,
  AlertTriangle,
  X,
  Search,
  Users,
  CheckCircle2,
  XCircle,
  ChevronRight,
  MoreVertical,
  Activity,
  History,
  Lock,
  UserCheck,
  Loader2
} from 'lucide-react';
import { clearError, clearSuccess } from '../../store/admin/adminSlice';
import ConfirmModal from '../../components/ui/ConfirmModal';

const UserManagement = () => {
  const dispatch = useDispatch();
  const { activeUsers, inactiveUsers, loading, error, success, message } = useSelector((state) => state.admin);

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
    name: '',
    email: '',
    phone: '',
    role: 'employe',
    password: ''
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
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      password: ''
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
      title: isActive ? 'Désactiver ?' : 'Réactiver ?',
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
    <div className="flex flex-col lg:flex-row h-[calc(100vh-100px)] -m-4 md:-m-8 overflow-hidden animate-fade-in">

      {/* 1. MASTER: USER LIST (LEFT) */}
      <section className="w-full lg:w-[400px] border-r border-laundry-sky bg-white/50 backdrop-blur-sm flex flex-col">
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-laundry-deep uppercase tracking-tighter">Équipe</h2>
            <button
              onClick={() => { setIsAddingUser(true); setSelectedUser(null); setFormData({ name: '', email: '', phone: '', role: 'employe', password: '' }); }}
              className="p-2 bg-laundry-primary text-white rounded-xl shadow-lg shadow-laundry-primary/20 hover:scale-110 transition-transform"
            >
              <UserPlus size={18} strokeWidth={3} />
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-laundry-deep/20" size={16} />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border-2 border-laundry-sky rounded-2xl p-3 pl-11 text-xs font-bold text-laundry-deep outline-none focus:border-laundry-primary transition-all shadow-inner"
            />
          </div>

          {/* SMALL TABS */}
          <div className="flex bg-laundry-sky/50 p-1 rounded-xl">
            {['active', 'inactive'].map(t => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === t ? 'bg-white text-laundry-primary shadow-sm' : 'text-laundry-deep/30'}`}
              >
                {t === 'active' ? 'Actifs' : 'Inactifs'}
              </button>
            ))}
          </div>
        </div>

        {/* SCROLLABLE LIST */}
        <div className="flex-1 overflow-y-auto no-scrollbar px-4 pb-10 space-y-2">
          {loading && filteredUsers.length === 0 ? (
            <div className="flex justify-center p-10"><Loader2 className="animate-spin text-laundry-primary" /></div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-20 opacity-20"><Users size={48} className="mx-auto" /><p className="text-[10px] mt-2 font-black uppercase">Vide</p></div>
          ) : (
            filteredUsers.map(user => (
              <div
                key={user.id}
                onClick={() => handleSelectUser(user)}
                className={`flex items-center gap-4 p-4 rounded-3xl cursor-pointer transition-all border-2 ${selectedUser?.id === user.id ? 'bg-white border-laundry-primary shadow-xl scale-[1.02]' : 'bg-transparent border-transparent hover:bg-white/40'}`}
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-white shadow-md ${activeTab === 'active' ? 'bg-laundry-primary' : 'bg-slate-400'}`}>
                  {user.name[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-black text-laundry-deep truncate uppercase tracking-tight">{user.name}</h4>
                  <span className="text-[9px] font-bold text-laundry-deep/30 uppercase tracking-widest">{user.role}</span>
                </div>
                <ChevronRight size={16} className={`${selectedUser?.id === user.id ? 'text-laundry-primary' : 'text-laundry-deep/10'}`} />
              </div>
            ))
          )}
        </div>
      </section>

      {/* 2. DETAIL: CONTROL CENTER (RIGHT) */}
      <section className="flex-1 bg-laundry-sky/10 overflow-y-auto p-4 md:p-10">
        {!selectedUser && !isAddingUser ? (
          <div className="h-full flex flex-col items-center justify-center text-center gap-6 opacity-30">
            <div className="w-32 h-32 bg-white rounded-[3rem] shadow-inner flex items-center justify-center">
              <Shield size={64} />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-black text-laundry-deep uppercase tracking-tighter">Permission Center</h3>
              <p className="text-xs font-bold uppercase tracking-widest">Sélectionnez un membre pour gérer ses accès</p>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-8 animate-slide-up">
            {/* DETAIL HEADER */}
            <div className="bg-laundry-deep rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-laundry-primary/10 rounded-full -mr-32 -mt-32 blur-3xl animate-pulse"></div>
              <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                <div className="w-24 h-24 bg-white/10 backdrop-blur-md rounded-[2rem] border-2 border-white/20 flex items-center justify-center text-4xl font-black text-laundry-fresh shadow-2xl">
                  {isAddingUser ? <UserPlus size={40} /> : (selectedUser?.name[0].toUpperCase())}
                </div>
                <div className="text-center md:text-left space-y-2">
                  <h2 className="text-4xl font-black uppercase tracking-tighter leading-none">{isAddingUser ? 'Nouveau Recrutement' : selectedUser.name}</h2>
                  <div className="flex flex-wrap justify-center md:justify-start gap-4">
                    <span className="flex items-center gap-1.5 px-4 py-1.5 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10">
                      <Shield size={12} className="text-laundry-fresh" /> {isAddingUser ? 'A définir' : selectedUser.role}
                    </span>
                    {!isAddingUser && (
                      <span className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${activeTab === 'active' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                        <Activity size={12} /> {activeTab === 'active' ? 'Opérationnel' : 'Désactivé'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* ACTION GRIDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* FORM CARD */}
              <div className="glass bg-white rounded-[2.5rem] p-8 border-white shadow-xl space-y-8">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-laundry-sky text-laundry-primary rounded-2xl"><Edit2 size={20} /></div>
                  <h3 className="font-black text-laundry-deep uppercase tracking-widest text-sm">Informations Profil</h3>
                </div>

                <form onSubmit={isAddingUser ? handleCreate : handleUpdate} className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-laundry-deep/30 px-1 uppercase tracking-widest">Nom Complet</label>
                      <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-laundry-sky/30 border-2 border-transparent focus:border-laundry-primary p-4 rounded-2xl font-bold outline-none transition-all shadow-inner" placeholder="Ex: Jean Dupont" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-laundry-deep/30 px-1 uppercase tracking-widest">Email</label>
                      <input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full bg-laundry-sky/30 border-2 border-transparent focus:border-laundry-primary p-4 rounded-2xl font-bold outline-none transition-all shadow-inner" placeholder="staff@company.com" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-laundry-deep/30 px-1 uppercase tracking-widest">Téléphone</label>
                        <input type="tel" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="w-full bg-laundry-sky/30 border-2 border-transparent focus:border-laundry-primary p-4 rounded-2xl font-bold outline-none transition-all shadow-inner" placeholder="06..." />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-laundry-deep/30 px-1 uppercase tracking-widest">Rôle</label>
                        <select value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })} className="w-full bg-laundry-sky/30 border-2 border-transparent focus:border-laundry-primary p-4 rounded-2xl font-bold outline-none transition-all shadow-inner">
                          <option value="employe">Employé</option>
                          <option value="livreur">Livreur</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>
                    </div>
                    {isAddingUser && (
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-laundry-deep/30 px-1 uppercase tracking-widest">Mot de Passe</label>
                        <input type="password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} className="w-full bg-laundry-sky/30 border-2 border-transparent focus:border-laundry-primary p-4 rounded-2xl font-bold outline-none transition-all shadow-inner" />
                      </div>
                    )}
                  </div>
                  <button type="submit" disabled={loading} className="w-full bg-laundry-deep text-white py-5 rounded-[1.5rem] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-laundry-primary hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-50">
                    {loading ? 'Traitement...' : isAddingUser ? 'Engager maintenant' : 'Enregistrer Modifications'}
                  </button>
                </form>
              </div>

              {/* CONTROL CENTER TAB (RIGHT) */}
              <div className="space-y-8">
                {!isAddingUser && (
                  <div className="glass bg-white rounded-[2.5rem] p-8 border-white shadow-xl space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-laundry-fresh text-laundry-deep rounded-2xl"><Lock size={20} /></div>
                      <h3 className="font-black text-laundry-deep uppercase tracking-widest text-sm">Actions de Sécurité</h3>
                    </div>
                    <div className="space-y-3">
                      <button
                        onClick={() => handleToggleStatus(selectedUser, activeTab === 'active')}
                        className={`w-full p-6 h-32 rounded-3xl border-2 flex flex-col items-center justify-center gap-2 transition-all active:scale-95 ${activeTab === 'active' ? 'bg-red-50 border-red-100 text-red-500 hover:bg-red-500 hover:text-white' : 'bg-green-50 border-green-100 text-green-500 hover:bg-green-500 hover:text-white'}`}
                      >
                        <Power size={24} strokeWidth={3} />
                        <span className="font-black uppercase tracking-[0.2em] text-xs">{activeTab === 'active' ? 'Révoquer les accès' : 'Rétablir les accès'}</span>
                      </button>

                      {activeTab === 'inactive' && (
                        <button
                          onClick={() => { setConfirmModal({ isOpen: true, title: 'Suppression Définitive', message: `Supprimer ${selectedUser.name} de la base de données ?`, type: 'danger', onConfirm: () => { dispatch(removeUser(selectedUser.id)); setSelectedUser(null); setConfirmModal(prev => ({ ...prev, isOpen: false })); } }); }}
                          className="w-full p-4 rounded-3xl border-2 border-transparent text-red-300 hover:text-red-500 font-black uppercase tracking-widest text-[9px] transition-colors"
                        >
                          Supprimer le compte définitivement
                        </button>
                      )}
                    </div>
                  </div>
                )}

                <div className="glass bg-white rounded-[2.5rem] p-8 border-white shadow-xl space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-laundry-sky text-laundry-primary rounded-2xl"><History size={20} /></div>
                    <h3 className="font-black text-laundry-deep uppercase tracking-widest text-sm">Registre d'Activité</h3>
                  </div>
                  <div className="space-y-4">
                    {[
                      { action: 'Connexion réussie', date: 'Aujourd\'hui, 09:42', type: 'success' },
                      { action: 'Modification profil', date: 'Hier, 14:20', type: 'info' },
                    ].map((log, i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-laundry-sky/20 rounded-2xl border border-white/60">
                        <div className="space-y-0.5">
                          <p className="text-[11px] font-black text-laundry-deep uppercase tracking-tight">{log.action}</p>
                          <p className="text-[9px] font-bold text-laundry-deep/30">{log.date}</p>
                        </div>
                        <ChevronRight size={14} className="text-laundry-deep/10" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* CONFIRM MODAL */}
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
