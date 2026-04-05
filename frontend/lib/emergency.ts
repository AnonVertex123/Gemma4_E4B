/**
 * Emergency helpers — geolocation, hotlines, directions, share, offline cache.
 * Map UI lives in EmergencyMap.tsx; hospital list from /api/emergency/hospitals.
 */

export type LocationSource = "gps" | "ip" | "manual";

export interface UserLocation {
  lat: number;
  lng: number;
  accuracy: number;
  source: LocationSource;
  city: string;
  country: string;
  countryCode?: string;
}

export interface Hospital {
  id: string;
  name: string;
  address: string;
  phone?: string;
  distance_km: number;
  duration_drive_min: number;
  lat: number;
  lng: number;
  is_open_now: boolean;
  emergency_available: boolean;
  rating?: number;
}

export type EmergencyHotlines = {
  ambulance: string;
  police: string;
  fire: string;
};

export const EMERGENCY_NUMBERS: Record<string, EmergencyHotlines> = {
  VN: { ambulance: "115", police: "113", fire: "114" },
  US: { ambulance: "911", police: "911", fire: "911" },
  UK: { ambulance: "999", police: "999", fire: "999" },
  EU: { ambulance: "112", police: "112", fire: "112" },
  AU: { ambulance: "000", police: "000", fire: "000" },
  JP: { ambulance: "119", police: "110", fire: "119" },
  SG: { ambulance: "995", police: "999", fire: "995" },
  TH: { ambulance: "1669", police: "191", fire: "199" },
  ID: { ambulance: "118", police: "110", fire: "113" },
  PH: { ambulance: "911", police: "911", fire: "911" },
  KH: { ambulance: "119", police: "117", fire: "118" },
  DEFAULT: { ambulance: "112", police: "112", fire: "112" },
};

const DEFAULT_COUNTRY =
  (typeof process !== "undefined" && process.env.NEXT_PUBLIC_DEFAULT_COUNTRY) || "VN";

const CACHE_HOSPITALS_KEY = "tuminh_emergency_hospitals_cache";
const CACHE_LOC_KEY = "tuminh_emergency_last_location";

export function getHotlinesForCountry(code?: string): EmergencyHotlines {
  const c = (code || DEFAULT_COUNTRY).toUpperCase();
  return EMERGENCY_NUMBERS[c] ?? EMERGENCY_NUMBERS.DEFAULT;
}

/** Map ISO-ish country name / code to our key */
export function resolveCountryCodeFromGeo(
  country?: string,
  countryCode?: string
): string {
  if (countryCode && EMERGENCY_NUMBERS[countryCode.toUpperCase()])
    return countryCode.toUpperCase();
  const lower = (country || "").toLowerCase();
  if (lower.includes("viet") || lower === "vn") return "VN";
  if (lower.includes("united states") || lower === "usa") return "US";
  if (lower.includes("united kingdom") || lower.includes("england")) return "UK";
  if (lower.includes("australia")) return "AU";
  if (lower.includes("japan")) return "JP";
  if (lower.includes("singapore")) return "SG";
  if (lower.includes("thailand")) return "TH";
  if (lower.includes("indonesia")) return "ID";
  if (lower.includes("philippines")) return "PH";
  if (lower.includes("cambodia")) return "KH";
  return DEFAULT_COUNTRY.toUpperCase();
}

export function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

/** Rough driving time (urban average ~35 km/h). */
export function estimateDriveMinutes(distanceKm: number): number {
  return Math.max(1, Math.round((distanceKm / 35) * 60));
}

const GPS_TIMEOUT_MS = 5000;

export function getGpsPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      reject(new Error("Geolocation not available"));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: GPS_TIMEOUT_MS,
      maximumAge: 0,
    });
  });
}

export interface IpApiResponse {
  latitude?: number;
  longitude?: number;
  city?: string;
  country_name?: string;
  country_code?: string;
}

export async function fetchIpLocation(): Promise<UserLocation | null> {
  try {
    const res = await fetch("https://ipapi.co/json/", { cache: "no-store" });
    if (!res.ok) return null;
    const j = (await res.json()) as IpApiResponse & { error?: boolean };
    if (j.error || j.latitude == null || j.longitude == null) return null;
    return {
      lat: j.latitude,
      lng: j.longitude,
      accuracy: 5000,
      source: "ip",
      city: j.city || "",
      country: j.country_name || "",
      countryCode: j.country_code,
    };
  } catch {
    return null;
  }
}

