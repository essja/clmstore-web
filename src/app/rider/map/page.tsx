'use client';
import { useQuery } from '@tanstack/react-query';
import { MapPin, Navigation, Package, Compass, Phone, ExternalLink } from 'lucide-react';
import { riderApi } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import LiveMap from '@/components/map/LiveMap';

export default function RiderMapPage() {
  const { data: activeData } = useQuery({
    queryKey: ['rider', 'active-deliveries'],
    queryFn: () => riderApi.getActiveDeliveries().then((r) => r.data),
    refetchInterval: 15000,
  });

  const activeDeliveries = activeData?.data ?? [];

  // Build markers array from active delivery locations (Store, Rider, Customer)
  const markers = activeDeliveries.flatMap((delivery: any, idx: number) => {
    const res = [];
    
    // Store pickup pin
    if (delivery.order?.restaurant?.latitude && delivery.order?.restaurant?.longitude) {
      res.push({
        id: `store-${idx}`,
        lat: delivery.order.restaurant.latitude,
        lng: delivery.order.restaurant.longitude,
        title: `Store: ${delivery.order.restaurant.name}`,
        type: 'store' as const,
        address: delivery.order.restaurant.address,
      });
    }

    // Customer delivery house pin
    const deliveryAddr = delivery.order?.delivery_address;
    if (deliveryAddr?.latitude && deliveryAddr?.longitude) {
      res.push({
        id: `customer-${idx}`,
        lat: deliveryAddr.latitude,
        lng: deliveryAddr.longitude,
        title: `Customer: ${delivery.order?.customer?.first_name} ${delivery.order?.customer?.last_name}`,
        type: 'customer' as const,
        address: deliveryAddr.address_line1 ?? deliveryAddr.address_line,
      });
    }

    // Rider live position pin
    if (delivery.rider_latitude && delivery.rider_longitude) {
      res.push({
        id: `rider-${idx}`,
        lat: delivery.rider_latitude,
        lng: delivery.rider_longitude,
        title: 'Driver Live GPS Position',
        type: 'rider' as const,
      });
    }

    return res;
  });

  return (
    <div>
      {/* Page Title */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em' }}>
          Customer & Route Live GPS Map 🗺️
        </h1>
        <p style={{ fontSize: '14px', color: '#64748b', marginTop: '2px' }}>
          Real-time GPS tracking for customer delivery destinations & store pickup points in Freetown
        </p>
      </div>

      {/* Interactive Map Component */}
      <div style={{ marginBottom: '28px' }}>
        <LiveMap markers={markers} height="440px" />
      </div>

      {/* Active Deliveries Route List */}
      <div className="premium-card" style={{ padding: '24px', background: '#ffffff' }}>
        <h3 style={{ fontSize: '17px', fontWeight: 900, color: '#0f172a', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Package size={18} style={{ color: '#10b981' }} />
          Active Delivery Destinations ({activeDeliveries.length})
        </h3>

        {activeDeliveries.length === 0 ? (
          <div style={{ padding: '36px', textAlign: 'center', color: '#64748b' }}>
            <Compass size={36} style={{ color: '#cbd5e1', margin: '0 auto 12px' }} />
            <p style={{ fontWeight: 800, fontSize: '15px', color: '#0f172a' }}>No active delivery routes</p>
            <p style={{ fontSize: '13px', marginTop: '2px' }}>Go online on Deliveries tab to receive customer orders.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {activeDeliveries.map((delivery: any) => {
              const customerName = `${delivery.order?.customer?.first_name ?? 'Customer'} ${delivery.order?.customer?.last_name ?? ''}`;
              const customerAddress = delivery.order?.delivery_address?.address_line1 ?? delivery.order?.delivery_address?.address_line ?? 'Freetown, Sierra Leone';
              const navUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(customerAddress + ', Freetown, Sierra Leone')}`;

              return (
                <div key={delivery.id} style={{ padding: '18px', borderRadius: '18px', border: '1px solid #e2e8f0', background: '#f8fafc' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontWeight: 900, color: '#0f172a', fontSize: '15px' }}>{delivery.order?.order_number}</span>
                    <span className="badge badge-emerald">{delivery.status?.replace(/_/g, ' ').toUpperCase()}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '12px', marginTop: '8px' }}>
                    <div>
                      <p style={{ fontSize: '13px', color: '#475569', fontWeight: 600 }}>
                        🏪 Store: {delivery.order?.restaurant?.name ?? 'Partner Store'}
                      </p>
                      <p style={{ fontSize: '14px', color: '#1e3a8a', fontWeight: 800, marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MapPin size={16} style={{ color: '#2563eb' }} />
                        Deliver to: {customerName} ({customerAddress})
                      </p>
                    </div>

                    <a
                      href={navUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary"
                      style={{ padding: '8px 16px', fontSize: '12px', textDecoration: 'none', borderRadius: '10px' }}
                    >
                      <Navigation size={14} /> Open Customer GPS <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
