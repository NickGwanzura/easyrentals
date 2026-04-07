import type { Metadata, Viewport } from 'next';
import { IBM_Plex_Sans, IBM_Plex_Mono } from 'next/font/google';
import { Auth0Provider } from '@auth0/nextjs-auth0/client';
import { AuthProvider } from '@/lib/auth/context';
import { ToastProvider } from '@/components/ui/Toast';
import { BrandingProvider } from '@/lib/branding/context';
import { WorkflowProvider } from '@/lib/workflow/context';
import { getCurrentCompany, generateBrandingCSS } from '@/lib/whitelabel/server';


// IBM Carbon Design System styles
import '@carbon/styles/css/styles.css';
import './globals.css';

// IBM Plex Sans - Carbon's primary font
const ibmPlexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--cds-font-family',
  display: 'swap',
});

// IBM Plex Mono - Carbon's monospace font
const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--cds-font-family-mono',
  display: 'swap',
});

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const company = await getCurrentCompany();
  
  return {
    title: {
      default: company?.name || 'EazyRentals',
      template: `%s | ${company?.name || 'EazyRentals'}`,
    },
    description: 'Property Management Made Simple',
    icons: company?.favicon_url ? { icon: company.favicon_url } : undefined,
  };
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#161616' },
  ],
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const company = await getCurrentCompany();
  const brandingCSS = generateBrandingCSS(company);
  
  return (
    <html lang="en" className={`${ibmPlexSans.variable} ${ibmPlexMono.variable}`}>
      <head>
        {/* Server-side branding styles */}
        <style 
          id="server-branding" 
          dangerouslySetInnerHTML={{ __html: brandingCSS }}
        />
        {company?.custom_css && (
          <style 
            id="custom-company-css" 
            dangerouslySetInnerHTML={{ __html: company.custom_css }}
          />
        )}
      </head>
      <body className="font-carbon antialiased">
        <Auth0Provider>
          <AuthProvider>
            <WorkflowProvider>
              <BrandingProvider initialCompany={company}>
                <ToastProvider>
                  {children}
                </ToastProvider>
              </BrandingProvider>
            </WorkflowProvider>
          </AuthProvider>
        </Auth0Provider>
      </body>
    </html>
  );
}
