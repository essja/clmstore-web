'use client';
import { useQuery } from '@tanstack/react-query';
import { Users, Store, ShoppingBag, TrendingUp, AlertTriangle, DollarSign, Star, Truck, ArrowRight } from 'lucide-react';
import { adminApi } from '@/lib/api';
import { formatCurrency, formatTimeAgo, getOrderStatusColor, getOrderStatusLabel } from '@/lib/utils';
import type { Order } from '@/types';
import Link from 'next/link';

export default function AdminOverview() {
  const { data: statsData } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: () => adminApi.getStats().then((r) => r.data),
    refetchInterval: 60000,
  });

  const { data: recentData } = useQuery({
    queryKey: ['admin', 'recent-orders'],
    queryFn: () => adminApi.getOrders({ limit: 10 }).then((r) => r.data),
    refetchInterval: 30000,
  });

  const { data: disputeData } = useQuery({
    queryKey: ['admin', 'open-disputes'],
    queryFn: () => adminApi.getDisputes({ status: 'open', limit: 5 }).then((r) => r.data),
  });

  const stats = statsData?.data;
  const recentOrders: Order[] = recentData?.data ?? [];
  const openDisputes = disputeData?.total ?? 0;

  const STAT_CARDS = [
    { label: 'Total Revenue', value: formatCurrency(stats?.total_revenue ?? 0), icon: DollarSign, color: '#10b981', bg: '#ecfdf5', border: '#a7f3d0' },
    { label: 'Total Orders', value: (stats?.total_orders ?? 0).toLocaleString(), icon: ShoppingBag, color: '#3b82f6', bg: '#eff6ff', border: '#bfdbfe' },
    { label: 'Restaurants', value: stats?.total_restaurants ?? 0, icon: Store, color: '#8b5cf6', bg: '#f5f3ff', border: '#ddd6fe' },
    { label: 'Registered Users', value: (stats?.total_users ?? 0).toLocaleString(), icon: Users, color: '#0284c7', bg: '#f0f9ff', border: '#bae6fd' },
    { label: 'Today Revenue', value: formatCurrency(stats?.today_revenue ?? 0), icon: TrendingUp, color: '#f59e0b', bg: '#fffbeb', border: '#fde68a' },
    { label: 'Today Orders', value: stats?.today_orders ?? 0, icon: ShoppingBag, color: '#06b6d4', bg: '#cffafe', border: '#a5f3fc' },
    { label: 'Active Riders', value: stats?.active_riders ?? 0, icon: Truck, color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
    { label: 'Open Disputes', value: openDisputes, icon: AlertTriangle, color: '#ef4444', bg: '#fef2f2', border: '#fca5a5' },
  ];

  return (
    <div>
      {/* Title */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em' }}>
          Admin Overview 🛡️
        </h1>
        <p style={{ fontSize: '14px', color: '#64748b', marginTop: '2px' }}>
          Platform metrics, live order stream & system health
        </p>
      </div>

      {/* Disputes Warning */}
      {openDisputes > 0 && (
        <div style={{
          background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '18px',
          padding: '16px 20px', marginBottom: '28px', display: 'flex', alignItems: 'center', gap: '12px',
        }}>
          <AlertTriangle size={20} style={{ color: '#ef4444', flexShrink: 0 }} />
          <p style={{ fontSize: '14px', fontWeight: 700, color: '#991b1b' }}>
            {openDisputes} open dispute{openDisputes !== 1 ? 's' : ''} require platform review.
          </p>
          <Link href="/admin/disputes" style={{
            marginLeft: 'auto', fontSize: '13px', fontWeight: 800, color: '#dc2626',
            textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px',
          }}>Review Disputes →</Link>
        </div>
      )}

      {/* Stat Cards Grid */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '18px', marginBottom: '36px',
      }}>
        {STAT_CARDS.map(({ label, value, icon: Icon, color, bg, border }) => (
          <div key={label} className="premium-card" style={{
            padding: '22px 20px', background: '#ffffff',
          }}>
            <div style={{
              width: '44px', height: '44px', borderRadius: '14px', background: bg,
              border: `1px solid ${border}`, color: color,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: '14px',
            }}>
              <Icon size={22} />
            </div>
            <p style={{ fontSize: '24px', fontWeight: 900, color: '#0f172a', lineHeight: 1.1 }}>{value}</p>
            <p style={{ fontSize: '13px', fontWeight: 700, color: '#64748b', marginTop: '6px' }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Recent Orders Table Container */}
      <div className="premium-card" style={{ overflow: 'hidden', background: '#ffffff' }}>
        <div style={{
          padding: '20px 24px', borderBottom: '1px solid #e2e8f0',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <h2 style={{ fontSize: '17px', fontWeight: 900, color: '#0f172a' }}>Live Orders Stream</h2>
          <Link href="/admin/orders" style={{
            fontSize: '13px', color: '#10b981', textDecoration: 'none', fontWeight: 800,
            display: 'flex', alignItems: 'center', gap: '4px',
          }}>View all orders <ArrowRight size={14} /></Link>
        </div>

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
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '48px', color: '#94a3b8', fontSize: '14px' }}>
                    No orders recorded yet in system.
                  </td>
                </tr>
              ) : (
                recentOrders.map((order) => (
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
