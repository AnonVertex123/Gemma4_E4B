"use client";

import { useState } from "react";
import BotSelector from "./BotSelector";
import ChatBox from "./ChatBox";
import LoginForm from "./LoginForm";
import OnboardingForm from "./OnboardingForm";
import ShareLink from "./ShareLink";
import FollowUpPrompt from "./FollowUpPrompt";

export default function MultiBotChatView() {
  const [followUpInput, setFollowUpInput] = useState<string>("");

  return (
    <div className="flex flex-col h-full max-w-2xl mx-auto w-full p-6 gap-6">
      <div>
        <h2 className="text-lg font-medium text-[#1B1B2F]">
          🌿 Trợ lý sức khỏe AI + tư vấn thuốc Nam
        </h2>
        <p className="text-sm text-[#6B6B8A] mt-1">
          Hỏi nhanh trước khi đi viện — đau dạ dày, mất ngủ, stress...
        </p>
      </div>

      <OnboardingForm />

      <LoginForm onLoggedIn={() => {}} />

      <div>
        <p className="text-xs font-medium text-[#6B6B8A] uppercase tracking-wide mb-2">
          Chọn bot
        </p>
        <BotSelector />
      </div>

      <FollowUpPrompt onSelect={(t) => setFollowUpInput(t)} />

      <div className="flex-1 min-h-[300px]">
        <p className="text-xs font-medium text-[#6B6B8A] uppercase tracking-wide mb-2">
          Chat
        </p>
        <ChatBox initialInput={followUpInput} onInputCleared={() => setFollowUpInput("")} />
      </div>

      <ShareLink />
    </div>
  );
}
