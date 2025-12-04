import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { AppNavbar } from "@/components/layout/app-navbar";
import { QueryProvider } from "@/components/providers/query-provider";
import { Toaster } from "@/components/ui/toaster";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Drop2Git Hub",
  description: "Connect GitHub. Drag & drop projects. Level up your repos.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} font-sans antialiased`}>
        <QueryProvider>
          <div className="flex min-h-screen flex-col">
            <AppNavbar />
            <main className="flex-1">{children}</main>
          </div>
          <Toaster />
        </QueryProvider>
      </body>
    </html>
  );
}
