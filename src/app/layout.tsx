import type { Metadata } from "next";
import "./globals.css";
import { UserProvider } from "@/lib/userContext";

export const metadata: Metadata = {
  title: "AviLog — Professional Aviation Logbook & Fleet Management",
  description:
    "The most complete aviation SaaS platform. Log flight hours with precision, track maintenance schedules, and manage your entire fleet.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <UserProvider>{children}</UserProvider>
      </body>
    </html>
  );
}
