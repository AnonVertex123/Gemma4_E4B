/**
 * Marketplace API — plugins, install, installed
 */

const TOKEN_KEY = "tuminh_token";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export type MarketplacePlugin = {
  id: string;
  name: string;
  description: string;
  price: number;
  icon?: string;
  version?: string;
};

export async function getMarketplacePlugins(): Promise<MarketplacePlugin[]> {
  const res = await fetch("/api/marketplace/plugins");
  const data = await res.json();
  return data.plugins ?? [];
}

export async function getInstalledPlugins(): Promise<string[]> {
  const t = getToken();
  const res = await fetch("/api/marketplace/installed", {
    headers: t ? { Authorization: `Bearer ${t}` } : {},
  });
  const data = await res.json();
  return data.plugin_ids ?? [];
}

export async function installPlugin(pluginId: string): Promise<{
  status: string;
  price?: number;
  error?: string;
}> {
  const t = getToken();
  const res = await fetch("/api/marketplace/install", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(t ? { Authorization: `Bearer ${t}` } : {}),
    },
    body: JSON.stringify({ plugin_id: pluginId }),
  });
  return res.json();
}
