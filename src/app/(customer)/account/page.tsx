'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { User, MapPin, Bell, ChevronRight, Camera, Lock, ArrowRight } from 'lucide-react';
import { userApi, authApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import toast from 'react-hot-toast';
import Link from 'next/link';

const profileSchema = z.object({
  first_name: z.string().min(2),
  last_name: z.string().min(2),
  phone_number: z.string().optional().or(z.literal('')),
});
type ProfileForm = z.infer<typeof profileSchema>;

export default function AccountPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const { isAuthenticated, user: storeUser, setUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications'>('profile');

  useEffect(() => { if (!isAuthenticated) router.push('/login'); }, [isAuthenticated]);

  const { data } = useQuery({
    queryKey: ['profile'],
    queryFn: () => userApi.getProfile().then((r) => r.data),
    enabled: isAuthenticated,
  });

  const user = data?.data ?? storeUser;

  const { register, handleSubmit, reset, formState: { errors, isSubmitting, isDirty } } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: { first_name: user?.first_name ?? '', last_name: user?.last_name ?? '', phone_number: user?.phone_number ?? '' },
  });

  useEffect(() => {
    if (user) reset({ first_name: user.first_name, last_name: user.last_name, phone_number: user.phone_number ?? '' });
  }, [user]);

  const saveProfile = async (formData: ProfileForm) => {
    try {
      const res = await userApi.updateProfile({ ...formData, phone_number: formData.phone_number || undefined });
      setUser(res.data.data);
      qc.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Profile updated successfully 🎉');
    } catch (err: any) {
      toast.error(err?.response?.data?.detail ?? 'Failed to update profile');
    }
  };

  const TABS = [
    { id: 'profile', label: 'Profile Settings', icon: User },
    { id: 'security', label: 'Security & Password', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ] as const;

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', padding: '32px 20px 80px' }}>
      
      {/* Header */}
      <h1 style={{ fontSize: '26px', fontWeight: 900, color: '#0f172a', marginBottom: '24px' }}>My Account 👤</h1>

      {/* Avatar & Info Card */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        borderRadius: '24px', padding: '24px', color: '#fff', marginBottom: '20px',
        display: 'flex', alignItems: 'center', gap: '20px', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '180px', height: '180px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(22,163,74,0.3) 0%, transparent 70%)' }} />
        
        <div style={{ position: 'relative' }}>
          {user?.profile_picture ? (
            <img src={user.profile_picture} alt="" style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #fff' }} />
          ) : (
            <div style={{
              width: '64px', height: '64px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #16a34a, #15803d)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '24px', fontWeight: 900, color: '#fff',
              boxShadow: '0 4px 12px rgba(22,163,74,0.4)',
            }}>
              {user?.first_name?.[0]}
            </div>
          )}
        </div>

        <div style={{ position: 'relative', flex: 1 }}>
          <p style={{ fontWeight: 900, fontSize: '18px' }}>{user?.first_name} {user?.last_name}</p>
          <p style={{ fontSize: '13px', color: '#94a3b8', marginTop: '2px' }}>{user?.email}</p>
          <span style={{
            fontSize: '10px', background: 'rgba(22,163,74,0.2)', color: '#4ade80',
            fontWeight: 800, padding: '3px 10px', borderRadius: '99px',
            marginTop: '8px', display: 'inline-block', textTransform: 'uppercase', letterSpacing: '0.05em',
            border: '1px solid rgba(22,163,74,0.3)',
          }}>
            {user?.role?.replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* Quick Access Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
        {[
          { href: '/orders', label: 'My Orders', icon: '📦' },
          { href: '/account/addresses', label: 'Addresses', icon: '📍' },
        ].map(({ href, label, icon }) => (
          <Link key={href} href={href} style={{ textDecoration: 'none' }}>
            <div style={{
              background: '#fff', borderRadius: '18px', padding: '16px',
              border: '1px solid #f1f5f9', boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              transition: 'all 0.2s', cursor: 'pointer',
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = '#16a34a'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = '#f1f5f9'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '1.4rem' }}>{icon}</span>
                <span style={{ fontWeight: 700, fontSize: '14px', color: '#0f172a' }}>{label}</span>
              </div>
              <ChevronRight size={16} style={{ color: '#94a3b8' }} />
            </div>
          </Link>
        ))}
      </div>

      {/* Settings Card */}
      <div style={{
        background: '#fff', borderRadius: '24px', border: '1px solid #f1f5f9',
        overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
      }}>
        {/* Tab Bar */}
        <div style={{ display: 'flex', borderBottom: '1px solid #f1f5f9' }}>
          {TABS.map(({ id, label, icon: Icon }) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                style={{
                  flex: 1, padding: '14px 10px', fontSize: '12px', fontWeight: isActive ? 800 : 600,
                  border: 'none', background: 'none', cursor: 'pointer', fontFamily: 'inherit',
                  color: isActive ? '#16a34a' : '#64748b',
                  borderBottom: isActive ? '2px solid #16a34a' : '2px solid transparent',
                  transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                }}
              >
                <Icon size={14} />
                <span>{label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Body */}
        <div style={{ padding: '24px' }}>
          {activeTab === 'profile' && (
            <form onSubmit={handleSubmit(saveProfile)} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>First Name</label>
                  <input {...register('first_name')} className="input-field" style={{ fontSize: '13px' }} />
                  {errors.first_name && <p style={{ color: '#ef4444', fontSize: '11px', marginTop: '2px' }}>{errors.first_name.message}</p>}
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>Last Name</label>
                  <input {...register('last_name')} className="input-field" style={{ fontSize: '13px' }} />
                  {errors.last_name && <p style={{ color: '#ef4444', fontSize: '11px', marginTop: '2px' }}>{errors.last_name.message}</p>}
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>Email Address</label>
                <input value={user?.email ?? ''} disabled className="input-field" style={{ fontSize: '13px', background: '#f8fafc', color: '#94a3b8', cursor: 'not-allowed' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>Phone Number</label>
                <input {...register('phone_number')} className="input-field" style={{ fontSize: '13px' }} placeholder="+232 76 000 000" />
              </div>
              <button
                type="submit"
                disabled={!isDirty || isSubmitting}
                className="btn-primary"
                style={{ marginTop: '8px', opacity: !isDirty || isSubmitting ? 0.5 : 1 }}
              >
                {isSubmitting ? 'Saving…' : 'Save Changes'}
              </button>
            </form>
          )}

          {activeTab === 'security' && <ChangePasswordForm />}
          {activeTab === 'notifications' && <NotificationPrefs />}
        </div>
      </div>
    </div>
  );
}

function ChangePasswordForm() {
  const schema = z.object({
    current_password: z.string().min(1, 'Required'),
    new_password: z.string().min(8, 'Must be at least 8 chars'),
    confirm_new_password: z.string(),
  }).refine((d) => d.new_password === d.confirm_new_password, { path: ['confirm_new_password'], message: 'Passwords do not match' });
  type F = z.infer<typeof schema>;

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<F>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: F) => {
    try {
      await authApi.changePassword({ current_password: data.current_password, new_password: data.new_password });
      toast.success('Password updated successfully 🎉');
      reset();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail ?? 'Failed to change password');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {[
        { name: 'current_password' as const, label: 'Current Password' },
        { name: 'new_password' as const, label: 'New Password' },
        { name: 'confirm_new_password' as const, label: 'Confirm New Password' },
      ].map(({ name, label }) => (
        <div key={name}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>{label}</label>
          <input type="password" {...register(name)} className="input-field" style={{ fontSize: '13px' }} />
          {errors[name] && <p style={{ color: '#ef4444', fontSize: '11px', marginTop: '2px' }}>{errors[name]?.message}</p>}
        </div>
      ))}
      <button type="submit" disabled={isSubmitting} className="btn-primary" style={{ marginTop: '8px', opacity: isSubmitting ? 0.7 : 1 }}>
        {isSubmitting ? 'Updating…' : 'Update Password'}
      </button>
    </form>
  );
}

function NotificationPrefs() {
  const { data, refetch } = useQuery({
    queryKey: ['notification-prefs'],
    queryFn: () => userApi.getNotificationPrefs().then((r) => r.data),
  });

  const prefs = data?.data ?? { email: true, sms: true, push: true, in_app: true };

  const toggle = async (key: string, value: boolean) => {
    try {
      await userApi.updateNotificationPrefs({ [key]: value });
      refetch();
      toast.success('Preferences saved');
    } catch {
      toast.error('Failed to save preferences');
    }
  };

  const ITEMS = [
    { key: 'email', label: 'Email Notifications', desc: 'Receive order confirmations and promo codes via email' },
    { key: 'sms', label: 'SMS Alerts', desc: 'Get SMS updates when your order is out for delivery' },
    { key: 'push', label: 'Push Notifications', desc: 'Real-time order tracking alerts on your mobile device' },
    { key: 'in_app', label: 'In-App Messages', desc: 'Special offers and system updates inside the app' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {ITEMS.map(({ key, label, desc }) => {
        const isChecked = !!(prefs as any)[key];
        return (
          <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', borderRadius: '14px', background: '#f8fafc' }}>
            <div>
              <p style={{ fontWeight: 700, fontSize: '13px', color: '#0f172a' }}>{label}</p>
              <p style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>{desc}</p>
            </div>
            <button
              onClick={() => toggle(key, !isChecked)}
              style={{
                width: '44px', height: '24px', borderRadius: '99px', position: 'relative',
                background: isChecked ? '#16a34a' : '#cbd5e1', border: 'none', cursor: 'pointer',
                transition: 'background 0.2s', padding: '2px',
              }}
            >
              <span style={{
                display: 'block', width: '20px', height: '20px', borderRadius: '50%', background: '#fff',
                transform: isChecked ? 'translateX(20px)' : 'translateX(0)', transition: 'transform 0.2s',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
              }} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
