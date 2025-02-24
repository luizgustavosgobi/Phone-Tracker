"use client";

import { Geist, Geist_Mono } from "next/font/google";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import { SidebarProvider } from "@/app/components/ui/sidebar";
import { AppSidebar } from "@/app/components/app-sidebar";
import { Toaster } from "@/app/components/ui/sonner";
import { createContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import type { validateToken } from "@/app/utils/types/allTypes";
import { ThemeProvider } from "./components/theme-provider";
import icon from "../../public/Logo.svg";
import dayjs from "dayjs";
import "dayjs/locale/pt-br";
import "./globals.css";

dayjs.locale("pt-br");

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const UserContext = createContext<validateToken | null>(null);

function StructureApp({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen flex-col">
      <Header />
      <main className="flex-1 bg-[var(--background-color)] text-[#e2e2e2]">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </main>
      <Footer />
    </div>
  );
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [user, setUser] = useState<validateToken | null>(null);

  useEffect(() => {
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("token="));

    if (token) {
      try {
        const dataUser = jwtDecode(token.split("=")[1]) as validateToken;
        setUser(dataUser);
      } catch {
        setUser(null);
      }
    } else {
      setUser(null);
    }
  }, []);

  return (
    <html lang="pt-br" suppressHydrationWarning>
      <head>
        <link rel="icon" type="image/png" href={icon.src} />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <UserContext.Provider value={user}>
          <SidebarProvider defaultOpen={false}>
            <AppSidebar />
            <StructureApp>{children}</StructureApp>
          </SidebarProvider>
          <Toaster />
        </UserContext.Provider>
      </body>
    </html>
  );
}
