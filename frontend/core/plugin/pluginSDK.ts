/**
 * Plugin SDK — Core Platform API cho plugin
 * getUser, chat, saveMemory, checkAccess
 */

import type { PluginContext } from "./pluginContext";

export class PluginSDK {
  constructor(private ctx: PluginContext) {}

  getUser() {
    return this.ctx.user;
  }

  getToken() {
    return this.ctx.token;
  }

  getApiUrl() {
    return this.ctx.apiUrl;
  }

  hasPermission(perm: string): boolean {
    return this.ctx.permissions.includes(perm) || this.ctx.permissions.includes("*");
  }

  /** Gọi chat API unified */
  async chat(bot: string, message: string) {
    this.checkAccess("chat");
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (this.ctx.token) headers.Authorization = `Bearer ${this.ctx.token}`;

    const res = await fetch(`${this.ctx.apiUrl}/chat`, {
      method: "POST",
      headers,
      body: JSON.stringify({ bot_name: bot, question: message }),
    });
    return res;
  }

  /** Lưu memory (placeholder — backend chưa có /memory) */
  async saveMemory(data: Record<string, unknown>) {
    this.checkAccess("memory");
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (this.ctx.token) headers.Authorization = `Bearer ${this.ctx.token}`;

    const res = await fetch(`${this.ctx.apiUrl}/memory`, {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    });
    return res;
  }

  /** Kiểm tra quyền truy cập feature theo plan */
  checkAccess(feature: string): void {
    if (this.ctx.user.plan === "free" && feature === "premium") {
      throw new Error("Upgrade to Pro required");
    }
  }

  /** Gọi diagnose API (medical) */
  async diagnose(text: string) {
    this.checkAccess("diagnosis");
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (this.ctx.token) headers.Authorization = `Bearer ${this.ctx.token}`;

    const res = await fetch(`${this.ctx.apiUrl}/api/diagnose`, {
      method: "POST",
      headers,
      body: JSON.stringify({ text }),
    });
    return res;
  }
}
