import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import Provider from "./provider";
import { ConvexClientProvider } from "./ConvexClientProvider";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "MedNexus",
  icons: {
    icon: "/logo.svg",
    shortcut: "/logo.svg",
    apple: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <ClerkProvider>
          <ConvexClientProvider>
            <Provider>
              {children}
              <Toaster />
            </Provider>
          </ConvexClientProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}