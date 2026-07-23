'use client';
import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Phone, Package, CheckCircle2, Navigation, Power, MapPin, Clock, ArrowRight, ShieldCheck, BellRing, ExternalLink } from 'lucide-react';
import { riderApi } from '@/lib/api';
import { sound } from '@/lib/audio';
import { formatCurrency, formatTimeAgo, getOrderStatusLabel } from '@/lib/utils';
import type { Order } from '@/types';
import toast from 'react-hot-toast';

function DeliveryCard({ order, onStatusChange }: { order: Order; onStatusChange: (id: number, status: string) => void }) {
  const deliveryAddr = order.delivery_address as any;
  const customerName = `${order.customer?.first_name ?? 'Customer'} ${order.customer?.last_name ?? ''}`;
  const storeName = order.restaurant?.name ?? 'Partner Store';
  const storeAddress = order.restaurant?.address ?? 'Freetown, Sierra Leone';
  const customerAddress = deliveryAddr?.address_line1 ?? deliveryAddr?.address_line ?? 'Freetown, Sierra Leone';
  const customerPhone = order.customer?.phone ?? deliveryAddr?.phone_number;
  const deliveryInstructions = deliveryAddr?.delivery_instructions ?? order.special_instructions;

  // Google Maps navigation links
  const storeNavUrl = order.restaurant?.latitude && order.restaurant?.longitude
    ? `https://www.google.com/maps/dir/?api=1&destination=${order.restaurant.latitude},${order.restaurant.longitude}`
    : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(storeName + ', ' + storeAddress + ', Freetown, Sierra Leone')}`;

  const customerNavUrl = deliveryAddr?.latitude && deliveryAddr?.longitude
    ? `https://www.google.com/maps/dir/?api=1&destination=${deliveryAddr.latitude},${deliveryAddr.longitude}`
    : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(customerAddress + ', Freetown, Sierra Leone')}`;

  return (
    <div className="premium-card" style={{ padding: '22px', background: '#ffffff', marginBottom: '18px' }}>
      
      {/* Top Order Number & Amount */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a' }}>{order.order_number}</h3>
          <p style={{ fontSize: '12px', color: '#64748b' }}>Placed {formatTimeAgo(order.created_at)}</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: '18px', fontWeight: 900, color: '#10b981' }}>{formatCurrency(order.total_amount)}</p>
          <span className="badge badge-emerald">{getOrderStatusLabel(order.status)}</span>
        </div>
      </div>

      {/* 1. STORE PICKUP BOX */}
      <div style={{
        background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '16px',
        padding: '16px', marginBottom: '14px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <span style={{ fontSize: '10px', fontWeight: 900, color: '#b45309', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              1. STORE PICKUP POINT
            </span>
            <h4 style={{ fontSize: '16px', fontWeight: 900, color: '#78350f', marginTop: '2px' }}>
              {storeName}
            </h4>
            <p style={{ fontSize: '13px', color: '#92400e', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <MapPin size={14} style={{ color: '#d97706' }} />
              {storeAddress}
            </p>
          </div>

          <a
            href={storeNavUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: '8px 14px', borderRadius: '10px', background: '#ffffff',
              border: '1px solid #fcd34d', color: '#b45309', fontWeight: 800, fontSize: '12px',
              textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            }}
          >
            <Navigation size={14} /> Open Store GPS <ExternalLink size={12} />
          </a>
        </div>
      </div>

      {/* 2. CUSTOMER DELIVERY LOCATION BOX */}
      <div style={{
        background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '16px',
        padding: '16px', marginBottom: '18px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <span style={{ fontSize: '10px', fontWeight: 900, color: '#1d4ed8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              2. CUSTOMER DELIVERY DESTINATION
            </span>
            <h4 style={{ fontSize: '16px', fontWeight: 900, color: '#1e3a8a', marginTop: '2px' }}>
              {customerName}
            </h4>
            <p style={{ fontSize: '14px', fontWeight: 700, color: '#1e40af', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <MapPin size={16} style={{ color: '#2563eb' }} />
              {customerAddress}
            </p>
            {deliveryInstructions && (
              <p style={{ fontSize: '12px', color: '#1d4ed8', fontStyle: 'italic', marginTop: '4px', background: '#dbeafe', padding: '6px 10px', borderRadius: '8px' }}>
                📝 Customer Note: &quot;{deliveryInstructions}&quot;
              </p>
            )}
          </div>

          <a
            href={customerNavUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: '10px 16px', borderRadius: '12px', background: '#2563eb',
              color: '#ffffff', fontWeight: 900, fontSize: '13px',
              textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px',
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)',
            }}
          >
            <Navigation size={16} /> Navigate to Customer <ExternalLink size={13} />
          </a>
        </div>

        {/* Customer Phone Button */}
        {customerPhone && (
          <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #dbeafe' }}>
            <a
              href={`tel:${customerPhone}`}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                color: '#047857', fontWeight: 800, fontSize: '13px', textDecoration: 'none',
                background: '#ffffff', padding: '8px 14px', borderRadius: '10px',
                border: '1px solid #a7f3d0', boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
              }}
            >
              <Phone size={14} /> Call Customer ({customerPhone})
            </a>
          </div>
        )}
      </div>

      {/* Action Button */}
      {order.status === 'ready' && (
        <button
          onClick={() => onStatusChange(order.id, 'out_for_delivery')}
          className="btn-primary"
          style={{ width: '100%', padding: '14px', borderRadius: '14px', fontSize: '14px' }}
        >
          <Navigation size={16} /> Pick Up Order & Start GPS Navigation 🛵
        </button>
      )}
      {order.status === 'out_for_delivery' && (
        <button
          onClick={() => onStatusChange(order.id, 'delivered')}
          className="btn-primary"
          style={{ width: '100%', padding: '14px', borderRadius: '14px', fontSize: '14px' }}
        >
          <CheckCircle2 size={16} /> Confirm Delivered to Customer ✅
        </button>
      )}
    </div>
  );
}

export default function RiderDeliveriesPage() {
  const qc = useQueryClient();
  const [isOnline, setIsOnline] = useState(false);

  // Fetch rider profile to get availability state
  useQuery({
    queryKey: ['rider', 'profile'],
    queryFn: () => riderApi.getProfile().then((r) => {
      setIsOnline(r.data?.is_available ?? false);
      return r.data;
    }),
  });

  const toggleOnline = async () => {
    const next = !isOnline;
    setIsOnline(next);
    try {
      await riderApi.updateAvailability(next);
      if (next) {
        sound.playOrderRingingSound();
        toast.success('You are NOW ONLINE & ready for delivery orders! 🟢');
      } else {
        toast.success('You are now OFFLINE 🔴');
      }
      qc.invalidateQueries({ queryKey: ['rider'] });
    } catch (err: any) {
      setIsOnline(!next);
      toast.error(err?.response?.data?.detail ?? 'Failed to update availability');
    }
  };

  const { data: deliveriesData, isLoading } = useQuery({
    queryKey: ['rider', 'deliveries'],
    queryFn: () => riderApi.getActiveDeliveries().then((r) => r.data),
    enabled: isOnline,
    refetchInterval: isOnline ? 15000 : false,
  });

  const activeOrders: Order[] = deliveriesData?.data ?? [];

  // Play ringing sound when new active delivery assignment appears
  useEffect(() => {
    if (isOnline && activeOrders.length > 0) {
      sound.playOrderRingingSound();
    }
  }, [activeOrders.length, isOnline]);

  return (
    <div>
      {/* Availability Status Switch Card */}
      <div className="premium-card" style={{
        padding: '24px', background: isOnline ? 'linear-gradient(135deg, #059669, #047857)' : '#0b132b',
        color: '#ffffff', marginBottom: '28px', borderRadius: '24px',
        boxShadow: isOnline ? '0 8px 30px rgba(16, 185, 129, 0.3)' : '0 8px 30px rgba(11, 19, 43, 0.2)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px',
      }}>
        <div>
          <span style={{
            fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em',
            color: isOnline ? '#a7f3d0' : '#ef4444', background: 'rgba(255,255,255,0.1)',
            padding: '4px 10px', borderRadius: '99px',
          }}>
            {isOnline ? '🟢 ONLINE & ACTIVE' : '🔴 OFFLINE'}
          </span>
          <h2 style={{ fontSize: '22px', fontWeight: 900, marginTop: '8px', lineHeight: 1.1 }}>
            {isOnline ? 'Ready for Deliveries!' : 'Ready to Ride?'}
          </h2>
          <p style={{ fontSize: '13px', color: '#e2e8f0', marginTop: '4px' }}>
            {isOnline ? 'Receiving real-time delivery requests in Freetown' : 'Toggle switch to go online and receive orders'}
          </p>

          {isOnline && (
            <button
              onClick={() => sound.playOrderRingingSound()}
              style={{
                marginTop: '12px', background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)',
                color: '#ffffff', padding: '6px 14px', borderRadius: '99px', fontSize: '12px', fontWeight: 800,
                cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px',
              }}
            >
              <BellRing size={14} /> Test Ringing Sound 🔔
            </button>
          )}
        </div>

        <button
          onClick={toggleOnline}
          style={{
            padding: '12px 24px', borderRadius: '16px', fontSize: '14px', fontWeight: 900,
            cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s', border: 'none',
            background: isOnline ? '#ffffff' : 'linear-gradient(135deg, #10b981, #059669)',
            color: isOnline ? '#047857' : '#ffffff',
            boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
            display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0,
          }}
        >
          <Power size={18} />
          {isOnline ? 'Go Offline' : 'Go Online'}
        </button>
      </div>

      {/* Deliveries Section */}
      {!isOnline ? (
        <div className="premium-card" style={{ padding: '60px 24px', textAlign: 'center', background: '#ffffff' }}>
          <Navigation size={48} style={{ color: '#cbd5e1', margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a' }}>You are currently offline</h3>
          <p style={{ fontSize: '14px', color: '#64748b', marginTop: '4px', maxWidth: '380px', margin: '4px auto 16px' }}>
            Click <strong>&quot;Go Online&quot;</strong> above to start receiving food delivery assignments.
          </p>
        </div>
      ) : isLoading ? (
        <div style={{ padding: '80px', textAlign: 'center', color: '#94a3b8' }}>Checking active delivery requests...</div>
      ) : activeOrders.length === 0 ? (
        <div className="premium-card" style={{ padding: '60px 24px', textAlign: 'center', background: '#ffffff' }}>
          <ShieldCheck size={48} style={{ color: '#10b981', margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a' }}>No active deliveries right now</h3>
          <p style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}>
            Stay online! New customer orders will pop up automatically.
          </p>
        </div>
      ) : (
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a', marginBottom: '16px' }}>
            Active Delivery Jobs ({activeOrders.length})
          </h2>
          {activeOrders.map((order) => (
            <DeliveryCard
              key={order.id}
              order={order}
              onStatusChange={(id, status) => {
                sound.playSuccessChime();
                toast.success('Delivery status updated! 🛵');
                qc.invalidateQueries({ queryKey: ['rider'] });
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
