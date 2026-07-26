'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, SlidersHorizontal, Star, Clock, Truck, X, Sparkles, MapPin } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { restaurantApi, searchApi } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import type { Restaurant, MenuItem } from '@/types';

const STORE_TYPES = [
  { label: 'All Places', value: '' },
  { label: '🍽️ Restaurants', value: 'restaurant' },
  { label: '🛒 Grocery Stores', value: 'grocery' },
];

const SORT_OPTIONS = [
  { label: 'Top Rated ⭐', value: 'rating' },
  { label: 'Fastest Delivery ⏱️', value: 'delivery_time' },
  { label: 'Lowest Delivery Fee 🚚', value: 'delivery_fee' },
  { label: 'Newest ✨', value: 'created_at' },
];

const CUISINES = [
  'Sierra Leonean', 'Fast Food', 'Chinese', 'Lebanese', 'Indian', 'Pizza', 'Seafood', 'Grills',
  'Burgers', 'Desserts', 'Drinks', 'Vegetarian',
];

function RestaurantCard({ restaurant }: { restaurant: Restaurant }) {
  return (
    <Link href={`/restaurants/${restaurant.slug}`} style={{ textDecoration: 'none' }}>
      <div style={{
        background: '#fff', borderRadius: '20px', overflow: 'hidden',
        border: '1px solid #f1f5f9',
        boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
        transition: 'all 0.25s ease', cursor: 'pointer',
      }}
        onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 12px 32px rgba(0,0,0,0.12)'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 12px rgba(0,0,0,0.05)'; }}
      >
        <div style={{ position: 'relative', height: '170px', background: '#f8fafc', overflow: 'hidden' }}>
          {restaurant.cover_image_url ? (
            <img src={restaurant.cover_image_url} alt={restaurant.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{
              width: '100%', height: '100%', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: '3.5rem',
              background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
            }}>
              {restaurant.store_type === 'grocery' ? '🛒' : '🍽️'}
            </div>
          )}
          {!restaurant.is_open && (
            <div style={{
              position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ background: '#fff', color: '#374151', fontSize: '12px', fontWeight: 700, padding: '4px 12px', borderRadius: '99px' }}>Closed</span>
            </div>
          )}
          {restaurant.is_open && restaurant.operating_status === 'busy' && (
            <span style={{
              position: 'absolute', top: '12px', right: '12px',
              background: '#f59e0b', color: '#fff', fontSize: '10px', fontWeight: 800,
              padding: '3px 10px', borderRadius: '99px',
            }}>Busy</span>
          )}
          {restaurant.is_featured && (
            <span style={{
              position: 'absolute', top: '12px', left: '12px',
              background: 'linear-gradient(135deg, #16a34a, #15803d)',
              color: '#fff', fontSize: '10px', fontWeight: 800,
              padding: '3px 10px', borderRadius: '99px',
              boxShadow: '0 2px 8px rgba(22,163,74,0.4)',
            }}>⭐ Featured</span>
          )}
          {restaurant.logo_url && (
            <img src={restaurant.logo_url} alt="" style={{
              position: 'absolute', bottom: '12px', left: '12px',
              width: '40px', height: '40px', borderRadius: '12px',
              objectFit: 'cover', border: '2px solid #fff',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            }} />
          )}
          <span style={{
            position: 'absolute', bottom: '12px', right: '12px',
            background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)',
            fontSize: '11px', fontWeight: 700, color: '#0f172a',
            padding: '3px 9px', borderRadius: '99px',
            display: 'flex', alignItems: 'center', gap: '4px',
          }}>
            <Clock size={10} style={{ color: '#16a34a' }} />
            {restaurant.estimated_delivery_time ?? 30}–{(restaurant.estimated_delivery_time ?? 30) + 10}m
          </span>
        </div>
        <div style={{ padding: '16px' }}>
          <h3 style={{ fontWeight: 800, fontSize: '15px', color: '#0f172a', marginBottom: '4px' }} className="line-clamp-1">
            {restaurant.name}
          </h3>
          <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '10px' }} className="line-clamp-1">
            {restaurant.cuisine_type ?? restaurant.store_type}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Star size={12} style={{ fill: '#f59e0b', color: '#f59e0b' }} />
              <strong style={{ color: '#0f172a' }}>{restaurant.avg_rating.toFixed(1)}</strong>
              <span style={{ color: '#94a3b8' }}>({restaurant.total_reviews})</span>
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: 'auto', fontWeight: 600, color: '#374151' }}>
              <Truck size={12} style={{ color: '#16a34a' }} />
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
    <div style={{ background: '#fff', borderRadius: '20px', overflow: 'hidden', border: '1px solid #f1f5f9' }}>
      <div className="skeleton" style={{ height: '170px' }} />
      <div style={{ padding: '16px' }}>
        <div className="skeleton" style={{ height: '16px', width: '70%', marginBottom: '8px' }} />
        <div className="skeleton" style={{ height: '12px', width: '45%', marginBottom: '10px' }} />
        <div className="skeleton" style={{ height: '12px', width: '55%' }} />
      </div>
    </div>
  );
}

