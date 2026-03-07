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

// ─── Status Configs ───────────────────────────────────────────────────────────
const STATUS_CONFIG = {
    [COMMANDE_STATUS.EN_ATTENTE]: { label: 'En Attente', bg: 'bg-amber-500/10', text: 'text-amber-600', dot: 'bg-amber-600', Icon: Clock },
    [COMMANDE_STATUS.VALIDEE]: { label: 'Validée', bg: 'bg-blue-500/10', text: 'text-blue-600', dot: 'bg-blue-600', Icon: CheckCircle2 },
    [COMMANDE_STATUS.EN_TRAITEMENT]: { label: 'En Traitement', bg: 'bg-purple-500/10', text: 'text-purple-600', dot: 'bg-purple-600', Icon: Wrench },
    [COMMANDE_STATUS.PRETE]: { label: 'Prête', bg: 'bg-green-500/10', text: 'text-green-600', dot: 'bg-green-600', Icon: CheckCircle2 },
    [COMMANDE_STATUS.LIVREE]: { label: 'Sortie', bg: 'bg-teal-500/10', text: 'text-teal-600', dot: 'bg-teal-600', Icon: Truck },
    [COMMANDE_STATUS.PAYEE]: { label: 'Payée', bg: 'bg-emerald-500/10', text: 'text-emerald-600', dot: 'bg-emerald-600', Icon: CheckCircle2 },
    [COMMANDE_STATUS.ANNULEE]: { label: 'Annulée', bg: 'bg-red-500/10', text: 'text-red-500', dot: 'bg-red-500', Icon: ClipboardList },
};

const ETAT_CONFIG = {
    [TAPIS_ETAT.EN_ATTENTE]: { label: 'En Attente', color: 'text-amber-500', bg: 'bg-amber-500/5', border: 'border-amber-500/20', Icon: Clock, next: TAPIS_ETAT.EN_NETTOYAGE },
    [TAPIS_ETAT.EN_NETTOYAGE]: { label: 'Nettoyage', color: 'text-blue-500', bg: 'bg-blue-500/5', border: 'border-blue-500/20', Icon: Wrench, next: TAPIS_ETAT.NETTOYE },
    [TAPIS_ETAT.NETTOYE]: { label: 'Terminé', color: 'text-green-500', bg: 'bg-green-500/5', border: 'border-green-500/20', Icon: CheckCircle2, next: null },
    [TAPIS_ETAT.LIVRE]: { label: 'Livré', color: 'text-emerald-500', bg: 'bg-emerald-500/5', border: 'border-emerald-500/20', Icon: Truck, next: null },
};

const NEXT_COMMAND_LABEL = {
    [COMMANDE_STATUS.EN_ATTENTE]: 'Valider la commande',
    [COMMANDE_STATUS.VALIDEE]: 'Démarrer le traitement',
    [COMMANDE_STATUS.EN_TRAITEMENT]: 'Marquer comme Prête',
    [COMMANDE_STATUS.PRETE]: 'Marquer comme Sortie',
};

const NEXT_COMMANDE_STATUS = {
    [COMMANDE_STATUS.EN_ATTENTE]: COMMANDE_STATUS.VALIDEE,
    [COMMANDE_STATUS.VALIDEE]: COMMANDE_STATUS.EN_TRAITEMENT,
    [COMMANDE_STATUS.EN_TRAITEMENT]: COMMANDE_STATUS.PRETE,
    [COMMANDE_STATUS.PRETE]: COMMANDE_STATUS.LIVREE,
};

// ─── Sub-Components ───────────────────────────────────────────────────────────

