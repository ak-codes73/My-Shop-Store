import React, { useState, useEffect } from 'react';
import { MessageSquare, ExternalLink, Eye, CheckCircle2, Clock, X, Phone } from 'lucide-react';
import { db } from '../services/dbBridge';
import { useToast } from '../context/ToastContext';
import { formatDate } from '../utils/formatters';

export const AdminCustomRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReq, setSelectedReq] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [statusVal, setStatusVal] = useState('In Review');

  const { success, error } = useToast();

  const loadRequests = async () => {
    try {
      const data = await db.getCustomRequests();
      setRequests(data);
    } catch (err) {
      console.error(err);
      error('Failed to load custom requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();

    const unsub = db.subscribe('custom_requests', () => loadRequests());
    return () => {
      if (typeof unsub === 'function') unsub();
    };
  }, []);

  const handleOpenModal = (req) => {
    setSelectedReq(req);
    setStatusVal(req.status || 'Submitted');
    setAdminNotes(req.admin_notes || '');
  };

  const handleSaveUpdate = async () => {
    if (!selectedReq) return;
    try {
      await db.updateCustomRequest(selectedReq.id, {
        status: statusVal,
        admin_notes: adminNotes.trim()
      });
      success('Custom request status updated.');
      setSelectedReq(null);
      await loadRequests();
    } catch (err) {
      error('Failed to update request.');
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      <div>
        <span className="text-xs uppercase font-bold tracking-widest text-muted">
          Customer Commissions
        </span>
        <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-charcoal mt-1">
          Custom Poster & Model Requests ({requests.length})
        </h1>
        <p className="text-xs text-muted mt-1">
          Review artwork concepts submitted by customers and contact them on WhatsApp with proof designs.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-border-light shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border-light bg-cream-50/60 text-[11px] uppercase tracking-wider text-muted font-bold">
                <th className="p-4">Customer</th>
                <th className="p-4">Size / Type</th>
                <th className="p-4">Concept Description</th>
                <th className="p-4">Reference Image</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {requests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-muted text-xs">
                    No custom order requests received yet.
                  </td>
                </tr>
              ) : (
                requests.map((req) => (
                  <tr key={req.id} className="hover:bg-cream-50/40 transition-colors">
                    <td className="p-4">
                      <span className="font-bold text-charcoal block">{req.customer_name}</span>
                      <span className="text-muted text-[11px] block">{req.phone}</span>
                      {req.email && <span className="text-muted text-[11px] block">{req.email}</span>}
                    </td>

                    <td className="p-4">
                      <span className="font-semibold text-charcoal block">{req.poster_size || 'Custom'}</span>
                      <span className="text-[10px] text-muted capitalize">{req.request_type}</span>
                    </td>

                    <td className="p-4 max-w-xs">
                      <p className="line-clamp-2 text-charcoal-700">{req.design_description}</p>
                    </td>

                    <td className="p-4">
                      {req.reference_image_url ? (
                        <a
                          href={req.reference_image_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-block"
                        >
                          <img
                            src={req.reference_image_url}
                            alt="Reference"
                            className="w-12 h-12 rounded-lg object-cover border border-border-light shadow-sm hover:scale-105 transition-transform"
                          />
                        </a>
                      ) : (
                        <span className="text-muted text-[11px]">No reference image</span>
                      )}
                    </td>

                    <td className="p-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          req.status === 'Approved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : req.status === 'In Review'
                            ? 'bg-blue-100 text-blue-800'
                            : req.status === 'Rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-900'
                        }`}
                      >
                        {req.status || 'Submitted'}
                      </span>
                    </td>

                    <td className="p-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleOpenModal(req)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-charcoal text-white rounded-lg text-xs font-semibold hover:bg-black transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Review</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail & Update Modal */}
      {selectedReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/70 backdrop-blur-sm animate-fade-in">
          <div className="relative max-w-xl w-full bg-white rounded-3xl p-6 sm:p-8 shadow-lift space-y-4 border border-border-light">
            <div className="flex items-center justify-between pb-3 border-b border-border-light">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-muted">
                  Commission Review
                </span>
                <h3 className="font-serif text-lg font-bold text-charcoal">
                  Request by {selectedReq.customer_name}
                </h3>
              </div>
              <button onClick={() => setSelectedReq(null)}>
                <X className="w-5 h-5 text-muted hover:text-charcoal" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-cream-50 rounded-xl space-y-1">
                <p><strong>Contact:</strong> {selectedReq.phone} ({selectedReq.email || 'No email'})</p>
                <p><strong>Poster Size:</strong> {selectedReq.poster_size}</p>
                <p><strong>Date:</strong> {formatDate(selectedReq.created_at)}</p>
              </div>

              <div>
                <strong className="block text-charcoal mb-1">Concept Description:</strong>
                <p className="p-3 bg-cream-50 rounded-xl leading-relaxed text-charcoal-700">
                  {selectedReq.design_description}
                </p>
              </div>

              {selectedReq.reference_image_url && (
                <div>
                  <strong className="block text-charcoal mb-1">Reference Artwork:</strong>
                  <img
                    src={selectedReq.reference_image_url}
                    alt="Ref"
                    className="max-h-48 rounded-xl object-contain border border-border-light"
                  />
                </div>
              )}

              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-bold uppercase tracking-wider text-charcoal block">
                  Update Status
                </label>
                <select
                  value={statusVal}
                  onChange={(e) => setStatusVal(e.target.value)}
                  className="w-full text-xs font-semibold bg-cream-50 border border-border-light rounded-xl px-3 py-2 outline-none"
                >
                  <option value="Submitted">Submitted</option>
                  <option value="In Review">In Review</option>
                  <option value="Quoted">Quoted to Customer</option>
                  <option value="Approved">Approved & In Print</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-charcoal block">
                  Admin Internal Notes
                </label>
                <textarea
                  rows={2}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="e.g. Sent mockup on WhatsApp, agreed on A3 matte at INR 899..."
                  className="w-full text-xs font-medium bg-cream-50 border border-border-light rounded-xl p-2.5 outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-border-light">
              <button
                type="button"
                onClick={() => setSelectedReq(null)}
                className="px-4 py-2 rounded-xl border border-border-light text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveUpdate}
                className="px-6 py-2 rounded-xl bg-charcoal text-white text-xs font-bold uppercase tracking-wider hover:bg-black"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

