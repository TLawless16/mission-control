import './globals.css';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'ApexRex AI — Mission Control',
  description: 'ApexRex AI Platform Command Center',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[#0A0A0A] text-white antialiased min-h-screen`}>
        {children}
      </body>
    </html>
  );
}
