import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, SlidersHorizontal, X, Sparkles } from 'lucide-react';
import { db } from '../services/dbBridge';
import { ProductCard } from '../components/products/ProductCard';
import { ProductFilter } from '../components/products/ProductFilter';

export const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Initialize filters from URL search params
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    subcategory: searchParams.get('subcategory') || '',
    brand: searchParams.get('brand') || '',
    scale: searchParams.get('scale') || '',
    size: searchParams.get('size') || '',
    sortBy: searchParams.get('sort') || 'default',
    search: searchParams.get('search') || ''
  });

  // Sync state with URL params
  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      category: searchParams.get('category') || '',
      subcategory: searchParams.get('subcategory') || '',
      brand: searchParams.get('brand') || '',
      scale: searchParams.get('scale') || '',
      size: searchParams.get('size') || '',
      sortBy: searchParams.get('sort') || 'default',
      search: searchParams.get('search') || ''
    }));
  }, [searchParams]);

  // Load products based on current filters
  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await db.getProducts(filters);
      setProducts(data);
    } catch (err) {
      console.error('Error fetching shop products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();

    // Subscribe to realtime product changes
    const unsubscribe = db.subscribe('products', () => {
      loadProducts();
    });

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [filters]);

  const handleResetFilters = () => {
    const emptyFilters = {
      category: '',
      subcategory: '',
      brand: '',
      scale: '',
      size: '',
      sortBy: 'default',
      search: ''
    };
    setFilters(emptyFilters);
    setSearchParams({});
  };

  const getCollectionTitle = () => {
    if (filters.category === 'posters') {
      if (filters.subcategory) {
        return `${filters.subcategory.toUpperCase()} POSTERS & PRINTS`;
      }
      return 'POSTERS & ARCHIVAL WALL ART';
    }
    if (filters.category === 'diecast') {
      if (filters.brand) {
        return `${filters.brand.toUpperCase()} DIE-CAST MODELS`;
      }
      return 'PRECISION DIE-CAST MODEL CARS';
    }
    if (filters.search) {
      return `SEARCH RESULTS FOR "${filters.search}"`;
    }
    return 'COMPLETE COLLECTOR CATALOG';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-border-light">
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-muted">
            The Collection
          </span>
          <h1 className="font-serif text-2xl sm:text-4xl font-extrabold text-charcoal mt-1 tracking-tight">
            {getCollectionTitle()}
          </h1>
          <p className="text-xs text-muted mt-1">
            Displaying {products.length} {products.length === 1 ? 'collectible' : 'collectibles'}
          </p>
        </div>

        {/* Mobile Filter Toggle */}
        <div className="flex sm:hidden items-center justify-between">
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-charcoal text-white rounded-xl text-xs uppercase font-bold tracking-wider"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filters ({[filters.category, filters.subcategory, filters.brand, filters.scale, filters.size].filter(Boolean).length})</span>
          </button>
        </div>
      </div>

      {/* Main Shop Layout: Sidebar Filters + Products Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Desktop Sidebar Filters */}
        <div className="hidden lg:block lg:col-span-1">
          <div className="sticky top-28">
            <ProductFilter
              filters={filters}
              setFilters={setFilters}
              onReset={handleResetFilters}
            />
          </div>
        </div>

        {/* Products Grid */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {[...Array(6)].map((_, idx) => (
                <div key={idx} className="bg-white rounded-2xl p-4 border border-border-light animate-pulse space-y-4">
                  <div className="aspect-[4/5] bg-cream-100 rounded-xl" />
                  <div className="h-4 bg-cream-200 rounded w-3/4" />
                  <div className="h-4 bg-cream-100 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-border-light p-12 text-center space-y-4 shadow-soft">
              <div className="w-16 h-16 bg-cream-100 rounded-full flex items-center justify-center text-muted mx-auto">
                <Sparkles className="w-8 h-8 opacity-40" />
              </div>
              <h3 className="font-serif text-lg font-bold text-charcoal">
                No matching collectibles found
              </h3>
              <p className="text-xs text-muted max-w-sm mx-auto">
                We couldn&rsquo;t find any items matching your current filters. Try resetting the filters or searching with different keywords.
              </p>
              <button
                onClick={handleResetFilters}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-charcoal text-white rounded-xl text-xs uppercase tracking-wider font-semibold hover:bg-black transition-colors"
              >
                <span>Reset All Filters</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filter Modal */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-charcoal/60 backdrop-blur-sm"
            onClick={() => setMobileFilterOpen(false)}
          />
          <div className="relative w-4/5 max-w-sm bg-white h-full shadow-2xl flex flex-col justify-between p-6 z-10 overflow-y-auto">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-border-light">
                <h3 className="font-serif text-lg font-bold text-charcoal">Filters</h3>
                <button onClick={() => setMobileFilterOpen(false)}>
                  <X className="w-6 h-6 text-charcoal" />
                </button>
              </div>

              <ProductFilter
                filters={filters}
                setFilters={setFilters}
                onReset={handleResetFilters}
              />
            </div>

            <div className="pt-6 border-t border-border-light">
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="w-full py-3 bg-charcoal text-white rounded-xl text-xs uppercase font-bold tracking-wider"
              >
                Show Results ({products.length})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

