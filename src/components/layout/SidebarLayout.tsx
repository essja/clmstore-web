'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home, Compass, ClipboardList, User, ShoppingCart, Bell,
  MapPin, Search, LogOut, ChevronRight
} from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { useCartStore } from '@/store/cart';
import { useThemeStore } from '@/store/theme';
import Navbar from '@/components/layout/Navbar';
import ThemeSwitcher from '@/components/theme/ThemeSwitcher';
import { authApi } from '@/lib/api';
import toast from 'react-hot-toast';

export default function SidebarLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuthStore();
  const itemCount = useCartStore((s) => s.itemCount());
  const { theme, layout } = useThemeStore();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const handleLogout = async () => {
    try { await authApi.logout(); } catch { /* ignore */ }
    logout();
    router.push('/');
    toast.success('Logged out 👋');
  };

  const navItems = [
    { href: '/home', label: 'Home', icon: Home },
    { href: '/restaurants', label: 'Explore Places', icon: Compass },
    { href: '/orders', label: 'My Orders', icon: ClipboardList },
    { href: '/account', label: 'Account & Settings', icon: User },
  ];

  // If user selected 'topbar' layout mode:
  if (layout === 'topbar') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg-primary)' }}>
        <Navbar />
        <main style={{ flex: 1 }}>{children}</main>
        <ThemeSwitcher />
      </div>
    );
  }

  // Otherwise, user selected 'sidebar' layout mode:
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>

      {/* ── LEFT FIXED SIDEBAR ── */}
      <aside className="desktop-sidebar responsive-sidebar" style={{
        width: '260px', flexShrink: 0, background: '#0b132b', color: '#fff',
        position: 'fixed', top: 0, bottom: 0, left: 0, zIndex: 40,
        flexDirection: 'column', justifyContent: 'space-between',
        padding: '24px 16px', borderRight: '1px solid rgba(255,255,255,0.08)',
      }}>
        <div>
          {/* Brand Logo */}
          <Link href="/home" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none', marginBottom: '32px', padding: '0 8px' }}>
            <div style={{
              width: '42px', height: '42px', borderRadius: '14px',
              background: 'linear-gradient(135deg, #2563EB, #10B981)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 900, fontSize: '15px', color: '#fff',
              boxShadow: '0 0 20px rgba(37, 99, 235, 0.4)',
            }}>RL</div>
            <div>
              <span style={{ fontWeight: 900, fontSize: '20px', color: '#fff', letterSpacing: '-0.02em', display: 'block', lineHeight: 1 }}>
                RestoLink
              </span>
              <span style={{ fontSize: '10px', fontWeight: 800, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Sierra Leone 🇸🇱
              </span>
            </div>
          </Link>

          {/* Location Badge */}
          <div style={{
            background: 'rgba(255,255,255,0.06)', borderRadius: '14px', padding: '10px 12px',
            marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px',
            border: '1px solid rgba(255,255,255,0.1)',
          }}>
            <MapPin size={16} style={{ color: '#10b981', flexShrink: 0 }} />
            <div style={{ overflow: 'hidden' }}>
              <p style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>Delivering to</p>
              <p style={{ fontSize: '12px', fontWeight: 800, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Freetown, SL</p>
            </div>
          </div>

          {/* Navigation Links */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {navItems.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href || (href !== '/home' && pathname.startsWith(href));
              return (
                <Link key={href} href={href} style={{
                  display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px',
                  borderRadius: '14px', textDecoration: 'none', fontSize: '14px', fontWeight: isActive ? 800 : 600,
                  transition: 'all 0.2s',
                  background: isActive ? 'linear-gradient(135deg, #10b981, #059669)' : 'transparent',
                  color: isActive ? '#ffffff' : '#94a3b8',
                  boxShadow: isActive ? '0 4px 16px rgba(16, 185, 129, 0.35)' : 'none',
                }}>
                  <Icon size={18} />
                  <span>{label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Sidebar Cart Widget */}
        <div>
          {itemCount > 0 && (
            <Link href="/cart" style={{ textDecoration: 'none' }}>
              <div style={{
                background: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(16,185,129,0.05))',
                border: '1px solid rgba(16,185,129,0.3)', borderRadius: '16px',
                padding: '14px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px',
              }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '10px', background: '#10b981',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
                }}>
                  <ShoppingCart size={18} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '12px', fontWeight: 800, color: '#fff' }}>{itemCount} items</p>
                  <p style={{ fontSize: '11px', color: '#4ade80' }}>View Cart →</p>
                </div>
              </div>
            </Link>
          )}

          {/* User Profile */}
          {isAuthenticated ? (
            <div style={{
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '16px', padding: '12px', display: 'flex', alignItems: 'center', gap: '10px',
            }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '50%', background: '#10b981',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 900, fontSize: '13px', color: '#fff', flexShrink: 0,
              }}>
                {user?.first_name?.[0]}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '13px', fontWeight: 800, color: '#fff' }} className="line-clamp-1">{user?.first_name}</p>
                <p style={{ fontSize: '10px', color: '#94a3b8' }} className="line-clamp-1">{user?.email}</p>
              </div>
              <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}>
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <Link href="/login" className="btn-primary" style={{ width: '100%', padding: '12px', fontSize: '13px', textDecoration: 'none' }}>
              Sign In
            </Link>
          )}
        </div>
      </aside>

      {/* ── MAIN CONTENT AREA ── */}
      <div className="main-content-offset" style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>

        {/* Top Header */}
        <header style={{
          position: 'sticky', top: 0, zIndex: 30,
          background: 'var(--nav-bg)', backdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--border-card)', padding: '12px 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px',
        }}>

          {/* Search Bar */}
          <div style={{ flex: 1, maxWidth: '500px' }}>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="search"
                placeholder="Search food, restaurants, groceries..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const q = (e.target as HTMLInputElement).value.trim();
                    if (q) router.push(`/restaurants?q=${encodeURIComponent(q)}`);
                  }
                }}
                className="input-field"
                style={{ paddingLeft: '44px', fontSize: '13px', padding: '10px 16px 10px 44px' }}
              />
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Link href="/cart" style={{
              position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '40px', height: '40px', borderRadius: '12px',
              textDecoration: 'none', color: 'var(--text-main)', background: 'var(--bg-card)',
              border: '1.5px solid var(--border-card)',
            }}>
              <ShoppingCart size={18} />
              {itemCount > 0 && (
                <span style={{
                  position: 'absolute', top: '-4px', right: '-4px',
                  background: '#22c55e', color: '#fff', fontSize: '10px', fontWeight: 900,
                  borderRadius: '99px', minWidth: '18px', height: '18px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px',
                }}>{itemCount}</span>
              )}
            </Link>

            <Link href="/account" style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '40px', height: '40px', borderRadius: '12px',
              textDecoration: 'none', color: 'var(--text-main)', background: 'var(--bg-card)',
              border: '1.5px solid var(--border-card)',
            }}>
              <Bell size={18} />
            </Link>
          </div>
        </header>

        {/* Children */}
        <main style={{ flex: 1 }}>
          {children}
        </main>
      </div>

      <ThemeSwitcher />

      <style>{`
        @media (min-width: 992px) {
          .desktop-sidebar { display: flex !important; }
          .main-content-offset { margin-left: 260px !important; }
        }
        @media (max-width: 991px) {
          .desktop-sidebar { display: none !important; }
          .main-content-offset { margin-left: 0 !important; }
        }
      `}</style>
    </div>
  );
}
