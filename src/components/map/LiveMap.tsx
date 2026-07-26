'use client';
import { useEffect, useRef, useState } from 'react';
import { MapPin, Navigation, Compass, Layers, Phone } from 'lucide-react';

interface MarkerData {
  id: string | number;
  lat: number;
  lng: number;
  title: string;
  type: 'store' | 'rider' | 'customer';
  address?: string;
}

interface LiveMapProps {
  markers?: MarkerData[];
  center?: { lat: number; lng: number };
  zoom?: number;
  height?: string;
  orderId?: number;
  riderLocation?: { lat: number; lng: number } | null;
  deliveryAddress?: any;
}

const DEFAULT_CENTER = { lat: 8.4844, lng: -13.2299 }; // Freetown, Sierra Leone

export default function LiveMap({
  markers = [],
  center = DEFAULT_CENTER,
  zoom = 13,
  height = '420px',
}: LiveMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const [mapMode, setMapMode] = useState<'leaflet' | 'google'>('leaflet');
  const [userPos, setUserPos] = useState<{ lat: number; lng: number } | null>(null);

  // Initialize Leaflet Map dynamically
  useEffect(() => {
    if (mapMode !== 'leaflet' || !mapContainerRef.current) return;

    let L: any;
    let isSubscribed = true;

    import('leaflet').then((leafletModule) => {
      if (!isSubscribed || !mapContainerRef.current) return;
      L = leafletModule.default || leafletModule;

      // Fix default Leaflet CSS link if missing
      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link');
        link.id = 'leaflet-css';
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      // Cleanup existing instance
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }

      const map = L.map(mapContainerRef.current).setView(
        [center.lat, center.lng],
        zoom
      );

      // OpenStreetMap Tiles (free, global high resolution)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors',
      }).addTo(map);

      leafletMapRef.current = map;

      // Create Custom Emoji Pin Markers
      const createEmojiIcon = (emoji: string, bg: string) =>
        L.divIcon({
          className: 'custom-leaflet-marker',
          html: `<div style="
            width:38px; height:38px; border-radius:50%; background:${bg};
            display:flex; align-items:center; justify-content:center;
            font-size:20px; border:3px solid #ffffff;
            box-shadow: 0 4px 14px rgba(0,0,0,0.25);
          ">${emoji}</div>`,
          iconSize: [38, 38],
          iconAnchor: [19, 19],
        });

      // Add Default Freetown Center Marker if empty
      const activeMarkers: MarkerData[] = markers.length > 0 ? markers : [
        { id: 'freetown', lat: 8.4844, lng: -13.2299, title: 'Freetown Central', type: 'store' },
        { id: 'lumley', lat: 8.4550, lng: -13.2750, title: 'Lumley Beach Road', type: 'customer' },
        { id: 'rider1', lat: 8.4720, lng: -13.2450, title: 'Active Rider Job', type: 'rider' },
      ];

      activeMarkers.forEach((m) => {
        let icon;
        if (m.type === 'store') icon = createEmojiIcon('🍽️', '#10b981');
        else if (m.type === 'rider') icon = createEmojiIcon('🛵', '#059669');
        else icon = createEmojiIcon('🏠', '#3b82f6');

        const marker = L.marker([m.lat, m.lng], { icon }).addTo(map);
        marker.bindPopup(`
          <div style="font-family:sans-serif; padding:4px;">
            <strong style="font-size:14px; color:#0f172a;">${m.title}</strong>
            ${m.address ? `<p style="font-size:12px; color:#64748b; margin-top:2px;">${m.address}</p>` : ''}
          </div>
        `);
      });
    });

    return () => {
      isSubscribed = false;
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, [mapMode, center.lat, center.lng, zoom, markers]);

  // Handle Geolocation
  const handleLocateMe = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const newCenter = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setUserPos(newCenter);
          if (leafletMapRef.current) {
            leafletMapRef.current.setView([newCenter.lat, newCenter.lng], 15);
          }
        },
        () => {}
      );
    }
  };

  const googleMapsUrl = `https://maps.google.com/maps?q=${encodeURIComponent(
    `${center.lat},${center.lng}`
  )}&z=${zoom}&output=embed`;

  return (
    <div className="premium-card" style={{ overflow: 'hidden', background: '#ffffff', borderRadius: '24px' }}>
      
      {/* Map Control Header Bar */}
      <div style={{
        padding: '14px 20px', background: '#0b132b', color: '#ffffff',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Compass size={18} style={{ color: '#10b981' }} />
          <span style={{ fontWeight: 800, fontSize: '14px', color: '#ffffff' }}>
            GPS Live Map — Freetown, Sierra Leone 🇸🇱
          </span>
        </div>

        {/* View Toggle Tabs */}
        <div style={{ display: 'flex', gap: '6px', background: 'rgba(255,255,255,0.1)', padding: '3px', borderRadius: '99px' }}>
          <button
            onClick={() => setMapMode('leaflet')}
            style={{
              padding: '5px 14px', borderRadius: '99px', fontSize: '12px', fontWeight: 800,
              border: 'none', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s',
              background: mapMode === 'leaflet' ? '#10b981' : 'transparent',
              color: '#ffffff',
            }}
          >
            Interactive Vector Map
          </button>
          <button
            onClick={() => setMapMode('google')}
            style={{
              padding: '5px 14px', borderRadius: '99px', fontSize: '12px', fontWeight: 800,
              border: 'none', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s',
              background: mapMode === 'google' ? '#10b981' : 'transparent',
              color: '#ffffff',
            }}
          >
            Google Maps View
          </button>
        </div>
      </div>

      {/* Map View Body */}
      <div style={{ position: 'relative', width: '100%', height: height }}>
        {mapMode === 'leaflet' ? (
          <div ref={mapContainerRef} style={{ width: '100%', height: '100%', zIndex: 1 }} />
        ) : (
          <iframe
            title="Google Maps Freetown"
            src={googleMapsUrl}
            style={{ width: '100%', height: '100%', border: 'none' }}
            allowFullScreen
          />
        )}

        {/* Locate Me Floating Button */}
        <button
          onClick={handleLocateMe}
          style={{
            position: 'absolute', bottom: '20px', right: '20px', zIndex: 10,
            background: '#ffffff', color: '#0f172a', border: '1px solid #e2e8f0',
            padding: '10px 16px', borderRadius: '14px', fontWeight: 800, fontSize: '13px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.15)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '6px',
          }}
        >
          <Navigation size={15} style={{ color: '#10b981' }} /> Recenter GPS
        </button>
      </div>
    </div>
  );
}
