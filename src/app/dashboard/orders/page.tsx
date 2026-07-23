'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ShoppingBag, CheckCircle, Clock, ChefHat, Package, Truck, XCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { dashboardApi } from '@/lib/api';
import { formatCurrency, formatTimeAgo, getOrderStatusColor, getOrderStatusLabel } from '@/lib/utils';
import toast from 'react-hot-toast';

const STATUSES = ['', 'pending', 'accepted', 'ready', 'picked_up', 'delivered', 'cancelled'];

export default function RestaurantOrdersPage() {
  const qc = useQueryClient();
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['restaurant', 'orders', status, page],
    queryFn: () => dashboardApi.getOrders({ status: status || undefined, page, limit: 20 }).then((r) => r.data),
    refetchInterval: 10000,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, newStatus }: { orderId: number; newStatus: string }) =>
      dashboardApi.updateOrderStatus(orderId, newStatus),
    onSuccess: () => {
      toast.success('Order status updated! 🍳');
      qc.invalidateQueries({ queryKey: ['restaurant'] });
    },
    onError: (err: any) => toast.error(err?.response?.data?.detail ?? 'Failed to update status'),
  });

  const orders = data?.data ?? [];
  const pagination = data?.pagination;

  return (
    <div>
      {/* Title */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em' }}>
          Kitchen Orders Stream 🍳
        </h1>
        <p style={{ fontSize: '14px', color: '#64748b', marginTop: '2px' }}>
          Accept incoming orders, update cooking status, and notify delivery riders
        </p>
      </div>

      {/* Filter Tabs Row */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '28px', flexWrap: 'wrap' }}>
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
          <div style={{ padding: '80px', textAlign: 'center', color: '#94a3b8' }}>Loading kitchen orders...</div>
        ) : orders.length === 0 ? (
          <div style={{ padding: '80px', textAlign: 'center', color: '#64748b' }}>
            <ShoppingBag size={40} style={{ color: '#cbd5e1', margin: '0 auto 12px' }} />
            <h3 style={{ fontWeight: 900, fontSize: '18px', color: '#0f172a' }}>No orders found</h3>
            <p style={{ fontSize: '13px', marginTop: '4px' }}>Try selecting a different status filter above.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', textTransform: 'uppercase', fontSize: '11px', fontWeight: 800, color: '#64748b', letterSpacing: '0.05em' }}>
                  <th style={{ padding: '14px 24px', textAlign: 'left' }}>Order #</th>
                  <th style={{ padding: '14px 24px', textAlign: 'left' }}>Customer</th>
                  <th style={{ padding: '14px 24px', textAlign: 'left' }}>Items</th>
                  <th style={{ padding: '14px 24px', textAlign: 'left' }}>Total</th>
                  <th style={{ padding: '14px 24px', textAlign: 'left' }}>Status</th>
                  <th style={{ padding: '14px 24px', textAlign: 'right' }}>Kitchen Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order: any) => (
                  <tr key={order.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '16px 24px', fontWeight: 800, color: '#0f172a' }}>
                      {order.order_number}
                      <p style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 500 }}>{formatTimeAgo(order.created_at)}</p>
                    </td>
                    <td style={{ padding: '16px 24px', color: '#334155', fontWeight: 600 }}>
                      {order.customer?.first_name} {order.customer?.last_name}
                      <p style={{ fontSize: '12px', color: '#64748b' }}>{order.customer?.phone ?? ''}</p>
                    </td>
                    <td style={{ padding: '16px 24px', color: '#475569', fontSize: '13px' }}>
                      {order.items?.length ?? 1} item(s)
                    </td>
                    <td style={{ padding: '16px 24px', fontWeight: 800, color: '#10b981' }}>
                      {formatCurrency(order.total_amount)}
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <span className={`badge ${getOrderStatusColor(order.status)}`}>
                        {getOrderStatusLabel(order.status)}
                      </span>
                    </td>
                    <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                      {order.status === 'pending' && (
                        <button
                          onClick={() => updateStatusMutation.mutate({ orderId: order.id, newStatus: 'accepted' })}
                          className="btn-primary"
                          style={{ padding: '8px 16px', fontSize: '12px', borderRadius: '10px' }}
                        >
                          Accept & Cook 🍳
                        </button>
                      )}
                      {order.status === 'accepted' && (
                        <button
                          onClick={() => updateStatusMutation.mutate({ orderId: order.id, newStatus: 'ready' })}
                          style={{
                            padding: '8px 16px', borderRadius: '10px', fontSize: '12px', fontWeight: 800,
                            background: '#eff6ff', border: '1px solid #bfdbfe', color: '#2563eb',
                            cursor: 'pointer', fontFamily: 'inherit',
                          }}
                        >
                          Mark Ready 📦
                        </button>
                      )}
                      {order.status === 'ready' && (
                        <span style={{ fontSize: '12px', color: '#059669', fontWeight: 800 }}>
                          Waiting for Rider Pickup 🛵
                        </span>
                      )}
                    </td>
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
              Page {pagination.page} of {pagination.total_pages} · {pagination.total} orders
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
