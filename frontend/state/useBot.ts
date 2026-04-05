/**
 * Bot state — current bot, messages per bot (session)
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type MessageType = "text" | "diagnosis" | "warning";

export type ChatMessage = {
  id: string;
  role: "user" | "bot";
  text: string;
  time?: string;
  ts?: string;
  bot?: string;
  type?: MessageType;
};

export type Session = { id: string; label: string; bot: string; createdAt: string };

export type MessagesByBot = Record<string, ChatMessage[]>;

interface BotState {
  currentBot: string;
  setBot: (bot: string) => void;
  messagesByBot: MessagesByBot;
  addMessage: (bot: string, msg: ChatMessage) => void;
  clearBot: (bot: string) => void;
  sessions: Session[];
  addSession: (s: Omit<Session, "id" | "createdAt">) => void;
}

export const useBot = create<BotState>()(
  persist(
    (set) => ({
      currentBot: "herbal",
      setBot: (bot) => set({ currentBot: bot }),
      messagesByBot: {},
      addMessage: (bot, msg) =>
        set((s) => {
          const m = { ...msg, time: msg.time ?? msg.ts ?? "", bot } as ChatMessage;
          return {
            messagesByBot: {
              ...s.messagesByBot,
              [bot]: [...(s.messagesByBot[bot] || []), m],
            },
          };
        }),
      clearBot: (bot) =>
        set((s) => {
          const next = { ...s.messagesByBot };
          delete next[bot];
          return { messagesByBot: next };
        }),
      sessions: [
        { id: "s1", label: "Ca khám #001", bot: "medical", createdAt: "" },
        { id: "s2", label: "Ca khám #002", bot: "medical", createdAt: "" },
      ],
      addSession: (s) =>
        set((state) => ({
          sessions: [
            ...state.sessions,
            {
              ...s,
              id: `s-${Date.now()}`,
              createdAt: new Date().toISOString(),
            } as Session,
          ],
        })),
    }),
    { name: "tuminh-bot-state" }
  )
);
