import React from 'react';

const statusConfigs = {
  EN_ATTENTE:    { bg: 'bg-status-en_attente',    text: 'text-status-en_attente-text',    dot: 'bg-status-en_attente-text',    label: 'En Attente' },
  VALIDEE:       { bg: 'bg-status-validee',       text: 'text-status-validee-text',       dot: 'bg-status-validee-text',       label: 'Validée' },
  EN_TRAITEMENT: { bg: 'bg-status-en_traitement', text: 'text-status-en_traitement-text', dot: 'bg-status-en_traitement-text', label: 'En Traitement' },
  PRETE:         { bg: 'bg-status-prete',         text: 'text-status-prete-text',         dot: 'bg-status-prete-text',         label: 'À Livrer' },
  LIVREE:        { bg: 'bg-status-livree',        text: 'text-status-livree-text',        dot: 'bg-status-livree-text',        label: 'Livrée' },
  PAYEE:         { bg: 'bg-status-payee',         text: 'text-status-payee-text',         dot: 'bg-status-payee-text',         label: 'Payée' },
  ANNULEE:       { bg: 'bg-status-annulee',       text: 'text-status-annulee-text',       dot: 'bg-status-annulee-text',       label: 'Annulée' },
  RETOURNEE:     { bg: 'bg-status-retour',        text: 'text-status-retour-text',        dot: 'bg-status-retour-text',        label: 'Retournée' },
};

export const StatusBadge = ({ status }) => {
  const cfg = statusConfigs[status?.toUpperCase()] || {
    bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400', label: status || '—'
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
};