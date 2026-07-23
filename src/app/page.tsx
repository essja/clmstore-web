'use client';
import Link from 'next/link';
import { ShoppingBag, Bike, Store, MapPin, Clock, Star, ChevronRight, Zap, ShieldCheck, CheckCircle2 } from 'lucide-react';
import Footer from '@/components/layout/Footer';

const features = [
  { icon: '⚡', title: '30-Min Lightning Delivery', desc: 'Average delivery time across Freetown' },
  { icon: '🍽️', title: '100+ Top Restaurants', desc: 'Sierra Leonean & international spots' },
  { icon: '🔒', title: 'Secure Local Payment', desc: 'Orange Money, Afrimoney & Cash' },
];

const stats = [
  { value: '10K+', label: 'Happy Customers' },
  { value: '100+', label: 'Restaurants' },
  { value: '500+', label: 'Riders' },
  { value: '4.9★', label: 'App Rating' },
];

const steps = [
  { step: '01', title: 'Browse & Choose', desc: 'Select from hundreds of local food spots in Freetown.' },
  { step: '02', title: 'Order & Pay', desc: 'Pay safely via Mobile Money (Orange/Afrimoney) or Cash.' },
  { step: '03', title: 'Live Delivery', desc: 'Track your rider live on the map from kitchen to your door.' },
];

