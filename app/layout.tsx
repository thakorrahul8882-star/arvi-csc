import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ARVI ONLINE & CSC – જન સુવિધા કેન્દ્ર (ખોડાણા, પાટણ)',
  description: 'આર્વી ઓનલાઈન & CSC – જન સુવિધા કેન્દ્ર, ખોડાણા, પાટણ, ગુજરાત. સંચાલક: રાહુલ ઠાકોર. સરકારી યોજનાઓ, પ્રમાણપત્રો, પાન કાર્ડ, આયુષ્માન કાર્ડ અને તમામ ઓનલાઇન સેવાઓ.',
  openGraph: {
    title: 'ARVI ONLINE & CSC – જન સુવિધા કેન્દ્ર | ખોડાણા, પાટણ',
    description: 'ખોડાણા અને પાટણ વિસ્તારના નાગરિકો માટે તમામ ડિજિટલ અને સરકારી સેવાઓ એક જ સ્થળે! સંચાલક: રાહુલ ઠાકોર, મો. 7265013972.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ARVI ONLINE & CSC – જન સુવિધા કેન્દ્ર',
    description: 'તમામ સરકારી યોજનાઓ, પ્રમાણપત્રો, પાન કાર્ડ, આયુષ્માન કાર્ડ અને ડિજિટલ સેવાઓ.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="gu" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="theme-color" content="#0F4C81" />
      </head>
      <body className="bg-slate-50 text-slate-900 antialiased dark:bg-slate-950 dark:text-slate-100 min-h-screen selection:bg-amber-100 selection:text-amber-900 dark:selection:bg-amber-900/40 dark:selection:text-amber-200">
        {children}
      </body>
    </html>
  );
}
