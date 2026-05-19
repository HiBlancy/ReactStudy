"use client";

import { LibraryProvider } from "@/context/library-context";

export function Providers({ children }: { children: React.ReactNode }) {
  return <LibraryProvider>{children}</LibraryProvider>;
}
