import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Sidebar } from "@/components/layout/Sidebar";
import { Background } from "@/components/layout/Background";

const outfit = Outfit({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OmniTrack",
  description: "A modern, aesthetic media progress tracking system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col font-sans relative">
        <ThemeProvider>
          <Background />
          <div className="flex min-h-screen w-full relative z-10">
            <Sidebar />
            <main className="flex-1 w-full pl-32 pr-8 py-8 max-w-[1600px] mx-auto transition-all duration-500">
              {children}
            </main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
