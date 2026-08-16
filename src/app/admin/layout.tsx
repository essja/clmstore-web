'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Users, Store, ShoppingBag, MessageSquare,
  BarChart3, LogOut, Tag, Wallet, Shield, MapPin
} from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { authApi } from '@/lib/api';
import toast from 'react-hot-toast';

const NAV = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard, exact: true },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { href: '/admin/restaurants', label: 'Restaurants', icon: Store },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/whatsapp', label: 'WhatsApp Bot', icon: MessageSquare },
  { href: '/admin/disputes', label: 'Disputes', icon: MessageSquare },
  { href: '/admin/withdrawals', label: 'Wallet', icon: Wallet },
  { href: '/admin/coupons', label: 'Coupons', icon: Tag },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout, _hasHydrated } = useAuthStore();

  useEffect(() => {
    if (!_hasHydrated) return;
    if (!isAuthenticated) { router.push('/login'); return; }
    if (user?.role !== 'admin' && user?.role !== 'super_admin') { router.push('/home'); }
  }, [isAuthenticated, user, _hasHydrated]);

  const handleLogout = async () => {
    try { await authApi.logout(); } catch {}
    logout();
    router.push('/');
    toast.success('Signed out 👋');
  };

  const isActive = (href: string, exact?: boolean) => exact ? pathname === href : pathname.startsWith(href);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc', color: '#0f172a' }}>

      {/* ── ADMIN SIDEBAR ── */}
      <aside style={{
        width: '260px', flexShrink: 0, background: '#0b132b', color: '#ffffff',
        flexDirection: 'column', justifyContent: 'space-between',
        padding: '24px 16px', borderRight: '1px solid rgba(255, 255, 255, 0.08)',
        position: 'sticky', top: 0, height: '100vh', zIndex: 40,
      }} className="responsive-sidebar">
        
        <div>
          {/* Brand Logo Header */}
          <Link href="/home" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none', marginBottom: '28px', padding: '0 8px' }}>
            <img src="/logo.jpg" alt="RestoLink Logo" style={{
              width: '40px', height: '40px', borderRadius: '12px',
              boxShadow: '0 0 16px rgba(37, 99, 235, 0.4)',
              objectFit: 'cover'
            }} />
            <div>
              <span style={{ fontWeight: 900, fontSize: '19px', color: '#ffffff', letterSpacing: '-0.02em', display: 'block', lineHeight: 1 }}>
                RestoLink
              </span>
              <span style={{ fontSize: '10px', fontWeight: 800, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Admin Console 🛡️
              </span>
            </div>
          </Link>

          {/* Navigation Items */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {NAV.map(({ href, label, icon: Icon, exact }) => {
              const active = isActive(href, exact);
              return (
                <Link
                  key={href}
                  href={href}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '12px 14px', borderRadius: '14px', textDecoration: 'none',
                    fontSize: '14px', fontWeight: active ? 800 : 600,
                    transition: 'all 0.2s ease',
                    background: active ? 'linear-gradient(135deg, #10b981, #059669)' : 'transparent',
                    color: active ? '#ffffff' : '#94a3b8',
                    boxShadow: active ? '0 4px 16px rgba(16, 185, 129, 0.35)' : 'none',
                  }}
                >
                  <Icon size={18} />
                  <span>{label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Footer Profile Card */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '16px', padding: '14px', marginTop: '16px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '12px',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 900, fontSize: '13px', color: '#fff', flexShrink: 0,
            }}>
              {user?.first_name?.[0] ?? 'A'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: '13px', fontWeight: 800, color: '#ffffff' }} className="line-clamp-1">
                {user?.first_name} {user?.last_name}
              </p>
              <p style={{ fontSize: '10px', color: '#10b981', fontWeight: 700, textTransform: 'capitalize' }}>
                {user?.role?.replace('_', ' ')}
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.25)',
              color: '#ef4444', fontWeight: 700, fontSize: '12px', padding: '8px',
              borderRadius: '10px', cursor: 'pointer', fontFamily: 'inherit',
              transition: 'all 0.2s',
            }}
          >
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT CONTAINER ── */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>

        {/* Mobile Header Bar */}
        <div style={{
          background: '#0b132b', color: '#ffffff', padding: '14px 20px',
          alignItems: 'center', justifyContent: 'space-between',
        }} className="mobile-only-flex">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
             <img src="/logo.jpg" alt="RestoLink Logo" style={{ width: '28px', height: '28px', borderRadius: '8px', objectFit: 'cover' }} />
            <span style={{ fontWeight: 900, fontSize: '16px' }}>RestoLink Admin</span>
          </div>
          <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
            <LogOut size={18} />
          </button>
        </div>

        {/* Page Body */}
        <main style={{ flex: 1, padding: '32px 28px', background: '#f8fafc' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
