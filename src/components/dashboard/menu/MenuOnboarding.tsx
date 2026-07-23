'use client';
import { FileSpreadsheet, FileImage, Globe, QrCode, MessageCircle, HelpCircle, Pencil, FileText } from 'lucide-react';

export type OnboardMethod =
  | 'manual'
  | 'csv'
  | 'pdf'
  | 'image'
  | 'url'
  | 'qr-scan'
  | 'whatsapp'
  | 'admin';

interface MethodCard {
  id: OnboardMethod;
  icon: React.ElementType;
  label: string;
  desc: string;
  badge?: string;
  color: string;
  iconColor: string;
}

const METHODS: MethodCard[] = [
  {
    id: 'manual',
    icon: Pencil,
    label: 'Build Manually',
    desc: 'Add categories and items one by one. Best for small menus.',
    color: 'bg-green-50 border-green-200 hover:border-green-400',
    iconColor: 'bg-green-100 text-green-700',
  },
  {
    id: 'csv',
    icon: FileSpreadsheet,
    label: 'Upload CSV / Excel',
    desc: 'Export your menu from Excel or Google Sheets and import in seconds.',
    badge: 'Fastest',
    color: 'bg-blue-50 border-blue-200 hover:border-blue-400',
    iconColor: 'bg-blue-100 text-blue-700',
  },
  {
    id: 'image',
    icon: FileImage,
    label: 'Scan Menu Photo',
    desc: 'Take a photo of your printed menu. AI reads it automatically.',
    badge: 'AI',
    color: 'bg-purple-50 border-purple-200 hover:border-purple-400',
    iconColor: 'bg-purple-100 text-purple-700',
  },
  {
    id: 'pdf',
    icon: FileText,
    label: 'Upload PDF Menu',
    desc: 'Upload a PDF of your menu. AI extracts items and prices.',
    badge: 'AI',
    color: 'bg-indigo-50 border-indigo-200 hover:border-indigo-400',
    iconColor: 'bg-indigo-100 text-indigo-700',
  },
  {
    id: 'url',
    icon: Globe,
    label: 'Import from Website',
    desc: 'Paste your existing website URL and we\'ll import the menu.',
    color: 'bg-amber-50 border-amber-200 hover:border-amber-400',
    iconColor: 'bg-amber-100 text-amber-700',
  },
  {
    id: 'qr-scan',
    icon: QrCode,
    label: 'Scan QR Code',
    desc: 'Scan a QR code from your existing menu or another platform.',
    color: 'bg-teal-50 border-teal-200 hover:border-teal-400',
    iconColor: 'bg-teal-100 text-teal-700',
  },
  {
    id: 'whatsapp',
    icon: MessageCircle,
    label: 'Send via WhatsApp',
    desc: 'Send your menu to our WhatsApp number and we\'ll upload it for you.',
    color: 'bg-green-50 border-green-200 hover:border-green-400',
    iconColor: 'bg-[#25D366]/20 text-[#128C7E]',
  },
  {
    id: 'admin',
    icon: HelpCircle,
    label: 'Request Admin Help',
    desc: 'Our team sets up your full menu for you within 24 hours.',
    badge: 'Free',
    color: 'bg-rose-50 border-rose-200 hover:border-rose-400',
    iconColor: 'bg-rose-100 text-rose-700',
  },
];

interface Props {
  onSelect: (method: OnboardMethod) => void;
}

export default function MenuOnboarding({ onSelect }: Props) {
  return (
    <div className="max-w-3xl mx-auto py-4">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-[#1B8C4E]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Pencil className="h-8 w-8 text-[#1B8C4E]" />
        </div>
        <h2 className="text-2xl font-black text-[#1A1A2E] mb-2">Set up your menu</h2>
        <p className="text-gray-500 text-sm max-w-md mx-auto">
          Choose how you'd like to get your menu online. You can always edit it later.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {METHODS.map((m) => (
          <button
            key={m.id}
            onClick={() => onSelect(m.id)}
            className={`relative flex items-start gap-4 p-4 rounded-2xl border-2 text-left transition-all duration-150 ${m.color}`}
          >
            {m.badge && (
              <span className="absolute top-3 right-3 text-[10px] font-black uppercase bg-[#1B8C4E] text-white px-2 py-0.5 rounded-full">
                {m.badge}
              </span>
            )}
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${m.iconColor}`}>
              <m.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="font-bold text-[#1A1A2E] text-sm mb-0.5">{m.label}</p>
              <p className="text-xs text-gray-500 leading-snug">{m.desc}</p>
            </div>
          </button>
        ))}
      </div>

      <p className="text-center text-xs text-gray-400 mt-6">
        Not sure? Start with <button onClick={() => onSelect('csv')} className="text-[#1B8C4E] font-semibold underline">CSV upload</button> — it's the fastest way for most restaurants.
      </p>
    </div>
  );
}
