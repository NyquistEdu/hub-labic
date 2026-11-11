'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { TIPO_ROTULO, type Conquista, type TipoConquista } from '@/lib/tipos';

const COR: Partial<Record<TipoConquista, string>> = { ARTIGO: '#2f6fe0', TCC: '#17b8a6', EVENTO: '#f59a0c' };
const semAcento = (t: string) => t.normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase();

export interface ItemPublicacao extends Conquista {
  autoresTexto: string;
  projeto?: { slug: string; titulo: string };
}

export function ListaPublicacoes({ itens }: { itens: ItemPublicacao[] }) {
  const [tipo, setTipo] = useState<TipoConquista | ''>('');
  const [ano, setAno] = useState('');
  const [busca, setBusca] = useState('');
  const [soComArquivo, setSoComArquivo] = useState(false);

  const tipos = Array.from(new Set(itens.map((c) => c.tipo)));
  const anosTodos = Array.from(new Set(itens.map((c) => c.ano))).sort((a, b) => b - a);
  const lista = useMemo(() => {
    const termo = semAcento(busca.trim());
    return itens.filter(
      (c) =>
        (!tipo || c.tipo === tipo) &&
        (!ano || String(c.ano) === ano) &&
        (!soComArquivo || c.arquivo_url || c.url) &&
        (!termo || semAcento(`${c.titulo} ${c.autoresTexto} ${c.veiculo}`).includes(termo))
    );
  }, [itens, tipo, ano, busca, soComArquivo]);
  const anos = Array.from(new Set(lista.map((c) => c.ano))).sort((a, b) => b - a);

  return (
    <div className="contorno">
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por tipo">
        <button type="button" onClick={() => setTipo('')} aria-pressed={!tipo} className={`etiqueta cursor-pointer ${!tipo ? '!bg-tinta !text-papel' : ''}`}>
          Tudo
        </button>
        {tipos.map((t) => (
          <button key={t} type="button" onClick={() => setTipo(tipo === t ? '' : t)} aria-pressed={tipo === t}
            className={`etiqueta cursor-pointer ${tipo === t ? '!bg-tinta !text-papel' : ''}`} style={{ ['--cor' as string]: COR[t] }}>
            <i />
            {TIPO_ROTULO[t]}
          </button>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-3 items-center">
        <input type="search" value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar por título, autor ou evento"
          aria-label="Buscar publicação" className="entrada !w-80 max-w-full !rounded-full !py-1.5" />
        <select value={ano} onChange={(e) => setAno(e.target.value)} aria-label="Ano" className="entrada !w-auto !rounded-full !py-1.5">
          <option value="">Todos os anos</option>
          {anosTodos.map((a) => <option key={a} value={a}>{a}</option>)}
        </select>
        <label className="flex items-center gap-2 text-[0.95rem] font-semibold">
          <input type="checkbox" className="w-4 h-4 accent-black" checked={soComArquivo} onChange={(e) => setSoComArquivo(e.target.checked)} />
          Só com arquivo ou link
        </label>
        <p className="text-grafite text-sm" aria-live="polite">{lista.length === 1 ? '1 publicação' : `${lista.length} publicações`}</p>
      </div>

      {lista.length === 0 && <p className="mt-12 text-lg">Nenhuma publicação com esses filtros. Limpe a busca ou escolha outro ano.</p>}

      {anos.map((a) => (
        <section key={a} className="mt-12 md:grid md:grid-cols-[10rem_1fr] md:gap-6">
          <h2 className="text-6xl md:text-7xl">{a}</h2>
          <ul>
            {lista.filter((c) => c.ano === a).map((c) => (
              <li key={c.id} className="border-t-[2.5px] border-tinta py-5 md:flex md:items-start md:justify-between md:gap-6">
                <div className="min-w-0">
                  <span className="etiqueta" style={{ ['--cor' as string]: COR[c.tipo] }}><i />{TIPO_ROTULO[c.tipo]}</span>
                  <h3 className="mt-2 text-2xl md:text-3xl max-w-[40ch]">{c.titulo}</h3>
                  {c.autoresTexto && <p className="mt-1">{c.autoresTexto}</p>}
                  {c.veiculo && <p className="font-semibold mt-1">{c.veiculo}</p>}
                  {c.projeto && (
                    <p className="text-sm mt-1">
                      Projeto: <Link className="underline underline-offset-4" href={`/projetos/${c.projeto.slug}`}>{c.projeto.titulo}</Link>
                    </p>
                  )}
                </div>
                <div className="mt-3 md:mt-1 flex flex-wrap gap-2 flex-none">
                  {c.arquivo_url && (
                    <a className="botao botao-pequeno" href={c.arquivo_url} target="_blank" rel="noreferrer" download>Baixar PDF</a>
                  )}
                  {c.url && (
                    <a className={`botao botao-pequeno ${c.arquivo_url ? 'botao-vazado' : ''}`} href={c.url} target="_blank" rel="noreferrer">Abrir publicação</a>
                  )}
                  {!c.arquivo_url && !c.url && <span className="text-sm text-grafite">Arquivo ainda não disponível</span>}
                </div>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
