/**
 * Plugin SDK — public exports
 */

export { PluginSDK } from "./pluginSDK";
export type { PluginContext } from "./pluginContext";
export type { PluginManifest, PluginPermission, PluginRoute, PluginCapability } from "./pluginSpec";
export { pluginManifests, loadPlugins } from "./pluginLoader";
export { default as PluginAppWrapper } from "./PluginAppWrapper";
