import React, { useState, useEffect } from 'react';
import { 
  Search, Eye, Clock, CheckCircle2, XCircle, Truck, Package, 
  MapPin, Phone, Mail, AlertTriangle, X, ChevronRight, ExternalLink 
} from 'lucide-react';
import { db } from '../services/dbBridge';
import { useToast } from '../context/ToastContext';
import { formatCurrency, formatDate } from '../utils/formatters';

export const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [newStatusValue, setNewStatusValue] = useState('');

  const { success, error, info } = useToast();

  const fetchOrdersAndPayments = async () => {
    try {
      const [ordList, payList] = await Promise.all([
        db.getOrders(),
        db.getPayments()
      ]);
      setOrders(ordList);
      setPayments(payList);
    } catch (err) {
      console.error(err);
      error('Failed to load orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrdersAndPayments();

    const unsubOrders = db.subscribe('orders', () => fetchOrdersAndPayments());
    const unsubPayments = db.subscribe('payments', () => fetchOrdersAndPayments());

    return () => {
      if (typeof unsubOrders === 'function') unsubOrders();
      if (typeof unsubPayments === 'function') unsubPayments();
    };
  }, []);

  const handleOpenDetail = (order) => {
    setSelectedOrder(order);
    const relatedPay = payments.find((p) => p.order_id === order.id) || null;
    setSelectedPayment(relatedPay);
    setNewStatusValue(order.order_status);
    setStatusModalOpen(true);
  };

  const handleUpdateStatus = async () => {
    if (!selectedOrder || !newStatusValue) return;

    // Security warning check: do not confirm shipment if payment is not verified
    if (
      (newStatusValue === 'Confirmed' || newStatusValue === 'Shipped' || newStatusValue === 'Delivered') &&
      selectedPayment?.payment_status !== 'Verified'
    ) {
      const proceed = window.confirm(
        `WARNING: The payment for Order ${selectedOrder.order_number} is currently "${selectedPayment?.payment_status || 'Unverified'}". Are you sure you want to mark this order as ${newStatusValue}?`
      );
      if (!proceed) return;
    }

    try {
      await db.updateOrderStatus(selectedOrder.id, newStatusValue);
      success(`Order status updated to "${newStatusValue}"`);
      setSelectedOrder((prev) => ({ ...prev, order_status: newStatusValue }));
      await fetchOrdersAndPayments();
    } catch (err) {
      error('Failed to update order status');
    }
  };

  // Filtered orders
  const filteredOrders = orders.filter((o) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      o.order_number?.toLowerCase().includes(q) ||
      o.customer_name?.toLowerCase().includes(q) ||
      o.phone?.includes(q) ||
      o.city?.toLowerCase().includes(q);

    const matchesStatus = !statusFilter || o.order_status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-muted">
            Fulfillment & Tracking
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-charcoal mt-1">
            Order Management ({orders.length})
          </h1>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl border border-border-light p-4 shadow-soft flex flex-col sm:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Order ID, Customer Name, Phone Number, City..."
            className="w-full text-xs font-medium bg-cream-50 border border-border-light rounded-xl pl-10 pr-4 py-2.5 outline-none focus:border-charcoal"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full sm:w-auto text-xs font-semibold bg-cream-50 border border-border-light rounded-xl px-3 py-2.5 outline-none text-charcoal"
        >
          <option value="">All Order Statuses</option>
          <option value="Pending">Pending</option>
          <option value="Payment Verification">Payment Verification</option>
          <option value="Confirmed">Confirmed</option>
          <option value="Shipped">Shipped</option>
          <option value="Delivered">Delivered</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-border-light shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border-light bg-cream-50/60 text-[11px] uppercase tracking-wider text-muted font-bold">
                <th className="p-4">Order Details</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Items / Total</th>
                <th className="p-4">Payment Status</th>
                <th className="p-4">Order Status</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-muted text-xs">
                    No orders match your search parameters.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => {
                  const relatedPay = payments.find((p) => p.order_id === ord.id);
                  const payStatus = relatedPay?.payment_status || 'Awaiting Payment';

                  return (
                    <tr key={ord.id} className="hover:bg-cream-50/40 transition-colors">
                      <td className="p-4">
                        <span className="font-mono font-bold text-charcoal block">
                          {ord.order_number}
                        </span>
                        <span className="text-[11px] text-muted">{formatDate(ord.created_at)}</span>
                      </td>

                      <td className="p-4">
                        <span className="font-semibold text-charcoal block">{ord.customer_name}</span>
                        <span className="text-[11px] text-muted">{ord.phone} &bull; {ord.city}</span>
                      </td>

                      <td className="p-4">
                        <span className="font-bold text-charcoal block">
                          {formatCurrency(ord.total_amount)}
                        </span>
                        <span className="text-[11px] text-muted">
                          {ord.items?.length || 0} product(s)
                        </span>
                      </td>

                      {/* Payment Status */}
                      <td className="p-4">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            payStatus === 'Verified'
                              ? 'bg-emerald-100 text-emerald-800'
                              : payStatus === 'Rejected'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-amber-100 text-amber-900'
                          }`}
                        >
                          {payStatus}
                        </span>
                      </td>

                      {/* Order Status */}
                      <td className="p-4">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            ord.order_status === 'Confirmed' || ord.order_status === 'Delivered'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                              : ord.order_status === 'Shipped'
                              ? 'bg-blue-50 text-blue-800 border border-blue-300'
                              : ord.order_status === 'Cancelled'
                              ? 'bg-red-50 text-red-800 border border-red-300'
                              : 'bg-cream-200 text-charcoal border border-charcoal/20'
                          }`}
                        >
                          {ord.order_status}
                        </span>
                      </td>

                      <td className="p-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleOpenDetail(ord)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-charcoal text-white rounded-lg text-xs font-semibold hover:bg-black transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Inspect</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail & Status Management Modal */}
      {statusModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/70 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-lift overflow-hidden border border-border-light flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="p-6 border-b border-border-light flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-muted">
                  Order Inspection
                </span>
                <h3 className="font-mono text-xl font-bold text-charcoal">
                  {selectedOrder.order_number}
                </h3>
              </div>
              <button
                onClick={() => setStatusModalOpen(false)}
                className="p-1 rounded-full text-muted hover:text-charcoal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
              {/* Order Status Update Section */}
              <div className="p-5 bg-cream-50 rounded-2xl border border-border-light space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-charcoal">
                    Update Order Progression
                  </span>
                  <span className="text-xs text-muted">
                    Current: <strong>{selectedOrder.order_status}</strong>
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <select
                    value={newStatusValue}
                    onChange={(e) => setNewStatusValue(e.target.value)}
                    className="flex-1 w-full text-xs font-bold bg-white border border-border-light rounded-xl px-4 py-2.5 outline-none text-charcoal"
                  >
                    <option value="Pending">1. Pending</option>
                    <option value="Payment Verification">2. Payment Verification</option>
                    <option value="Confirmed">3. Confirmed & Packed</option>
                    <option value="Shipped">4. Shipped (In Transit)</option>
                    <option value="Delivered">5. Delivered</option>
                    <option value="Cancelled">6. Cancelled</option>
                  </select>

                  <button
                    type="button"
                    onClick={handleUpdateStatus}
                    className="w-full sm:w-auto px-6 py-2.5 bg-charcoal text-white rounded-xl text-xs uppercase font-bold tracking-wider hover:bg-black transition-colors shrink-0"
                  >
                    Save Status
                  </button>
                </div>
              </div>

              {/* Customer & Shipping Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
                <div className="space-y-2 p-4 bg-cream-50/50 rounded-2xl border border-border-light">
                  <h4 className="font-bold uppercase tracking-wider text-charcoal flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-accent" /> Customer Delivery Address
                  </h4>
                  <div className="text-charcoal-700 space-y-1">
                    <p className="font-bold text-charcoal">{selectedOrder.customer_name}</p>
                    <p>{selectedOrder.address}</p>
                    <p>{selectedOrder.city}, {selectedOrder.state} - {selectedOrder.pincode}</p>
                    <p className="text-muted pt-1">Phone: {selectedOrder.phone}</p>
                    {selectedOrder.email && <p className="text-muted">Email: {selectedOrder.email}</p>}
                  </div>
                </div>

                {/* Payment Verification Information */}
                <div className="space-y-2 p-4 bg-cream-50/50 rounded-2xl border border-border-light">
                  <h4 className="font-bold uppercase tracking-wider text-charcoal flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-accent" /> UPI Payment Record
                  </h4>
                  <div className="text-charcoal-700 space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-muted">Status:</span>
                      <span className="font-bold text-charcoal">{selectedPayment?.payment_status || 'Awaiting Payment'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted">UPI / UTR Ref:</span>
                      <span className="font-mono font-bold text-charcoal">
                        {selectedPayment?.upi_reference_id || 'Not submitted yet'}
                      </span>
                    </div>
                    {selectedPayment?.submitted_at && (
                      <div className="flex justify-between">
                        <span className="text-muted">Submitted At:</span>
                        <span>{formatDate(selectedPayment.submitted_at)}</span>
                      </div>
                    )}
                    {selectedPayment?.screenshot_url && (
                      <div className="pt-2">
                        <a
                          href={selectedPayment.screenshot_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-bold text-accent-dark hover:underline"
                        >
                          <span>View Payment Receipt Screenshot</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Items Purchased List */}
              <div className="space-y-3">
                <h4 className="font-serif text-sm font-bold text-charcoal">
                  Items Purchased ({selectedOrder.items?.length || 0})
                </h4>
                <div className="border border-border-light rounded-2xl divide-y divide-border-light overflow-hidden">
                  {selectedOrder.items?.map((it, idx) => (
                    <div key={idx} className="p-3.5 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        {it.image && (
                          <img
                            src={it.image}
                            alt={it.name}
                            className="w-10 h-10 object-cover rounded-lg bg-cream"
                          />
                        )}
                        <div>
                          <span className="font-semibold text-charcoal block">{it.name}</span>
                          <span className="text-[11px] text-muted">
                            {it.variant ? `Variant: ${it.variant} &bull; ` : ''}Qty: {it.quantity} &bull; {formatCurrency(it.price)} each
                          </span>
                        </div>
                      </div>
                      <span className="font-bold text-charcoal">
                        {formatCurrency(it.price * it.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="p-4 bg-cream-50 rounded-2xl border border-border-light space-y-1.5 text-xs">
                <div className="flex justify-between text-muted">
                  <span>Subtotal:</span>
                  <span className="font-semibold text-charcoal">{formatCurrency(selectedOrder.subtotal)}</span>
                </div>
                <div className="flex justify-between text-muted">
                  <span>Delivery Charges:</span>
                  <span className="font-semibold text-charcoal">{formatCurrency(selectedOrder.delivery_charge)}</span>
                </div>
                <div className="pt-2 border-t border-border-light flex justify-between font-bold text-sm text-charcoal">
                  <span>Total Amount Paid / Payable:</span>
                  <span>{formatCurrency(selectedOrder.total_amount)}</span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-6 border-t border-border-light bg-cream-50/50 flex justify-end">
              <button
                type="button"
                onClick={() => setStatusModalOpen(false)}
                className="px-6 py-2.5 bg-charcoal text-white rounded-xl text-xs uppercase font-bold tracking-wider hover:bg-black transition-colors"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

