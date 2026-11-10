import type { Metadata } from 'next';
import './globals.css';
import { LabicProvider } from '@/context/LabicContext';

export const metadata: Metadata = {
  title: 'HUB-LABIC | Gestão Científica, Operacional e Vitrine — IFS Campus Lagarto',
  description:
    'Sistema integrado de produções científicas, projetos, bolsas, congressos (CROS), startups, coordenações e vitrine internacional do Laboratório de Pesquisa LABIC (IFS Campus Lagarto).',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="dark">
      <body className="antialiased selection:bg-emerald-500 selection:text-zinc-950">
        <LabicProvider>{children}</LabicProvider>
      </body>
    </html>
  );
}
