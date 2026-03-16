import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Loader2, Package, User, CalendarDays,
  ClipboardList, MapPin, Phone, CreditCard, Truck, DollarSign
} from 'lucide-react';
import { fetchCommandeById } from '../../store/admin/adminThunk';
import { clearSelectedCommande } from '../../store/admin/adminSlice';
import { StatusBadge } from '../../components/StatusBadge';

const ETAT_CONFIG = {
  en_attente:   { label: 'En Attente',  accentText: 'text-orange-500', accentBg: 'bg-orange-50' },
  en_nettoyage: { label: 'Nettoyage',   accentText: 'text-blue-500',   accentBg: 'bg-blue-50' },
  nettoye:      { label: 'Nettoyé',     accentText: 'text-green-500',  accentBg: 'bg-green-50' },
  livre:        { label: 'Livré',       accentText: 'text-teal-500',   accentBg: 'bg-teal-50' },
};

export default function AdminCommandeDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { selectedCommande: commande, loading } = useSelector(s => s.admin);

  useEffect(() => {
    if (id) dispatch(fetchCommandeById(id));
    return () => { dispatch(clearSelectedCommande()); };
  }, [id, dispatch]);

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }) : '—';

  if (loading || !commande) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 size={32} className="animate-spin text-primary-600 mb-3" />
        <p className="text-sm text-text-muted">Chargement...</p>
      </div>
    );
  }

  const tapis = commande.commandeTapis || [];
  const totalPrice = tapis.reduce((sum, t) => sum + (parseFloat(t.sousTotal) || 0), 0);

  return (
    <div className="max-w-2xl mx-auto pb-8 space-y-4">
      {/* Back */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-text-muted hover:text-text-primary">
        <ArrowLeft size={16} />
        Retour
      </button>

      {/* Header */}
      <div className="bg-surface rounded-2xl shadow-card p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-xs text-text-muted mb-1">#{commande.numeroCommande}</p>
            <StatusBadge status={commande.status} />
          </div>
          {commande.montantTotal != null && (
            <div className="text-right">
              <p className="text-xs text-text-muted mb-0.5">Total</p>
              <p className="text-2xl font-bold text-primary-600">{commande.montantTotal} DH</p>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="grid grid-cols-2 gap-2">
          {[
            { icon: User, label: 'Livreur', value: commande.livreur?.name },
            { icon: User, label: 'Client', value: commande.client?.name },
            { icon: Phone, label: 'Téléphone', value: commande.client?.phone },
            { icon: CalendarDays, label: 'Créée le', value: formatDate(commande.dateCreation) },
            { icon: Truck, label: 'Livrée le', value: commande.dateLivraison ? formatDate(commande.dateLivraison) : null },
            { icon: CreditCard, label: 'Paiement', value: commande.modePaiement },
          ].filter(r => r.value).map((row, i) => {
            const Icon = row.icon;
            return (
              <div key={i} className="bg-background rounded-xl px-3 py-2">
                <p className="text-xs text-text-muted mb-0.5">{row.label}</p>
                <p className="text-sm font-medium text-text-primary flex items-center gap-1.5">
                  <Icon size={12} className="text-text-muted flex-shrink-0" />
                  {row.value}
                </p>
              </div>
            );
          })}
        </div>

        {commande.client?.address && (
          <div className="flex items-center gap-2 bg-background rounded-xl px-3 py-2 mt-2">
            <MapPin size={14} className="text-text-muted flex-shrink-0" />
            <span className="text-sm text-text-secondary">{commande.client.address}</span>
          </div>
        )}
      </div>

      {/* Tapis List */}
      {tapis.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2 mb-3">
            <Package size={16} className="text-primary-600" />
            Articles — {tapis.length} tapis
          </h3>
          <div className="space-y-2">
            {tapis.map((t, i) => {
              const etatCfg = ETAT_CONFIG[t.etat] || ETAT_CONFIG.en_attente;
              const tapisInfo = t.tapis || {};
              return (
                <div key={t.id} className="bg-surface rounded-2xl shadow-card p-4 flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-semibold text-sm ${etatCfg.accentBg} ${etatCfg.accentText} flex-shrink-0`}>
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-text-primary truncate">{tapisInfo.nom || tapisInfo.name || `Tapis ${i + 1}`}</h4>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {t.quantite && <span className="text-xs bg-gray-100 text-text-secondary px-2 py-0.5 rounded-full">×{t.quantite}</span>}
                      {t.prixUnitaire && <span className="text-xs bg-gray-100 text-text-secondary px-2 py-0.5 rounded-full">{t.prixUnitaire} DH/u</span>}
                      {t.sousTotal && <span className="text-xs bg-primary-50 text-primary-600 px-2 py-0.5 rounded-full">{t.sousTotal} DH</span>}
                    </div>
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${etatCfg.accentBg} ${etatCfg.accentText} flex-shrink-0`}>
                    {etatCfg.label}
                  </span>
                </div>
              );
            })}
          </div>

          {totalPrice > 0 && (
            <div className="mt-3 bg-primary-600 rounded-2xl p-4 flex items-center justify-between text-white">
              <div>
                <p className="text-primary-200 text-xs">Total calculé</p>
                <p className="text-primary-300 text-xs">{tapis.length} tapis · {tapis.reduce((s, t) => s + (t.quantite || 0), 0)} unités</p>
              </div>
              <p className="text-3xl font-bold">{totalPrice.toFixed(2)} <span className="text-lg">DH</span></p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
