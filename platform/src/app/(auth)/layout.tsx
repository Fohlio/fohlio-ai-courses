import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex items-center justify-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="" width={36} height={36} className="rounded-lg" />
          <h1 className="text-2xl font-bold text-gray-900">
            Fohlio Tech Course
          </h1>
        </div>
        <div
          data-testid="auth-card"
          className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm"
        >
          {children}
        </div>
      </div>
    </div>
  );
}