function FoodSearchResults({ q }: { q: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ['food-search', q],
    queryFn: () => searchApi.food(q).then((r) => r.data),
    enabled: q.length >= 2,
  });

  const items: (MenuItem & { restaurant_name?: string; restaurant_slug?: string })[] = data?.data ?? [];

  if (isLoading) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px', marginBottom: '28px' }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="skeleton" style={{ height: '120px', borderRadius: '16px' }} />
        ))}
      </div>
    );
  }
  if (!items.length) return null;

  return (
    <div style={{ marginBottom: '32px' }}>
      <p style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
        Dishes matching &ldquo;{q}&rdquo;
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px' }}>
        {items.map((item) => (
          <Link
            key={item.id}
            href={item.restaurant_slug ? `/restaurants/${item.restaurant_slug}` : '#'}
            style={{ textDecoration: 'none' }}
          >
            <div style={{
              background: '#fff', borderRadius: '16px', border: '1px solid #f1f5f9',
              overflow: 'hidden', transition: 'all 0.2s', boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            }}
              onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'}
              onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'}
            >
              <div style={{ height: '100px', background: '#f8fafc', position: 'relative' }}>
                {item.image ? (
                  <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>🍽️</div>
                )}
                {item.discount_percentage ? (
                  <span style={{ position: 'absolute', top: '8px', left: '8px', background: '#ef4444', color: '#fff', fontSize: '10px', fontWeight: 800, padding: '2px 8px', borderRadius: '99px' }}>
                    {item.discount_percentage}% off
                  </span>
                ) : null}
              </div>
              <div style={{ padding: '12px' }}>
                <p style={{ fontWeight: 700, fontSize: '13px', color: '#0f172a' }} className="line-clamp-1">{item.name}</p>
                {item.restaurant_name && (
                  <p style={{ fontSize: '11px', color: '#94a3b8' }} className="line-clamp-1">{item.restaurant_name}</p>
                )}
                <p style={{ fontSize: '13px', fontWeight: 800, color: '#16a34a', marginTop: '4px' }}>
                  {formatCurrency(item.effective_price ?? item.price)}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function RestaurantsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get('q') ?? '');
  const [storeType, setStoreType] = useState(searchParams.get('store_type') ?? '');
  const [cuisine, setCuisine] = useState(searchParams.get('cuisine_type') ?? '');
  const [sortBy, setSortBy] = useState('rating');
  const [featured, setFeatured] = useState(searchParams.get('featured') === 'true');
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const limit = 12;

  const queryParams = {
    q: search || undefined,
    store_type: storeType || undefined,
    cuisine_type: cuisine || undefined,
    sort_by: sortBy,
    is_featured: featured || undefined,
    page,
    limit,
  };

  const { data, isLoading } = useQuery({
    queryKey: ['restaurants', 'list', queryParams],
    queryFn: () => restaurantApi.list(queryParams).then((r) => r.data),
    placeholderData: (prev) => prev,
  });

  const restaurants: Restaurant[] = data?.data ?? [];
  const total: number = data?.total ?? 0;
  const totalPages = Math.ceil(total / limit);

  useEffect(() => {
    setPage(1);
  }, [search, storeType, cuisine, sortBy, featured]);

  const clearFilters = () => {
    setSearch('');
    setStoreType('');
    setCuisine('');
    setSortBy('rating');
    setFeatured(false);
    router.replace('/restaurants');
  };

  const hasActiveFilters = search || storeType || cuisine || featured;

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 20px 80px' }}>

      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        borderRadius: '24px', padding: '32px', color: '#fff', marginBottom: '28px',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '200px', height: '200px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(22,163,74,0.3) 0%, transparent 70%)' }} />
        <div style={{ position: 'relative' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#4ade80', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Explore Freetown</span>
          <h1 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: 900, marginTop: '4px', marginBottom: '6px' }}>
            {storeType === 'grocery' ? '🛒 Grocery Stores' : '🍽️ Restaurants & Food Spots'}
            {cuisine && ` · ${cuisine}`}
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '14px' }}>
            {total > 0 ? `${total} places available for fast delivery` : 'Find your favourite meals in Freetown'}
          </p>
        </div>
      </div>

      {/* Search & Filter Trigger Bar */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search restaurants, dishes..."
            className="input-field"
            style={{ paddingLeft: '44px', background: '#fff', fontSize: '14px', height: '46px' }}
          />
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px', padding: '0 20px',
            borderRadius: '14px', border: '1.5px solid', fontSize: '14px', fontWeight: 600,
            cursor: 'pointer', transition: 'all 0.2s', height: '46px',
            borderColor: showFilters || hasActiveFilters ? '#16a34a' : '#e2e8f0',
            background: showFilters || hasActiveFilters ? '#16a34a' : '#fff',
            color: showFilters || hasActiveFilters ? '#fff' : '#374151',
          }}
        >
          <SlidersHorizontal size={16} />
          Filters {hasActiveFilters && '•'}
        </button>
      </div>

      {/* Category Tabs */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px', marginBottom: '24px' }}>
        {STORE_TYPES.map(({ label, value }) => (
          <button
            key={value}
            onClick={() => setStoreType(value)}
            style={{
              flexShrink: 0, padding: '8px 18px', borderRadius: '99px', fontSize: '13px', fontWeight: 600,
              border: 'none', cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'inherit',
              background: storeType === value ? '#0f172a' : '#fff',
              color: storeType === value ? '#fff' : '#64748b',
              boxShadow: storeType === value ? '0 4px 12px rgba(15,23,42,0.25)' : '0 2px 8px rgba(0,0,0,0.04)',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Expandable Filter Box */}
      {showFilters && (
        <div style={{
          background: '#fff', borderRadius: '20px', border: '1px solid #f1f5f9',
          padding: '24px', marginBottom: '28px', boxShadow: '0 8px 32px rgba(0,0,0,0.06)',
          display: 'flex', flexDirection: 'column', gap: '20px',
        }} className="animate-fade-up">

          {/* Cuisines */}
          <div>
            <p style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>Cuisine Type</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {CUISINES.map((c) => (
                <button
                  key={c}
                  onClick={() => setCuisine(cuisine === c ? '' : c)}
                  style={{
                    padding: '6px 14px', borderRadius: '10px', fontSize: '12px', fontWeight: 600,
                    border: 'none', cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'inherit',
                    background: cuisine === c ? '#16a34a' : '#f1f5f9',
                    color: cuisine === c ? '#fff' : '#475569',
                  }}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Sort & Options */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <div>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', marginRight: '8px' }}>Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  style={{
                    padding: '8px 14px', borderRadius: '10px', border: '1.5px solid #e2e8f0',
                    fontSize: '13px', background: '#fff', outline: 'none', fontFamily: 'inherit', cursor: 'pointer',
                  }}
                >
                  {SORT_OPTIONS.map(({ label, value }) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 600, color: '#374151' }}>
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  style={{ width: '16px', height: '16px', accentColor: '#16a34a' }}
                />
                Featured only
              </label>
            </div>

            {hasActiveFilters && (
              <button onClick={clearFilters} style={{
                display: 'flex', alignItems: 'center', gap: '4px', color: '#ef4444',
                background: 'none', border: 'none', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
              }}>
                <X size={14} /> Clear all filters
              </button>
            )}
          </div>
        </div>
      )}

      {/* Food search matching dishes */}
      {search.length >= 2 && <FoodSearchResults q={search} />}

      {/* Main Grid */}
      {isLoading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
          {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : restaurants.length > 0 ? (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
            {restaurants.map((r) => <RestaurantCard key={r.id} restaurant={r} />)}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', marginTop: '40px' }}>
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="btn-secondary"
                style={{ padding: '8px 16px', fontSize: '13px', opacity: page === 1 ? 0.4 : 1 }}
              >
                Previous
              </button>
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#64748b' }}>
                Page {page} of {totalPages}
              </span>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
                className="btn-secondary"
                style={{ padding: '8px 16px', fontSize: '13px', opacity: page === totalPages ? 0.4 : 1 }}
              >
                Next
              </button>
            </div>
          )}
        </>
      ) : (
        <div style={{ textAlign: 'center', padding: '80px 20px', background: '#fff', borderRadius: '24px', border: '1px solid #f1f5f9' }}>
          <span style={{ fontSize: '3.5rem', display: 'block', marginBottom: '12px' }}>🔍</span>
          <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>No places found</h3>
          <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '20px' }}>Try searching for a different keyword or resetting your filters.</p>
          <button onClick={clearFilters} className="btn-primary" style={{ padding: '10px 20px', fontSize: '13px' }}>
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
}

export default function RestaurantsPage() {
  return (
    <Suspense fallback={
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
          {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    }>
      <RestaurantsContent />
    </Suspense>
  );
}
