/**
 * App Registry — Tự Minh AGI Workspace
 * 3 Core Apps: Chat AI + Analyzer + Docs
 */

import type { ComponentType } from "react";
import dynamic from "next/dynamic";

export type App = {
  id: string;
  name: string;
  icon: string;
  component: ComponentType;
};

const ChatApp = dynamic(() => import("@/apps/chat/ChatApp"), { ssr: false });
const AnalyzerApp = dynamic(() => import("@/apps/analyzer/AnalyzerApp"), { ssr: false });
const DocsApp = dynamic(() => import("@/apps/docs/DocsApp"), { ssr: false });

export const apps: App[] = [
  { id: "chat", name: "Chat AI", icon: "💬", component: ChatApp },
  { id: "analyzer", name: "Phân tích Dự án", icon: "🔍", component: AnalyzerApp },
  { id: "docs", name: "Tri thức", icon: "📚", component: DocsApp },
];

export function getAppById(id: string): App | undefined {
  return apps.find((a) => a.id === id);
}
