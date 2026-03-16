import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
    Plus,
    Minus,
    Trash2,
    MapPin,
    User,
    Package,
    DollarSign,
    ClipboardCheck,
    Camera,
    Image as ImageIcon,
    X,
    Star,
    Phone
} from 'lucide-react';
import { createOrder, uploadImages } from '../../store/livreur/livreurThunk';
import { selectLoading, selectPendingClient } from '../../store/livreur/livreurSelectors';

export default function CreateOrder() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const pendingClient = useSelector(selectPendingClient);
    const loading = useSelector(selectLoading);

    const [carpetItems, setCarpetItems] = useState([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newCarpet, setNewCarpet] = useState({
        nom: '',
        description: '',
        prixUnitaire: '',
        quantite: 1,
        imageUrls: [],
        mainImageIndex: 0
    });

    const [uploadingImage, setUploadingImage] = useState(false);

    useEffect(() => {
        if (!pendingClient && !loading?.pendingClient) {
            toast.warning("Aucun client en attente.");
            navigate('/livreur/dashboard');
        }
    }, [pendingClient, loading, navigate]);

    const handleAddCarpet = () => {
        if (!newCarpet.nom || !newCarpet.prixUnitaire) {
            return toast.warning("Veuillez remplir le nom et le prix");
        }

        const carpet = {
            id: Date.now(),
            nom: newCarpet.nom,
            description: newCarpet.description,
            prixUnitaire: parseFloat(newCarpet.prixUnitaire),
            quantite: parseInt(newCarpet.quantite),
            imageUrls: newCarpet.imageUrls,
            mainImageIndex: newCarpet.mainImageIndex
        };

        setCarpetItems([...carpetItems, carpet]);
        resetNewCarpet();
        setShowAddForm(false);
        toast.success("Tapis ajouté avec ses images");
    };

    const handleImageUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        setUploadingImage(true);
        try {
            const results = await dispatch(uploadImages(files)).unwrap();
            const newUrls = results.map(r => r.imageUrl);

            setNewCarpet(prev => ({
                ...prev,
                imageUrls: [...prev.imageUrls, ...newUrls]
            }));
            toast.success(`${files.length} image(s) ajoutée(s)`);
        } catch (err) {
            toast.error("Échec de l'upload: " + err);
        } finally {
            setUploadingImage(false);
            e.target.value = null;
        }
    };

    const removeImage = (index) => {
        setNewCarpet(prev => {
            const newUrls = prev.imageUrls.filter((_, i) => i !== index);
            let newMainIndex = prev.mainImageIndex;
            if (index === prev.mainImageIndex) newMainIndex = 0;
            else if (index < prev.mainImageIndex) newMainIndex--;

            return {
                ...prev,
                imageUrls: newUrls,
                mainImageIndex: Math.max(0, newMainIndex)
            };
        });
    };

    const setMainImage = (index) => {
        setNewCarpet(prev => ({ ...prev, mainImageIndex: index }));
    };

    const resetNewCarpet = () => {
        setNewCarpet({
            nom: '',
            description: '',
            prixUnitaire: '',
            quantite: 1,
            imageUrls: [],
            mainImageIndex: 0
        });
    };

    const handleRemoveCarpet = (id) => {
        setCarpetItems(carpetItems.filter(item => item.id !== id));
        toast.info("Tapis supprimé");
    };

    const handleUpdateQuantity = (id, delta) => {
        setCarpetItems(carpetItems.map(item => {
            if (item.id === id) {
                const newQty = Math.max(1, item.quantite + delta);
                return { ...item, quantite: newQty };
            }
            return item;
        }));
    };

    const totalItems = carpetItems.reduce((sum, item) => sum + item.quantite, 0);
    const totalPrice = carpetItems.reduce((sum, item) => sum + (item.prixUnitaire * item.quantite), 0);

    const handleCreateOrder = async () => {
        if (carpetItems.length === 0) {
            return toast.warning("Veuillez ajouter au moins un tapis");
        }

        const tapisPayload = carpetItems.map(item => ({
            nom: item.nom,
            description: item.description || '',
            prixUnitaire: item.prixUnitaire,
            quantite: item.quantite,
            imageUrls: item.imageUrls,
            mainImageIndex: item.mainImageIndex
        }));

        try {
            await dispatch(createOrder({
                clientId: pendingClient.id,
                tapis: tapisPayload
            })).unwrap();

            toast.success("Commande créée avec succès !");
            navigate('/livreur/dashboard');
        } catch (err) {
            toast.error(err || "Erreur lors de la création de la commande");
        }
    };

    if (!pendingClient) return null;

    return (
        <div className="max-w-3xl mx-auto space-y-6 animate-fade-in pb-32 p-4 sm:p-6">
            <div className="mb-4">
                <h1 className="text-2xl font-bold text-laundry-text-primary">Nouvelle Collecte</h1>
                <p className="text-sm font-medium text-laundry-text-secondary">Enregistrement des tapis pour le client en cours</p>
            </div>

            {/* CLIENT CONTEXT SECTION */}
            <div className="bg-white rounded-xl border border-laundry-border p-6 shadow-sm flex flex-col md:flex-row gap-6 md:items-center justify-between">
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-laundry-primary/10 text-laundry-primary rounded-full flex items-center justify-center font-bold border border-laundry-primary/20">
                            {pendingClient.name[0].toUpperCase()}
                        </div>
                        <div>
                            <span className="text-[10px] font-bold text-laundry-text-secondary uppercase tracking-widest">Client</span>
                            <h2 className="text-lg font-bold text-laundry-text-primary leading-none mt-0.5">{pendingClient.name}</h2>
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-laundry-text-secondary">
                        <MapPin size={16} />
                        <p className="text-sm font-medium pr-2 max-w-[250px] truncate">
                            {pendingClient.addresses?.[0]?.address || 'Adresse non renseignée'}
                        </p>
                    </div>
                    <div className="flex items-center gap-2 text-laundry-text-secondary">
                        <Phone size={16} />
                        <p className="text-sm font-medium pr-2">
                            {pendingClient.phones?.[0]?.phoneNumber || 'Téléphone non renseigné'}
                        </p>
                    </div>
                </div>
            </div>

            {/* ITEM SELECTION MODULE */}
            <div className="bg-white rounded-xl border border-laundry-border shadow-sm overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-laundry-border bg-laundry-background">
                    <h3 className="text-sm font-bold text-laundry-text-primary flex items-center gap-2">
                        <Package size={18} className="text-laundry-primary" /> Inventaire
                    </h3>
                    <button
                        onClick={() => setShowAddForm(!showAddForm)}
                        className={`text-xs font-semibold px-3 py-1.5 rounded flex items-center gap-1.5 transition-colors ${showAddForm ? 'bg-laundry-error/10 text-laundry-error' : 'bg-laundry-primary text-white hover:bg-laundry-primary-hover'}`}
                    >
                        {showAddForm ? <Minus size={14} /> : <Plus size={14} />}
                        {showAddForm ? 'Annuler' : 'Ajouter'}
                    </button>
                </div>

                {/* ADD FORM */}
                {showAddForm && (
                    <div className="p-4 sm:p-6 bg-laundry-background border-b border-laundry-border space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-laundry-text-secondary">Type de Tapis</label>
                                <input
                                    type="text"
                                    placeholder="Ex: Salon Oriental"
                                    value={newCarpet.nom}
                                    onChange={(e) => setNewCarpet({ ...newCarpet, nom: e.target.value })}
                                    className="w-full border border-laundry-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-laundry-primary text-laundry-text-primary"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-laundry-text-secondary">Prix Estimé (DH)</label>
                                <div className="relative">
                                    <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-laundry-text-muted" />
                                    <input
                                        type="number"
                                        placeholder="0.00"
                                        value={newCarpet.prixUnitaire}
                                        onChange={(e) => setNewCarpet({ ...newCarpet, prixUnitaire: e.target.value })}
                                        className="w-full border border-laundry-border rounded-md pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-laundry-primary text-laundry-text-primary"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-laundry-text-secondary">État / Notes</label>
                            <textarea
                                placeholder="Taches, déchirures..."
                                rows="2"
                                value={newCarpet.description}
                                onChange={(e) => setNewCarpet({ ...newCarpet, description: e.target.value })}
                                className="w-full border border-laundry-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-laundry-primary text-laundry-text-primary resize-none"
                            />
                        </div>

                        {/* IMAGE UPLOAD SECTION */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-semibold text-laundry-text-secondary">Photos</label>
                                <span className="text-xs font-semibold text-laundry-primary">{newCarpet.imageUrls.length} image(s)</span>
                            </div>

                            <div className="flex gap-3">
                                <label className="flex-1 border border-dashed border-laundry-border rounded-md p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-white hover:border-laundry-primary transition-colors bg-laundry-background">
                                    <Camera size={20} className="text-laundry-text-muted mb-1" />
                                    <span className="text-[10px] font-semibold text-laundry-text-secondary uppercase">Appareil</span>
                                    <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleImageUpload} />
                                </label>

                                <label className="flex-1 border border-dashed border-laundry-border rounded-md p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-white hover:border-laundry-primary transition-colors bg-laundry-background">
                                    <ImageIcon size={20} className="text-laundry-text-muted mb-1" />
                                    <span className="text-[10px] font-semibold text-laundry-text-secondary uppercase">Galerie</span>
                                    <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
                                </label>
                            </div>

                            {newCarpet.imageUrls.length > 0 && (
                                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 pt-2">
                                    {newCarpet.imageUrls.map((url, idx) => (
                                        <div key={idx} className={`relative aspect-square rounded-md overflow-hidden border ${newCarpet.mainImageIndex === idx ? 'border-laundry-primary ring-1 ring-laundry-primary' : 'border-laundry-border'}`}>
                                            <img src={`http://localhost:8080${url}`} alt="Preview" className="w-full h-full object-cover" />
                                            <button onClick={() => removeImage(idx)} className="absolute top-1 right-1 p-0.5 bg-white/80 rounded-full shadow hover:bg-white text-laundry-error">
                                                <X size={12} />
                                            </button>
                                            <button onClick={() => setMainImage(idx)} className={`absolute bottom-1 left-1 p-0.5 rounded-full shadow ${newCarpet.mainImageIndex === idx ? 'bg-yellow-400 text-white' : 'bg-white/80 text-laundry-text-muted hover:bg-white'}`}>
                                                <Star size={10} fill={newCarpet.mainImageIndex === idx ? 'currentColor' : 'none'} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {uploadingImage && (
                                <p className="text-xs text-laundry-primary animate-pulse">Upload des images en cours...</p>
                            )}
                        </div>

                        <div className="flex justify-end pt-2 border-t border-laundry-border">
                            <button
                                onClick={handleAddCarpet}
                                className="px-6 py-2 bg-laundry-primary text-white rounded-md text-sm font-semibold hover:bg-laundry-primary-hover shadow-sm transition-colors"
                            >
                                Valider l'article
                            </button>
                        </div>
                    </div>
                )}

                {/* BAG REVIEW LIST */}
                <div className="divide-y divide-laundry-border">
                    {carpetItems.length === 0 && !showAddForm ? (
                        <div className="py-12 flex flex-col items-center justify-center text-center">
                            <Package size={32} className="text-laundry-text-muted opacity-50 mb-3" />
                            <p className="text-sm font-medium text-laundry-text-secondary">Aucun tapis ajouté.<br/>Cliquez sur "Ajouter" pour commencer.</p>
                        </div>
                    ) : (
                        carpetItems.map((item, idx) => (
                            <div key={item.id} className="p-4 flex flex-col sm:flex-row sm:items-center gap-4 hover:bg-laundry-background transition-colors">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-bold text-sm text-laundry-text-primary">{item.nom}</h4>
                                        <span className="text-xs font-semibold text-laundry-primary bg-blue-50 px-2 py-0.5 rounded border border-blue-100">{item.prixUnitaire} DH/u</span>
                                    </div>
                                    {item.description && <p className="text-xs text-laundry-text-secondary mt-1 max-w-sm truncate">{item.description}</p>}
                                </div>

                                <div className="flex items-center justify-between sm:justify-end gap-6 sm:w-auto">
                                    <div className="flex items-center bg-white border border-laundry-border rounded-md overflow-hidden">
                                        <button
                                            onClick={() => handleUpdateQuantity(item.id, -1)}
                                            disabled={item.quantite <= 1}
                                            className="px-2 py-1.5 hover:bg-laundry-background disabled:opacity-50 text-laundry-text-secondary"
                                        >
                                            <Minus size={14} />
                                        </button>
                                        <span className="w-8 text-center text-sm font-bold border-x border-laundry-border py-1">{item.quantite}</span>
                                        <button
                                            onClick={() => handleUpdateQuantity(item.id, 1)}
                                            className="px-2 py-1.5 hover:bg-laundry-background text-laundry-text-secondary"
                                        >
                                            <Plus size={14} />
                                        </button>
                                    </div>

                                    <button
                                        onClick={() => handleRemoveCarpet(item.id)}
                                        className="p-1.5 text-laundry-text-muted hover:text-laundry-error transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* STICKY FOOTER SUMMARY */}
            {carpetItems.length > 0 && (
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-laundry-border z-50 md:left-64 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                    <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-6 w-full sm:w-auto">
                            <div>
                                <span className="block text-[10px] font-semibold text-laundry-text-secondary uppercase">Articles</span>
                                <span className="font-bold text-laundry-text-primary">{totalItems} Tapis</span>
                            </div>
                            <div>
                                <span className="block text-[10px] font-semibold text-laundry-text-secondary uppercase">Total Estimé</span>
                                <span className="font-bold text-laundry-primary text-lg leading-none">{totalPrice.toFixed(0)} DH</span>
                            </div>
                        </div>

                        <button
                            onClick={handleCreateOrder}
                            disabled={loading?.createOrder}
                            className="w-full sm:w-auto bg-laundry-primary text-white px-8 py-3 rounded-md font-semibold text-sm shadow-sm hover:bg-laundry-primary-hover transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {loading?.createOrder ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <ClipboardCheck size={18} />
                                    Confirmer la Collecte
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
