import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { 
  Copy, Check, Upload, ShieldCheck, AlertCircle, Clock, 
  CheckCircle2, XCircle, ArrowRight, Smartphone, RefreshCw 
} from 'lucide-react';
import { db } from '../services/dbBridge';
import { uploadFile } from '../services/storageService';
import { useStoreSettings } from '../context/StoreSettingsContext';
import { useToast } from '../context/ToastContext';
import { formatCurrency, formatDate } from '../utils/formatters';
import { generateUpiPaymentString, validateUpiReference } from '../utils/upi';

export const Payment = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { settings } = useStoreSettings();
  const { success, error, info } = useToast();

  const [order, setOrder] = useState(null);
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [upiRefId, setUpiRefId] = useState('');
  const [screenshotFile, setScreenshotFile] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState('');
  const [confirmedCheckbox, setConfirmedCheckbox] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);

  // Fetch Order and Payment
  const fetchOrderAndPayment = async () => {
    try {
      const orderData = await db.getOrderById(orderId);
      if (orderData) {
        setOrder(orderData);
        const paymentData = await db.getPaymentByOrderId(orderData.id);
        setPayment(paymentData);
        if (paymentData?.upi_reference_id) {
          setUpiRefId(paymentData.upi_reference_id);
        }
      }
    } catch (err) {
      console.error('Error fetching order & payment:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderAndPayment();

    // Listen for realtime updates to this payment
    const unsubscribePayments = db.subscribe('payments', (payload) => {
      fetchOrderAndPayment();
    });

    const unsubscribeOrders = db.subscribe('orders', (payload) => {
      fetchOrderAndPayment();
    });

    return () => {
      if (typeof unsubscribePayments === 'function') unsubscribePayments();
      if (typeof unsubscribeOrders === 'function') unsubscribeOrders();
    };
  }, [orderId]);

  const handleCopyUpi = () => {
    const upi = settings?.upi_id || 'atelier.store@okaxis';
    navigator.clipboard.writeText(upi);
    setCopiedUpi(true);
    info('UPI ID copied to clipboard');
    setTimeout(() => setCopiedUpi(false), 2500);
  };

  const handleScreenshotChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        error('Screenshot file must be under 10MB.');
        return;
      }
      setScreenshotFile(file);
      setScreenshotPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmitPayment = async (e) => {
    e.preventDefault();

    const validation = validateUpiReference(upiRefId);
    if (!validation.valid) {
      error(validation.message);
      return;
    }

    if (!confirmedCheckbox) {
      error('Please confirm you have transferred the exact order amount.');
      return;
    }

    setSubmitting(true);

    try {
      let uploadedScreenshotUrl = payment?.screenshot_url || null;
      if (screenshotFile) {
        uploadedScreenshotUrl = await uploadFile(screenshotFile, 'payment-proofs');
      }

      await db.submitPaymentDetails(
        order.id,
        validation.value,
        uploadedScreenshotUrl
      );

      success('Payment details submitted successfully! Awaiting manual verification.');
      await fetchOrderAndPayment();
      navigate(`/order-success/${order.id}`);
    } catch (err) {
      console.error('Submit payment error:', err);
      error(err.message || 'Failed to submit payment details.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-12 h-12 border-2 border-charcoal border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs uppercase font-bold tracking-wider text-muted">
          Generating UPI Payment Invoice...
        </p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="font-serif text-2xl font-bold text-charcoal">Order Not Found</h2>
        <p className="text-xs text-muted">We could not retrieve order details for ID &ldquo;{orderId}&rdquo;.</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-charcoal text-white rounded-xl text-xs uppercase font-bold tracking-wider"
        >
          <span>Return Home</span>
        </Link>
      </div>
    );
  }

  const upiId = settings?.upi_id || 'atelier.store@okaxis';
  const payeeName = settings?.upi_payee_name || 'Atelier Collectibles';
  const payableAmount = order.total_amount;

  // Standard NPCI UPI URI string for QR scanner
  const upiUri = generateUpiPaymentString({
    upiId,
    payeeName,
    amount: payableAmount,
    orderNumber: order.order_number,
    note: `Order ${order.order_number}`
  });

  const paymentStatus = payment?.payment_status || 'Awaiting Payment';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8">
      {/* Top Banner / Order Identification */}
      <div className="bg-white rounded-3xl border border-border-light p-6 sm:p-8 shadow-soft flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-center sm:text-left space-y-1">
          <span className="text-xs font-bold uppercase tracking-widest text-muted">
            Order Reference
          </span>
          <h1 className="font-mono text-xl sm:text-2xl font-extrabold text-charcoal tracking-wide">
            {order.order_number}
          </h1>
          <p className="text-xs text-muted">
            Placed on {formatDate(order.created_at)} &bull; Customer: {order.customer_name}
          </p>
        </div>

        {/* Live Payment Status Pill */}
        <div className="flex flex-col items-center sm:items-end gap-1">
          <span className="text-[10px] uppercase font-bold tracking-widest text-muted">
            Payment Status
          </span>
          <span
            className={`px-4 py-1.5 rounded-full text-xs font-extrabold tracking-wider uppercase border shadow-sm flex items-center gap-1.5 ${
              paymentStatus === 'Verified'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : paymentStatus === 'Pending Verification'
                ? 'bg-amber-50 text-amber-800 border-amber-300'
                : paymentStatus === 'Rejected'
                ? 'bg-red-50 text-red-800 border-red-300'
                : 'bg-cream-100 text-charcoal border-charcoal/20'
            }`}
          >
            {paymentStatus === 'Verified' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
            {paymentStatus === 'Pending Verification' && <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />}
            {paymentStatus === 'Rejected' && <XCircle className="w-3.5 h-3.5 text-red-600" />}
            {paymentStatus === 'Awaiting Payment' && <Smartphone className="w-3.5 h-3.5 text-accent" />}
            <span>{paymentStatus}</span>
          </span>
        </div>
      </div>

      {/* If Payment is Rejected, show Reason & Prompt to Re-submit */}
      {paymentStatus === 'Rejected' && (
        <div className="bg-red-50 border border-red-200 rounded-3xl p-6 space-y-2 text-red-900">
          <div className="flex items-center gap-2 font-bold text-sm">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            <span>Payment Verification Notice</span>
          </div>
          <p className="text-xs leading-relaxed">
            <strong>Reason:</strong> {payment.rejection_reason || 'Transaction could not be verified against bank records. Please check the reference ID and resubmit.'}
          </p>
          <p className="text-[11px] text-red-700">
            You can enter your corrected 12-digit UPI reference ID below and resubmit for verification.
          </p>
        </div>
      )}

      {/* If Payment is Verified */}
      {paymentStatus === 'Verified' ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-8 sm:p-12 text-center space-y-4 shadow-soft">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-emerald-950">
            Payment Verified & Confirmed!
          </h2>
          <p className="text-xs text-emerald-800 max-w-md mx-auto">
            Your UPI payment of {formatCurrency(order.total_amount)} has been verified by the store admin. Your order is now confirmed for dispatch.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/track-order"
              className="px-6 py-3 bg-charcoal text-white rounded-xl text-xs uppercase font-bold tracking-wider hover:bg-black transition-colors"
            >
              Track Order Progress
            </Link>
            <Link
              to="/shop"
              className="px-6 py-3 bg-white text-charcoal border border-border-light rounded-xl text-xs uppercase font-bold tracking-wider hover:bg-cream transition-colors"
            >
              Back to Catalog
            </Link>
          </div>
        </div>
      ) : (
        /* Main Two-Column Payment Interface */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left: Dynamic UPI QR Code & Pay Details */}
          <div className="bg-white rounded-3xl border border-border-light p-6 sm:p-8 space-y-6 shadow-soft flex flex-col items-center text-center justify-between">
            <div className="space-y-2 w-full">
              <span className="text-xs uppercase font-bold tracking-widest text-muted">
                Scan & Pay Exact Amount
              </span>
              <div className="font-serif text-3xl font-extrabold text-charcoal">
                {formatCurrency(payableAmount)}
              </div>
              <p className="text-xs text-muted">
                Payable to: <strong className="text-charcoal">{payeeName}</strong>
              </p>
            </div>

            {/* QR Code Graphic */}
            <div className="p-4 bg-white rounded-2xl border-2 border-charcoal/10 shadow-sm flex flex-col items-center">
              {settings?.upi_qr_url ? (
                <img
                  src={settings.upi_qr_url}
                  alt="Store UPI QR Code"
                  className="w-48 h-48 sm:w-56 sm:h-56 object-contain rounded-xl"
                />
              ) : (
                <div className="p-2 bg-white">
                  <QRCodeSVG
                    value={upiUri}
                    size={200}
                    level="H"
                    includeMargin={false}
                  />
                </div>
              )}
              <span className="text-[10px] uppercase font-bold tracking-widest text-muted mt-3">
                Google Pay &bull; PhonePe &bull; Paytm &bull; BHIM
              </span>
            </div>

            {/* UPI ID + Copy Button */}
            <div className="w-full space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted block">
                Or transfer manually using UPI ID
              </span>
              <div className="flex items-center justify-between gap-2 p-2.5 bg-cream-50 rounded-xl border border-border-light">
                <span className="font-mono text-xs font-bold text-charcoal truncate px-2">
                  {upiId}
                </span>
                <button
                  type="button"
                  onClick={handleCopyUpi}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-charcoal text-white rounded-lg text-xs font-semibold hover:bg-black transition-colors shrink-0"
                >
                  {copiedUpi ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedUpi ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* Step-by-Step Instructions */}
            <div className="w-full text-left bg-cream-50 p-4 rounded-2xl border border-border-light space-y-2 text-xs">
              <h4 className="font-bold text-charcoal uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-accent" />
                <span>Instructions</span>
              </h4>
              <ol className="list-decimal list-inside space-y-1 text-charcoal-600 text-[11px] leading-relaxed">
                <li>Scan the QR code with any UPI app on your phone.</li>
                <li>Ensure the amount is exactly <strong>{formatCurrency(payableAmount)}</strong>.</li>
                <li>Complete transaction and note the 12-digit Reference / UTR ID.</li>
                <li>Submit the Reference ID on this form.</li>
              </ol>
            </div>
          </div>

          {/* Right: Payment Verification Form */}
          <div className="bg-white rounded-3xl border border-border-light p-6 sm:p-8 space-y-6 shadow-soft flex flex-col justify-between">
            <div>
              <div className="border-b border-border-light pb-4">
                <span className="text-xs uppercase font-bold tracking-widest text-muted">
                  Step 2: Confirm Payment
                </span>
                <h3 className="font-serif text-xl font-bold text-charcoal mt-1">
                  Submit Verification Details
                </h3>
              </div>

              <form id="payment-verify-form" onSubmit={handleSubmitPayment} className="space-y-5 pt-4">
                {/* 12-Digit UPI Reference ID */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-charcoal block">
                    12-Digit UPI / UTR Transaction ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={upiRefId}
                    onChange={(e) => setUpiRefId(e.target.value)}
                    placeholder="e.g. 431489201948"
                    className="w-full font-mono text-sm font-semibold bg-cream-50 border border-border-light rounded-xl px-4 py-3 outline-none focus:border-charcoal transition-colors tracking-wider"
                  />
                  <p className="text-[11px] text-muted">
                    Found on your payment success receipt (Google Pay, PhonePe, Paytm, CRED).
                  </p>
                </div>

                {/* Optional Screenshot Upload */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-charcoal block">
                    Upload Payment Screenshot (Recommended)
                  </label>
                  <div className="border-2 border-dashed border-border-light hover:border-charcoal rounded-2xl p-4 text-center cursor-pointer transition-colors bg-cream-50/50">
                    <input
                      type="file"
                      accept="image/*"
                      id="payment-screenshot"
                      className="hidden"
                      onChange={handleScreenshotChange}
                    />
                    <label htmlFor="payment-screenshot" className="cursor-pointer block space-y-2">
                      {screenshotPreview || payment?.screenshot_url ? (
                        <div className="space-y-2">
                          <img
                            src={screenshotPreview || payment?.screenshot_url}
                            alt="Screenshot Preview"
                            className="max-h-36 mx-auto rounded-lg object-contain shadow-sm border border-border-light"
                          />
                          <span className="text-[11px] font-semibold text-charcoal block hover:underline">
                            Click to change screenshot
                          </span>
                        </div>
                      ) : (
                        <>
                          <Upload className="w-6 h-6 text-muted mx-auto" />
                          <span className="text-xs font-bold text-charcoal block">
                            Upload receipt screenshot
                          </span>
                          <span className="text-[10px] text-muted block">
                            PNG, JPG or WebP up to 10MB
                          </span>
                        </>
                      )}
                    </label>
                  </div>
                </div>

                {/* Confirmation Checkbox */}
                <div className="pt-2">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      required
                      checked={confirmedCheckbox}
                      onChange={(e) => setConfirmedCheckbox(e.target.checked)}
                      className="mt-1 rounded text-charcoal focus:ring-charcoal"
                    />
                    <span className="text-xs text-charcoal leading-snug">
                      I confirm that I have transferred <strong>{formatCurrency(payableAmount)}</strong> to{' '}
                      <strong>{upiId}</strong> and entered the genuine transaction reference ID.
                    </span>
                  </label>
                </div>
              </form>
            </div>

            {/* Submit Action */}
            <div className="pt-6 border-t border-border-light space-y-3">
              <button
                type="submit"
                form="payment-verify-form"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 py-4 px-6 bg-charcoal text-white rounded-xl text-xs uppercase font-extrabold tracking-widest hover:bg-black transition-all shadow-md group disabled:bg-cream-300 disabled:text-muted"
              >
                <span>{submitting ? 'Submitting Details...' : 'Submit Payment for Verification'}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <div className="text-[11px] text-muted text-center space-y-1">
                <p className="font-semibold text-charcoal">
                  Important: Manual Admin Verification
                </p>
                <p>
                  Orders are confirmed only after our admin verifies the UPI reference against bank statements. Verification is typically completed within 15-30 minutes.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

