import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowUpRight } from 'lucide-react';
import { fetchCategories } from '../api';

gsap.registerPlugin(ScrollTrigger);

const categoryColors = [
  'from-amber-500 to-orange-400',
  'from-rose-500 to-pink-400',
  'from-violet-500 to-purple-400',
  'from-emerald-500 to-teal-400',
  'from-blue-500 to-indigo-400',
  'from-cyan-500 to-sky-400'
];

const CategoryGallery = () => {
  const containerRef = useRef(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await fetchCategories();
        // Only show published categories
        setCategories(data.filter(cat => cat.is_published));
      } catch (err) {
        console.error("Error fetching categories:", err);
      } finally {
        setLoading(false);
      }
    };
    loadCategories();
  }, []);

  useEffect(() => {
    if (loading || categories.length === 0) return;

    const ctx = gsap.context(() => {
      gsap.from('.category-header', {
        opacity: 0,
        y: 30,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 80%'
        }
      });

      const items = gsap.utils.toArray('.category-card');
      items.forEach((item, i) => {
        gsap.from(item, {
          opacity: 0,
          y: 40,
          duration: 0.6,
          delay: i * 0.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 75%'
          }
        });
      });
    }, containerRef);

    return () => ctx.revert();
  }, [loading, categories]);

  if (loading) {
    return (
      <section className="py-16 md:py-24 bg-gradient-to-b from-white to-ivory text-center">
        <p className="text-gray-400 animate-pulse">Loading Categories...</p>
      </section>
    );
  }

  return (
    <section ref={containerRef} className="py-16 md:py-24 bg-gradient-to-b from-white to-ivory">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="category-header text-center mb-10 md:mb-16">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-gold" />
            <p className="text-gold tracking-[0.3em] uppercase text-[10px] font-bold">Browse Collection</p>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-gold" />
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-charcoal">
            Shop By <span className="italic font-serif text-gold">Category</span>
          </h2>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
          {categories.map((cat, i) => (
            <Link
              key={cat.id}
              to={`/products?category=${encodeURIComponent(cat.name)}`}
              className="category-card group relative overflow-hidden rounded-xl md:rounded-2xl cursor-pointer bg-white shadow-md hover:shadow-xl transition-all duration-500 block"
            >
              {/* Image */}
              <div className="aspect-[3/4] overflow-hidden">
                <img
                  src={cat.image || '/placeholder-category.jpg'}
                  alt={cat.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
              </div>

              {/* Content */}
              <div className="absolute inset-0 flex flex-col justify-end p-2.5 sm:p-4 md:p-5">
                {/* Subtitle Badge */}
                <div className={`inline-flex w-fit px-2 py-0.5 rounded-full bg-gradient-to-r ${categoryColors[i % categoryColors.length]} mb-1.5 sm:mb-2 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300`}>
                  <span className="text-white text-[7px] sm:text-[8px] font-bold uppercase tracking-wider">Collection</span>
                </div>
                
                {/* Title */}
                <h3 className="text-white text-sm sm:text-base md:text-lg font-bold mb-0.5">{cat.name}</h3>
                
                {/* Arrow */}
                <div className="flex items-center gap-1.5 text-gold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="text-[9px] font-bold uppercase tracking-wider">Explore</span>
                  <ArrowUpRight size={12} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              </div>

              {/* Corner Accent */}
              <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-white/30 rounded-tr-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoryGallery;
