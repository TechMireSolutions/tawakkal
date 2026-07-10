import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { fetchProducts } from '../api';
import ProductCard from './ProductCard';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const ProductMarquee = ({ id, limit = 8 }) => {
  const navigate = useNavigate();
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
              <ProductCard product={product} className="h-full" />
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
