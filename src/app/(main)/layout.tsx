"use client";

import { MainLayout } from "@/components/layout/main-layout";
import { UserProvider } from "@/contexts/user-context";

export default function MainAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <UserProvider>
      <MainLayout>{children}</MainLayout>
    </UserProvider>
  );
}
