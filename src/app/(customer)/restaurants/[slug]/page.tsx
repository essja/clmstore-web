'use client';
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  Star, Clock, Truck, MapPin, Plus, Minus, ShoppingCart, X, ChevronDown, Check, ArrowRight
} from 'lucide-react';
import { restaurantApi } from '@/lib/api';
import { useCartStore } from '@/store/cart';
import { useAuthStore } from '@/store/auth';
import { formatCurrency } from '@/lib/utils';
import type { MenuItem, MenuCategory, MenuOptionGroup, CartCustomization } from '@/types';
import toast from 'react-hot-toast';

// ── Cart Sidebar ───────────────────────────────────────────────────────────────
function CartSidebar({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const { items, restaurantName, removeItem, updateQuantity, subtotal, clearCart } = useCartStore();
  const sub = subtotal();

  if (items.length === 0) {
    return (
      <div style={{ padding: '40px 24px', textAlign: 'center' }}>
        <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', color: '#94a3b8' }}>
          <ShoppingCart size={24} />
        </div>
        <p style={{ fontWeight: 700, fontSize: '14px', color: '#0f172a' }}>Your cart is empty</p>
        <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>Add items from the menu to start your order</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h3 style={{ fontWeight: 800, fontSize: '16px', color: '#0f172a' }}>Your Order</h3>
          <p style={{ fontSize: '12px', color: '#64748b' }}>{restaurantName}</p>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }} className="lg-hidden">
          <X size={18} />
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {items.map((item) => {
          const customizations = item.customizations ?? [];
          const extra = customizations.reduce((s, c) => s + c.price_modifier, 0);
          const unitTotal = (item.price + extra) * item.quantity;
          return (
            <div key={item.cart_key} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#f8fafc', borderRadius: '10px', padding: '2px' }}>
                <button
                  onClick={() => updateQuantity(item.cart_key, item.quantity - 1)}
                  style={{ width: '24px', height: '24px', borderRadius: '6px', border: 'none', background: '#fff', cursor: 'pointer', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <Minus size={12} />
                </button>
                <span style={{ fontSize: '12px', fontWeight: 800, width: '16px', textAlign: 'center' }}>{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.cart_key, item.quantity + 1)}
                  style={{ width: '24px', height: '24px', borderRadius: '6px', border: 'none', background: '#fff', cursor: 'pointer', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <Plus size={12} />
                </button>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: 700, fontSize: '13px', color: '#0f172a' }} className="line-clamp-1">{item.name}</p>
                {customizations.length > 0 && (
                  <p style={{ fontSize: '11px', color: '#94a3b8' }} className="line-clamp-1">
                    {customizations.map((c) => c.option_name).join(', ')}
                  </p>
                )}
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <span style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>{formatCurrency(unitTotal)}</span>
                <button
                  onClick={() => removeItem(item.cart_key)}
                  style={{ display: 'block', background: 'none', border: 'none', fontSize: '11px', color: '#ef4444', cursor: 'pointer', marginTop: '2px' }}
                >
                  remove
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ padding: '16px 20px', borderTop: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
          <span style={{ color: '#64748b' }}>Subtotal</span>
          <span style={{ fontWeight: 800, color: '#0f172a' }}>{formatCurrency(sub)}</span>
        </div>
        <button
          onClick={() => router.push('/checkout')}
          className="btn-primary"
          style={{ width: '100%', padding: '12px', fontSize: '14px' }}
        >
          Checkout · {formatCurrency(sub)}
        </button>
        <button
          onClick={() => { clearCart(); toast.success('Cart cleared'); }}
          style={{ background: 'none', border: 'none', fontSize: '12px', color: '#ef4444', cursor: 'pointer', textAlign: 'center' }}
        >
          Clear cart
        </button>
      </div>
    </div>
  );
}

// ── Customization Modal ────────────────────────────────────────────────────────
function CustomizeModal({
  item,
  restaurantId,
  restaurantName,
  restaurantSlug,
  onClose,
}: {
  item: MenuItem;
  restaurantId: number;
  restaurantName: string;
  restaurantSlug: string;
  onClose: () => void;
}) {
  const { addItem } = useCartStore();
  const [qty, setQty] = useState(1);
  const [instructions, setInstructions] = useState('');
  const [selected, setSelected] = useState<Record<number, number[]>>(() => {
    const defaults: Record<number, number[]> = {};
    item.option_groups.forEach((g) => {
      const def = g.options.filter((o) => o.is_default).map((o) => o.id);
      if (def.length) defaults[g.id] = def;
    });
    return defaults;
  });

  function toggleOption(group: MenuOptionGroup, optionId: number) {
    setSelected((prev) => {
      const current = prev[group.id] ?? [];
      if (group.group_type === 'single') {
        return { ...prev, [group.id]: [optionId] };
      }
      if (current.includes(optionId)) {
        return { ...prev, [group.id]: current.filter((id) => id !== optionId) };
      }
      const limit = group.max_selections > 0 ? group.max_selections : Infinity;
      if (current.length >= limit) return prev;
      return { ...prev, [group.id]: [...current, optionId] };
    });
  }

  function buildCustomizations(): CartCustomization[] {
    const out: CartCustomization[] = [];
    item.option_groups.forEach((g) => {
      const ids = selected[g.id] ?? [];
      ids.forEach((optId) => {
        const opt = g.options.find((o) => o.id === optId);
        if (opt) out.push({ group_id: g.id, group_name: g.name, option_id: opt.id, option_name: opt.name, price_modifier: opt.price_modifier });
      });
    });
    return out;
  }

  function totalPrice() {
    const extra = buildCustomizations().reduce((s, c) => s + c.price_modifier, 0);
    return (item.effective_price + extra) * qty;
  }

  function isValid() {
    return item.option_groups.every((g) => {
      if (!g.is_required) return true;
      const count = (selected[g.id] ?? []).length;
      return count >= g.min_selections;
    });
  }

  function handleAdd() {
    if (!isValid()) { toast.error('Please make all required selections'); return; }
    const customizations = buildCustomizations();
    addItem(
      {
        menu_item_id: item.id,
        name: item.name,
        price: item.effective_price,
        image: item.image,
        customizations,
        special_instructions: instructions || undefined,
      },
      restaurantId,
      restaurantName,
      restaurantSlug,
      qty,
    );
    toast.success(`${item.name} added 🎉`);
    onClose();
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
        zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#fff', borderRadius: '24px', width: '100%', maxWidth: '440px',
          maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden',
          boxShadow: '0 24px 64px rgba(0,0,0,0.2)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {item.image && (
          <div style={{ height: '180px', position: 'relative', flexShrink: 0 }}>
            <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <button onClick={onClose} style={{
              position: 'absolute', top: '12px', right: '12px',
              background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)',
              border: 'none', borderRadius: '50%', width: '32px', height: '32px',
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            }}>
              <X size={16} />
            </button>
          </div>
        )}

        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
          {!item.image && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a' }}>{item.name}</h3>
              <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={18} /></button>
            </div>
          )}
          {item.image && <h3 style={{ fontSize: '20px', fontWeight: 900, color: '#0f172a', marginBottom: '4px' }}>{item.name}</h3>}
          {item.description && <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '12px' }}>{item.description}</p>}
          <p style={{ fontSize: '20px', fontWeight: 900, color: '#16a34a', marginBottom: '16px' }}>{formatCurrency(item.effective_price)}</p>

          {item.option_groups.map((group) => (
            <div key={group.id} style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                <h4 style={{ fontWeight: 800, fontSize: '14px', color: '#0f172a' }}>{group.name}</h4>
                {group.is_required && (
                  <span style={{ fontSize: '9px', background: '#fee2e2', color: '#dc2626', fontWeight: 800, padding: '2px 6px', borderRadius: '99px' }}>Required</span>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {group.options.filter((o) => o.is_available).map((opt) => {
                  const isSelected = (selected[group.id] ?? []).includes(opt.id);
                  return (
                    <button
                      key={opt.id}
                      onClick={() => toggleOption(group, opt.id)}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '10px 14px', borderRadius: '12px', border: '1.5px solid',
                        cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left', fontFamily: 'inherit',
                        borderColor: isSelected ? '#16a34a' : '#f1f5f9',
                        background: isSelected ? '#f0fdf4' : '#fff',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '16px', height: '16px', borderRadius: group.group_type === 'single' ? '50%' : '4px',
                          border: '2px solid', borderColor: isSelected ? '#16a34a' : '#cbd5e1',
                          background: isSelected ? '#16a34a' : '#fff',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          {isSelected && <Check size={10} color="#fff" />}
                        </div>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>{opt.name}</span>
                      </div>
                      {opt.price_modifier !== 0 && (
                        <span style={{ fontSize: '12px', fontWeight: 700, color: opt.price_modifier > 0 ? '#16a34a' : '#ef4444' }}>
                          {opt.price_modifier > 0 ? '+' : ''}{formatCurrency(opt.price_modifier)}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '6px' }}>
              Special instructions
            </label>
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              rows={2}
              placeholder="e.g. Extra sauce, no onions..."
              className="input-field"
              style={{ fontSize: '13px', resize: 'none' }}
            />
          </div>
        </div>

        <div style={{ padding: '16px 20px', borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f8fafc', borderRadius: '12px', padding: '4px 8px' }}>
            <button onClick={() => setQty((q) => Math.max(1, q - 1))} style={{ width: '28px', height: '28px', border: 'none', background: '#fff', borderRadius: '8px', cursor: 'pointer' }}><Minus size={14} /></button>
            <span style={{ fontWeight: 800, fontSize: '14px', width: '20px', textAlign: 'center' }}>{qty}</span>
            <button onClick={() => setQty((q) => q + 1)} style={{ width: '28px', height: '28px', border: 'none', background: '#fff', borderRadius: '8px', cursor: 'pointer' }}><Plus size={14} /></button>
          </div>
          <button
            onClick={handleAdd}
            disabled={!isValid()}
            className="btn-primary"
            style={{ flex: 1, padding: '12px', fontSize: '14px', opacity: !isValid() ? 0.5 : 1 }}
          >
            Add to Cart · {formatCurrency(totalPrice())}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Menu Item Card ─────────────────────────────────────────────────────────────
function MenuItemCard({
  item,
  restaurantId,
  restaurantName,
  restaurantSlug,
}: {
  item: MenuItem;
  restaurantId: number;
  restaurantName: string;
  restaurantSlug: string;
}) {
  const { items } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);

  const cartQty = items.filter((i) => i.menu_item_id === item.id).reduce((s, i) => s + i.quantity, 0);

  const open = () => {
    if (!isAuthenticated) { router.push('/login'); return; }
    setShowModal(true);
  };

  return (
    <>
      <div
        style={{
          background: item.is_available ? '#fff' : '#f8fafc',
          borderRadius: '16px', border: '1px solid #f1f5f9',
          padding: '14px 16px', display: 'flex', gap: '14px', alignItems: 'center',
          cursor: item.is_available ? 'pointer' : 'default',
          transition: 'all 0.2s', opacity: item.is_available ? 1 : 0.6,
        }}
        onClick={() => item.is_available && open()}
        onMouseEnter={e => { if (item.is_available) (e.currentTarget as HTMLDivElement).style.borderColor = '#16a34a'; }}
        onMouseLeave={e => { if (item.is_available) (e.currentTarget as HTMLDivElement).style.borderColor = '#f1f5f9'; }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
            <h4 style={{ fontWeight: 800, fontSize: '14px', color: '#0f172a' }}>{item.name}</h4>
            {item.is_popular && (
              <span style={{ fontSize: '9px', background: '#ffedd5', color: '#c2410c', fontWeight: 800, padding: '2px 6px', borderRadius: '99px' }}>Popular</span>
            )}
          </div>
          {item.description && (
            <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '6px' }} className="line-clamp-2">{item.description}</p>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <p style={{ fontSize: '14px', fontWeight: 900, color: '#16a34a' }}>{formatCurrency(item.effective_price)}</p>
            {(item.discount_percentage ?? 0) > 0 && (
              <span style={{ fontSize: '10px', background: '#fee2e2', color: '#dc2626', fontWeight: 800, padding: '2px 6px', borderRadius: '99px' }}>
                {item.discount_percentage}% off
              </span>
            )}
          </div>
        </div>

        {item.image ? (
          <div style={{ position: 'relative', width: '72px', height: '72px', borderRadius: '14px', overflow: 'hidden', flexShrink: 0 }}>
            <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            {cartQty > 0 && (
              <span style={{
                position: 'absolute', top: '4px', right: '4px', background: '#16a34a', color: '#fff',
                fontSize: '10px', fontWeight: 800, borderRadius: '50%', width: '18px', height: '18px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{cartQty}</span>
            )}
          </div>
        ) : (
          item.is_available && (
            <button style={{
              width: '32px', height: '32px', borderRadius: '10px', background: '#f0fdf4',
              color: '#16a34a', border: '1px solid rgba(22,163,74,0.2)', display: 'flex',
              alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0,
            }}>
              <Plus size={16} />
            </button>
          )
        )}
      </div>

      {showModal && (
        <CustomizeModal
          item={item}
          restaurantId={restaurantId}
          restaurantName={restaurantName}
          restaurantSlug={restaurantSlug}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}

// ── Restaurant Detail Page ────────────────────────────────────────────────────
export default function RestaurantDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [cartOpen, setCartOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const itemCount = useCartStore((s) => s.itemCount());

  const { data: restaurantData, isLoading } = useQuery({
    queryKey: ['restaurant', slug],
    queryFn: () => restaurantApi.getBySlug(slug).then((r) => r.data),
  });

  const { data: menuData } = useQuery({
    queryKey: ['restaurant', slug, 'menu'],
    queryFn: () => restaurantApi.getMenu(restaurantData!.data.id).then((r) => r.data),
    enabled: !!restaurantData?.data?.id,
  });

  const restaurant = restaurantData?.data;
  const categories: MenuCategory[] = menuData?.data ?? [];

  if (isLoading) {
    return (
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 20px' }}>
        <div className="skeleton" style={{ height: '220px', borderRadius: '24px', marginBottom: '24px' }} />
        <div className="skeleton" style={{ height: '40px', width: '300px', borderRadius: '12px' }} />
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 20px' }}>
        <span style={{ fontSize: '4rem' }}>🤔</span>
        <h2 style={{ fontSize: '22px', fontWeight: 900, color: '#0f172a', marginTop: '12px' }}>Restaurant not found</h2>
      </div>
    );
  }

  const displayedCategories = activeCategory
    ? categories.filter((c) => c.id === activeCategory)
    : categories;

  return (
    <div style={{ paddingBottom: '80px' }}>

      {/* Cover Header */}
      <div style={{ position: 'relative', height: '240px', background: '#0f172a', overflow: 'hidden' }}>
        {restaurant.cover_image_url ? (
          <img src={restaurant.cover_image_url} alt={restaurant.name} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85 }} />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '4rem', background: 'linear-gradient(135deg, #0f172a, #16a34a)' }}>
            {restaurant.store_type === 'grocery' ? '🛒' : '🍽️'}
          </div>
        )}
        {!restaurant.is_open && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ background: '#fff', color: '#0f172a', fontWeight: 800, padding: '8px 20px', borderRadius: '99px', fontSize: '14px' }}>Currently Closed</span>
          </div>
        )}
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 20px' }}>

        {/* Info card bar */}
        <div style={{
          background: '#fff', borderRadius: '24px', border: '1px solid #f1f5f9',
          padding: '24px', marginTop: '-40px', position: 'relative', zIndex: 10,
          boxShadow: '0 8px 32px rgba(0,0,0,0.08)', marginBottom: '32px',
          display: 'flex', alignItems: 'flex-start', gap: '20px', flexWrap: 'wrap',
        }}>
          {restaurant.logo_url && (
            <img src={restaurant.logo_url} alt="" style={{ width: '64px', height: '64px', borderRadius: '16px', objectFit: 'cover', border: '2px solid #fff', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
          )}
          <div style={{ flex: 1, minWidth: '240px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
              <h1 style={{ fontSize: '26px', fontWeight: 900, color: '#0f172a' }}>{restaurant.name}</h1>
              {restaurant.is_featured && (
                <span style={{ background: '#dcfce7', color: '#15803d', fontSize: '11px', fontWeight: 800, padding: '4px 12px', borderRadius: '99px' }}>Featured</span>
              )}
            </div>
            <p style={{ color: '#64748b', fontSize: '14px', marginTop: '2px' }}>{restaurant.cuisine_type ?? restaurant.store_type}</p>
            {restaurant.description && (
              <p style={{ fontSize: '13px', color: '#475569', marginTop: '8px', lineHeight: 1.5 }}>{restaurant.description}</p>
            )}

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginTop: '14px', fontSize: '13px', color: '#374151' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Star size={14} style={{ fill: '#f59e0b', color: '#f59e0b' }} />
                <strong style={{ color: '#0f172a' }}>{restaurant.avg_rating.toFixed(1)}</strong>
                <span style={{ color: '#94a3b8' }}>({restaurant.total_reviews})</span>
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={14} style={{ color: '#16a34a' }} />
                {restaurant.estimated_delivery_time ?? 30}–{(restaurant.estimated_delivery_time ?? 30) + 10} mins
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Truck size={14} style={{ color: '#16a34a' }} />
                {formatCurrency(restaurant.delivery_fee)}
              </span>
            </div>
          </div>
        </div>

        {/* Menu content + Sidebar */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>

          {/* Menu items */}
          <div>
            {/* Category tabs */}
            {categories.length > 1 && (
              <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px', marginBottom: '24px' }}>
                <button
                  onClick={() => setActiveCategory(null)}
                  style={{
                    padding: '8px 16px', borderRadius: '99px', fontSize: '13px', fontWeight: 600,
                    border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                    background: activeCategory === null ? '#0f172a' : '#fff',
                    color: activeCategory === null ? '#fff' : '#64748b',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  }}
                >
                  All Items
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    style={{
                      flexShrink: 0, padding: '8px 16px', borderRadius: '99px', fontSize: '13px', fontWeight: 600,
                      border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                      background: activeCategory === cat.id ? '#0f172a' : '#fff',
                      color: activeCategory === cat.id ? '#fff' : '#64748b',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                    }}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            )}

            {displayedCategories.map((cat) => (
              <div key={cat.id} style={{ marginBottom: '32px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', marginBottom: '12px' }}>{cat.name}</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {(cat.items ?? []).map((item) => (
                    <MenuItemCard
                      key={item.id}
                      item={item}
                      restaurantId={restaurant.id}
                      restaurantName={restaurant.name}
                      restaurantSlug={restaurant.slug}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Cart Sidebar */}
          <div className="hidden-mobile">
            <div style={{
              background: '#fff', borderRadius: '24px', border: '1px solid #f1f5f9',
              boxShadow: '0 8px 32px rgba(0,0,0,0.06)', position: 'sticky', top: '84px',
              overflow: 'hidden', maxHeight: 'calc(100vh - 100px)',
            }}>
              <CartSidebar onClose={() => {}} />
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .hidden-mobile { display: none !important; }
        }
      `}</style>
    </div>
  );
}
