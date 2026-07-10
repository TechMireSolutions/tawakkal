import { Heart, ShoppingBag, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../pages/CartContext';
import { useCurrency } from '../context/CurrencyContext';

const ProductCard = ({ product, className = '' }) => {
  const navigate = useNavigate();
  const { addToCart, toggleWishlist, wishlistItems } = useCart();
  const { convertPrice } = useCurrency();

  const handleQuickAdd = (e) => {
    e.stopPropagation();
    addToCart(product, 1, 'M', { name: 'Standard', hex: '#000000' });
  };

  const handleWishlist = (e) => {
    e.stopPropagation();
    toggleWishlist(product);
  };

  return (
    <div
      onClick={() => navigate(`/product/${product.id}`)}
      className={`group cursor-pointer ${className}`.trim()}
    >
      <div className="relative aspect-[3/4] overflow-hidden mb-3 sm:mb-5 bg-white rounded-lg sm:rounded-2xl shadow-sm sm:shadow-md group-hover:shadow-xl transition-all duration-500">
        <div className="absolute top-2 left-2 sm:top-4 sm:left-4 z-10 flex flex-col gap-2">
          {product.badges &&
            product.badges.map((badge) => (
              <div
                key={badge.id}
                className="text-white text-[8px] sm:text-[10px] font-bold uppercase tracking-widest px-2 py-1 sm:px-3 sm:py-1.5 rounded-full shadow-lg"
                style={{
                  backgroundColor:
                    badge.background_color || 'var(--admin-primary)',
                  color: badge.text_color || '#fff',
                }}
              >
                {badge.name}
              </div>
            ))}
          {product.discount_percentage && product.discount_percentage > 0 && (
            <div className="bg-[#ff3333] text-white text-[8px] sm:text-[10px] font-bold uppercase tracking-widest px-2 py-1 sm:px-3 sm:py-1.5 rounded-full shadow-lg">
              {product.discount_percentage}% OFF
            </div>
          )}
        </div>

        <img
          src={product.primary_image?.image_url || 'https://placehold.co/400x533?text=No+Image'}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <div className="absolute top-2 right-2 sm:top-4 sm:right-4 flex-col gap-2 translate-x-12 sm:group-hover:translate-x-0 transition-transform duration-300 hidden sm:flex">
          <button
            onClick={handleWishlist}
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white shadow-lg flex items-center justify-center text-charcoal hover:bg-gold hover:text-white transition-all"
          >
            <Heart
              size={14}
              className={
                wishlistItems.some((item) => item.id === product.id)
                  ? 'fill-red-500 text-red-500'
                  : ''
              }
            />
          </button>
          <button className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white shadow-lg flex items-center justify-center text-charcoal hover:bg-gold hover:text-white transition-all">
            <Eye size={14} />
          </button>
        </div>

        <div className="absolute bottom-2 left-2 right-2 sm:bottom-4 sm:left-4 sm:right-4 translate-y-20 group-hover:translate-y-0 transition-transform duration-300 hidden sm:block">
          <button
            onClick={handleQuickAdd}
            className="w-full bg-white text-charcoal py-3 sm:py-4 rounded-lg sm:rounded-xl text-[10px] sm:text-sm font-bold uppercase tracking-wider hover:bg-gold hover:text-white transition-all shadow-xl flex items-center justify-center gap-2"
          >
            <ShoppingBag size={16} />
            Add to Bag
          </button>
        </div>
      </div>

      <div className="space-y-1 sm:space-y-2 px-1">
        <div className="flex items-center gap-1 sm:gap-2">
          <p className="text-gold text-[8px] sm:text-[10px] uppercase tracking-[0.1em] sm:tracking-[0.2em] font-bold">
            {product.category?.name || 'All'}
          </p>
          <div className="h-px flex-1 bg-gray-100 sm:bg-gray-200" />
        </div>
        <h3 className="text-xs sm:text-lg font-bold group-hover:text-gold transition-colors line-clamp-1">
          {product.name}
        </h3>
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
          <div className="flex items-center gap-2">
            <p className="text-charcoal font-black text-sm sm:text-lg">
              {convertPrice(product.base_price)}
            </p>
            {product.compare_at_price &&
              parseFloat(product.compare_at_price) > parseFloat(product.base_price) && (
                <p className="text-gray-400 line-through text-[10px] sm:text-sm font-medium">
                  {convertPrice(product.compare_at_price)}
                </p>
              )}
          </div>
          <div className="flex text-gold text-[8px] sm:text-sm">★★★★★</div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
