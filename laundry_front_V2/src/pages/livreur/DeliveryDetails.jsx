import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
    Phone,
    CreditCard,
    Banknote,
    FileText,
    CheckCircle,
    Receipt as ReceiptIcon,
    Loader2,
    Calendar,
    Hash,
    Package,
    ShieldCheck,
    MapPin,
    Printer,
    Sparkles,
    ExternalLink
} from 'lucide-react';

import { submitPayment } from '../../store/livreur/livreurThunk';
import { selectReadyForDelivery, selectLoading } from '../../store/livreur/livreurSelectors';

export default function DeliveryDetails() {
    const { orderId } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const orders = useSelector(selectReadyForDelivery);
    const loading = useSelector(selectLoading);

    // This converts param strictly for matching but falls back gracefully
    const order = orders.find(o => o.id === parseInt(orderId));
    const [paymentMethod, setPaymentMethod] = useState('especes');
    const [isFinalizing, setIsFinalizing] = useState(false);

    const handleRecordPayment = async () => {
        setIsFinalizing(true);
        try {
            await dispatch(submitPayment({
                orderId: order.id,
                data: { modePaiement: paymentMethod }
            })).unwrap();

            toast.success("Livraison validée avec succès !");
            navigate('/livreur/ready-for-delivery');
        } catch (err) {
            toast.error(err || "Erreur lors de l'enregistrement du paiement");
        } finally {
            setIsFinalizing(false);
        }
    };

    if (!order) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-laundry-border shadow-sm text-center max-w-lg mx-auto mt-10">
                <div className="w-16 h-16 bg-laundry-background rounded-full flex items-center justify-center text-laundry-text-muted mb-4 opacity-50">
                    <ReceiptIcon size={32} />
                </div>
                <h3 className="text-lg font-bold text-laundry-text-primary mb-1">Commande Introuvable</h3>
                <p className="text-sm font-medium text-laundry-text-secondary mb-6">Cette commande n'existe pas ou a déjà été traitée.</p>
                <button
                    onClick={() => navigate('/livreur/ready-for-delivery')}
                    className="px-6 py-2.5 bg-laundry-primary text-white rounded-md font-semibold text-sm shadow-sm hover:bg-laundry-primary-hover transition-colors"
                >
                    Retour à la liste
                </button>
            </div>
        );
    }

    const paymentOptions = [
        { value: 'especes', label: 'Cash', icon: Banknote },
        { value: 'carte', label: 'TPE', icon: CreditCard },
        { value: 'cheque', label: 'Chèque', icon: FileText },
    ];

    const currentOrder = order;

    return (
        <div className="max-w-6xl mx-auto space-y-6 animate-fade-in p-4 sm:p-6 pb-32">
            
            <div className="mb-2 flex items-center gap-3">
                <button onClick={() => navigate(-1)} className="p-2 border border-laundry-border rounded-md text-laundry-text-secondary hover:bg-laundry-background hover:text-laundry-text-primary transition-colors bg-white">
                    <ChevronLeft size={20} />
                </button>
                <div>
                   <h1 className="text-2xl font-bold text-laundry-text-primary">Détails de Livraison</h1>
                   <p className="text-sm font-medium text-laundry-text-secondary">Commande #{currentOrder.numeroCommande}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* 1. LEFT COLUMN: RECEIPT & ITEMS */}
                <div className="lg:col-span-8 flex flex-col gap-6">
                    {/* RECEIPT SECTION */}
                    <div className="bg-white rounded-xl border border-laundry-border shadow-sm p-6 sm:p-10 flex flex-col text-center relative overflow-hidden">
                        
                        <div className="mb-8 border-b border-dashed border-laundry-border pb-8">
                            <div className="w-12 h-12 bg-laundry-primary text-white rounded-lg flex items-center justify-center mx-auto mb-3 shadow-sm">
                                <ReceiptIcon size={24} />
                            </div>
                            <h2 className="text-xl font-bold text-laundry-text-primary uppercase">Laundry Fresh</h2>
                            <div className="flex items-center justify-center gap-4 text-xs font-semibold text-laundry-text-secondary mt-1">
                                <span className="flex items-center gap-1"><Hash size={14} /> {currentOrder.numeroCommande}</span>
                                <span className="w-1 h-1 bg-laundry-text-muted rounded-full"></span>
                                <span className="flex items-center gap-1"><Calendar size={14} /> {new Date().toLocaleDateString('fr-FR')}</span>
                            </div>
                        </div>

                        {/* CLIENT CONTEXT */}
                        <div className="w-full space-y-4 text-left border-b border-dashed border-laundry-border pb-8 mb-8">
                            <div>
                                <span className="text-[10px] font-bold text-laundry-text-secondary uppercase tracking-widest block mb-1">Destinataire</span>
                                <h3 className="text-lg font-bold text-laundry-text-primary">{currentOrder.client.name}</h3>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="flex items-start gap-2 bg-laundry-background p-3 rounded-md border border-laundry-border">
                                    <MapPin size={16} className="text-laundry-text-muted shrink-0 mt-0.5" />
                                    <span className="text-xs font-semibold text-laundry-text-primary line-clamp-2">
                                        {currentOrder.client.addresses?.[0]?.address || 'Adresse non renseignée'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 bg-laundry-background p-3 rounded-md border border-laundry-border">
                                    <Phone size={16} className="text-laundry-text-muted shrink-0" />
                                    <span className="text-xs font-semibold text-laundry-text-primary">
                                        {currentOrder.client.phones?.[0]?.phoneNumber || 'Téléphone non renseigné'}
                                    </span>
                                </div>
                            </div>
                            {currentOrder.client.addresses?.[0]?.notes && (
                                <div className="text-xs text-laundry-text-secondary bg-yellow-50 text-yellow-800 p-2 rounded-md border border-yellow-200">
                                    <span className="font-bold">Note:</span> {currentOrder.client.addresses[0].notes}
                                </div>
                            )}
                        </div>

                        {/* ITEM TABLE */}
                        <div className="w-full text-left">
                            <div className="flex justify-between text-xs font-bold text-laundry-text-secondary uppercase border-b border-laundry-border pb-2 mb-4">
                                <span>Désignation ({currentOrder.commandeTapis.length})</span>
                                <span>Montant</span>
                            </div>
                            <div className="space-y-3">
                                {currentOrder.commandeTapis.map((item, idx) => (
                                    <div key={idx} className="flex items-start justify-between gap-3 group">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-laundry-text-primary">{item.tapis.nom}</span>
                                            <span className="text-xs font-medium text-laundry-text-secondary">{item.quantite} x {item.prixUnitaire} DH</span>
                                        </div>
                                        <span className="text-sm font-bold text-laundry-text-primary">{(item.quantite * item.prixUnitaire).toFixed(2)} DH</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* TOTAL */}
                        <div className="w-full mt-8 bg-blue-50 rounded-lg p-4 sm:p-6 border border-blue-100 flex justify-between items-center">
                            <span className="text-sm font-bold text-laundry-text-primary uppercase">Total à Encaisser</span>
                            <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-bold text-laundry-primary">{currentOrder.montantTotal}</span>
                                <span className="text-sm font-bold text-laundry-primary">DH</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. RIGHT COLUMN: ACTIONS & BILLING */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                    
                    {/* BILLING CARD */}
                    <div className="bg-white rounded-xl border border-laundry-border shadow-sm p-6 sticky top-6">
                        <div className="mb-6">
                            <h3 className="text-sm font-bold text-laundry-text-primary uppercase mb-4 flex items-center gap-2">
                                <CheckCircle size={16} className="text-laundry-success" />
                                Encaissement
                            </h3>
                            <div className="bg-laundry-background rounded-lg p-6 text-center border border-laundry-border">
                                <p className="text-xs font-semibold text-laundry-text-secondary uppercase mb-1">Net à Payer</p>
                                <div className="flex items-baseline justify-center gap-1">
                                    <span className="text-4xl font-bold text-laundry-text-primary">{currentOrder.montantTotal}</span>
                                    <span className="text-lg font-bold text-laundry-text-secondary">DH</span>
                                </div>
                            </div>
                        </div>

                        {/* Method Picker */}
                        <div className="space-y-3 mb-6">
                            <label className="text-xs font-semibold text-laundry-text-secondary block mb-2">Mode de paiement</label>
                            {paymentOptions.map(method => (
                                <button
                                    key={method.value}
                                    onClick={() => setPaymentMethod(method.value)}
                                    className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all ${paymentMethod === method.value ? 'border-laundry-primary bg-blue-50' : 'border-laundry-border bg-white hover:bg-laundry-background'}`}
                                >
                                    <div className={`p-2 rounded-md ${paymentMethod === method.value ? 'bg-laundry-primary text-white' : 'bg-laundry-background text-laundry-text-muted border border-laundry-border'}`}>
                                        <method.icon size={16} />
                                    </div>
                                    <span className={`text-sm font-bold ${paymentMethod === method.value ? 'text-laundry-primary' : 'text-laundry-text-secondary'}`}>
                                        {method.label}
                                    </span>
                                </button>
                            ))}
                        </div>

                        {/* Call to Action */}
                        <div className="space-y-4">
                            <button
                                onClick={handleRecordPayment}
                                disabled={isFinalizing}
                                className="w-full bg-laundry-success text-white py-3.5 rounded-md font-bold text-sm shadow-sm hover:bg-opacity-90 transition-colors flex flex-col items-center justify-center gap-1 disabled:opacity-50"
                            >
                                {isFinalizing ? (
                                    <Loader2 className="animate-spin my-2" size={20} />
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <Printer size={18} />
                                        <span>Finaliser & Imprimer</span>
                                    </div>
                                )}
                            </button>
                            
                            <div className="text-center">
                                <p className="text-[10px] font-semibold text-laundry-text-muted flex items-center justify-center gap-1">
                                    <ShieldCheck size={12} /> Transactions Sécurisées
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* QUICK HELP */}
                    <div className="bg-laundry-background rounded-xl p-6 border border-laundry-border text-center space-y-2">
                        <Sparkles className="text-laundry-primary mx-auto mb-2" size={24} />
                        <h4 className="text-sm font-bold text-laundry-text-primary">Besoin d'aide ?</h4>
                        <p className="text-xs font-medium text-laundry-text-secondary">
                            Contactez le régulateur au local.
                        </p>
                        <p className="text-xs font-bold text-laundry-primary pt-2">+212 5 22 11 22 33</p>
                    </div>

                </div>
            </div>
        </div>
    );
}

const ChevronLeft = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
);
