import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, Upload, Plus, Trash2, Check, Sparkles, 
  Image as ImageIcon, ShieldCheck, Car, Layers 
} from 'lucide-react';
import { db } from '../services/dbBridge';
import { uploadFile } from '../services/storageService';
import { useToast } from '../context/ToastContext';

export const AdminProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { success, error } = useToast();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditing);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    category: 'posters',
    subcategory: 'anime',
    brand: '',
    model: '',
    description: '',
    price: 499,
    original_price: 799,
    stock: 50,
    tags: 'Archival Matte, 320 GSM, Collectible',
    is_featured: false,
    is_best_seller: false,
    images: [],
    variants: [
      { size: 'A5', price: 299, originalPrice: 499, stock: 20 },
      { size: 'A4', price: 499, originalPrice: 799, stock: 20 },
      { size: 'A3', price: 799, originalPrice: 1099, stock: 10 }
    ],
    specs: {
      material: '',
      openingFeatures: '',
      paintFinish: '',
      packaging: ''
    }
  });

  const [newImageUrl, setNewImageUrl] = useState('');

  // Fetch product for editing
  useEffect(() => {
    if (isEditing) {
      const fetchItem = async () => {
        try {
          const item = await db.getProductById(id);
          if (item) {
            setFormData({
              ...item,
              tags: Array.isArray(item.tags) ? item.tags.join(', ') : item.tags || '',
              images: Array.isArray(item.images) ? item.images : [],
              variants: Array.isArray(item.variants) ? item.variants : [],
              specs: item.specs || { material: '', openingFeatures: '', paintFinish: '', packaging: '' }
            });
          }
        } catch (err) {
          console.error(err);
          error('Could not load product details.');
        } finally {
          setFetching(false);
        }
      };
      fetchItem();
    }
  }, [id, isEditing]);

  // Adjust default variants when category changes
  const handleCategoryChange = (newCat) => {
    if (newCat === 'diecast') {
      setFormData((prev) => ({
        ...prev,
        category: newCat,
        subcategory: 'lamborghini',
        brand: prev.brand || 'Lamborghini',
        model: prev.model || '',
        price: 4499,
        original_price: 5999,
        variants: [
          { scale: '1:64', price: 1299, originalPrice: 1599, stock: 10 },
          { scale: '1:32', price: 2499, originalPrice: 2999, stock: 10 },
          { scale: '1:24', price: 4499, originalPrice: 5999, stock: 5 },
          { scale: '1:18', price: 8999, originalPrice: 10999, stock: 2 }
        ],
        specs: {
          material: 'Die-cast Heavy Zinc Alloy with ABS Interior',
          openingFeatures: 'Working Steering, Opening Doors & Hood',
          paintFinish: 'Electrostatic Automotive High Gloss Finish',
          packaging: 'Deluxe Acrylic Collector Display Showcase'
        }
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        category: 'posters',
        subcategory: 'anime',
        brand: '',
        model: '',
        price: 499,
        original_price: 799,
        variants: [
          { size: 'A5', price: 299, originalPrice: 499, stock: 20 },
          { size: 'A4', price: 499, originalPrice: 799, stock: 20 },
          { size: 'A3', price: 799, originalPrice: 1099, stock: 10 }
        ]
      }));
    }
  };

  // Image Upload handler
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const url = await uploadFile(file, 'product-images');
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, url]
      }));
      success('Image uploaded successfully.');
    } catch (err) {
      error(err.message || 'Image upload failed.');
    }
  };

  const handleAddImageUrl = (e) => {
    e.preventDefault();
    if (!newImageUrl.trim()) return;
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, newImageUrl.trim()]
    }));
    setNewImageUrl('');
  };

  const handleRemoveImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  // Variant operations
  const handleVariantChange = (index, field, value) => {
    const updated = [...formData.variants];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, variants: updated });
  };

  const handleAddVariant = () => {
    if (formData.category === 'posters') {
      setFormData((prev) => ({
        ...prev,
        variants: [...prev.variants, { size: 'Custom', price: prev.price, originalPrice: prev.original_price, stock: 10 }]
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        variants: [...prev.variants, { scale: '1:43', price: prev.price, originalPrice: prev.original_price, stock: 5 }]
      }));
    }
  };

  const handleRemoveVariant = (index) => {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index)
    }));
  };

  // Form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      error('Product Name is required.');
      return;
    }
    if (formData.images.length === 0) {
      error('Please provide at least one product image.');
      return;
    }

    setLoading(true);

    try {
      // Calculate total stock from variants if variants exist
      const computedStock = formData.variants.length > 0
        ? formData.variants.reduce((sum, v) => sum + (parseInt(v.stock, 10) || 0), 0)
        : parseInt(formData.stock, 10) || 0;

      const tagArray = typeof formData.tags === 'string'
        ? formData.tags.split(',').map((t) => t.trim()).filter(Boolean)
        : formData.tags;

      const productPayload = {
        ...formData,
        stock: computedStock,
        price: parseFloat(formData.price) || 0,
        original_price: formData.original_price ? parseFloat(formData.original_price) : null,
        tags: tagArray
      };

      await db.saveProduct(productPayload);
      success(isEditing ? 'Product updated successfully.' : 'Product created and published to storefront.');
      navigate('/admin/products');
    } catch (err) {
      console.error(err);
      error(err.message || 'Failed to save product.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="py-20 text-center space-y-4">
        <div className="w-10 h-10 border-2 border-charcoal border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs uppercase font-bold tracking-wider text-muted">Loading product for editing...</p>
      </div>
    );
  }

  const isPoster = formData.category === 'posters';

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-16">
      {/* Top Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-border-light">
        <Link
          to="/admin/products"
          className="inline-flex items-center gap-2 text-xs font-semibold text-muted hover:text-charcoal transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Products</span>
        </Link>
        <span className="text-xs uppercase font-bold tracking-widest text-muted">
          {isEditing ? 'Edit Mode' : 'New Catalog Entry'}
        </span>
      </div>

      <div className="bg-white rounded-3xl border border-border-light p-6 sm:p-10 shadow-soft">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section 1: Basic Info */}
          <div className="space-y-4">
            <h3 className="font-serif text-lg font-bold text-charcoal border-b border-border-light pb-2">
              1. Basic Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-bold uppercase tracking-wider text-charcoal block">
                  Product Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Porsche 911 GT3 RS Weissach Package Shark Blue"
                  className="w-full text-xs font-medium bg-cream-50 border border-border-light rounded-xl px-4 py-3 outline-none focus:border-charcoal"
                />
              </div>

              {/* Category */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-charcoal block">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="w-full text-xs font-semibold bg-cream-50 border border-border-light rounded-xl px-4 py-3 outline-none focus:border-charcoal"
                >
                  <option value="posters">Posters & Wall Art</option>
                  <option value="diecast">Die-Cast Model Cars</option>
                </select>
              </div>

              {/* Subcategory */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-charcoal block">
                  Subcategory <span className="text-red-500">*</span>
                </label>
                {isPoster ? (
                  <select
                    value={formData.subcategory}
                    onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                    className="w-full text-xs font-semibold bg-cream-50 border border-border-light rounded-xl px-4 py-3 outline-none focus:border-charcoal"
                  >
                    <option value="anime">Anime Posters</option>
                    <option value="car">Car Posters & Blueprints</option>
                    <option value="movie">Movie Posters</option>
                    <option value="aesthetic">Aesthetic & Ambient Posters</option>
                  </select>
                ) : (
                  <select
                    value={formData.subcategory}
                    onChange={(e) => setFormData({ ...formData, subcategory: e.target.value, brand: e.target.value })}
                    className="w-full text-xs font-semibold bg-cream-50 border border-border-light rounded-xl px-4 py-3 outline-none focus:border-charcoal"
                  >
                    <option value="lamborghini">Lamborghini</option>
                    <option value="porsche">Porsche</option>
                    <option value="ferrari">Ferrari</option>
                    <option value="bmw">BMW</option>
                    <option value="mercedes">Mercedes-Benz</option>
                  </select>
                )}
              </div>

              {/* Brand and Model for Die-Cast */}
              {!isPoster && (
                <>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-charcoal block">
                      Manufacturer / Brand
                    </label>
                    <input
                      type="text"
                      value={formData.brand}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                      placeholder="e.g. Porsche"
                      className="w-full text-xs font-medium bg-cream-50 border border-border-light rounded-xl px-4 py-3 outline-none focus:border-charcoal"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-charcoal block">
                      Vehicle Model Name
                    </label>
                    <input
                      type="text"
                      value={formData.model}
                      onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                      placeholder="e.g. 911 GT3 RS (992)"
                      className="w-full text-xs font-medium bg-cream-50 border border-border-light rounded-xl px-4 py-3 outline-none focus:border-charcoal"
                    />
                  </div>
                </>
              )}

              {/* Description */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-bold uppercase tracking-wider text-charcoal block">
                  Product Description
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detailed craftsmanship notes, materials, print finish, scale details..."
                  className="w-full text-xs font-medium bg-cream-50 border border-border-light rounded-xl p-3 outline-none focus:border-charcoal"
                />
              </div>

              {/* Tags */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-bold uppercase tracking-wider text-charcoal block">
                  Product Tags (Comma Separated)
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="e.g. 320 GSM, Archival, Motorsport, Limited Edition"
                  className="w-full text-xs font-medium bg-cream-50 border border-border-light rounded-xl px-4 py-3 outline-none focus:border-charcoal"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Pricing & Toggles */}
          <div className="space-y-4">
            <h3 className="font-serif text-lg font-bold text-charcoal border-b border-border-light pb-2">
              2. Base Pricing & Badges
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-charcoal block">
                  Base Price (INR) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full text-xs font-bold bg-cream-50 border border-border-light rounded-xl px-4 py-3 outline-none focus:border-charcoal"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-charcoal block">
                  Original / Strikethrough Price (INR)
                </label>
                <input
                  type="number"
                  min={0}
                  value={formData.original_price || ''}
                  onChange={(e) => setFormData({ ...formData, original_price: e.target.value })}
                  className="w-full text-xs font-bold bg-cream-50 border border-border-light rounded-xl px-4 py-3 outline-none focus:border-charcoal"
                />
              </div>
            </div>

            {/* Badges Toggles */}
            <div className="flex flex-wrap gap-6 pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_featured}
                  onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                  className="rounded text-charcoal focus:ring-charcoal"
                />
                <span className="text-xs font-semibold text-charcoal">Featured on Homepage</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_best_seller}
                  onChange={(e) => setFormData({ ...formData, is_best_seller: e.target.checked })}
                  className="rounded text-charcoal focus:ring-charcoal"
                />
                <span className="text-xs font-semibold text-charcoal">Best Seller Badge</span>
              </label>
            </div>
          </div>

          {/* Section 3: Variants & Variant Stock */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-border-light pb-2">
              <h3 className="font-serif text-lg font-bold text-charcoal">
                3. {isPoster ? 'Poster Size Variants' : 'Die-Cast Scale Variants'}
              </h3>
              <button
                type="button"
                onClick={handleAddVariant}
                className="inline-flex items-center gap-1 text-xs font-bold uppercase text-charcoal hover:underline"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Variant</span>
              </button>
            </div>

            <div className="space-y-3">
              {formData.variants.map((v, i) => (
                <div
                  key={i}
                  className="p-4 bg-cream-50 rounded-2xl border border-border-light grid grid-cols-1 sm:grid-cols-5 gap-3 items-center"
                >
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-muted">
                      {isPoster ? 'Size (A3/A4/A5)' : 'Scale (1:18/1:24)'}
                    </label>
                    <input
                      type="text"
                      required
                      value={v.size || v.scale || ''}
                      onChange={(e) =>
                        handleVariantChange(i, isPoster ? 'size' : 'scale', e.target.value)
                      }
                      className="w-full text-xs font-bold bg-white border border-border-light rounded-lg px-2.5 py-1.5"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-muted">Price (INR)</label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={v.price}
                      onChange={(e) => handleVariantChange(i, 'price', parseFloat(e.target.value) || 0)}
                      className="w-full text-xs font-bold bg-white border border-border-light rounded-lg px-2.5 py-1.5"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-muted">Original Price</label>
                    <input
                      type="number"
                      min={0}
                      value={v.originalPrice || ''}
                      onChange={(e) => handleVariantChange(i, 'originalPrice', parseFloat(e.target.value) || null)}
                      className="w-full text-xs font-bold bg-white border border-border-light rounded-lg px-2.5 py-1.5"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-muted">Stock Quantity</label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={v.stock}
                      onChange={(e) => handleVariantChange(i, 'stock', parseInt(e.target.value, 10) || 0)}
                      className="w-full text-xs font-bold bg-white border border-border-light rounded-lg px-2.5 py-1.5"
                    />
                  </div>

                  <div className="flex justify-end sm:pt-4">
                    <button
                      type="button"
                      onClick={() => handleRemoveVariant(i)}
                      className="p-1.5 text-muted hover:text-red-600 transition-colors"
                      title="Remove variant"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Specifications (for Die-Cast) */}
          {!isPoster && (
            <div className="space-y-4">
              <h3 className="font-serif text-lg font-bold text-charcoal border-b border-border-light pb-2">
                4. Die-Cast Vehicle Specifications
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-charcoal block">
                    Material Composition
                  </label>
                  <input
                    type="text"
                    value={formData.specs.material || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        specs: { ...formData.specs, material: e.target.value }
                      })
                    }
                    placeholder="e.g. Die-cast Heavy Zinc Alloy with ABS Interior"
                    className="w-full text-xs font-medium bg-cream-50 border border-border-light rounded-xl px-4 py-2.5 outline-none focus:border-charcoal"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-charcoal block">
                    Opening & Functioning Features
                  </label>
                  <input
                    type="text"
                    value={formData.specs.openingFeatures || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        specs: { ...formData.specs, openingFeatures: e.target.value }
                      })
                    }
                    placeholder="e.g. Scissor Doors, Engine Hood, Steerable Wheels"
                    className="w-full text-xs font-medium bg-cream-50 border border-border-light rounded-xl px-4 py-2.5 outline-none focus:border-charcoal"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-charcoal block">
                    Paint Finish
                  </label>
                  <input
                    type="text"
                    value={formData.specs.paintFinish || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        specs: { ...formData.specs, paintFinish: e.target.value }
                      })
                    }
                    placeholder="e.g. Electrostatic Multi-layer Gloss Clearcoat"
                    className="w-full text-xs font-medium bg-cream-50 border border-border-light rounded-xl px-4 py-2.5 outline-none focus:border-charcoal"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-charcoal block">
                    Collector Packaging
                  </label>
                  <input
                    type="text"
                    value={formData.specs.packaging || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        specs: { ...formData.specs, packaging: e.target.value }
                      })
                    }
                    placeholder="e.g. Padded Deluxe Acrylic Showcase Box with Plaque"
                    className="w-full text-xs font-medium bg-cream-50 border border-border-light rounded-xl px-4 py-2.5 outline-none focus:border-charcoal"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Section 5: Product Imagery */}
          <div className="space-y-4">
            <h3 className="font-serif text-lg font-bold text-charcoal border-b border-border-light pb-2">
              5. Product Images ({formData.images.length})
            </h3>

            {/* Current Images Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {formData.images.map((img, idx) => (
                <div
                  key={idx}
                  className="relative aspect-square rounded-2xl overflow-hidden bg-cream border border-border-light group"
                >
                  <img src={img} alt="Product" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                    title="Remove image"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  {idx === 0 && (
                    <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-charcoal text-white text-[9px] font-bold uppercase tracking-wider rounded">
                      Primary
                    </span>
                  )}
                </div>
              ))}

              {/* Upload Tile */}
              <label className="border-2 border-dashed border-border-light hover:border-charcoal aspect-square rounded-2xl flex flex-col items-center justify-center p-4 text-center cursor-pointer transition-colors bg-cream-50/50">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <Upload className="w-6 h-6 text-muted mb-1" />
                <span className="text-xs font-bold text-charcoal">Upload File</span>
                <span className="text-[10px] text-muted">PNG, JPG, WebP</span>
              </label>
            </div>

            {/* Or Add via External Image URL */}
            <div className="pt-2 flex items-center gap-2">
              <input
                type="url"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                placeholder="Or paste direct image URL (Unsplash, Cloudinary, etc.)..."
                className="flex-1 text-xs font-medium bg-cream-50 border border-border-light rounded-xl px-4 py-2.5 outline-none focus:border-charcoal"
              />
              <button
                type="button"
                onClick={handleAddImageUrl}
                className="px-4 py-2.5 bg-charcoal text-white rounded-xl text-xs font-semibold hover:bg-black transition-colors"
              >
                Add Image
              </button>
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-6 border-t border-border-light flex items-center justify-end gap-4">
            <Link
              to="/admin/products"
              className="px-6 py-3 rounded-xl border border-border-light text-xs font-semibold text-charcoal hover:bg-cream-100 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3.5 bg-charcoal text-white rounded-xl text-xs uppercase font-extrabold tracking-widest hover:bg-black transition-all shadow-md disabled:bg-cream-300 disabled:text-muted"
            >
              <span>{loading ? 'Saving Product...' : isEditing ? 'Update Product' : 'Publish Product'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

