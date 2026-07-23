'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ShoppingBag, ChevronLeft, ChevronRight } from 'lucide-react';
import { adminApi } from '@/lib/api';
import { formatCurrency, formatTimeAgo, getOrderStatusColor, getOrderStatusLabel } from '@/lib/utils';

const STATUSES = ['', 'pending', 'accepted', 'ready', 'picked_up', 'delivered', 'cancelled'];

export default function AdminOrdersPage() {
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'orders', status, page],
    queryFn: () => adminApi.getOrders({ status: status || undefined, page, limit: 20 }).then((r) => r.data),
  });

  const orders = data?.data ?? [];
  const pagination = data?.pagination;

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em' }}>All System Orders 📦</h1>
        <p style={{ fontSize: '14px', color: '#64748b', marginTop: '2px' }}>Monitor and manage order lifecycles across Freetown</p>
      </div>

      {/* Filter Pills with proper gaps */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '28px', flexWrap: 'wrap' }}>
        {STATUSES.map((s) => {
          const isActive = status === s;
          return (
            <button
              key={s}
              onClick={() => { setStatus(s); setPage(1); }}
              style={{
                padding: '8px 18px', borderRadius: '99px', fontSize: '13px', fontWeight: 800,
                cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s', border: 'none',
                background: isActive ? 'linear-gradient(135deg, #10b981, #059669)' : '#ffffff',
                color: isActive ? '#ffffff' : '#475569',
                boxShadow: isActive ? '0 4px 14px rgba(16, 185, 129, 0.35)' : '0 2px 8px rgba(0,0,0,0.03)',
                outline: isActive ? 'none' : '1px solid #e2e8f0',
              }}
            >
              {s === '' ? 'All Orders' : getOrderStatusLabel(s)}
            </button>
          );
        })}
      </div>

      {/* Orders Table Container */}
      <div className="premium-card" style={{ overflow: 'hidden', background: '#ffffff' }}>
        {isLoading ? (
          <div style={{ padding: '80px', textAlign: 'center', color: '#94a3b8' }}>Loading orders...</div>
        ) : orders.length === 0 ? (
          <div style={{ padding: '80px', textAlign: 'center', color: '#64748b' }}>
            <ShoppingBag size={40} style={{ color: '#cbd5e1', margin: '0 auto 12px' }} />
            <p style={{ fontWeight: 800, fontSize: '16px', color: '#0f172a' }}>No orders found</p>
            <p style={{ fontSize: '13px', marginTop: '4px' }}>Try switching status filter pills above.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', textTransform: 'uppercase', fontSize: '11px', fontWeight: 800, color: '#64748b', letterSpacing: '0.05em' }}>
                  <th style={{ padding: '14px 24px', textAlign: 'left' }}>Order #</th>
                  <th style={{ padding: '14px 24px', textAlign: 'left' }}>Customer</th>
                  <th style={{ padding: '14px 24px', textAlign: 'left' }}>Restaurant</th>
                  <th style={{ padding: '14px 24px', textAlign: 'left' }}>Amount</th>
                  <th style={{ padding: '14px 24px', textAlign: 'left' }}>Status</th>
                  <th style={{ padding: '14px 24px', textAlign: 'left' }}>Time</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order: any) => (
                  <tr key={order.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '16px 24px', fontWeight: 800, color: '#0f172a' }}>{order.order_number}</td>
                    <td style={{ padding: '16px 24px', color: '#334155', fontWeight: 600 }}>{order.customer?.first_name} {order.customer?.last_name}</td>
                    <td style={{ padding: '16px 24px', color: '#334155' }}>{order.restaurant?.name ?? '—'}</td>
                    <td style={{ padding: '16px 24px', fontWeight: 800, color: '#10b981' }}>{formatCurrency(order.total_amount)}</td>
                    <td style={{ padding: '16px 24px' }}>
                      <span className={`badge ${getOrderStatusColor(order.status)}`}>
                        {getOrderStatusLabel(order.status)}
                      </span>
                    </td>
                    <td style={{ padding: '16px 24px', color: '#94a3b8', fontSize: '13px' }}>{formatTimeAgo(order.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {pagination && pagination.total_pages > 1 && (
          <div style={{
            padding: '16px 24px', borderTop: '1px solid #e2e8f0',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: '#f8fafc',
          }}>
            <p style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>
              Page {pagination.page} of {pagination.total_pages} · {pagination.total} total orders
            </p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={!pagination.has_prev}
                className="btn-secondary"
                style={{ padding: '8px 16px', fontSize: '13px', borderRadius: '12px' }}
              >
                <ChevronLeft size={14} /> Previous
              </button>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={!pagination.has_next}
                className="btn-secondary"
                style={{ padding: '8px 16px', fontSize: '13px', borderRadius: '12px' }}
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
