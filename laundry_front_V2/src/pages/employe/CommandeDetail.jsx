import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
    ArrowLeft,
    Loader2,
    Package,
    CheckCircle2,
    Clock,
    Wrench,
    Truck,
    Hash,
    User,
    CalendarDays,
    ClipboardList,
    ChevronRight,
    MapPin,
    Phone,
    Info,
    DollarSign,
    X,
    Maximize2,
    CheckCircle,
    Navigation,
    Upload,
    Plus,
    RefreshCw,
    Image as ImageIcon
} from 'lucide-react';
import {
    fetchCommandeById,
    updateCommandeStatus,
    updateTapisEtat,
    addTapisImages,
    uploadEmployeImages
} from '../../store/employe/employeThunk';
import {
    selectSelectedCommande,
    selectIsLoadingSelectedCommande,
    selectIsUpdatingStatus,
    selectIsUpdatingTapis
} from '../../store/employe/employeSelectors';
import { COMMANDE_STATUS, TAPIS_ETAT, clearSelectedCommande } from '../../store/employe/employeSlice';

const TAPIS_IMAGE_TYPE = {
    BEFORE: 'BEFORE',
    AFTER: 'AFTER'
};

const STATUS_CONFIG = {
    [COMMANDE_STATUS.EN_ATTENTE]: { label: 'En Attente', bg: 'bg-laundry-warning-light', text: 'text-laundry-warning', dot: 'bg-laundry-warning', Icon: Clock },
    [COMMANDE_STATUS.VALIDEE]: { label: 'Validée', bg: 'bg-blue-50', text: 'text-laundry-primary-light', dot: 'bg-laundry-primary-light', Icon: CheckCircle2 },
    [COMMANDE_STATUS.EN_TRAITEMENT]: { label: 'En Traitement', bg: 'bg-purple-50', text: 'text-purple-600', dot: 'bg-purple-500', Icon: Wrench },
    [COMMANDE_STATUS.PRETE]: { label: 'Prête', bg: 'bg-laundry-success-light', text: 'text-laundry-success', dot: 'bg-laundry-success', Icon: CheckCircle2 },
    [COMMANDE_STATUS.LIVREE]: { label: 'Sortie', bg: 'bg-cyan-50', text: 'text-laundry-accent', dot: 'bg-laundry-accent', Icon: Truck },
    [COMMANDE_STATUS.PAYEE]: { label: 'Payée', bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-600', Icon: CheckCircle2 },
    [COMMANDE_STATUS.ANNULEE]: { label: 'Annulée', bg: 'bg-laundry-error-light', text: 'text-laundry-error', dot: 'bg-laundry-error', Icon: ClipboardList },
    [COMMANDE_STATUS.RETOURNEE]: { label: 'Retournée', bg: 'bg-orange-50', text: 'text-orange-600', dot: 'bg-orange-500', Icon: RefreshCw },
};

const ETAT_CONFIG = {
    [TAPIS_ETAT.EN_ATTENTE]: { label: 'En Attente', color: 'text-laundry-warning', bg: 'bg-laundry-warning-light', border: 'border-laundry-warning/20', Icon: Clock, next: TAPIS_ETAT.EN_NETTOYAGE },
    [TAPIS_ETAT.EN_NETTOYAGE]: { label: 'Nettoyage', color: 'text-laundry-primary-light', bg: 'bg-blue-50', border: 'border-laundry-primary-light/20', Icon: Wrench, next: TAPIS_ETAT.NETTOYE },
    [TAPIS_ETAT.NETTOYE]: { label: 'Terminé', color: 'text-laundry-success', bg: 'bg-laundry-success-light', border: 'border-laundry-success/20', Icon: CheckCircle2, next: null },
    [TAPIS_ETAT.LIVRE]: { label: 'Livré', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-600/20', Icon: Truck, next: null },
};

const NEXT_COMMAND_LABEL = {
    [COMMANDE_STATUS.EN_ATTENTE]: 'Valider la commande',
    [COMMANDE_STATUS.VALIDEE]: 'Démarrer le traitement',
    [COMMANDE_STATUS.EN_TRAITEMENT]: 'Marquer comme Prête',
    [COMMANDE_STATUS.PRETE]: 'Marquer comme Sortie',
    [COMMANDE_STATUS.RETOURNEE]: 'Remettre en Livraison',
};

const NEXT_COMMANDE_STATUS = {
    [COMMANDE_STATUS.EN_ATTENTE]: COMMANDE_STATUS.VALIDEE,
    [COMMANDE_STATUS.VALIDEE]: COMMANDE_STATUS.EN_TRAITEMENT,
    [COMMANDE_STATUS.EN_TRAITEMENT]: COMMANDE_STATUS.PRETE,
    [COMMANDE_STATUS.PRETE]: COMMANDE_STATUS.LIVREE,
    [COMMANDE_STATUS.RETOURNEE]: COMMANDE_STATUS.LIVREE,
};

const ImagePreviewModal = ({ src, isOpen, onClose }) => {
    if (!isOpen) return null;
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-12 bg-black/60 backdrop-blur-sm animate-fade-in"
            onClick={onClose}
        >
            <div
                className="relative w-full max-w-5xl h-full max-h-[90vh] flex items-center justify-center animate-scale-up"
                onClick={e => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute -top-4 -right-4 p-2 bg-white text-laundry-text-primary rounded-full shadow-lg border border-laundry-border transition-all z-20 hover:bg-laundry-background"
                >
                    <X size={24} />
                </button>

                <div className="relative bg-white rounded-xl overflow-hidden shadow-modal border border-laundry-border max-w-full max-h-full flex flex-col items-center justify-center select-none p-2">
                    <img
                        src={`http://localhost:8080${src}`}
                        alt="Zoomed Tapis"
                        className="max-w-full max-h-[85vh] object-contain rounded-lg"
                    />
                </div>
            </div>
        </div>
    );
};

const TapisImageGallery = ({ images, onPreview, label }) => {
    return (
        <div className="space-y-3">
            {label && (
                <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-laundry-text-secondary uppercase tracking-wider">
                        {label}
                    </span>
                    <div className="h-px flex-1 bg-laundry-border"></div>
                </div>
            )}

            {(!images || images.length === 0) ? (
                <div className="w-full h-24 bg-laundry-background rounded-lg flex flex-col items-center justify-center gap-2 border border-dashed border-laundry-border">
                    <ImageIcon size={20} className="text-laundry-text-muted" />
                    <span className="text-xs font-medium text-laundry-text-secondary">Aucune image</span>
                </div>
            ) : (
                <div className="grid grid-cols-3 gap-2">
                    {images.map((img, idx) => (
                        <div
                            key={idx}
                            className="relative group aspect-square rounded-lg overflow-hidden cursor-pointer bg-laundry-background border border-laundry-border"
                            onClick={() => onPreview(img.imageUrl)}
                        >
                            <img
                                src={`http://localhost:8080${img.imageUrl}`}
                                alt="Tapis"
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=No+Image'; }}
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                                <Maximize2 size={16} className="text-white drop-shadow-md" />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const TapisImageUpload = ({ tapisId }) => {
    const dispatch = useDispatch();
    const [uploading, setUploading] = useState(false);
    const fileInputRef = React.useRef(null);

    const handleFileChange = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        setUploading(true);
        try {
            const uploadResult = await dispatch(uploadEmployeImages(files)).unwrap();
            const imageUrls = uploadResult.map(res => res.imageUrl);

            await dispatch(addTapisImages({
                tapisId,
                imageUrls,
                type: TAPIS_IMAGE_TYPE.AFTER
            })).unwrap();

            toast.success(`${imageUrls.length} image(s) ajoutée(s)`);
        } catch (err) {
            toast.error(err || "Erreur lors de l'ajout des images");
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    return (
        <div className="mt-4">
            <input
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileChange}
            />
            <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-white hover:bg-laundry-background text-laundry-primary rounded-md border border-laundry-primary text-xs font-semibold transition-colors disabled:opacity-50"
            >
                {uploading ? (
                    <Loader2 size={16} className="animate-spin" />
                ) : (
                    <Plus size={16} />
                )}
                <span>{uploading ? 'Envoi...' : 'Ajouter images (Après)'}</span>
            </button>
        </div>
    );
};

const TapisItemCard = ({ item, onUpdateEtat, isUpdating, onPreview }) => {
    const etatCfg = ETAT_CONFIG[item.etat] || ETAT_CONFIG[TAPIS_ETAT.EN_ATTENTE];
    const StatusIcon = etatCfg.Icon;
    const tapisInfo = item.tapis || {};
    const images = tapisInfo.images || [];

    const beforeImages = images.filter(img => img.imageType === TAPIS_IMAGE_TYPE.BEFORE || !img.imageType);
    const afterImages = images.filter(img => img.imageType === TAPIS_IMAGE_TYPE.AFTER);

    return (
        <div className="p-6 bg-white rounded-xl border border-laundry-border shadow-card flex flex-col lg:flex-row gap-8">
            <div className="w-full lg:w-56 space-y-6">
                <TapisImageGallery images={beforeImages} onPreview={onPreview} label="Avant Nettoyage" />
                <TapisImageGallery images={afterImages} onPreview={onPreview} label="Après Nettoyage" />
                <TapisImageUpload tapisId={tapisInfo.id} />
            </div>

            <div className="flex-1 space-y-5">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold text-laundry-text-secondary bg-laundry-background border border-laundry-border uppercase tracking-wider mb-2">
                            Tapis #{item.id}
                        </span>
                        <h4 className="text-xl font-bold text-laundry-text-primary tracking-tight">
                            {tapisInfo.nom || `Tapis sans nom`}
                        </h4>
                    </div>
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-transparent ${etatCfg.bg} ${etatCfg.color}`}>
                        <StatusIcon size={16} />
                        <span className="text-xs font-semibold uppercase tracking-wider">{etatCfg.label}</span>
                    </div>
                </div>

                {tapisInfo.description && (
                    <div className="p-4 bg-laundry-background rounded-lg border-l-2 border-laundry-primary">
                        <p className="text-sm font-medium text-laundry-text-secondary italic">
                            "{tapisInfo.description}"
                        </p>
                    </div>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                    <div className="p-3 bg-laundry-background rounded-lg border border-laundry-border">
                        <p className="text-[10px] font-bold text-laundry-text-secondary uppercase tracking-wider mb-1">Quantité</p>
                        <p className="text-lg font-bold text-laundry-text-primary">{item.quantite || '1'} <span className="text-sm font-medium text-laundry-text-muted">unités</span></p>
                    </div>
                    <div className="p-3 bg-laundry-background rounded-lg border border-laundry-border">
                        <p className="text-[10px] font-bold text-laundry-text-secondary uppercase tracking-wider mb-1">Total</p>
                        <p className="text-lg font-bold text-laundry-text-primary">{item.sousTotal || '0'} <span className="text-sm font-medium text-laundry-text-muted">DH</span></p>
                    </div>
                </div>

                <div className="pt-4 border-t border-laundry-border mt-auto">
                    {etatCfg.next ? (
                        <button
                            onClick={() => onUpdateEtat(item.id, etatCfg.next)}
                            disabled={isUpdating}
                            className="w-full flex items-center justify-center gap-2 py-3 bg-laundry-primary text-white rounded-md text-xs font-semibold hover:bg-laundry-primary-hover shadow-sm transition-colors disabled:opacity-50"
                        >
                            {isUpdating ? (
                                <Loader2 size={16} className="animate-spin" />
                            ) : (
                                <>
                                    <span>Passer à : {ETAT_CONFIG[etatCfg.next]?.label}</span>
                                    <ChevronRight size={16} />
                                </>
                            )}
                        </button>
                    ) : item.etat === TAPIS_ETAT.NETTOYE && (
                        <div className="w-full p-3 bg-laundry-success-light text-laundry-success rounded-md flex items-center justify-center gap-2 border border-laundry-success/20">
                            <CheckCircle size={18} />
                            <span className="text-xs font-bold uppercase tracking-wider">Traitement terminé</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default function CommandeDetail() {
    const { id } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const commande = useSelector(selectSelectedCommande);
    const isLoading = useSelector(selectIsLoadingSelectedCommande);
    const isUpdatingStatus = useSelector(selectIsUpdatingStatus);
    const isUpdatingTapis = useSelector(selectIsUpdatingTapis);

    const [previewImage, setPreviewImage] = useState(null);

    useEffect(() => {
        if (id) dispatch(fetchCommandeById(id));
        return () => { dispatch(clearSelectedCommande()); };
    }, [id, dispatch]);

    const handleAdvanceStatus = async () => {
        const nextStatus = NEXT_COMMANDE_STATUS[commande.status];
        if (!nextStatus) return;
        try {
            await dispatch(updateCommandeStatus({ id: commande.id, newStatus: nextStatus })).unwrap();
            toast.success(`Statut mis à jour → ${STATUS_CONFIG[nextStatus]?.label}`);
        } catch (err) {
            toast.error(err || 'Erreur');
        }
    };

    const handleUpdateTapisEtat = async (tapisId, newEtat) => {
        try {
            await dispatch(updateTapisEtat({ tapisId, newEtat })).unwrap();
            toast.success(`État du tapis mis à jour`);
        } catch (err) {
            toast.error(err || 'Erreur');
        }
    };

    const formatDate = (d) => d ? new Date(d).toLocaleDateString('fr-FR', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    }) : '—';

    if (isLoading || !commande) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 py-20 min-h-[60vh] bg-laundry-background rounded-xl">
                <Loader2 size={32} className="text-laundry-primary animate-spin" />
                <p className="text-xs font-semibold text-laundry-text-secondary uppercase tracking-wider">Chargement des détails...</p>
            </div>
        );
    }

    const statusCfg = STATUS_CONFIG[commande.status] || STATUS_CONFIG[COMMANDE_STATUS.EN_ATTENTE];
    const statusLabel = NEXT_COMMAND_LABEL[commande.status];
    const progress = commande.commandeTapis?.length > 0
        ? Math.round((commande.commandeTapis.filter(t => t.etat === TAPIS_ETAT.NETTOYE || t.etat === TAPIS_ETAT.LIVRE).length / commande.commandeTapis.length) * 100)
        : 0;

    return (
        <div className="max-w-7xl mx-auto space-y-6 animate-fade-in p-4 sm:p-6 lg:p-8">
            <div className="flex items-center justify-between mb-2">
                <button
                    onClick={() => navigate('/employe/dashboard')}
                    className="flex items-center gap-2 text-laundry-text-secondary font-medium text-sm hover:text-laundry-primary transition-all group"
                >
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                    <span>Retour au tableau de bord</span>
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8 space-y-6">
                    <div className="bg-white rounded-xl shadow-card border border-laundry-border overflow-hidden p-6 md:p-8">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <Hash size={18} className="text-laundry-text-muted" />
                                    <span className="text-xs font-bold text-laundry-text-secondary uppercase tracking-widest">Commande</span>
                                </div>
                                <h2 className="text-3xl font-bold text-laundry-text-primary tracking-tight">
                                    {commande.numeroCommande}
                                </h2>
                                <div className="mt-3">
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-transparent ${statusCfg.bg} ${statusCfg.text}`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`}></span>
                                        <span className="text-xs font-bold uppercase tracking-wider">{statusCfg.label}</span>
                                    </span>
                                </div>
                            </div>

                            {statusLabel && (
                                <button
                                    onClick={handleAdvanceStatus}
                                    disabled={isUpdatingStatus}
                                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-laundry-primary text-white rounded-md text-sm font-semibold hover:bg-laundry-primary-hover shadow-sm transition-colors active:scale-95 disabled:opacity-50"
                                >
                                    {isUpdatingStatus ? <Loader2 size={18} className="animate-spin" /> : <ChevronRight size={18} />}
                                    <span>{statusLabel}</span>
                                </button>
                            )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-laundry-border pt-6">
                            <div className="p-4 bg-laundry-background rounded-lg border border-laundry-border">
                                <p className="text-[10px] font-bold text-laundry-text-secondary uppercase tracking-wider mb-1">Création</p>
                                <p className="text-sm font-bold text-laundry-text-primary">{formatDate(commande.dateCreation)}</p>
                            </div>
                            <div className="p-4 bg-laundry-background rounded-lg border border-laundry-border">
                                <p className="text-[10px] font-bold text-laundry-text-secondary uppercase tracking-wider mb-1">Articles</p>
                                <p className="text-sm font-bold text-laundry-text-primary">{commande.commandeTapis?.length} Tapis</p>
                            </div>
                            <div className="p-4 bg-laundry-background rounded-lg border border-laundry-border">
                                <p className="text-[10px] font-bold text-laundry-text-secondary uppercase tracking-wider mb-1">Montant</p>
                                <p className="text-sm font-bold text-laundry-text-primary">{commande.montantTotal} DH</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center gap-3 px-2">
                            <Package size={20} className="text-laundry-text-muted" />
                            <h3 className="text-lg font-bold text-laundry-text-primary">Articles</h3>
                            <span className="text-xs font-semibold text-laundry-text-secondary bg-laundry-background px-2 py-0.5 rounded-full border border-laundry-border ml-auto">
                                {commande.commandeTapis?.length}
                            </span>
                        </div>
                        {commande.commandeTapis?.map((item, idx) => (
                            <TapisItemCard
                                key={item.id}
                                item={item}
                                isUpdating={isUpdatingTapis}
                                onUpdateEtat={handleUpdateTapisEtat}
                                onPreview={setPreviewImage}
                            />
                        ))}
                    </div>
                </div>

                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white rounded-xl shadow-card border border-laundry-border p-6 flex flex-col items-center">
                        <h4 className="text-sm font-bold text-laundry-text-primary mb-6 w-full text-center pb-4 border-b border-laundry-border">Avancement</h4>
                        <div className="relative w-32 h-32 mb-6">
                            <svg className="w-full h-full transform -rotate-90">
                                <circle
                                    cx="64" cy="64" r="58"
                                    stroke="currentColor"
                                    strokeWidth="8"
                                    fill="transparent"
                                    className="text-laundry-background"
                                />
                                <circle
                                    cx="64" cy="64" r="58"
                                    stroke="currentColor"
                                    strokeWidth="8"
                                    fill="transparent"
                                    strokeDasharray={364.4}
                                    strokeDashoffset={364.4 - (364.4 * progress) / 100}
                                    strokeLinecap="round"
                                    className="text-laundry-primary transition-all duration-1000 ease-out"
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-2xl font-bold text-laundry-text-primary leading-none mb-1">{progress}%</span>
                            </div>
                        </div>
                        <p className="text-xs font-semibold text-laundry-text-secondary text-center">
                            {commande.commandeTapis?.filter(t => t.etat === TAPIS_ETAT.NETTOYE).length} sur {commande.commandeTapis?.length} tapis terminés
                        </p>
                    </div>

                    <div className="bg-white rounded-xl shadow-card border border-laundry-border p-6">
                        <h4 className="text-sm font-bold text-laundry-text-primary mb-4 pb-4 border-b border-laundry-border flex items-center gap-2">
                            <Info size={16} className="text-laundry-text-muted" />
                            Informations
                        </h4>
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <p className="text-[10px] font-semibold text-laundry-text-secondary uppercase tracking-wider">Livreur Assigné</p>
                                <div className="p-3 bg-laundry-background rounded-lg border border-laundry-border flex items-center gap-3">
                                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center font-bold text-xs text-laundry-primary border border-laundry-border shadow-sm">
                                        {commande.livreur?.name?.[0] || '—'}
                                    </div>
                                    <span className="text-sm font-bold text-laundry-text-primary">{commande.livreur?.name || 'Non assigné'}</span>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-semibold text-laundry-text-secondary uppercase tracking-wider">Mode Paiement</p>
                                <div className="p-3 bg-laundry-background rounded-lg border border-laundry-border flex items-center gap-3">
                                    <DollarSign size={16} className="text-laundry-text-muted" />
                                    <span className="text-sm font-bold text-laundry-text-primary">{commande.modePaiement || 'En attente'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <ImagePreviewModal
                src={previewImage}
                isOpen={!!previewImage}
                onClose={() => setPreviewImage(null)}
            />
        </div>
    );
}
