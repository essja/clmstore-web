'use client';
import { useState, useEffect } from 'react';
import { Palette, Check, Layout, X, Sparkles, Moon, Sun, Flag, Zap } from 'lucide-react';
import { useThemeStore, ThemeMode, LayoutMode } from '@/store/theme';

export default function ThemeSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, layout, setTheme, setLayout } = useThemeStore();

  // Synchronize data-theme on html element when theme changes
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const themes: { id: ThemeMode; name: string; icon: any; color: string; desc: string }[] = [
    {
      id: 'dark',
      name: 'Sleek Dark Glass',
      icon: Moon,
      color: '#22c55e',
      desc: 'Glassmorphic Dark Mode with glowing neon accents',
    },
    {
      id: 'warm',
      name: 'Warm Light Editorial',
      icon: Sun,
      color: '#ea580c',
      desc: 'Clean off-white cream with warm terracotta coral',
    },
    {
      id: 'heritage',
      name: 'Sierra Leone Pride',
      icon: Flag,
      color: '#059669',
      desc: 'Emerald green & sunset gold national pride theme',
    },
    {
      id: 'indigo',
      name: 'Electric Indigo',
      icon: Zap,
      color: '#4f46e5',
      desc: 'Cyber indigo & vibrant cyan tech app theme',
    },
  ];

  const layouts: { id: LayoutMode; name: string; desc: string }[] = [
    { id: 'topbar', name: 'Classic Top Navigation', desc: 'Standard header bar across top of screen' },
    { id: 'sidebar', name: 'Modern Left Sidebar App', desc: 'DoorDash style vertical left sidebar' },
  ];

  return (
    <>
      {/* ── FLOATING TOGGLE BUTTON ── */}
      <button
        onClick={() => setIsOpen(true)}
        title="Customize Design & Theme"
        style={{
          position: 'fixed', bottom: '24px', right: '24px', zIndex: 99,
          background: 'linear-gradient(135deg, #10b981, #059669)',
          color: '#ffffff', border: '2px solid rgba(255,255,255,0.3)',
          borderRadius: '99px', padding: '12px 20px',
          display: 'flex', alignItems: 'center', gap: '8px',
          boxShadow: '0 8px 32px rgba(16, 185, 129, 0.4)',
          cursor: 'pointer', fontFamily: 'inherit', fontWeight: 800, fontSize: '13px',
          transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        className="animate-float"
        onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.06)')}
        onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
      >
        <Palette size={18} />
        <span>Customize UI</span>
      </button>

      {/* ── THEME MODAL ── */}
      {isOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100,
          background: 'rgba(11, 19, 43, 0.75)', backdropFilter: 'blur(12px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
        }}>
          {/* Backdrop Click */}
          <div style={{ position: 'absolute', inset: 0 }} onClick={() => setIsOpen(false)} />

          {/* Modal Container */}
          <div className="animate-slide-up" style={{
            position: 'relative', width: '100%', maxWidth: '520px',
            background: 'var(--bg-card-solid, #ffffff)', color: 'var(--text-main, #0f172a)',
            borderRadius: '28px', border: '1.5px solid var(--border-card, #e2e8f0)',
            padding: '32px', boxShadow: '0 24px 64px rgba(0, 0, 0, 0.3)',
            maxHeight: '90vh', overflowY: 'auto',
          }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '38px', height: '38px', borderRadius: '12px',
                  background: 'rgba(34, 197, 94, 0.15)', color: '#22c55e',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Sparkles size={20} />
                </div>
                <div>
                  <h3 style={{ fontWeight: 900, fontSize: '18px' }}>Customize Your Experience</h3>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted, #64748b)' }}>Switch theme styles and navigation layouts live</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} style={{
                background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px',
              }}>
                <X size={20} />
              </button>
            </div>

            {/* 1. Theme Selection Grid */}
            <div style={{ marginBottom: '28px' }}>
              <label style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', display: 'block', marginBottom: '12px' }}>
                1. Choose Design Theme Style
              </label>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                {themes.map((t) => {
                  const isSelected = theme === t.id;
                  const Icon = t.icon;
                  return (
                    <div
                      key={t.id}
                      onClick={() => setTheme(t.id)}
                      style={{
                        padding: '16px', borderRadius: '20px', cursor: 'pointer',
                        border: isSelected ? `2px solid ${t.color}` : '1.5px solid var(--border-card, #e2e8f0)',
                        background: isSelected ? 'rgba(34, 197, 94, 0.08)' : 'var(--bg-primary, #f8fafc)',
                        transition: 'all 0.2s', position: 'relative',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <div style={{
                          width: '32px', height: '32px', borderRadius: '10px', background: t.color,
                          display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
                        }}>
                          <Icon size={16} />
                        </div>
                        {isSelected && (
                          <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: t.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                            <Check size={12} />
                          </div>
                        )}
                      </div>
                      <p style={{ fontWeight: 800, fontSize: '14px', marginBottom: '2px' }}>{t.name}</p>
                      <p style={{ fontSize: '11px', color: 'var(--text-muted, #64748b)', lineHeight: 1.3 }}>{t.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2. Navigation Layout Selection */}
            <div style={{ marginBottom: '28px' }}>
              <label style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', display: 'block', marginBottom: '12px' }}>
                2. Choose App Navigation Structure
              </label>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {layouts.map((l) => {
                  const isSelected = layout === l.id;
                  return (
                    <div
                      key={l.id}
                      onClick={() => setLayout(l.id)}
                      style={{
                        padding: '14px 18px', borderRadius: '18px', cursor: 'pointer',
                        border: isSelected ? '2px solid #22c55e' : '1.5px solid var(--border-card, #e2e8f0)',
                        background: isSelected ? 'rgba(34, 197, 94, 0.08)' : 'var(--bg-primary, #f8fafc)',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        <p style={{ fontWeight: 800, fontSize: '14px' }}>{l.name}</p>
                        <p style={{ fontSize: '11px', color: 'var(--text-muted, #64748b)' }}>{l.desc}</p>
                      </div>
                      {isSelected && (
                        <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                          <Check size={12} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="btn-primary"
              style={{ width: '100%', padding: '14px', borderRadius: '16px', fontSize: '14px' }}
            >
              Apply Theme Settings
            </button>
          </div>
        </div>
      )}
    </>
  );
}
