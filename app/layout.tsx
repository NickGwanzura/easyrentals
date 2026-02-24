import type { Metadata } from 'next';
import { AuthProvider } from '@/lib/auth/context';
import { ToastProvider } from '@/components/ui/Toast';
import './globals.css';

export const metadata: Metadata = {
  title: 'EazyRentals - Property Management Made Simple',
  description: 'Modern rental property management system for landlords, agents, and tenants.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
