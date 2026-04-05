/**
 * Plugin Context — inject vào plugin
 */

export type PluginContext = {
  user: { id: string; plan: string };
  token: string | null;
  apiUrl: string;
  permissions: string[];
};
