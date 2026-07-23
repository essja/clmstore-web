'use client';
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { TrendingUp, ShoppingBag, Clock, Star, ArrowRight, BellRing, Volume2, VolumeX } from 'lucide-react';
import { dashboardApi } from '@/lib/api';
import { sound } from '@/lib/audio';
import { formatCurrency, formatTimeAgo, getOrderStatusColor, getOrderStatusLabel } from '@/lib/utils';
import type { Order } from '@/types';
import Link from 'next/link';

export default function RestaurantOverview() {
  const [isMuted, setIsMuted] = useState(false);

  const { data: statsData } = useQuery({
    queryKey: ['restaurant', 'stats'],
    queryFn: () => dashboardApi.getStats().then((r) => r.data),
    refetchInterval: 10000,
  });

  const { data: recentData } = useQuery({
    queryKey: ['restaurant', 'recent-orders'],
    queryFn: () => dashboardApi.getOrders({ limit: 10 }).then((r) => r.data),
    refetchInterval: 10000,
  });

  const stats = statsData?.data;
  const recentOrders: Order[] = recentData?.data ?? [];

  // Trigger ringing sound when pending kitchen orders exist
  useEffect(() => {
    if (stats?.pending_orders && stats.pending_orders > 0 && !isMuted) {
      sound.playOrderRingingSound();
    }
  }, [stats?.pending_orders, isMuted]);

  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    sound.setMuted(next);
    if (!next) sound.playOrderRingingSound();
  };

  const STAT_CARDS = [
    { label: "Today's Sales Revenue", value: formatCurrency(stats?.today_revenue ?? 0), icon: TrendingUp, color: '#10b981', bg: '#ecfdf5', border: '#a7f3d0' },
    { label: 'Orders Received Today', value: stats?.today_orders ?? 0, icon: ShoppingBag, color: '#3b82f6', bg: '#eff6ff', border: '#bfdbfe' },
    { label: 'Pending Kitchen Orders', value: stats?.pending_orders ?? 0, icon: Clock, color: '#f59e0b', bg: '#fffbeb', border: '#fde68a' },
    { label: 'Store Average Rating', value: stats?.avg_rating ? `${stats.avg_rating.toFixed(1)} ★` : '4.9 ★', icon: Star, color: '#8b5cf6', bg: '#f5f3ff', border: '#ddd6fe' },
  ];

  return (
    <div>
      {/* Header */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between',
        gap: '16px', marginBottom: '28px',
      }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em' }}>
            Store Overview 🍽️
          </h1>
          <p style={{ fontSize: '14px', color: '#64748b', marginTop: '2px' }}>
            Live orders, kitchen activity & daily sales metrics
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {/* Ringing Sound Alert Toggle Button */}
          <button
            onClick={() => sound.playOrderRingingSound()}
            className="btn-secondary"
            style={{ padding: '10px 18px', fontSize: '13px', borderRadius: '12px', background: '#ecfdf5', borderColor: '#a7f3d0', color: '#047857' }}
          >
            <BellRing size={16} /> Test Ringing Sound 🔔
          </button>

          <Link href="/dashboard/orders" className="btn-primary" style={{ padding: '10px 20px', fontSize: '13px', textDecoration: 'none' }}>
            View Orders Stream <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '18px', marginBottom: '32px',
      }}>
        {STAT_CARDS.map(({ label, value, icon: Icon, color, bg, border }) => (
          <div key={label} className="premium-card" style={{ padding: '24px 20px', background: '#ffffff' }}>
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

      {/* Live Kitchen Orders Table */}
      <div className="premium-card" style={{ overflow: 'hidden', background: '#ffffff' }}>
        <div style={{
          padding: '20px 24px', borderBottom: '1px solid #e2e8f0',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <h2 style={{ fontSize: '17px', fontWeight: 900, color: '#0f172a' }}>Today&apos;s Live Kitchen Orders</h2>
          <Link href="/dashboard/orders" style={{
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
                <th style={{ padding: '14px 24px', textAlign: 'left' }}>Amount</th>
                <th style={{ padding: '14px 24px', textAlign: 'left' }}>Status</th>
                <th style={{ padding: '14px 24px', textAlign: 'left' }}>Time</th>
                <th style={{ padding: '14px 24px', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '48px', color: '#94a3b8', fontSize: '14px' }}>
                    No kitchen orders received yet today.
                  </td>
                </tr>
              ) : (
                recentOrders.map((order) => (
                  <tr key={order.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '16px 24px', fontWeight: 800, color: '#0f172a' }}>{order.order_number}</td>
                    <td style={{ padding: '16px 24px', color: '#334155', fontWeight: 600 }}>{order.customer?.first_name} {order.customer?.last_name}</td>
                    <td style={{ padding: '16px 24px', fontWeight: 800, color: '#10b981' }}>{formatCurrency(order.total_amount)}</td>
                    <td style={{ padding: '16px 24px' }}>
                      <span className={`badge ${getOrderStatusColor(order.status)}`}>
                        {getOrderStatusLabel(order.status)}
                      </span>
                    </td>
                    <td style={{ padding: '16px 24px', color: '#94a3b8', fontSize: '13px' }}>{formatTimeAgo(order.created_at)}</td>
                    <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                      <Link href="/dashboard/orders" style={{ fontSize: '13px', color: '#059669', fontWeight: 800, textDecoration: 'none' }}>
                        Manage Order →
                      </Link>
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
}
