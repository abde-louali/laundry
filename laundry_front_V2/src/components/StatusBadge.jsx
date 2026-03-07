import React from 'react';
import { Clock, CheckCircle, Smartphone, Truck, Package, XCircle, CreditCard } from 'lucide-react';

export const StatusBadge = ({ status }) => {
  const configs = {
    EN_ATTENTE: { color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: Clock, label: 'En Attente' },
    VALIDEE: { color: 'bg-blue-100 text-blue-700 border-blue-200', icon: Smartphone, label: 'Validée' },
    EN_TRAITEMENT: { color: 'bg-indigo-100 text-indigo-700 border-indigo-200', icon: Package, label: 'En Traitement' },
    PRETE: { color: 'bg-laundry-fresh/10 text-laundry-primary border-laundry-fresh/30', icon: Truck, label: 'À Livrer' },
    LIVREE: { color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle, label: 'Livrée' },
    PAYEE: { color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: CreditCard, label: 'Payée' },
    ANNULEE: { color: 'bg-red-100 text-red-700 border-red-200', icon: XCircle, label: 'Annulée' },
  };

  const config = configs[status] || { color: 'bg-gray-100 text-gray-700 border-gray-200', icon: Package, label: status };
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm ${config.color}`}>
      <Icon size={12} strokeWidth={3} className="animate-pulse" />
      {config.label}
    </span>
  );
};