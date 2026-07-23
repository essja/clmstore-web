'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, Search, Ban, CheckCircle2, Shield, UserCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import { adminApi } from '@/lib/api';
import { formatTimeAgo } from '@/lib/utils';
import toast from 'react-hot-toast';

const ROLES = ['', 'customer', 'restaurant_owner', 'rider', 'admin', 'super_admin'];

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const [role, setRole] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'users', role, search, page],
    queryFn: () => adminApi.getUsers({ role: role || undefined, search: search || undefined, page, limit: 20 }).then((r) => r.data),
  });

  const suspendMutation = useMutation({
    mutationFn: ({ userId, suspend }: { userId: string; suspend: boolean }) =>
      adminApi.suspendUser(userId, suspend),
    onSuccess: (_, { suspend }) => {
      toast.success(suspend ? 'User suspended 🚫' : 'User account un-suspended ✅');
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
    onError: () => toast.error('Failed to update user status'),
  });

  const users = data?.data ?? [];
  const pagination = data?.pagination;

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em' }}>
          User Accounts Directory 👥
        </h1>
        <p style={{ fontSize: '14px', color: '#64748b', marginTop: '2px' }}>
          Manage customers, riders, restaurant owners, and platform administrators
        </p>
      </div>

      {/* Filter Tabs + Search Row */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between',
        gap: '16px', marginBottom: '28px',
      }}>
        {/* Role Tabs */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {ROLES.map((r) => {
            const isActive = role === r;
            const label = r === '' ? 'All Users' : r.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) + 's';
            return (
              <button
                key={r}
                onClick={() => { setRole(r); setPage(1); }}
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

        {/* Search Input */}
        <div style={{ position: 'relative', minWidth: '260px' }}>
          <Search size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="search"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by name, email, phone..."
            className="input-field"
            style={{ paddingLeft: '44px', padding: '10px 16px 10px 44px', fontSize: '13px', background: '#ffffff' }}
          />
        </div>
      </div>

      {/* Users Table Card Container */}
      <div className="premium-card" style={{ overflow: 'hidden', background: '#ffffff' }}>
        {isLoading ? (
          <div style={{ padding: '80px', textAlign: 'center', color: '#94a3b8' }}>Loading users directory...</div>
        ) : users.length === 0 ? (
          <div style={{ padding: '80px', textAlign: 'center', color: '#64748b' }}>
            <Users size={40} style={{ color: '#cbd5e1', margin: '0 auto 12px' }} />
            <p style={{ fontWeight: 800, fontSize: '16px', color: '#0f172a' }}>No user accounts found</p>
            <p style={{ fontSize: '13px', marginTop: '4px' }}>Try adjusting your search query or filter tab.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', textTransform: 'uppercase', fontSize: '11px', fontWeight: 800, color: '#64748b', letterSpacing: '0.05em' }}>
                  <th style={{ padding: '14px 24px', textAlign: 'left' }}>User</th>
                  <th style={{ padding: '14px 24px', textAlign: 'left' }}>Email / Phone</th>
                  <th style={{ padding: '14px 24px', textAlign: 'left' }}>Role</th>
                  <th style={{ padding: '14px 24px', textAlign: 'left' }}>Status</th>
                  <th style={{ padding: '14px 24px', textAlign: 'left' }}>Joined</th>
                  <th style={{ padding: '14px 24px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u: any) => (
                  <tr key={u.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    
                    {/* User Profile */}
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '38px', height: '38px', borderRadius: '12px',
                          background: 'linear-gradient(135deg, #10b981, #059669)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontWeight: 900, color: '#ffffff', fontSize: '14px', flexShrink: 0,
                        }}>
                          {u.first_name?.[0] ?? 'U'}
                        </div>
                        <div>
                          <p style={{ fontWeight: 800, color: '#0f172a' }}>{u.first_name} {u.last_name}</p>
                          <p style={{ fontSize: '11px', color: '#94a3b8' }}>ID: #{String(u.id)}</p>
                        </div>
                      </div>
                    </td>

                    {/* Email & Phone */}
                    <td style={{ padding: '16px 24px' }}>
                      <p style={{ fontWeight: 600, color: '#334155' }}>{u.email}</p>
                      <p style={{ fontSize: '12px', color: '#64748b' }}>{u.phone ?? '—'}</p>
                    </td>

                    {/* Role Badge */}
                    <td style={{ padding: '16px 24px' }}>
                      <span className={`badge ${
                        u.role === 'super_admin' || u.role === 'admin'
                          ? 'badge-amber'
                          : u.role === 'restaurant_owner'
                            ? 'badge-cobalt'
                            : 'badge-emerald'
                      }`}>
                        {u.role.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td style={{ padding: '16px 24px' }}>
                      {u.is_suspended ? (
                        <span className="badge" style={{ background: '#fef2f2', color: '#ef4444', border: '1px solid #fca5a5' }}>
                          Suspended
                        </span>
                      ) : (
                        <span className="badge badge-emerald">
                          Active
                        </span>
                      )}
                    </td>

                    {/* Joined */}
                    <td style={{ padding: '16px 24px', color: '#64748b', fontSize: '13px' }}>
                      {formatTimeAgo(u.created_at)}
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                      {u.role !== 'super_admin' && (
                        <button
                          onClick={() => suspendMutation.mutate({ userId: u.id, suspend: !u.is_suspended })}
                          disabled={suspendMutation.isPending}
                          style={{
                            padding: '6px 14px', borderRadius: '10px', fontSize: '12px', fontWeight: 800,
                            cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s', border: 'none',
                            background: u.is_suspended ? '#ecfdf5' : '#fef2f2',
                            color: u.is_suspended ? '#047857' : '#dc2626',
                            borderStyle: 'solid', borderWidth: '1px',
                            borderColor: u.is_suspended ? '#a7f3d0' : '#fca5a5',
                          }}
                        >
                          {u.is_suspended ? 'Un-suspend ✅' : 'Suspend 🚫'}
                        </button>
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
              Page {pagination.page} of {pagination.total_pages} · {pagination.total} total users
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
