import { NextRequest, NextResponse } from 'next/server';
import { verifyApiAuth } from '@/lib/apiAuth';

type Stop = {
  id: string;
  type: 'pickup' | 'dropoff';
  lat?: number | null;
  lng?: number | null;
};

type OptimizeBody = {
  currentLat?: number | null;
  currentLng?: number | null;
  stops?: Stop[];
};

function toNumberOrNull(value: unknown): number | null {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function haversineMiles(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3958.8;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

export async function POST(request: NextRequest) {
  const auth = await verifyApiAuth(request);
  if ('error' in auth) return auth.error;

  try {
    const body = (await request.json()) as OptimizeBody;
    const currentLat = toNumberOrNull(body.currentLat);
    const currentLng = toNumberOrNull(body.currentLng);
    const stops = Array.isArray(body.stops) ? body.stops : [];

    if (stops.length === 0) {
      return NextResponse.json({ orderedStopIds: [] });
    }

    if (!Number.isFinite(currentLat) || !Number.isFinite(currentLng)) {
      return NextResponse.json({ orderedStopIds: stops.map((s) => s.id) });
    }

    const valid = stops
      .map((stop) => ({
        ...stop,
        lat: toNumberOrNull(stop.lat),
        lng: toNumberOrNull(stop.lng),
      }))
      .filter((stop) => stop.id && Number.isFinite(stop.lat) && Number.isFinite(stop.lng));

    const remaining = [...valid];
    const result: string[] = [];

    let pointerLat = currentLat;
    let pointerLng = currentLng;

    while (remaining.length > 0) {
      let bestIndex = 0;
      let bestDistance = Number.POSITIVE_INFINITY;

      for (let index = 0; index < remaining.length; index += 1) {
        const candidate = remaining[index];
        const distance = haversineMiles(pointerLat as number, pointerLng as number, candidate.lat as number, candidate.lng as number);

        if (distance < bestDistance) {
          bestDistance = distance;
          bestIndex = index;
        }
      }

      const next = remaining.splice(bestIndex, 1)[0];
      result.push(next.id);
      pointerLat = next.lat as number;
      pointerLng = next.lng as number;
    }

    const missingIds = stops.filter((s) => !result.includes(s.id)).map((s) => s.id);

    return NextResponse.json({ orderedStopIds: [...result, ...missingIds] });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to optimize route.' }, { status: 400 });
  }
}
