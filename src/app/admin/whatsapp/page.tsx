'use client';
import { useQuery } from '@tanstack/react-query';
import { MessageSquare, Users, ShoppingBag, DollarSign, TrendingUp, ShieldCheck, ExternalLink, Send } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import axios from 'axios';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function AdminWhatsAppAnalyticsPage() {
  const [recipient, setRecipient] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const { data: analyticsData } = useQuery({
    queryKey: ['admin', 'whatsapp-analytics'],
    queryFn: () => axios.get('http://localhost:8000/api/v1/whatsapp/analytics').then((r) => r.data),
    refetchInterval: 15000,
  });

  const stats = analyticsData?.data;

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipient.trim() || !message.trim()) {
      toast.error('Enter recipient phone number and message text.');
      return;
    }
    setSending(true);
    try {
      await axios.post('http://localhost:8000/api/v1/whatsapp/send-message', {
        to: recipient.trim(),
        message: message.trim(),
      });
      toast.success('WhatsApp message sent! 💬');
      setMessage('');
    } catch (err: any) {
      toast.error('Failed to send message via WhatsApp Cloud API');
    } finally {
      setSending(false);
    }
  };

  const METRICS = [
    { label: 'WhatsApp Customers', value: (stats?.total_whatsapp_customers ?? 0).toLocaleString(), icon: Users, color: '#10b981', bg: '#ecfdf5' },
    { label: 'Active Conversations', value: (stats?.active_conversations ?? 0).toLocaleString(), icon: MessageSquare, color: '#3b82f6', bg: '#eff6ff' },
    { label: 'WhatsApp Orders Placed', value: (stats?.whatsapp_orders_count ?? 0).toLocaleString(), icon: ShoppingBag, color: '#8b5cf6', bg: '#f5f3ff' },
    { label: 'WhatsApp Revenue', value: formatCurrency(stats?.whatsapp_revenue_sll ?? 0), icon: DollarSign, color: '#f59e0b', bg: '#fffbeb' },
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em' }}>
          WhatsApp Business Bot Channel 💬
        </h1>
        <p style={{ fontSize: '14px', color: '#64748b', marginTop: '2px' }}>
          Monitor automated WhatsApp ordering conversations, revenue metrics & manual messaging
        </p>
      </div>

      {/* Metrics Grid */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '18px', marginBottom: '32px',
      }}>
        {METRICS.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="premium-card" style={{ padding: '24px 20px', background: '#ffffff' }}>
            <div style={{
              width: '44px', height: '44px', borderRadius: '14px', background: bg,
              color: color, display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: '14px',
            }}>
              <Icon size={22} />
            </div>
            <p style={{ fontSize: '24px', fontWeight: 900, color: '#0f172a', lineHeight: 1.1 }}>{value}</p>
            <p style={{ fontSize: '13px', fontWeight: 700, color: '#64748b', marginTop: '6px' }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Manual Message Dispatch & Webhook Status Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
        
        {/* Send Direct WhatsApp Message */}
        <div className="premium-card" style={{ padding: '28px', background: '#ffffff' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a', marginBottom: '14px' }}>
            📤 Send Direct WhatsApp Message
          </h3>
          <form onSubmit={handleSendMessage} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '6px' }}>
                Customer WhatsApp Phone Number (with Country Code)
              </label>
              <input
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="23276123456"
                className="input-field"
                style={{ fontSize: '13px' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '13px', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '6px' }}>
                Message Body
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                placeholder="Type notification message or support response..."
                className="input-field"
                style={{ fontSize: '13px' }}
              />
            </div>

            <button
              type="submit"
              disabled={sending}
              className="btn-primary"
              style={{ width: '100%', padding: '12px', borderRadius: '12px', fontSize: '14px' }}
            >
              <Send size={16} /> {sending ? 'Sending via Meta API...' : 'Dispatch Message'}
            </button>
          </form>
        </div>

        {/* Webhook Configuration Status */}
        <div className="premium-card" style={{ padding: '28px', background: '#ffffff' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a', marginBottom: '14px' }}>
            ⚙️ Meta Cloud API Webhook Integration
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
            <div style={{ padding: '12px 16px', background: '#ecfdf5', borderRadius: '12px', border: '1px solid #a7f3d0' }}>
              <p style={{ fontWeight: 800, color: '#047857' }}>✅ Webhook Route Ready</p>
              <code style={{ fontSize: '11px', color: '#065f46' }}>http://localhost:8000/api/v1/whatsapp/webhook</code>
            </div>

            <div style={{ padding: '12px 16px', background: '#eff6ff', borderRadius: '12px', border: '1px solid #bfdbfe' }}>
              <p style={{ fontWeight: 800, color: '#1d4ed8' }}>🔑 Verify Token Key</p>
              <code style={{ fontSize: '11px', color: '#1e40af' }}>clmstore_wa_secure_verify_token_2026</code>
            </div>

            <div style={{ padding: '12px 16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <p style={{ fontWeight: 800, color: '#475569' }}>🌐 Local Tunneling via ngrok</p>
              <p style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                Run <code>npx ngrok http 8000</code> to generate public SSL HTTPS URL for Meta Webhook configuration.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
