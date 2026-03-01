"use client";
import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import Provider from "./provider";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <ConvexProvider client={convex}>
        <html lang="en">
          <body>
            <Provider>{children}
              <Toaster/>
            </Provider>
          </body>
        </html>
      </ConvexProvider>
    </ClerkProvider>
  );
}