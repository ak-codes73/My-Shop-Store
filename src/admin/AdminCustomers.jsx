import React, { useState, useEffect } from 'react';
import { Search, Users, Phone, Mail, MapPin, ShoppingBag, ArrowRight } from 'lucide-react';
import { db } from '../services/dbBridge';
import { formatCurrency, formatDate } from '../utils/formatters';

export const AdminCustomers = () => {
  const [orders, setOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await db.getOrders();
        setOrders(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();

    const unsub = db.subscribe('orders', () => fetchOrders());
    return () => {
      if (typeof unsub === 'function') unsub();
    };
  }, []);

  // Aggregate customers by unique phone number
  const customerMap = orders.reduce((acc, ord) => {
    const key = ord.phone ? ord.phone.replace(/\D/g, '') : ord.customer_name;
    if (!acc[key]) {
      acc[key] = {
        id: key,
        name: ord.customer_name,
        phone: ord.phone,
        email: ord.email || 'N/A',
        city: ord.city,
        state: ord.state,
        totalOrders: 0,
        totalSpend: 0,
        lastOrderDate: ord.created_at
      };
    }

    acc[key].totalOrders += 1;
    acc[key].totalSpend += parseFloat(ord.total_amount) || 0;
    if (new Date(ord.created_at) > new Date(acc[key].lastOrderDate)) {
      acc[key].lastOrderDate = ord.created_at;
    }

    return acc;
  }, {});

  const customers = Object.values(customerMap);

  const filteredCustomers = customers.filter((c) => {
    const q = searchQuery.toLowerCase().trim();
    return (
      !q ||
      c.name.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      c.city?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      <div>
        <span className="text-xs uppercase font-bold tracking-widest text-muted">
          Customer Database
        </span>
        <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-charcoal mt-1">
          Customer Directory ({customers.length})
        </h1>
        <p className="text-xs text-muted mt-1">
          Verified purchasers aggregated from orders and UPI payment records.
        </p>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl border border-border-light p-4 shadow-soft">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by customer name, phone, city..."
            className="w-full text-xs font-medium bg-cream-50 border border-border-light rounded-xl pl-10 pr-4 py-2.5 outline-none focus:border-charcoal"
          />
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-3xl border border-border-light shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border-light bg-cream-50/60 text-[11px] uppercase tracking-wider text-muted font-bold">
                <th className="p-4">Customer Name</th>
                <th className="p-4">Phone / Email</th>
                <th className="p-4">Location</th>
                <th className="p-4">Total Orders</th>
                <th className="p-4">Total Spend</th>
                <th className="p-4 text-right">Last Order</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-muted text-xs">
                    No customers found matching &ldquo;{searchQuery}&rdquo;.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((cust) => (
                  <tr key={cust.id} className="hover:bg-cream-50/40 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-cream-200 text-charcoal font-bold flex items-center justify-center shrink-0">
                          {cust.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-bold text-charcoal block">{cust.name}</span>
                          <span className="text-[10px] text-muted">ID: {cust.id}</span>
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <span className="font-semibold text-charcoal block">{cust.phone}</span>
                      <span className="text-muted text-[11px] block">{cust.email}</span>
                    </td>

                    <td className="p-4 text-charcoal">
                      {cust.city ? `${cust.city}, ${cust.state || ''}` : 'N/A'}
                    </td>

                    <td className="p-4">
                      <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-bold bg-cream-100 text-charcoal">
                        {cust.totalOrders} {cust.totalOrders === 1 ? 'order' : 'orders'}
                      </span>
                    </td>

                    <td className="p-4 font-bold text-charcoal">
                      {formatCurrency(cust.totalSpend)}
                    </td>

                    <td className="p-4 text-right text-muted">
                      {formatDate(cust.lastOrderDate)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

