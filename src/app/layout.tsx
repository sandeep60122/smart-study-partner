
import type {Metadata} from 'next';
import {Geist, Geist_Mono} from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { UserProfileProvider } from '@/contexts/user-profile-context'; // Import UserProfileProvider

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Smart Study Partner',
  description: 'Your AI-Powered IAS Exam Preparation Assistant',
  creator: 'sandeep',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <UserProfileProvider> {/* Wrap with UserProfileProvider */}
          {children}
          <Toaster />
        </UserProfileProvider>
      </body>
    </html>
  );
}
