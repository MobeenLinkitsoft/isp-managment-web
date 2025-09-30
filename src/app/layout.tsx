import './globals.css';
import QueryClientProvider from './providers';
import RemoveExtensionAttrs from '@/components/RemoveExtensionAttrs';

export const metadata = {
  title: 'Login.Me ISP',
  description: 'A description for my page',
};

 

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <RemoveExtensionAttrs />
        <QueryClientProvider>
          {children}
        </QueryClientProvider>
      </body>
    </html>
  );
}