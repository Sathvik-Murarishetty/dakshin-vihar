'use client';


 

import { useState } from 'react';

import Link from 'next/link';


 

export interface DeliveryStop {

  orderId:      string;

  customerName: string;

  customerPhone?: string | null;

  addressLine1: string;

  city:         string;

  lat?:         number | null;

  lng?:         number | null;

  status:       string;

  finalAmount:  number;

}


 

/* ── Nearest-neighbour route optimisation ─────────────────────

   Sorts stops with coords by proximity; appends coord-less stops

   at the end. Works for 4-10 stops (diminishing returns beyond). */

function optimiseRoute(stops: DeliveryStop[]): DeliveryStop[] {

  const withCoords    = stops.filter((s) => s.lat != null && s.lng != null);

  const withoutCoords = stops.filter((s) => s.lat == null || s.lng == null);


 

  if (withCoords.length <= 1) return [...withCoords, ...withoutCoords];


 

  const result: DeliveryStop[]  = [];

  let   remaining: DeliveryStop[] = [...withCoords];

  let   current   = remaining.shift()!;

  result.push(current);


 

  while (remaining.length > 0) {

    let nearestIdx  = 0;

    let nearestDist = Infinity;

    for (let i = 0; i < remaining.length; i++) {

      const dist = Math.sqrt(

        Math.pow(remaining[i].lat! - current.lat!, 2) +

        Math.pow(remaining[i].lng! - current.lng!, 2),

      );

      if (dist < nearestDist) { nearestDist = dist; nearestIdx = i; }

    }

    current = remaining.splice(nearestIdx, 1)[0];

    result.push(current);

  }


 

  return [...result, ...withoutCoords];

}


 

/* ── Google Maps URL helpers ─────────────────────────────────── */

function stopToParam(s: DeliveryStop): string {

  if (s.lat != null && s.lng != null) return `${s.lat},${s.lng}`;

  return encodeURIComponent(`${s.addressLine1}, ${s.city}`);

}


 

function singleNavUrl(s: DeliveryStop): string {

  const dest = s.lat != null && s.lng != null

    ? `${s.lat},${s.lng}`

    : encodeURIComponent(`${s.addressLine1}, ${s.city}`);

  return `https://www.google.com/maps/dir/?api=1&destination=${dest}&travelmode=driving`;

}


 

function buildRouteUrl(stops: DeliveryStop[]): string {

  // Google Maps dir URL: /dir/stop1/stop2/.../stopN

  // First stop = starting point, rest = waypoints

  const params = stops.map(stopToParam);

  return `https://www.google.com/maps/dir/${params.join('/')}`;

}


 

/* ── Component ───────────────────────────────────────────────── */

const STATUS_STYLE: Record<string, React.CSSProperties> = {

  confirmed:        { background: 'rgba(22,32,25,.06)',   color: '#4B5A50' },

  preparing:        { background: 'rgba(216,177,90,.1)',  color: '#b98a3d' },

  out_for_delivery: { background: 'rgba(22,100,200,.08)', color: '#1a64c8' },

  delivered:        { background: 'rgba(22,160,133,.08)', color: '#16a34a' },

};


 

interface Props {

  stops:   DeliveryStop[];

  today:   string;

}


 

