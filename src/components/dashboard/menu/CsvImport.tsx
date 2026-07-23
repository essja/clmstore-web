'use client';
import { useRef, useState } from 'react';
import { Upload, ChevronRight, Check, Trash2, Plus, X, FileSpreadsheet, AlertCircle } from 'lucide-react';
import { restaurantApi } from '@/lib/api';
import toast from 'react-hot-toast';

interface ParsedItem {
  name: string;
  description: string;
  price: string;
  keep: boolean;
}

interface ParsedCategory {
  name: string;
  items: ParsedItem[];
  keep: boolean;
}

function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) continue;
    const cols: string[] = [];
    let cur = '';
    let inQ = false;
    for (const ch of line) {
      if (ch === '"') { inQ = !inQ; }
      else if ((ch === ',' || ch === '\t') && !inQ) { cols.push(cur.trim()); cur = ''; }
      else cur += ch;
    }
    cols.push(cur.trim());
    if (cols.some((c) => c)) rows.push(cols);
  }
  return rows;
}

function buildMenu(rows: string[][]): ParsedCategory[] {
  if (rows.length === 0) return [];
  const header = rows[0].map((h) => h.toLowerCase().replace(/[^a-z]/g, ''));
  const catIdx = header.findIndex((h) => h.includes('cat') || h.includes('section') || h.includes('group'));
  const nameIdx = header.findIndex((h) => h.includes('name') || h.includes('item') || h.includes('dish') || h.includes('food'));
  const descIdx = header.findIndex((h) => h.includes('desc'));
  const priceIdx = header.findIndex((h) => h.includes('price') || h.includes('cost') || h.includes('amount'));

  if (nameIdx === -1 && priceIdx === -1) {
    // No header — treat first col as category, second as name, third as price
    const cats: Record<string, ParsedItem[]> = {};
    for (const row of rows) {
      if (row.length < 2) continue;
      const cat = row[0] || 'Main Menu';
      const name = row[1] || '';
      const desc = row[2] || '';
      const price = row[3] || row[2] || '';
      if (!name) continue;
      if (!cats[cat]) cats[cat] = [];
      cats[cat].push({ name, description: desc, price: price.replace(/[^0-9.]/g, ''), keep: true });
    }
    return Object.entries(cats).map(([name, items]) => ({ name, items, keep: true }));
  }

  const catMap: Record<string, ParsedItem[]> = {};
  let currentCat = 'Main Menu';

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (catIdx !== -1 && row[catIdx]) currentCat = row[catIdx];
    const name = nameIdx !== -1 ? (row[nameIdx] || '') : (row[0] || '');
    if (!name) continue;
    const desc = descIdx !== -1 ? (row[descIdx] || '') : '';
    const priceRaw = priceIdx !== -1 ? (row[priceIdx] || '') : '';
    const price = priceRaw.replace(/[^0-9.]/g, '');

    if (!catMap[currentCat]) catMap[currentCat] = [];
    catMap[currentCat].push({ name, description: desc, price, keep: true });
  }

  return Object.entries(catMap).map(([name, items]) => ({ name, items, keep: true }));
}

interface Props {
  restaurantId: number;
  onDone: () => void;
  onBack: () => void;
}

