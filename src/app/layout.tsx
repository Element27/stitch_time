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
  themeColor: "#13161C",
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
    <html lang="en" className="h-full bg-[#13161C] text-[#F4EFEA] antialiased selection:bg-[#C89B5C]/30 selection:text-[#F4EFEA]">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className="min-h-full flex flex-col bg-[#13161C] text-[#F4EFEA] font-sans">
        {hasClerkKey ? (
          <ClerkProvider
            appearance={{
              variables: {
                colorPrimary: '#C89B5C',
                colorBackground: '#1D222A',
                colorNeutral: '#F4EFEA',
              },
              elements: {
                card: 'bg-[#1D222A] border border-[rgba(158,152,143,0.18)] shadow-2xl rounded-2xl text-[#F4EFEA]',
                headerTitle: 'font-serif text-[#F4EFEA] text-xl font-bold',
                headerSubtitle: 'text-[#9E988F]',
                formFieldLabel: 'text-[#9E988F] font-mono text-xs',
                formFieldInput: 'bg-[#2E3543] border border-[rgba(158,152,143,0.25)] text-[#F4EFEA] focus:border-[#C89B5C]',
                socialButtonsBlockButton: 'bg-[#2E3543] border border-[rgba(158,152,143,0.18)] text-[#F4EFEA] hover:bg-[#384050]',
                socialButtonsBlockButtonText: 'text-[#F4EFEA] font-medium',
                dividerLine: 'bg-[rgba(158,152,143,0.18)]',
                dividerText: 'text-[#9E988F] font-mono text-xs',
                formButtonPrimary: 'bg-[#C89B5C] hover:bg-[#DFB77B] text-[#13161C] font-semibold font-mono shadow-md',
                footerActionText: 'text-[#9E988F]',
                footerActionLink: 'text-[#C89B5C] hover:text-[#F4EFEA]',
                identityPreviewText: 'text-[#F4EFEA]',
                identityPreviewEditButton: 'text-[#C89B5C]',
                userButtonPopoverCard: 'bg-[#1D222A] border border-[rgba(158,152,143,0.18)] shadow-2xl text-[#F4EFEA]',
                userButtonPopoverActionButton: 'text-[#F4EFEA] hover:bg-[#2E3543]',
                userButtonPopoverActionButtonText: 'text-[#F4EFEA]',
                userButtonPopoverActionButtonIcon: 'text-[#C89B5C]',
                userPreviewMainIdentifier: 'text-[#F4EFEA] font-medium',
                userPreviewSecondaryIdentifier: 'text-[#9E988F]',
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
