import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Heart, Truck, Shield, RotateCcw, Minus, Plus, ShoppingBag, Star, ChevronRight, Check, ArrowRight } from 'lucide-react';
import gsap from 'gsap';
import { useCart } from './CartContext.jsx';
import { fetchProductDetail, fetchProducts } from '../api';
import { useCurrency } from '../context/CurrencyContext';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, wishlistItems, toggleWishlist } = useCart();
  const { convertPrice } = useCurrency();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);

  // Normalize variants coming from API. Color objects: {id, name, hex_code}.
  const sizes = (product?.available_sizes || []).map(s => s.name);
  const colors = (product?.available_colors || []).map(c => ({
    name: c.name,
    hex: c.hex_code || '#cccccc',
  }));
  const [quantity, setQuantity] = useState(1);
  const [wholesaleQuantity, setWholesaleQuantity] = useState(6);
  const [activeImage, setActiveImage] = useState(0);
  const [activeTab, setActiveTab] = useState('description');
  const [purchaseMode, setPurchaseMode] = useState('retail');
  const [addedToCart, setAddedToCart] = useState(false);
  const [wholesaleAddedToCart, setWholesaleAddedToCart] = useState(false);
  
  const isWishlisted = wishlistItems.some(item => item.id === parseInt(id));
  
  const contentRef = useRef(null);
  const galleryRef = useRef(null);

  useEffect(() => {
    const getProduct = async () => {
      try {
        const data = await fetchProductDetail(id);
        setProduct(data);
        setWholesaleQuantity(data.wholesale_min_quantity || 6);
        if (data.available_sizes?.length) {
          setSelectedSize(data.available_sizes[0].name);
        }
        if (data.available_colors?.length) {
          const first = data.available_colors[0];
          setSelectedColor({ name: first.name, hex: first.hex_code || '#cccccc' });
        }

        // Fetch featured products for "Complete the Look"
        const featuredProducts = await fetchProducts({ is_featured: true });
        setRelatedProducts(featuredProducts.filter(p => p.id !== data.id && p.id !== parseInt(id)).slice(0, 4));
      } catch (err) {
        console.error("Error fetching product", err);
        navigate('/products');
      }
    };
    getProduct();
    window.scrollTo(0, 0);
  }, [id, navigate]);

  useEffect(() => {
    if (product) {
      const tl = gsap.timeline();
      tl.fromTo('.product-anim-up', 
        { y: 30, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: 'power3.out' }
      );
    }
  }, [product]);

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedSize, selectedColor);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleExpressCheckout = () => {
    addToCart(product, purchaseMode === 'wholesale' ? wholesaleQuantity : quantity, selectedSize, selectedColor, purchaseMode === 'wholesale');
    navigate('/cart');
  };

  const handleWholesaleAddToCart = () => {
    addToCart(product, wholesaleQuantity, selectedSize, selectedColor, true);
    setWholesaleAddedToCart(true);
    setTimeout(() => setWholesaleAddedToCart(false), 2000);
  };

  const stepWholesaleQty = (dir) => {
    const step = product.wholesale_step_quantity || 6;
    const min = product.wholesale_min_quantity || 6;
    setWholesaleQuantity(prev => Math.max(min, prev + dir * step));
  };

  if (!product) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-gold border-t-transparent rounded-full" />
      </div>
    );
  }

  const productImages = (product.images || []).map(img => img.image_url).filter(Boolean);
  if (productImages.length === 0) productImages.push("https://placehold.co/400x533?text=No+Image");

  return (
    <div className="min-h-screen bg-[#fcfcfc] text-charcoal pt-24 pb-20">
      {/* Breadcrumb */}
      <div className="max-w-[1400px] mx-auto px-6 py-4">
        <nav className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-gray-400">
          <span className="hover:text-gold cursor-pointer transition-colors" onClick={() => navigate('/')}>Home</span>
          <ChevronRight size={10} />
          <span className="hover:text-gold cursor-pointer transition-colors" onClick={() => navigate('/products')}>Collections</span>
          <ChevronRight size={10} />
          <span className="text-charcoal font-bold">{product.name}</span>
        </nav>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          
          {/* Left - Image Gallery (Reduced from 7 to 6 columns) */}
          <div className="lg:col-span-6 space-y-6" ref={galleryRef}>
            <div className="relative aspect-[4/5] rounded-[2rem] overflow-hidden bg-[#f5f5f5] shadow-2xl group product-anim-up">
              <img
                src={productImages[activeImage]}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
              />
              <div className="absolute top-8 left-8 flex flex-col gap-3">
                {product.badge && (
                  <div className="bg-gold text-white text-[10px] font-bold uppercase tracking-widest px-6 py-2.5 rounded-full shadow-xl">
                    {product.badge}
                  </div>
                )}
                {product.discount_percent > 0 && (
                  <div className="bg-[#ff3333] text-white text-[10px] font-bold uppercase tracking-widest px-6 py-2.5 rounded-full shadow-xl">
                    {product.discount_percent}% OFF
                  </div>
                )}
              </div>
              <button
                onClick={() => toggleWishlist(product)}
                className="absolute top-8 right-8 w-14 h-14 rounded-full bg-white/90 backdrop-blur-md shadow-xl flex items-center justify-center hover:bg-gold hover:text-white transition-all duration-300"
              >
                <Heart size={22} className={isWishlisted ? 'fill-red-500 text-red-500' : 'text-charcoal'} />
              </button>
            </div>

            {/* Thumbnail Navigation */}
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide product-anim-up">
              {productImages.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setActiveImage(index)}
                  className={`flex-shrink-0 w-24 h-24 rounded-2xl overflow-hidden border-2 transition-all duration-300 ${activeImage === index ? 'border-gold shadow-lg scale-105' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                >
                  <img src={img} alt={`${product.name} ${index + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Right - Product Info (Increased from 5 to 6 columns) */}
          <div className="lg:col-span-6 space-y-8" ref={contentRef}>
            <div className="product-anim-up">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-gold text-[10px] font-bold uppercase tracking-[0.3em]">{product.category?.name || product.category}</span>
                <div className="h-px w-10 bg-gold/30" />
                <div className="flex items-center gap-1.5 text-gold">
                  <Star size={14} fill="currentColor" />
                  <span className="text-xs font-bold tracking-widest">4.9</span>
                </div>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-charcoal mb-4 leading-tight">
                {product.name}
              </h1>

              {/* Product IDs */}
              <div className="flex gap-8 mt-4 border-t border-gray-50 pt-4">
                <div className="space-y-1">
                  <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Article No.</p>
                  <p className="text-xs font-mono font-bold text-charcoal">{product.article_no || 'TW-0921'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Volume No.</p>
                  <p className="text-xs font-mono font-bold text-charcoal">{product.volume_no || 'VOL-26'}</p>
                </div>
              </div>
            </div>

            <div className="h-px bg-gray-100 product-anim-up" />

            <div className="space-y-6 product-anim-up">
              <p className="text-gray-500 leading-relaxed text-sm md:text-base">
                Discover the pinnacle of elegance with this masterfully crafted piece. 
                Part of our exclusive <span className="font-bold text-charcoal italic">Heritage Collection</span>, 
                it embodies the perfect blend of traditional artistry and modern sophistication.
              </p>
            </div>

            {/* Color Selection */}
            {colors.length > 0 && (
              <div className="space-y-4 product-anim-up">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] uppercase tracking-[0.2em] font-bold">Select Color</p>
                  <span className="text-[11px] font-bold text-gold">{selectedColor?.name}</span>
                </div>
                <div className="flex gap-4 flex-wrap">
                  {colors.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => setSelectedColor(color)}
                      className={`w-10 h-10 rounded-full border-2 p-1 transition-all duration-300 ${selectedColor?.name === color.name ? 'border-gold scale-110 shadow-lg' : 'border-transparent'
                        }`}
                    >
                      <div className="w-full h-full rounded-full shadow-inner" style={{ backgroundColor: color.hex }} />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Selection */}
            {sizes.length > 0 && (
              <div className="space-y-4 product-anim-up">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] uppercase tracking-[0.2em] font-bold">Select Size</p>
                  <button className="text-[10px] uppercase tracking-widest font-bold text-gold hover:underline">Size Guide</button>
                </div>
                <div className="grid grid-cols-6 gap-2">
                  {sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`h-12 rounded-xl font-bold text-xs transition-all duration-300 ${selectedSize === size
                          ? 'bg-charcoal text-white shadow-xl scale-105'
                          : 'bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-charcoal'
                        }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity & Action */}
            <div className="space-y-4 pt-4 product-anim-up">
              {/* Purchase Mode Toggle */}
              {product.wholesale_price && product.wholesale_enabled !== false && (
                <div className="flex bg-gray-100 p-1 rounded-2xl mb-6 w-full sm:w-fit border border-gray-200 shadow-inner">
                  <button
                    onClick={() => setPurchaseMode('retail')}
                    className={`flex-1 sm:px-8 py-3 rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] transition-all duration-300 ${
                      purchaseMode === 'retail' 
                        ? 'bg-white shadow-md text-charcoal' 
                        : 'text-gray-400 hover:text-charcoal hover:bg-gray-50'
                    }`}
                  >
                    Retail Order
                  </button>
                  <button
                    onClick={() => setPurchaseMode('wholesale')}
                    className={`flex-1 sm:px-8 py-3 rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] transition-all duration-300 ${
                      purchaseMode === 'wholesale' 
                        ? 'bg-white shadow-md text-charcoal' 
                        : 'text-gray-400 hover:text-charcoal hover:bg-gray-50'
                    }`}
                  >
                    Wholesale Order
                  </button>
                </div>
              )}

              {/* Price Display Based on Mode */}
              <div className="mb-6 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <div className="flex items-baseline gap-4">
                  <span className="text-3xl font-black text-gold">
                    {convertPrice(purchaseMode === 'wholesale' ? product.wholesale_price : (product.base_price || product.price))}
                  </span>
                  {purchaseMode === 'wholesale' ? (
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest bg-gray-200/50 px-2 py-1 rounded">
                      Per Piece
                    </span>
                  ) : (
                    product.compare_at_price && parseFloat(product.compare_at_price) > parseFloat(product.base_price || product.price) && (
                      <span className="text-gray-400 line-through text-base font-bold">
                        {convertPrice(product.compare_at_price)}
                      </span>
                    )
                  )}
                </div>
                {purchaseMode === 'wholesale' && (
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-3 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-gold"></span>
                    Minimum Order: {product.wholesale_min_quantity || 6} pieces
                  </p>
                )}
              </div>

              {/* Add to Cart Area */}
              <div className="flex gap-4 h-16 mb-4">
                <div className="flex items-center bg-white rounded-2xl px-2 border-2 border-gray-100 shadow-sm">
                  <button
                    onClick={() => purchaseMode === 'wholesale' ? stepWholesaleQty(-1) : setQuantity(Math.max(1, quantity - 1))}
                    className="w-12 h-12 flex items-center justify-center text-gray-400 hover:text-charcoal hover:bg-gray-50 rounded-xl transition-all"
                  >
                    <Minus size={18} />
                  </button>
                  <span className="w-14 text-center font-bold text-lg text-charcoal">
                    {purchaseMode === 'wholesale' ? wholesaleQuantity : quantity}
                  </span>
                  <button
                    onClick={() => purchaseMode === 'wholesale' ? stepWholesaleQty(1) : setQuantity(quantity + 1)}
                    className="w-12 h-12 flex items-center justify-center text-gray-400 hover:text-charcoal hover:bg-gray-50 rounded-xl transition-all"
                  >
                    <Plus size={18} />
                  </button>
                </div>
                <button
                  onClick={purchaseMode === 'wholesale' ? handleWholesaleAddToCart : handleAddToCart}
                  className={`flex-1 rounded-2xl font-bold uppercase tracking-[0.2em] text-[11px] flex items-center justify-center gap-3 transition-all duration-500 shadow-xl shadow-charcoal/10 border-2 ${
                    (purchaseMode === 'wholesale' ? wholesaleAddedToCart : addedToCart)
                      ? 'bg-green-500 text-white border-green-500 shadow-green-500/20'
                      : 'bg-charcoal text-white border-charcoal hover:bg-gold hover:border-gold shadow-charcoal/10 hover:shadow-gold/20'
                  }`}
                >
                  {(purchaseMode === 'wholesale' ? wholesaleAddedToCart : addedToCart) ? (
                    <><Check size={18} /> Added to Cart</>
                  ) : (
                    <><ShoppingBag size={18} /> Add to Cart</>
                  )}
                </button>
              </div>

              <button
                onClick={handleExpressCheckout}
                className="w-full h-16 rounded-2xl border-2 border-charcoal font-bold uppercase tracking-[0.2em] text-[11px] hover:bg-charcoal hover:text-white transition-all duration-300 flex items-center justify-center gap-2"
              >
                <ArrowRight size={16} /> Express Checkout
              </button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 pt-8 border-t border-gray-100 product-anim-up">
              <div className="flex flex-col items-center gap-2 text-center group">
                <div className="w-12 h-12 rounded-2xl bg-gold/5 flex items-center justify-center text-gold group-hover:bg-gold group-hover:text-white transition-all duration-500">
                  <Truck size={20} />
                </div>
                <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Fast Delivery</span>
              </div>
              <div className="flex flex-col items-center gap-2 text-center group">
                <div className="w-12 h-12 rounded-2xl bg-gold/5 flex items-center justify-center text-gold group-hover:bg-gold group-hover:text-white transition-all duration-500">
                  <Shield size={20} />
                </div>
                <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Secure Store</span>
              </div>
              <div className="flex flex-col items-center gap-2 text-center group">
                <div className="w-12 h-12 rounded-2xl bg-gold/5 flex items-center justify-center text-gold group-hover:bg-gold group-hover:text-white transition-all duration-500">
                  <RotateCcw size={20} />
                </div>
                <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Easy Return</span>
              </div>
            </div>

            {/* Integrated Info Tabs */}
            <div className="pt-10 space-y-8 product-anim-up border-t border-gray-100 mt-4">
              <div className="flex gap-8 border-b border-gray-100">
                {['description', 'details', 'reviews'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-4 font-bold uppercase tracking-[0.2em] text-[10px] transition-all relative ${activeTab === tab
                        ? 'text-gold'
                        : 'text-gray-400 hover:text-charcoal'
                      }`}
                  >
                    {tab}
                    {activeTab === tab && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold" />
                    )}
                  </button>
                ))}
              </div>

              <div className="min-h-[200px]">
                {activeTab === 'description' && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-500">
                    <div 
                      className="text-gray-500 text-xs leading-relaxed prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: product.description || 'No description available.' }}
                    />
                  </div>
                )}
                {activeTab === 'details' && (
                  <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-500">
                    {[
                      ['Fabric', 'Premium Lawn / Silk Finish'],
                      ['Technique', 'Machine Embroidery'],
                      ['Article', product.article_no || 'N/A'],
                      ['Season', 'Summer / Mid-Season'],
                    ].map(([label, value]) => (
                      <div key={label} className="flex justify-between py-2 border-b border-gray-50">
                        <span className="font-bold text-charcoal text-[9px] uppercase tracking-widest">{label}</span>
                        <span className="text-gray-500 text-xs">{value}</span>
                      </div>
                    ))}
                  </div>
                )}
                {activeTab === 'reviews' && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-500">
                    <div className="flex items-center justify-between">
                      <div className="flex gap-1 text-gold">
                        {[...Array(5)].map((_, i) => <Star key={i} size={10} fill="currentColor" />)}
                      </div>
                      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">4.9/5 Rating</span>
                    </div>
                    <p className="text-gray-500 text-xs italic leading-relaxed">
                      "Excellent quality and fast delivery. The fabric feels amazing!"
                    </p>
                    <p className="text-[9px] font-bold text-charcoal uppercase">— Zoya K.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        <div className="mt-20 pt-20 border-t border-gray-100">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl font-bold tracking-tight">Complete The Look</h2>
            <button
              onClick={() => navigate('/products')}
              className="flex items-center gap-3 text-gold font-bold uppercase tracking-[0.2em] text-[10px] hover:gap-5 transition-all"
            >
              Discover More <ArrowRight size={14} />
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {relatedProducts.map((item) => (
              <div
                key={item.id}
                onClick={() => navigate(`/product/${item.id}`)}
                className="group cursor-pointer space-y-4"
              >
                <div className="relative aspect-[3/4] rounded-[2rem] overflow-hidden bg-[#f5f5f5] shadow-lg">
                  <div className="absolute top-2 left-2 sm:top-4 sm:left-4 z-10 flex flex-col gap-2">
                    {item.badges && item.badges.map(badge => (
                      <div 
                        key={badge.id}
                        className="text-white text-[8px] sm:text-[10px] font-bold uppercase tracking-widest px-2 py-1 sm:px-3 sm:py-1.5 rounded-full shadow-lg"
                        style={{ backgroundColor: badge.background_color || 'var(--admin-primary)', color: badge.text_color || '#fff' }}
                      >
                        {badge.name}
                      </div>
                    ))}
                    {item.discount_percentage && item.discount_percentage > 0 && (
                      <div className="bg-[#ff3333] text-white text-[8px] sm:text-[10px] font-bold uppercase tracking-widest px-2 py-1 sm:px-3 sm:py-1.5 rounded-full shadow-lg">
                        {item.discount_percentage}% OFF
                      </div>
                    )}
                  </div>
                  <img
                    src={item.primary_image?.image_url || "https://placehold.co/400x533?text=No+Image"}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] text-gold uppercase tracking-widest font-bold">{item.category?.name || item.category}</p>
                  <h3 className="font-bold group-hover:text-gold transition-colors line-clamp-1">{item.name}</h3>
                  <div className="flex items-center gap-2">
                    <p className="text-charcoal font-bold">{convertPrice(item.base_price)}</p>
                    {item.compare_at_price && parseFloat(item.compare_at_price) > parseFloat(item.base_price) && (
                      <p className="text-gray-400 line-through text-[10px] font-medium">{convertPrice(item.compare_at_price)}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
