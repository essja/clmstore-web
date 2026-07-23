'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react';

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password required'),
});
type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      const res = await authApi.login(data);
      const { access_token, refresh_token, user } = res.data.data;
      setAuth({ access_token, refresh_token, token_type: 'Bearer', role: user.role, user_id: user.id }, user);
      toast.success(`Welcome back, ${user.first_name}! 🎉`);
      const role = user.role;
      if (role === 'admin' || role === 'super_admin') router.push('/admin');
      else if (role === 'rider') router.push('/rider');
      else if (role === 'restaurant_owner') router.push('/dashboard');
      else router.push('/home');
    } catch (err: any) {
      toast.error(err?.response?.data?.detail ?? 'Invalid email or password');
    }
  };

  return (
    <div className="w-full max-w-md animate-fade-up">
      {/* Dark Glass Card */}
      <div className="glass-card" style={{ padding: '40px' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '56px', height: '56px', borderRadius: '16px',
            background: 'linear-gradient(135deg, #22c55e, #15803d)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: '0 0 24px rgba(34, 197, 94, 0.4)',
          }}>
            <span style={{ color: '#fff', fontWeight: 900, fontSize: '18px' }}>CL</span>
          </div>
          <h1 style={{ fontSize: '26px', fontWeight: 900, color: '#fff', marginBottom: '6px' }}>
            Welcome Back 👋
          </h1>
          <p style={{ color: '#9ca3af', fontSize: '14px' }}>Sign in to your CLMStore account</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '12px', flexWrap: 'wrap' }}>
            {['Customer', 'Rider', 'Restaurant', 'Admin'].map((r) => (
              <span key={r} className="badge badge-gray">{r}</span>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

          {/* Email */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#d1d5db', marginBottom: '6px' }}>
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
              <input
                type="email"
                autoComplete="email"
                {...register('email')}
                className="input-field"
                style={{ paddingLeft: '40px' }}
                placeholder="you@example.com"
              />
            </div>
            {errors.email && <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>{errors.email.message}</p>}
          </div>

          {/* Password */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#d1d5db' }}>Password</label>
              <Link href="/forgot-password" style={{ fontSize: '12px', color: '#4ade80', textDecoration: 'none', fontWeight: 600 }}>
                Forgot password?
              </Link>
            </div>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                {...register('password')}
                className="input-field"
                style={{ paddingLeft: '40px', paddingRight: '44px' }}
                placeholder="Your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', padding: 0,
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>{errors.password.message}</p>}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary"
            style={{ width: '100%', marginTop: '8px', opacity: isSubmitting ? 0.7 : 1, cursor: isSubmitting ? 'not-allowed' : 'pointer' }}
          >
            {isSubmitting ? 'Signing in…' : <>Sign In <ArrowRight size={16} /></>}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '14px', color: '#9ca3af', marginTop: '28px' }}>
          Don&apos;t have an account?{' '}
          <Link href="/register" style={{ color: '#4ade80', fontWeight: 700, textDecoration: 'none' }}>
            Create one free
          </Link>
        </p>
      </div>
    </div>
  );
}
