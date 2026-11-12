import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ShieldCheck, Truck, RefreshCw, Smartphone, Lock } from 'lucide-react';
import { useStoreSettings } from '../context/StoreSettingsContext';
import { formatCurrency } from '../utils/formatters';

export const Policies = () => {
  const { hash } = useLocation();
  const { settings } = useStoreSettings();

  useEffect(() => {
    if (hash) {
      const element = document.getElementById(hash.replace('#', ''));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      window.scrollTo(0, 0);
    }
  }, [hash]);

  const threshold = settings?.free_delivery_threshold || 999;
  const deliveryCharge = settings?.delivery_charge || 99;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-12">
      <div className="text-center space-y-2">
        <span className="text-xs uppercase font-bold tracking-widest text-muted">
          Transparency & Assurance
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-charcoal">
          Store Policies & Customer Protection
        </h1>
      </div>

      <div className="space-y-8">
        {/* Shipping Policy */}
        <section id="shipping" className="bg-white rounded-3xl border border-border-light p-6 sm:p-10 shadow-soft space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-border-light">
            <Truck className="w-6 h-6 text-accent" />
            <h2 className="font-serif text-xl font-bold text-charcoal">
              Shipping & Packaging Policy
            </h2>
          </div>
          <div className="space-y-3 text-xs sm:text-sm text-charcoal-600 leading-relaxed">
            <p>
              We provide express tracked delivery across all pin codes in India.
            </p>
            <ul className="list-disc list-inside space-y-1.5 pl-2">
              <li><strong>Free Shipping:</strong> On all domestic orders exceeding {formatCurrency(threshold)}. For orders under {formatCurrency(threshold)}, a flat delivery fee of {formatCurrency(deliveryCharge)} applies.</li>
              <li><strong>Packaging Standard for Posters:</strong> All A3, A4, and A5 prints are rolled inside protective kraft sleeves and encased in crush-proof cylindrical tubes to prevent edge creases.</li>
              <li><strong>Packaging Standard for Die-Cast Models:</strong> Models are securely tethered inside original manufacturer acrylic boxes, wrapped in multilayer shock-absorbent bubble cushioning, and outer-boxed.</li>
              <li><strong>Dispatch Timeline:</strong> Orders are verified and dispatched within 24 to 48 hours of UPI verification. Transit takes 3 to 5 business days depending on destination.</li>
            </ul>
          </div>
        </section>

        {/* Manual UPI Verification Policy */}
        <section id="upi-payment" className="bg-white rounded-3xl border border-border-light p-6 sm:p-10 shadow-soft space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-border-light">
            <Smartphone className="w-6 h-6 text-accent" />
            <h2 className="font-serif text-xl font-bold text-charcoal">
              Manual UPI QR Payment Verification
            </h2>
          </div>
          <div className="space-y-3 text-xs sm:text-sm text-charcoal-600 leading-relaxed">
            <p>
              To offer collectors the lowest prices without payment gateway convenience fees (which typically take 2-3%), we operate a <strong>direct peer-to-peer UPI transfer system</strong>.
            </p>
            <ul className="list-disc list-inside space-y-1.5 pl-2">
              <li>Customers scan our official UPI QR code or transfer to our verified VPA ({settings?.upi_id || 'atelier.store@okaxis'}).</li>
              <li>Upon payment completion, enter the 12-digit UPI / UTR transaction reference number and upload the confirmation screenshot.</li>
              <li>Our finance team manually cross-references the UTR against our bank statement before moving your order to <strong>Confirmed</strong>.</li>
              <li>If any discrepancy is found, payment status will be updated to <em>Rejected</em> with a specific reason so you can rectify it.</li>
            </ul>
          </div>
        </section>

        {/* Returns & Replacements */}
        <section id="returns" className="bg-white rounded-3xl border border-border-light p-6 sm:p-10 shadow-soft space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-border-light">
            <RefreshCw className="w-6 h-6 text-accent" />
            <h2 className="font-serif text-xl font-bold text-charcoal">
              Returns, Replacements & Transit Damage
            </h2>
          </div>
          <div className="space-y-3 text-xs sm:text-sm text-charcoal-600 leading-relaxed">
            <p>
              We stand firmly behind the quality of every collectible.
            </p>
            <ul className="list-disc list-inside space-y-1.5 pl-2">
              <li><strong>Damage in Transit:</strong> If your poster tube or die-cast box arrives visibly crushed or damaged, take photos / unboxing video within 48 hours and send them to {settings?.contact_email || 'support@ateliercollectibles.com'} or our WhatsApp line.</li>
              <li>We will dispatch a complimentary replacement immediately with expedited shipping.</li>
              <li>Due to the limited-edition nature of collectible runs, change-of-mind cancellations cannot be accepted once packaging has commenced.</li>
            </ul>
          </div>
        </section>

        {/* Privacy Policy & Terms */}
        <section id="privacy" className="bg-white rounded-3xl border border-border-light p-6 sm:p-10 shadow-soft space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-border-light">
            <Lock className="w-6 h-6 text-accent" />
            <h2 className="font-serif text-xl font-bold text-charcoal">
              Privacy Policy & Security Standards
            </h2>
          </div>
          <div className="space-y-3 text-xs sm:text-sm text-charcoal-600 leading-relaxed">
            <p>
              We do not sell, rent, or trade your personal information. Customer details (name, phone, address, and email) are strictly used for delivery fulfillment, SMS dispatch notifications, and order verification.
            </p>
            <p>
              Customer order tracking is strictly access-controlled via mobile phone number verification to prevent unauthorized disclosure of personal addresses or order contents.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

