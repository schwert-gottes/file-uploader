"use client";

import { AppProvider } from "@shopify/polaris";
import "@shopify/polaris/build/esm/styles.css";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AppProvider i18n={{}}>{children}</AppProvider>
      </body>
    </html>
  );
}
