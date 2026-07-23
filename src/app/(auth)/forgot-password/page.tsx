'use client';
import { useState } from 'react';
import Link from 'next/link';
import { authApi } from '@/lib/api';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await authApi.forgotPassword(email);
      setSent(true);
    } catch {
      toast.error('Something went wrong. Try again.');
    } finally { setLoading(false); }
  };

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-3xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-[#1B8C4E] rounded-2xl flex items-center justify-center mx-auto mb-3">
            <span className="text-white font-black text-lg">CL</span>
          </div>
          <h1 className="text-2xl font-black text-[#1A1A2E]">Reset password</h1>
          <p className="text-gray-500 text-sm mt-1">Enter your email and we'll send a reset link</p>
        </div>

        {sent ? (
          <div className="text-center">
            <div className="bg-[#E8F5EE] rounded-2xl p-6 mb-6">
              <p className="text-[#1B8C4E] font-bold text-sm">Check your email</p>
              <p className="text-gray-600 text-xs mt-2">
                If <strong>{email}</strong> has an account, you'll receive a password reset link shortly.
              </p>
            </div>
            <Link href="/login" className="text-[#1B8C4E] font-semibold text-sm hover:underline">
              Back to Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B8C4E] transition-shadow" />
            </div>
            <button type="submit" disabled={loading || !email}
              className="w-full bg-[#1B8C4E] text-white py-3 rounded-xl font-bold text-sm hover:bg-[#146B3A] transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
              {loading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              {loading ? 'Sending…' : 'Send Reset Link'}
            </button>
            <p className="text-center text-sm text-gray-500">
              <Link href="/login" className="text-[#1B8C4E] font-semibold hover:underline">Back to Sign In</Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
