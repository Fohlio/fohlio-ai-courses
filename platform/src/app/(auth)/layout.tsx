import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <h1 className="mb-8 text-center text-2xl font-bold text-gray-900">
          Fohlio Tech Course
        </h1>
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
