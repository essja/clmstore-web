'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, ChevronRight, Star, Clock, Truck, ShieldCheck, MapPin, Zap } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { restaurantApi } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import type { Restaurant } from '@/types';

const POPULAR_DISHES = [
  { label: 'Jollof Rice', emoji: '🍚' },
  { label: 'Pepper Soup', emoji: '🍲' },
  { label: 'Cassava Leaf', emoji: '🌿' },
  { label: 'Fried Fish', emoji: '🐟' },
  { label: 'Fufu', emoji: '🫕' },
  { label: 'Egusi Soup', emoji: '🥘' },
  { label: 'Grilled Chicken', emoji: '🍗' },
  { label: 'Shawarma', emoji: '🌯' },
  { label: 'Pizza', emoji: '🍕' },
  { label: 'Burgers', emoji: '🍔' },
  { label: 'Fried Rice', emoji: '🍳' },
  { label: 'Groundnut Soup', emoji: '🥜' },
];

function RestaurantCard({ restaurant }: { restaurant: Restaurant }) {
  return (
    <Link href={`/restaurants/${restaurant.slug}`} style={{ textDecoration: 'none' }}>
      <div className="premium-card" style={{ overflow: 'hidden', cursor: 'pointer', background: '#ffffff' }}>
        {/* Cover Image */}
        <div style={{ position: 'relative', height: '175px', background: '#0b132b', overflow: 'hidden' }}>
          {restaurant.cover_image_url ? (
            <img src={restaurant.cover_image_url} alt={restaurant.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{
              width: '100%', height: '100%', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: '3.5rem',
              background: 'linear-gradient(135deg, #10b981, #0b132b)',
            }}>
              {restaurant.store_type === 'grocery' ? '🛒' : '🍽️'}
            </div>
          )}
          {!restaurant.is_open && (
            <div style={{
              position: 'absolute', inset: 0, background: 'rgba(11, 19, 43, 0.75)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ background: '#ffffff', color: '#0b132b', fontSize: '12px', fontWeight: 900, padding: '4px 14px', borderRadius: '99px' }}>Closed</span>
            </div>
          )}
          {restaurant.is_featured && (
            <span className="badge badge-emerald" style={{ position: 'absolute', top: '12px', left: '12px', boxShadow: '0 4px 12px rgba(16,185,129,0.3)' }}>
              ⭐ Featured
            </span>
          )}
          {restaurant.logo_url && (
            <img src={restaurant.logo_url} alt="" style={{
              position: 'absolute', bottom: '12px', left: '12px',
              width: '44px', height: '44px', borderRadius: '14px',
              objectFit: 'cover', border: '2px solid #ffffff',
              boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
            }} />
          )}
          <span style={{
            position: 'absolute', top: '12px', right: '12px',
            background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(8px)',
            fontSize: '11px', fontWeight: 800, color: '#0f172a',
            padding: '4px 10px', borderRadius: '99px',
            display: 'flex', alignItems: 'center', gap: '4px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          }}>
            <Clock size={11} style={{ color: '#10b981' }} />
            {restaurant.estimated_delivery_time ?? 30}–{(restaurant.estimated_delivery_time ?? 30) + 10} min
          </span>
        </div>

        {/* Content */}
        <div style={{ padding: '18px' }}>
          <h3 style={{ fontWeight: 900, fontSize: '16px', color: '#0f172a', marginBottom: '4px' }} className="line-clamp-1">
            {restaurant.name}
          </h3>
          <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '12px' }} className="line-clamp-1">
            {restaurant.cuisine_type ?? restaurant.store_type}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Star size={13} style={{ fill: '#f59e0b', color: '#f59e0b' }} />
              <strong style={{ color: '#0f172a' }}>{restaurant.avg_rating.toFixed(1)}</strong>
              <span style={{ color: '#94a3b8' }}>({restaurant.total_reviews})</span>
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: 'auto', fontWeight: 800, color: '#059669' }}>
              <Truck size={13} />
              {formatCurrency(restaurant.delivery_fee)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function SkeletonCard() {
  return (
    <div className="premium-card" style={{ overflow: 'hidden' }}>
      <div className="skeleton" style={{ height: '175px' }} />
      <div style={{ padding: '18px' }}>
        <div className="skeleton" style={{ height: '18px', width: '70%', marginBottom: '8px' }} />
        <div className="skeleton" style={{ height: '13px', width: '45%', marginBottom: '12px' }} />
        <div className="skeleton" style={{ height: '13px', width: '55%' }} />
      </div>
    </div>
  );
}

export default function HomePage() {
  const router = useRouter();
  const [search, setSearch] = useState('');

  const { data: featuredData, isLoading: loadingFeatured } = useQuery({
    queryKey: ['restaurants', 'featured'],
    queryFn: () => restaurantApi.getFeatured().then((r) => r.data),
  });

  const { data: allData, isLoading: loadingAll } = useQuery({
    queryKey: ['restaurants', 'all'],
    queryFn: () => restaurantApi.list({ limit: 12, sort_by: 'rating' }).then((r) => r.data),
  });

  const featured: Restaurant[] = featuredData?.data ?? [];
  const all: Restaurant[] = allData?.data ?? [];

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (search.trim()) router.push(`/restaurants?q=${encodeURIComponent(search.trim())}`);
  };

  return (
    <div style={{ paddingBottom: '80px' }}>

      {/* Hero Banner */}
      <section className="dark-banner" style={{ margin: '24px 20px', padding: '48px 32px 40px', textAlign: 'center' }}>
        
        {/* Background Accent Blobs */}
        <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '250px', height: '250px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(16, 185, 129, 0.35) 0%, transparent 70%)' }} />
        <div style={{ position: 'absolute', bottom: '-40px', left: '-40px', width: '200px', height: '200px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(245, 158, 11, 0.25) 0%, transparent 70%)' }} />

        <div style={{ maxWidth: '680px', margin: '0 auto', position: 'relative', zIndex: 10 }}>
          <span style={{ fontSize: '11px', fontWeight: 900, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
            Fast Delivery in Freetown 🇸🇱
          </span>

          <h1 style={{ fontSize: 'clamp(2rem, 5.5vw, 3.4rem)', fontWeight: 900, marginTop: '8px', marginBottom: '12px', lineHeight: 1.15 }}>
            Hungry? Order from <span className="gradient-emerald">Freetown&apos;s Best.</span>
          </h1>
          <p style={{ color: '#cbd5e1', fontSize: '15px', marginBottom: '28px', maxWidth: '440px', margin: '0 auto 28px' }}>
            Get hot meals, snacks, and daily groceries delivered straight to your doorstep.
          </p>

          {/* Search Box */}
          <form onSubmit={handleSearch} style={{ position: 'relative', maxWidth: '540px', margin: '0 auto 20px' }}>
            <Search size={18} style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder='Search "jollof", "Balmaya", "cassava leaf"...'
              className="input-field"
              style={{
                paddingLeft: '48px', paddingRight: '120px',
                paddingTop: '16px', paddingBottom: '16px',
                borderRadius: '16px', fontSize: '14px',
                background: '#ffffff', color: '#0f172a',
              }}
            />
            <button type="submit" className="btn-primary" style={{
              position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)',
              padding: '10px 22px', borderRadius: '12px', fontSize: '13px',
            }}>Search</button>
          </form>

          {/* Quick Tags */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
            {['Jollof Rice', 'Fried Fish', 'Pepper Soup', 'Fufu', 'Pizza', 'Burgers'].map((q) => (
              <button key={q} onClick={() => router.push(`/restaurants?q=${encodeURIComponent(q)}`)} style={{
                fontSize: '12px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)',
                color: '#f8fafc', padding: '6px 14px', borderRadius: '99px', cursor: 'pointer',
                transition: 'all 0.2s', fontFamily: 'inherit', fontWeight: 600,
              }}>{q}</button>
            ))}
          </div>
        </div>
      </section>

      {/* Info Bar */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 20px 28px' }}>
        <div style={{
          background: '#ffffff', borderRadius: '20px', border: '1px solid #e2e8f0',
          padding: '16px 24px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
          boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
        }}>
          {[
            { icon: <Zap size={16} style={{ color: '#10b981' }} />, label: '30 min avg. delivery' },
            { icon: <MapPin size={16} style={{ color: '#f59e0b' }} />, label: 'All Freetown coverage' },
            { icon: <ShieldCheck size={16} style={{ color: '#0284c7' }} />, label: '100% Encrypted & Safe' },
          ].map((item) => (
            <div key={item.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              {item.icon}
              <span style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>{item.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Popular Dishes Carousel */}
      <section style={{ padding: '0 24px 32px', maxWidth: '1280px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '19px', fontWeight: 900, color: '#0f172a', marginBottom: '16px' }}>Popular Dishes</h2>
        <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px' }}>
          {POPULAR_DISHES.map(({ label, emoji }) => (
            <Link key={label} href={`/restaurants?q=${encodeURIComponent(label)}`} style={{ textDecoration: 'none' }}>
              <div className="premium-card" style={{
                flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
                padding: '18px 16px', minWidth: '90px', cursor: 'pointer', textAlign: 'center',
                background: '#ffffff',
              }}>
                <span style={{ fontSize: '2rem' }}>{emoji}</span>
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a', lineHeight: 1.3 }}>{label}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Restaurants */}
      {(loadingFeatured || featured.length > 0) && (
        <section style={{ padding: '0 24px 36px', maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '19px', fontWeight: 900, color: '#0f172a' }}>⭐ Featured Places</h2>
            <Link href="/restaurants?featured=true" style={{
              fontSize: '13px', color: '#10b981', textDecoration: 'none', fontWeight: 800,
              display: 'flex', alignItems: 'center', gap: '4px',
            }}>See all <ChevronRight size={14} /></Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
            {loadingFeatured
              ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
              : featured.slice(0, 4).map((r) => <RestaurantCard key={r.id} restaurant={r} />)
            }
          </div>
        </section>
      )}

      {/* Promo Banners */}
      <section style={{ padding: '0 24px 36px', maxWidth: '1280px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '19px', fontWeight: 900, color: '#0f172a', marginBottom: '16px' }}>🎉 Promos & Special Offers</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '18px' }}>
          {[
            { grad: 'linear-gradient(135deg, #ecfdf5, #d1fae5)', border: '#a7f3d0', emoji: '🛵', tag: 'FREE DELIVERY', title: 'First Order Free', sub: 'On orders above Le 50k', link: '/restaurants', cta: 'Order Now', color: '#047857' },
            { grad: 'linear-gradient(135deg, #fffbeb, #fef3c7)', border: '#fde68a', emoji: '🍽️', tag: '20% OFF', title: 'Weekend Feast', sub: 'Selected top places', link: '/restaurants?featured=true', cta: 'Explore', color: '#b45309' },
            { grad: 'linear-gradient(135deg, #f0f9ff, #e0f2fe)', border: '#bae6fd', emoji: '🎁', tag: 'REFER & EARN', title: 'Invite Friends', sub: 'Get Le 10,000 Off', link: '/account', cta: 'Share Link', color: '#0369a1' },
          ].map((promo) => (
            <div key={promo.title} className="premium-card" style={{
              position: 'relative', padding: '26px',
              background: promo.grad, borderColor: promo.border,
              display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
              minHeight: '170px', overflow: 'hidden',
            }}>
              <div style={{ position: 'absolute', top: '-10px', right: '-10px', fontSize: '5rem', opacity: 0.15, pointerEvents: 'none' }}>{promo.emoji}</div>
              <div>
                <span className="badge" style={{ background: '#ffffff', color: promo.color, border: '1px solid ' + promo.border }}>{promo.tag}</span>
                <h3 style={{ fontSize: '20px', fontWeight: 900, marginTop: '10px', color: '#0f172a', lineHeight: 1.2 }}>{promo.title}<br /><span style={{ fontSize: '13px', color: '#475569', fontWeight: 600 }}>{promo.sub}</span></h3>
              </div>
              <Link href={promo.link} style={{
                display: 'inline-flex', alignItems: 'center', gap: '4px',
                background: promo.color, color: '#ffffff', fontWeight: 800, fontSize: '12px',
                padding: '8px 18px', borderRadius: '99px', textDecoration: 'none',
                width: 'fit-content', marginTop: '14px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              }}>{promo.cta} <ChevronRight size={12} /></Link>
            </div>
          ))}
        </div>
      </section>

      {/* Places Near You */}
      <section style={{ padding: '0 24px', maxWidth: '1280px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '19px', fontWeight: 900, color: '#0f172a' }}>🔥 Places Near You</h2>
          <Link href="/restaurants" style={{ fontSize: '13px', color: '#10b981', textDecoration: 'none', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px' }}>
            See all <ChevronRight size={14} />
          </Link>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
          {loadingAll
            ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
            : all.length > 0
              ? all.slice(0, 6).map((r) => <RestaurantCard key={r.id} restaurant={r} />)
              : (
                <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px 0', color: '#64748b' }}>
                  <p style={{ fontSize: '3rem', marginBottom: '12px' }}>🍽️</p>
                  <p style={{ fontWeight: 900, fontSize: '16px', color: '#0f172a' }}>Restaurants coming soon</p>
                  <p style={{ fontSize: '14px', marginTop: '6px' }}>We&apos;re onboarding restaurants in Freetown. Check back shortly.</p>
                </div>
              )
          }
        </div>
      </section>
    </div>
  );
}
