/**
 * Plugin Manifest — chuẩn plugin.json
 */

export type PluginPermission =
  | "chat"
  | "memory"
  | "user_profile"
  | "diagnosis"
  | "rag"
  | "files";

export type PluginRoute = {
  path: string;
  name: string;
};

export type PluginCapability = "chat" | "rag" | "diagnosis" | "dashboard" | "tool" | "automation";

export type PluginManifest = {
  id: string;
  name: string;
  version: string;
  icon: string;
  entry: string;
  permissions: PluginPermission[];
  routes?: PluginRoute[];
  capabilities?: PluginCapability[];
  tier?: "free" | "premium";
};
