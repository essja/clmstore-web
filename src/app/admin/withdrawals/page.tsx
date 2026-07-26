'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Wallet, CheckCircle2, Clock } from 'lucide-react';
import { adminApi } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';

export default function AdminWithdrawalsPage() {
  const [type, setType] = useState<'restaurant' | 'rider'>('restaurant');
  const [status, setStatus] = useState('pending');

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'withdrawals', type, status],
    queryFn: () => (type === 'rider' ? adminApi.getRiderWithdrawals({ status }) : adminApi.getRestaurantWithdrawals({ status })).then((r) => r.data),
  });

  const withdrawals = data?.data ?? [];

  return (
    <div>
      {/* Title Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em' }}>
          Vendor & Rider Withdrawals 💳
        </h1>
        <p style={{ fontSize: '14px', color: '#64748b', marginTop: '2px' }}>
          Process Payout requests to Orange Money, Afrimoney & Bank Accounts
        </p>
      </div>

      {/* Tabs Row */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '28px', flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Type selector */}
        <div style={{ display: 'flex', gap: '6px', background: '#ffffff', padding: '4px', borderRadius: '99px', border: '1px solid #e2e8f0' }}>
          <button
            onClick={() => setType('restaurant')}
            style={{
              padding: '8px 18px', borderRadius: '99px', fontSize: '13px', fontWeight: 800,
              cursor: 'pointer', fontFamily: 'inherit', border: 'none', transition: 'all 0.2s',
              background: type === 'restaurant' ? 'linear-gradient(135deg, #10b981, #059669)' : 'transparent',
              color: type === 'restaurant' ? '#ffffff' : '#64748b',
              boxShadow: type === 'restaurant' ? '0 4px 12px rgba(16, 185, 129, 0.3)' : 'none',
            }}
          >
            Restaurant Owners
          </button>
          <button
            onClick={() => setType('rider')}
            style={{
              padding: '8px 18px', borderRadius: '99px', fontSize: '13px', fontWeight: 800,
              cursor: 'pointer', fontFamily: 'inherit', border: 'none', transition: 'all 0.2s',
              background: type === 'rider' ? 'linear-gradient(135deg, #10b981, #059669)' : 'transparent',
              color: type === 'rider' ? '#ffffff' : '#64748b',
              boxShadow: type === 'rider' ? '0 4px 12px rgba(16, 185, 129, 0.3)' : 'none',
            }}
          >
            Riders
          </button>
        </div>

        {/* Status Dropdown */}
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="input-field"
          style={{ width: 'auto', minWidth: '160px', padding: '8px 16px', fontSize: '13px', borderRadius: '99px' }}
        >
          <option value="pending">Pending Payouts</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="">All Statuses</option>
        </select>
      </div>

      {/* Withdrawals Card Container */}
      <div className="premium-card" style={{ padding: '32px', background: '#ffffff' }}>
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>Loading withdrawal requests...</div>
        ) : withdrawals.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>
            <Wallet size={40} style={{ color: '#cbd5e1', margin: '0 auto 12px' }} />
            <h3 style={{ fontWeight: 900, fontSize: '18px', color: '#0f172a' }}>No withdrawal requests</h3>
            <p style={{ fontSize: '14px', marginTop: '4px' }}>There are no {status || ''} {type} payout requests pending.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {withdrawals.map((w: any) => (
              <div key={w.id} style={{
                padding: '20px', borderRadius: '18px', border: '1px solid #e2e8f0',
                display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px',
              }}>
                <div>
                  <span className="badge badge-emerald">{w.status.toUpperCase()}</span>
                  <h4 style={{ fontSize: '18px', fontWeight: 900, color: '#059669', marginTop: '8px' }}>
                    {formatCurrency(w.amount)}
                  </h4>
                  <p style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
                    Payee: {w.user?.first_name} {w.user?.last_name} · Account: {w.payment_details ?? 'Orange Money'}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="btn-primary" style={{ padding: '10px 18px', fontSize: '13px' }}>Approve & Pay</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
