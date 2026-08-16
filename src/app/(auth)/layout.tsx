'use client';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', position: 'relative', overflow: 'hidden', background: '#090d16' }}>

      {/* Glowing Neon Background Blobs */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', top: '-120px', left: '-120px',
          width: '500px', height: '500px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(34, 197, 94, 0.18) 0%, transparent 70%)',
        }} />
        <div style={{
          position: 'absolute', bottom: '-100px', right: '-100px',
          width: '500px', height: '500px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(249, 115, 22, 0.15) 0%, transparent 70%)',
        }} />
      </div>

      {/* Left panel — branding (hidden on mobile) */}
      <div style={{
        display: 'none', flex: '0 0 45%',
        background: 'rgba(17, 24, 39, 0.5)',
        backdropFilter: 'blur(20px)',
        borderRight: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '48px', flexDirection: 'column', justifyContent: 'space-between',
        position: 'relative', zIndex: 10,
      }} className="auth-left-panel">

        {/* Logo */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '64px' }}>
            <img src="/logo.jpg" alt="RestoLink Logo" style={{
              width: '40px', height: '40px', borderRadius: '12px',
              boxShadow: '0 0 20px rgba(37, 99, 235, 0.4)',
              objectFit: 'cover'
            }} />
            <span style={{ fontWeight: 900, fontSize: '20px', color: '#fff' }}>RestoLink</span>
          </div>

          <h2 style={{
            fontSize: '2.6rem', fontWeight: 900, color: '#fff',
            lineHeight: 1.2, marginBottom: '16px', letterSpacing: '-0.02em',
          }}>
            Sierra Leone&apos;s<br />
            <span className="gradient-text-neon">#1 Delivery</span><br />
            Platform
          </h2>
          <p style={{ color: '#9ca3af', fontSize: '15px', lineHeight: 1.7 }}>
            Order food, groceries, and essential goods from Freetown&apos;s top vendors and get real-time tracking straight to your door.
          </p>
        </div>

        {/* Feature bullets */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {[
            { icon: '⚡', text: '30-min average delivery in Freetown' },
            { icon: '🍽️', text: '100+ top local restaurants & stores' },
            { icon: '📍', text: 'Live GPS rider tracking on the map' },
            { icon: '💳', text: 'Orange Money, Afrimoney, Card & Cash' },
          ].map((item) => (
            <div key={item.text} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{
                width: '36px', height: '36px', borderRadius: '12px',
                background: 'rgba(34, 197, 94, 0.15)', border: '1px solid rgba(34, 197, 94, 0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0,
              }}>{item.icon}</span>
              <span style={{ color: '#d1d5db', fontSize: '14px', fontWeight: 500 }}>{item.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px', position: 'relative', zIndex: 10, minHeight: '100vh',
      }}>

        {/* Back button */}
        <Link href="/" style={{
          position: 'absolute', top: '20px', left: '20px',
          display: 'flex', alignItems: 'center', gap: '6px',
          background: 'rgba(17, 24, 39, 0.8)', border: '1px solid rgba(255, 255, 255, 0.1)',
          color: '#e5e7eb', fontSize: '13px', fontWeight: 600,
          padding: '8px 16px', borderRadius: '12px', textDecoration: 'none',
          backdropFilter: 'blur(12px)', transition: 'all 0.2s', zIndex: 20,
        }}>
          <ArrowLeft size={14} /> Back
        </Link>

        <div style={{ width: '100%', maxWidth: '420px' }}>
          {children}
        </div>
      </div>

      <style>{`
        @media (min-width: 900px) {
          .auth-left-panel { display: flex !important; }
        }
      `}</style>
    </div>
  );
}
