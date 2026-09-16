import { Link } from "react-router-dom";
import { Globe, User, Heart, ShoppingBag } from "lucide-react";

const MobileMenu = ({
  isOpen,
  setIsOpen,
  scrolled,
  brands,
  categories,
  badges,
  wishlistItems,
  cartItems,
}) => {
  return (
    <div
      className={`md:hidden fixed inset-0 bg-black z-40 transition-all duration-300 ${
        isOpen ? "opacity-100 visible pointer-events-auto" : "opacity-0 invisible pointer-events-none"
      }`}
      style={{ top: scrolled ? "56px" : "80px" }}
    >
      <div className="px-6 py-8 space-y-6 h-full overflow-y-auto bg-black text-white pb-32">
        <Link
          to="/"
          onClick={() => setIsOpen(false)}
          className="block text-white hover:text-gold uppercase text-sm font-semibold tracking-widest py-2 border-b border-white/10"
        >
          Home
        </Link>
        {brands.map((brand) => (
          <Link
            key={brand.id}
            to={`/brand/${encodeURIComponent(brand.slug)}`}
            onClick={() => setIsOpen(false)}
            className="block text-white hover:text-gold uppercase text-sm font-semibold tracking-widest py-2 border-b border-white/10"
          >
            {brand.name}
          </Link>
        ))}

        {categories.map((cat) => (
          <Link
            key={cat.id}
            to={`/category/${encodeURIComponent(cat.slug)}`}
            onClick={() => setIsOpen(false)}
            className="block text-white hover:text-gold uppercase text-sm font-semibold tracking-widest py-2 border-b border-white/10"
          >
            {cat.name}
          </Link>
        ))}

        {badges.map((badge) => (
          <Link
            key={badge.id}
            to={`/badge/${encodeURIComponent(badge.slug)}`}
            onClick={() => setIsOpen(false)}
            className="block text-white hover:text-gold uppercase text-sm font-semibold tracking-widest py-2 border-b border-white/10"
          >
            {badge.name}
          </Link>
        ))}

        <Link
          to="/about"
          onClick={() => setIsOpen(false)}
          className="block text-white hover:text-gold uppercase text-sm font-semibold tracking-widest py-2 border-b border-white/10"
        >
          About Us
        </Link>
        <Link
          to="/contact"
          onClick={() => setIsOpen(false)}
          className="block text-white hover:text-gold uppercase text-sm font-semibold tracking-widest py-2 border-b border-white/10"
        >
          Contact
        </Link>
        <Link
          to="/products?sale=true"
          onClick={() => setIsOpen(false)}
          className="block text-[#FEBE59] hover:text-gold uppercase text-sm font-semibold tracking-widest py-2 border-b border-white/10"
        >
          Sale
        </Link>

        {/* Mobile Menu Footer - Country, Account, Wishlist */}
        <div className="pt-6 mt-6 border-t border-white/20">
          <p className="text-white/50 text-xs uppercase tracking-widest mb-4">
            Settings & Account
          </p>
          <div className="flex flex-wrap gap-6">
            {/* Country Selector */}
            <div className="flex items-center gap-2 text-white">
              <Globe size={20} className="text-gold" />
              <span className="text-sm font-bold uppercase">PK</span>
            </div>
            <Link
              to="/auth"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 text-white hover:text-gold transition-colors"
            >
              <User size={20} />
              <span className="text-sm">Account</span>
            </Link>
            <Link
              to="/wishlist"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 text-white hover:text-gold transition-colors relative"
            >
              <Heart size={20} />
              <span className="text-sm">Wishlist</span>
              {wishlistItems.length > 0 && (
                <span className="bg-gold text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full ml-1">
                  {wishlistItems.length}
                </span>
              )}
            </Link>
            <Link
              to="/cart"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 text-white hover:text-gold transition-colors relative"
            >
              <ShoppingBag size={20} />
              <span className="text-sm">Cart</span>
              {cartItems.length > 0 && (
                <span className="bg-white text-charcoal text-[10px] font-bold px-1.5 py-0.5 rounded-full ml-1">
                  {cartItems.reduce((total, item) => total + item.quantity, 0)}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;
