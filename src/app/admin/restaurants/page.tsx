'use client';
import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Store, CheckCircle2, XCircle, MapPin, Mail, Phone, ChevronLeft, ChevronRight } from 'lucide-react';
import { adminApi } from '@/lib/api';
import { formatTimeAgo } from '@/lib/utils';
import toast from 'react-hot-toast';

const STATUSES = ['', 'pending', 'approved', 'suspended'];

export default function AdminRestaurantsPage() {
  const qc = useQueryClient();
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'restaurants', status, page],
    queryFn: () => adminApi.getRestaurants({ status: status || undefined, page, limit: 20 }).then((r) => r.data),
  });

  const restaurants = data?.data ?? [];
  const pagination = data?.pagination;

  const approve = async (id: number) => {
    try {
      await adminApi.approveRestaurant(id);
      qc.invalidateQueries({ queryKey: ['admin', 'restaurants'] });
      toast.success('Restaurant approved and active! 🎉');
    } catch (err: any) {
      toast.error(err?.response?.data?.detail ?? 'Failed to approve');
    }
  };

  const reject = async (id: number) => {
    if (!rejectReason.trim()) { toast.error('Enter rejection reason'); return; }
    try {
      await adminApi.rejectRestaurant(id, rejectReason);
      qc.invalidateQueries({ queryKey: ['admin', 'restaurants'] });
      toast.success('Restaurant application rejected');
      setRejectingId(null);
      setRejectReason('');
    } catch (err: any) {
      toast.error(err?.response?.data?.detail ?? 'Failed to reject');
    }
  };

  const statusLabel: Record<string, string> = {
    '': 'All Vendors',
    pending: 'Pending Approval',
    pending_approval: 'Pending Approval',
    approved: 'Approved Stores',
    suspended: 'Suspended Stores',
  };

  return (
    <div>
      {/* Title Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em' }}>
          Restaurant & Store Partners 🏪
        </h1>
        <p style={{ fontSize: '14px', color: '#64748b', marginTop: '2px' }}>
          Review store onboarding requests, approve vendors, and monitor active restaurants across Freetown
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
              {statusLabel[s]}
            </button>
          );
        })}
      </div>

      {/* Content Section */}
      {isLoading ? (
        <div style={{ padding: '80px', textAlign: 'center', color: '#94a3b8' }}>Loading restaurant partners...</div>
      ) : restaurants.length === 0 ? (
        <div className="premium-card" style={{ padding: '60px', textAlign: 'center', background: '#ffffff' }}>
          <Store size={40} style={{ color: '#cbd5e1', margin: '0 auto 12px' }} />
          <h3 style={{ fontWeight: 900, fontSize: '18px', color: '#0f172a' }}>No restaurants found</h3>
          <p style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}>
            There are currently no stores matching filter: <strong>{statusLabel[status]}</strong>.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {restaurants.map((r: any) => (
            <div key={r.id} className="premium-card" style={{ padding: '24px', background: '#ffffff' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: '20px' }}>
                
                {/* Left Info Column */}
                <div style={{ display: 'flex', gap: '16px', flex: 1, minWidth: '260px' }}>
                  {r.logo_url ? (
                    <img src={r.logo_url} alt={r.name} style={{ width: '56px', height: '56px', borderRadius: '16px', objectFit: 'cover', border: '1px solid #e2e8f0', flexShrink: 0 }} />
                  ) : (
                    <div style={{
                      width: '56px', height: '56px', borderRadius: '16px',
                      background: 'linear-gradient(135deg, #10b981, #059669)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#ffffff', flexShrink: 0,
                    }}>
                      <Store size={26} />
                    </div>
                  )}

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <h3 style={{ fontWeight: 900, fontSize: '18px', color: '#0f172a' }}>{r.name}</h3>
                      <span className={`badge ${
                        r.status === 'approved' ? 'badge-emerald' :
                        r.status === 'pending_approval' ? 'badge-amber' :
                        'badge-red'
                      }`}>
                        {r.status?.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>

                    <p style={{ fontSize: '13px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '8px' }}>
                      <MapPin size={14} style={{ color: '#10b981' }} />
                      {r.address ?? r.city ?? 'Freetown, Sierra Leone'}
                    </p>

                    {r.description && (
                      <p style={{ fontSize: '13px', color: '#475569', fontStyle: 'italic', marginBottom: '8px' }}>
                        &quot;{r.description}&quot;
                      </p>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px', color: '#64748b', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 700, color: '#0f172a' }}>
                        👤 Owner: {r.owner?.first_name} {r.owner?.last_name}
                      </span>
                      <span>•</span>
                      <a href={`mailto:${r.owner?.email}`} style={{ color: '#059669', textDecoration: 'none', fontWeight: 600 }}>
                        ✉️ {r.owner?.email}
                      </a>
                      <span>•</span>
                      <span>Joined {formatTimeAgo(r.created_at)}</span>
                    </div>
                  </div>
                </div>

                {/* Right Action Buttons */}
                <div style={{ display: 'flex', gap: '8px', flexShrink: 0, flexWrap: 'wrap', alignItems: 'center' }}>
                  {(r.status === 'pending' || r.status === 'pending_approval') && (
                    <>
                      <button
                        onClick={() => approve(r.id)}
                        className="btn-primary"
                        style={{ padding: '10px 20px', fontSize: '13px', borderRadius: '12px' }}
                      >
                        <CheckCircle2 size={16} /> Approve Store
                      </button>

                      <button
                        onClick={() => setRejectingId(rejectingId === r.id ? null : r.id)}
                        style={{
                          padding: '10px 18px', borderRadius: '12px', fontSize: '13px', fontWeight: 800,
                          background: '#fef2f2', border: '1px solid #fca5a5', color: '#dc2626',
                          cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s',
                          display: 'inline-flex', alignItems: 'center', gap: '6px',
                        }}
                      >
                        <XCircle size={16} /> Reject
                      </button>
                    </>
                  )}

                  {r.status === 'approved' && (
                    <span style={{ fontSize: '12px', color: '#047857', fontWeight: 800, background: '#ecfdf5', padding: '8px 14px', borderRadius: '12px', border: '1px solid #a7f3d0' }}>
                      ✅ Active Store
                    </span>
                  )}
                </div>
              </div>

              {/* Reject Reason Form Box */}
              {rejectingId === r.id && (
                <div style={{
                  marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #fee2e2',
                  background: '#fef2f2', padding: '16px', borderRadius: '14px',
                }}>
                  <p style={{ fontSize: '13px', fontWeight: 800, color: '#991b1b', marginBottom: '8px' }}>
                    Reason for rejecting {r.name}:
                  </p>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <input
                      type="text"
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder="e.g. Invalid business document or address details..."
                      className="input-field"
                      style={{ flex: 1, fontSize: '13px', padding: '8px 14px' }}
                    />
                    <button
                      onClick={() => reject(r.id)}
                      style={{
                        padding: '8px 18px', borderRadius: '12px', background: '#dc2626',
                        color: '#fff', fontWeight: 800, fontSize: '13px', border: 'none', cursor: 'pointer',
                      }}
                    >
                      Confirm Reject
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
