'use client';


 

import { useEffect, useRef, useState, useCallback } from 'react';


 

interface LocationPickerProps {

  lat?: number | null;

  lng?: number | null;

  onSelect: (lat: number, lng: number) => void;

  onClear: () => void;

}


 

// Dubai default center

const DEFAULT_LAT = 25.2048;

const DEFAULT_LNG = 55.2708;

const DEFAULT_ZOOM = 11;

const PIN_ZOOM = 15;


 

// Brand-colored SVG pin icon for Leaflet

const PIN_HTML = `

  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="42" viewBox="0 0 32 42" style="filter:drop-shadow(0 2px 6px rgba(0,0,0,.35))">

    <ellipse cx="16" cy="40" rx="5" ry="2" fill="rgba(0,0,0,.25)"/>

    <path d="M16 0C9.4 0 4 5.4 4 12c0 9 12 28 12 28S28 21 28 12C28 5.4 22.6 0 16 0z" fill="#D8B15A"/>

    <circle cx="16" cy="12" r="5.5" fill="#162019"/>

  </svg>`;


 

export default function LocationPicker({ lat, lng, onSelect, onClear }: LocationPickerProps) {

  const containerRef      = useRef<HTMLDivElement>(null);

  const mapRef            = useRef<any>(null);

  const markerRef         = useRef<any>(null);

  const [ready, setReady] = useState(false);

  const [locating, setLocating] = useState(false);

  const [geoError, setGeoError] = useState<string | null>(null);


 

  // ─── Load Leaflet from CDN ───────────────────────────────

  useEffect(() => {

    if (typeof window === 'undefined') return;

    if ((window as any).L) { setReady(true); return; }


 

    const css   = document.createElement('link');

    css.rel     = 'stylesheet';

    css.href    = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';

    document.head.appendChild(css);


 

    const script   = document.createElement('script');

    script.src     = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';

    script.onload  = () => setReady(true);

    script.onerror = () => console.error('Failed to load Leaflet');

    document.head.appendChild(script);

  }, []);


 

  // ─── Initialize map ──────────────────────────────────────

  useEffect(() => {

    if (!ready || !containerRef.current || mapRef.current) return;


 

    const L   = (window as any).L;

    const map = L.map(containerRef.current, {

      center:      [lat ?? DEFAULT_LAT, lng ?? DEFAULT_LNG],

      zoom:        lat ? PIN_ZOOM : DEFAULT_ZOOM,

      zoomControl: true,

    });


 

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {

      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>',

      maxZoom: 19,

    }).addTo(map);


 

    const icon = L.divIcon({

      html:       PIN_HTML,

      iconSize:   [32, 42],

      iconAnchor: [16, 42],

      className:  '',

    });


 

    // Place existing marker if coords provided

    if (lat && lng) {

      const m = L.marker([lat, lng], { icon, draggable: true }).addTo(map);

      m.on('dragend', () => {

        const { lat: ml, lng: mg } = m.getLatLng();

        onSelect(parseFloat(ml.toFixed(7)), parseFloat(mg.toFixed(7)));

      });

      markerRef.current = m;

    }


 

    // Click on map to place / move pin

    map.on('click', (e: any) => {

      const newLat = parseFloat(e.latlng.lat.toFixed(7));

      const newLng = parseFloat(e.latlng.lng.toFixed(7));


 

      if (markerRef.current) {

        markerRef.current.setLatLng([newLat, newLng]);

      } else {

        const m = L.marker([newLat, newLng], { icon, draggable: true }).addTo(map);

        m.on('dragend', () => {

          const { lat: ml, lng: mg } = m.getLatLng();

          onSelect(parseFloat(ml.toFixed(7)), parseFloat(mg.toFixed(7)));

        });

        markerRef.current = m;

      }

      onSelect(newLat, newLng);

    });


 

    mapRef.current = map;


 

    return () => {

      map.remove();

      mapRef.current    = null;

      markerRef.current = null;

    };

    // eslint-disable-next-line react-hooks/exhaustive-deps

  }, [ready]);


 

  // ─── Sync external lat/lng changes into map ──────────────

  useEffect(() => {

    if (!mapRef.current || !ready) return;

    const L = (window as any).L;


 

    if (lat && lng) {

      mapRef.current.setView([lat, lng], PIN_ZOOM);

      if (markerRef.current) {

        markerRef.current.setLatLng([lat, lng]);

      } else {

        const icon = L.divIcon({ html: PIN_HTML, iconSize: [32, 42], iconAnchor: [16, 42], className: '' });

        const m = L.marker([lat, lng], { icon, draggable: true }).addTo(mapRef.current);

        m.on('dragend', () => {

          const { lat: ml, lng: mg } = m.getLatLng();

          onSelect(parseFloat(ml.toFixed(7)), parseFloat(mg.toFixed(7)));

        });

        markerRef.current = m;

      }

    } else {

      if (markerRef.current) {

        mapRef.current.removeLayer(markerRef.current);

        markerRef.current = null;

      }

    }

    // eslint-disable-next-line react-hooks/exhaustive-deps

  }, [lat, lng, ready]);


 

  // ─── Use current location ────────────────────────────────

  const handleMyLocation = useCallback(() => {

    setGeoError(null);

    if (!navigator.geolocation) {

      setGeoError('Your browser does not support location access.');

      return;

    }

    setLocating(true);

    navigator.geolocation.getCurrentPosition(

      (pos) => {

        const { latitude, longitude } = pos.coords;

        onSelect(parseFloat(latitude.toFixed(7)), parseFloat(longitude.toFixed(7)));

        setLocating(false);

      },

      (err) => {

        const msgs: Record<number, string> = {

          1: 'Location access denied. Please allow it in your browser.',

          2: 'Location unavailable. Try again.',

          3: 'Location request timed out.',

        };

        setGeoError(msgs[err.code] ?? 'Could not get location.');

        setLocating(false);

      },

      { timeout: 10_000, enableHighAccuracy: true }

    );

  }, [onSelect]);


 

  // ─── Clear pin ───────────────────────────────────────────

  const handleClear = useCallback(() => {

    if (markerRef.current && mapRef.current) {

      mapRef.current.removeLayer(markerRef.current);

      markerRef.current = null;

    }

    onClear();

  }, [onClear]);


 

  return (

    <div>

      {/* Label row */}

      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">

        <label className="text-[12px] font-semibold uppercase tracking-[0.08em]" style={{ color: '#4B5A50' }}>

          Drop a Pin{' '}

          <span className="font-normal normal-case tracking-normal" style={{ color: 'rgba(22,32,25,.4)' }}>(optional — helps driver find you)</span>

        </label>

        <div className="flex gap-2">

          <button

            type="button"

            onClick={handleMyLocation}

            disabled={locating}

            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-semibold transition-colors disabled:opacity-50"

            style={{ background: '#162019', color: '#D8B15A' }}

          >

            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">

              <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/>

              <line x1="12" y1="2" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="22"/>

              <line x1="2" y1="12" x2="5" y2="12"/><line x1="19" y1="12" x2="22" y2="12"/>

            </svg>

            {locating ? 'Locating…' : 'Use my location'}

          </button>

          {lat && lng && (

            <button

              type="button"

              onClick={handleClear}

              className="rounded-full px-3 py-1.5 text-[12px] font-medium transition-colors"

              style={{ border: '1px solid rgba(22,32,25,.15)', color: '#4B5A50' }}

            >

              Clear pin

            </button>

          )}

        </div>

      </div>


 

      {/* Map container */}

      <div

        className="overflow-hidden rounded-[14px]"

        style={{ border: '1px solid rgba(22,32,25,.12)', position: 'relative', isolation: 'isolate' }}

      >

        {!ready && (

          <div className="flex items-center justify-center" style={{ height: 260, background: '#F6F2E9' }}>

            <div

              className="h-5 w-5 animate-spin rounded-full border-2"

              style={{ borderColor: '#D8B15A', borderTopColor: 'transparent' }}

            />

          </div>

        )}

        <div

          ref={containerRef}

          style={{ height: 260, display: ready ? 'block' : 'none' }}

          aria-label="Delivery location map"

        />

        {/* Hint overlay when no pin is set */}

        {ready && !lat && (

          <div

            className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-1.5 text-[11px] font-medium"

            style={{ background: 'rgba(22,32,25,.72)', color: '#F6F2E9', backdropFilter: 'blur(4px)', whiteSpace: 'nowrap' }}

          >

            Tap the map to drop a pin

          </div>

        )}

      </div>


 

      {/* Coordinates / status line */}

      {lat && lng ? (

        <p className="mt-1.5 text-[12px]" style={{ color: '#4B5A50' }}>

          Pin set —{' '}

          <span className="font-mono">{lat.toFixed(5)}, {lng.toFixed(5)}</span>

          <span className="ml-2" style={{ color: 'rgba(22,32,25,.4)' }}>· drag to adjust</span>

        </p>

      ) : (

        <p className="mt-1.5 text-[12px]" style={{ color: 'rgba(22,32,25,.35)' }}>

          No pin set. Tap the map or use &ldquo;Use my location&rdquo;.

        </p>

      )}


 

      {geoError && (

        <p className="mt-2 rounded-[10px] px-3 py-2 text-[12px]"

          style={{ background: 'rgba(185,58,58,.06)', color: '#b93a3a' }}>

          {geoError}

        </p>

      )}

    </div>

  );

}