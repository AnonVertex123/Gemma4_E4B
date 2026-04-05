"use client";

import { useState } from "react";

/**
 * Viral loop — gửi link cho người thân
 */
export default function ShareLink() {
  const [copied, setCopied] = useState(false);

  const link = typeof window !== "undefined" ? window.location.href : "";

  function copyLink() {
    navigator.clipboard?.writeText(link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="p-3 rounded-lg bg-[#F5F5FA] border border-[#E8E8E8]">
      <p className="text-xs text-[#6B6B8A]">
        Gửi link này cho người thân để kiểm tra sức khỏe
      </p>
      <div className="mt-2 flex gap-2">
        <input
          type="text"
          readOnly
          value={link}
          className="flex-1 px-2 py-1.5 rounded text-xs bg-white border truncate"
        />
        <button
          type="button"
          onClick={copyLink}
          className="px-3 py-1.5 rounded-lg bg-[#0F6E56] text-white text-xs font-medium"
        >
          {copied ? "Đã copy!" : "Copy"}
        </button>
      </div>
    </div>
  );
}
