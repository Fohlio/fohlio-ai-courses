"use client";

import { Input } from "@/components/ui/Input";
import type { PrLinkContent } from "@/lib/types";

interface SubmissionPrLinkProps {
  value: PrLinkContent | null;
  onChange: (content: PrLinkContent) => void;
  disabled?: boolean;
}

export function SubmissionPrLink({
  value,
  onChange,
  disabled,
}: SubmissionPrLinkProps) {
  return (
    <Input
      label="GitHub PR URL"
      placeholder="https://github.com/org/repo/pull/123"
      value={value?.url ?? ""}
      onChange={(e) => onChange({ type: "pr_link", url: e.target.value })}
      disabled={disabled}
    />
  );
}
