import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import './globals.css';
import Providers from './providers';

const geist = Geist({ subsets: ['latin'], variable: '--font-geist-sans' });

export const metadata: Metadata = {
  title: { default: 'CLMStore — Food Delivery in Sierra Leone', template: '%s | CLMStore' },
  description: 'Order food from the best restaurants in Freetown, Sierra Leone. Fast delivery, real-time tracking.',
  keywords: ['food delivery', 'Sierra Leone', 'Freetown', 'restaurant', 'order food'],
  openGraph: {
    siteName: 'CLMStore',
    type: 'website',
    locale: 'en_SL',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={geist.variable}>
      <body className="min-h-screen flex flex-col bg-[#F8F8F8] antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
