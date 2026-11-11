'use client';

import { useState } from 'react';
import { getSupabase } from '@/lib/supabase';

const ANO_ATUAL = new Date().getFullYear();

export function FormularioDepoimento() {
  const [estado, setEstado] = useState<'pronto' | 'enviando' | 'enviado'>('pronto');
  const [erro, setErro] = useState('');

  async function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro('');
    const f = new FormData(e.currentTarget);
    if (f.get('site')) return; // campo-isca para robôs
    const texto = (k: string) => String(f.get(k) ?? '').trim();
    const dados = {
      autor: texto('autor'),
      papel: texto('papel'),
      texto: texto('texto'),
      ano: Number(texto('ano')) || null,
    };
    if (dados.texto.length < 20) {
      setErro('Escreva pelo menos uma ou duas frases no depoimento.');
      return;
    }
    const sb = getSupabase();
    if (!sb) {
      setErro('O envio ainda não está ligado ao banco de dados. Tente de novo em alguns dias.');
      return;
    }
    setEstado('enviando');
    const { error } = await sb.from('depoimentos').insert({ ...dados, publicado: false, destaque: false });
    if (error) {
      setErro('Não foi possível enviar o depoimento. Confira sua conexão e tente de novo.');
      setEstado('pronto');
      return;
    }
    setEstado('enviado');
  }

  if (estado === 'enviado') {
    return (
      <div className="border-[2.5px] border-tinta rounded-[22px] p-8" role="status">
        <h3 className="text-4xl">Depoimento enviado</h3>
        <p className="mt-3 text-lg">Obrigada! A coordenação lê cada depoimento antes de publicar nesta página.</p>
      </div>
    );
  }

  return (
    <form onSubmit={enviar} className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <label className="campo"><span>Seu nome</span><input name="autor" required minLength={3} maxLength={120} className="entrada" autoComplete="name" /></label>
        <label className="campo"><span>Ano em que entrou no LABIC</span><input name="ano" type="number" min={2017} max={ANO_ATUAL} className="entrada" /></label>
      </div>
      <label className="campo">
        <span>Quem você é</span>
        <input name="papel" maxLength={160} className="entrada" placeholder="Egressa de Engenharia Elétrica, hoje mestranda na UFS" />
      </label>
      <label className="campo">
        <span>Seu depoimento</span>
        <textarea name="texto" required minLength={20} maxLength={2000} className="entrada min-h-40" placeholder="O que você aprendeu, construiu ou levou do laboratório" />
        <small>Até 2.000 caracteres.</small>
      </label>
      <input name="site" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <label className="flex gap-3 items-start">
        <input type="checkbox" name="autoriza" required className="mt-1.5 w-5 h-5 accent-black" />
        <span>Autorizo o LABIC a publicar este depoimento com meu nome no site.</span>
      </label>
      {erro && <p role="alert" className="border-[2.5px] border-vermelho rounded-xl p-3 font-semibold">{erro}</p>}
      <button type="submit" className="botao" disabled={estado === 'enviando'}>
        {estado === 'enviando' ? 'Enviando depoimento...' : 'Enviar depoimento'}
      </button>
    </form>
  );
}
