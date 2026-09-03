import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { ClientProviders } from "@/components/providers/ClientProviders";
import "./globals.css";

export const metadata: Metadata = {
  title: "Stitch & Time — Editorial Atelier & Bespoke Workshop",
  description: "Mobile-first PWA for fashion designers and bespoke tailors to measure clients on the go, track orders, and sync offline.",
  applicationName: "Stitch & Time",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Stitch & Time",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#141312",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const hasClerkKey = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

  const content = <ClientProviders>{children}</ClientProviders>;

  return (
    <html lang="en" className="h-full bg-[#141312] text-[#FAF7F2] antialiased selection:bg-[#C89B3C]/30 selection:text-[#FAF7F2]">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className="min-h-full flex flex-col bg-[#141312] text-[#FAF7F2] font-sans">
        {hasClerkKey ? (
          <ClerkProvider
            appearance={{
              variables: {
                colorPrimary: '#C89B3C',
                colorBackground: '#1E1D1B',
              },
            }}
          >
            {content}
          </ClerkProvider>
        ) : (
          content
        )}
      </body>
    </html>
  );
}
