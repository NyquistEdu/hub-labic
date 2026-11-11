export type Vinculo = 'COORDENACAO' | 'PESQUISADOR' | 'ESTUDANTE' | 'EGRESSO' | 'PARCEIRO' | 'EGRESSO_PARCEIRO';
export type TipoConquista = 'ARTIGO' | 'TCC' | 'SOFTWARE' | 'PREMIO' | 'EDITAL' | 'TRAJETORIA' | 'EVENTO';
export type Estagio = 'IDEACAO' | 'VALIDACAO' | 'MVP' | 'OPERACAO' | 'ENCERRADA';

export interface Pessoa {
  id: string;
  slug: string;
  nome: string;
  vinculo: Vinculo;
  papel: string;
  instituicao: string;
  curso: string;
  ano_entrada: number | null;
  ano_saida: number | null;
  bio: string;
  onde_esta: string;
  cidade: string;
  pais: string;
  foto_url: string;
  lattes_url: string;
  linkedin_url: string;
  github_url: string;
  destaque: boolean;
  publicado: boolean;
}

export interface Projeto {
  id: string;
  slug: string;
  titulo: string;
  resumo: string;
  descricao: string;
  areas: string[];
  status: 'EM_ANDAMENTO' | 'CONCLUIDO';
  ano_inicio: number | null;
  ano_fim: number | null;
  fomento: string;
  capa_url: string;
  galeria: string[];
  video_url: string;
  destaque: boolean;
  publicado: boolean;
  /** vínculos com pessoas (id da pessoa + papel no projeto) */
  equipe: { pessoaId: string; papel: string }[];
}

export interface Conquista {
  id: string;
  tipo: TipoConquista;
  titulo: string;
  ano: number;
  veiculo: string;
  autores: string;
  descricao: string;
  url: string;
  /** PDF guardado no site (opcional) */
  arquivo_url?: string;
  /** projeto ao qual a conquista está ligada (opcional) */
  projeto_id?: string | null;
  publicado: boolean;
  pessoaIds: string[];
}

export interface Iniciativa {
  id: string;
  slug: string;
  nome: string;
  tagline: string;
  descricao: string;
  estagio: Estagio;
  ano: number | null;
  logo_url: string;
  site_url: string;
  publicado: boolean;
  pessoaIds: string[];
}

export interface Parceiro {
  id: string;
  nome: string;
  tipo: string;
  descricao: string;
  url: string;
  logo_url: string;
  publicado: boolean;
}

export interface Marco {
  id: string;
  ano: number;
  mes: number | null;
  titulo: string;
  descricao: string;
  url: string;
  publicado: boolean;
}

export interface Depoimento {
  id: string;
  /** pessoa do acervo a quem o depoimento pertence (opcional) */
  pessoa_id: string | null;
  autor: string;
  papel: string;
  texto: string;
  ano: number | null;
  destaque: boolean;
  publicado: boolean;
}

export interface Acervo {
  pessoas: Pessoa[];
  projetos: Projeto[];
  conquistas: Conquista[];
  iniciativas: Iniciativa[];
  parceiros: Parceiro[];
  marcos: Marco[];
  depoimentos: Depoimento[];
  /** 'banco' quando veio do Supabase; 'inicial' quando veio do arquivo de acervo inicial */
  origem: 'banco' | 'inicial';
}

export const ANO_FUNDACAO = 2017;

/** As oito frentes do laboratório, com as cores dos ícones do logo. */
export const AREAS: Record<string, { nome: string; cor: string }> = {
  robotica: { nome: 'Robótica', cor: '#2f6fe0' },
  ia: { nome: 'Inteligência artificial', cor: '#f59a0c' },
  autonomos: { nome: 'Drones e veículos autônomos', cor: '#22c93a' },
  manipuladores: { nome: 'Manipuladores e controle', cor: '#17b8a6' },
  fabricacao: { nome: 'Fabricação digital', cor: '#e5c100' },
  software: { nome: 'Software e educação', cor: '#9b4dea' },
  eletronica: { nome: 'Eletrônica e embarcados', cor: '#ee3b2b' },
  interacao: { nome: 'Interação e realidade virtual', cor: '#e45ad2' },
};

export const VINCULO_ROTULO: Record<Vinculo, string> = {
  COORDENACAO: 'Coordenação',
  PESQUISADOR: 'Pesquisadores',
  ESTUDANTE: 'Estudantes',
  EGRESSO: 'Egressos',
  PARCEIRO: 'Parceiros de pesquisa',
  EGRESSO_PARCEIRO: 'Egressos e parceiros de pesquisa',
};

/**
 * Grupo da página de pessoas em que alguém aparece. Quem é "egresso e parceiro de pesquisa"
 * aparece nos dois grupos.
 */
export function noGrupo(vinculo: Vinculo, grupo: Vinculo): boolean {
  if (vinculo === grupo) return true;
  return vinculo === 'EGRESSO_PARCEIRO' && (grupo === 'EGRESSO' || grupo === 'PARCEIRO');
}

export const TIPO_ROTULO: Record<TipoConquista, string> = {
  ARTIGO: 'Artigo',
  TCC: 'TCC, dissertação ou tese',
  SOFTWARE: 'Registro de software ou patente',
  PREMIO: 'Prêmio',
  EDITAL: 'Edital aprovado',
  TRAJETORIA: 'Trajetória de egresso',
  EVENTO: 'Trabalho em evento',
};

export const ESTAGIO_ROTULO: Record<Estagio, string> = {
  IDEACAO: 'Ideação',
  VALIDACAO: 'Em validação',
  MVP: 'Produto em desenvolvimento',
  OPERACAO: 'Em operação',
  ENCERRADA: 'Encerrada',
};

export const STATUS_ROTULO = { EM_ANDAMENTO: 'Em andamento', CONCLUIDO: 'Concluído' } as const;

export function gerarSlug(texto: string): string {
  return texto
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function iniciais(nome: string): string {
  const p = nome.trim().split(/\s+/);
  return ((p[0]?.[0] ?? '') + (p.length > 1 ? p[p.length - 1][0] : '')).toUpperCase();
}
