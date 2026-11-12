import React from 'react';
import { Filter, RotateCcw, ChevronDown, Check } from 'lucide-react';

export const ProductFilter = ({ filters, setFilters, onReset }) => {
  const isPoster = filters.category === 'posters';
  const isDiecast = filters.category === 'diecast';

  const posterSubcategories = [
    { id: 'anime', label: 'Anime & Manga' },
    { id: 'car', label: 'Car & Blueprint' },
    { id: 'movie', label: 'Movie & Sci-Fi' },
    { id: 'aesthetic', label: 'Aesthetic & Lo-Fi' }
  ];

  const diecastBrands = [
    'Lamborghini',
    'Porsche',
    'Ferrari',
    'BMW',
    'Mercedes-Benz'
  ];

  const posterSizes = ['A5', 'A4', 'A3'];
  const diecastScales = ['1:64', '1:32', '1:24', '1:18'];

  const sortOptions = [
    { id: 'default', label: 'Featured & Curated' },
    { id: 'price_asc', label: 'Price: Low to High' },
    { id: 'price_desc', label: 'Price: High to Low' },
    { id: 'newest', label: 'Newest Arrivals' },
    { id: 'popularity', label: 'Best Sellers' }
  ];

  return (
    <div className="bg-white rounded-2xl border border-border-light p-5 space-y-6 shadow-soft">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-border-light">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-charcoal" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-charcoal">Filters</h3>
        </div>
        <button
          onClick={onReset}
          className="flex items-center gap-1 text-[11px] font-semibold text-muted hover:text-charcoal transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset</span>
        </button>
      </div>

      {/* Main Category */}
      <div className="space-y-2">
        <label className="text-[11px] font-bold uppercase tracking-wider text-muted block">
          Collection
        </label>
        <div className="grid grid-cols-1 gap-1.5">
          {[
            { id: '', label: 'All Collections' },
            { id: 'posters', label: 'Posters & Wall Art' },
            { id: 'diecast', label: 'Die-Cast Model Cars' }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  category: cat.id,
                  subcategory: '',
                  brand: '',
                  size: '',
                  scale: ''
                }))
              }
              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-between ${
                filters.category === cat.id
                  ? 'bg-charcoal text-white shadow-sm'
                  : 'bg-cream-50 text-charcoal-700 hover:bg-cream-100'
              }`}
            >
              <span>{cat.label}</span>
              {filters.category === cat.id && <Check className="w-3.5 h-3.5" />}
            </button>
          ))}
        </div>
      </div>

      {/* Subcategory for Posters */}
      {isPoster && (
        <div className="space-y-2 pt-2 border-t border-border-light">
          <label className="text-[11px] font-bold uppercase tracking-wider text-muted block">
            Poster Theme
          </label>
          <div className="flex flex-wrap gap-1.5">
            {posterSubcategories.map((sub) => {
              const active = filters.subcategory === sub.id;
              return (
                <button
                  key={sub.id}
                  onClick={() =>
                    setFilters((prev) => ({
                      ...prev,
                      subcategory: active ? '' : sub.id
                    }))
                  }
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                    active
                      ? 'bg-charcoal text-white border-charcoal'
                      : 'bg-white text-charcoal border-border-light hover:border-charcoal'
                  }`}
                >
                  {sub.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Poster Sizes */}
      {isPoster && (
        <div className="space-y-2 pt-2 border-t border-border-light">
          <label className="text-[11px] font-bold uppercase tracking-wider text-muted block">
            Poster Size
          </label>
          <div className="flex gap-2">
            {posterSizes.map((sz) => {
              const active = filters.size === sz;
              return (
                <button
                  key={sz}
                  onClick={() =>
                    setFilters((prev) => ({
                      ...prev,
                      size: active ? '' : sz
                    }))
                  }
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                    active
                      ? 'bg-charcoal text-white border-charcoal'
                      : 'bg-white text-charcoal border-border-light hover:border-charcoal'
                  }`}
                >
                  {sz}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Brand Filter for Die-Cast */}
      {isDiecast && (
        <div className="space-y-2 pt-2 border-t border-border-light">
          <label className="text-[11px] font-bold uppercase tracking-wider text-muted block">
            Car Brand
          </label>
          <div className="flex flex-wrap gap-1.5">
            {diecastBrands.map((b) => {
              const active = filters.brand === b;
              return (
                <button
                  key={b}
                  onClick={() =>
                    setFilters((prev) => ({
                      ...prev,
                      brand: active ? '' : b
                    }))
                  }
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                    active
                      ? 'bg-charcoal text-white border-charcoal'
                      : 'bg-white text-charcoal border-border-light hover:border-charcoal'
                  }`}
                >
                  {b}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Scale Filter for Die-Cast */}
      {isDiecast && (
        <div className="space-y-2 pt-2 border-t border-border-light">
          <label className="text-[11px] font-bold uppercase tracking-wider text-muted block">
            Scale Ratio
          </label>
          <div className="grid grid-cols-2 gap-2">
            {diecastScales.map((sc) => {
              const active = filters.scale === sc;
              return (
                <button
                  key={sc}
                  onClick={() =>
                    setFilters((prev) => ({
                      ...prev,
                      scale: active ? '' : sc
                    }))
                  }
                  className={`py-1.5 rounded-lg text-xs font-bold border transition-all ${
                    active
                      ? 'bg-charcoal text-white border-charcoal'
                      : 'bg-white text-charcoal border-border-light hover:border-charcoal'
                  }`}
                >
                  {sc}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Sort By Dropdown */}
      <div className="space-y-2 pt-2 border-t border-border-light">
        <label className="text-[11px] font-bold uppercase tracking-wider text-muted block">
          Sort Products
        </label>
        <select
          value={filters.sortBy || 'default'}
          onChange={(e) => setFilters((prev) => ({ ...prev, sortBy: e.target.value }))}
          className="w-full text-xs font-semibold bg-cream-50 border border-border-light rounded-xl px-3 py-2.5 outline-none text-charcoal focus:border-charcoal"
        >
          {sortOptions.map((opt) => (
            <option key={opt.id} value={opt.id}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

