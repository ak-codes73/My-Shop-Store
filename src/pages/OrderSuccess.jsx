import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { CheckCircle2, Clock, ShieldCheck, ArrowRight, Package, Truck, Phone } from 'lucide-react';
import { db } from '../services/dbBridge';
import { formatCurrency, formatDate } from '../utils/formatters';

export const OrderSuccess = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Launch celebratory confetti burst
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {}

    const loadData = async () => {
      try {
        const o = await db.getOrderById(orderId);
        if (o) {
          setOrder(o);
          const p = await db.getPaymentByOrderId(o.id);
          setPayment(p);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [orderId]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-12 h-12 border-2 border-charcoal border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs uppercase font-bold tracking-wider text-muted">Retrieving Order Receipt...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="font-serif text-2xl font-bold text-charcoal">Order Not Found</h2>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-charcoal text-white rounded-xl text-xs uppercase font-bold"
        >
          <span>Return Home</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8 animate-fade-in">
      {/* Top Card */}
      <div className="bg-white rounded-3xl border border-border-light p-8 sm:p-12 text-center space-y-6 shadow-lift">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <span className="text-xs uppercase font-bold tracking-widest text-emerald-700">
            Order Submitted Successfully
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-charcoal">
            Thank You, {order.customer_name.split(' ')[0]}!
          </h1>
          <p className="text-xs sm:text-sm text-muted max-w-md mx-auto">
            Your order has been recorded. Our team is now verifying your UPI transaction reference ID.
          </p>
        </div>

        {/* Order Details Badge Box */}
        <div className="bg-cream-50 rounded-2xl p-6 border border-border-light text-xs space-y-3 max-w-lg mx-auto text-left">
          <div className="flex justify-between items-center pb-2 border-b border-border-light">
            <span className="text-muted">Order ID:</span>
            <span className="font-mono font-bold text-charcoal text-sm">{order.order_number}</span>
          </div>

          <div className="flex justify-between items-center pb-2 border-b border-border-light">
            <span className="text-muted">Order Status:</span>
            <span className="font-semibold text-charcoal">{order.order_status}</span>
          </div>

          <div className="flex justify-between items-center pb-2 border-b border-border-light">
            <span className="text-muted">Payment Status:</span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900">
              <Clock className="w-3 h-3" />
              <span>{payment?.payment_status || 'Pending Verification'}</span>
            </span>
          </div>

          {payment?.upi_reference_id && (
            <div className="flex justify-between items-center pb-2 border-b border-border-light">
              <span className="text-muted">Submitted UPI Reference:</span>
              <span className="font-mono font-bold text-charcoal">{payment.upi_reference_id}</span>
            </div>
          )}

          <div className="flex justify-between items-center pt-1 font-bold text-sm text-charcoal">
            <span>Total Amount:</span>
            <span>{formatCurrency(order.total_amount)}</span>
          </div>
        </div>

        {/* Delivery Timeline / Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-center max-w-lg mx-auto">
          <div className="p-3 bg-cream-100 rounded-xl">
            <Clock className="w-5 h-5 mx-auto text-accent mb-1" />
            <span className="text-[11px] font-bold text-charcoal block">1. Verification</span>
            <span className="text-[10px] text-muted">15-30 mins</span>
          </div>

          <div className="p-3 bg-cream-100 rounded-xl">
            <Package className="w-5 h-5 mx-auto text-accent mb-1" />
            <span className="text-[11px] font-bold text-charcoal block">2. Packaging</span>
            <span className="text-[10px] text-muted">Crush-proof boxing</span>
          </div>

          <div className="p-3 bg-cream-100 rounded-xl">
            <Truck className="w-5 h-5 mx-auto text-accent mb-1" />
            <span className="text-[11px] font-bold text-charcoal block">3. Dispatch</span>
            <span className="text-[10px] text-muted">Tracked Pan-India</span>
          </div>
        </div>

        {/* Actions */}
        <div className="pt-6 border-t border-border-light flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to={`/track-order?orderId=${encodeURIComponent(order.order_number)}&phone=${encodeURIComponent(order.phone)}`}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-charcoal text-white rounded-xl text-xs uppercase font-extrabold tracking-wider hover:bg-black transition-colors shadow-md"
          >
            <span>Track Order Status</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            to="/shop"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-white text-charcoal border border-border-light rounded-xl text-xs uppercase font-bold tracking-wider hover:bg-cream transition-colors"
          >
            <span>Continue Shopping</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