export default function LandingPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', color: '#0f172a', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

      {/* Top Banner Accent */}
      <div style={{
        background: 'linear-gradient(90deg, #10b981 0%, #059669 50%, #f59e0b 100%)',
        height: '4px', width: '100%',
      }} />

      {/* Navbar */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50, padding: '16px 24px',
        background: 'rgba(255, 255, 255, 0.94)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid #e2e8f0',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '38px', height: '38px', borderRadius: '12px',
            background: 'linear-gradient(135deg, #10b981, #059669)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 900, fontSize: '14px', color: '#ffffff',
            boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)',
          }}>CL</div>
          <div>
            <span style={{ fontWeight: 900, fontSize: '20px', color: '#0f172a', letterSpacing: '-0.02em', lineHeight: 1 }}>
              CLM<span className="gradient-emerald">Store</span>
            </span>
            <span style={{ display: 'block', fontSize: '9px', fontWeight: 800, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Sierra Leone 🇸🇱
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Link href="/login" style={{
            padding: '8px 18px', borderRadius: '14px', fontSize: '13px', fontWeight: 700,
            color: '#475569', textDecoration: 'none', transition: 'color 0.2s',
          }}>Sign In</Link>
          <Link href="/register" className="btn-primary" style={{
            padding: '8px 20px', borderRadius: '14px', fontSize: '13px',
          }}>Get Started</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{ padding: '64px 24px 48px', textAlign: 'center', position: 'relative' }}>
        
        {/* Country Badge */}
        <div className="animate-fade-up" style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          background: '#ecfdf5', border: '1px solid #a7f3d0',
          borderRadius: '99px', padding: '6px 18px', marginBottom: '24px',
          fontSize: '12px', fontWeight: 800, color: '#047857',
        }}>
          🇸🇱 Sierra Leone&apos;s #1 On-Demand Delivery Network
        </div>

        <h1 className="animate-fade-up delay-100" style={{
          fontSize: 'clamp(2.5rem, 7.5vw, 4.8rem)', fontWeight: 900,
          color: '#0f172a', maxWidth: '820px', margin: '0 auto 20px',
          lineHeight: 1.1, letterSpacing: '-0.03em',
        }}>
          Everything You Love, Delivered <span className="gradient-emerald">Fast Across Freetown.</span>
        </h1>

        <p className="animate-fade-up delay-200" style={{
          color: '#475569', fontSize: 'clamp(1rem, 2.5vw, 1.2rem)',
          maxWidth: '560px', margin: '0 auto 40px', lineHeight: 1.7, fontWeight: 500,
        }}>
          Order hot meals, groceries, and daily essentials from Freetown&apos;s best vendors. Real-time live GPS tracking from kitchen to door.
        </p>

        <div className="animate-fade-up delay-300" style={{
          display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap',
          marginBottom: '56px',
        }}>
          <Link href="/home" className="btn-primary" style={{ fontSize: '16px', padding: '16px 36px' }}>
            <ShoppingBag size={18} /> Explore Restaurants
          </Link>
          <Link href="/register" className="btn-secondary" style={{ fontSize: '16px', padding: '16px 36px' }}>
            Create Account <ChevronRight size={16} />
          </Link>
        </div>

        {/* HIGH CONTRAST Stats Grid (Bright white cards with dark high contrast text) */}
        <div className="animate-fade-up delay-400" style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '16px', maxWidth: '720px', margin: '0 auto 60px',
        }}>
          {stats.map((s) => (
            <div key={s.label} className="premium-card" style={{ padding: '24px 16px', textAlign: 'center', background: '#ffffff' }}>
              <div style={{ fontSize: 'clamp(1.6rem, 4vw, 2.2rem)', fontWeight: 900, color: '#0f172a', lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: '12px', color: '#047857', fontWeight: 800, marginTop: '6px' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Strip */}
      <section style={{ padding: '0 24px 64px', maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '18px' }}>
          {features.map((f) => (
            <div key={f.title} className="premium-card" style={{
              padding: '28px', display: 'flex', alignItems: 'center', gap: '18px', background: '#ffffff',
            }}>
              <span style={{ fontSize: '2.4rem' }}>{f.icon}</span>
              <div>
                <div style={{ fontWeight: 800, fontSize: '16px', color: '#0f172a' }}>{f.title}</div>
                <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px', lineHeight: 1.4 }}>{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How CLMStore Works (01, 02, 03) */}
      <section style={{ padding: '0 24px 80px', maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <span style={{ fontSize: '11px', fontWeight: 800, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Simple 3-Step Process</span>
          <h2 style={{ fontWeight: 900, fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', color: '#0f172a', marginTop: '4px' }}>
            How CLMStore Works
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
          {steps.map((st) => (
            <div key={st.step} className="premium-card" style={{ padding: '32px', position: 'relative', overflow: 'hidden' }}>
              <div style={{
                position: 'absolute', top: '16px', right: '20px',
                fontSize: '2.5rem', fontWeight: 900, color: '#e2e8f0', pointerEvents: 'none',
              }}>
                {st.step}
              </div>
              <h3 style={{ fontWeight: 900, fontSize: '20px', color: '#0f172a', marginBottom: '8px' }}>{st.title}</h3>
              <p style={{ color: '#64748b', fontSize: '14px', lineHeight: 1.6 }}>{st.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Role Cards ("Built for Everyone in Freetown") */}
      <section style={{ padding: '0 24px 80px', maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <span style={{ fontSize: '11px', fontWeight: 800, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Join CLMStore Network</span>
          <h2 style={{ fontWeight: 900, fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', color: '#0f172a', marginTop: '4px' }}>
            Built for Everyone in Freetown
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>

          {/* Customer */}
          <Link href="/home" style={{ textDecoration: 'none' }}>
            <div className="premium-card" style={{
              padding: '36px', cursor: 'pointer',
              background: '#ffffff', borderColor: '#a7f3d0',
              borderTop: '4px solid #10b981',
            }}>
              <div style={{
                width: '56px', height: '56px', borderRadius: '18px',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '20px', boxShadow: '0 8px 24px rgba(16, 185, 129, 0.35)',
              }}>
                <ShoppingBag size={26} color="#fff" />
              </div>
              <div style={{ fontWeight: 900, fontSize: '22px', marginBottom: '8px', color: '#0f172a' }}>Order Food</div>
              <div style={{ color: '#475569', fontSize: '14px', lineHeight: 1.6 }}>
                Browse top local vendors, order food or groceries, and track your rider in real time.
              </div>
              <div style={{ marginTop: '24px', display: 'flex', alignItems: 'center', gap: '6px', color: '#059669', fontWeight: 800, fontSize: '14px' }}>
                Start ordering <ChevronRight size={16} />
              </div>
            </div>
          </Link>

          {/* Rider */}
          <Link href="/register" style={{ textDecoration: 'none' }}>
            <div className="premium-card" style={{
              padding: '36px', cursor: 'pointer',
              background: '#ffffff', borderColor: '#fde68a',
              borderTop: '4px solid #f59e0b',
            }}>
              <div style={{
                width: '56px', height: '56px', borderRadius: '18px',
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '20px', boxShadow: '0 8px 24px rgba(245, 158, 11, 0.35)',
              }}>
                <Bike size={26} color="#fff" />
              </div>
              <div style={{ fontWeight: 900, fontSize: '22px', marginBottom: '8px', color: '#0f172a' }}>Become a Rider</div>
              <div style={{ color: '#475569', fontSize: '14px', lineHeight: 1.6 }}>
                Earn great income delivering packages and meals across Freetown on your schedule.
              </div>
              <div style={{ marginTop: '24px', display: 'flex', alignItems: 'center', gap: '6px', color: '#d97706', fontWeight: 800, fontSize: '14px' }}>
                Join as Rider <ChevronRight size={16} />
              </div>
            </div>
          </Link>

          {/* Restaurant */}
          <Link href="/register" style={{ textDecoration: 'none' }}>
            <div className="premium-card" style={{
              padding: '36px', cursor: 'pointer',
              background: '#ffffff', borderColor: '#bae6fd',
              borderTop: '4px solid #0284c7',
            }}>
              <div style={{
                width: '56px', height: '56px', borderRadius: '18px',
                background: 'linear-gradient(135deg, #0284c7, #0369a1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '20px', boxShadow: '0 8px 24px rgba(2, 132, 199, 0.35)',
              }}>
                <Store size={26} color="#fff" />
              </div>
              <div style={{ fontWeight: 900, fontSize: '22px', marginBottom: '8px', color: '#0f172a' }}>List Your Store</div>
              <div style={{ color: '#475569', fontSize: '14px', lineHeight: 1.6 }}>
                Grow your restaurant sales by reaching thousands of hungry customers daily.
              </div>
              <div style={{ marginTop: '24px', display: 'flex', alignItems: 'center', gap: '6px', color: '#0284c7', fontWeight: 800, fontSize: '14px' }}>
                Partner with us <ChevronRight size={16} />
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
