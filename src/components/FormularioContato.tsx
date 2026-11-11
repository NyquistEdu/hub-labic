'use client';

import { useState } from 'react';
import { getSupabase } from '@/lib/supabase';
import { ASSUNTOS } from '@/lib/contato';

export function FormularioContato() {
  const [estado, setEstado] = useState<'pronto' | 'enviando' | 'enviado'>('pronto');
  const [erro, setErro] = useState('');

  async function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro('');
    const f = new FormData(e.currentTarget);
    if (f.get('site')) return; // campo-isca para robôs
    const texto = (k: string) => String(f.get(k) ?? '').trim();
    const dados = { nome: texto('nome'), email: texto('email'), assunto: texto('assunto') || 'OUTRO', mensagem: texto('mensagem') };
    if (dados.mensagem.length < 10) {
      setErro('Escreva sua mensagem com um pouco mais de detalhe.');
      return;
    }
    const sb = getSupabase();
    if (!sb) {
      setErro('O envio ainda não está ligado ao banco de dados. Fale com a gente pelo Instagram @labic.ifs.');
      return;
    }
    setEstado('enviando');
    const { error } = await sb.from('mensagens').insert(dados);
    if (error) {
      setErro('Não foi possível enviar a mensagem. Confira o e-mail digitado e tente de novo.');
      setEstado('pronto');
      return;
    }
    setEstado('enviado');
  }

  if (estado === 'enviado') {
    return (
      <div className="border-[2.5px] border-tinta rounded-[22px] p-8" role="status">
        <h2 className="text-4xl">Mensagem enviada</h2>
        <p className="mt-3 text-lg">Obrigada pelo contato! A coordenação do LABIC responde pelo e-mail que você informou.</p>
      </div>
    );
  }

  return (
    <form onSubmit={enviar} className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <label className="campo"><span>Nome</span><input name="nome" required minLength={2} maxLength={120} className="entrada" autoComplete="name" /></label>
        <label className="campo"><span>E-mail para resposta</span><input name="email" type="email" required maxLength={160} className="entrada" autoComplete="email" /></label>
      </div>
      <label className="campo">
        <span>Assunto</span>
        <select name="assunto" className="entrada" defaultValue="PARCERIA">
          {Object.entries(ASSUNTOS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </label>
      <label className="campo">
        <span>Mensagem</span>
        <textarea name="mensagem" required minLength={10} maxLength={4000} className="entrada min-h-44" />
      </label>
      <input name="site" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      {erro && <p role="alert" className="border-[2.5px] border-vermelho rounded-xl p-3 font-semibold">{erro}</p>}
      <button type="submit" className="botao" disabled={estado === 'enviando'}>
        {estado === 'enviando' ? 'Enviando mensagem...' : 'Enviar mensagem'}
      </button>
    </form>
  );
}
