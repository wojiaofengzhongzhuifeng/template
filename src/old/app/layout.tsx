import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AI Children Picture Book',
  description: 'Generate personalized picture books for children using AI',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
