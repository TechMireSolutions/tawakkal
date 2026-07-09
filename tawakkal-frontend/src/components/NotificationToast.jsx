import { useCart } from '../pages/CartContext';
import { CheckCircle, Info, X } from 'lucide-react';

const NotificationToast = () => {
    const { notification, setNotification } = useCart();

    if (!notification) return null;

    return (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[9999] animate-slide-up">
            <div className={`flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border backdrop-blur-md ${
                notification.type === 'success' 
                ? 'bg-charcoal/95 border-gold text-white' 
                : 'bg-white/95 border-gray-200 text-charcoal'
            }`}>
                {notification.type === 'success' ? (
                    <CheckCircle className="text-gold w-5 h-5" />
                ) : (
                    <Info className="text-blue-500 w-5 h-5" />
                )}
                <p className="text-sm font-bold tracking-wide uppercase">{notification.message}</p>
                <button 
                    onClick={() => setNotification(null)}
                    className="ml-2 hover:opacity-70 transition-opacity"
                >
                    <X size={16} />
                </button>
            </div>
        </div>
    );
};

export default NotificationToast;