const ImagePreviewModal = ({ src, isOpen, onClose }) => {
    if (!isOpen) return null;
    return (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-12 bg-laundry-deep/95 backdrop-blur-xl animate-fade-in"
            onClick={onClose}
        >
            <div
                className="relative w-full h-full flex items-center justify-center animate-scale-up"
                onClick={e => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-0 right-0 m-4 p-4 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md border border-white/20 transition-all z-20 group shadow-2xl"
                >
                    <X size={32} className="group-hover:rotate-90 transition-transform duration-300" />
                </button>

                {/* Image Container */}
                <div className="relative max-w-full max-h-full rounded-[2.5rem] overflow-hidden shadow-[0_0_100px_rgba(34,211,238,0.2)] border-4 border-white/10 select-none">
                    <img
                        src={`http://localhost:8080${src}`}
                        alt="Zoomed Tapis"
                        className="max-w-full max-h-[85vh] object-contain transition-transform duration-700 hover:scale-105"
                    />

                    {/* Bottom Info Overlay */}
                    <div className="absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-laundry-fresh animate-pulse"></div>
                            <span className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Aperçu Haute Définition</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const TapisImageGallery = ({ images, onPreview, label }) => {
    return (
        <div className="space-y-3">
            {label && (
                <div className="flex items-center gap-2 px-1">
                    <span className="text-[10px] font-black text-laundry-deep uppercase tracking-widest leading-none">
                        {label}
                    </span>
                    <div className="h-px flex-1 bg-laundry-sky/30"></div>
                </div>
            )}

            {(!images || images.length === 0) ? (
                <div className="w-full h-24 bg-laundry-sky/10 rounded-2xl flex flex-col items-center justify-center gap-1 border-2 border-dashed border-laundry-sky/30">
                    <ImageIcon size={16} className="text-laundry-deep/10" />
                    <span className="text-[8px] font-black text-laundry-deep/20 uppercase tracking-tighter">Aucune image</span>
                </div>
            ) : (
                <div className="grid grid-cols-3 gap-2">
                    {images.map((img, idx) => (
                        <div
                            key={idx}
                            className="relative group aspect-square rounded-xl overflow-hidden cursor-pointer bg-laundry-sky/50 border border-laundry-sky/20"
                            onClick={() => onPreview(img.imageUrl)}
                        >
                            <img
                                src={`http://localhost:8080${img.imageUrl}`}
                                alt="Tapis"
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=No+Image'; }}
                            />
                            <div className="absolute inset-0 bg-laundry-deep/0 group-hover:bg-laundry-deep/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                                <Maximize2 size={12} className="text-white" />
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

            // 2. Associate with tapis as AFTER type
            await dispatch(addTapisImages({
                tapisId,
                imageUrls,
                type: TAPIS_IMAGE_TYPE.AFTER
            })).unwrap();

            toast.success(`${imageUrls.length} image(s) ajoutée(s) avec succès`);
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
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-laundry-sky/20 hover:bg-laundry-sky/40 text-laundry-deep rounded-2xl border-2 border-dashed border-laundry-sky text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50 group"
            >
                {uploading ? (
                    <Loader2 size={14} className="animate-spin text-laundry-primary" />
                ) : (
                    <Plus size={14} className="text-laundry-primary group-hover:scale-125 transition-transform" />
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
        <div className={`p-8 bg-white rounded-[2.5rem] border-2 transition-all shadow-sm flex flex-col lg:flex-row gap-10 ${etatCfg.border}`}>
            {/* Gallery Section */}
            <div className="w-full lg:w-48 space-y-6">
                <TapisImageGallery
                    images={beforeImages}
                    onPreview={onPreview}
                    label="Avant Nettoyage"
                />

                <TapisImageGallery
                    images={afterImages}
                    onPreview={onPreview}
                    label="Après Nettoyage"
                />

                <TapisImageUpload
                    tapisId={tapisInfo.id}
                />
            </div>

            {/* Content Section */}
            <div className="flex-1 space-y-6">
                <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <span className="text-[9px] font-black text-laundry-primary bg-laundry-sky px-3 py-1 rounded-full uppercase tracking-widest leading-none">
                                Commande Tapis #{item.id}
                            </span>
                        </div>
                        <h4 className="font-black text-laundry-deep uppercase tracking-tighter text-2xl leading-tight">
                            {tapisInfo.nom || `Tapis sans nom`}
                        </h4>
                    </div>

                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl ${etatCfg.bg} ${etatCfg.color} border border-current/10`}>
                        <StatusIcon size={14} strokeWidth={3} />
                        <span className="text-[10px] font-black uppercase tracking-widest">{etatCfg.label}</span>
                    </div>
                </div>

                {tapisInfo.description && (
                    <p className="text-xs font-bold text-laundry-deep/40 bg-laundry-sky/10 p-4 rounded-2xl border-l-4 border-laundry-primary italic leading-relaxed">
                        "{tapisInfo.description}"
                    </p>
                )}

                <div className="grid grid-cols-3 gap-4 md:gap-8 p-6 bg-laundry-sky/10 rounded-[2rem]">
                    <div className="space-y-1 min-w-0">
                        <p className="text-[9px] font-black text-laundry-deep/30 uppercase tracking-[0.2em] truncate">Quantité</p>
                        <p className="text-sm font-black text-laundry-deep uppercase truncate">{item.quantite || '1'} unités</p>
                    </div>
                    <div className="space-y-1 border-x border-laundry-sky/30 px-4 md:px-8 min-w-0">
                        <p className="text-[9px] font-black text-laundry-deep/30 uppercase tracking-[0.2em] truncate">Prix Unit.</p>
                        <p className="text-sm font-black text-laundry-deep uppercase truncate">{item.prixUnitaire} DH</p>
                    </div>
                    <div className="space-y-1 text-right min-w-0">
                        <p className="text-[9px] font-black text-laundry-deep/30 uppercase tracking-[0.2em] truncate">Sous-Total</p>
                        <p className="text-sm font-black text-laundry-primary uppercase truncate">{item.sousTotal} DH</p>
                    </div>
                </div>

                {/* Status Advancement Button */}
                <div className="pt-2">
                    {etatCfg.next ? (
                        <button
                            onClick={() => onUpdateEtat(item.id, etatCfg.next)}
                            disabled={isUpdating}
                            className="w-full flex items-center justify-center gap-3 py-5 bg-laundry-deep text-white rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-laundry-deep/20 hover:bg-laundry-primary transition-all active:scale-95 disabled:opacity-50 group"
                        >
                            {isUpdating ? (
                                <Loader2 size={16} className="animate-spin" />
                            ) : (
                                <>
                                    <span>Passer à : {ETAT_CONFIG[etatCfg.next]?.label}</span>
                                    <ChevronRight size={16} strokeWidth={3} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    ) : item.etat === TAPIS_ETAT.NETTOYE && (
                        <div className="w-full p-5 bg-green-500/10 text-green-600 rounded-[1.5rem] flex items-center justify-center gap-3 border border-green-500/20">
                            <CheckCircle size={18} strokeWidth={3} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Traitement terminé</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// ─── Main Redesign ────────────────────────────────────────────────────────────
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
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }) : '—';

    if (isLoading || !commande) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 py-20 animate-fade-in">
                <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center shadow-xl border border-laundry-sky mb-4">
                    <Loader2 size={32} className="text-laundry-primary animate-spin" />
                </div>
                <h3 className="text-xl font-black text-laundry-deep uppercase tracking-tighter">Chargement de la commande</h3>
                <p className="text-[10px] font-black uppercase tracking-widest text-laundry-deep/30">Veuillez patienter quelques instants...</p>
            </div>
        );
    }

    const statusCfg = STATUS_CONFIG[commande.status] || STATUS_CONFIG[COMMANDE_STATUS.EN_ATTENTE];
    const statusLabel = NEXT_COMMAND_LABEL[commande.status];
    const progress = commande.commandeTapis?.length > 0
        ? Math.round((commande.commandeTapis.filter(t => t.etat === TAPIS_ETAT.NETTOYE || t.etat === TAPIS_ETAT.LIVRE).length / commande.commandeTapis.length) * 100)
        : 0;

    return (
        <div className="max-w-5xl mx-auto space-y-10 animate-fade-in pb-20">
            {/* Header / Breadcrumb */}
            <div className="px-2 flex items-center justify-between">
                <button
                    onClick={() => navigate('/employe/dashboard')}
                    className="flex items-center gap-2 text-laundry-deep font-black uppercase tracking-widest text-[10px] hover:text-laundry-primary transition-all group"
                >
                    <ArrowLeft size={16} strokeWidth={3} className="group-hover:-translate-x-1 transition-transform" />
                    <span>Retour au tableau de bord</span>
                </button>

                <div className="flex items-center gap-4">
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] font-black text-laundry-deep/30 uppercase tracking-[0.2em]">Ref. Commande</span>
                        <span className="text-sm font-black text-laundry-deep uppercase tracking-tighter">{commande.numeroCommande}</span>
                    </div>
                    <div className="w-10 h-10 bg-laundry-primary/10 rounded-xl flex items-center justify-center">
                        <Hash size={18} className="text-laundry-primary" />
                    </div>
                </div>
            </div>

            {/* Layout Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

                {/* Left Column: Client & Items */}
                <div className="lg:col-span-8 space-y-10">

                    {/* Section 1: Command Header & Action */}
                    <div className="bg-laundry-deep rounded-[3rem] p-8 md:p-12 text-white relative overflow-hidden shadow-2xl">
                        <div className="absolute top-0 right-0 w-80 h-80 bg-laundry-primary/10 rounded-full -mr-40 -mt-40 blur-3xl animate-pulse"></div>
                        <div className="relative z-10 space-y-8">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div className="space-y-1">
                                    <h2 className="text-4xl font-black uppercase tracking-tighter leading-none">
                                        Commande <span className="text-laundry-fresh">#{commande.id}</span>
                                    </h2>
                                    <div className="flex items-center gap-3">
                                        <div className={`p-1.5 rounded-full ${statusCfg.bg}`}>
                                            <div className={`w-2 h-2 rounded-full ${statusCfg.dot} animate-pulse`}></div>
                                        </div>
                                        <span className="text-xs font-black uppercase tracking-widest text-white/70">{statusCfg.label}</span>
                                    </div>
                                </div>

                                {statusLabel && (
                                    <button
                                        onClick={handleAdvanceStatus}
                                        disabled={isUpdatingStatus}
                                        className="inline-flex items-center justify-center gap-3 px-8 py-5 bg-laundry-primary text-white rounded-[2rem] text-xs font-black uppercase tracking-[0.2em] shadow-2xl shadow-laundry-primary/20 hover:bg-laundry-fresh hover:text-laundry-deep transition-all active:scale-95 disabled:opacity-50"
                                    >
                                        {isUpdatingStatus ? <Loader2 size={18} className="animate-spin" /> : <ChevronRight size={18} strokeWidth={3} />}
                                        <span>{statusLabel}</span>
                                    </button>
                                )}
                            </div>

                            <div className="h-px bg-white/10"></div>

                            {/* Summary Metrics */}
                            <div className="grid grid-cols-3 gap-6">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Date Création</p>
                                    <p className="text-xs font-bold">{formatDate(commande.dateCreation)}</p>
                                </div>
                                <div className="space-y-1 text-center border-x border-white/10 px-4">
                                    <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Total Tapis</p>
                                    <p className="text-xs font-bold">{commande.commandeTapis?.length} Articles</p>
                                </div>
                                <div className="space-y-1 text-right">
                                    <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Montant Total</p>
                                    <p className="text-sm font-black text-laundry-fresh uppercase">{commande.montantTotal} DH</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Tapis Inventory */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between px-2">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-laundry-primary text-white rounded-2xl flex items-center justify-center shadow-lg shadow-laundry-primary/20">
                                    <Package size={20} />
                                </div>
                                <h3 className="font-black text-laundry-deep uppercase tracking-widest text-sm">Détails des Articles</h3>
                            </div>
                            <span className="text-[10px] font-black text-laundry-deep/30 uppercase tracking-widest bg-laundry-primary/5 px-4 py-2 rounded-full">
                                {commande.commandeTapis?.length} Tapis au total
                            </span>
                        </div>

                        <div className="space-y-6">
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
                </div>

                {/* Right Column: Sidebar info */}
                <div className="lg:col-span-4 space-y-10">

                    {/* Progress Monitor */}
                    <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-laundry-sky flex flex-col items-center">
                        <div className="relative w-32 h-32 mb-6">
                            <svg className="w-full h-full transform -rotate-90">
                                <circle
                                    cx="64" cy="64" r="58"
                                    stroke="currentColor"
                                    strokeWidth="8"
                                    fill="transparent"
                                    className="text-laundry-sky/30"
                                />
                                <circle
                                    cx="64" cy="64" r="58"
                                    stroke="currentColor"
                                    strokeWidth="10"
                                    fill="transparent"
                                    strokeDasharray={364.4}
                                    strokeDashoffset={364.4 - (364.4 * progress) / 100}
                                    strokeLinecap="round"
                                    className="text-laundry-primary transition-all duration-1000 ease-out"
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-3xl font-black text-laundry-deep leading-none">{progress}%</span>
                                <span className="text-[9px] font-black text-laundry-deep/30 uppercase tracking-tighter">Traitement</span>
                            </div>
                        </div>

                        <div className="text-center space-y-1">
                            <h4 className="text-xs font-black text-laundry-deep uppercase tracking-widest">Moniteur de Flux</h4>
                            <p className="text-[10px] font-bold text-laundry-deep/30 uppercase tracking-tight">
                                {commande.commandeTapis?.filter(t => t.etat === TAPIS_ETAT.NETTOYE).length} / {commande.commandeTapis?.length} tapis terminés
                            </p>
                        </div>
                    </div>

                    {/* Order Meta Sidebar */}
                    <div className="bg-laundry-sky/30 rounded-[2rem] p-6 border-2 border-dashed border-laundry-sky/50 space-y-5">
                        <div className="flex items-center gap-3">
                            <Info size={16} className="text-laundry-deep/20" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-laundry-deep/40">Information suppl.</span>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                            <div className="space-y-1">
                                <p className="text-[9px] font-black text-laundry-deep/20 uppercase tracking-widest px-2">Livreur Associé</p>
                                <div className="p-3 bg-white/50 rounded-xl border border-white flex items-center gap-3 shadow-sm">
                                    <div className="w-8 h-8 bg-laundry-sky rounded-full flex items-center justify-center font-black text-xs text-laundry-deep/50">
                                        {commande.livreur?.name?.[0] || '—'}
                                    </div>
                                    <span className="text-xs font-black text-laundry-deep uppercase tracking-tight">{commande.livreur?.name || 'Non assigné'}</span>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[9px] font-black text-laundry-deep/20 uppercase tracking-widest px-2">Mode Paiement</p>
                                <div className="p-3 bg-white/50 rounded-xl border border-white flex items-center gap-3 shadow-sm">
                                    <DollarSign size={14} className="text-laundry-deep/30" />
                                    <span className="text-xs font-black text-laundry-deep uppercase tracking-tight">{commande.modePaiement || 'En attente'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal for images */}
            <ImagePreviewModal
                src={previewImage}
                isOpen={!!previewImage}
                onClose={() => setPreviewImage(null)}
            />
        </div>
    );
}

