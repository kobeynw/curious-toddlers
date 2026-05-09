import './globals.css';
import Layout from '@/components/layout/Layout';
import Providers from './providers';

export const metadata = {
  title: 'Curious Toddlers',
  description: "Montessori-inspired tools, activities, and learning to support your child's development.",
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
