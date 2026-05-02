import type { Metadata } from 'next';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter';
import ThemeRegistry from '@/app/ThemeRegistry';
import './globals.css';

export const metadata: Metadata = {
  title: 'CampusNotify — Campus Notifications System',
  description:
    'Stay updated with campus events, results, and placement notifications. Prioritized and organized for students.',
  keywords: ['campus', 'notifications', 'placement', 'results', 'events'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <AppRouterCacheProvider>
          <ThemeRegistry>{children}</ThemeRegistry>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}

