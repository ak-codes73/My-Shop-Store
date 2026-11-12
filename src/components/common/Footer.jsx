import React from 'react';
import { Link } from 'react-router-dom';
import { useStoreSettings } from '../../context/StoreSettingsContext';
import { Instagram, MessageCircle, Mail, Phone, ShieldCheck, Truck, RefreshCw } from 'lucide-react';

export const Footer = () => {
  const { settings } = useStoreSettings();

  const whatsappUrl = settings?.whatsapp_number
    ? `https://wa.me/${settings.whatsapp_number.replace(/\D/g, '')}?text=Hi%20Atelier,%20I%20have%20an%20inquiry%20regarding%20my%20order.`
    : '#';

  return (
    <footer className="bg-charcoal text-white pt-16 pb-10 border-t border-charcoal-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Core Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-12 border-b border-charcoal-700 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-4 p-4 rounded-xl bg-charcoal-800">
            <Truck className="w-8 h-8 text-accent shrink-0" />
            <div>
              <h4 className="font-semibold text-sm tracking-wide">Pan-India Express Dispatch</h4>
              <p className="text-xs text-charcoal-300 mt-0.5">Free tracked shipping on orders over ₹{settings?.free_delivery_threshold || 999}</p>
            </div>
          </div>

          <div className="flex items-center justify-center md:justify-start gap-4 p-4 rounded-xl bg-charcoal-800">
            <ShieldCheck className="w-8 h-8 text-accent shrink-0" />
            <div>
              <h4 className="font-semibold text-sm tracking-wide">Verified Direct UPI QR</h4>
              <p className="text-xs text-charcoal-300 mt-0.5">Direct peer-to-peer payment with zero gateway surcharges</p>
            </div>
          </div>

          <div className="flex items-center justify-center md:justify-start gap-4 p-4 rounded-xl bg-charcoal-800">
            <RefreshCw className="w-8 h-8 text-accent shrink-0" />
            <div>
              <h4 className="font-semibold text-sm tracking-wide">Museum Quality Guarantee</h4>
              <p className="text-xs text-charcoal-300 mt-0.5">320+ GSM archival matte prints & precision die-cast zinc</p>
            </div>
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 py-12">
          {/* Brand info */}
          <div className="space-y-4">
            <span className="font-serif text-2xl font-bold tracking-widest uppercase block">
              {settings?.store_name || 'ATELIER & CO.'}
            </span>
            <p className="text-xs text-charcoal-300 leading-relaxed">
              Curating exceptional art prints and master-scale die-cast automotive models for passionate collectors, enthusiasts, and modern spaces.
            </p>
            <div className="flex items-center gap-3 pt-2">
              {settings?.instagram_handle && (
                <a
                  href={`https://instagram.com/${settings.instagram_handle.replace('@', '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2.5 bg-charcoal-800 hover:bg-black rounded-full transition-colors text-charcoal-200 hover:text-white"
                  aria-label="Instagram"
                >
                  <Instagram className="w-4 h-4" />
                </a>
              )}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="p-2.5 bg-charcoal-800 hover:bg-black rounded-full transition-colors text-charcoal-200 hover:text-white"
                aria-label="WhatsApp"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Catalog */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal-200 mb-4">
              Catalog & Collections
            </h4>
            <ul className="space-y-2.5 text-xs text-charcoal-300">
              <li>
                <Link to="/shop?category=posters" className="hover:text-white transition-colors">
                  All Posters & Wall Art
                </Link>
              </li>
              <li>
                <Link to="/shop?category=posters&subcategory=anime" className="hover:text-white transition-colors">
                  Anime & Manga Prints
                </Link>
              </li>
              <li>
                <Link to="/shop?category=posters&subcategory=car" className="hover:text-white transition-colors">
                  Motorsport & Car Blueprints
                </Link>
              </li>
              <li>
                <Link to="/shop?category=diecast" className="hover:text-white transition-colors">
                  Die-Cast Model Cars
                </Link>
              </li>
              <li>
                <Link to="/shop?category=diecast&brand=Lamborghini" className="hover:text-white transition-colors">
                  Lamborghini Supercars
                </Link>
              </li>
              <li>
                <Link to="/shop?category=diecast&brand=Porsche" className="hover:text-white transition-colors">
                  Porsche GT Series
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal-200 mb-4">
              Customer Support
            </h4>
            <ul className="space-y-2.5 text-xs text-charcoal-300">
              <li>
                <Link to="/track-order" className="hover:text-white transition-colors">
                  Track Your Order
                </Link>
              </li>
              <li>
                <Link to="/custom-order" className="hover:text-white transition-colors">
                  Custom Poster Request
                </Link>
              </li>
              <li>
                <Link to="/policies#shipping" className="hover:text-white transition-colors">
                  Shipping & Packaging Info
                </Link>
              </li>
              <li>
                <Link to="/policies#returns" className="hover:text-white transition-colors">
                  Returns & Replacements
                </Link>
              </li>
              <li>
                <Link to="/policies#upi-payment" className="hover:text-white transition-colors">
                  UPI Verification Guide
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal-200 mb-4">
              Direct Contact
            </h4>
            <div className="space-y-3 text-xs text-charcoal-300">
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-accent shrink-0" />
                <span>{settings?.contact_email || 'support@ateliercollectibles.com'}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-accent shrink-0" />
                <span>{settings?.contact_phone || '+91 98765 43210'}</span>
              </div>
              <div className="pt-2">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-2 bg-emerald-700/80 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Chat on WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-charcoal-700 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-charcoal-400">
          <p>
            &copy; {new Date().getFullYear()} {settings?.store_name || 'ATELIER & CO.'} All rights reserved.
          </p>
          <div className="flex items-center space-x-6">
            <Link to="/policies#privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link to="/policies#terms" className="hover:text-white transition-colors">
              Terms of Service
            </Link>
            <Link to="/admin/login" className="hover:text-white transition-colors">
              Admin Access
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

