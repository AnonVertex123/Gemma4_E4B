"use client";

import React, { useEffect, useState } from "react";

interface Hospital {
  name: string;
  address: string;
  phone: string;
  distance: string;
  type: "emergency" | "clinic" | "hospital";
}

// Mock data — fallback nếu chưa lấy được vị trí hoặc API bệnh viện.
const MOCK_HOSPITALS: Hospital[] = [
  {
    name: "Bệnh viện Chợ Rẫy",
    address: "201B Nguyễn Chí Thanh, Q.5, TP.HCM",
    phone: "028 3855 4137",
    distance: "2.1 km",
    type: "emergency",
  },
  {
    name: "Bệnh viện Đại học Y Dược",
    address: "215 Hồng Bàng, Q.5, TP.HCM",
    phone: "028 3855 1061",
    distance: "2.4 km",
    type: "hospital",
  },
  {
    name: "Phòng khám Đa khoa Quốc tế",
    address: "342 Võ Văn Kiệt, Q.1, TP.HCM",
    phone: "028 3823 0281",
    distance: "3.2 km",
    type: "clinic",
  },
];

const typeConfig: Record<Hospital["type"], { label: string; color: string }> = {
  emergency: { label: "Cấp cứu 24/7", color: "text-red-500 bg-red-50" },
  hospital: { label: "Bệnh viện", color: "text-blue-500 bg-blue-50" },
  clinic: { label: "Phòng khám", color: "text-green-500 bg-green-50" },
};

export default function EmergencyMap() {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locError, setLocError] = useState(false);
  const [hospitals, setHospitals] = useState<Hospital[]>(MOCK_HOSPITALS);

  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setLocError(true);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      () => setLocError(true),
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  }, []);

  useEffect(() => {
    // Optional real hospitals update. If it fails, we keep mock list.
    if (!location) return;
    (async () => {
      try {
        const res = await fetch("/api/emergency/hospitals", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lat: location.lat, lng: location.lng }),
        });
        if (!res.ok) return;
        const data = (await res.json()) as { hospitals?: any[] };
        const list = (data.hospitals || []) as any[];
        if (!Array.isArray(list) || list.length === 0) return;

        const mapped: Hospital[] = list.slice(0, 6).map((h) => {
          const t: Hospital["type"] =
            h.emergency_available === true
              ? "emergency"
              : h.type === "clinic"
                ? "clinic"
                : "hospital";
          const phone = typeof h.phone === "string" ? h.phone : "";
          const distance =
            typeof h.distance_km === "number" ? `${h.distance_km.toFixed(1)} km` : String(h.distance || "—");
          return {
            name: String(h.name || "Bệnh viện"),
            address: String(h.address || ""),
            phone,
            distance,
            type: t,
          };
        });

        setHospitals(mapped);
      } catch {
        // keep mock
      }
    })();
  }, [location]);

  return (
    <div className="flex flex-col gap-3">
      {/* Header + vị trí */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
          <span className="text-sm font-medium text-gray-700">Bệnh viện gần nhất</span>
        </div>
        <span className="text-xs text-gray-400">
          {location
            ? `${location.lat.toFixed(3)}, ${location.lng.toFixed(3)}`
            : locError
              ? "Không lấy được vị trí"
              : "Đang định vị..."}
        </span>
      </div>

      {/* Map placeholder — iframe Google Maps */}
      <div
        className="relative h-36 bg-gray-50 rounded-xl overflow-hidden border border-gray-100"
      >
        <div className="absolute inset-0 flex items-center justify-center">
          {location ? (
            <iframe
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              src={`https://maps.google.com/maps?q=${location.lat},${location.lng}&z=14&output=embed`}
            />
          ) : (
            <div className="flex flex-col items-center gap-2 text-gray-300">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span className="text-xs">
                {locError ? "Cho phép truy cập vị trí để xem bản đồ" : "Đang tải bản đồ..."}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Số khẩn cấp */}
      <a
        href="tel:115"
        className="flex items-center justify-between p-3 bg-red-50 border border-red-100 rounded-xl hover:bg-red-100 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <span className="text-red-500 text-lg">📞</span>
          <div>
            <p className="text-sm font-medium text-red-600">Gọi cấp cứu 115</p>
            <p className="text-xs text-red-400">Miễn phí · 24/7</p>
          </div>
        </div>
        <span className="text-xl font-bold text-red-500">115</span>
      </a>

      {/* Danh sách bệnh viện */}
      <div className="flex flex-col gap-2">
        {hospitals.map((h, i) => (
          <div
            key={i}
            className="flex items-start gap-3 p-3 bg-white border border-gray-100 rounded-xl hover:border-gray-200 transition-all"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <p className="text-sm font-medium text-gray-800 truncate">{h.name}</p>
                <span className={`text-xs px-1.5 py-0.5 rounded-full flex-shrink-0 font-medium ${typeConfig[h.type].color}`}>
                  {typeConfig[h.type].label}
                </span>
              </div>
              <p className="text-xs text-gray-400 truncate">{h.address}</p>
              {h.phone ? (
                <a
                  href={`tel:${h.phone.replace(/\s/g, "")}`}
                  className="text-xs text-blue-400 hover:text-blue-500"
                  onClick={(e) => e.stopPropagation()}
                >
                  {h.phone}
                </a>
              ) : null}
            </div>
            <span className="text-xs text-gray-400 flex-shrink-0 mt-0.5">{h.distance}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

