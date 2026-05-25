import './globals.css';
import Layout from '@/components/layout/Layout';
import Providers from './providers';

export const metadata = {
  metadataBase: new URL('https://www.curioustoddlers.com'),
  title: 'Curious Toddlers',
  description: "Montessori-inspired tools, activities, and learning to support your child's development.",
  openGraph: {
    siteName: 'Curious Toddlers',
    type: 'website',
    url: '/',
    title: 'Curious Toddlers',
    description: "Montessori-inspired tools, activities, and learning to support your child's development.",
    images: [
      {
        url: '/curious-toddlers-home-image.jpg',
        width: 1325,
        height: 768,
        alt: 'Parent and toddler exploring Montessori activities together',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Layout>{children}</Layout>
        </Providers>
      </body>
    </html>
  );
}
