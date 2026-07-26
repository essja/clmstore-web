'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UtensilsCrossed, Plus, Edit2, Trash2, Image, DollarSign, Tag, Check, AlertCircle } from 'lucide-react';
import { restaurantApi } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function RestaurantMenuPage() {
  const qc = useQueryClient();
  const [showAddModal, setShowAddModal] = useState(false);

  const { data: myRestaurant, isLoading: loadingRest } = useQuery({
    queryKey: ['restaurant', 'my-store'],
    queryFn: () => restaurantApi.getMyRestaurant().then((r) => r.data).catch(() => null),
  });

  const restaurantId = myRestaurant?.id;

  const { data: menuData, isLoading: loadingMenu } = useQuery({
    queryKey: ['restaurant', 'menu', restaurantId],
    queryFn: () => restaurantApi.getMenu(restaurantId!).then((r) => r.data),
    enabled: !!restaurantId,
  });

  const menuItems = menuData?.data ?? [];

  return (
    <div>
      {/* Title + Action Button Header */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between',
        gap: '16px', marginBottom: '28px',
      }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em' }}>
            Menu Manager 📋
          </h1>
          <p style={{ fontSize: '14px', color: '#64748b', marginTop: '2px' }}>
            Add dishes, set prices, upload food photos, and manage inventory
          </p>
        </div>

        {restaurantId && (
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary"
            style={{ padding: '10px 20px', fontSize: '13px' }}
          >
            <Plus size={16} /> Add New Dish
          </button>
        )}
      </div>

      {/* Warning Alert if Store not configured */}
      {!myRestaurant && !loadingRest && (
        <div style={{
          background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '18px',
          padding: '20px', marginBottom: '28px', display: 'flex', alignItems: 'center', gap: '12px',
        }}>
          <AlertCircle size={24} style={{ color: '#f59e0b', flexShrink: 0 }} />
          <div>
            <h4 style={{ fontWeight: 800, fontSize: '15px', color: '#92400e' }}>Store Registration Pending</h4>
            <p style={{ fontSize: '13px', color: '#b45309', marginTop: '2px' }}>
              Please go to <strong>Settings</strong> to complete your store profile and submit for admin approval.
            </p>
          </div>
        </div>
      )}

      {/* Menu Grid Container */}
      {loadingMenu ? (
        <div style={{ padding: '80px', textAlign: 'center', color: '#94a3b8' }}>Loading menu items...</div>
      ) : menuItems.length === 0 ? (
        <div className="premium-card" style={{ padding: '60px', textAlign: 'center', background: '#ffffff' }}>
          <UtensilsCrossed size={48} style={{ color: '#cbd5e1', margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a' }}>No dishes on your menu</h3>
          <p style={{ fontSize: '14px', color: '#64748b', marginTop: '4px', maxWidth: '420px', margin: '4px auto 16px' }}>
            Start building your restaurant menu to begin accepting customer food orders.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' }}>
          {menuItems.map((item: any) => (
            <div key={item.id} className="premium-card" style={{ overflow: 'hidden', background: '#ffffff' }}>
              <div style={{ position: 'relative', height: '160px', background: '#0b132b' }}>
                {item.image_url ? (
                  <img src={item.image_url} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem' }}>
                    🍲
                  </div>
                )}
                <span style={{
                  position: 'absolute', top: '12px', right: '12px',
                  background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(8px)',
                  fontWeight: 900, color: '#059669', fontSize: '13px', padding: '4px 12px',
                  borderRadius: '99px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                }}>
                  {formatCurrency(item.price)}
                </span>
              </div>

              <div style={{ padding: '18px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 900, color: '#0f172a' }}>{item.name}</h3>
                <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }} className="line-clamp-2">
                  {item.description ?? 'Delicious freshly prepared dish.'}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '14px', paddingTop: '14px', borderTop: '1px solid #f1f5f9' }}>
                  <span className="badge badge-emerald">Available</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
