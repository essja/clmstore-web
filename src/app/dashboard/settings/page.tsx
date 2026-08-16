'use client';
import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Store, Camera, Save, MapPin, Phone, Clock, DollarSign, Image as ImageIcon, Loader2 } from 'lucide-react';
import { restaurantApi, fileApi } from '@/lib/api';
import toast from 'react-hot-toast';

export default function RestaurantSettingsPage() {
  const qc = useQueryClient();

  const { data: myRestaurant, isLoading } = useQuery({
    queryKey: ['restaurant', 'my-store'],
    queryFn: () => restaurantApi.getMyRestaurant().then((r) => r.data).catch(() => null),
  });

  const { register, handleSubmit, reset, setValue, watch } = useForm();
  
  const logoUrl = watch('logo');
  const coverImageUrl = watch('cover_image');

  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  const [hoverLogo, setHoverLogo] = useState(false);
  const [hoverCover, setHoverCover] = useState(false);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (myRestaurant) {
      reset({
        name: myRestaurant.name ?? '',
        description: myRestaurant.description ?? '',
        cuisine_type: myRestaurant.cuisine_type ?? '',
        phone: myRestaurant.phone ?? '',
        address: myRestaurant.address ?? '',
        min_order: myRestaurant.min_order ?? 0,
        delivery_fee: myRestaurant.delivery_fee ?? 0,
        avg_delivery_time_min: myRestaurant.avg_delivery_time_min ?? 35,
        logo: myRestaurant.logo ?? '',
        cover_image: myRestaurant.cover_image ?? '',
      });
    }
  }, [myRestaurant, reset]);

  const saveMutation = useMutation({
    mutationFn: (data: any) => restaurantApi.updateMyRestaurant(data),
    onSuccess: () => {
      toast.success('Restaurant details saved successfully! 🍔');
      qc.invalidateQueries({ queryKey: ['restaurant'] });
    },
    onError: (err: any) => toast.error(err?.response?.data?.detail ?? 'Failed to save restaurant details'),
  });

  const onSubmit = (data: any) => {
    saveMutation.mutate(data);
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLogo(true);
    try {
      const url = await fileApi.uploadImage(file, 'restaurants/logos');
      setValue('logo', url);
      toast.success('Logo uploaded successfully! 🎨');
    } catch (err: any) {
      toast.error('Failed to upload logo image');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCover(true);
    try {
      const url = await fileApi.uploadImage(file, 'restaurants/covers');
      setValue('cover_image', url);
      toast.success('Cover banner uploaded successfully! 📸');
    } catch (err: any) {
      toast.error('Failed to upload cover banner');
    } finally {
      setUploadingCover(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh' }}>
        <Loader2 className="animate-spin text-emerald-600" size={32} />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px' }}>
      {/* Title */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em' }}>
          Restaurant Settings & Branding ⚙️
        </h1>
        <p style={{ fontSize: '14px', color: '#64748b', marginTop: '2px' }}>
          Configure restaurant logo, banner cover, address, delivery parameters, and operating details
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="premium-card" style={{ padding: '32px', background: '#ffffff', marginBottom: '24px' }}>
          
          <h2 style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a', marginBottom: '20px' }}>
            🍔 Basic Restaurant Information
          </h2>

          {/* Image Uploaders Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '24px' }}>
            
            {/* Restaurant Logo Uploader */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: 800, color: '#334155' }}>Restaurant Logo</span>
              <div 
                onClick={() => logoInputRef.current?.click()}
                onMouseEnter={() => setHoverLogo(true)}
                onMouseLeave={() => setHoverLogo(false)}
                style={{
                  height: '140px', borderRadius: '18px', border: '2px dashed #cbd5e1',
                  background: '#f8fafc', display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                  position: 'relative', overflow: 'hidden', transition: 'all 0.2s',
                }}
              >
                <input 
                  type="file" 
                  ref={logoInputRef} 
                  onChange={handleLogoUpload} 
                  accept="image/*" 
                  style={{ display: 'none' }} 
                />
                {uploadingLogo ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <Loader2 size={24} className="animate-spin text-emerald-600" />
                    <span style={{ fontSize: '12px', color: '#64748b' }}>Uploading...</span>
                  </div>
                ) : logoUrl ? (
                  <>
                    <img 
                      src={logoUrl} 
                      alt="Logo Preview" 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                    <div style={{
                      position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      opacity: hoverLogo ? 1 : 0, transition: 'opacity 0.2s',
                    }}>
                      <Camera size={20} color="#fff" />
                    </div>
                  </>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', color: '#64748b' }}>
                    <Camera size={24} />
                    <span style={{ fontSize: '12px', fontWeight: 600 }}>Click to Upload Logo</span>
                  </div>
                )}
              </div>
            </div>

            {/* Cover Banner Uploader */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: 800, color: '#334155' }}>Cover Banner</span>
              <div 
                onClick={() => coverInputRef.current?.click()}
                onMouseEnter={() => setHoverCover(true)}
                onMouseLeave={() => setHoverCover(false)}
                style={{
                  height: '140px', borderRadius: '18px', border: '2px dashed #cbd5e1',
                  background: '#f8fafc', display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                  position: 'relative', overflow: 'hidden', transition: 'all 0.2s',
                }}
              >
                <input 
                  type="file" 
                  ref={coverInputRef} 
                  onChange={handleCoverUpload} 
                  accept="image/*" 
                  style={{ display: 'none' }} 
                />
                {uploadingCover ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <Loader2 size={24} className="animate-spin text-emerald-600" />
                    <span style={{ fontSize: '12px', color: '#64748b' }}>Uploading...</span>
                  </div>
                ) : coverImageUrl ? (
                  <>
                    <img 
                      src={coverImageUrl} 
                      alt="Cover Preview" 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                    <div style={{
                      position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      opacity: hoverCover ? 1 : 0, transition: 'opacity 0.2s',
                    }}>
                      <ImageIcon size={20} color="#fff" />
                    </div>
                  </>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', color: '#64748b' }}>
                    <ImageIcon size={24} />
                    <span style={{ fontSize: '12px', fontWeight: 600 }}>Click to Upload Banner</span>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Restaurant Name */}
          <div style={{ marginBottom: '18px' }}>
            <label style={{ fontSize: '13px', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '6px' }}>
              Restaurant Name *
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
              Restaurant Description
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
                Cuisine / Restaurant Category
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
                Restaurant Phone Number
              </label>
              <input
                type="tel"
                {...register('phone')}
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
                {...register('min_order', { valueAsNumber: true })}
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
                {...register('avg_delivery_time_min', { valueAsNumber: true })}
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
          <Save size={18} /> {saveMutation.isPending ? 'Saving Details...' : 'Save Restaurant Settings'}
        </button>
      </form>
    </div>
  );
}
