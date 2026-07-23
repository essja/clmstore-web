'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MessageSquare, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { adminApi } from '@/lib/api';
import { formatCurrency, formatTimeAgo } from '@/lib/utils';

const STATUSES = ['', 'open', 'resolved', 'dismissed'];

export default function AdminDisputesPage() {
  const [status, setStatus] = useState('open');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'disputes', status, page],
    queryFn: () => adminApi.getDisputes({ status: status || undefined, page, limit: 20 }).then((r) => r.data),
  });

  const disputes = data?.data ?? [];
  const pagination = data?.pagination;

  return (
    <div>
      {/* Title Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em' }}>
          Customer Disputes & Support 💬
        </h1>
        <p style={{ fontSize: '14px', color: '#64748b', marginTop: '2px' }}>
          Review and resolve customer refund requests and order complaints
        </p>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '28px', flexWrap: 'wrap' }}>
        {STATUSES.map((s) => {
          const isActive = status === s;
          const label = s === '' ? 'All Disputes' : s.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
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
              {label}
            </button>
          );
        })}
      </div>

      {/* Disputes Card Container */}
      <div className="premium-card" style={{ padding: '32px', background: '#ffffff' }}>
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>Loading disputes...</div>
        ) : disputes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>
            <div style={{
              width: '64px', height: '64px', borderRadius: '20px', background: '#ecfdf5',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
            }}>
              <CheckCircle2 size={32} style={{ color: '#10b981' }} />
            </div>
            <h3 style={{ fontWeight: 900, fontSize: '18px', color: '#0f172a' }}>No disputes found</h3>
            <p style={{ fontSize: '14px', marginTop: '4px' }}>There are currently no {status || 'total'} disputes recorded.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {disputes.map((d: any) => (
              <div key={d.id} style={{
                padding: '20px', borderRadius: '18px', border: '1px solid #e2e8f0',
                display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px',
              }}>
                <div>
                  <span className={`badge ${d.status === 'open' ? 'badge-amber' : 'badge-emerald'}`}>
                    {d.status.toUpperCase()}
                  </span>
                  <h4 style={{ fontSize: '16px', fontWeight: 800, marginTop: '8px', color: '#0f172a' }}>
                    {d.reason ?? 'Order Issue'}
                  </h4>
                  <p style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
                    Order #{d.order?.order_number} · Customer: {d.user?.first_name} {d.user?.last_name}
                  </p>
                </div>
                <div>
                  <button className="btn-primary" style={{ padding: '10px 20px', fontSize: '13px' }}>
                    Manage Dispute
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
