'use client';
import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Tag, Plus, Trash2, X } from 'lucide-react';
import { adminApi } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function AdminCouponsPage() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    code: '', type: 'percentage', value: '', min_order_value: '',
    usage_limit: '', expires_at: '',
  });

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'coupons'],
    queryFn: () => adminApi.getCoupons({ limit: 100 }).then((r) => r.data),
  });

  const coupons = data?.data ?? [];

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code || !form.value || !form.expires_at) {
      toast.error('Code, discount value and expiry date are required');
      return;
    }
    setSubmitting(true);
    try {
      await adminApi.createCoupon({
        code: form.code.toUpperCase().replace(/\s/g, ''),
        type: form.type,
        value: parseFloat(form.value),
        min_order_value: form.min_order_value ? parseFloat(form.min_order_value) : 0,
        usage_limit: form.usage_limit ? parseInt(form.usage_limit) : undefined,
        expires_at: new Date(form.expires_at).toISOString(),
        is_active: true,
      });
      qc.invalidateQueries({ queryKey: ['admin', 'coupons'] });
      toast.success('Coupon created');
      setShowForm(false);
      setForm({ code: '', type: 'percentage', value: '', min_order_value: '', usage_limit: '', expires_at: '' });
    } catch (err: any) {
      const msg = err?.response?.data?.detail ?? err?.response?.data?.errors?.[0]?.message ?? 'Failed to create coupon';
      toast.error(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setSubmitting(false);
    }
  };

  const deleteCoupon = async (id: number) => {
    if (!confirm('Delete this coupon?')) return;
    try {
      await adminApi.deleteCoupon(id);
      qc.invalidateQueries({ queryKey: ['admin', 'coupons'] });
      toast.success('Coupon deleted');
    } catch (err: any) {
      toast.error(err?.response?.data?.detail ?? 'Failed to delete');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black text-[#1A1A2E]">Coupons</h1>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-[#1B8C4E] text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-[#146B3A] transition-colors">
          <Plus className="h-4 w-4" /> New Coupon
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-[#1A1A2E]">Create Coupon</h2>
            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
          </div>
          <form onSubmit={create} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Coupon Code *</label>
              <input value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
                placeholder="SAVE20" style={{ textTransform: 'uppercase' }}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B8C4E]" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Discount Type</label>
              <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B8C4E]">
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (SLE)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Discount Value * {form.type === 'percentage' ? '(e.g. 20 = 20%)' : '(SLE amount)'}
              </label>
              <input type="number" min="0" step="0.01" value={form.value} onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
                placeholder={form.type === 'percentage' ? '20' : '5000'}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B8C4E]" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Minimum Order Amount (SLE)</label>
              <input type="number" min="0" step="0.01" value={form.min_order_value} onChange={(e) => setForm((f) => ({ ...f, min_order_value: e.target.value }))}
                placeholder="0 = no minimum"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B8C4E]" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Max Uses (total)</label>
              <input type="number" min="1" value={form.usage_limit} onChange={(e) => setForm((f) => ({ ...f, usage_limit: e.target.value }))}
                placeholder="Leave blank = unlimited"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B8C4E]" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Expires At *</label>
              <input type="datetime-local" value={form.expires_at} onChange={(e) => setForm((f) => ({ ...f, expires_at: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B8C4E]" />
            </div>
            <div className="sm:col-span-2">
              <button type="submit" disabled={submitting}
                className="w-full bg-[#1B8C4E] text-white py-3 rounded-xl font-bold text-sm hover:bg-[#146B3A] transition-colors disabled:opacity-60">
                {submitting ? 'Creating…' : 'Create Coupon'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="py-20 text-center text-gray-400">Loading...</div>
        ) : coupons.length === 0 ? (
          <div className="py-20 text-center">
            <Tag className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No coupons yet. Create your first one!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-500 uppercase tracking-wide border-b border-gray-100">
                  <th className="px-5 py-3 text-left">Code</th>
                  <th className="px-5 py-3 text-left">Discount</th>
                  <th className="px-5 py-3 text-left">Min Order</th>
                  <th className="px-5 py-3 text-left">Uses</th>
                  <th className="px-5 py-3 text-left">Expires</th>
                  <th className="px-5 py-3 text-left">Status</th>
                  <th className="px-5 py-3 text-left"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {coupons.map((c: any) => (
                  <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 font-mono font-bold text-[#1B8C4E]">{c.code}</td>
                    <td className="px-5 py-3 font-semibold">
                      {c.type === 'percentage' ? `${c.value}%` : formatCurrency(c.value)}
                    </td>
                    <td className="px-5 py-3 text-gray-500">{c.min_order_value > 0 ? formatCurrency(c.min_order_value) : '—'}</td>
                    <td className="px-5 py-3 text-gray-500">{c.used_count ?? 0}{c.usage_limit ? ` / ${c.usage_limit}` : ''}</td>
                    <td className="px-5 py-3 text-gray-500">{c.expires_at ? new Date(c.expires_at).toLocaleDateString() : '—'}</td>
                    <td className="px-5 py-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${c.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {c.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <button onClick={() => deleteCoupon(c.id)} className="text-red-400 hover:text-red-600 transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
