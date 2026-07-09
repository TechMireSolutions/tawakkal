import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, Grid3X3, LayoutGrid, ChevronDown } from 'lucide-react';
import ProductGrid from '../components/ProductGrid';
import { fetchCategories } from '../api';

const sortOptions = ['Featured', 'Price: Low to High', 'Price: High to Low', 'Newest'];

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [categories, setCategories] = useState(['All']);
  
  const activeCategory = searchParams.get('category') || 'All';
  const activeSort = searchParams.get('sort') || 'Featured';
  const activeBadge = searchParams.get('badge') || null;
  const activeSearch = searchParams.get('search') || null;

  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [gridView, setGridView] = useState('4col'); // '4col' or '3col'
  const dropdownRef = useRef(null);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await fetchCategories();
        const publishedCats = data.filter(cat => cat.status === true).map(cat => cat.name);
        setCategories(['All', ...publishedCats]);
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };
    loadCategories();
  }, []);

  const handleCategoryChange = (cat) => {
    const newParams = new URLSearchParams(searchParams);
    if (cat === 'All') newParams.delete('category');
    else newParams.set('category', cat);
    setSearchParams(newParams);
  };

  const handleSortChange = (sort) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('sort', sort);
    setSearchParams(newParams);
    setShowSortDropdown(false);
  };


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

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-gradient-to-b from-ivory via-white to-ivory min-h-screen text-charcoal pt-28">
      {/* Hero Header */}
      <div className="relative py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-charcoal/5" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gold/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-gold/5 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-[1440px] mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-3 mb-6 bg-white px-5 py-2.5 rounded-full shadow-sm border border-gray-100">
            <div className="w-2 h-2 rounded-full bg-gold" />
            <p className="text-gold tracking-[0.2em] uppercase text-[11px] font-bold">Our Collections</p>
            <div className="w-2 h-2 rounded-full bg-gold" />
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-charcoal mb-4">
            All <span className="italic font-serif text-gold">Products</span>
          </h1>
          <p className="text-gray-500 max-w-xl mx-auto text-base">
            Discover our curated collection of premium fabrics and elegant designs
          </p>
          <div className="flex items-center justify-center gap-2 mt-8">
            <div className="h-px w-24 bg-gradient-to-r from-transparent via-gold to-transparent" />
            <div className="w-2 h-2 rounded-full bg-gold" />
            <div className="h-px w-24 bg-gradient-to-r from-transparent via-gold to-transparent" />
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="sticky top-14 z-30 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-3 md:py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4">
            {/* Category Filters */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
              <SlidersHorizontal size={18} className="text-gray-400 mr-1 md:mr-2 flex-shrink-0" />
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleCategoryChange(cat)}
                  className={`px-3 py-1.5 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-semibold whitespace-nowrap transition-all ${activeCategory === cat
                    ? 'bg-charcoal text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                >
                  {cat}
                </button>
              ))}
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
                        onClick={() => handleSortChange(opt)}
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
        <ProductGrid category={activeCategory} sortBy={activeSort} badge={activeBadge} search={activeSearch} gridView={gridView} />
      </div>
    </div>
  );
};

export default Products;
