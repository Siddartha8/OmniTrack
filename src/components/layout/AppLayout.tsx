"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  return (
    <div className="flex min-h-screen w-full relative z-10">
      <Sidebar />
      <main className={`flex-1 w-full pr-8 py-8 max-w-[1600px] mx-auto transition-all duration-500 ${isLoginPage ? 'pl-8' : 'pl-32'}`}>
        {children}
      </main>
    </div>
  );
}
