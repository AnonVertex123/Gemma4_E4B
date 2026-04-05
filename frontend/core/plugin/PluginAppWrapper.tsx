"use client";

import { useMemo } from "react";
import { PluginSDK } from "./pluginSDK";
import { getToken } from "@/lib/chat-api";

function getApiUrl(): string {
  const direct =
    process.env.NEXT_PUBLIC_AI_PLATFORM_URL ||
    process.env.TUMINHAGI_AI_PLATFORM_URL ||
    process.env.NEXT_PUBLIC_BACKEND_API_BASE;
  if (direct) return direct.replace(/\/$/, "");
  return "";
}

type Props = {
  component: React.ComponentType<{ sdk: PluginSDK }>;
  user?: { id: string; plan: string };
};

export default function PluginAppWrapper({ component: Component, user }: Props) {
  const sdk = useMemo(() => {
    const apiUrl = getApiUrl() || (typeof window !== "undefined" ? "" : "http://127.0.0.1:8001");
    const base = apiUrl || "/api/platform";
    return new PluginSDK({
      user: user ?? { id: "guest", plan: "free" },
      token: getToken(),
      apiUrl: base,
      permissions: ["chat", "memory", "user_profile", "diagnosis"],
    });
  }, [user?.id, user?.plan]);

  return <Component sdk={sdk} />;
}
