'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Store, ChevronRight } from 'lucide-react';
import { useCartStore } from '@/store/cart';
import { formatCurrency } from '@/lib/utils';

function itemEffectivePrice(item: ReturnType<typeof useCartStore.getState>['items'][number]) {
  const extra = (item.customizations ?? []).reduce((s, c) => s + c.price_modifier, 0);
  return item.price + extra;
}

export default function CartPage() {
  const router = useRouter();
  const { items, restaurantName, restaurantSlug, removeItem, updateQuantity, clearCart, subtotal } =
    useCartStore();

  if (items.length === 0) {
    return (
      <div style={{ maxWidth: '440px', margin: '0 auto', padding: '80px 20px', textAlign: 'center' }}>
        <div style={{
          width: '80px', height: '80px', borderRadius: '24px',
          background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px', color: '#16a34a',
        }}>
          <ShoppingBag size={36} />
        </div>
        <h2 style={{ fontSize: '22px', fontWeight: 900, color: '#0f172a', marginBottom: '8px' }}>Your cart is empty</h2>
        <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '24px' }}>Explore Freetown&apos;s best restaurants and add delicious items to get started!</p>
        <Link
          href="/restaurants"
          className="btn-primary"
          style={{ textDecoration: 'none', display: 'inline-flex', padding: '14px 28px' }}
        >
          Browse Restaurants <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  const total = subtotal();

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '32px 20px 80px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 900, color: '#0f172a' }}>Your Cart</h1>
          <p style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>Review your order items</p>
        </div>
        <button onClick={clearCart} style={{
          background: 'none', border: 'none', color: '#ef4444',
          fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
        }}>
          Clear all
        </button>
      </div>

      {/* Restaurant banner */}
      <div style={{
        background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
        borderRadius: '16px', padding: '16px 20px', marginBottom: '20px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        border: '1px solid rgba(22,163,74,0.2)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Store size={18} style={{ color: '#16a34a' }} />
          <span style={{ fontWeight: 700, fontSize: '14px', color: '#15803d' }}>{restaurantName}</span>
        </div>
        <Link href={`/restaurants/${restaurantSlug}`} style={{
          fontSize: '12px', fontWeight: 700, color: '#16a34a', textDecoration: 'none',
          display: 'flex', alignItems: 'center', gap: '2px',
        }}>
          Add more <ChevronRight size={14} />
        </Link>
      </div>

      {/* Items list */}
      <div style={{
        background: '#fff', borderRadius: '20px', border: '1px solid #f1f5f9',
        overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
        marginBottom: '20px',
      }}>
        {items.map((item, idx) => {
          const unitPrice = itemEffectivePrice(item);
          return (
            <div key={item.cart_key} style={{
              padding: '16px 20px',
              borderBottom: idx < items.length - 1 ? '1px solid #f8fafc' : 'none',
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 700, fontSize: '15px', color: '#0f172a' }}>{item.name}</p>
                  {(item.customizations ?? []).length > 0 && (
                    <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
                      {(item.customizations ?? []).map((c) => c.option_name).join(', ')}
                    </p>
                  )}
                  {item.special_instructions && (
                    <p style={{ fontSize: '12px', color: '#d97706', fontStyle: 'italic', marginTop: '2px' }}>
                      &ldquo;{item.special_instructions}&rdquo;
                    </p>
                  )}
                  <p style={{ fontSize: '14px', fontWeight: 800, color: '#16a34a', marginTop: '4px' }}>
                    {formatCurrency(unitPrice)}
                  </p>
                </div>

                {/* Quantity Controls */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    onClick={() => updateQuantity(item.cart_key, item.quantity - 1)}
                    style={{
                      width: '28px', height: '28px', borderRadius: '50%', border: '1px solid #e2e8f0',
                      background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', color: '#475569', transition: 'all 0.15s',
                    }}
                  >
                    <Minus size={12} />
                  </button>
                  <span style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', width: '20px', textAlign: 'center' }}>
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.cart_key, item.quantity + 1)}
                    style={{
                      width: '28px', height: '28px', borderRadius: '50%', border: '1px solid #e2e8f0',
                      background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', color: '#475569', transition: 'all 0.15s',
                    }}
                  >
                    <Plus size={12} />
                  </button>
                </div>

                {/* Subtotal */}
                <div style={{ textAlign: 'right', minWidth: '70px' }}>
                  <p style={{ fontWeight: 800, fontSize: '15px', color: '#0f172a' }}>
                    {formatCurrency(unitPrice * item.quantity)}
                  </p>
                </div>

                {/* Remove */}
                <button
                  onClick={() => removeItem(item.cart_key)}
                  style={{
                    background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer',
                    padding: '4px', transition: 'color 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.color = '#ef4444'}
                  onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.color = '#cbd5e1'}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bill summary card */}
      <div style={{
        background: '#fff', borderRadius: '20px', border: '1px solid #f1f5f9',
        padding: '20px', marginBottom: '24px', boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#64748b', marginBottom: '10px' }}>
          <span>Subtotal</span>
          <span style={{ fontWeight: 700, color: '#0f172a' }}>{formatCurrency(total)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#64748b', marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #f1f5f9' }}>
          <span>Delivery fee</span>
          <span style={{ fontSize: '12px', color: '#94a3b8' }}>Calculated at checkout</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 900, color: '#0f172a' }}>
          <span>Total</span>
          <span style={{ color: '#16a34a' }}>{formatCurrency(total)}</span>
        </div>
      </div>

      {/* Checkout Button */}
      <button
        onClick={() => router.push('/checkout')}
        className="btn-primary"
        style={{ width: '100%', padding: '16px', fontSize: '16px' }}
      >
        Proceed to Checkout · {formatCurrency(total)} <ArrowRight size={18} />
      </button>
    </div>
  );
}
