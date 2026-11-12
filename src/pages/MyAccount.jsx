import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  User, MapPin, Package, LogOut, Save, Loader2, 
  ExternalLink, Clock, CheckCircle2, AlertCircle, ShoppingBag, ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { db } from '../services/dbBridge';
import { formatCurrency, formatDate } from '../utils/formatters';

export const MyAccount = () => {
  const navigate = useNavigate();
  const { 
    user, 
    profile, 
    isCustomerAuthenticated, 
    loadingCustomer, 
    customerLogout, 
    updateCustomerProfile 
  } = useAuth();
  const { success, error: toastError } = useToast();

  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'address' | 'orders'
  
  // Profile form state
  const [profileForm, setProfileForm] = useState({
    name: '',
    phone: ''
  });
  const [savingProfile, setSavingProfile] = useState(false);

  // Address form state
  const [addressForm, setAddressForm] = useState({
    address: '',
    city: '',
    state: '',
    pincode: ''
  });
  const [savingAddress, setSavingAddress] = useState(false);

  // Orders state
  const [orders, setOrders] = useState([]);
  const [orderPayments, setOrderPayments] = useState({});
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Redirect if not authenticated once auth loading finishes
  useEffect(() => {
    if (!loadingCustomer && !isCustomerAuthenticated) {
      navigate('/login', { replace: true, state: { from: { pathname: '/account' } } });
    }
  }, [loadingCustomer, isCustomerAuthenticated, navigate]);

  // Sync profile data into forms
  useEffect(() => {
    if (profile) {
      setProfileForm({
        name: profile.name || '',
        phone: profile.phone || ''
      });
      setAddressForm({
        address: profile.address || '',
        city: profile.city || '',
        state: profile.state || '',
        pincode: profile.pincode || ''
      });
    }
  }, [profile]);

  // Load customer orders
  useEffect(() => {
    const fetchUserOrders = async () => {
      if (!user?.id) return;
      setLoadingOrders(true);
      try {
        const userOrders = await db.getOrdersByUserId(user.id);
        setOrders(userOrders || []);

        // Fetch corresponding payment records
        const paymentMap = {};
        await Promise.all(
          (userOrders || []).map(async (ord) => {
            try {
              const p = await db.getPaymentByOrderId(ord.id);
              if (p) paymentMap[ord.id] = p;
            } catch (e) {}
          })
        );
        setOrderPayments(paymentMap);
      } catch (err) {
        console.error('Failed to load user orders:', err);
      } finally {
        setLoadingOrders(false);
      }
    };

    if (user?.id) {
      fetchUserOrders();
    }
  }, [user?.id]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await updateCustomerProfile({
        name: profileForm.name.trim(),
        phone: profileForm.phone.trim()
      });
      success('Profile details updated successfully');
    } catch (err) {
      toastError(err.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    setSavingAddress(true);
    try {
      await updateCustomerProfile({
        address: addressForm.address.trim(),
        city: addressForm.city.trim(),
        state: addressForm.state.trim(),
        pincode: addressForm.pincode.trim()
      });
      success('Default delivery address saved');
    } catch (err) {
      toastError(err.message || 'Failed to save address');
    } finally {
      setSavingAddress(false);
    }
  };

  const handleLogout = async () => {
    try {
      await customerLogout();
      success('Signed out successfully');
      navigate('/', { replace: true });
    } catch (err) {
      toastError('Failed to sign out');
    }
  };

  if (loadingCustomer || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-charcoal" />
          <p className="text-xs uppercase font-bold tracking-widest text-muted">Loading your account…</p>
        </div>
      </div>
    );
  }

  // Helper badge formatters
  const getOrderStatusBadge = (status) => {
    const s = (status || '').toLowerCase();
    if (s.includes('delivered')) {
      return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">Delivered</span>;
    }
    if (s.includes('shipped')) {
      return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-indigo-100 text-indigo-800">Shipped</span>;
    }
    if (s.includes('confirmed')) {
      return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Confirmed</span>;
    }
    if (s.includes('verification')) {
      return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-sky-100 text-sky-800">Payment Verification</span>;
    }
    if (s.includes('cancel')) {
      return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-100 text-red-800">Cancelled</span>;
    }
    return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">Pending</span>;
  };

  const getPaymentStatusBadge = (status) => {
    const s = (status || '').toLowerCase();
    if (s.includes('verified')) {
      return <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 flex items-center gap-1"><CheckCircle2 size={12} /> Paid / Verified</span>;
    }
    if (s.includes('pending')) {
      return <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800 flex items-center gap-1"><Clock size={12} /> Pending Verification</span>;
    }
    if (s.includes('reject')) {
      return <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-red-100 text-red-800 flex items-center gap-1"><AlertCircle size={12} /> Payment Rejected</span>;
    }
    return <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-charcoal-100 text-charcoal-700 flex items-center gap-1"><Clock size={12} /> Awaiting Payment</span>;
  };

  return (
    <div className="min-h-screen bg-cream py-10 sm:py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header banner */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-border-light mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-charcoal text-white flex items-center justify-center font-serif text-2xl font-bold shadow-sm">
              {(profile?.name?.[0] || user.email?.[0] || 'A').toUpperCase()}
            </div>
            <div>
              <h1 className="font-serif text-xl sm:text-2xl font-bold text-charcoal">
                {profile?.name || 'My Account'}
              </h1>
              <p className="text-xs text-muted font-medium">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border-light text-xs font-semibold uppercase tracking-wider text-charcoal hover:bg-black/5 transition-colors"
            >
              <LogOut size={14} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-charcoal/10 mb-8 overflow-x-auto">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 pb-3.5 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'profile'
                ? 'border-charcoal text-charcoal'
                : 'border-transparent text-muted hover:text-charcoal'
            }`}
          >
            <User size={15} />
            <span>Profile Details</span>
          </button>

          <button
            onClick={() => setActiveTab('address')}
            className={`flex items-center gap-2 pb-3.5 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'address'
                ? 'border-charcoal text-charcoal'
                : 'border-transparent text-muted hover:text-charcoal'
            }`}
          >
            <MapPin size={15} />
            <span>Saved Delivery Address</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 pb-3.5 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'orders'
                ? 'border-charcoal text-charcoal'
                : 'border-transparent text-muted hover:text-charcoal'
            }`}
          >
            <Package size={15} />
            <span>Order History</span>
            {orders.length > 0 && (
              <span className="w-5 h-5 rounded-full bg-charcoal text-white text-[10px] flex items-center justify-center font-bold">
                {orders.length}
              </span>
            )}
          </button>
        </div>

        {/* TAB 1: Profile Details */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-border-light max-w-2xl">
            <h2 className="font-serif text-lg font-bold text-charcoal mb-1">Personal Details</h2>
            <p className="text-xs text-muted mb-6">Manage your contact information used for orders and order updates.</p>

            <form onSubmit={handleSaveProfile} className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={profileForm.name}
                  onChange={(e) => setProfileForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="Enter your full name"
                  className="w-full px-4 py-3 rounded-xl border border-charcoal/20 text-sm outline-none focus:border-charcoal focus:ring-2 focus:ring-charcoal/10 transition-all bg-[#FAFAF8]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  disabled
                  value={user.email || ''}
                  className="w-full px-4 py-3 rounded-xl border border-charcoal/10 text-sm bg-black/5 text-muted cursor-not-allowed outline-none"
                />
                <span className="text-[11px] text-muted mt-1 block">Email address cannot be changed directly.</span>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1.5">
                  Contact Phone Number
                </label>
                <input
                  type="tel"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm((p) => ({ ...p, phone: e.target.value }))}
                  placeholder="+91 98765 43210"
                  className="w-full px-4 py-3 rounded-xl border border-charcoal/20 text-sm outline-none focus:border-charcoal focus:ring-2 focus:ring-charcoal/10 transition-all bg-[#FAFAF8]"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-charcoal text-white text-xs font-bold uppercase tracking-wider hover:bg-black transition-colors disabled:opacity-70"
                >
                  {savingProfile ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Saving…</span>
                    </>
                  ) : (
                    <>
                      <Save size={14} />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 2: Saved Address */}
        {activeTab === 'address' && (
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-border-light max-w-2xl">
            <h2 className="font-serif text-lg font-bold text-charcoal mb-1">Saved Delivery Address</h2>
            <p className="text-xs text-muted mb-6">This address will automatically pre-fill during checkout for faster ordering.</p>

            <form onSubmit={handleSaveAddress} className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1.5">
                  Complete Street Address
                </label>
                <textarea
                  rows={3}
                  required
                  value={addressForm.address}
                  onChange={(e) => setAddressForm((a) => ({ ...a, address: e.target.value }))}
                  placeholder="Flat / House No., Building Name, Street, Landmark"
                  className="w-full px-4 py-3 rounded-xl border border-charcoal/20 text-sm outline-none focus:border-charcoal focus:ring-2 focus:ring-charcoal/10 transition-all bg-[#FAFAF8]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1.5">
                    City
                  </label>
                  <input
                    type="text"
                    required
                    value={addressForm.city}
                    onChange={(e) => setAddressForm((a) => ({ ...a, city: e.target.value }))}
                    placeholder="Bengaluru"
                    className="w-full px-4 py-3 rounded-xl border border-charcoal/20 text-sm outline-none focus:border-charcoal focus:ring-2 focus:ring-charcoal/10 transition-all bg-[#FAFAF8]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1.5">
                    State
                  </label>
                  <input
                    type="text"
                    required
                    value={addressForm.state}
                    onChange={(e) => setAddressForm((a) => ({ ...a, state: e.target.value }))}
                    placeholder="Karnataka"
                    className="w-full px-4 py-3 rounded-xl border border-charcoal/20 text-sm outline-none focus:border-charcoal focus:ring-2 focus:ring-charcoal/10 transition-all bg-[#FAFAF8]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1.5">
                    PIN Code
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={addressForm.pincode}
                    onChange={(e) => setAddressForm((a) => ({ ...a, pincode: e.target.value.replace(/\D/g, '') }))}
                    placeholder="560038"
                    className="w-full px-4 py-3 rounded-xl border border-charcoal/20 text-sm outline-none focus:border-charcoal focus:ring-2 focus:ring-charcoal/10 transition-all bg-[#FAFAF8]"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={savingAddress}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-charcoal text-white text-xs font-bold uppercase tracking-wider hover:bg-black transition-colors disabled:opacity-70"
                >
                  {savingAddress ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Saving Address…</span>
                    </>
                  ) : (
                    <>
                      <Save size={14} />
                      <span>Save Address</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 3: Orders History */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {loadingOrders ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-border-light">
                <Loader2 className="w-6 h-6 animate-spin mx-auto text-charcoal mb-2" />
                <p className="text-xs text-muted">Retrieving your order history…</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-border-light space-y-4">
                <ShoppingBag className="w-12 h-12 text-muted mx-auto stroke-[1.5]" />
                <div>
                  <h3 className="font-serif text-lg font-bold text-charcoal">No orders yet</h3>
                  <p className="text-xs text-muted mt-1">When you place an order, its details and payment verification will appear here.</p>
                </div>
                <Link
                  to="/shop"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-charcoal text-white text-xs font-bold uppercase tracking-wider hover:bg-black transition-colors"
                >
                  <span>Explore Catalog</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            ) : (
              orders.map((ord) => {
                const payment = orderPayments[ord.id];
                return (
                  <div
                    key={ord.id}
                    className="bg-white rounded-2xl p-6 shadow-sm border border-border-light hover:border-charcoal/20 transition-all"
                  >
                    {/* Order summary bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-border-light gap-3">
                      <div>
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-sm font-bold text-charcoal">
                            {ord.order_number}
                          </span>
                          {getOrderStatusBadge(ord.order_status)}
                        </div>
                        <span className="text-[11px] text-muted block mt-1">
                          Placed on {formatDate(ord.created_at)}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        {getPaymentStatusBadge(payment?.payment_status || 'Awaiting Payment')}
                        <span className="font-bold text-sm text-charcoal">
                          {formatCurrency(ord.total_amount)}
                        </span>
                      </div>
                    </div>

                    {/* Items preview */}
                    <div className="py-4 space-y-3">
                      {Array.isArray(ord.items) && ord.items.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between gap-4 text-xs">
                          <div className="flex items-center gap-3 min-w-0">
                            {item.image && (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-12 h-12 rounded-lg object-cover bg-cream border border-border-light shrink-0"
                              />
                            )}
                            <div className="truncate">
                              <p className="font-semibold text-charcoal truncate">{item.name}</p>
                              <p className="text-[11px] text-muted">
                                {item.variant ? `Variant: ${item.variant} • ` : ''}Qty: {item.quantity}
                              </p>
                            </div>
                          </div>
                          <span className="font-medium text-charcoal shrink-0">
                            {formatCurrency(item.price * item.quantity)}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Bottom actions */}
                    <div className="pt-4 border-t border-border-light flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div className="text-muted">
                        Deliver to: <span className="font-medium text-charcoal">{ord.address}, {ord.city} ({ord.pincode})</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {(!payment?.payment_status || payment?.payment_status === 'Awaiting Payment') && (
                          <Link
                            to={`/payment/${ord.id}`}
                            className="px-3.5 py-1.5 rounded-lg bg-amber-600 text-white font-semibold text-[11px] hover:bg-amber-700 transition-colors"
                          >
                            Complete Payment
                          </Link>
                        )}
                        <Link
                          to={`/track-order?order=${ord.order_number}&phone=${ord.phone}`}
                          className="px-3.5 py-1.5 rounded-lg border border-border-light hover:border-charcoal text-charcoal font-semibold text-[11px] flex items-center gap-1.5 transition-colors"
                        >
                          <ExternalLink size={12} />
                          <span>Track Order</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

      </div>
    </div>
  );
};

