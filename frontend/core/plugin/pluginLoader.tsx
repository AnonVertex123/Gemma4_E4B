/**
 * Plugin Loader — load dynamic plugins
 */

import React from "react";
import type { App } from "@/core/appRegistry";
import type { PluginManifest } from "./pluginSpec";
import dynamic from "next/dynamic";
import PluginAppWrapper from "./PluginAppWrapper";

/** Manifests của plugin (có thể load từ API) */
export const pluginManifests: PluginManifest[] = [
  {
    id: "healthbot",
    name: "Health AI",
    version: "1.0.0",
    icon: "🏥",
    entry: "index",
    permissions: ["chat", "memory", "user_profile", "diagnosis"],
    routes: [{ path: "/health", name: "Health Dashboard" }],
    capabilities: ["chat", "rag", "diagnosis"],
    tier: "premium",
  },
];

const HealthBotApp = dynamic(() => import("@/plugins/healthbot/HealthBotApp"), { ssr: false });

const pluginComponents: Record<string, React.ComponentType<{ sdk: import("./pluginSDK").PluginSDK }>> = {
  healthbot: HealthBotApp,
};

export function loadPlugins(): Array<App & { isPlugin?: boolean; manifest?: PluginManifest }> {
  return pluginManifests.map((m) => {
    const PluginComponent = pluginComponents[m.id];
    const Wrapped = PluginComponent
      ? () => <PluginAppWrapper component={PluginComponent} />
      : () => <div className="p-4 text-[#6B6B8A]">Plugin {m.name} — entry not found</div>;

    return {
      id: m.id,
      name: m.name,
      icon: m.icon,
      tier: m.tier ?? "free",
      isPlugin: true,
      manifest: m,
      component: Wrapped as App["component"],
    };
  });
}
