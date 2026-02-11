"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <Header />
      <main className="md:pl-64">
        <div className="mx-auto max-w-4xl p-6 md:p-8">{children}</div>
      </main>
    </div>
  );
}
