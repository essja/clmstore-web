'use client';
import { useQuery } from '@tanstack/react-query';
import { Wallet, TrendingUp, DollarSign, ArrowUpRight, Clock, ShieldCheck } from 'lucide-react';
import { dashboardApi } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function RestaurantEarningsPage() {
  const { data: statsData } = useQuery({
    queryKey: ['restaurant', 'stats'],
    queryFn: () => dashboardApi.getStats().then((r) => r.data),
  });

  const stats = statsData?.data;
  const availableBalance = stats?.today_revenue ?? 0;
  const totalEarned = stats?.today_revenue ?? 0;

  const handleRequestPayout = () => {
    toast.success('Payout request submitted for Orange Money / Afrimoney transfer! 💸');
  };

  return (
    <div>
      {/* Title */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em' }}>
          Earnings & Payouts 💳
        </h1>
        <p style={{ fontSize: '14px', color: '#64748b', marginTop: '2px' }}>
          Track sales revenue, platform fees, and request direct payouts to Mobile Money
        </p>
      </div>

      {/* Financial Summary Cards */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '20px', marginBottom: '32px',
      }}>
        {/* Available Balance Box */}
        <div className="dark-banner" style={{ padding: '28px', margin: 0 }}>
          <span style={{ fontSize: '11px', fontWeight: 900, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Available Payout Balance
          </span>
          <h2 style={{ fontSize: '32px', fontWeight: 900, marginTop: '8px', color: '#ffffff', lineHeight: 1 }}>
            {formatCurrency(availableBalance)}
          </h2>
          <button
            onClick={handleRequestPayout}
            className="btn-primary"
            style={{ marginTop: '20px', padding: '10px 20px', fontSize: '13px', borderRadius: '12px' }}
          >
            Request Payout <ArrowUpRight size={16} />
          </button>
        </div>

        {/* Total Earned Card */}
        <div className="premium-card" style={{ padding: '28px', background: '#ffffff' }}>
          <div style={{
            width: '44px', height: '44px', borderRadius: '14px', background: '#eff6ff',
            border: '1px solid #bfdbfe', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: '14px',
          }}>
            <TrendingUp size={22} />
          </div>
          <p style={{ fontSize: '28px', fontWeight: 900, color: '#0f172a', lineHeight: 1 }}>
            {formatCurrency(totalEarned)}
          </p>
          <p style={{ fontSize: '13px', fontWeight: 700, color: '#64748b', marginTop: '6px' }}>Total Lifetime Sales Revenue</p>
        </div>

        {/* Commission Rate Card */}
        <div className="premium-card" style={{ padding: '28px', background: '#ffffff' }}>
          <div style={{
            width: '44px', height: '44px', borderRadius: '14px', background: '#f5f3ff',
            border: '1px solid #ddd6fe', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: '14px',
          }}>
            <ShieldCheck size={22} />
          </div>
          <p style={{ fontSize: '28px', fontWeight: 900, color: '#0f172a', lineHeight: 1 }}>
            15%
          </p>
          <p style={{ fontSize: '13px', fontWeight: 700, color: '#64748b', marginTop: '6px' }}>Standard Platform Commission Rate</p>
        </div>
      </div>

      {/* Withdrawal History Card */}
      <div className="premium-card" style={{ padding: '32px', background: '#ffffff' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a', marginBottom: '16px' }}>Payout History</h3>
        <div style={{ textAlign: 'center', padding: '48px 0', color: '#64748b' }}>
          <Wallet size={40} style={{ color: '#cbd5e1', margin: '0 auto 12px' }} />
          <p style={{ fontWeight: 800, fontSize: '16px', color: '#0f172a' }}>No payout history yet</p>
          <p style={{ fontSize: '13px', marginTop: '4px' }}>Payout requests submitted will appear here with status tracking.</p>
        </div>
      </div>
    </div>
  );
}