export function userLocationFromGps(pos: GeolocationPosition): UserLocation {
  return {
    lat: pos.coords.latitude,
    lng: pos.coords.longitude,
    accuracy: pos.coords.accuracy ?? 50,
    source: "gps",
    city: "",
    country: "",
  };
}

export function loadCachedUserLocation(): UserLocation | null {
  try {
    const raw = localStorage.getItem(CACHE_LOC_KEY);
    if (!raw) return null;
    const o = JSON.parse(raw) as UserLocation;
    if (
      typeof o.lat === "number" &&
      typeof o.lng === "number" &&
      Number.isFinite(o.lat) &&
      Number.isFinite(o.lng)
    ) {
      return o;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * 1) GPS (5s timeout) → 2) ipapi.co (silent, no prompt) → 3) null (manual only).
 */
export async function resolveUserLocation(): Promise<{
  location: UserLocation | null;
  error?: string;
}> {
  try {
    const pos = await getGpsPosition();
    const loc = userLocationFromGps(pos);
    const ipMeta = await fetchIpLocation();
    if (ipMeta?.countryCode) {
      loc.countryCode = ipMeta.countryCode;
      loc.country = loc.country || ipMeta.country;
      loc.city = loc.city || ipMeta.city;
    }
    try {
      localStorage.setItem(CACHE_LOC_KEY, JSON.stringify(loc));
    } catch {
      /* ignore */
    }
    return { location: loc };
  } catch {
    const ip = await fetchIpLocation();
    if (ip) {
      try {
        localStorage.setItem(CACHE_LOC_KEY, JSON.stringify(ip));
      } catch {
        /* ignore */
      }
      return { location: ip };
    }
    return { location: null, error: "Không xác định được vị trí" };
  }
}

export function parseManualAddressToLocation(
  lat: number,
  lng: number,
  label: string
): UserLocation {
  return {
    lat,
    lng,
    accuracy: 1000,
    source: "manual",
    city: label,
    country: "",
  };
}

export function openDirections(user: UserLocation, hospital: Hospital): void {
  const { lat: uLat, lng: uLng } = user;
  const { lat: hLat, lng: hLng } = hospital;
  const isMobile = /iPhone|Android/i.test(
    typeof navigator !== "undefined" ? navigator.userAgent : ""
  );
  const webUrl = `https://www.google.com/maps/dir/${uLat},${uLng}/${hLat},${hLng}`;
  if (isMobile) {
    window.location.href = `comgooglemaps://?saddr=${uLat},${uLng}&daddr=${hLat},${hLng}&directionsmode=driving`;
    window.setTimeout(() => {
      window.open(webUrl, "_blank", "noopener,noreferrer");
    }, 500);
  } else {
    window.open(webUrl, "_blank", "noopener,noreferrer");
  }
}

export function buildShareMessage(
  user: UserLocation,
  nearest?: Hospital
): string {
  const mapsLink = `https://www.google.com/maps?q=${user.lat},${user.lng}`;
  const dest = nearest
    ? `\nĐang hướng tới: ${nearest.name}\n${nearest.address}`
    : "";
  return `🚨 CẦN GIÚP ĐỠ KHẨN CẤP\nTôi đang ở: ${mapsLink}${dest}\nVui lòng đến hoặc gọi cấp cứu.`;
}

export async function shareEmergencyLocation(
  user: UserLocation,
  nearest?: Hospital
): Promise<void> {
  const text = buildShareMessage(user, nearest);
  if (navigator.share) {
    try {
      await navigator.share({ title: "Khẩn cấp", text });
      return;
    } catch {
      /* fall through */
    }
  }
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    /* ignore */
  }
}

export function openWhatsAppShare(text: string): void {
  const q = encodeURIComponent(text);
  window.open(`https://wa.me/?text=${q}`, "_blank", "noopener,noreferrer");
}

/** Zalo share uses generic web share page (no official deep link for arbitrary text). */
export function openZaloShare(text: string): void {
  const q = encodeURIComponent(text);
  window.open(
    `https://zalo.me/share?text=${q}`,
    "_blank",
    "noopener,noreferrer"
  );
}

