import { useEffect } from 'react';
import { useCart } from './CartContext.jsx';
import { useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowRight, Heart } from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';

const Wishlist = () => {
  const { wishlistItems, toggleWishlist, addToCart } = useCart();
  const { convertPrice } = useCurrency();
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-[#fcfcfc] min-h-screen text-charcoal pt-24 sm:pt-32 pb-16 sm:pb-20">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-6 sm:pb-8 mb-8 sm:mb-12">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-charcoal font-serif">My Wishlist</h1>
            <p className="text-gray-500 text-xs sm:text-sm mt-1 sm:mt-2 uppercase tracking-widest">{wishlistItems.length} Saved Items</p>
          </div>
          <button 
            onClick={() => navigate('/products')}
            className="flex items-center gap-2 sm:gap-3 text-gold font-bold uppercase tracking-[0.2em] text-[9px] sm:text-[10px] hover:gap-5 transition-all w-fit"
          >
            Continue Shopping <ArrowRight size={14} />
          </button>
        </div>

        {wishlistItems.length === 0 ? (
          <div className="bg-white p-10 sm:p-20 rounded-[2rem] sm:rounded-[3rem] shadow-sm border border-gray-100 text-center flex flex-col items-center">
            <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-6 sm:mb-8">
              <Heart size={30} className="sm:w-[40px] sm:h-[40px]" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-charcoal mb-3 sm:mb-4">Your wishlist is empty</h3>
            <p className="text-gray-500 max-w-sm leading-relaxed mb-8 sm:text-sm text-xs px-4">
              Save items you love here to easily find them later and add them to your cart.
            </p>
            <button 
              onClick={() => navigate('/products')}
              className="bg-charcoal text-white px-8 sm:px-10 py-3 sm:py-4 rounded-xl sm:rounded-2xl text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-gold transition-all shadow-xl"
            >
              Discover Collections
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
            {wishlistItems.map((item) => (
              <div key={item.id} className="group bg-white rounded-2xl sm:rounded-[2.5rem] border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-500">
                <div 
                  className="aspect-[3/4] relative overflow-hidden cursor-pointer"
                  onClick={() => navigate(`/product/${item.id}`)}
                >
                  <img 
                    src={item.primary_image?.image_url || "https://placehold.co/400x533?text=No+Image"} 
                    alt={item.name} 
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                  />
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleWishlist(item);
                    }}
                    className="absolute top-3 right-3 sm:top-6 sm:right-6 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-red-500 shadow-lg hover:bg-red-500 hover:text-white transition-all"
                  >
                    <Trash2 size={14} className="sm:w-[16px] sm:h-[16px]" />
                  </button>
                </div>

                <div className="p-4 sm:p-8 space-y-3 sm:space-y-4">
                  <div>
                    <p className="text-[8px] sm:text-[9px] text-gold font-bold uppercase tracking-widest mb-0.5 sm:mb-1">{item.category?.name || item.category}</p>
                    <h4 className="text-sm sm:text-lg font-bold text-charcoal font-serif truncate group-hover:text-gold transition-colors">{item.name}</h4>
                    <p className="text-base sm:text-xl font-bold text-charcoal mt-0.5 sm:mt-1">{convertPrice(item.base_price)}</p>
                  </div>

                  <button 
                    onClick={() => addToCart(item, 1, 'M', { name: 'Default', hex: '#000' })}
                    className="w-full py-3 sm:py-4 bg-charcoal text-white rounded-xl sm:rounded-2xl text-[8px] sm:text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-gold transition-all flex items-center justify-center gap-2 sm:gap-3 shadow-lg"
                  >
                    <ShoppingBag size={12} className="sm:w-[14px] sm:h-[14px]" /> <span className="hidden sm:inline">Add to Cart</span><span className="sm:hidden">Add</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
