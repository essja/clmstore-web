'use client';
import { useState } from 'react';
import { QrCode, Copy, ExternalLink, Download, X } from 'lucide-react';
import QRCode from 'react-qr-code';
import toast from 'react-hot-toast';

interface Props {
  slug: string;
  restaurantName: string;
  onClose: () => void;
}

export default function MenuQRPanel({ slug, restaurantName, onClose }: Props) {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const menuUrl = `${baseUrl}/restaurants/${slug}`;

  const copyLink = () => {
    navigator.clipboard.writeText(menuUrl);
    toast.success('Link copied!');
  };

  const downloadQR = () => {
    const svg = document.getElementById('menu-qr-svg');
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    canvas.width = 300;
    canvas.height = 300;
    const ctx = canvas.getContext('2d')!;
    const img = new Image();
    img.onload = () => {
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, 300, 300);
      ctx.drawImage(img, 0, 0, 300, 300);
      const link = document.createElement('a');
      link.download = `${slug}-menu-qr.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <QrCode className="h-5 w-5 text-[#1B8C4E]" />
            <h3 className="font-black text-[#1A1A2E]">Digital Menu</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* QR Code */}
        <div className="flex flex-col items-center bg-gray-50 rounded-2xl p-6 mb-5">
          <div id="menu-qr-svg" className="bg-white p-4 rounded-xl shadow-sm">
            <QRCode value={menuUrl} size={180} />
          </div>
          <p className="text-xs text-gray-500 mt-3 text-center font-medium">{restaurantName}</p>
          <p className="text-[10px] text-gray-400 mt-0.5">Scan to view menu</p>
        </div>

        {/* Public link */}
        <div className="bg-gray-50 rounded-xl px-3 py-2.5 flex items-center gap-2 mb-4">
          <span className="text-xs text-gray-500 flex-1 truncate">{menuUrl}</span>
          <button onClick={copyLink} className="shrink-0 p-1 text-gray-400 hover:text-[#1B8C4E]">
            <Copy className="h-3.5 w-3.5" />
          </button>
          <a href={menuUrl} target="_blank" rel="noreferrer" className="shrink-0 p-1 text-gray-400 hover:text-[#1B8C4E]">
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button onClick={copyLink}
            className="flex items-center justify-center gap-2 border border-gray-200 text-gray-700 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50">
            <Copy className="h-4 w-4" /> Copy Link
          </button>
          <button onClick={downloadQR}
            className="flex items-center justify-center gap-2 bg-[#1B8C4E] text-white py-2.5 rounded-xl text-sm font-bold hover:bg-[#146B3A]">
            <Download className="h-4 w-4" /> Download QR
          </button>
        </div>

        <p className="text-[11px] text-gray-400 text-center mt-3">
          Print the QR code and place it on your tables so customers can order directly.
        </p>
      </div>
    </div>
  );
}
