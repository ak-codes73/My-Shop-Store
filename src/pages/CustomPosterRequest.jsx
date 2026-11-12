import React, { useState } from 'react';
import { Upload, CheckCircle2, Sparkles, Image, ShieldCheck, ArrowRight } from 'lucide-react';
import { db } from '../services/dbBridge';
import { uploadFile } from '../services/storageService';
import { useToast } from '../context/ToastContext';

export const CustomPosterRequest = () => {
  const { success, error } = useToast();
  const [loading, setLoading] = useState(false);
  const [submittedRequest, setSubmittedRequest] = useState(null);

  const [formData, setFormData] = useState({
    customer_name: '',
    phone: '',
    email: '',
    request_type: 'custom_poster',
    poster_size: 'A3',
    design_description: '',
    budget: '',
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        error('Image size must be under 10MB.');
        return;
      }
      setImageFile(file);
      const url = URL.createObjectURL(file);
      setImagePreview(url);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.customer_name.trim()) {
      error('Please enter your full name.');
      return;
    }
    if (!formData.phone.trim() || formData.phone.trim().length < 10) {
      error('Please enter a valid 10-digit phone number.');
      return;
    }
    if (!formData.design_description.trim()) {
      error('Please provide a description of the design you would like created.');
      return;
    }

    setLoading(true);

    try {
      let uploadedImageUrl = null;
      if (imageFile) {
        uploadedImageUrl = await uploadFile(imageFile, 'product-images');
      }

      const newRequest = await db.createCustomRequest({
        customer_name: formData.customer_name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim() || null,
        request_type: formData.request_type,
        poster_size: formData.poster_size,
        design_description: formData.design_description.trim(),
        reference_image_url: uploadedImageUrl,
        budget: formData.budget ? parseFloat(formData.budget) : null
      });

      setSubmittedRequest(newRequest);
      success('Custom order request submitted successfully!');
    } catch (err) {
      console.error(err);
      error(err.message || 'Failed to submit request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-10">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cream-100 border border-border-light text-xs uppercase font-bold tracking-widest text-charcoal">
          <Sparkles className="w-3.5 h-3.5 text-accent" />
          <span>Bespoke Collector Commission</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-5xl font-extrabold text-charcoal">
          Request a Custom Poster or Print
        </h1>
        <p className="max-w-xl mx-auto text-xs sm:text-sm text-muted leading-relaxed">
          Looking for a specific manga panel, motorsport telemetry diagram, gaming render, or personal art piece? Our design team formats and prints museum-grade 320 GSM prints for your space.
        </p>
      </div>

      {submittedRequest ? (
        <div className="bg-white rounded-3xl border border-border-light p-8 sm:p-12 text-center space-y-6 shadow-lift animate-fade-in">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="font-serif text-2xl font-bold text-charcoal">
              Commission Request Received!
            </h2>
            <p className="text-xs text-muted max-w-md mx-auto">
              Our art team will review your specifications and contact you on WhatsApp / Phone within 24 hours with a digital proof preview and quote.
            </p>
          </div>

          <div className="max-w-md mx-auto bg-cream-50 p-4 rounded-2xl border border-border-light text-xs space-y-2 text-left">
            <div className="flex justify-between">
              <span className="text-muted">Request Reference:</span>
              <span className="font-mono font-bold text-charcoal">{submittedRequest.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Target Size:</span>
              <span className="font-bold text-charcoal">{submittedRequest.poster_size}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Contact:</span>
              <span className="font-bold text-charcoal">{submittedRequest.phone}</span>
            </div>
          </div>

          <button
            onClick={() => {
              setSubmittedRequest(null);
              setFormData({
                customer_name: '',
                phone: '',
                email: '',
                request_type: 'custom_poster',
                poster_size: 'A3',
                design_description: '',
                budget: ''
              });
              setImageFile(null);
              setImagePreview('');
            }}
            className="inline-flex items-center gap-2 px-6 py-3 bg-charcoal text-white rounded-xl text-xs uppercase font-bold tracking-wider hover:bg-black transition-colors"
          >
            <span>Submit Another Request</span>
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-border-light p-6 sm:p-10 shadow-soft">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Customer Name */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-charcoal block">
                  Your Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.customer_name}
                  onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                  placeholder="e.g. Aryan Kedar"
                  className="w-full text-xs font-medium bg-cream-50 border border-border-light rounded-xl px-4 py-3 outline-none focus:border-charcoal transition-colors"
                />
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-charcoal block">
                  WhatsApp / Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="e.g. 9876543210 (for design proofs)"
                  className="w-full text-xs font-medium bg-cream-50 border border-border-light rounded-xl px-4 py-3 outline-none focus:border-charcoal transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Email */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-charcoal block">
                  Email Address (Optional)
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="name@example.com"
                  className="w-full text-xs font-medium bg-cream-50 border border-border-light rounded-xl px-4 py-3 outline-none focus:border-charcoal transition-colors"
                />
              </div>

              {/* Poster Size */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-charcoal block">
                  Preferred Size
                </label>
                <select
                  value={formData.poster_size}
                  onChange={(e) => setFormData({ ...formData, poster_size: e.target.value })}
                  className="w-full text-xs font-semibold bg-cream-50 border border-border-light rounded-xl px-4 py-3 outline-none focus:border-charcoal transition-colors"
                >
                  <option value="A5">A5 Small (14.8 &times; 21.0 cm) - Ideal for Desk</option>
                  <option value="A4">A4 Standard (21.0 &times; 29.7 cm) - Popular Size</option>
                  <option value="A3">A3 Large (29.7 &times; 42.0 cm) - Recommended for Wall</option>
                  <option value="Custom Size">Custom Dimensions (Specify in description)</option>
                </select>
              </div>
            </div>

            {/* Design Description */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-charcoal block">
                Design Concept / Instructions <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows={4}
                value={formData.design_description}
                onChange={(e) => setFormData({ ...formData, design_description: e.target.value })}
                placeholder="Describe the artwork you want. For example: A dark synthwave Ferrari Testarossa under neon rain in Tokyo, with 1980s typography header..."
                className="w-full text-xs font-medium bg-cream-50 border border-border-light rounded-xl p-4 outline-none focus:border-charcoal transition-colors"
              />
            </div>

            {/* Image Upload */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-charcoal block">
                Upload Reference Image or Sketch (Optional)
              </label>
              <div className="border-2 border-dashed border-border-light hover:border-charcoal rounded-2xl p-6 text-center cursor-pointer transition-colors bg-cream-50/50">
                <input
                  type="file"
                  accept="image/*"
                  id="custom-ref-img"
                  className="hidden"
                  onChange={handleImageChange}
                />
                <label htmlFor="custom-ref-img" className="cursor-pointer block space-y-2">
                  {imagePreview ? (
                    <div className="space-y-3">
                      <img
                        src={imagePreview}
                        alt="Reference Preview"
                        className="max-h-48 mx-auto rounded-xl object-contain shadow-sm border border-border-light"
                      />
                      <span className="text-xs font-semibold text-charcoal block hover:underline">
                        Click to change image
                      </span>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-muted mx-auto" />
                      <div className="text-xs font-bold text-charcoal">
                        Click to upload reference image
                      </div>
                      <p className="text-[11px] text-muted">
                        JPEG, PNG, WebP up to 10MB
                      </p>
                    </>
                  )}
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4 border-t border-border-light">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-4 px-8 bg-charcoal text-white rounded-xl text-xs uppercase font-extrabold tracking-widest hover:bg-black transition-all shadow-md disabled:bg-cream-300 disabled:text-muted"
              >
                <span>{loading ? 'Submitting Request...' : 'Submit Custom Request'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

