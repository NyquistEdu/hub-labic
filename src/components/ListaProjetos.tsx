'use client';

import { useMemo, useState } from 'react';
import { AREAS, type Projeto } from '@/lib/tipos';
import { CartaoProjeto } from './Pecas';

export function ListaProjetos({ projetos, areaInicial }: { projetos: Projeto[]; areaInicial?: string }) {
  const [area, setArea] = useState(areaInicial && AREAS[areaInicial] ? areaInicial : '');
  const [status, setStatus] = useState('');
  const [busca, setBusca] = useState('');

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return projetos.filter(
      (p) =>
        (!area || p.areas.includes(area)) &&
        (!status || p.status === status) &&
        (!termo || (p.titulo + ' ' + p.resumo).toLowerCase().includes(termo))
    );
  }, [projetos, area, status, busca]);

  return (
    <div className="contorno">
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por frente">
        <button type="button" onClick={() => setArea('')} aria-pressed={!area} className={`etiqueta cursor-pointer ${!area ? '!bg-tinta !text-papel' : ''}`}>
          Todas as frentes
        </button>
        {Object.entries(AREAS).map(([chave, a]) => (
          <button
            key={chave}
            type="button"
            onClick={() => setArea(area === chave ? '' : chave)}
            aria-pressed={area === chave}
            className={`etiqueta cursor-pointer ${area === chave ? '!bg-tinta !text-papel' : ''}`}
            style={{ ['--cor' as string]: a.cor }}
          >
            <i />
            {a.nome}
          </button>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-3 items-center">
        <input
          type="search"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar projeto"
          aria-label="Buscar projeto"
          className="entrada !w-64 !rounded-full !py-1.5"
        />
        <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Situação" className="entrada !w-auto !rounded-full !py-1.5">
          <option value="">Em andamento e concluídos</option>
          <option value="EM_ANDAMENTO">Em andamento</option>
          <option value="CONCLUIDO">Concluídos</option>
        </select>
        <p className="text-grafite text-sm" aria-live="polite">
          {filtrados.length === 1 ? '1 projeto' : `${filtrados.length} projetos`}
        </p>
      </div>

      {filtrados.length === 0 ? (
        <p className="mt-12 text-lg">Nenhum projeto com esses filtros. Limpe a busca ou escolha outra frente.</p>
      ) : (
        <div className="mt-10 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {filtrados.map((p) => (
            <CartaoProjeto key={p.id} projeto={p} />
          ))}
        </div>
      )}
    </div>
  );
}
