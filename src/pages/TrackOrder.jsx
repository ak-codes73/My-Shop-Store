import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  Search, ShieldCheck, Clock, CheckCircle2, Truck, Package, 
  MapPin, AlertCircle, Phone, ArrowRight, ExternalLink 
} from 'lucide-react';
import { db } from '../services/dbBridge';
import { formatCurrency, formatDate } from '../utils/formatters';

export const TrackOrder = () => {
  const [searchParams] = useSearchParams();
  const [orderNumberInput, setOrderNumberInput] = useState(searchParams.get('orderId') || '');
  const [phoneInput, setPhoneInput] = useState(searchParams.get('phone') || '');
  const [order, setOrder] = useState(null);
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleTrack = async (e) => {
    if (e) e.preventDefault();
    if (!orderNumberInput.trim() || !phoneInput.trim()) {
      setErrorMessage('Please enter both Order ID and Phone Number.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const foundOrder = await db.verifyOrderForTracking(orderNumberInput, phoneInput);
      if (foundOrder) {
        setOrder(foundOrder);
        const paymentData = await db.getPaymentByOrderId(foundOrder.id);
        setPayment(paymentData);
      } else {
        setOrder(null);
        setPayment(null);
        setErrorMessage('No order found matching this Order Number and Phone Number combination. Please verify your details.');
      }
      setSearched(true);
    } catch (err) {
      console.error(err);
      setErrorMessage('An error occurred while tracking the order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Auto-search if parameters are passed in URL
  useEffect(() => {
    if (orderNumberInput && phoneInput) {
      handleTrack();
    }
  }, []);

  // Real-time listener for current tracked order
  useEffect(() => {
    if (!order) return;

    const unsubscribeOrders = db.subscribe('orders', async () => {
      const refreshed = await db.getOrderById(order.id);
      if (refreshed) setOrder(refreshed);
    });

    const unsubscribePayments = db.subscribe('payments', async () => {
      const refreshed = await db.getPaymentByOrderId(order.id);
      if (refreshed) setPayment(refreshed);
    });

    return () => {
      if (typeof unsubscribeOrders === 'function') unsubscribeOrders();
      if (typeof unsubscribePayments === 'function') unsubscribePayments();
    };
  }, [order?.id]);

  // Status step progression
  const steps = [
    { id: 'Pending', label: 'Order Placed' },
    { id: 'Payment Verification', label: 'Payment Verification' },
    { id: 'Confirmed', label: 'Confirmed & Packed' },
    { id: 'Shipped', label: 'Out for Delivery' },
    { id: 'Delivered', label: 'Delivered' }
  ];

  const getStepIndex = (status) => {
    switch (status) {
      case 'Pending': return 0;
      case 'Payment Verification': return 1;
      case 'Confirmed': return 2;
      case 'Shipped': return 3;
      case 'Delivered': return 4;
      case 'Cancelled': return -1;
      default: return 0;
    }
  };

  const currentStep = order ? getStepIndex(order.order_status) : 0;
  const isCancelled = order?.order_status === 'Cancelled';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-10">
      {/* Header */}
      <div className="text-center space-y-2">
        <span className="text-xs uppercase font-bold tracking-widest text-muted">
          Live Tracking Portal
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-charcoal">
          Track Your Collectible Order
        </h1>
        <p className="text-xs text-muted max-w-md mx-auto">
          Enter your Order ID (from checkout receipt) and your registered 10-digit mobile number.
        </p>
      </div>

      {/* Verification / Search Form */}
      <div className="bg-white rounded-3xl border border-border-light p-6 sm:p-8 shadow-soft">
        <form onSubmit={handleTrack} className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
          <div className="sm:col-span-5 space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-charcoal block">
              Order ID / Number
            </label>
            <input
              type="text"
              required
              value={orderNumberInput}
              onChange={(e) => setOrderNumberInput(e.target.value)}
              placeholder="e.g. ORD-20261108-5421"
              className="w-full font-mono text-xs font-semibold bg-cream-50 border border-border-light rounded-xl px-4 py-3 outline-none focus:border-charcoal uppercase"
            />
          </div>

          <div className="sm:col-span-4 space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-charcoal block">
              Phone Number
            </label>
            <input
              type="tel"
              required
              value={phoneInput}
              onChange={(e) => setPhoneInput(e.target.value)}
              placeholder="10-digit phone number"
              className="w-full text-xs font-medium bg-cream-50 border border-border-light rounded-xl px-4 py-3 outline-none focus:border-charcoal"
            />
          </div>

          <div className="sm:col-span-3">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-charcoal text-white rounded-xl text-xs uppercase font-bold tracking-wider hover:bg-black transition-colors shadow-sm disabled:bg-cream-300 disabled:text-muted"
            >
              <Search className="w-4 h-4" />
              <span>{loading ? 'Searching...' : 'Track Order'}</span>
            </button>
          </div>
        </form>

        {errorMessage && (
          <div className="mt-4 p-4 rounded-xl bg-red-50 border border-red-200 text-red-900 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>

      {/* Order Status Display Section */}
      {order && (
        <div className="space-y-8 animate-fade-in">
          {/* Status Tracker Card */}
          <div className="bg-white rounded-3xl border border-border-light p-6 sm:p-10 shadow-soft space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border-light">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-muted">
                  Order Number
                </span>
                <h2 className="font-mono text-xl sm:text-2xl font-bold text-charcoal">
                  {order.order_number}
                </h2>
                <span className="text-xs text-muted">
                  Placed on {formatDate(order.created_at)}
                </span>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 bg-cream-100 text-charcoal rounded-full text-xs font-bold border border-border-light">
                  Order: {order.order_status}
                </span>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold border ${
                    payment?.payment_status === 'Verified'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : payment?.payment_status === 'Rejected'
                      ? 'bg-red-50 text-red-800 border-red-300'
                      : 'bg-amber-50 text-amber-800 border-amber-300'
                  }`}
                >
                  Payment: {payment?.payment_status || 'Awaiting Payment'}
                </span>
              </div>
            </div>

            {/* Stepper Progress Bar */}
            {isCancelled ? (
              <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-center text-red-900 text-xs font-bold">
                This order was marked as Cancelled. Please contact store support for assistance.
              </div>
            ) : (
              <div className="py-4">
                <div className="relative">
                  {/* Background line */}
                  <div className="absolute top-4 left-0 w-full h-1 bg-cream-200 rounded-full" />
                  {/* Active line */}
                  <div
                    className="absolute top-4 left-0 h-1 bg-charcoal rounded-full transition-all duration-700"
                    style={{
                      width: `${(currentStep / (steps.length - 1)) * 100}%`
                    }}
                  />

                  {/* Steps */}
                  <div className="relative flex justify-between">
                    {steps.map((st, i) => {
                      const isCompleted = i <= currentStep;
                      const isCurrent = i === currentStep;

                      return (
                        <div key={st.id} className="flex flex-col items-center">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all z-10 ${
                              isCompleted
                                ? 'bg-charcoal text-white shadow-sm ring-4 ring-white'
                                : 'bg-cream-100 text-muted border border-border-light'
                            }`}
                          >
                            {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                          </div>
                          <span
                            className={`text-[10px] sm:text-xs font-semibold text-center mt-2 max-w-[70px] sm:max-w-none ${
                              isCurrent ? 'text-charcoal font-bold' : isCompleted ? 'text-charcoal' : 'text-muted'
                            }`}
                          >
                            {st.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Payment Rejection Alert & Action */}
            {payment?.payment_status === 'Rejected' && (
              <div className="p-5 rounded-2xl bg-red-50 border border-red-200 text-xs space-y-3">
                <div className="flex items-center gap-2 font-bold text-red-900">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  <span>Payment Verification Issue</span>
                </div>
                <p className="text-red-800 leading-relaxed">
                  Reason provided by store admin: &ldquo;{payment.rejection_reason || 'Transaction could not be verified against bank records.'}&rdquo;
                </p>
                <div>
                  <Link
                    to={`/payment/${order.id}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded-lg font-bold text-xs uppercase tracking-wider transition-colors"
                  >
                    <span>Resubmit Correct UPI Reference</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}

            {/* If Awaiting Payment, link to Payment page */}
            {payment?.payment_status === 'Awaiting Payment' && (
              <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-xs space-y-2 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-amber-950">Awaiting UPI Payment Submission</h4>
                  <p className="text-amber-800">Please scan the UPI QR code and submit your reference ID.</p>
                </div>
                <Link
                  to={`/payment/${order.id}`}
                  className="px-4 py-2 bg-charcoal text-white rounded-xl text-xs font-bold uppercase tracking-wider"
                >
                  Pay Now
                </Link>
              </div>
            )}

            {/* Customer Delivery Details & Order Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-border-light text-xs">
              {/* Delivery Address */}
              <div className="space-y-3">
                <h4 className="font-bold uppercase tracking-wider text-charcoal flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-accent" />
                  <span>Delivery Address</span>
                </h4>
                <div className="p-4 bg-cream-50 rounded-2xl border border-border-light space-y-1 text-charcoal-700">
                  <p className="font-bold text-charcoal">{order.customer_name}</p>
                  <p>{order.address}</p>
                  <p>{order.city}, {order.state} - {order.pincode}</p>
                  <p className="pt-1 text-muted">Phone: {order.phone}</p>
                </div>
              </div>

              {/* Items Summary */}
              <div className="space-y-3">
                <h4 className="font-bold uppercase tracking-wider text-charcoal flex items-center gap-1.5">
                  <Package className="w-4 h-4 text-accent" />
                  <span>Items Purchased ({order.items?.length || 0})</span>
                </h4>
                <div className="p-4 bg-cream-50 rounded-2xl border border-border-light space-y-2.5 max-h-48 overflow-y-auto">
                  {order.items?.map((it, idx) => (
                    <div key={idx} className="flex justify-between items-center text-[11px] pb-2 border-b border-border-light/60 last:border-none">
                      <div>
                        <span className="font-semibold text-charcoal block">{it.name}</span>
                        <span className="text-muted">
                          {it.variant ? `Variant: ${it.variant} &bull; ` : ''}Qty: {it.quantity}
                        </span>
                      </div>
                      <span className="font-bold text-charcoal">
                        {formatCurrency(it.price * it.quantity)}
                      </span>
                    </div>
                  ))}
                  <div className="pt-2 border-t border-border-light flex justify-between font-bold text-xs text-charcoal">
                    <span>Total Amount</span>
                    <span>{formatCurrency(order.total_amount)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