export default function CsvImport({ restaurantId, onDone, onBack }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<'upload' | 'review'>('upload');
  const [parsed, setParsed] = useState<ParsedCategory[]>([]);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const rows = parseCSV(text);
      const menu = buildMenu(rows);
      if (menu.length === 0 || menu.every((c) => c.items.length === 0)) {
        toast.error("Couldn't read your file. Please check the format and try again.");
        return;
      }
      setParsed(menu);
      setStep('review');
    };
    reader.readAsText(file);
  };

  const updateItem = (ci: number, ii: number, field: keyof ParsedItem, value: string | boolean) => {
    setParsed((prev) => {
      const next = [...prev];
      next[ci] = { ...next[ci], items: [...next[ci].items] };
      (next[ci].items[ii] as any)[field] = value;
      return next;
    });
  };

  const removeItem = (ci: number, ii: number) => {
    setParsed((prev) => {
      const next = [...prev];
      next[ci] = { ...next[ci], items: next[ci].items.filter((_, i) => i !== ii) };
      return next;
    });
  };

  const addItem = (ci: number) => {
    setParsed((prev) => {
      const next = [...prev];
      next[ci] = { ...next[ci], items: [...next[ci].items, { name: '', description: '', price: '', keep: true }] };
      return next;
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
      toast.error(err?.response?.data?.detail ?? 'Import failed. Please try again.');
      setImporting(false);
    }
  };

  if (step === 'upload') {
    return (
      <div className="max-w-xl mx-auto py-4">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6">
          <X className="h-4 w-4" /> Back
        </button>

        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <FileSpreadsheet className="h-7 w-7 text-blue-700" />
          </div>
          <h2 className="text-xl font-black text-[#1A1A2E] mb-1">Upload CSV / Excel</h2>
          <p className="text-sm text-gray-500">We'll read your file and let you review before publishing.</p>
        </div>

        <div
          onClick={() => fileRef.current?.click()}
          className="border-2 border-dashed border-blue-200 rounded-2xl p-10 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors mb-4"
        >
          <Upload className="h-10 w-10 text-blue-300 mx-auto mb-3" />
          <p className="font-semibold text-gray-700 mb-1">Click to upload</p>
          <p className="text-xs text-gray-400">CSV, TSV, or Excel (.csv .tsv .txt)</p>
          <input ref={fileRef} type="file" accept=".csv,.tsv,.txt" className="hidden" onChange={handleFile} />
        </div>

        <div className="bg-gray-50 rounded-xl p-4">
          <p className="text-xs font-bold text-gray-600 mb-2 uppercase">Expected CSV format</p>
          <div className="font-mono text-xs text-gray-600 bg-white rounded-lg p-3 border border-gray-100 overflow-x-auto">
            <div className="text-gray-400">Category, Item Name, Description, Price</div>
            <div>Rice Dishes, Jollof Rice, Classic Sierra Leonean, 35000</div>
            <div>Rice Dishes, Fried Rice, With vegetables, 30000</div>
            <div>Drinks, Fanta, Cold orange soda, 5000</div>
          </div>
          <p className="text-[11px] text-gray-400 mt-2">
            Column order can vary — we detect headers automatically. Price can include "Le" or commas.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-black text-[#1A1A2E]">Review your menu</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {parsed.filter((c) => c.keep).length} categories · {totalItems} items found
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setStep('upload')} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded-xl">
            Re-upload
          </button>
          <button
            onClick={importMenu}
            disabled={importing || totalItems === 0}
            className="flex items-center gap-2 bg-[#1B8C4E] text-white px-5 py-2 rounded-xl text-sm font-bold hover:bg-[#146B3A] disabled:opacity-60"
          >
            {importing ? (
              <>
                <div className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {progress}%
              </>
            ) : (
              <>
                <Check className="h-4 w-4" /> Publish Menu
              </>
            )}
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
                onChange={(e) => setParsed((prev) => { const n = [...prev]; n[ci] = { ...n[ci], keep: e.target.checked }; return n; })}
                className="accent-[#1B8C4E] w-4 h-4" />
              <input
                value={cat.name}
                onChange={(e) => setParsed((prev) => { const n = [...prev]; n[ci] = { ...n[ci], name: e.target.value }; return n; })}
                className="flex-1 font-bold text-[#1A1A2E] bg-transparent focus:outline-none focus:bg-white focus:px-2 focus:rounded-lg transition-all"
              />
              <span className="text-xs text-gray-400">{cat.items.filter((i) => i.keep).length} items</span>
            </div>

            <div className="divide-y divide-gray-50">
              {cat.items.map((item, ii) => (
                <div key={ii} className={`flex items-center gap-3 px-4 py-2.5 ${!item.keep ? 'opacity-40' : ''}`}>
                  <input type="checkbox" checked={item.keep}
                    onChange={(e) => updateItem(ci, ii, 'keep', e.target.checked)}
                    className="accent-[#1B8C4E] w-3.5 h-3.5 shrink-0" />
                  <input
                    value={item.name}
                    onChange={(e) => updateItem(ci, ii, 'name', e.target.value)}
                    placeholder="Item name"
                    className="flex-1 text-sm text-gray-800 bg-transparent focus:outline-none focus:bg-gray-50 focus:px-2 focus:rounded-lg min-w-0"
                  />
                  <input
                    value={item.description}
                    onChange={(e) => updateItem(ci, ii, 'description', e.target.value)}
                    placeholder="Description (optional)"
                    className="w-36 sm:w-48 text-xs text-gray-400 bg-transparent focus:outline-none focus:bg-gray-50 focus:px-2 focus:rounded-lg hidden sm:block"
                  />
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-xs text-gray-400">Le</span>
                    <input
                      value={item.price}
                      onChange={(e) => updateItem(ci, ii, 'price', e.target.value.replace(/[^0-9.]/g, ''))}
                      placeholder="0"
                      className="w-20 text-sm font-semibold text-[#1B8C4E] bg-transparent focus:outline-none focus:bg-gray-50 focus:px-2 focus:rounded-lg text-right"
                    />
                  </div>
                  <button onClick={() => removeItem(ci, ii)} className="text-gray-200 hover:text-red-400 shrink-0">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
              <div className="px-4 py-2">
                <button onClick={() => addItem(ci)} className="flex items-center gap-1.5 text-xs text-[#1B8C4E] hover:underline">
                  <Plus className="h-3.5 w-3.5" /> Add item
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {totalItems === 0 && (
        <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 rounded-xl p-3 mt-4">
          <AlertCircle className="h-4 w-4 shrink-0" />
          No valid items selected. Check boxes above or add items manually.
        </div>
      )}
    </div>
  );
}
