'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ChevronRight, Package, ArrowRight } from 'lucide-react';
import { orderApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { formatCurrency, formatTimeAgo, getOrderStatusLabel, getOrderStatusColor } from '@/lib/utils';
import type { Order } from '@/types';

const STATUS_FILTERS = [
  { label: 'All Orders', value: '' },
  { label: 'Active', value: 'active' },
  { label: 'Delivered', value: 'delivered' },
  { label: 'Cancelled', value: 'cancelled' },
];

export default function OrdersPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => { if (!isAuthenticated) router.push('/login'); }, [isAuthenticated]);

  const { data, isLoading } = useQuery({
    queryKey: ['orders', statusFilter, page],
    queryFn: () => orderApi.list({ status: statusFilter || undefined, page, limit: 10 }).then((r) => r.data),
    enabled: isAuthenticated,
  });

  const orders: Order[] = data?.data ?? [];
  const total: number = data?.total ?? 0;
  const totalPages = Math.ceil(total / 10);

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', padding: '32px 20px 80px' }}>
      
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 900, color: '#0f172a' }}>My Orders 📦</h1>
        <p style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>Track active orders and view past history</p>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px', marginBottom: '20px' }}>
        {STATUS_FILTERS.map(({ label, value }) => (
          <button
            key={value}
            onClick={() => { setStatusFilter(value); setPage(1); }}
            style={{
              flexShrink: 0, padding: '8px 18px', borderRadius: '99px', fontSize: '13px', fontWeight: 600,
              border: 'none', cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'inherit',
              background: statusFilter === value ? '#0f172a' : '#fff',
              color: statusFilter === value ? '#fff' : '#64748b',
              boxShadow: statusFilter === value ? '0 4px 12px rgba(15,23,42,0.25)' : '0 2px 8px rgba(0,0,0,0.04)',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: '96px', borderRadius: '20px' }} />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '80px 20px', background: '#fff',
          borderRadius: '24px', border: '1px solid #f1f5f9',
        }}>
          <div style={{
            width: '72px', height: '72px', borderRadius: '20px', background: '#f8fafc',
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
            color: '#94a3b8',
          }}>
            <Package size={32} />
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>No orders found</h3>
          <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '24px' }}>Your order history will appear here once you make your first order.</p>
          <Link href="/restaurants" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-flex', padding: '12px 24px', fontSize: '14px' }}>
            Browse Restaurants <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {orders.map((order) => (
              <Link key={order.id} href={`/orders/${order.id}`} style={{ textDecoration: 'none' }}>
                <div style={{
                  background: '#fff', borderRadius: '20px', padding: '18px',
                  border: '1px solid #f1f5f9', boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
                  transition: 'all 0.2s', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '16px',
                }}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = '#16a34a'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = '#f1f5f9'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; }}
                >
                  <div style={{
                    width: '48px', height: '48px', borderRadius: '14px', background: '#f0fdf4',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem',
                    flexShrink: 0,
                  }}>
                    🍽️
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                      <p style={{ fontWeight: 800, fontSize: '14px', color: '#0f172a' }} className="line-clamp-1">
                        Order #{order.order_number}
                      </p>
                      <span className={`badge ${getOrderStatusColor(order.status)}`}>
                        {getOrderStatusLabel(order.status)}
                      </span>
                    </div>
                    <p style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }} className="line-clamp-1">
                      {order.restaurant?.name}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px' }}>
                      <span style={{ fontSize: '11px', color: '#94a3b8' }}>{formatTimeAgo(order.created_at)}</span>
                      <span style={{ fontSize: '14px', fontWeight: 900, color: '#16a34a' }}>{formatCurrency(order.total_amount)}</span>
                    </div>
                  </div>
                  <ChevronRight size={18} style={{ color: '#94a3b8', flexShrink: 0 }} />
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', marginTop: '32px' }}>
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="btn-secondary" style={{ padding: '8px 16px', fontSize: '12px', opacity: page === 1 ? 0.4 : 1 }}>Previous</button>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748b' }}>Page {page} of {totalPages}</span>
              <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="btn-secondary" style={{ padding: '8px 16px', fontSize: '12px', opacity: page === totalPages ? 0.4 : 1 }}>Next</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
