import React from 'react';
import { AppShell } from '@/components/AppShell';

export default function InternalAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
