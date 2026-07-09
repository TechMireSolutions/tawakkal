import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SlidersHorizontal, Grid3X3, LayoutGrid, ChevronDown } from 'lucide-react';
import ProductGrid from '../components/ProductGrid';
import { fetchBrands } from '../api';

const sortOptions = ['Featured', 'Price: Low to High', 'Price: High to Low', 'Newest'];

const BrandDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [activeSort, setActiveSort] = useState('Featured');
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [gridView, setGridView] = useState('4col');
  const dropdownRef = useRef(null);
  
  const [brand, setBrand] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBrand = async () => {
      setLoading(true);
      try {
        const brands = await fetchBrands();
        const found = brands.find(b => b.slug === slug);
        if (found) {
          setBrand(found);
        } else {
          navigate('/products');
        }
      } catch (err) {
        console.error(err);
        navigate('/products');
      } finally {
        setLoading(false);
      }
    };
    loadBrand();
    window.scrollTo(0, 0);
  }, [slug, navigate]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowSortDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (loading) {
    return <div className="min-h-screen bg-ivory pt-32 text-center text-charcoal">Loading...</div>;
  }

  if (!brand) return null;

  return (
    <div className="bg-gradient-to-b from-ivory via-white to-ivory min-h-screen text-charcoal pt-28">
      {/* Brand Name */}
      <div className="pt-32 pb-8">
        <div className="max-w-[1600px] mx-auto px-6">
          <h1 className="text-4xl md:text-5xl font-bold text-charcoal uppercase tracking-widest">
            {brand.name}
          </h1>
          {brand.description && <p className="mt-4 text-gray-600 max-w-2xl">{brand.description}</p>}
        </div>
      </div>

      {/* Filters Bar */}
      <div className="sticky top-16 md:top-20 z-20 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-3 md:py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4">
            {/* Brand Info */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
              <SlidersHorizontal size={18} className="text-gray-400 flex-shrink-0" />
              <span className="font-semibold text-charcoal whitespace-nowrap uppercase tracking-widest">{brand.name}</span>
            </div>

            {/* Sort & View Options */}
            <div className="flex items-center gap-2 md:gap-4">
              {/* Sort Dropdown */}
              <div className="relative flex-1 md:flex-none" ref={dropdownRef}>
                <button
                  onClick={() => setShowSortDropdown(!showSortDropdown)}
                  className="w-full md:w-auto flex items-center justify-between md:justify-start gap-2 px-3 py-2 md:px-4 md:py-2.5 bg-white border border-gray-200 rounded-xl text-xs md:text-sm font-semibold text-charcoal hover:border-gold hover:text-gold transition-all shadow-sm"
                >
                  <span className="whitespace-nowrap">Sort: {activeSort}</span>
                  <ChevronDown size={16} className={`transition-transform duration-200 flex-shrink-0 ${showSortDropdown ? 'rotate-180' : ''}`} />
                </button>
                {showSortDropdown && (
                  <div className="absolute top-full right-0 left-0 md:left-auto mt-2 w-full md:w-52 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 z-[100]">
                    {sortOptions.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => { setActiveSort(opt); setShowSortDropdown(false); }}
                        className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 ${activeSort === opt ? 'text-gold font-semibold bg-gold/5' : 'text-gray-600'
                          }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* View Toggle */}
              <div className="hidden md:flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setGridView('4col')}
                  className={`p-2 rounded-md transition-all ${gridView === '4col' ? 'bg-white shadow-sm text-charcoal' : 'text-gray-400 hover:text-charcoal'}`}
                  title="4 Columns"
                >
                  <LayoutGrid size={18} />
                </button>
                <button
                  onClick={() => setGridView('3col')}
                  className={`p-2 rounded-md transition-all ${gridView === '3col' ? 'bg-white shadow-sm text-charcoal' : 'text-gray-400 hover:text-charcoal'}`}
                  title="3 Columns"
                >
                  <Grid3X3 size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-[1600px] mx-auto px-0 py-12">
        <ProductGrid
          brand={brand.slug}
          sortBy={activeSort}
          gridView={gridView}
        />
      </div>
    </div>
  );
};

export default BrandDetail;
