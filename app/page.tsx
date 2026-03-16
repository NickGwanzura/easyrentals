import type { Metadata } from 'next';
import LandingPage from '@/components/landing/LandingPage';

export const metadata: Metadata = {
  title: 'EazyRentals — Property Management Made Simple',
  description:
    'Streamline your rental operations with an all-in-one platform. Collect rent, manage tenants, track properties, and grow your portfolio from one powerful dashboard.',
  openGraph: {
    title: 'EazyRentals — Property Management Made Simple',
    description: 'All-in-one property management platform for landlords and property managers.',
    type: 'website',
  },
};

export default function Page() {
  return <LandingPage />;
}
