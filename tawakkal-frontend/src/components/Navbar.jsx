import { useState, useEffect, useRef } from "react";
import { ShoppingBag, Menu, X, Search, Heart, User, Globe } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import { useCart } from "../pages/CartContext";
import { fetchCategories, fetchPages } from "../api";
import { useCurrency, currencies } from "../context/CurrencyContext";
import { useSiteSettings } from "../context/SiteSettingsContext";

const Navbar = () => {
  const { cartItems, wishlistItems } = useCart();
  const { currency, setCurrency } = useCurrency();
  const siteSettings = useSiteSettings();
  const [isOpen, setIsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [badges, setBadges] = useState([]);
  const [pages, setPages] = useState([]);
  const closeTimeout = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();

  // Pages with dark hero sections need white navbar text
  const darkHeroPages = [
    "/about",
    "/contact",
    "/privacy-policy",
    "/disclaimer",
    "/shipping",
    "/store-locator",
    "/blogs",
    "/fabric-glossary",
    "/feedback-survey",
    "/faqs",
  ];
  const isDarkHeroPage = darkHeroPages.some(
    (path) => location.pathname === path,
  );

  useEffect(() => {
  const handleScroll = () => {
    setScrolled(window.scrollY > 20);
  };
  window.addEventListener("scroll", handleScroll);

  const loadData = async () => {
    try {
      // REMOVED: await import("../api") 
      // Instead, ensure ALL imports are at the top of your file:
      // import { fetchCategories, fetchPages, fetchBrands, fetchBadges } from "../api";

      const catData = await fetchCategories();
      setCategories(catData.filter((cat) => cat.status === true));

      const brandData = await fetchBrands();
      setBrands(brandData.filter((b) => b.status === true));

      const badgeData = await fetchBadges();
      setBadges(badgeData.filter((b) => b.status === true));

      const pagesData = await fetchPages();
      setPages(pagesData.filter((p) => p.status === "published" || p.status === true));
    } catch (err) {
      console.error("Error fetching data for navbar:", err);
    }
  };
  
  loadData();

  return () => {
    window.removeEventListener("scroll", handleScroll);
    if (closeTimeout.current) clearTimeout(closeTimeout.current);
  };
}, []); // Keep empty if you only want to fetch once on site-load

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery("");
    }
  };

  const handleMenuEnter = (menu) => {
    if (closeTimeout.current) {
      clearTimeout(closeTimeout.current);
      closeTimeout.current = null;
    }
    setActiveMenu(menu);
  };

  const handleMenuLeave = () => {
    if (closeTimeout.current) clearTimeout(closeTimeout.current);
    closeTimeout.current = setTimeout(() => {
      setActiveMenu(null);
    }, 200);
  };

  return (
    <>
      {siteSettings?.show_announcement && (
        <div className="fixed top-0 left-0 w-full z-[60] bg-charcoal text-white text-center py-2 text-[11px] tracking-[0.25em] uppercase font-semibold">
          {siteSettings.announcement_text}
        </div>
      )}
      <nav
        className={`fixed w-full z-50 transition-all duration-300 ${siteSettings?.show_announcement ? "top-8" : "top-0"} ${scrolled ? "glass-nav py-3" : isDarkHeroPage ? "bg-charcoal/90 py-4" : "bg-transparent py-6"}`}
      >
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/">
                {siteSettings?.navbar_logo_url ||
                siteSettings?.main_logo_url ? (
                  <img
                    src={
                      scrolled
                        ? siteSettings?.sticky_navbar_logo_url ||
                          siteSettings?.navbar_logo_url ||
                          siteSettings?.main_logo_url
                        : siteSettings?.navbar_logo_url ||
                          siteSettings?.main_logo_url
                    }
                    alt={siteSettings?.site_name || "Tawakkal"}
                    className="h-6 md:h-8 w-auto object-contain transition-all duration-300"
                  />
                ) : (
                  <span
                    className={`text-xl font-bold uppercase tracking-widest ${scrolled || isDarkHeroPage ? "text-white" : "text-charcoal"}`}
                  >
                    {siteSettings?.site_name || "TAWAKKAL"}
                  </span>
                )}
              </Link>
            </div>

            <div className="hidden md:block">
              <div className="flex items-center space-x-6 lg:space-x-8">
                {/* NEW IN */}
                <div className="flex items-center h-8">
                  <Link
                    to={badges[0] ? `/badge/${encodeURIComponent(badges[0].slug)}` : '/products'}
                    className={`${scrolled || isDarkHeroPage ? "text-white" : "text-charcoal"} hover:text-gold transition-colors duration-300 uppercase font-bold tracking-[0.2em] text-[12px]`}
                  >
                    New In
                  </Link>
                </div>

                {/* SHOP Mega Menu */}
                <div
                  className="flex items-center h-8"
                  onMouseEnter={() => handleMenuEnter("shop")}
                  onMouseLeave={handleMenuLeave}
                >
                  <a
                    href="/products"
                    className={`${scrolled || isDarkHeroPage ? "text-white" : "text-charcoal"} hover:text-gold transition-colors duration-300 uppercase text-xs font-bold tracking-[0.2em] text-[12px]`}
                  >
                    Shop
                  </a>
                  <div
                    className={`absolute left-0 w-full bg-white border-t border-gray-100 shadow-xl transition-all duration-300 top-full mt-[-1px] ${activeMenu === "shop" ? "opacity-100 visible pointer-events-auto" : "opacity-0 invisible pointer-events-none"}`}
                  >
                    <div className="max-w-[1440px] mx-auto px-8 py-12 flex justify-between">
                      <div className="grid grid-cols-3 gap-12 w-2/3 pr-12">
                        <div className="space-y-8">
                          <div className="space-y-4">
                            <h4 className="text-[10px] font-extrabold tracking-widest text-charcoal uppercase">
                              Brands
                            </h4>
                            <ul className="space-y-3">
                              {brands.map((brand) => (
                                <li key={brand.id}>
                                  <Link
                                    to={`/brand/${encodeURIComponent(brand.slug)}`}
                                    className="text-[11px] text-gray-500 hover:text-gold font-medium uppercase"
                                  >
                                    {brand.name}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                        <div className="space-y-8">
                          <div className="space-y-4">
                            <h4 className="text-[10px] font-extrabold tracking-widest text-charcoal uppercase">
                              Collections
                            </h4>
                            <ul className="space-y-3">
                              {categories.map((cat) => (
                                <li key={cat.id}>
                                  <Link
                                    to={`/category/${encodeURIComponent(cat.slug)}`}
                                    className="text-[11px] text-gray-500 hover:text-gold font-medium uppercase"
                                  >
                                    {cat.name}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                        <div className="space-y-8">
                          <div className="space-y-4">
                            <h4 className="text-[10px] font-extrabold tracking-widest text-charcoal uppercase">
                              Shop By Badge
                            </h4>
                            <ul className="space-y-3">
                              {badges.map((badge) => (
                                <li key={badge.id}>
                                  <Link
                                    to={`/badge/${encodeURIComponent(badge.slug)}`}
                                    className="text-[11px] text-gray-500 hover:text-gold font-medium uppercase"
                                  >
                                    {badge.name}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* HOME Mega Menu */}
                <div
                  className="flex items-center h-8"
                  onMouseEnter={() => handleMenuEnter("pages")}
                  onMouseLeave={handleMenuLeave}
                >
                  <a
                    href="#"
                    className={`${scrolled || isDarkHeroPage ? "text-white" : "text-charcoal"} hover:text-gold transition-colors duration-300 uppercase text-xs font-bold tracking-[0.2em] text-[12px]`}
                  >
                    PAGES
                  </a>
                  <div
                    className={`absolute left-0 w-full bg-white border-t border-gray-100 shadow-xl transition-all duration-300 top-full mt-[-1px] ${activeMenu === "pages" ? "opacity-100 visible pointer-events-auto" : "opacity-0 invisible pointer-events-none"}`}
                  >
                    <div className="max-w-[1440px] mx-auto px-8 py-12 flex justify-between">
                      <div className="grid grid-cols-2 gap-16 w-2/3 pr-12">
                        <div className="space-y-4">
                          <h4 className="text-[10px] font-extrabold tracking-widest text-charcoal uppercase">
                            CUSTOMER CARE
                          </h4>
                          <ul className="space-y-3">
                            {pages
                              .filter((p) => p.group === "CUSTOMER CARE")
                              .map((page) => {
                                const isSystemPage =
                                  page.is_system ||
                                  [
                                    "about",
                                    "contact",
                                    "privacy-policy",
                                    "shipping",
                                    "store-locator",
                                    "blogs",
                                    "fabric-glossary",
                                    "feedback-survey",
                                    "disclaimer",
                                    "faqs",
                                  ].includes(page.slug);
                                return (
                                  <li key={page.id}>
                                    <Link
                                      to={
                                        isSystemPage
                                          ? `/${page.slug}`
                                          : `/page/${page.slug || page.id}`
                                      }
                                      className="text-[11px] text-gray-500 hover:text-gold font-medium uppercase"
                                    >
                                      {page.title}
                                    </Link>
                                  </li>
                                );
                              })}
                          </ul>
                        </div>
                        <div className="space-y-4">
                          <h4 className="text-[10px] font-extrabold tracking-widest text-charcoal uppercase">
                            INFORMATION
                          </h4>
                          <ul className="space-y-3">
                            {pages
                              .filter((p) => p.group === "INFORMATION")
                              .map((page) => {
                                const isSystemPage =
                                  page.is_system ||
                                  [
                                    "about",
                                    "contact",
                                    "privacy-policy",
                                    "shipping",
                                    "store-locator",
                                    "blogs",
                                    "fabric-glossary",
                                    "feedback-survey",
                                    "disclaimer",
                                    "faqs",
                                  ].includes(page.slug);
                                return (
                                  <li key={page.id}>
                                    <Link
                                      to={
                                        isSystemPage
                                          ? `/${page.slug}`
                                          : `/page/${page.slug || page.id}`
                                      }
                                      className="text-[11px] text-gray-500 hover:text-gold font-medium uppercase"
                                    >
                                      {page.title}
                                    </Link>
                                  </li>
                                );
                              })}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-5">
              {/* Search Widget */}
              <div className="relative flex items-center">
                <form
                  onSubmit={handleSearchSubmit}
                  className={`absolute right-full top-1/2 -translate-y-1/2 flex items-center transition-all duration-300 overflow-hidden ${isSearchOpen ? "w-40 md:w-56 opacity-100 mr-4" : "w-0 opacity-0"}`}
                >
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full bg-transparent border-b ${scrolled || isDarkHeroPage ? "border-white/50 text-white placeholder-white/50" : "border-charcoal/30 text-charcoal placeholder-charcoal/50"} focus:outline-none focus:border-gold py-1 text-xs`}
                    autoFocus={isSearchOpen}
                  />
                </form>
                <button
                  onClick={() => setIsSearchOpen(!isSearchOpen)}
                  className={`${scrolled || isDarkHeroPage ? "text-white" : "text-charcoal"} hover:text-gold transition-colors`}
                >
                  {isSearchOpen ? <X size={20} /> : <Search size={20} />}
                </button>
              </div>

              {/* Country Selector - Hidden on mobile */}
              <div
                className="hidden md:flex relative items-center cursor-pointer py-2"
                onMouseEnter={() => handleMenuEnter("country")}
                onMouseLeave={handleMenuLeave}
              >
                <Globe
                  size={18}
                  className={`${scrolled || isDarkHeroPage ? "text-white" : "text-charcoal"} ${activeMenu === "country" ? "text-gold" : ""} transition-colors`}
                />
                <span
                  className={`ml-1 text-[10px] font-bold ${scrolled || isDarkHeroPage ? "text-white" : "text-charcoal"} ${activeMenu === "country" ? "text-gold" : ""} uppercase transition-colors`}
                >
                  {currency.countryCode}
                </span>
                <div
                  className={`absolute top-full right-0 bg-white shadow-xl border border-gray-100 transition-all min-w-[200px] ${activeMenu === "country" ? "opacity-100 visible" : "opacity-0 invisible"}`}
                >
                  {currencies.map((curr) => (
                    <div
                      key={curr.code}
                      onClick={() => {
                        setCurrency(curr);
                        setActiveMenu(null);
                      }}
                      className={`px-4 py-3 border-b border-gray-50 hover:bg-gray-50 text-[11px] uppercase tracking-widest font-bold cursor-pointer transition-colors ${currency.code === curr.code ? "text-gold bg-gold/5" : "text-charcoal"}`}
                    >
                      {curr.label}
                    </div>
                  ))}
                </div>
              </div>

              <a
                href="/auth"
                className={`hidden md:block ${scrolled || isDarkHeroPage ? "text-white" : "text-charcoal"} hover:text-gold transition-colors`}
              >
                <User size={20} />
              </a>

              <Link
                to="/wishlist"
                className={`relative ${scrolled || isDarkHeroPage ? "text-white" : "text-charcoal"} hover:text-gold transition-colors`}
              >
                <Heart size={20} />
                {wishlistItems.length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-gold text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-white shadow-sm animate-fade-in">
                    {wishlistItems.length}
                  </span>
                )}
              </Link>

              <Link
                to="/cart"
                className={`relative ${scrolled || isDarkHeroPage ? "text-white" : "text-charcoal"} hover:text-gold transition-colors`}
              >
                <ShoppingBag size={20} />
                {cartItems.length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-charcoal text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-white shadow-sm animate-fade-in">
                    {cartItems.reduce(
                      (total, item) => total + item.quantity,
                      0,
                    )}
                  </span>
                )}
              </Link>
              <div className="md:hidden">
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className={`${scrolled || isDarkHeroPage ? "text-white" : "text-charcoal"}`}
                >
                  {isOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu - Full Screen Overlay */}
      <div
        className={`md:hidden fixed inset-0 bg-black z-40 transition-all duration-300 ${isOpen ? "opacity-100 visible pointer-events-auto" : "opacity-0 invisible pointer-events-none"}`}
        style={{ top: scrolled ? "56px" : "80px" }}
      >
        <div className="px-6 py-8 space-y-6 h-full overflow-y-auto bg-black text-white">
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
                    {cartItems.reduce(
                      (total, item) => total + item.quantity,
                      0,
                    )}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
