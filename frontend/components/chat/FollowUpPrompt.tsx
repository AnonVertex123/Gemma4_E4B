"use client";

import { useHealthProfile } from "@/state/useHealthProfile";

/**
 * Retention — nhắc follow-up khi user quay lại
 */
export default function FollowUpPrompt({
  onSelect,
}: {
  onSelect?: (text: string) => void;
}) {
  const { getFollowUpPrompt } = useHealthProfile();
  const prompt = getFollowUpPrompt();

  if (!prompt) return null;

  return (
    <button
      type="button"
      onClick={() => onSelect?.(prompt)}
      className="w-full text-left p-3 rounded-lg bg-amber-50 border border-amber-200 text-sm text-amber-900"
    >
      💬 {prompt}
    </button>
  );
}
