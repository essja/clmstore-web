'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { riderApi } from '@/lib/api';
import { Wallet, TrendingUp, DollarSign, ArrowUpRight, ShieldCheck, Phone, User, CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function RiderAccountPage() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ amount: '', payment_method: 'orange_money', payment_details: '' });

  const { data: profileData } = useQuery({
    queryKey: ['rider', 'profile'],
    queryFn: () => riderApi.getProfile().then(r => r.data),
  });

  const { data: summaryData } = useQuery({
    queryKey: ['rider', 'earnings-summary'],
    queryFn: () => riderApi.getEarningsSummary().then(r => r.data).catch(() => null),
  });

  const { data: withdrawalsData } = useQuery({
    queryKey: ['rider', 'withdrawals'],
    queryFn: () => riderApi.getWithdrawals({ limit: 20 }).then(r => r.data).catch(() => null),
  });

  const profile = profileData;
  const summary = summaryData?.data ?? summaryData;
  const withdrawals = withdrawalsData?.data ?? [];

  const withdrawMutation = useMutation({
    mutationFn: () =>
      riderApi.requestWithdrawal({
        amount: parseFloat(form.amount),
        payment_method: form.payment_method,
        payment_details: form.payment_details,
      }),
    onSuccess: () => {
      toast.success('Withdrawal request submitted for Orange Money / Afrimoney payout! 💸');
      setShowForm(false);
      setForm({ amount: '', payment_method: 'orange_money', payment_details: '' });
      qc.invalidateQueries({ queryKey: ['rider'] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.detail ?? 'Withdrawal failed. Check your balance.');
    },
  });

  return (
    <div>
      {/* Title */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em' }}>
          Rider Account & Earnings 💳
        </h1>
        <p style={{ fontSize: '14px', color: '#64748b', marginTop: '2px' }}>
          Delivery commissions, payout balance, vehicle info & mobile money withdrawals
        </p>
      </div>

      {/* Rider Info Card */}
      <div className="premium-card" style={{ padding: '24px', background: '#ffffff', marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '54px', height: '54px', borderRadius: '18px',
            background: 'linear-gradient(135deg, #10b981, #059669)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.8rem', color: '#ffffff', flexShrink: 0,
          }}>
            🛵
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a' }}>
                {profile?.user?.first_name ?? 'Rider Partner'} {profile?.user?.last_name ?? ''}
              </h2>
              <span className="badge badge-emerald">VERIFIED RIDER</span>
            </div>
            <p style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
              Plate: <strong>{profile?.vehicle_plate ?? 'SL-1001'}</strong> ({profile?.vehicle_model ?? 'Honda CG 125'})
            </p>
          </div>
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px', marginBottom: '32px' }}>
        
        {/* Balance Card */}
        <div className="dark-banner" style={{ padding: '24px', margin: 0 }}>
          <span style={{ fontSize: '11px', fontWeight: 900, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Available Payout Balance
          </span>
          <h3 style={{ fontSize: '28px', fontWeight: 900, marginTop: '8px', color: '#ffffff', lineHeight: 1 }}>
            {formatCurrency(summary?.available_balance ?? 0)}
          </h3>
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn-primary"
            style={{ marginTop: '16px', padding: '10px 18px', fontSize: '13px', borderRadius: '12px' }}
          >
            Request Payout <ArrowUpRight size={16} />
          </button>
        </div>

        {/* Lifetime Earnings */}
        <div className="premium-card" style={{ padding: '24px', background: '#ffffff' }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '12px', background: '#eff6ff',
            border: '1px solid #bfdbfe', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: '12px',
          }}>
            <TrendingUp size={20} />
          </div>
          <p style={{ fontSize: '24px', fontWeight: 900, color: '#0f172a', lineHeight: 1 }}>
            {formatCurrency(summary?.total_earned ?? 0)}
          </p>
          <p style={{ fontSize: '13px', fontWeight: 700, color: '#64748b', marginTop: '6px' }}>Total Delivery Commissions</p>
        </div>
      </div>

      {/* Withdrawal Form Modal Box */}
      {showForm && (
        <div className="premium-card" style={{ padding: '28px', background: '#ffffff', marginBottom: '28px', border: '2px solid #10b981' }}>
          <h3 style={{ fontSize: '17px', fontWeight: 900, color: '#0f172a', marginBottom: '16px' }}>
            💸 Mobile Money Withdrawal Request
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '6px' }}>
                Amount to Withdraw (SLL)
              </label>
              <input
                type="number"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                placeholder="e.g. 50000"
                className="input-field"
                style={{ fontSize: '14px' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '13px', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '6px' }}>
                Payout Provider
              </label>
              <select
                value={form.payment_method}
                onChange={(e) => setForm({ ...form, payment_method: e.target.value })}
                className="input-field"
                style={{ fontSize: '13px' }}
              >
                <option value="orange_money">Orange Money Sierra Leone</option>
                <option value="afrimoney">Afrimoney Sierra Leone</option>
                <option value="bank_transfer">Bank Transfer</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '13px', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '6px' }}>
                Mobile Number / Account Details
              </label>
              <input
                type="text"
                value={form.payment_details}
                onChange={(e) => setForm({ ...form, payment_details: e.target.value })}
                placeholder="+232 76 000 000"
                className="input-field"
                style={{ fontSize: '14px' }}
              />
            </div>

            <button
              onClick={() => withdrawMutation.mutate()}
              disabled={withdrawMutation.isPending}
              className="btn-primary"
              style={{ width: '100%', padding: '12px', borderRadius: '12px', fontSize: '14px', marginTop: '6px' }}
            >
              Submit Payout Request
            </button>
          </div>
        </div>
      )}

      {/* Withdrawal History */}
      <div className="premium-card" style={{ padding: '24px', background: '#ffffff' }}>
        <h3 style={{ fontSize: '17px', fontWeight: 900, color: '#0f172a', marginBottom: '16px' }}>Payout History</h3>
        {withdrawals.length === 0 ? (
          <div style={{ padding: '36px', textAlign: 'center', color: '#64748b' }}>
            <Wallet size={36} style={{ color: '#cbd5e1', margin: '0 auto 12px' }} />
            <p style={{ fontWeight: 800, fontSize: '15px', color: '#0f172a' }}>No payout requests</p>
            <p style={{ fontSize: '13px', marginTop: '2px' }}>Your withdrawal history will show up here.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {withdrawals.map((w: any) => (
              <div key={w.id} style={{ padding: '14px 18px', borderRadius: '14px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span className="badge badge-emerald">{w.status.toUpperCase()}</span>
                  <p style={{ fontWeight: 900, color: '#059669', fontSize: '16px', marginTop: '4px' }}>{formatCurrency(w.amount)}</p>
                  <p style={{ fontSize: '12px', color: '#64748b' }}>{w.payment_method?.replace('_', ' ')} · {w.payment_details}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
