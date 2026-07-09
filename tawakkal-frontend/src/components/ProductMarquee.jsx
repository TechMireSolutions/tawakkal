import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, ArrowRight, Heart } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { fetchProducts } from '../api';
import { useCart } from '../pages/CartContext';
import { useCurrency } from '../context/CurrencyContext';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const ProductMarquee = ({ id, limit = 8 }) => {
  const navigate = useNavigate();
  const { addToCart, toggleWishlist, wishlistItems } = useCart();
  const { convertPrice } = useCurrency();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getProducts = async () => {
      try {
        const data = await fetchProducts({ is_featured: true });
        setProducts(data.slice(0, limit));
      } catch (err) {
        console.error("Error fetching marquee products", err);
      } finally {
        setLoading(false);
      }
    };
    getProducts();
  }, [limit]);

  const handleQuickAdd = (e, product) => {
    e.stopPropagation();
    // Default options for quick add
    addToCart(product, 1, 'M', { name: 'Standard', hex: '#000000' });
  };

  const handleWishlist = (e, product) => {
    e.stopPropagation();
    toggleWishlist(product);
  };

  if (loading) return <div className="py-24 text-center text-gray-400 animate-pulse">Loading Collection...</div>;
  if (products.length === 0) return null;

  return (
    <section id={id} className="py-16 md:py-24 bg-ivory text-charcoal overflow-hidden">
      {/* Header */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 mb-8 md:mb-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 md:gap-6">
          <div className="space-y-2 md:space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-px bg-gold" />
              <p className="text-gold tracking-[0.3em] uppercase text-[10px] font-bold">Trending Now</p>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold">
              Featured <span className="italic font-serif text-gold">Collection</span>
            </h2>
            <p className="text-gray-500 text-sm max-w-md">
              Discover our handpicked selection of premium fabrics and exquisite designs
            </p>
          </div>
          <button
            onClick={() => navigate('/products')}
            className="group flex items-center gap-2 bg-charcoal text-white px-6 py-3 text-[11px] tracking-[0.15em] uppercase font-bold hover:bg-gold transition-all"
          >
            View All
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* Products Slider */}
      <div className="max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8">
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          spaceBetween={16}
          slidesPerView={2}
          navigation={true}
          pagination={{ clickable: true }}
          autoplay={{
            delay: 3000,
            disableOnInteraction: false,
          }}
          breakpoints={{
            320: {
              slidesPerView: 2,
              spaceBetween: 12,
            },
            640: {
              slidesPerView: 2,
              spaceBetween: 16,
            },
            768: {
              slidesPerView: 3,
              spaceBetween: 20,
            },
            1024: {
              slidesPerView: 4,
              spaceBetween: 24,
            },
            1280: {
              slidesPerView: 5,
              spaceBetween: 24,
            },
          }}
          className="product-slider"
        >
          {products.map((product) => (
            <SwiperSlide key={product.id}>
              <div 
                className="group h-full cursor-pointer"
                onClick={() => navigate(`/product/${product.id}`)}
              >
                {/* Product Card */}
                <div className="bg-white shadow-lg hover:shadow-2xl transition-all duration-500 h-full">
                  {/* Image Container */}
                  <div className="relative aspect-[3/4] overflow-hidden">
                    <div className="absolute top-2 left-2 md:top-3 md:left-3 z-10 flex flex-col gap-2">
                      {product.badges && product.badges.map(badge => (
                        <div 
                          key={badge.id}
                          className="text-white text-[8px] md:text-[9px] font-bold uppercase tracking-widest px-2 py-1 md:px-3 md:py-1.5"
                          style={{ backgroundColor: badge.background_color || 'var(--admin-primary)', color: badge.text_color || '#fff' }}
                        >
                          {badge.name}
                        </div>
                      ))}
                      {product.discount_percentage && product.discount_percentage > 0 && (
                        <div className="bg-[#ff3333] text-white text-[8px] md:text-[9px] font-bold uppercase tracking-widest px-2 py-1 md:px-3 md:py-1.5">
                          {product.discount_percentage}% OFF
                        </div>
                      )}
                    </div>
                    
                    <button
                      onClick={(e) => handleWishlist(e, product)}
                      className="absolute top-2 right-2 md:top-3 md:right-3 z-20 w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/90 backdrop-blur-md shadow-lg flex items-center justify-center hover:bg-gold hover:text-white transition-all duration-300"
                    >
                      <Heart size={16} className={wishlistItems.some(item => item.id === product.id) ? 'fill-red-500 text-red-500' : 'text-charcoal'} />
                    </button>
                    <img
                      src={product.primary_image?.image_url || "https://placehold.co/400x533?text=No+Image"}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />

                    {/* Quick Add Button */}
                    <div className="absolute bottom-3 left-3 right-3 md:bottom-4 md:left-4 md:right-4 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                      <button 
                        onClick={(e) => handleQuickAdd(e, product)}
                        className="w-full bg-white text-charcoal py-2.5 md:py-3 flex items-center justify-center gap-2 text-[9px] md:text-[10px] font-bold uppercase tracking-[0.15em] hover:bg-gold hover:text-white transition-all shadow-xl"
                      >
                        <ShoppingBag size={14} />
                        <span className="hidden sm:inline">Add to Bag</span>
                        <span className="sm:hidden">Add</span>
                      </button>
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="p-3 md:p-4 space-y-1 md:space-y-2">
                    <p className="text-gold text-[8px] md:text-[9px] uppercase tracking-[0.2em] font-bold">
                      {product.category?.name || 'All'}
                    </p>
                    <h3 className="text-sm md:text-base font-bold group-hover:text-gold transition-colors line-clamp-1">
                      {product.name}
                    </h3>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <p className="text-charcoal font-bold text-xs md:text-sm tracking-wider">
                          {convertPrice(product.base_price)}
                        </p>
                        {product.compare_at_price && parseFloat(product.compare_at_price) > parseFloat(product.base_price) && (
                          <p className="text-gray-400 line-through text-[10px] md:text-xs font-medium">
                            {convertPrice(product.compare_at_price)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Custom Swiper Styles */}
      <style>{`
        .product-slider .swiper-button-next,
        .product-slider .swiper-button-prev {
          width: 40px;
          height: 40px;
          background: white;
          border-radius: 50%;
          box-shadow: 0 4px 15px rgba(0,0,0,0.15);
          color: #1a1a1a;
          transition: all 0.3s ease;
        }
        
        .product-slider .swiper-button-next:hover,
        .product-slider .swiper-button-prev:hover {
          background: #e6a13b;
          color: white;
          transform: scale(1.1);
        }
        
        .product-slider .swiper-button-next::after,
        .product-slider .swiper-button-prev::after {
          font-size: 14px;
          font-weight: bold;
        }
        
        .product-slider .swiper-pagination {
          position: relative;
          margin-top: 20px;
        }
        
        .product-slider .swiper-pagination-bullet {
          width: 8px;
          height: 8px;
          background: #d1d5db;
          opacity: 1;
          transition: all 0.3s ease;
        }
        
        .product-slider .swiper-pagination-bullet-active {
          background: #e6a13b;
          width: 24px;
          border-radius: 4px;
        }

        @media (max-width: 640px) {
          .product-slider .swiper-button-next,
          .product-slider .swiper-button-prev {
            width: 32px;
            height: 32px;
          }
          
          .product-slider .swiper-button-next::after,
          .product-slider .swiper-button-prev::after {
            font-size: 12px;
          }
        }
      `}</style>
    </section>
  );
};

export default ProductMarquee;
