'use client';
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Store, Camera, Save, MapPin, Phone, Clock, DollarSign, Image } from 'lucide-react';
import { restaurantApi } from '@/lib/api';
import toast from 'react-hot-toast';

export default function RestaurantSettingsPage() {
  const qc = useQueryClient();

  const { data: myRestaurant, isLoading } = useQuery({
    queryKey: ['restaurant', 'my-store'],
    queryFn: () => restaurantApi.getMyRestaurant().then((r) => r.data).catch(() => null),
  });

  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    if (myRestaurant) {
      reset({
        name: myRestaurant.name ?? '',
        description: myRestaurant.description ?? '',
        cuisine_type: myRestaurant.cuisine_type ?? '',
        phone_number: myRestaurant.phone_number ?? '',
        address: myRestaurant.address ?? '',
        minimum_order: myRestaurant.minimum_order ?? 0,
        delivery_fee: myRestaurant.delivery_fee ?? 0,
        estimated_delivery_time: myRestaurant.estimated_delivery_time ?? 35,
        logo_url: myRestaurant.logo_url ?? '',
        cover_image_url: myRestaurant.cover_image_url ?? '',
      });
    }
  }, [myRestaurant, reset]);

  const saveMutation = useMutation({
    mutationFn: (data: any) =>
      myRestaurant
        ? restaurantApi.updateMyRestaurant(data)
        : restaurantApi.create(data),
    onSuccess: () => {
      toast.success('Store details saved & submitted! 🎉');
      qc.invalidateQueries({ queryKey: ['restaurant'] });
    },
    onError: (err: any) => toast.error(err?.response?.data?.detail ?? 'Failed to save store details'),
  });

  const onSubmit = (data: any) => {
    saveMutation.mutate(data);
  };

  return (
    <div style={{ maxWidth: '800px' }}>
      {/* Title */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em' }}>
          Store Settings & Branding ⚙️
        </h1>
        <p style={{ fontSize: '14px', color: '#64748b', marginTop: '2px' }}>
          Configure store logo, banner cover, location address, delivery fees, and operating details
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="premium-card" style={{ padding: '32px', background: '#ffffff', marginBottom: '24px' }}>
          
          <h2 style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a', marginBottom: '20px' }}>
            🏪 Basic Store Information
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            {/* Logo URL */}
            <div>
              <label style={{ fontSize: '13px', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '6px' }}>
                Store Logo Image URL
              </label>
              <input
                type="url"
                {...register('logo_url')}
                placeholder="https://example.com/logo.jpg"
                className="input-field"
                style={{ fontSize: '13px' }}
              />
            </div>

            {/* Cover Image URL */}
            <div>
              <label style={{ fontSize: '13px', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '6px' }}>
                Cover Banner Image URL
              </label>
              <input
                type="url"
                {...register('cover_image_url')}
                placeholder="https://example.com/banner.jpg"
                className="input-field"
                style={{ fontSize: '13px' }}
              />
            </div>
          </div>

          {/* Restaurant Name */}
          <div style={{ marginBottom: '18px' }}>
            <label style={{ fontSize: '13px', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '6px' }}>
              Restaurant / Store Name *
            </label>
            <input
              type="text"
              required
              {...register('name')}
              placeholder="e.g. Balmaya Fine Dining"
              className="input-field"
              style={{ fontSize: '14px' }}
            />
          </div>

          {/* Description */}
          <div style={{ marginBottom: '18px' }}>
            <label style={{ fontSize: '13px', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '6px' }}>
              Store Description
            </label>
            <textarea
              {...register('description')}
              rows={3}
              placeholder="Describe your authentic African dishes, specialties..."
              className="input-field"
              style={{ fontSize: '13px' }}
            />
          </div>

          {/* Cuisine & Phone */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '18px' }}>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '6px' }}>
                Cuisine / Store Category
              </label>
              <input
                type="text"
                {...register('cuisine_type')}
                placeholder="e.g. Sierra Leonean, West African, Fast Food"
                className="input-field"
                style={{ fontSize: '13px' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '13px', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '6px' }}>
                Store Phone Number
              </label>
              <input
                type="tel"
                {...register('phone_number')}
                placeholder="+232 76 000 000"
                className="input-field"
                style={{ fontSize: '13px' }}
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <label style={{ fontSize: '13px', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '6px' }}>
              Street Address in Freetown
            </label>
            <input
              type="text"
              {...register('address')}
              placeholder="e.g. 14 Siaka Stevens Street, Freetown"
              className="input-field"
              style={{ fontSize: '13px' }}
            />
          </div>
        </div>

        {/* Delivery Settings Card */}
        <div className="premium-card" style={{ padding: '32px', background: '#ffffff', marginBottom: '28px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a', marginBottom: '20px' }}>
            🛵 Delivery & Order Parameters
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '18px' }}>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '6px' }}>
                Minimum Order (SLL)
              </label>
              <input
                type="number"
                {...register('minimum_order', { valueAsNumber: true })}
                className="input-field"
                style={{ fontSize: '14px' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '13px', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '6px' }}>
                Delivery Fee (SLL)
              </label>
              <input
                type="number"
                {...register('delivery_fee', { valueAsNumber: true })}
                className="input-field"
                style={{ fontSize: '14px' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '13px', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '6px' }}>
                Avg. Preparation (mins)
              </label>
              <input
                type="number"
                {...register('estimated_delivery_time', { valueAsNumber: true })}
                className="input-field"
                style={{ fontSize: '14px' }}
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={saveMutation.isPending}
          className="btn-primary"
          style={{ width: '100%', padding: '14px', borderRadius: '14px', fontSize: '15px' }}
        >
          <Save size={18} /> {saveMutation.isPending ? 'Saving Details...' : 'Save Store Settings'}
        </button>
      </form>
    </div>
  );
}
