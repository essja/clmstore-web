'use client';
import { useRef, useState } from 'react';
import { Globe, QrCode, X, Loader2, Check, Trash2, AlertCircle, Camera } from 'lucide-react';
import { restaurantApi } from '@/lib/api';
import toast from 'react-hot-toast';
import api from '@/lib/api';

interface ParsedItem { name: string; description: string; price: string; keep: boolean; }
interface ParsedCategory { name: string; items: ParsedItem[]; keep: boolean; }

interface Props {
  restaurantId: number;
  onDone: () => void;
  onBack: () => void;
  initialTab?: 'url' | 'qr';
}

export default function UrlImport({ restaurantId, onDone, onBack, initialTab = 'url' }: Props) {
  const [tab, setTab] = useState<'url' | 'qr'>(initialTab);
  const [url, setUrl] = useState('');
  const [step, setStep] = useState<'input' | 'processing' | 'review'>('input');
  const [parsed, setParsed] = useState<ParsedCategory[]>([]);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [qrDecoding, setQrDecoding] = useState(false);
  const qrRef = useRef<HTMLInputElement>(null);

  // ── QR decode ─────────────────────────────────────────────────────────────
  const handleQrFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setQrDecoding(true);
    setErrorMsg('');
    try {
      const jsQR = (await import('jsqr')).default;
      const bitmap = await createImageBitmap(file);
      const canvas = document.createElement('canvas');
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(bitmap, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height);
      if (!code) {
        setErrorMsg('Could not read a QR code from that photo. Make sure the QR code is clear and in focus.');
        return;
      }
      const decoded = code.data;
      if (!decoded.startsWith('http')) {
        setErrorMsg(`QR code found but it doesn't contain a website link: "${decoded}"`);
        return;
      }
      setUrl(decoded);
      setTab('url');
      toast.success('QR code decoded — ready to import!');
    } catch {
      setErrorMsg('Could not decode the QR code. Try a clearer photo.');
    } finally {
      setQrDecoding(false);
      if (e.target) e.target.value = '';
    }
  };

  // ── Fetch & extract from URL ───────────────────────────────────────────────
  const fetchMenu = async () => {
    const trimmed = url.trim();
    if (!trimmed) return;
    const full = trimmed.startsWith('http') ? trimmed : `https://${trimmed}`;
    setStep('processing');
    setErrorMsg('');
    try {
      const { data } = await (api as any).post('/menu/ai-extract-url', {
        url: full,
        restaurant_id: restaurantId,
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
      if (categories.length === 0) throw new Error('No menu items found on that page.');
      setParsed(categories);
      setStep('review');
    } catch (err: any) {
      const msg = err?.response?.data?.detail ?? err?.message ?? 'Could not read that URL. Try CSV upload instead.';
      setErrorMsg(msg);
      setStep('input');
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

  // ── Review screen ──────────────────────────────────────────────────────────
  if (step === 'review') {
    return (
      <div className="py-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-black text-[#1A1A2E]">Review extracted menu</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              AI found {parsed.filter((c) => c.keep).length} categories · {totalItems} items. Edit before publishing.
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setStep('input')}
              className="px-4 py-2 text-sm text-gray-500 border border-gray-200 rounded-xl hover:text-gray-700">
              Try another URL
            </button>
            <button onClick={importMenu} disabled={importing || totalItems === 0}
              className="flex items-center gap-2 bg-[#1B8C4E] text-white px-5 py-2 rounded-xl text-sm font-bold hover:bg-[#146B3A] disabled:opacity-60">
              {importing
                ? <><Loader2 className="h-4 w-4 animate-spin" /> {progress}%</>
                : <><Check className="h-4 w-4" /> Publish</>}
            </button>
          </div>
        </div>

        {importing && (
          <div className="mb-4 bg-green-50 rounded-xl p-3">
            <div className="flex justify-between text-xs text-green-700 mb-1.5">
              <span>Importing…</span><span>{progress}%</span>
            </div>
            <div className="h-1.5 bg-green-200 rounded-full overflow-hidden">
              <div className="h-full bg-[#1B8C4E] transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        <div className="space-y-4">
          {parsed.map((cat, ci) => (
            <div key={ci} className={`bg-white rounded-2xl border overflow-hidden ${cat.keep ? 'border-gray-100' : 'border-gray-100 opacity-50'}`}>
              <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border-b border-gray-100">
                <input type="checkbox" checked={cat.keep}
                  onChange={(e) => setParsed((p) => { const n = [...p]; n[ci] = { ...n[ci], keep: e.target.checked }; return n; })}
                  className="accent-[#1B8C4E] w-4 h-4" />
                <input value={cat.name}
                  onChange={(e) => setParsed((p) => { const n = [...p]; n[ci] = { ...n[ci], name: e.target.value }; return n; })}
                  className="flex-1 font-bold text-[#1A1A2E] bg-transparent focus:outline-none" />
                <span className="text-xs text-gray-400">{cat.items.length} items</span>
              </div>
              <div className="divide-y divide-gray-50">
                {cat.items.map((item, ii) => (
                  <div key={ii} className={`flex items-center gap-3 px-4 py-2.5 ${!item.keep ? 'opacity-40' : ''}`}>
                    <input type="checkbox" checked={item.keep}
                      onChange={(e) => updateItem(ci, ii, 'keep', e.target.checked)}
                      className="accent-[#1B8C4E] w-3.5 h-3.5 shrink-0" />
                    <input value={item.name} onChange={(e) => updateItem(ci, ii, 'name', e.target.value)}
                      placeholder="Item name"
                      className="flex-1 text-sm bg-transparent focus:outline-none min-w-0" />
                    <div className="flex items-center gap-1 shrink-0">
                      <span className="text-xs text-gray-400">Le</span>
                      <input value={item.price}
                        onChange={(e) => updateItem(ci, ii, 'price', e.target.value.replace(/[^0-9.]/g, ''))}
                        placeholder="0"
                        className="w-20 text-sm font-semibold text-[#1B8C4E] bg-transparent focus:outline-none text-right" />
                    </div>
                    <button onClick={() => removeItem(ci, ii)} className="text-gray-200 hover:text-red-400">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── Processing screen ──────────────────────────────────────────────────────
  if (step === 'processing') {
    return (
      <div className="max-w-md mx-auto py-20 text-center">
        <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <Loader2 className="h-8 w-8 text-amber-600 animate-spin" />
        </div>
        <h3 className="text-lg font-black text-[#1A1A2E] mb-2">Reading your website…</h3>
        <p className="text-sm text-gray-500">AI is scanning the page for menu items and prices. This takes 5–15 seconds.</p>
        <p className="text-xs text-gray-400 mt-3 font-mono truncate max-w-xs mx-auto">{url}</p>
      </div>
    );
  }

  // ── Input screen ───────────────────────────────────────────────────────────
  return (
    <div className="max-w-xl mx-auto py-4">
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <X className="h-4 w-4" /> Back
      </button>

      {/* Tab switcher */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-8">
        <button onClick={() => { setTab('url'); setErrorMsg(''); }}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${tab === 'url' ? 'bg-white text-[#1A1A2E] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
          <Globe className="h-4 w-4" /> Import from Website
        </button>
        <button onClick={() => { setTab('qr'); setErrorMsg(''); }}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${tab === 'qr' ? 'bg-white text-[#1A1A2E] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
          <QrCode className="h-4 w-4" /> Scan QR Code
        </button>
      </div>

      {tab === 'url' ? (
        <>
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Globe className="h-7 w-7 text-amber-700" />
            </div>
            <h2 className="text-xl font-black text-[#1A1A2E] mb-1">Import from Website</h2>
            <p className="text-sm text-gray-500">Paste the link to your restaurant page and AI will extract the menu automatically.</p>
          </div>

          {errorMsg && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-xl p-3 mb-4 text-sm text-red-600">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Website or menu page URL</label>
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchMenu()}
              placeholder="e.g. facebook.com/yourrestaurant or jumia.com.sl/…"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B8C4E]"
            />
          </div>

          <button
            onClick={fetchMenu}
            disabled={!url.trim()}
            className="w-full bg-[#1B8C4E] text-white py-3.5 rounded-xl font-bold text-sm hover:bg-[#146B3A] disabled:opacity-50 transition-colors"
          >
            Extract Menu
          </button>

          <div className="mt-6 bg-gray-50 rounded-xl p-4">
            <p className="text-xs font-bold text-gray-600 mb-2 uppercase">Works well with</p>
            <ul className="space-y-1.5 text-xs text-gray-500">
              <li>✅ Facebook restaurant pages with a menu tab</li>
              <li>✅ Your own restaurant website</li>
              <li>✅ Jumia Food, Glovo, or any food delivery listing</li>
              <li>⚠️ Some pages require login and won't work — try photo scan instead</li>
            </ul>
          </div>
        </>
      ) : (
        <>
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-teal-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <QrCode className="h-7 w-7 text-teal-700" />
            </div>
            <h2 className="text-xl font-black text-[#1A1A2E] mb-1">Scan QR Code</h2>
            <p className="text-sm text-gray-500">Take a photo of the QR code on your existing menu or another platform. We'll read the link and import the menu automatically.</p>
          </div>

          {errorMsg && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-xl p-3 mb-4 text-sm text-red-600">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <input ref={qrRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleQrFile} />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            <button
              onClick={() => { if (qrRef.current) { qrRef.current.removeAttribute('capture'); qrRef.current.click(); } }}
              disabled={qrDecoding}
              className="flex flex-col items-center gap-3 border-2 border-dashed border-teal-200 rounded-2xl p-6 hover:border-teal-400 hover:bg-teal-50 transition-colors disabled:opacity-50"
            >
              <QrCode className="h-8 w-8 text-teal-500" />
              <span className="text-sm font-bold text-gray-700">Upload QR Image</span>
              <span className="text-xs text-gray-400">From your gallery</span>
            </button>
            <button
              onClick={() => { if (qrRef.current) { qrRef.current.setAttribute('capture', 'environment'); qrRef.current.click(); } }}
              disabled={qrDecoding}
              className="flex flex-col items-center gap-3 border-2 border-dashed border-teal-200 rounded-2xl p-6 hover:border-teal-400 hover:bg-teal-50 transition-colors disabled:opacity-50"
            >
              <Camera className="h-8 w-8 text-teal-500" />
              <span className="text-sm font-bold text-gray-700">Use Camera</span>
              <span className="text-xs text-gray-400">Point at QR code</span>
            </button>
          </div>

          {qrDecoding && (
            <div className="flex items-center justify-center gap-2 text-teal-700 py-4">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm font-semibold">Reading QR code…</span>
            </div>
          )}

          <p className="text-center text-xs text-gray-400">
            After scanning, the website link will be auto-filled and the menu will be imported.
          </p>
        </>
      )}
    </div>
  );
}
