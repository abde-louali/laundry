import { AlertTriangle, AlertCircle, CheckCircle2 } from "lucide-react";

export default function ConfirmModal({ isOpen, onClose, onConfirm, title, message, type = 'warning' }) {
    if (!isOpen) return null;

    const styles = {
        warning: {
            icon: <AlertTriangle size={24} className="text-laundry-warning" />,
            bg: "bg-laundry-warning-light",
            border: "border-laundry-warning/20",
            button: "bg-laundry-warning hover:bg-laundry-warning/80 text-white"
        },
        danger: {
            icon: <AlertCircle size={24} className="text-laundry-error" />,
            bg: "bg-laundry-error-light",
            border: "border-laundry-error/20",
            button: "bg-laundry-error hover:bg-laundry-error/80 text-white"
        },
        success: {
            icon: <CheckCircle2 size={24} className="text-laundry-success" />,
            bg: "bg-laundry-success-light",
            border: "border-laundry-success/20",
            button: "bg-laundry-success hover:bg-laundry-success/80 text-white"
        }
    };

    const currentStyle = styles[type] || styles.warning;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-laundry-text-primary/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-xl shadow-modal w-full max-w-sm overflow-hidden animate-slide-up">
                <div className="p-6">
                    <div className="flex flex-col items-center text-center gap-4">
                        <div className={`p-4 rounded-full ${currentStyle.bg} border ${currentStyle.border}`}>
                            {currentStyle.icon}
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-laundry-text-primary mb-2">
                                {title}
                            </h3>
                            <p className="text-sm text-laundry-text-secondary leading-relaxed">
                                {message}
                            </p>
                        </div>
                    </div>
                </div>
                
                <div className="flex gap-3 p-4 bg-laundry-background/50 border-t border-laundry-border">
                    <button
                        onClick={onClose}
                        className="flex-1 py-2.5 px-4 rounded-md text-sm font-medium text-laundry-text-secondary border border-laundry-border hover:bg-white transition-colors"
                    >
                        Annuler
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`flex-1 py-2.5 px-4 rounded-md text-sm font-medium transition-colors ${currentStyle.button}`}
                    >
                        Confirmer
                    </button>
                </div>
            </div>
        </div>
    );
}