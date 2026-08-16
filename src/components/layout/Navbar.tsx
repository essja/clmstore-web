'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ShoppingCart, Bell, User, MapPin, Home, Search, ClipboardList } from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '@/store/auth';
import { useCartStore } from '@/store/cart';
import { authApi } from '@/lib/api';
import toast from 'react-hot-toast';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuthStore();
  const itemCount = useCartStore((s) => s.itemCount());
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = async () => {
    try { await authApi.logout(); } catch { /* ignore */ }
    logout();
    router.push('/');
    toast.success('See you soon! 👋');
  };

  const navLinks = [
    { href: '/home', label: 'Home', icon: <Home size={20} /> },
    { href: '/restaurants', label: 'Explore', icon: <Search size={20} /> },
    { href: '/orders', label: 'Orders', icon: <ClipboardList size={20} /> },
    { href: '/account', label: 'Account', icon: <User size={20} /> },
  ];

  return (
    <>
      {/* ── Top Navbar ── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(255, 255, 255, 0.94)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid #E2E8F0',
        boxShadow: '0 4px 20px rgba(15, 23, 42, 0.03)',
      }}>
        <div style={{
          maxWidth: '1280px', margin: '0 auto',
          padding: '0 20px', height: '68px',
          display: 'flex', alignItems: 'center', gap: '16px',
        }}>
          {/* Brand Logo */}
          <Link href="/home" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', flexShrink: 0 }}>
            <div style={{
              width: '38px', height: '38px', borderRadius: '12px',
              background: 'linear-gradient(135deg, #2563EB, #10B981)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)',
            }}>
              <span style={{ color: '#fff', fontWeight: 900, fontSize: '13px' }}>RL</span>
            </div>
            <div>
              <span style={{ fontWeight: 900, fontSize: '20px', color: '#0F172A', letterSpacing: '-0.02em', lineHeight: 1 }}>
                Resto<span className="gradient-emerald">Link</span>
              </span>
              <span style={{ display: 'block', fontSize: '9px', fontWeight: 800, color: '#10B981', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Freetown SL 🇸🇱
              </span>
            </div>
          </Link>

          {/* Location Badge */}
          <button style={{
            display: 'none', alignItems: 'center', gap: '6px',
            background: '#DCFCE7', border: '1px solid #BBF7D0',
            borderRadius: '99px', padding: '6px 16px',
            fontSize: '13px', color: '#15803D', cursor: 'pointer',
            fontFamily: 'inherit', fontWeight: 700,
          }} className="nav-location-pill">
            <MapPin size={14} style={{ color: '#1B8C4E' }} />
            Freetown, SL
          </button>

          {/* Search bar */}
          <div style={{ flex: 1, maxWidth: '420px', display: 'none' }} className="nav-search">
            <div style={{ position: 'relative' }}>
              <Search size={15} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
              <input
                type="search"
                placeholder="Search restaurants, jollof, groceries..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const q = (e.target as HTMLInputElement).value.trim();
                    if (q) router.push(`/restaurants?q=${encodeURIComponent(q)}`);
                  }
                }}
                className="input-field"
                style={{
                  paddingLeft: '42px', paddingRight: '16px',
                  paddingTop: '10px', paddingBottom: '10px',
                  fontSize: '13px', background: '#F8FAFC',
                }}
              />
            </div>
          </div>

          <div style={{ flex: 1 }} />

          {/* Right actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>

            {/* Cart Button */}
            <Link href="/cart" style={{
              position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '42px', height: '42px', borderRadius: '14px',
              textDecoration: 'none', color: '#0F172A', background: '#F8FAFC',
              border: '1.5px solid #E2E8F0', transition: 'all 0.2s',
            }}>
              <ShoppingCart size={19} />
              {itemCount > 0 && (
                <span style={{
                  position: 'absolute', top: '-4px', right: '-4px',
                  background: 'linear-gradient(135deg, #1B8C4E, #146c3b)',
                  color: '#fff', fontSize: '10px', fontWeight: 900,
                  borderRadius: '99px', minWidth: '18px', height: '18px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: '0 4px', boxShadow: '0 2px 8px rgba(27, 140, 78, 0.4)',
                }}>
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <>
                <Link href="/account" style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: '42px', height: '42px', borderRadius: '14px',
                  textDecoration: 'none', color: '#0F172A', background: '#F8FAFC',
                  border: '1.5px solid #E2E8F0',
                }}>
                  <Bell size={19} />
                </Link>

                {/* Avatar dropdown */}
                <div style={{ position: 'relative' }}>
                  <button onClick={() => setProfileOpen(!profileOpen)} style={{
                    width: '40px', height: '40px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, #1B8C4E, #146c3b)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '2px solid #ffffff', cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(27, 140, 78, 0.3)', overflow: 'hidden',
                  }}>
                    {user?.profile_picture
                      ? <img src={user.profile_picture} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                      : <span style={{ color: '#fff', fontWeight: 900, fontSize: '14px' }}>{user?.first_name?.[0]}</span>
                    }
                  </button>

                  {profileOpen && (
                    <>
                      <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={() => setProfileOpen(false)} />
                      <div style={{
                        position: 'absolute', right: 0, top: 'calc(100% + 10px)',
                        width: '230px', background: '#FFFFFF', borderRadius: '20px',
                        boxShadow: '0 16px 48px rgba(15, 23, 42, 0.12)', border: '1px solid #E2E8F0',
                        zIndex: 50, overflow: 'hidden',
                      }}>
                        <div style={{ padding: '16px', borderBottom: '1px solid #E2E8F0', background: '#F8FAFC' }}>
                          <p style={{ fontWeight: 800, fontSize: '14px', color: '#0F172A' }}>{user?.first_name} {user?.last_name}</p>
                          <p style={{ fontSize: '12px', color: '#64748B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</p>
                        </div>
                        {[
                          { href: '/account', label: '👤 My Account' },
                          { href: '/orders', label: '📦 My Orders' },
                          ...(user?.role === 'restaurant_owner' ? [{ href: '/dashboard', label: '📊 Restaurant Dashboard' }] : []),
                          ...(user?.role === 'admin' || user?.role === 'super_admin' ? [{ href: '/admin', label: '🛡️ Admin Panel' }] : []),
                          ...(user?.role === 'rider' ? [{ href: '/rider', label: '🛵 Rider App' }] : []),
                        ].map((item) => (
                          <Link key={item.href} href={item.href} onClick={() => setProfileOpen(false)} style={{
                            display: 'flex', alignItems: 'center', padding: '12px 16px',
                            fontSize: '13px', color: '#334155', textDecoration: 'none', fontWeight: 600,
                            transition: 'background 0.15s',
                          }}
                            onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.background = '#F8FAFC'}
                            onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.background = 'transparent'}
                          >{item.label}</Link>
                        ))}
                        <div style={{ height: '1px', background: '#E2E8F0', margin: '4px 0' }} />
                        <button onClick={handleLogout} style={{
                          width: '100%', textAlign: 'left', padding: '12px 16px',
                          fontSize: '13px', color: '#EF4444', background: 'none', fontWeight: 600,
                          border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                          transition: 'background 0.15s',
                        }}
                          onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = '#FEF2F2'}
                          onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'transparent'}
                        >🚪 Sign Out</button>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <div style={{ display: 'flex', gap: '8px' }}>
                <Link href="/login" style={{
                  padding: '8px 16px', fontSize: '13px', fontWeight: 700,
                  color: '#0F172A', textDecoration: 'none', borderRadius: '14px',
                  border: '1.5px solid #E2E8F0', background: '#F8FAFC',
                }}>Sign In</Link>
                <Link href="/register" className="btn-primary" style={{
                  padding: '8px 18px', fontSize: '13px', borderRadius: '14px',
                }}>Sign Up</Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── Bottom Nav (Mobile) ── */}
      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
        background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid #E2E8F0',
        display: 'flex', padding: '8px 0 max(8px, env(safe-area-inset-bottom))',
        boxShadow: '0 -4px 20px rgba(0,0,0,0.04)',
      }} className="bottom-nav-visible">
        {navLinks.map((link) => {
          const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
          const isCart = link.href === '/cart';
          return isCart ? (
            <Link key={link.href} href="/cart" style={{
              flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
              gap: '3px', textDecoration: 'none', padding: '0 4px',
            }}>
              <div style={{
                width: '46px', height: '46px', borderRadius: '16px',
                background: 'linear-gradient(135deg, #1B8C4E, #146c3b)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                position: 'relative', boxShadow: '0 4px 16px rgba(27, 140, 78, 0.4)',
                marginTop: '-22px',
              }}>
                <ShoppingCart size={20} color="#fff" />
                {itemCount > 0 && (
                  <span style={{
                    position: 'absolute', top: '-4px', right: '-4px',
                    background: '#FF6B00', color: '#fff', fontSize: '10px', fontWeight: 900,
                    borderRadius: '99px', minWidth: '16px', height: '16px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 3px',
                  }}>{itemCount > 9 ? '9+' : itemCount}</span>
                )}
              </div>
              <span style={{ fontSize: '10px', fontWeight: 800, color: '#1B8C4E' }}>Cart</span>
            </Link>
          ) : (
            <Link key={link.href} href={link.href} style={{
              flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
              gap: '4px', textDecoration: 'none', padding: '4px',
              color: isActive ? '#1B8C4E' : '#94A3B8', transition: 'color 0.2s',
            }}>
              {link.icon}
              <span style={{ fontSize: '10px', fontWeight: isActive ? 800 : 500 }}>{link.label}</span>
              {isActive && <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#1B8C4E' }} />}
            </Link>
          );
        })}
      </nav>

      <style>{`
        @media (min-width: 768px) {
          .nav-location-pill { display: flex !important; }
          .nav-search { display: block !important; }
          .bottom-nav-visible { display: none !important; }
        }
      `}</style>
    </>
  );
}
