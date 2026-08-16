'use client';
import Link from 'next/link';
import { Mail, Phone, MapPin, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{
      background: '#0b132b', color: '#ffffff',
      borderTop: '1px solid rgba(255, 255, 255, 0.08)',
      marginTop: 'auto', position: 'relative', overflow: 'hidden',
    }}>
      {/* Background Accent Glow */}
      <div style={{
        position: 'absolute', bottom: '-100px', left: '50%', transform: 'translateX(-50%)',
        width: '600px', height: '300px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(16, 185, 129, 0.12) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div className="container-page" style={{ padding: '56px 24px 32px', position: 'relative', zIndex: 10 }}>
        
        {/* 4 Organized Columns */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '40px', marginBottom: '48px',
        }}>
          {/* Col 1: Brand & Contact */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{
                width: '38px', height: '38px', borderRadius: '12px',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 900, fontSize: '13px', color: '#ffffff',
                boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)',
              }}>CL</div>
              <div>
                <span style={{ fontWeight: 900, fontSize: '20px', color: '#ffffff', letterSpacing: '-0.02em', lineHeight: 1 }}>
                  CLM<span className="gradient-emerald">Store</span>
                </span>
                <span style={{ display: 'block', fontSize: '9px', fontWeight: 800, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Sierra Leone 🇸🇱
                </span>
              </div>
            </div>

            <p style={{ color: '#94a3b8', fontSize: '13px', lineHeight: 1.7, marginBottom: '20px' }}>
              Sierra Leone&apos;s premier on-demand delivery platform. Fresh meals, snacks, and daily groceries delivered fast across Freetown.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', color: '#e2e8f0' }}>
              <a href="tel:+23272224080" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#e2e8f0', textDecoration: 'none' }}>
                <Phone size={14} style={{ color: '#10b981' }} /> +232 72 224 080
              </a>
              <a href="mailto:salieu345@gmail.com" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#e2e8f0', textDecoration: 'none' }}>
                <Mail size={14} style={{ color: '#10b981' }} /> salieu345@gmail.com
              </a>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#cbd5e1' }}>
                <MapPin size={14} style={{ color: '#f59e0b' }} /> Freetown, Sierra Leone
              </div>
            </div>
          </div>

          {/* Col 2: Explore Food */}
          <div>
            <h4 style={{ color: '#ffffff', fontWeight: 800, fontSize: '14px', marginBottom: '16px', letterSpacing: '0.02em' }}>
              Explore Food & Stores
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
              <li><Link href="/restaurants" style={{ color: '#cbd5e1', textDecoration: 'none', transition: 'color 0.2s' }}>All Restaurants</Link></li>
              <li><Link href="/restaurants?store_type=grocery" style={{ color: '#cbd5e1', textDecoration: 'none', transition: 'color 0.2s' }}>Grocery Stores</Link></li>
              <li><Link href="/restaurants?featured=true" style={{ color: '#cbd5e1', textDecoration: 'none', transition: 'color 0.2s' }}>Featured Spots ⭐</Link></li>
              <li><Link href="/restaurants?q=Jollof" style={{ color: '#cbd5e1', textDecoration: 'none', transition: 'color 0.2s' }}>Jollof Rice & Local Dishes</Link></li>
            </ul>
          </div>

          {/* Col 3: Account & Ecosystem */}
          <div>
            <h4 style={{ color: '#ffffff', fontWeight: 800, fontSize: '14px', marginBottom: '16px', letterSpacing: '0.02em' }}>
              Join Ecosystem
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
              <li><Link href="/login" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Customer Sign In</Link></li>
              <li><Link href="/register" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Create Account</Link></li>
              <li><Link href="/register" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Become a Delivery Rider 🛵</Link></li>
              <li><Link href="/register" style={{ color: '#cbd5e1', textDecoration: 'none' }}>List Your Restaurant 🏪</Link></li>
              <li><Link href="/orders" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Track My Orders</Link></li>
            </ul>
          </div>

          {/* Col 4: Payments & Security */}
          <div>
            <h4 style={{ color: '#ffffff', fontWeight: 800, fontSize: '14px', marginBottom: '16px', letterSpacing: '0.02em' }}>
              Payment Methods
            </h4>
            <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '12px' }}>
              Supported mobile money & payment options across Freetown:
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '20px' }}>
              {[
                { name: 'Orange Money', color: '#f97316' },
                { name: 'Afrimoney', color: '#10b981' },
                { name: 'Visa / Mastercard', color: '#3b82f6' },
                { name: 'Cash on Delivery', color: '#f59e0b' },
              ].map((p) => (
                <span key={p.name} style={{
                  fontSize: '11px', fontWeight: 800, padding: '4px 10px', borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: p.color,
                }}>{p.name}</span>
              ))}
            </div>
            <p style={{ fontSize: '11px', color: '#64748b' }}>
              🔒 100% Encrypted & Safe Payments
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          paddingTop: '24px', display: 'flex', flexWrap: 'wrap',
          alignItems: 'center', justifyContent: 'space-between',
          gap: '12px', fontSize: '12px', color: '#94a3b8',
        }}>
          <p>© {new Date().getFullYear()} RestoLink · Built with <Heart size={12} style={{ color: '#ef4444', display: 'inline', margin: '0 2px' }} /> for Sierra Leone 🇸🇱</p>
          <div style={{ display: 'flex', gap: '20px' }}>
            <Link href="/" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Privacy Policy</Link>
            <Link href="/" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