export default function DeliveryRoutePanel({ stops, today }: Props) {

  const [optimised, setOptimised] = useState(false);

  const [routeStops, setRouteStops] = useState<DeliveryStop[]>(stops);


 

  const missingCoords = stops.filter((s) => s.lat == null || s.lng == null);

  const hasAnyCoords  = stops.some((s)  => s.lat != null && s.lng != null);


 

  function handleOptimise() {

    const sorted = optimiseRoute(stops);

    setRouteStops(sorted);

    setOptimised(true);

  }


 

  if (!stops.length) {

    return (

      <p className="text-[14px]" style={{ color: '#4B5A50' }}>

        No pending deliveries for today.

      </p>

    );

  }


 

  return (

    <div className="flex flex-col gap-4">


 

      {/* ── Action bar ─────────────────────────────────────────── */}

      <div className="flex flex-wrap items-center gap-3">

        {/* Plan optimised route */}

        {stops.length > 1 && (

          <button

            onClick={handleOptimise}

            className="flex items-center gap-2 rounded-full px-4 py-2 text-[13px] font-semibold"

            style={{ background: '#162019', color: '#F6F2E9' }}

          >

            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">

              <path d="M3 12h18M3 6h18M3 18h18"/>

            </svg>

            {optimised ? 'Re-optimise Route' : 'Optimise Route'}

          </button>

        )}


 

        {/* Open all in Google Maps */}

        {stops.length > 0 && (

          <a

            href={buildRouteUrl(optimised ? routeStops : stops)}

            target="_blank"

            rel="noopener noreferrer"

            className="flex items-center gap-2 rounded-full px-4 py-2 text-[13px] font-semibold"

            style={{ background: 'rgba(216,177,90,.12)', color: '#b98a3d', border: '1px solid rgba(216,177,90,.3)' }}

          >

            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">

              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>

              <circle cx="12" cy="10" r="3"/>

            </svg>

            Open Full Route in Maps ({stops.length} stops)

          </a>

        )}

      </div>


 

      {/* ── Missing coords notice ───────────────────────────────── */}

      {missingCoords.length > 0 && (

        <div className="rounded-[12px] px-4 py-3 text-[12px]"

          style={{ background: 'rgba(216,177,90,.08)', border: '1px solid rgba(216,177,90,.2)', color: '#b98a3d' }}>

          <strong>{missingCoords.length} address{missingCoords.length > 1 ? 'es' : ''}</strong> without GPS coordinates

          — will use text address for navigation (slightly less precise).

        </div>

      )}


 

      {/* ── Optimised order badge ───────────────────────────────── */}

      {optimised && hasAnyCoords && (

        <div className="rounded-[12px] px-4 py-2.5 text-[12px]"

          style={{ background: 'rgba(22,160,133,.06)', border: '1px solid rgba(22,160,133,.2)', color: '#16a34a' }}>

          ✓ Route optimised by proximity — stops without coordinates appended at end.

          Addresses-only stops: open in Maps and tap <strong>Optimise order</strong> for best result.

        </div>

      )}


 

      {/* ── Delivery list ───────────────────────────────────────── */}

      <div className="flex flex-col gap-3">

        {(optimised ? routeStops : stops).map((s, idx) => (

          <div key={s.orderId}

            className="rounded-[16px] p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"

            style={{ background: '#FCFBF8', border: '1px solid rgba(22,32,25,.08)' }}>


 

            {/* Stop number + info */}

            <div className="flex items-start gap-3">

              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[12px] font-bold"

                style={{ background: 'rgba(22,32,25,.08)', color: '#162019' }}>

                {idx + 1}

              </div>

              <div>

                <p className="font-semibold text-[14px]" style={{ color: '#162019' }}>

                  {s.customerName}

                  {s.customerPhone && (

                    <a href={`tel:${s.customerPhone}`}

                      className="ml-2 font-normal text-[12px]"

                      style={{ color: '#D8B15A' }}>

                      {s.customerPhone}

                    </a>

                  )}

                </p>

                <p className="text-[12px]" style={{ color: '#4B5A50' }}>

                  {s.addressLine1}, {s.city}

                </p>

                <div className="mt-1 flex items-center gap-2 flex-wrap">

                  <span className="rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize"

                    style={STATUS_STYLE[s.status] ?? {}}>

                    {s.status.replace(/_/g, ' ')}

                  </span>

                  <span className="text-[11px] font-semibold" style={{ color: '#162019' }}>

                    AED {s.finalAmount}

                  </span>

                  {/* Coords badge */}

                  {s.lat != null ? (

                    <span className="text-[10px] rounded-full px-2 py-0.5"

                      style={{ background: 'rgba(22,160,133,.08)', color: '#16a34a' }}>

                      GPS ✓

                    </span>

                  ) : (

                    <span className="text-[10px] rounded-full px-2 py-0.5"

                      style={{ background: 'rgba(216,177,90,.08)', color: '#b98a3d' }}>

                      Text address

                    </span>

                  )}

                </div>

              </div>

            </div>


 

            {/* Actions */}

            <div className="flex items-center gap-2 flex-wrap">

              {/* Navigate to this stop */}

              <a href={singleNavUrl(s)} target="_blank" rel="noopener noreferrer"

                className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-semibold"

                style={{ background: '#162019', color: '#F6F2E9' }}>

                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">

                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>

                  <circle cx="12" cy="10" r="3"/>

                </svg>

                Navigate

              </a>


 

              {/* WhatsApp if phone */}

              {s.customerPhone && (

                <a href={`https://wa.me/${s.customerPhone.replace(/\D/g, '')}`}

                  target="_blank" rel="noopener noreferrer"

                  className="rounded-full px-3 py-1.5 text-[12px] font-medium"

                  style={{ border: '1px solid rgba(22,32,25,.15)', color: '#4B5A50' }}>

                  WhatsApp

                </a>

              )}


 

              {/* View order detail */}

              <Link href={`/admin/orders/${s.orderId}`}

                className="rounded-full px-3 py-1.5 text-[12px] font-medium"

                style={{ border: '1px solid rgba(22,32,25,.15)', color: '#4B5A50' }}>

                Details

              </Link>

            </div>

          </div>

        ))}

      </div>


 

      {/* ── Route summary ───────────────────────────────────────── */}

      {stops.length > 1 && (

        <p className="text-center text-[11px]" style={{ color: 'rgba(22,32,25,.4)' }}>

          {stops.length} stops · {today} ·{' '}

          {hasAnyCoords

            ? 'Route optimisation uses nearest-neighbour algorithm on GPS coordinates'

            : 'No GPS coordinates — add them to addresses for route optimisation'}

        </p>

      )}

    </div>

  );

}