export async function fetchNearbyHospitals(
  lat: number,
  lng: number
): Promise<Hospital[]> {
  const res = await fetch("/api/emergency/hospitals", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ lat, lng }),
  });
  if (!res.ok) throw new Error(`Hospitals API ${res.status}`);
  const data = (await res.json()) as { hospitals: Hospital[] };
  const list = data.hospitals || [];
  try {
    localStorage.setItem(
      CACHE_HOSPITALS_KEY,
      JSON.stringify({ at: Date.now(), lat, lng, hospitals: list })
    );
  } catch {
    /* ignore */
  }
  return list;
}

export function loadCachedHospitals(): {
  stale: boolean;
  hospitals: Hospital[];
  lat?: number;
  lng?: number;
} | null {
  try {
    const raw = localStorage.getItem(CACHE_HOSPITALS_KEY);
    if (!raw) return null;
    const o = JSON.parse(raw) as {
      at: number;
      lat: number;
      lng: number;
      hospitals: Hospital[];
    };
    const stale = Date.now() - o.at > 24 * 60 * 60 * 1000;
    return { stale, hospitals: o.hospitals || [], lat: o.lat, lng: o.lng };
  } catch {
    return null;
  }
}

export const OFFLINE_VN_INSTRUCTIONS = `Gọi 115 ngay lập tức.
Giữ bệnh nhân nằm yên.
Không cho ăn uống.
Chờ xe cấp cứu đến.`;

export type GeoJsonLineString = {
  type: "LineString";
  coordinates: [number, number][];
};

/** OSRM public demo — driving geometry [lng, lat][] */
export async function fetchDrivingGeometry(
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number
): Promise<GeoJsonLineString | null> {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${fromLng},${fromLat};${toLng},${toLat}?overview=full&geometries=geojson`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    const j = (await res.json()) as {
      routes?: { geometry?: GeoJsonLineString }[];
    };
    const g = j.routes?.[0]?.geometry;
    if (g?.type === "LineString" && Array.isArray(g.coordinates)) return g;
    return null;
  } catch {
    return null;
  }
}

/** Convert OSRM [lng,lat] to Leaflet [lat,lng][] */
export function osrmToLeafletLatLngs(coords: [number, number][]): [number, number][] {
  return coords.map(([lng, lat]) => [lat, lng]);
}

/**
 * Client-side emergency gate (aligns with common red-flag symptoms until API returns is_emergency).
 */
export function detectEmergencyFromUserText(text: string): {
  emergency: boolean;
  reason: string;
} {
  const t = text.toLowerCase();
  const leftChestIsolated =
    /đau\s*ngực\s*trái|đau\s*trái\s*ngực|đau\s*lồng\s*ngực\s*trái|đau\s*ngực\s*bên\s*trái/i.test(
      t
    );
  if (leftChestIsolated) {
    return {
      emergency: true,
      reason:
        "Đau ngực trái — coi như cấp cứu cho đến khi loại trừ tim mạch. Gọi 115.",
    };
  }

  const chest =
    /đau\s*ngực|nhức\s*ngực|đau\s*lồng\s*ngực|tim\s*đau/i.test(t);
  const breath =
    /khó\s*thở|thở\s*gắng|thở\s*khó|không\s*thở\s*được|ngạt/i.test(t);
  const ageOld =
    /\b(6[5-9]|[7-9]\d)\s*tuổi|tuổi\s*(6[5-9]|[7-9]\d)|age\s*[=:]\s*(6[5-9]|[7-9]\d)/i.test(
      t
    );
  const stroke =
    /liệt\s*nửa\s*người|méo\s*miệng|nói\s*không\s*rõ|yếu\s*một\s*bên/i.test(t);
  const bleed = /nôn\s*máu|đi\s*ngoài\s*máu|ho\s*ra\s*máu/i.test(t);

  if (chest && breath) {
    return {
      emergency: true,
      reason: "Đau ngực kèm khó thở — có thể nguy hiểm tính mạng. Gọi cấp cứu ngay.",
    };
  }
  if (chest && ageOld) {
    return {
      emergency: true,
      reason: "Đau ngực ở người cao tuổi — ưu tiên cấp cứu.",
    };
  }
  if (stroke) {
    return {
      emergency: true,
      reason: "Dấu hiệu đột quỵ — gọi cấp cứu ngay.",
    };
  }
  if (bleed) {
    return {
      emergency: true,
      reason: "Xuất huyết tiêu hóa/hô hấp — cần cấp cứu.",
    };
  }
  return { emergency: false, reason: "" };
}
