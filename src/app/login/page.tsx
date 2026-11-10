'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { getSupabase } from '@/lib/supabase';

export default function Login() {
  const router = useRouter();
  const [erro, setErro] = useState('');
  const [entrando, setEntrando] = useState(false);

  async function entrar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro('');
    const sb = getSupabase();
    if (!sb) return setErro('O banco de dados não está configurado neste endereço.');
    const f = new FormData(e.currentTarget);
    setEntrando(true);
    const { error } = await sb.auth.signInWithPassword({ email: String(f.get('email')), password: String(f.get('senha')) });
    setEntrando(false);
    if (error) return setErro('E-mail ou senha incorretos.');
    router.push('/gestao');
  }

  return (
    <main className="min-h-screen grid place-items-center p-6">
      <form onSubmit={entrar} className="w-full max-w-sm space-y-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/img/logo-labic-miolo.png" alt="LABIC" width={96} height={96} />
        <h1 className="text-5xl">Área de gestão</h1>
        <label className="campo"><span>E-mail</span><input name="email" type="email" required autoComplete="username" className="entrada" /></label>
        <label className="campo"><span>Senha</span><input name="senha" type="password" required autoComplete="current-password" className="entrada" /></label>
        {erro && <p role="alert" className="font-semibold text-vermelho">{erro}</p>}
        <button className="botao w-full" disabled={entrando}>{entrando ? 'Entrando...' : 'Entrar'}</button>
        <p className="text-sm"><Link className="underline" href="/">Voltar ao site</Link></p>
      </form>
    </main>
  );
}
