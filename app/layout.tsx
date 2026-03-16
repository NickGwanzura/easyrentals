import type { Metadata, Viewport } from 'next';
import { Ubuntu } from 'next/font/google';
import { AuthProvider } from '@/lib/auth/context';
import { ToastProvider } from '@/components/ui/Toast';
import { BrandingProvider } from '@/lib/branding/context';
import { WorkflowProvider } from '@/lib/workflow/context';
import { getCurrentCompany, generateBrandingCSS } from '@/lib/whitelabel/server';
import './globals.css';

const ubuntu = Ubuntu({
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],
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
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
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
    <html lang="en">
      <head>
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
      <body className={ubuntu.className}>
        <AuthProvider>
          <WorkflowProvider>
            <BrandingProvider initialCompany={company}>
              <ToastProvider>
                {children}
              </ToastProvider>
            </BrandingProvider>
          </WorkflowProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
