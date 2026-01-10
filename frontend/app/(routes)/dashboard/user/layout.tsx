"use client";

import UserSidebar from "../../../../components/sidebar/UserSidebar";

export default function UserDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <UserSidebar />
      <main className="flex-1">
        <div className="p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
