'use client';

import { useState } from 'react';
import { TIPO_ROTULO, type Conquista, type TipoConquista } from '@/lib/tipos';

const COR: Record<TipoConquista, string> = {
  ARTIGO: '#2f6fe0', TCC: '#17b8a6', SOFTWARE: '#9b4dea', PREMIO: '#e5c100', EDITAL: '#22c93a', TRAJETORIA: '#e45ad2', EVENTO: '#f59a0c',
};

export function ListaConquistas({ conquistas, nomes }: { conquistas: Conquista[]; nomes: Record<string, string> }) {
  const [tipo, setTipo] = useState<TipoConquista | ''>('');
  const tipos = Array.from(new Set(conquistas.map((c) => c.tipo)));
  const lista = conquistas.filter((c) => !tipo || c.tipo === tipo);
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
      {anos.map((ano) => (
        <section key={ano} className="mt-12 md:grid md:grid-cols-[10rem_1fr] md:gap-6">
          <h2 className="text-6xl md:text-7xl">{ano}</h2>
          <ul>
            {lista.filter((c) => c.ano === ano).map((c) => {
              const gente = c.autores || c.pessoaIds.map((id) => nomes[id]).filter(Boolean).join(', ');
              return (
                <li key={c.id} className="border-t-[2.5px] border-tinta py-5">
                  <span className="etiqueta" style={{ ['--cor' as string]: COR[c.tipo] }}><i />{TIPO_ROTULO[c.tipo]}</span>
                  <h3 className="mt-2 text-3xl max-w-[40ch]">{c.titulo}</h3>
                  {c.veiculo && <p className="font-semibold mt-1">{c.veiculo}</p>}
                  {c.descricao && <p className="mt-1 max-w-[62ch]">{c.descricao}</p>}
                  {gente && <p className="text-sm text-grafite mt-1">{gente}</p>}
                  {c.url && <a href={c.url} target="_blank" rel="noreferrer" className="text-sm underline underline-offset-4">Ver a fonte</a>}
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
