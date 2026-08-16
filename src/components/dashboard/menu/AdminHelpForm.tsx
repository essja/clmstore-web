'use client';
import { useState } from 'react';
import { X, HelpCircle, Check, MessageCircle, Phone, FileUp } from 'lucide-react';
import toast from 'react-hot-toast';

const WHATSAPP_NUMBER = '23272224080';

interface Props {
  restaurantName: string;
  restaurantId: number;
  onBack: () => void;
}

export default function AdminHelpForm({ restaurantName, restaurantId, onBack }: Props) {
  const [form, setForm] = useState({ name: restaurantName ?? '', phone: '', notes: '' });
  const [submitted, setSubmitted] = useState(false);

  const sendWhatsApp = () => {
    const msg = encodeURIComponent(
      `Hello RestoLink! I need help setting up my menu.\n\nRestaurant: ${form.name}\nPhone: ${form.phone}\nNotes: ${form.notes || 'N/A'}\n\nPlease assist me.`
    );
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, '_blank');
    setSubmitted(true);
    toast.success('Opening WhatsApp — send the message to complete your request.');
  };

  if (submitted) {
    return (
      <div className="max-w-md mx-auto py-16 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <Check className="h-8 w-8 text-[#1B8C4E]" />
        </div>
        <h3 className="text-lg font-black text-[#1A1A2E] mb-2">Request sent!</h3>
        <p className="text-sm text-gray-500 mb-6">
          Our team will set up your menu within 24 hours. We'll contact you on WhatsApp to confirm.
        </p>
        <button onClick={onBack} className="text-[#1B8C4E] font-semibold text-sm underline">
          Back to menu
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto py-4">
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <X className="h-4 w-4" /> Back
      </button>

      <div className="text-center mb-8">
        <div className="w-14 h-14 bg-rose-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
          <HelpCircle className="h-7 w-7 text-rose-600" />
        </div>
        <h2 className="text-xl font-black text-[#1A1A2E] mb-1">Request Admin Help</h2>
        <p className="text-sm text-gray-500">Our team will set up your complete menu for free within 24 hours.</p>
      </div>

      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">Restaurant Name</label>
          <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Your restaurant name"
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B8C4E]" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">WhatsApp / Phone Number</label>
          <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2.5">
            <Phone className="h-4 w-4 text-gray-400 shrink-0" />
            <input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              placeholder="+232 76 000 000"
              className="flex-1 text-sm focus:outline-none" />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">Notes (optional)</label>
          <textarea value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            placeholder="e.g. I have 30 items, I'll send photos on WhatsApp"
            rows={3}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#1B8C4E]" />
        </div>
      </div>

      <div className="space-y-3">
        <button onClick={sendWhatsApp} disabled={!form.name || !form.phone}
          className="w-full flex items-center justify-center gap-2 bg-[#25D366] text-white py-3.5 rounded-xl font-bold text-sm hover:bg-[#128C7E] transition-colors disabled:opacity-50">
          <MessageCircle className="h-4 w-4" />
          Send Request via WhatsApp
        </button>
        <p className="text-center text-xs text-gray-400">
          You'll be redirected to WhatsApp. Just send the pre-filled message.
        </p>
      </div>
    </div>
  );
}
