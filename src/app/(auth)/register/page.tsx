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
import { Eye, EyeOff, User, Mail, Phone, Lock, ArrowRight, ShieldCheck } from 'lucide-react';

const schema = z.object({
  first_name: z.string().min(2, 'First name must be at least 2 characters'),
  last_name: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email'),
  phone_number: z.string().min(8, 'Enter a valid phone number').optional().or(z.literal('')),
  role: z.enum(['customer', 'rider', 'restaurant_owner']),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/\d/, 'Password must contain at least one number')
    .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, 'Password must contain at least one special character'),
  confirm_password: z.string(),
}).refine((d) => d.password === d.confirm_password, {
  path: ['confirm_password'],
  message: 'Passwords do not match',
});
type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: 'customer' },
  });

  const onSubmit = async (data: FormData) => {
    try {
      const { confirm_password, ...payload } = data;
      const res = await authApi.register({ ...payload, phone_number: payload.phone_number || undefined });
      const { access_token, refresh_token, user } = res.data.data;
      setAuth({ access_token, refresh_token, token_type: 'Bearer', role: user.role, user_id: user.id }, user);
      toast.success(`Welcome to RestoLink, ${user.first_name}! 🎉`);
      if (data.role === 'rider') router.push('/rider');
      else if (data.role === 'restaurant_owner') router.push('/dashboard');
      else router.push('/home');
    } catch (err: any) {
      const errData = err?.response?.data;
      const msg = errData?.errors?.[0]?.message ?? errData?.message ?? errData?.detail ?? 'Registration failed';
      toast.error(msg);
    }
  };

  return (
    <div className="w-full max-w-md animate-fade-up">
      <div style={{
        background: '#fff', borderRadius: '28px',
        boxShadow: '0 24px 64px rgba(0,0,0,0.12)', padding: '36px',
        border: '1px solid #f1f5f9',
      }}>
        {/* Logo Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '56px', height: '56px', borderRadius: '16px',
            background: 'linear-gradient(135deg, #2563EB, #10B981)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 14px',
            boxShadow: '0 8px 20px rgba(37,99,235,0.35)',
          }}>
            <span style={{ color: '#fff', fontWeight: 900, fontSize: '18px' }}>RL</span>
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 900, color: '#0f172a', marginBottom: '4px' }}>
            Create an Account ✨
          </h1>
          <p style={{ color: '#64748b', fontSize: '13px' }}>Join RestoLink — Sierra Leone&apos;s #1 delivery app</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Name Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                First Name
              </label>
              <div style={{ position: 'relative' }}>
                <User size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  {...register('first_name')}
                  className="input-field"
                  style={{ paddingLeft: '34px', fontSize: '13px', padding: '10px 12px 10px 34px' }}
                  placeholder="Aisha"
                />
              </div>
              {errors.first_name && <p style={{ color: '#ef4444', fontSize: '11px', marginTop: '2px' }}>{errors.first_name.message}</p>}
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                Last Name
              </label>
              <input
                {...register('last_name')}
                className="input-field"
                style={{ fontSize: '13px', padding: '10px 12px' }}
                placeholder="Kamara"
              />
              {errors.last_name && <p style={{ color: '#ef4444', fontSize: '11px', marginTop: '2px' }}>{errors.last_name.message}</p>}
            </div>
          </div>

          {/* Email */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
              Email address
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="email"
                autoComplete="email"
                {...register('email')}
                className="input-field"
                style={{ paddingLeft: '34px', fontSize: '13px', padding: '10px 12px 10px 34px' }}
                placeholder="you@example.com"
              />
            </div>
            {errors.email && <p style={{ color: '#ef4444', fontSize: '11px', marginTop: '2px' }}>{errors.email.message}</p>}
          </div>

          {/* Phone */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
              Phone Number <span style={{ color: '#94a3b8', fontWeight: 400 }}>(optional)</span>
            </label>
            <div style={{ position: 'relative' }}>
              <Phone size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="tel"
                {...register('phone_number')}
                className="input-field"
                style={{ paddingLeft: '34px', fontSize: '13px', padding: '10px 12px 10px 34px' }}
                placeholder="+232 76 000 000"
              />
            </div>
            {errors.phone_number && <p style={{ color: '#ef4444', fontSize: '11px', marginTop: '2px' }}>{errors.phone_number.message}</p>}
          </div>

          {/* Role select */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
              I am joining as
            </label>
            <select
              {...register('role')}
              className="input-field"
              style={{ fontSize: '13px', padding: '10px 12px', background: '#fff', cursor: 'pointer' }}
            >
              <option value="customer">🛒 Customer — I want to order food & items</option>
              <option value="rider">🛵 Rider — I want to deliver orders</option>
              <option value="restaurant_owner">🏬 Restaurant / Store Owner</option>
            </select>
            {errors.role && <p style={{ color: '#ef4444', fontSize: '11px', marginTop: '2px' }}>{errors.role.message}</p>}
          </div>

          {/* Password */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                {...register('password')}
                className="input-field"
                style={{ paddingLeft: '34px', paddingRight: '40px', fontSize: '13px', padding: '10px 40px 10px 34px' }}
                placeholder="Min 8 chars, 1 upper, 1 symbol"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0 }}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {errors.password && <p style={{ color: '#ef4444', fontSize: '11px', marginTop: '2px' }}>{errors.password.message}</p>}
          </div>

          {/* Confirm Password */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
              Confirm Password
            </label>
            <div style={{ position: 'relative' }}>
              <ShieldCheck size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                {...register('confirm_password')}
                className="input-field"
                style={{ paddingLeft: '34px', fontSize: '13px', padding: '10px 12px 10px 34px' }}
                placeholder="Repeat password"
              />
            </div>
            {errors.confirm_password && <p style={{ color: '#ef4444', fontSize: '11px', marginTop: '2px' }}>{errors.confirm_password.message}</p>}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary"
            style={{ width: '100%', marginTop: '6px', opacity: isSubmitting ? 0.7 : 1, cursor: isSubmitting ? 'not-allowed' : 'pointer' }}
          >
            {isSubmitting ? 'Creating account…' : <>Create Account <ArrowRight size={16} /></>}
          </button>

          <p style={{ fontSize: '11px', color: '#94a3b8', textAlign: 'center', marginTop: '4px' }}>
            By registering you agree to RestoLink&apos;s{' '}
            <Link href="/" style={{ color: '#16a34a', textDecoration: 'none' }}>Terms</Link> and{' '}
            <Link href="/" style={{ color: '#16a34a', textDecoration: 'none' }}>Privacy Policy</Link>.
          </p>
        </form>

        <p style={{ textAlign: 'center', fontSize: '13px', color: '#64748b', marginTop: '20px' }}>
          Already have an account?{' '}
          <Link href="/login" style={{ color: '#16a34a', fontWeight: 700, textDecoration: 'none' }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
