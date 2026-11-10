import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: { default: 'LABIC — Laboratório de Inovação e Criatividade do IFS', template: '%s | LABIC' },
  description:
    'Projetos, pessoas, startups e conquistas do LABIC, o Laboratório de Inovação e Criatividade do Instituto Federal de Sergipe, Campus Lagarto. Desde 2017.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
