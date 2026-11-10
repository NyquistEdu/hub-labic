import Link from 'next/link';
import { AREAS, STATUS_ROTULO, iniciais, type Pessoa, type Projeto } from '@/lib/tipos';
import { Capa } from './Capa';

export function EtiquetaArea({ area }: { area: string }) {
  const a = AREAS[area];
  if (!a) return null;
  return (
    <span className="etiqueta" style={{ ['--cor' as string]: a.cor }}>
      <i />
      {a.nome}
    </span>
  );
}

export function CartaoProjeto({ projeto, grande = false }: { projeto: Projeto; grande?: boolean }) {
  return (
    <Link href={`/projetos/${projeto.slug}`} className="group block">
      <Capa
        src={projeto.capa_url}
        alt=""
        areas={projeto.areas}
        espelhar={projeto.titulo.length % 2 === 1}
        className={`border-[2.5px] border-tinta rounded-[22px] ${grande ? 'aspect-[16/10]' : 'aspect-[4/3]'}`}
      />
      <div className="mt-3 flex items-start gap-2.5">
        <span className="no mt-1.5" style={{ background: AREAS[projeto.areas[0]]?.cor }} aria-hidden />
        <div>
          <h3 className={`${grande ? 'text-3xl md:text-4xl' : 'text-2xl'} group-hover:underline underline-offset-4 decoration-[3px]`}>
            {projeto.titulo}
          </h3>
          <p className="mt-1 text-grafite text-[0.95rem] leading-snug">{projeto.resumo}</p>
          <p className="mt-1 text-sm font-semibold">
            {STATUS_ROTULO[projeto.status]}
            {projeto.ano_inicio ? `, desde ${projeto.ano_inicio}` : ''}
          </p>
        </div>
      </div>
    </Link>
  );
}

const CORES = Object.values(AREAS).map((a) => a.cor);

export function Retrato({ pessoa, tamanho = 72 }: { pessoa: Pessoa; tamanho?: number }) {
  const cor = CORES[pessoa.nome.length % CORES.length];
  return pessoa.foto_url ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={pessoa.foto_url}
      alt=""
      width={tamanho}
      height={tamanho}
      className="rounded-full object-cover border-[2.5px] border-tinta flex-none"
      style={{ width: tamanho, height: tamanho }}
    />
  ) : (
    <span
      aria-hidden
      className="rounded-full border-[2.5px] border-tinta flex-none grid place-items-center font-bold"
      style={{ width: tamanho, height: tamanho, background: cor, fontSize: tamanho * 0.34 }}
    >
      {iniciais(pessoa.nome)}
    </span>
  );
}

export function CartaoPessoa({ pessoa }: { pessoa: Pessoa }) {
  const local = [pessoa.cidade, pessoa.pais].filter(Boolean).join(', ');
  return (
    <article id={pessoa.slug} className="flex gap-4 scroll-mt-24">
      <Retrato pessoa={pessoa} />
      <div className="min-w-0">
        <h3 className="text-2xl">{pessoa.nome}</h3>
        <p className="text-[0.95rem] font-semibold">{[pessoa.papel, pessoa.instituicao].filter(Boolean).join(', ')}</p>
        {pessoa.onde_esta && <p className="text-[0.95rem] mt-1">{pessoa.onde_esta}</p>}
        {pessoa.bio && <p className="text-[0.95rem] text-grafite mt-1">{pessoa.bio}</p>}
        <p className="text-sm text-grafite mt-1 flex flex-wrap gap-x-3">
          {local && <span>{local}</span>}
          {pessoa.lattes_url && <a className="underline" href={pessoa.lattes_url} target="_blank" rel="noreferrer">Lattes</a>}
          {pessoa.linkedin_url && <a className="underline" href={pessoa.linkedin_url} target="_blank" rel="noreferrer">LinkedIn</a>}
          {pessoa.github_url && <a className="underline" href={pessoa.github_url} target="_blank" rel="noreferrer">GitHub</a>}
        </p>
      </div>
    </article>
  );
}

export function TituloPagina({ titulo, children }: { titulo: string; children?: React.ReactNode }) {
  return (
    <div className="contorno pt-12 md:pt-16 pb-8">
      <h1 className="text-6xl md:text-8xl">{titulo}</h1>
      {children && <p className="mt-4 text-lg max-w-[62ch]">{children}</p>}
    </div>
  );
}
