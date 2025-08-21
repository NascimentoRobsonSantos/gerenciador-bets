"use client";

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "../components/ThemeProvider";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import { Toaster } from "../components/ui/sonner";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

const inter = Inter({ subsets: ["latin"] });

// Metadata não pode ser exportada de um Client Component, então vou movê-la
// para um arquivo separado ou remover se não for estritamente necessária aqui.
// Por enquanto, vou comentar para evitar o erro.
// export const metadata: Metadata = {
//   title: "AconteceAi - Gerenciador de Pedidos",
//   description: "Gerenciador de Pedidos da Integração com Marketplace",
// };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  const [initialTheme, setInitialTheme] = useState<"dark" | "light" | undefined>(undefined);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userString = localStorage.getItem('user');
      if (userString) {
        try {
          const user = JSON.parse(userString);
          if (user.dark_theme !== undefined) {
            setInitialTheme(user.dark_theme ? "dark" : "light");
          }
        } catch (e) {
          console.error("Failed to parse user from localStorage", e);
        }
      }
    }
  }, []);

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme={initialTheme || "dark"}
          enableSystem
          disableTransitionOnChange
        >
          {isLoginPage ? (
            children
          ) : (
            <div className="flex flex-col min-h-screen bg-background">
              <Header />
              <div className="flex flex-1">
                <Sidebar />
                <main className="flex-1 p-4">
                  {children}
                </main>
              </div>
            </div>
          )}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
