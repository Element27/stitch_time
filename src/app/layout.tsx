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
                colorBackground: '#181715',
                colorNeutral: '#FAF7F2',
              },
              elements: {
                card: 'bg-[#181715] border border-[rgba(214,203,189,0.18)] shadow-2xl rounded-2xl text-[#FAF7F2]',
                headerTitle: 'font-serif text-[#FAF7F2] text-xl font-bold',
                headerSubtitle: 'text-[#D3C7B6]',
                formFieldLabel: 'text-[#D3C7B6] font-mono text-xs',
                formFieldInput: 'bg-[#242220] border border-[rgba(214,203,189,0.2)] text-[#FAF7F2] focus:border-[#C89B3C]',
                socialButtonsBlockButton: 'bg-[#242220] border border-[rgba(214,203,189,0.18)] text-[#FAF7F2] hover:bg-[#2E2B27]',
                socialButtonsBlockButtonText: 'text-[#FAF7F2] font-medium',
                dividerLine: 'bg-[rgba(214,203,189,0.15)]',
                dividerText: 'text-[#D3C7B6] font-mono text-xs',
                formButtonPrimary: 'bg-[#C89B3C] hover:bg-[#D4A373] text-[#141312] font-semibold font-mono',
                footerActionText: 'text-[#D3C7B6]',
                footerActionLink: 'text-[#E0BA62] hover:text-[#FAF7F2]',
                identityPreviewText: 'text-[#FAF7F2]',
                identityPreviewEditButton: 'text-[#E0BA62]',
                userButtonPopoverCard: 'bg-[#181715] border border-[rgba(214,203,189,0.18)] shadow-2xl text-[#FAF7F2]',
                userButtonPopoverActionButton: 'text-[#FAF7F2] hover:bg-[#242220]',
                userButtonPopoverActionButtonText: 'text-[#FAF7F2]',
                userButtonPopoverActionButtonIcon: 'text-[#C89B3C]',
                userPreviewMainIdentifier: 'text-[#FAF7F2] font-medium',
                userPreviewSecondaryIdentifier: 'text-[#D3C7B6]',
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
