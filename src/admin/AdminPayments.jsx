import React, { useState, useEffect } from 'react';
import { 
  CreditCard, CheckCircle2, XCircle, Eye, Clock, ShieldCheck, 
  AlertCircle, ExternalLink, RefreshCw, X, MessageSquare, Search 
} from 'lucide-react';
import { db } from '../services/dbBridge';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { formatCurrency, formatDate } from '../utils/formatters';

export const AdminPayments = () => {
  const [payments, setPayments] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending'); // 'pending', 'verified', 'rejected', 'all'
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [screenshotModalUrl, setScreenshotModalUrl] = useState(null);
  const [rejectModalPayment, setRejectModalPayment] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const { adminUser } = useAuth();
  const { success, error, info } = useToast();

  const loadData = async () => {
    try {
      const [allPayments, allOrders] = await Promise.all([
        db.getPayments(),
        db.getOrders()
      ]);
      setPayments(allPayments);
      setOrders(allOrders);
    } catch (err) {
      console.error(err);
      error('Failed to load payments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    const unsubPayments = db.subscribe('payments', () => loadData());
    const unsubOrders = db.subscribe('orders', () => loadData());

    return () => {
      if (typeof unsubPayments === 'function') unsubPayments();
      if (typeof unsubOrders === 'function') unsubOrders();
    };
  }, []);

  const handleVerifyPayment = async (orderId) => {
    try {
      const adminEmail = adminUser?.email || 'admin@atelier.store';
      await db.verifyPayment(orderId, adminEmail);
      success('Payment marked as Verified! Order has been moved to Confirmed.');
      await loadData();
    } catch (err) {
      error('Failed to verify payment.');
    }
  };

  const handleOpenRejectModal = (payment) => {
    setRejectModalPayment(payment);
    setRejectionReason('Transaction reference ID was not located on bank statement.');
  };

  const handleConfirmRejection = async () => {
    if (!rejectModalPayment) return;
    if (!rejectionReason.trim()) {
      error('Please provide a reason for payment rejection.');
      return;
    }

    try {
      const adminEmail = adminUser?.email || 'admin@atelier.store';
      await db.rejectPayment(
        rejectModalPayment.order_id,
        rejectionReason.trim(),
        adminEmail
      );
      success('Payment rejected. Customer will see the rejection reason on their tracking page.');
      setRejectModalPayment(null);
      setRejectionReason('');
      await loadData();
    } catch (err) {
      error('Failed to reject payment.');
    }
  };

  // Filter payments
  const filteredPayments = payments.filter((p) => {
    const relatedOrder = orders.find((o) => o.id === p.order_id);
    const q = searchQuery.toLowerCase().trim();

    const matchesSearch =
      !q ||
      p.upi_reference_id?.toLowerCase().includes(q) ||
      relatedOrder?.order_number?.toLowerCase().includes(q) ||
      relatedOrder?.customer_name?.toLowerCase().includes(q) ||
      relatedOrder?.phone?.includes(q);

    if (!matchesSearch) return false;

    if (activeTab === 'pending') return p.payment_status === 'Pending Verification';
    if (activeTab === 'verified') return p.payment_status === 'Verified';
    if (activeTab === 'rejected') return p.payment_status === 'Rejected';
    return true; // 'all'
  });

  const pendingCount = payments.filter((p) => p.payment_status === 'Pending Verification').length;
  const verifiedCount = payments.filter((p) => p.payment_status === 'Verified').length;
  const rejectedCount = payments.filter((p) => p.payment_status === 'Rejected').length;

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-muted">
            Manual Reconciliation
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-charcoal mt-1">
            UPI Payment Verification Center
          </h1>
          <p className="text-xs text-muted mt-1">
            Manually verify 12-digit UTR/UPI references and payment screenshots against your bank receipts.
          </p>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'pending'
                ? 'bg-amber-100 text-amber-950 border border-amber-300 shadow-sm'
                : 'bg-white text-muted border border-border-light hover:border-charcoal'
            }`}
          >
            <span>Pending Verification</span>
            {pendingCount > 0 && (
              <span className="px-2 py-0.5 bg-amber-500 text-white rounded-full text-[10px] font-extrabold">
                {pendingCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('verified')}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'verified'
                ? 'bg-charcoal text-white shadow-sm'
                : 'bg-white text-muted border border-border-light hover:border-charcoal'
            }`}
          >
            <span>Verified ({verifiedCount})</span>
          </button>

          <button
            onClick={() => setActiveTab('rejected')}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'rejected'
                ? 'bg-charcoal text-white shadow-sm'
                : 'bg-white text-muted border border-border-light hover:border-charcoal'
            }`}
          >
            <span>Rejected ({rejectedCount})</span>
          </button>

          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shrink-0 ${
              activeTab === 'all'
                ? 'bg-charcoal text-white shadow-sm'
                : 'bg-white text-muted border border-border-light hover:border-charcoal'
            }`}
          >
            All Payments ({payments.length})
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search UPI Ref, Order ID, Customer..."
            className="w-full text-xs font-medium bg-white border border-border-light rounded-xl pl-10 pr-4 py-2 outline-none focus:border-charcoal shadow-soft"
          />
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-3xl border border-border-light shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border-light bg-cream-50/60 text-[11px] uppercase tracking-wider text-muted font-bold">
                <th className="p-4">Order / Customer</th>
                <th className="p-4">Payable Amount</th>
                <th className="p-4">UPI Reference (UTR)</th>
                <th className="p-4">Screenshot</th>
                <th className="p-4">Status & Time</th>
                <th className="p-4 text-right">Verification Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-muted text-xs">
                    No transactions found in this view.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((pay) => {
                  const ord = orders.find((o) => o.id === pay.order_id);
                  const isPending = pay.payment_status === 'Pending Verification';
                  const isVerified = pay.payment_status === 'Verified';

                  return (
                    <tr key={pay.id} className="hover:bg-cream-50/40 transition-colors">
                      {/* Order and Customer */}
                      <td className="p-4">
                        <span className="font-mono font-bold text-charcoal block">
                          {ord?.order_number || pay.order_id}
                        </span>
                        <span className="text-muted text-[11px] block">
                          {ord?.customer_name || 'Customer'} &bull; {ord?.phone}
                        </span>
                      </td>

                      {/* Payable Amount */}
                      <td className="p-4 font-bold text-sm text-charcoal">
                        {formatCurrency(ord?.total_amount || 0)}
                      </td>

                      {/* 12-Digit Reference */}
                      <td className="p-4">
                        {pay.upi_reference_id ? (
                          <div className="space-y-0.5">
                            <span className="font-mono font-extrabold text-xs text-charcoal bg-cream-100 px-2.5 py-1 rounded-md border border-border-light inline-block">
                              {pay.upi_reference_id}
                            </span>
                            <span className="text-[10px] text-muted block">NPCI 12-digit UTR</span>
                          </div>
                        ) : (
                          <span className="text-muted italic">Awaiting submission</span>
                        )}
                      </td>

                      {/* Screenshot Thumbnail */}
                      <td className="p-4">
                        {pay.screenshot_url ? (
                          <button
                            type="button"
                            onClick={() => setScreenshotModalUrl(pay.screenshot_url)}
                            className="group relative w-12 h-12 rounded-xl overflow-hidden border border-border-light shadow-sm"
                            title="Click to view full screenshot"
                          >
                            <img
                              src={pay.screenshot_url}
                              alt="Receipt"
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                            />
                            <div className="absolute inset-0 bg-charcoal/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                              <Eye className="w-4 h-4" />
                            </div>
                          </button>
                        ) : (
                          <span className="text-[11px] text-muted">No image uploaded</span>
                        )}
                      </td>

                      {/* Status & Timestamp */}
                      <td className="p-4 space-y-1">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            isVerified
                              ? 'bg-emerald-100 text-emerald-800'
                              : pay.payment_status === 'Rejected'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-amber-100 text-amber-900'
                          }`}
                        >
                          {isVerified && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                          {isPending && <Clock className="w-3 h-3 text-amber-600" />}
                          {pay.payment_status === 'Rejected' && <XCircle className="w-3 h-3 text-red-600" />}
                          <span>{pay.payment_status}</span>
                        </span>
                        {pay.submitted_at && (
                          <span className="text-[10px] text-muted block">
                            Sub: {formatDate(pay.submitted_at)}
                          </span>
                        )}
                        {pay.verified_at && (
                          <span className="text-[10px] text-emerald-700 block">
                            Ver: {formatDate(pay.verified_at)}
                          </span>
                        )}
                        {pay.rejection_reason && (
                          <span className="text-[10px] text-red-600 block line-clamp-1" title={pay.rejection_reason}>
                            Reason: {pay.rejection_reason}
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {!isVerified && (
                            <button
                              type="button"
                              onClick={() => handleVerifyPayment(pay.order_id)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition-colors shadow-sm"
                              title="Confirm bank receipt matches UTR"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Verify</span>
                            </button>
                          )}

                          {pay.payment_status !== 'Rejected' && (
                            <button
                              type="button"
                              onClick={() => handleOpenRejectModal(pay)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-800 rounded-lg text-xs font-semibold transition-colors"
                              title="Reject payment & specify reason"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Reject</span>
                            </button>
                          )}
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

      {/* High-Resolution Screenshot Modal */}
      {screenshotModalUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/80 backdrop-blur-sm animate-fade-in">
          <div className="relative max-w-2xl w-full bg-white rounded-3xl p-6 shadow-lift space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border-light">
              <h3 className="font-serif font-bold text-charcoal text-base">
                Customer Payment Proof Screenshot
              </h3>
              <button
                onClick={() => setScreenshotModalUrl(null)}
                className="p-1 rounded-full text-muted hover:text-charcoal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-[70vh] overflow-y-auto flex items-center justify-center bg-cream-50 rounded-2xl p-4">
              <img
                src={screenshotModalUrl}
                alt="Payment Proof"
                className="max-h-[65vh] w-auto object-contain rounded-xl shadow-sm"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setScreenshotModalUrl(null)}
                className="px-6 py-2 bg-charcoal text-white rounded-xl text-xs font-bold uppercase tracking-wider"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Payment Reason Modal */}
      {rejectModalPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/70 backdrop-blur-sm animate-fade-in">
          <div className="relative max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 shadow-lift space-y-4 border border-border-light">
            <div className="flex items-center gap-2 text-red-700 font-bold text-base">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span>Reject Payment Verification</span>
            </div>

            <p className="text-xs text-muted leading-relaxed">
              Specify the reason why this payment cannot be validated. This message will be shown directly to the customer on their order tracking page so they can submit the correct reference ID.
            </p>

            <div className="space-y-1.5 pt-2">
              <label className="text-xs font-bold uppercase tracking-wider text-charcoal block">
                Rejection Reason
              </label>
              <textarea
                rows={3}
                required
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g. UTR number 431489201948 not found in current bank records. Amount received was short of order total."
                className="w-full text-xs font-medium bg-cream-50 border border-border-light rounded-xl p-3 outline-none focus:border-charcoal"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border-light">
              <button
                type="button"
                onClick={() => setRejectModalPayment(null)}
                className="px-4 py-2 rounded-xl border border-border-light text-xs font-semibold text-charcoal hover:bg-cream-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRejection}
                className="px-5 py-2 rounded-xl bg-red-600 text-white text-xs font-bold uppercase tracking-wider hover:bg-red-700 shadow-sm"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

