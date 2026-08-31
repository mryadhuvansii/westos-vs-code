import type { Metadata, Viewport } from 'next';
import { Inter, Poppins } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const poppins = Poppins({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-poppins',
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
});

export const metadata: Metadata = {
  title: {
    default: 'Westos - Be Your Best',
    template: '%s | Westos',
  },
  description: 'Westos - Premium Jeans & Fashion Brand. Discover premium quality jeans, cargos and fashion apparel.',
  keywords: ['jeans', 'fashion', 'clothing', 'westos', 'mens fashion', 'womens fashion'],
  authors: [{ name: 'Westos' }],
  creator: 'Westos',
  publisher: 'Westos',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://www.westos.com',
    siteName: 'Westos',
    title: 'Westos - Be Your Best',
    description: 'Premium jeans and fashion brand offering quality apparel at affordable prices.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Westos - Be Your Best',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Westos - Be Your Best',
    description: 'Premium jeans and fashion brand.',
    images: ['/og-image.jpg'],
  },
  verification: {
    google: 'google-site-verification-code',
  },
};

export const viewport: Viewport = {
  themeColor: '#22c55e',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable} antialiased`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://cdn.westos.com" />
        <link rel="dns-prefetch" href="https://api.westos.com" />
      </head>
      <body className={`${inter.className} ${poppins.className} font-sans bg-white text-secondary-900`}>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.classList.add('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}