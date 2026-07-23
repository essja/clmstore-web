'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart3, TrendingUp, DollarSign, ShoppingBag, Users, Store } from 'lucide-react';
import { adminApi } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';

const PERIODS = [
  { id: 'today', label: 'Today' },
  { id: 'week', label: 'This Week' },
  { id: 'month', label: 'This Month' },
  { id: 'year', label: 'This Year' },
];

export default function AdminAnalyticsPage() {
  const [period, setPeriod] = useState('month');

  const { data: statsData } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: () => adminApi.getStats().then((r) => r.data),
  });

  const stats = statsData?.data;

  return (
    <div>
      {/* Title + Period Selector Header */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between',
        gap: '16px', marginBottom: '28px',
      }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em' }}>
            Platform Analytics 📊
          </h1>
          <p style={{ fontSize: '14px', color: '#64748b', marginTop: '2px' }}>
            Financial reports, order volume trends, and growth metrics across Freetown
          </p>
        </div>

        {/* Period Filter Tabs */}
        <div style={{ display: 'flex', gap: '6px', background: '#ffffff', padding: '4px', borderRadius: '99px', border: '1px solid #e2e8f0' }}>
          {PERIODS.map((p) => {
            const isActive = period === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setPeriod(p.id)}
                style={{
                  padding: '8px 16px', borderRadius: '99px', fontSize: '13px', fontWeight: 800,
                  cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s', border: 'none',
                  background: isActive ? 'linear-gradient(135deg, #10b981, #059669)' : 'transparent',
                  color: isActive ? '#ffffff' : '#64748b',
                  boxShadow: isActive ? '0 4px 12px rgba(16, 185, 129, 0.3)' : 'none',
                }}
              >
                {p.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Analytics Summary Cards */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '18px', marginBottom: '32px',
      }}>
        {[
          { label: 'Revenue (' + period + ')', value: formatCurrency(stats?.total_revenue ?? 0), icon: DollarSign, color: '#10b981', bg: '#ecfdf5' },
          { label: 'Completed Orders', value: (stats?.total_orders ?? 0).toLocaleString(), icon: ShoppingBag, color: '#3b82f6', bg: '#eff6ff' },
          { label: 'Active Users', value: (stats?.total_users ?? 0).toLocaleString(), icon: Users, color: '#8b5cf6', bg: '#f5f3ff' },
          { label: 'Active Restaurants', value: stats?.total_restaurants ?? 0, icon: Store, color: '#0284c7', bg: '#f0f9ff' },
        ].map((item) => (
          <div key={item.label} className="premium-card" style={{ padding: '24px 20px', background: '#ffffff' }}>
            <div style={{
              width: '42px', height: '42px', borderRadius: '12px', background: item.bg,
              color: item.color, display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: '12px',
            }}>
              <item.icon size={20} />
            </div>
            <p style={{ fontSize: '24px', fontWeight: 900, color: '#0f172a', lineHeight: 1.1 }}>{item.value}</p>
            <p style={{ fontSize: '13px', fontWeight: 700, color: '#64748b', marginTop: '6px' }}>{item.label}</p>
          </div>
        ))}
      </div>

      {/* Analytics Chart Container */}
      <div className="premium-card" style={{ padding: '36px', background: '#ffffff', textAlign: 'center' }}>
        <BarChart3 size={48} style={{ color: '#cbd5e1', margin: '0 auto 16px' }} />
        <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a' }}>Live Order Volume Chart</h3>
        <p style={{ fontSize: '14px', color: '#64748b', marginTop: '6px', maxWidth: '460px', margin: '6px auto 0' }}>
          Detailed order timeline analytics and revenue growth graphs will update in real-time as customer orders are placed.
        </p>
      </div>
    </div>
  );
}
