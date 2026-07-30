'use client';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Map, List, User, LogOut, Navigation, Zap } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { authApi } from '@/lib/api';
import toast from 'react-hot-toast';

const NAV = [
  { href: '/rider', label: 'Deliveries', icon: List, exact: true },
  { href: '/rider/map', label: 'Live Map', icon: Map },
  { href: '/rider/account', label: 'Rider Profile', icon: User },
];

export default function RiderLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, logout, _hasHydrated } = useAuthStore();

  useEffect(() => {
    if (!_hasHydrated) return;
    if (!isAuthenticated) { router.push('/login'); return; }
    if (user?.role !== 'rider') { router.push('/home'); }
  }, [isAuthenticated, user, _hasHydrated]);

  const handleLogout = async () => {
    try { await authApi.logout(); } catch {}
    logout();
    router.push('/');
    toast.success('Signed out 👋');
  };

  const isActive = (href: string, exact?: boolean) => exact ? pathname === href : pathname.startsWith(href);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#f8fafc', color: '#0f172a' }}>

      {/* Modern Midnight Rider Header */}
      <header style={{
        background: '#0b132b', color: '#ffffff', padding: '16px 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 50, borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '38px', height: '38px', borderRadius: '12px',
            background: 'linear-gradient(135deg, #10b981, #059669)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 900, fontSize: '14px', color: '#fff',
            boxShadow: '0 0 16px rgba(16, 185, 129, 0.4)',
          }}>
            🛵
          </div>
          <div>
            <span style={{ fontWeight: 900, fontSize: '18px', color: '#ffffff', lineHeight: 1, display: 'block' }}>
              CLMStore Rider
            </span>
            <span style={{ fontSize: '10px', fontWeight: 800, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Freetown Fleet 🇸🇱
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '13px', fontWeight: 800, color: '#ffffff' }}>{user?.first_name} {user?.last_name}</p>
            <p style={{ fontSize: '10px', color: '#94a3b8' }}>{user?.phone_number ?? 'Active Rider'}</p>
          </div>
          <button
            onClick={handleLogout}
            style={{
              background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#ef4444', padding: '8px', borderRadius: '10px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s',
            }}
          >
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {/* Main Content Body */}
      <main style={{ flex: 1, padding: '24px', maxWidth: '720px', width: '100%', margin: '0 auto' }} className="pb-28">
        {children}
      </main>

      {/* Fixed Bottom Navigation Dock */}
      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 40,
        background: '#ffffff', borderTop: '1px solid #e2e8f0',
        display: 'flex', padding: '8px 0', boxShadow: '0 -4px 20px rgba(0,0,0,0.06)',
      }}>
        {NAV.map(({ href, label, icon: Icon, exact }) => {
          const active = isActive(href, exact);
          return (
            <Link
              key={href}
              href={href}
              style={{
                flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                textDecoration: 'none', fontSize: '11px', fontWeight: active ? 900 : 600,
                color: active ? '#10b981' : '#64748b', transition: 'all 0.2s',
              }}
            >
              <Icon size={20} style={{ color: active ? '#10b981' : '#64748b' }} />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
