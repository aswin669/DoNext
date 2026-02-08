import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Productivity Master - Task & Habit Tracker",
  description: "Advanced productivity app with AI-powered task management, habit tracking, and team collaboration",
  manifest: "/manifest.json",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#4F46E5",
};

async function getInitialTheme() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;
  if (!userId) return "light";

  try {
    // @ts-expect-error - prisma types may not be fully generated
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { theme: true }
    });
    // @ts-expect-error - prisma types may not be fully generated
    return user?.theme || "light";
  } catch {
    return "light";
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const theme = await getInitialTheme();

  return (
    <html lang="en" className={theme}>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${inter.variable} antialiased font-display`}
      >
        <ThemeProvider initialTheme={theme}>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
