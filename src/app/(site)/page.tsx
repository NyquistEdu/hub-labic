import Link from 'next/link';
import { carregarAcervo } from '@/lib/acervo';
import { ANO_FUNDACAO, AREAS, ESTAGIO_ROTULO, noGrupo } from '@/lib/tipos';
import { CartaoProjeto, Retrato } from '@/components/Pecas';

export const revalidate = 60;

const MESES = ['', 'jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

export default async function Inicio() {
  const a = await carregarAcervo();
  const destaques = a.projetos.filter((p) => p.destaque).slice(0, 5);
  const anos = new Date().getFullYear() - ANO_FUNDACAO;
  const egressos = a.pessoas.filter((p) => noGrupo(p.vinculo, 'EGRESSO') && p.destaque).slice(0, 3);
  const marcos = [...a.marcos].sort((x, y) => x.ano - y.ano || (x.mes ?? 13) - (y.mes ?? 13));

  return (
    <>
      {/* Abertura */}
      <section className="contorno pt-10 md:pt-16 grid gap-8 md:grid-cols-[1.15fr_1fr] items-center">
        <div>
          <h1 className="text-[19vw] leading-[0.82] md:text-[9.5rem]">
            Da ideia
            <br />
            ao impacto
          </h1>
          <p className="mt-6 text-xl max-w-[34rem]">
            O LABIC é o Laboratório de Inovação e Criatividade do IFS Campus Lagarto. Aqui, estudantes de perfis
            diferentes aprendem com os próprios projetos e com os dos colegas, em robótica, eletrônica, computação e
            inteligência artificial.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/projetos" className="botao">Ver os projetos</Link>
            <Link href="/egressos" className="botao botao-vazado">Já passei pelo LABIC</Link>
          </div>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/img/logo-labic.jpg"
          alt="Logo do LABIC: a palavra LABIC num círculo, cercada por trilhas de circuito e oito ícones coloridos"
          width={640}
          height={640}
          className="w-full max-w-[34rem] justify-self-center"
        />
      </section>

      {/* Trilha que se desenha uma vez e leva aos números */}
      <div className="contorno mt-6" aria-hidden>
        <svg viewBox="0 0 1200 70" className="w-full h-auto" fill="none" stroke="#000" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
          <path className="trilha" pathLength={1} d="M12 20 H330 L370 54 H760 L800 20 H1188" />
          <circle className="trilha-ponto" style={{ animationDelay: '.2s' }} cx="12" cy="20" r="9" fill="#000" />
          <circle className="trilha-ponto" style={{ animationDelay: '.7s' }} cx="560" cy="54" r="9" fill="#fff" />
          <circle className="trilha-ponto" style={{ animationDelay: '1.3s' }} cx="1188" cy="20" r="9" fill="#000" />
        </svg>
      </div>

      <section className="contorno mt-4">
        <p className="display text-5xl md:text-7xl max-w-5xl">
          {anos} anos, {a.projetos.length} projetos, {a.iniciativas.length} negócios nascidos no laboratório.
        </p>
        <p className="mt-4 text-grafite max-w-[60ch]">
          Fundado em agosto de {ANO_FUNDACAO} com seis estudantes. Este acervo está em construção, e a lista
          cresce à medida que a história do laboratório é registrada.
        </p>
      </section>

      {/* Frentes */}
      <section className="contorno mt-20">
        <h2 className="text-5xl md:text-6xl">Em que o laboratório trabalha</h2>
        <ul className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-8">
          {Object.entries(AREAS).map(([chave, area]) => {
            const n = a.projetos.filter((p) => p.areas.includes(chave)).length;
            return (
              <li key={chave}>
                <Link href={`/projetos?area=${chave}`} className="group block">
                  <span className="block w-14 h-14 rounded-full border-[3px] border-tinta" style={{ background: area.cor }} />
                  <span className="block mt-3 font-semibold text-lg leading-tight group-hover:underline underline-offset-4">{area.nome}</span>
                  <span className="block text-grafite text-sm">{n === 1 ? '1 projeto' : `${n} projetos`}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Projetos em destaque */}
      {destaques.length > 0 && (
        <section className="contorno mt-24">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="text-5xl md:text-6xl">Na bancada agora</h2>
            <Link href="/projetos" className="botao botao-vazado botao-pequeno">Todos os {a.projetos.length} projetos</Link>
          </div>
          <div className="mt-8 grid gap-x-8 gap-y-12 md:grid-cols-6">
            {destaques.map((p, i) => (
              <div key={p.id} className={i < 2 ? 'md:col-span-3' : 'md:col-span-2'}>
                <CartaoProjeto projeto={p} grande={i < 2} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Linha do tempo */}
      <section id="historia" className="contorno mt-24 scroll-mt-24">
        <h2 className="text-5xl md:text-6xl">A história até aqui</h2>
        <ol className="mt-10 relative ml-2 border-l-[4px] border-tinta">
          {marcos.map((m, i) => (
            <li key={m.id} className="relative pl-8 md:pl-12 pb-10 last:pb-0">
              <span
                aria-hidden
                className="absolute -left-[13px] top-2 w-[22px] h-[22px] rounded-full border-[4px] border-tinta"
                style={{ background: i % 2 ? '#fff' : Object.values(AREAS)[i % 8].cor }}
              />
              <div className="md:grid md:grid-cols-[11rem_1fr] md:gap-6">
                <p className="display text-5xl md:text-6xl">
                  {m.ano}
                  {m.mes ? <span className="text-2xl text-grafite"> {MESES[m.mes]}</span> : null}
                </p>
                <div className="max-w-[58ch]">
                  <h3 className="text-3xl mt-1 md:mt-0">{m.titulo}</h3>
                  <p className="mt-1">{m.descricao}</p>
                  {m.url && (
                    <a href={m.url} target="_blank" rel="noreferrer" className="text-sm underline underline-offset-4">
                      Ler a notícia
                    </a>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Egressos */}
      <section className="mt-24 bg-tinta text-papel">
        <div className="contorno py-16 grid gap-10 md:grid-cols-[1fr_1.1fr]">
          <div>
            <h2 className="text-5xl md:text-7xl">Quem passou por aqui foi longe</h2>
            <p className="mt-5 max-w-[46ch] text-lg">
              Mestrados no ITA e no Canadá, concursos, empresas próprias. Se você fez parte do LABIC, conte onde está
              hoje e entre para o mapa do laboratório.
            </p>
            <Link href="/egressos" className="botao mt-6 !bg-papel !text-tinta !border-papel hover:!bg-tinta hover:!text-papel">
              Fazer meu cadastro de egresso
            </Link>
          </div>
          <ul className="space-y-6">
            {egressos.map((p) => (
              <li key={p.id} className="flex gap-4 items-center text-papel">
                <span className="text-tinta"><Retrato pessoa={p} tamanho={64} /></span>
                <div>
                  <p className="display text-3xl">{p.nome}</p>
                  <p>{p.onde_esta}</p>
                </div>
              </li>
            ))}
            <li>
              <Link href="/pessoas" className="underline underline-offset-4">Conhecer todas as pessoas</Link>
            </li>
          </ul>
        </div>
      </section>

      {/* Startups */}
      {a.iniciativas.length > 0 && (
        <section className="contorno mt-24">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="text-5xl md:text-6xl">Negócios que nasceram no LABIC</h2>
            <Link href="/startups" className="botao botao-vazado botao-pequeno">Ver as startups</Link>
          </div>
          <ul className="mt-8 grid md:grid-cols-3 gap-x-8">
            {a.iniciativas.map((s) => (
              <li key={s.id} className="border-t-[2.5px] border-tinta py-4">
                <p className="display text-3xl">{s.nome}</p>
                <p className="mt-1">{s.tagline}</p>
                <p className="text-sm text-grafite mt-1">{ESTAGIO_ROTULO[s.estagio]}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Parceiros */}
      {a.parceiros.length > 0 && (
        <section className="contorno mt-24">
          <h2 className="text-5xl md:text-6xl">Quem apoia e pesquisa junto</h2>
          <ul className="mt-6 flex flex-wrap gap-3">
            {a.parceiros.map((p) => (
              <li key={p.id} className="etiqueta !text-base !px-4 !py-1.5" title={p.descricao}>
                {p.url ? <a href={p.url} target="_blank" rel="noreferrer">{p.nome}</a> : p.nome}
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
