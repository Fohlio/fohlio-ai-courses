"use client";

import { AdminSidebar } from "@/components/layout/AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar />
      <main className="md:pl-64">
        <div className="p-6 md:p-8">{children}</div>
      </main>
    </div>
  );
}
