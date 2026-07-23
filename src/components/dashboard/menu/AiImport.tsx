'use client';
import { useRef, useState } from 'react';
import { Upload, FileText, FileImage, X, Loader2, Check, Trash2, Plus, AlertCircle } from 'lucide-react';
import { restaurantApi } from '@/lib/api';
import { fileApi } from '@/lib/api';
import toast from 'react-hot-toast';
import api from '@/lib/api';

interface ParsedItem { name: string; description: string; price: string; keep: boolean; }
interface ParsedCategory { name: string; items: ParsedItem[]; keep: boolean; }

interface Props {
  restaurantId: number;
  mode: 'image' | 'pdf';
  onDone: () => void;
  onBack: () => void;
}

export default function AiImport({ restaurantId, mode, onDone, onBack }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<'upload' | 'processing' | 'review'>('upload');
  const [preview, setPreview] = useState<string | null>(null);
  const [parsed, setParsed] = useState<ParsedCategory[]>([]);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');

  const accept = mode === 'image' ? 'image/jpeg,image/png,image/webp,image/heic' : 'application/pdf';
  const label = mode === 'image' ? 'Menu Photo' : 'PDF Menu';

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (mode === 'image') setPreview(URL.createObjectURL(file));
    setStep('processing');
    setErrorMsg('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('restaurant_id', String(restaurantId));
      const { data } = await (api as any).post('/menu/ai-extract', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const categories: ParsedCategory[] = (data.categories ?? []).map((c: any) => ({
        name: c.name,
        keep: true,
        items: (c.items ?? []).map((i: any) => ({
          name: i.name,
          description: i.description ?? '',
          price: String(i.price ?? ''),
          keep: true,
        })),
      }));
      if (categories.length === 0) throw new Error('No menu items found in the file.');
      setParsed(categories);
      setStep('review');
    } catch (err: any) {
      const msg = err?.response?.data?.detail ?? err?.message ?? 'Could not read the file. Please try CSV upload instead.';
      setErrorMsg(msg);
      setStep('upload');
    }
  };

  const updateItem = (ci: number, ii: number, field: keyof ParsedItem, value: string | boolean) => {
    setParsed((prev) => {
      const n = [...prev];
      n[ci] = { ...n[ci], items: [...n[ci].items] };
      (n[ci].items[ii] as any)[field] = value;
      return n;
    });
  };

  const removeItem = (ci: number, ii: number) => {
    setParsed((prev) => {
      const n = [...prev];
      n[ci] = { ...n[ci], items: n[ci].items.filter((_, i) => i !== ii) };
      return n;
    });
  };

  const totalItems = parsed.reduce((s, c) => s + c.items.filter((i) => i.keep && i.name).length, 0);

  const importMenu = async () => {
    setImporting(true);
    setProgress(0);
    let done = 0;
    const total = parsed.filter((c) => c.keep).length;
    try {
      for (const cat of parsed) {
        if (!cat.keep) continue;
        const validItems = cat.items.filter((i) => i.keep && i.name.trim());
        const catRes = await restaurantApi.createCategory(restaurantId, { name: cat.name });
        const catId: number = (catRes.data?.data ?? catRes.data)?.id ?? catRes.data?.id;
        for (const item of validItems) {
          await restaurantApi.createMenuItem(restaurantId, {
            name: item.name,
            description: item.description || undefined,
            price: parseFloat(item.price) || 0,
            category_id: catId,
            is_available: true,
          });
        }
        done++;
        setProgress(Math.round((done / total) * 100));
      }
      toast.success(`Menu imported! ${totalItems} items added.`);
      onDone();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail ?? 'Import failed.');
      setImporting(false);
    }
  };

  if (step === 'processing') {
    return (
      <div className="max-w-md mx-auto py-16 text-center">
        <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <Loader2 className="h-8 w-8 text-purple-600 animate-spin" />
        </div>
        <h3 className="text-lg font-black text-[#1A1A2E] mb-2">Reading your {label}…</h3>
        <p className="text-sm text-gray-500">AI is extracting categories, items, and prices. This takes 5–15 seconds.</p>
        {preview && <img src={preview} alt="preview" className="mt-6 rounded-2xl max-h-48 mx-auto object-contain border" />}
      </div>
    );
  }

  if (step === 'review') {
    return (
      <div className="py-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-black text-[#1A1A2E]">Review extracted menu</h2>
            <p className="text-sm text-gray-500 mt-0.5">AI found {parsed.filter((c) => c.keep).length} categories · {totalItems} items. Edit before publishing.</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => { setStep('upload'); setPreview(null); }} className="px-4 py-2 text-sm text-gray-500 border border-gray-200 rounded-xl hover:text-gray-700">
              Re-upload
            </button>
            <button onClick={importMenu} disabled={importing || totalItems === 0}
              className="flex items-center gap-2 bg-[#1B8C4E] text-white px-5 py-2 rounded-xl text-sm font-bold hover:bg-[#146B3A] disabled:opacity-60">
              {importing ? <><Loader2 className="h-4 w-4 animate-spin" /> {progress}%</> : <><Check className="h-4 w-4" /> Publish</>}
            </button>
          </div>
        </div>
        <div className="space-y-4">
          {parsed.map((cat, ci) => (
            <div key={ci} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border-b border-gray-100">
                <input type="checkbox" checked={cat.keep} onChange={(e) => setParsed((p) => { const n=[...p]; n[ci]={...n[ci],keep:e.target.checked}; return n; })} className="accent-[#1B8C4E] w-4 h-4" />
                <input value={cat.name} onChange={(e) => setParsed((p) => { const n=[...p]; n[ci]={...n[ci],name:e.target.value}; return n; })}
                  className="flex-1 font-bold text-[#1A1A2E] bg-transparent focus:outline-none" />
                <span className="text-xs text-gray-400">{cat.items.length} items</span>
              </div>
              <div className="divide-y divide-gray-50">
                {cat.items.map((item, ii) => (
                  <div key={ii} className={`flex items-center gap-3 px-4 py-2.5 ${!item.keep ? 'opacity-40' : ''}`}>
                    <input type="checkbox" checked={item.keep} onChange={(e) => updateItem(ci, ii, 'keep', e.target.checked)} className="accent-[#1B8C4E] w-3.5 h-3.5 shrink-0" />
                    <input value={item.name} onChange={(e) => updateItem(ci, ii, 'name', e.target.value)} placeholder="Item name"
                      className="flex-1 text-sm bg-transparent focus:outline-none min-w-0" />
                    <div className="flex items-center gap-1 shrink-0">
                      <span className="text-xs text-gray-400">Le</span>
                      <input value={item.price} onChange={(e) => updateItem(ci, ii, 'price', e.target.value.replace(/[^0-9.]/g, ''))}
                        placeholder="0" className="w-20 text-sm font-semibold text-[#1B8C4E] bg-transparent focus:outline-none text-right" />
                    </div>
                    <button onClick={() => removeItem(ci, ii)} className="text-gray-200 hover:text-red-400"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto py-4">
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <X className="h-4 w-4" /> Back
      </button>
      <div className="text-center mb-8">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3 ${mode === 'image' ? 'bg-purple-100' : 'bg-indigo-100'}`}>
          {mode === 'image' ? <FileImage className="h-7 w-7 text-purple-700" /> : <FileText className="h-7 w-7 text-indigo-700" />}
        </div>
        <h2 className="text-xl font-black text-[#1A1A2E] mb-1">
          {mode === 'image' ? 'Scan Menu Photo' : 'Upload PDF Menu'}
        </h2>
        <p className="text-sm text-gray-500">AI will read your {label.toLowerCase()} and extract items and prices automatically.</p>
      </div>

      {errorMsg && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-xl p-3 mb-4 text-sm text-red-600">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div onClick={() => fileRef.current?.click()}
        className="border-2 border-dashed border-purple-200 rounded-2xl p-10 text-center cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition-colors">
        <Upload className="h-10 w-10 text-purple-300 mx-auto mb-3" />
        <p className="font-semibold text-gray-700 mb-1">Click to upload your {label.toLowerCase()}</p>
        <p className="text-xs text-gray-400">{mode === 'image' ? 'JPG, PNG, HEIC — max 10MB' : 'PDF — max 10MB'}</p>
        <input ref={fileRef} type="file" accept={accept} className="hidden" onChange={handleFile} />
      </div>

      <p className="text-center text-xs text-gray-400 mt-4">
        Results not perfect? You can edit everything before publishing.
      </p>
    </div>
  );
}
