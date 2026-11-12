import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, Search, Edit3, Trash2, Eye, Star, Sparkles, 
  Package, AlertTriangle, Check, RefreshCw 
} from 'lucide-react';
import { db } from '../services/dbBridge';
import { useToast } from '../context/ToastContext';
import { formatCurrency } from '../utils/formatters';

export const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [stockFilter, setStockFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleteCandidate, setDeleteCandidate] = useState(null);

  const { success, error } = useToast();

  const fetchProducts = async () => {
    try {
      const data = await db.getProducts();
      setProducts(data);
    } catch (err) {
      console.error(err);
      error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();

    const unsubscribe = db.subscribe('products', () => {
      fetchProducts();
    });

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  const handleDelete = async () => {
    if (!deleteCandidate) return;
    try {
      await db.deleteProduct(deleteCandidate.id);
      success(`Product "${deleteCandidate.name}" removed successfully.`);
      setDeleteCandidate(null);
      await fetchProducts();
    } catch (err) {
      error('Failed to delete product.');
    }
  };

  const handleToggleBestSeller = async (product) => {
    try {
      await db.saveProduct({
        ...product,
        is_best_seller: !product.is_best_seller
      });
      success(`Updated Best Seller designation for "${product.name}"`);
    } catch (err) {
      error('Failed to update product');
    }
  };

  const handleToggleFeatured = async (product) => {
    try {
      await db.saveProduct({
        ...product,
        is_featured: !product.is_featured
      });
      success(`Updated Featured status for "${product.name}"`);
    } catch (err) {
      error('Failed to update product');
    }
  };

  // Filtered Products
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      !searchQuery.trim() ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.subcategory?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.brand?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = !categoryFilter || p.category === categoryFilter;

    let matchesStock = true;
    if (stockFilter === 'out') {
      matchesStock = p.stock <= 0;
    } else if (stockFilter === 'low') {
      matchesStock = p.stock > 0 && p.stock <= 10;
    } else if (stockFilter === 'in') {
      matchesStock = p.stock > 10;
    }

    return matchesSearch && matchesCategory && matchesStock;
  });

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-muted">
            Inventory & Catalog
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-charcoal mt-1">
            Product Management ({products.length})
          </h1>
        </div>

        <Link
          to="/admin/products/new"
          className="inline-flex items-center gap-2 px-5 py-3 bg-charcoal text-white rounded-xl text-xs uppercase font-bold tracking-wider hover:bg-black transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-border-light p-4 shadow-soft flex flex-col sm:flex-row items-center gap-4">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by product name, brand, subcategory..."
            className="w-full text-xs font-medium bg-cream-50 border border-border-light rounded-xl pl-10 pr-4 py-2.5 outline-none focus:border-charcoal"
          />
        </div>

        {/* Category Filter */}
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="w-full sm:w-auto text-xs font-semibold bg-cream-50 border border-border-light rounded-xl px-3 py-2.5 outline-none text-charcoal"
        >
          <option value="">All Categories</option>
          <option value="posters">Posters & Wall Art</option>
          <option value="diecast">Die-Cast Model Cars</option>
        </select>

        {/* Stock Filter */}
        <select
          value={stockFilter}
          onChange={(e) => setStockFilter(e.target.value)}
          className="w-full sm:w-auto text-xs font-semibold bg-cream-50 border border-border-light rounded-xl px-3 py-2.5 outline-none text-charcoal"
        >
          <option value="">All Stock Levels</option>
          <option value="in">In Stock (&gt; 10)</option>
          <option value="low">Low Stock (&le; 10)</option>
          <option value="out">Out of Stock (0)</option>
        </select>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-3xl border border-border-light shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border-light bg-cream-50/60 text-[11px] uppercase tracking-wider text-muted font-bold">
                <th className="p-4">Product</th>
                <th className="p-4">Category</th>
                <th className="p-4">Price / Variants</th>
                <th className="p-4">Stock</th>
                <th className="p-4">Badges</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-muted text-xs">
                    No products found matching the criteria.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const image = p.images?.[0] || 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=300&q=80';
                  const variants = p.variants || [];

                  return (
                    <tr key={p.id} className="hover:bg-cream-50/40 transition-colors">
                      {/* Product Name & Image */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={image}
                            alt={p.name}
                            className="w-12 h-12 object-cover rounded-xl bg-cream border border-border-light shrink-0"
                          />
                          <div>
                            <span className="font-bold text-charcoal block line-clamp-1">
                              {p.name}
                            </span>
                            <span className="text-[10px] text-muted font-mono">{p.id}</span>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="p-4">
                        <span className="capitalize font-semibold text-charcoal block">
                          {p.category === 'posters' ? 'Poster' : 'Die-Cast'}
                        </span>
                        <span className="text-[11px] text-muted capitalize">
                          {p.subcategory || p.brand}
                        </span>
                      </td>

                      {/* Pricing */}
                      <td className="p-4">
                        <span className="font-bold text-charcoal block">
                          {formatCurrency(p.price)}
                        </span>
                        {variants.length > 0 && (
                          <span className="text-[10px] text-muted block">
                            {variants.length} {p.category === 'posters' ? 'sizes' : 'scales'} configured
                          </span>
                        )}
                      </td>

                      {/* Stock Level */}
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            p.stock <= 0
                              ? 'bg-red-100 text-red-800'
                              : p.stock <= 10
                              ? 'bg-amber-100 text-amber-900'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {p.stock <= 0 && <AlertTriangle className="w-3 h-3" />}
                          <span>{p.stock} units</span>
                        </span>
                      </td>

                      {/* Toggles: Featured & Best Seller */}
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleToggleBestSeller(p)}
                            title="Toggle Best Seller"
                            className={`p-1.5 rounded-lg text-xs font-semibold border transition-all ${
                              p.is_best_seller
                                ? 'bg-charcoal text-accent border-charcoal'
                                : 'bg-white text-muted border-border-light hover:border-charcoal'
                            }`}
                          >
                            <Star className="w-3.5 h-3.5 fill-current" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleToggleFeatured(p)}
                            title="Toggle Featured"
                            className={`p-1.5 rounded-lg text-xs font-semibold border transition-all ${
                              p.is_featured
                                ? 'bg-accent text-charcoal border-accent font-bold'
                                : 'bg-white text-muted border-border-light hover:border-charcoal'
                            }`}
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/product/${p.slug}`}
                            target="_blank"
                            className="p-1.5 text-muted hover:text-charcoal transition-colors"
                            title="View on Storefront"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>

                          <Link
                            to={`/admin/products/edit/${p.id}`}
                            className="p-1.5 text-muted hover:text-charcoal transition-colors"
                            title="Edit Product"
                          >
                            <Edit3 className="w-4 h-4" />
                          </Link>

                          <button
                            type="button"
                            onClick={() => setDeleteCandidate(p)}
                            className="p-1.5 text-muted hover:text-red-600 transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-lift space-y-4 border border-border-light">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="font-serif text-lg font-bold text-charcoal">
                Confirm Product Deletion
              </h3>
              <p className="text-xs text-muted leading-relaxed">
                Are you sure you want to permanently delete{' '}
                <strong className="text-charcoal">&ldquo;{deleteCandidate.name}&rdquo;</strong>? This action cannot be undone.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-3">
              <button
                type="button"
                onClick={() => setDeleteCandidate(null)}
                className="px-5 py-2.5 rounded-xl border border-border-light text-xs font-semibold text-charcoal hover:bg-cream-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="px-5 py-2.5 rounded-xl bg-red-600 text-white text-xs font-bold uppercase tracking-wider hover:bg-red-700 transition-colors shadow-sm"
              >
                Delete Product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

