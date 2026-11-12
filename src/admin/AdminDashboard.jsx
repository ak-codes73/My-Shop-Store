import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  IndianRupee, ShoppingCart, Clock, CheckCircle2, Package, 
  AlertTriangle, CreditCard, ArrowRight, TrendingUp, Users 
} from 'lucide-react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, 
  PieChart, Pie, Cell, AreaChart, Area 
} from 'recharts';
import { db } from '../services/dbBridge';
import { formatCurrency, formatDate } from '../utils/formatters';

export const AdminDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = async () => {
    try {
      const [allOrders, allProducts, allPayments] = await Promise.all([
        db.getOrders(),
        db.getProducts(),
        db.getPayments()
      ]);
      setOrders(allOrders);
      setProducts(allProducts);
      setPayments(allPayments);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();

    // Realtime listeners
    const unsubOrders = db.subscribe('orders', () => loadDashboardData());
    const unsubProducts = db.subscribe('products', () => loadDashboardData());
    const unsubPayments = db.subscribe('payments', () => loadDashboardData());

    return () => {
      if (typeof unsubOrders === 'function') unsubOrders();
      if (typeof unsubProducts === 'function') unsubProducts();
      if (typeof unsubPayments === 'function') unsubPayments();
    };
  }, []);

  // Compute Metrics
  const totalRevenue = orders
    .filter((o) => o.order_status !== 'Cancelled')
    .reduce((sum, o) => sum + (parseFloat(o.total_amount) || 0), 0);

  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.order_status === 'Pending' || o.order_status === 'Payment Verification').length;
  const confirmedOrders = orders.filter((o) => o.order_status === 'Confirmed' || o.order_status === 'Shipped' || o.order_status === 'Delivered').length;
  const totalProducts = products.length;
  const lowStockProducts = products.filter((p) => p.stock > 0 && p.stock <= 10).length;
  const pendingPayments = payments.filter((p) => p.payment_status === 'Pending Verification').length;

  // Category distribution data for charts
  const posterCount = products.filter((p) => p.category === 'posters').length;
  const diecastCount = products.filter((p) => p.category === 'diecast').length;

  const categoryChartData = [
    { name: 'Posters & Art', value: posterCount, color: '#C99738' },
    { name: 'Die-Cast Cars', value: diecastCount, color: '#171717' }
  ];

  // Orders status distribution data
  const statusCounts = orders.reduce((acc, o) => {
    acc[o.order_status] = (acc[o.order_status] || 0) + 1;
    return acc;
  }, {});

  const orderStatusChartData = Object.entries(statusCounts).map(([status, count]) => ({
    status,
    count
  }));

  const recentOrders = orders.slice(0, 5);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Welcome Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-muted">
            Live Store Analytics
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-charcoal mt-1">
            Executive Operations Overview
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/products/new"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-charcoal text-white rounded-xl text-xs uppercase font-bold tracking-wider hover:bg-black transition-colors shadow-sm"
          >
            <span>+ Add New Product</span>
          </Link>
        </div>
      </div>

      {/* 7 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Revenue */}
        <div className="bg-white p-6 rounded-2xl border border-border-light shadow-soft space-y-2">
          <div className="flex items-center justify-between text-muted">
            <span className="text-xs font-bold uppercase tracking-wider">Total Revenue</span>
            <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-charcoal">
            {formatCurrency(totalRevenue)}
          </div>
          <span className="text-[11px] text-muted flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
            <span>Across {totalOrders} recorded orders</span>
          </span>
        </div>

        {/* Total Orders */}
        <div className="bg-white p-6 rounded-2xl border border-border-light shadow-soft space-y-2">
          <div className="flex items-center justify-between text-muted">
            <span className="text-xs font-bold uppercase tracking-wider">Total Orders</span>
            <div className="p-2 bg-cream-100 text-charcoal rounded-xl">
              <ShoppingCart className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-charcoal">{totalOrders}</div>
          <span className="text-[11px] text-muted">
            {confirmedOrders} fulfilled / confirmed
          </span>
        </div>

        {/* Pending Payment Verifications (Alert!) */}
        <Link
          to="/admin/payments"
          className="bg-white p-6 rounded-2xl border border-amber-300 shadow-soft space-y-2 hover:border-amber-500 transition-all block group"
        >
          <div className="flex items-center justify-between text-muted">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-900">
              Pending UPI Checks
            </span>
            <div className="p-2 bg-amber-100 text-amber-800 rounded-xl group-hover:scale-110 transition-transform">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-amber-900">{pendingPayments}</div>
          <span className="text-[11px] text-amber-700 font-semibold flex items-center gap-1">
            <span>Requires manual verification</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </span>
        </Link>

        {/* Low Stock Alert */}
        <Link
          to="/admin/products"
          className="bg-white p-6 rounded-2xl border border-border-light shadow-soft space-y-2 hover:border-charcoal transition-all block group"
        >
          <div className="flex items-center justify-between text-muted">
            <span className="text-xs font-bold uppercase tracking-wider">Low Stock Items</span>
            <div className="p-2 bg-rose-50 text-rose-700 rounded-xl">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-charcoal">{lowStockProducts}</div>
          <span className="text-[11px] text-muted">Products &le; 10 units in stock</span>
        </Link>
      </div>

      {/* Visual Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Order Status Distribution (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-border-light p-6 sm:p-8 shadow-soft space-y-6">
          <div className="flex items-center justify-between border-b border-border-light pb-4">
            <div>
              <h3 className="font-serif text-lg font-bold text-charcoal">
                Orders by Workflow Status
              </h3>
              <p className="text-xs text-muted">Real-time pipeline progression</p>
            </div>
            <span className="text-xs font-bold text-accent uppercase tracking-wider">
              {totalOrders} Total Orders
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={orderStatusChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="status" tick={{ fontSize: 11, fill: '#777' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#777' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#171717', color: '#fff', borderRadius: '12px', border: 'none', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="#171717" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Product Category Mix (1 col) */}
        <div className="bg-white rounded-3xl border border-border-light p-6 sm:p-8 shadow-soft space-y-6 flex flex-col justify-between">
          <div className="border-b border-border-light pb-4">
            <h3 className="font-serif text-lg font-bold text-charcoal">
              Inventory Distribution
            </h3>
            <p className="text-xs text-muted">Catalog split between posters and models</p>
          </div>

          <div className="h-48 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#171717', color: '#fff', borderRadius: '12px', border: 'none', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 pt-2 border-t border-border-light text-xs">
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-accent" />
                <span>Posters & Wall Art</span>
              </span>
              <span className="font-bold text-charcoal">{posterCount}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-charcoal" />
                <span>Die-Cast Scale Cars</span>
              </span>
              <span className="font-bold text-charcoal">{diecastCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-3xl border border-border-light p-6 sm:p-8 shadow-soft space-y-6">
        <div className="flex items-center justify-between border-b border-border-light pb-4">
          <div>
            <h3 className="font-serif text-lg font-bold text-charcoal">Recent Customer Orders</h3>
            <p className="text-xs text-muted">Latest submissions requiring fulfillment</p>
          </div>
          <Link
            to="/admin/orders"
            className="text-xs font-bold uppercase tracking-wider text-charcoal hover:underline flex items-center gap-1"
          >
            <span>View All Orders</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border-light text-[11px] uppercase tracking-wider text-muted font-bold">
                <th className="pb-3">Order Number</th>
                <th className="pb-3">Customer</th>
                <th className="pb-3">Date</th>
                <th className="pb-3">Amount</th>
                <th className="pb-3">Order Status</th>
                <th className="pb-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {recentOrders.map((ord) => (
                <tr key={ord.id} className="hover:bg-cream-50 transition-colors">
                  <td className="py-3.5 font-mono font-bold text-charcoal">
                    {ord.order_number}
                  </td>
                  <td className="py-3.5">
                    <span className="font-semibold text-charcoal block">{ord.customer_name}</span>
                    <span className="text-[11px] text-muted">{ord.phone}</span>
                  </td>
                  <td className="py-3.5 text-muted">{formatDate(ord.created_at)}</td>
                  <td className="py-3.5 font-bold text-charcoal">
                    {formatCurrency(ord.total_amount)}
                  </td>
                  <td className="py-3.5">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        ord.order_status === 'Confirmed' || ord.order_status === 'Delivered'
                          ? 'bg-emerald-100 text-emerald-800'
                          : ord.order_status === 'Payment Verification'
                          ? 'bg-amber-100 text-amber-900'
                          : ord.order_status === 'Cancelled'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-cream-200 text-charcoal'
                      }`}
                    >
                      {ord.order_status}
                    </span>
                  </td>
                  <td className="py-3.5 text-right">
                    <Link
                      to="/admin/orders"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-charcoal hover:underline"
                    >
                      <span>Manage</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

