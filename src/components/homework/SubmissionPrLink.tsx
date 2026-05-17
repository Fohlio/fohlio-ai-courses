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
      label="Link (sandbox, deployed demo, or gist)"
      placeholder="https://stackblitz.com/edit/..."
      value={value?.url ?? ""}
      onChange={(e) => onChange({ type: "pr_link", url: e.target.value })}
      disabled={disabled}
    />
  );
}
