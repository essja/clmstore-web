'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import { MapPin, Tag, ArrowRight, ShieldCheck, Plus, Check } from 'lucide-react';
import { useCartStore } from '@/store/cart';
import { useAuthStore } from '@/store/auth';
import { orderApi, userApi, couponApi, cartApi } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import type { UserAddress } from '@/types';
import toast from 'react-hot-toast';

const PAYMENT_METHODS = [
  { value: 'orange_money', label: 'Orange Money', emoji: '🟠', desc: 'Instant mobile wallet payment' },
  { value: 'afrimoney', label: 'Afrimoney', emoji: '💚', desc: 'Fast mobile payment via Afrimoney' },
  { value: 'stripe', label: 'Visa / Mastercard', emoji: '💳', desc: 'Secure online card payment' },
  { value: 'cash', label: 'Cash on Delivery', emoji: '💵', desc: 'Pay cash to rider upon arrival' },
];

const schema = z.object({
  delivery_address_id: z.number().min(1, 'Select a delivery address'),
  payment_provider: z.enum(['orange_money', 'afrimoney', 'stripe', 'cash']),
  coupon_code: z.string().optional(),
  special_instructions: z.string().max(500).optional(),
});
type FormData = z.infer<typeof schema>;

export default function CheckoutPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { items, restaurantId, subtotal, clearCart } = useCartStore();
  const [couponInput, setCouponInput] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState('');
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login'); return; }
    if (items.length === 0) { router.push('/home'); return; }
  }, [isAuthenticated, items]);

  const { data: addressData } = useQuery({
    queryKey: ['addresses'],
    queryFn: () => userApi.getAddresses().then((r) => r.data),
    enabled: isAuthenticated,
  });

  const addresses: UserAddress[] = addressData?.data ?? [];

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { payment_provider: 'orange_money' },
  });

  const selectedAddressId = watch('delivery_address_id');

  useEffect(() => {
    const defaultAddr = addresses.find((a) => a.is_default) ?? addresses[0];
    if (defaultAddr && !selectedAddressId) setValue('delivery_address_id', defaultAddr.id);
  }, [addresses]);

  const sub = subtotal();
  const discount = couponDiscount;

  const { data: summaryData } = useQuery({
    queryKey: ['cart-summary', selectedAddressId],
    queryFn: () => cartApi.getSummary(selectedAddressId).then((r) => r.data),
    enabled: !!selectedAddressId,
  });

  const deliveryFee: number = summaryData?.delivery_fee ?? 5000;
  const serviceFee: number = summaryData?.service_fee ?? 0;
  const total = Math.max(0, sub + deliveryFee + serviceFee - discount);

  const applyCoupon = async () => {
    if (!couponInput.trim()) return;
    setValidatingCoupon(true);
    try {
      const res = await couponApi.validate({ code: couponInput, order_amount: sub }).then((r) => r.data);
      if (res.data?.discount_amount) {
        setCouponDiscount(res.data.discount_amount);
        setCouponApplied(couponInput);
        toast.success(`Coupon applied! Saved ${formatCurrency(res.data.discount_amount)} 🎉`);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.detail ?? 'Invalid coupon code');
    } finally {
      setValidatingCoupon(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    if (!restaurantId) { toast.error('No restaurant selected'); return; }
    setSubmitting(true);
    try {
      await cartApi.sync({
        restaurant_id: restaurantId,
        coupon_code: couponApplied || undefined,
        items: items.map((i) => ({
          menu_item_id: i.menu_item_id,
          quantity: i.quantity,
          customizations: i.customizations,
          special_instructions: i.special_instructions,
        })),
      });

      const res = await orderApi.create({
        delivery_address_id: data.delivery_address_id,
        payment_method: data.payment_provider,
        notes: data.special_instructions || undefined,
      });
      const order = res.data.data ?? res.data;
      clearCart();
      toast.success('Order placed successfully! 🎉');
      router.push(`/orders/${order.id}`);
    } catch (err: any) {
      toast.error(err?.response?.data?.detail ?? 'Failed to place order');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isAuthenticated || items.length === 0) return null;

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 20px 80px' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#0f172a', marginBottom: '28px' }}>
        Checkout 📦
      </h1>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '28px' }}>
          
          {/* Main Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Delivery Address */}
            <div style={{
              background: '#fff', borderRadius: '24px', border: '1px solid #f1f5f9',
              padding: '24px', boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '10px',
                  background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#16a34a',
                }}>
                  <MapPin size={18} />
                </div>
                <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>Delivery Address</h2>
              </div>

              {addresses.length === 0 ? (
                <div style={{
                  textAlign: 'center', padding: '24px', borderRadius: '16px',
                  border: '2px dashed #e2e8f0', background: '#f8fafc',
                }}>
                  <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '12px' }}>No saved addresses found</p>
                  <a href="/account/addresses" style={{
                    fontSize: '13px', fontWeight: 700, color: '#16a34a', textDecoration: 'none',
                    display: 'inline-flex', alignItems: 'center', gap: '4px',
                  }}>
                    <Plus size={14} /> Add new delivery address
                  </a>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {addresses.map((addr) => {
                    const isSelected = selectedAddressId === addr.id;
                    return (
                      <label
                        key={addr.id}
                        style={{
                          display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '16px',
                          borderRadius: '16px', border: '2px solid', cursor: 'pointer',
                          transition: 'all 0.2s',
                          borderColor: isSelected ? '#16a34a' : '#f1f5f9',
                          background: isSelected ? '#f0fdf4' : '#fff',
                        }}
                      >
                        <input
                          type="radio"
                          value={addr.id}
                          {...register('delivery_address_id', { valueAsNumber: true })}
                          style={{ marginTop: '3px', accentColor: '#16a34a' }}
                        />
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontWeight: 700, fontSize: '14px', color: '#0f172a' }}>{addr.label}</span>
                            {addr.is_default && (
                              <span style={{ fontSize: '10px', background: '#16a34a', color: '#fff', padding: '2px 8px', borderRadius: '99px', fontWeight: 700 }}>Default</span>
                            )}
                          </div>
                          <p style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>{addr.address_line1}{addr.address_line2 ? `, ${addr.address_line2}` : ''}</p>
                          {addr.city && <p style={{ fontSize: '12px', color: '#94a3b8' }}>{addr.city}</p>}
                        </div>
                      </label>
                    );
                  })}
                  <a href="/account/addresses" style={{
                    fontSize: '13px', color: '#16a34a', fontWeight: 700, textDecoration: 'none',
                    textAlign: 'center', marginTop: '4px', display: 'block',
                  }}>
                    + Add a new address
                  </a>
                </div>
              )}
              {errors.delivery_address_id && (
                <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '8px' }}>{errors.delivery_address_id.message}</p>
              )}
            </div>

            {/* Payment Methods */}
            <div style={{
              background: '#fff', borderRadius: '24px', border: '1px solid #f1f5f9',
              padding: '24px', boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
            }}>
              <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>Payment Method</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {PAYMENT_METHODS.map(({ value, label, emoji, desc }) => {
                  const isSelected = watch('payment_provider') === value;
                  return (
                    <label
                      key={value}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '14px', padding: '16px',
                        borderRadius: '16px', border: '2px solid', cursor: 'pointer',
                        transition: 'all 0.2s',
                        borderColor: isSelected ? '#16a34a' : '#f1f5f9',
                        background: isSelected ? '#f0fdf4' : '#fff',
                      }}
                    >
                      <input
                        type="radio"
                        value={value}
                        {...register('payment_provider')}
                        style={{ accentColor: '#16a34a' }}
                      />
                      <span style={{ fontSize: '1.6rem' }}>{emoji}</span>
                      <div>
                        <p style={{ fontWeight: 700, fontSize: '14px', color: '#0f172a' }}>{label}</p>
                        <p style={{ fontSize: '12px', color: '#64748b' }}>{desc}</p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Special Instructions */}
            <div style={{
              background: '#fff', borderRadius: '24px', border: '1px solid #f1f5f9',
              padding: '24px', boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
            }}>
              <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', marginBottom: '10px' }}>Order Notes</h2>
              <textarea
                {...register('special_instructions')}
                rows={3}
                placeholder="Any special requests or instructions for rider..."
                className="input-field"
                style={{ resize: 'none', fontSize: '13px', background: '#fff' }}
              />
            </div>
          </div>

          {/* Right Column — Summary */}
          <div>
            <div style={{
              background: '#fff', borderRadius: '24px', border: '1px solid #f1f5f9',
              padding: '24px', boxShadow: '0 8px 32px rgba(0,0,0,0.06)', position: 'sticky', top: '84px',
            }}>
              <h2 style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a', marginBottom: '16px' }}>Order Summary</h2>

              {/* Items preview */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px', maxHeight: '200px', overflowY: 'auto' }}>
                {items.map((item) => (
                  <div key={item.menu_item_id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span style={{ color: '#475569' }}>{item.quantity}× {item.name}</span>
                    <span style={{ fontWeight: 700, color: '#0f172a' }}>{formatCurrency(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              {/* Coupon */}
              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '16px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <Tag size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      placeholder="Promo Code"
                      disabled={!!couponApplied}
                      className="input-field"
                      style={{ paddingLeft: '34px', fontSize: '12px', padding: '8px 12px 8px 34px' }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={couponApplied ? () => { setCouponApplied(''); setCouponDiscount(0); setCouponInput(''); } : applyCoupon}
                    disabled={validatingCoupon}
                    style={{
                      padding: '8px 16px', borderRadius: '10px', fontSize: '12px', fontWeight: 700,
                      background: couponApplied ? '#ef4444' : '#16a34a', color: '#fff', border: 'none', cursor: 'pointer',
                    }}
                  >
                    {couponApplied ? 'Remove' : validatingCoupon ? '…' : 'Apply'}
                  </button>
                </div>
              </div>

              {/* Bill Details */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid #f1f5f9', paddingTop: '16px', fontSize: '13px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                  <span>Items Subtotal</span>
                  <span style={{ color: '#0f172a', fontWeight: 600 }}>{formatCurrency(sub)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                  <span>Delivery Fee</span>
                  <span style={{ color: '#0f172a', fontWeight: 600 }}>{formatCurrency(deliveryFee)}</span>
                </div>
                {serviceFee > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                    <span>Service Fee</span>
                    <span style={{ color: '#0f172a', fontWeight: 600 }}>{formatCurrency(serviceFee)}</span>
                  </div>
                )}
                {couponDiscount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#16a34a', fontWeight: 700 }}>
                    <span>Promo Discount ({couponApplied})</span>
                    <span>−{formatCurrency(couponDiscount)}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 900, color: '#0f172a', borderTop: '1px solid #f1f5f9', paddingTop: '12px', marginTop: '4px' }}>
                  <span>Total Amount</span>
                  <span style={{ color: '#16a34a' }}>{formatCurrency(total)}</span>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={submitting || addresses.length === 0}
                className="btn-primary"
                style={{ width: '100%', padding: '16px', marginTop: '20px', fontSize: '15px', opacity: submitting || addresses.length === 0 ? 0.6 : 1 }}
              >
                {submitting ? 'Processing order…' : <>Place Order · {formatCurrency(total)} <ArrowRight size={16} /></>}
              </button>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', marginTop: '12px', color: '#94a3b8', fontSize: '11px' }}>
                <ShieldCheck size={14} /> 100% Encrypted & Safe Order
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
