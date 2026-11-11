'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import inicial from '@/data/acervo-inicial.json';
import { lerAcervoDoBanco } from '@/lib/acervo';
import { getSupabase } from '@/lib/supabase';
import {
  AREAS, ESTAGIO_ROTULO, STATUS_ROTULO, TIPO_ROTULO, VINCULO_ROTULO, gerarSlug, type Acervo, type Pessoa,
} from '@/lib/tipos';

/* ----------------------------------------------------------------------------
 * Descrição das telas de cadastro. Para criar um campo novo: acrescente a coluna
 * numa migração SQL, em src/lib/tipos.ts e na lista "campos" abaixo.
 * -------------------------------------------------------------------------- */
type TipoCampo = 'texto' | 'longo' | 'numero' | 'opcoes' | 'sim_nao' | 'imagem' | 'imagens' | 'areas' | 'pessoas' | 'equipe' | 'projeto' | 'pessoa' | 'arquivo';
interface Campo { nome: string; rotulo: string; tipo: TipoCampo; opcoes?: Record<string, string>; ajuda?: string; obrigatorio?: boolean }
interface Entidade {
  chave: 'pessoas' | 'projetos' | 'conquistas' | 'iniciativas' | 'parceiros' | 'marcos' | 'depoimentos';
  titulo: string;
  singular: string;
  nomeDe: (i: Item) => string;
  detalheDe: (i: Item) => string;
  temSlug: boolean;
  vinculo?: { tabela: string; fk: string };
  campos: Campo[];
}
type Item = Record<string, unknown> & { id?: string };

const PUBLICADO: Campo = { nome: 'publicado', rotulo: 'Aparece no site', tipo: 'sim_nao' };

const ENTIDADES: Entidade[] = [
  {
    chave: 'pessoas', titulo: 'Pessoas', singular: 'pessoa', temSlug: true,
    nomeDe: (i) => String(i.nome ?? ''),
    detalheDe: (i) => [VINCULO_ROTULO[i.vinculo as keyof typeof VINCULO_ROTULO], i.instituicao, i.ano_entrada && `entrou em ${i.ano_entrada}`].filter(Boolean).join(', '),
    campos: [
      { nome: 'nome', rotulo: 'Nome completo', tipo: 'texto', obrigatorio: true },
      { nome: 'vinculo', rotulo: 'Vínculo com o LABIC', tipo: 'opcoes', opcoes: { COORDENACAO: 'Coordenação', PESQUISADOR: 'Pesquisador(a)', ESTUDANTE: 'Estudante (membro atual)', EGRESSO: 'Egresso(a)', PARCEIRO: 'Parceiro(a) de pesquisa', EGRESSO_PARCEIRO: 'Egresso(a) e parceiro(a) de pesquisa' }, ajuda: 'Egresso e parceiro aparece nos dois grupos do site: Egressos e Parceiros de pesquisa.' },
      { nome: 'papel', rotulo: 'Papel', tipo: 'texto', ajuda: 'Ex.: Bolsista PIBITI, Pesquisador, Egresso' },
      { nome: 'instituicao', rotulo: 'Instituição', tipo: 'texto' },
      { nome: 'curso', rotulo: 'Curso', tipo: 'texto' },
      { nome: 'ano_entrada', rotulo: 'Ano de entrada no LABIC', tipo: 'numero' },
      { nome: 'ano_saida', rotulo: 'Ano de saída', tipo: 'numero' },
      { nome: 'onde_esta', rotulo: 'Onde está hoje', tipo: 'texto', ajuda: 'Ex.: Mestrando em Robótica na Queen\'s University' },
      { nome: 'cidade', rotulo: 'Cidade atual', tipo: 'texto' },
      { nome: 'pais', rotulo: 'País atual', tipo: 'texto' },
      { nome: 'bio', rotulo: 'Minibiografia', tipo: 'longo', ajuda: 'Aparece no perfil da pessoa. Depoimentos ficam na aba Depoimentos.' },
      { nome: 'foto_url', rotulo: 'Foto', tipo: 'imagem' },
      { nome: 'lattes_url', rotulo: 'Lattes', tipo: 'texto' },
      { nome: 'linkedin_url', rotulo: 'LinkedIn', tipo: 'texto' },
      { nome: 'github_url', rotulo: 'GitHub', tipo: 'texto' },
      { nome: 'email', rotulo: 'E-mail de contato', tipo: 'texto', ajuda: 'Nunca aparece no site.' },
      { nome: 'destaque', rotulo: 'Destacar na página inicial', tipo: 'sim_nao' },
      PUBLICADO,
    ],
  },
  {
    chave: 'projetos', titulo: 'Projetos', singular: 'projeto', temSlug: true,
    vinculo: { tabela: 'projeto_pessoas', fk: 'projeto_id' },
    nomeDe: (i) => String(i.titulo ?? ''),
    detalheDe: (i) => [STATUS_ROTULO[i.status as keyof typeof STATUS_ROTULO], i.ano_inicio, i.fomento].filter(Boolean).join(', '),
    campos: [
      { nome: 'titulo', rotulo: 'Título', tipo: 'texto', obrigatorio: true },
      { nome: 'resumo', rotulo: 'Resumo em uma frase', tipo: 'texto', ajuda: 'Aparece nos cartões do site.' },
      { nome: 'descricao', rotulo: 'Descrição completa', tipo: 'longo' },
      { nome: 'areas', rotulo: 'Frentes', tipo: 'areas' },
      { nome: 'status', rotulo: 'Situação', tipo: 'opcoes', opcoes: STATUS_ROTULO },
      { nome: 'ano_inicio', rotulo: 'Ano de início', tipo: 'numero' },
      { nome: 'ano_fim', rotulo: 'Ano de conclusão', tipo: 'numero' },
      { nome: 'fomento', rotulo: 'Apoio ou edital', tipo: 'texto', ajuda: 'Ex.: PIBITI/IFS 2024, FAPITEC, voluntário' },
      { nome: 'capa_url', rotulo: 'Foto de capa', tipo: 'imagem' },
      { nome: 'galeria', rotulo: 'Mais fotos', tipo: 'imagens' },
      { nome: 'video_url', rotulo: 'Link do vídeo', tipo: 'texto' },
      { nome: 'equipe', rotulo: 'Equipe', tipo: 'equipe' },
      { nome: 'destaque', rotulo: 'Destacar na página inicial', tipo: 'sim_nao' },
      PUBLICADO,
    ],
  },
  {
    chave: 'conquistas', titulo: 'Conquistas', singular: 'conquista', temSlug: false,
    vinculo: { tabela: 'conquista_pessoas', fk: 'conquista_id' },
    nomeDe: (i) => String(i.titulo ?? ''),
    detalheDe: (i) => [TIPO_ROTULO[i.tipo as keyof typeof TIPO_ROTULO], i.ano, i.veiculo].filter(Boolean).join(', '),
    campos: [
      { nome: 'tipo', rotulo: 'Tipo', tipo: 'opcoes', opcoes: TIPO_ROTULO },
      { nome: 'titulo', rotulo: 'Título', tipo: 'texto', obrigatorio: true },
      { nome: 'ano', rotulo: 'Ano', tipo: 'numero', obrigatorio: true },
      { nome: 'veiculo', rotulo: 'Onde (evento, revista, agência, instituição)', tipo: 'texto' },
      { nome: 'autores', rotulo: 'Autores, como na publicação', tipo: 'texto', ajuda: 'Opcional. Se ficar vazio, o site lista as pessoas marcadas abaixo.' },
      { nome: 'descricao', rotulo: 'Descrição', tipo: 'longo' },
      { nome: 'url', rotulo: 'Link (DOI, notícia, certificado)', tipo: 'texto' },
      { nome: 'arquivo_url', rotulo: 'Arquivo em PDF', tipo: 'arquivo', ajuda: 'Opcional. Com o PDF aqui, o site oferece o botão de baixar. Envie só o que pode ser distribuído (versão do autor ou acesso aberto).' },
      { nome: 'projeto_id', rotulo: 'Projeto relacionado', tipo: 'projeto', ajuda: 'A conquista aparece na página desse projeto.' },
      { nome: 'pessoaIds', rotulo: 'Pessoas do LABIC envolvidas', tipo: 'pessoas' },
      PUBLICADO,
    ],
  },
  {
    chave: 'iniciativas', titulo: 'Startups', singular: 'startup', temSlug: true,
    vinculo: { tabela: 'iniciativa_pessoas', fk: 'iniciativa_id' },
    nomeDe: (i) => String(i.nome ?? ''),
    detalheDe: (i) => [ESTAGIO_ROTULO[i.estagio as keyof typeof ESTAGIO_ROTULO], i.ano].filter(Boolean).join(', '),
    campos: [
      { nome: 'nome', rotulo: 'Nome', tipo: 'texto', obrigatorio: true },
      { nome: 'tagline', rotulo: 'O que faz, em uma frase', tipo: 'texto' },
      { nome: 'descricao', rotulo: 'Descrição', tipo: 'longo' },
      { nome: 'estagio', rotulo: 'Estágio', tipo: 'opcoes', opcoes: ESTAGIO_ROTULO },
      { nome: 'ano', rotulo: 'Ano de início', tipo: 'numero' },
      { nome: 'logo_url', rotulo: 'Logo', tipo: 'imagem' },
      { nome: 'site_url', rotulo: 'Site', tipo: 'texto' },
      { nome: 'pessoaIds', rotulo: 'Pessoas', tipo: 'pessoas' },
      PUBLICADO,
    ],
  },
  {
    chave: 'depoimentos', titulo: 'Depoimentos', singular: 'depoimento', temSlug: false,
    nomeDe: (i) => String(i.autor || '') || 'Depoimento sem autor',
    detalheDe: (i) => {
      const t = String(i.texto ?? '');
      return [i.ano, i.destaque ? 'em destaque' : '', t.length > 90 ? `${t.slice(0, 90)}...` : t].filter(Boolean).join(', ');
    },
    campos: [
      { nome: 'pessoa_id', rotulo: 'Pessoa do acervo', tipo: 'pessoa', ajuda: 'Opcional. Liga o depoimento ao perfil: ele aparece também na página da pessoa, com a foto dela.' },
      { nome: 'autor', rotulo: 'Nome de quem escreveu', tipo: 'texto', ajuda: 'Se ficar vazio e houver pessoa escolhida, usamos o nome dela.' },
      { nome: 'papel', rotulo: 'Quem é', tipo: 'texto', ajuda: 'Ex.: Egressa de Engenharia Elétrica, hoje mestranda na UFS' },
      { nome: 'texto', rotulo: 'Depoimento', tipo: 'longo', obrigatorio: true },
      { nome: 'ano', rotulo: 'Ano', tipo: 'numero' },
      { nome: 'destaque', rotulo: 'Destacar no topo da página de depoimentos', tipo: 'sim_nao' },
      PUBLICADO,
    ],
  },
  {
    chave: 'parceiros', titulo: 'Parceiros', singular: 'parceiro', temSlug: false,
    nomeDe: (i) => String(i.nome ?? ''),
    detalheDe: (i) => String(i.tipo ?? ''),
    campos: [
      { nome: 'nome', rotulo: 'Nome', tipo: 'texto', obrigatorio: true },
      { nome: 'tipo', rotulo: 'Tipo', tipo: 'texto', ajuda: 'Ex.: Fomento, Universidade, Empresa' },
      { nome: 'descricao', rotulo: 'Descrição', tipo: 'longo' },
      { nome: 'url', rotulo: 'Site', tipo: 'texto' },
      { nome: 'logo_url', rotulo: 'Logo', tipo: 'imagem' },
      PUBLICADO,
    ],
  },
  {
    chave: 'marcos', titulo: 'Linha do tempo', singular: 'marco', temSlug: false,
    nomeDe: (i) => String(i.titulo ?? ''),
    detalheDe: (i) => [i.mes && `mês ${i.mes}`, i.ano].filter(Boolean).join(' de '),
    campos: [
      { nome: 'ano', rotulo: 'Ano', tipo: 'numero', obrigatorio: true },
      { nome: 'mes', rotulo: 'Mês (1 a 12, opcional)', tipo: 'numero' },
      { nome: 'titulo', rotulo: 'Título', tipo: 'texto', obrigatorio: true },
      { nome: 'descricao', rotulo: 'Descrição', tipo: 'longo' },
      { nome: 'url', rotulo: 'Link da notícia', tipo: 'texto' },
      PUBLICADO,
    ],
  },
];

const PADROES: Record<string, Item> = {
  pessoas: { vinculo: 'ESTUDANTE', publicado: true },
  projetos: { status: 'EM_ANDAMENTO', areas: [], galeria: [], equipe: [], publicado: true },
  conquistas: { tipo: 'ARTIGO', ano: new Date().getFullYear(), pessoaIds: [], publicado: true },
  iniciativas: { estagio: 'IDEACAO', pessoaIds: [], publicado: true },
  parceiros: { publicado: true },
  marcos: { ano: new Date().getFullYear(), publicado: true },
  depoimentos: { ano: new Date().getFullYear(), publicado: true },
};

interface Cadastro { id: string; criado_em: string; status: string; dados: Record<string, unknown>; foto_path: string; pessoa_id?: string | null }

/** Texto de um cadastro de egresso mostrado ao lado do formulário, para registrar o que a pessoa contou. */
interface Referencia { aba: 'conquistas' | 'projetos'; pessoaId: string; nome: string; rotulo: string; texto: string }

async function enviarImagem(sb: SupabaseClient, arquivo: File): Promise<string> {
  const ext = (arquivo.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '');
  const caminho = `${crypto.randomUUID()}.${ext}`;
  const { error } = await sb.storage.from('acervo').upload(caminho, arquivo, { contentType: arquivo.type });
  if (error) throw new Error(`Não foi possível enviar a imagem (${error.message}). Use JPG, PNG ou WebP com menos de 5 MB.`);
  return sb.storage.from('acervo').getPublicUrl(caminho).data.publicUrl;
}

async function enviarPdf(sb: SupabaseClient, arquivo: File): Promise<string> {
  if (arquivo.type !== 'application/pdf') throw new Error('Envie um arquivo PDF.');
  const base = gerarSlug(arquivo.name.replace(/\.pdf$/i, '')).slice(0, 60) || 'arquivo';
  const caminho = `${base}-${crypto.randomUUID().slice(0, 8)}.pdf`;
  const { error } = await sb.storage.from('publicacoes').upload(caminho, arquivo, { contentType: 'application/pdf' });
  if (error) throw new Error(`Não foi possível enviar o PDF (${error.message}). O limite é de 20 MB.`);
  return sb.storage.from('publicacoes').getPublicUrl(caminho).data.publicUrl;
}

export default function Gestao() {
  const router = useRouter();
  const sb = getSupabase();
  const [fase, setFase] = useState<'carregando' | 'sem_banco' | 'sem_acesso' | 'pronto'>('carregando');
  const [usuario, setUsuario] = useState('');
  const [acervo, setAcervo] = useState<Acervo | null>(null);
  const [cadastros, setCadastros] = useState<Cadastro[]>([]);
  const [emails, setEmails] = useState<Record<string, string>>({});
  const [aba, setAba] = useState('resumo');
  const [editando, setEditando] = useState<Item | null>(null);
  const [aviso, setAviso] = useState('');
  const [erro, setErro] = useState('');
  const [ocupado, setOcupado] = useState(false);
  const [referencia, setReferencia] = useState<Referencia | null>(null);

  const recarregar = useCallback(async () => {
    if (!sb) return;
    const [a, c, e] = await Promise.all([
      lerAcervoDoBanco(sb),
      sb.from('cadastros_egressos').select('*').order('criado_em', { ascending: false }),
      sb.from('pessoas_contato').select('pessoa_id, email'),
    ]);
    setAcervo(a);
    setCadastros((c.data ?? []) as Cadastro[]);
    setEmails(Object.fromEntries((e.data ?? []).map((x) => [x.pessoa_id, x.email])));
  }, [sb]);

  useEffect(() => {
    (async () => {
      if (!sb) return setFase('sem_banco');
      const { data } = await sb.auth.getSession();
      if (!data.session) return router.replace('/login');
      setUsuario(data.session.user.email ?? '');
      const g = await sb.from('gestores').select('user_id').eq('user_id', data.session.user.id).maybeSingle();
      if (g.error || !g.data) return setFase('sem_acesso');
      try {
        await recarregar();
        setFase('pronto');
      } catch (ex) {
        setErro(ex instanceof Error ? ex.message : 'Erro ao ler o banco.');
        setFase('pronto');
      }
    })();
  }, [sb, router, recarregar]);

  const entidade = ENTIDADES.find((e) => e.chave === aba);

  /** Abre Conquistas (formulário novo com a pessoa marcada) ou Projetos, com o texto do cadastro ao lado. */
  function registrarDoCadastro(c: Cadastro, alvo: 'conquistas' | 'projetos') {
    const d = c.dados as Record<string, string>;
    if (!c.pessoa_id) return;
    setErro(''); setAviso('');
    setReferencia({
      aba: alvo, pessoaId: c.pessoa_id, nome: d.nome,
      rotulo: alvo === 'conquistas' ? `Conquistas que ${d.nome} informou no cadastro` : `Projetos que ${d.nome} informou no cadastro`,
      texto: alvo === 'conquistas' ? d.conquistas : d.projetos,
    });
    setAba(alvo);
    setEditando(alvo === 'conquistas' ? { ...PADROES.conquistas, pessoaIds: [c.pessoa_id] } : null);
    window.scrollTo({ top: 0 });
  }
  const pendentes = cadastros.filter((c) => c.status === 'PENDENTE');

  async function sair() {
    await sb?.auth.signOut();
    router.replace('/login');
  }

  async function executar(acao: () => Promise<string>) {
    setErro(''); setAviso(''); setOcupado(true);
    try {
      const msg = await acao();
      await recarregar();
      setAviso(msg);
    } catch (ex) {
      setErro(ex instanceof Error ? ex.message : 'Algo deu errado.');
    } finally {
      setOcupado(false);
    }
  }

  async function salvar(ent: Entidade, valores: Item) {
    if (!sb) return;
    await executar(async () => {
      const linha: Item = {};
      for (const c of ent.campos) {
        if (['pessoas', 'equipe'].includes(c.tipo) || c.nome === 'email') continue;
        let v = valores[c.nome];
        if (c.tipo === 'numero') v = v === '' || v === undefined || v === null ? null : Number(v);
        else if (c.tipo === 'sim_nao') v = Boolean(v);
        else if (c.tipo === 'projeto' || c.tipo === 'pessoa') v = v || null;
        else if (c.tipo === 'areas' || c.tipo === 'imagens') v = v ?? [];
        else v = v ?? '';
        if (c.obrigatorio && (v === '' || v === null)) throw new Error(`Preencha o campo "${c.rotulo}".`);
        linha[c.nome] = v;
      }
      if (ent.chave === 'depoimentos' && !String(linha.autor ?? '').trim()) {
        const p = acervo?.pessoas.find((x) => x.id === linha.pessoa_id);
        if (!p) throw new Error('Escreva o nome de quem deu o depoimento ou escolha a pessoa do acervo.');
        linha.autor = p.nome;
      }
      if (ent.temSlug) linha.slug = valores.slug || gerarSlug(ent.nomeDe(valores));
      let id = valores.id;
      if (id) {
        const { error } = await sb.from(ent.chave).update(linha).eq('id', id);
        if (error) throw new Error(error.message);
      } else {
        const { data, error } = await sb.from(ent.chave).insert(linha).select('id').single();
        if (error) throw new Error(error.code === '23505' ? `Já existe ${ent.singular} com esse nome.` : error.message);
        id = data.id as string;
      }
      if (ent.vinculo) {
        const del = await sb.from(ent.vinculo.tabela).delete().eq(ent.vinculo.fk, id);
        if (del.error) throw new Error(del.error.message);
        const linhas =
          ent.chave === 'projetos'
            ? ((valores.equipe as { pessoaId: string; papel: string }[]) ?? []).map((e) => ({ projeto_id: id, pessoa_id: e.pessoaId, papel: e.papel }))
            : ((valores.pessoaIds as string[]) ?? []).map((p) => ({ [ent.vinculo!.fk]: id, pessoa_id: p }));
        if (linhas.length) {
          const ins = await sb.from(ent.vinculo.tabela).insert(linhas);
          if (ins.error) throw new Error(ins.error.message);
        }
      }
      if (ent.chave === 'pessoas' && typeof valores.email === 'string') {
        const up = await sb.from('pessoas_contato').upsert({ pessoa_id: id, email: valores.email });
        if (up.error) throw new Error(up.error.message);
      }
      setEditando(null);
      return `${ent.nomeDe(valores)}: salvo.`;
    });
  }

  async function excluir(ent: Entidade, item: Item) {
    if (!sb || !item.id) return;
    await executar(async () => {
      const { error } = await sb.from(ent.chave).delete().eq('id', item.id);
      if (error) throw new Error(error.message);
      setEditando(null);
      return `${ent.nomeDe(item)}: excluído.`;
    });
  }

  async function alternarPublicado(ent: Entidade, item: Item) {
    if (!sb) return;
    await executar(async () => {
      const { error } = await sb.from(ent.chave).update({ publicado: !item.publicado }).eq('id', item.id);
      if (error) throw new Error(error.message);
      return `${ent.nomeDe(item)}: ${item.publicado ? 'saiu do site' : 'publicado no site'}.`;
    });
  }

  /** O depoimento escrito no formulário de egresso vira um registro em Depoimentos, ligado ao perfil. */
  async function guardarDepoimento(c: Cadastro, pessoaId: string, nome: string) {
    if (!sb) return;
    const d = c.dados as Record<string, string | number | boolean | null>;
    const texto = String(d.depoimento ?? '').trim();
    if (!texto) return;
    const ja = acervo?.depoimentos.some((x) => x.pessoa_id === pessoaId && x.texto.trim() === texto);
    if (ja) return;
    const papel = ['Egresso', d.curso ? `de ${d.curso}` : ''].filter(Boolean).join(' ');
    const { error } = await sb.from('depoimentos').insert({
      pessoa_id: pessoaId, autor: nome, papel, texto, ano: d.ano_saida ?? d.ano_entrada ?? null,
      publicado: Boolean(d.autoriza_publicacao),
    });
    if (error) throw new Error(`O perfil foi salvo, mas o depoimento não: ${error.message}`);
  }

  async function aprovarCadastro(c: Cadastro) {
    if (!sb) return;
    await executar(async () => {
      const d = c.dados as Record<string, string | number | boolean | null>;
      let foto_url = '';
      if (c.foto_path) {
        const baixa = await sb.storage.from('cadastros').download(c.foto_path);
        if (baixa.data) foto_url = await enviarImagem(sb, new File([baixa.data], c.foto_path, { type: baixa.data.type }));
      }
      const nome = String(d.nome ?? '').trim();
      const { data, error } = await sb.from('pessoas').insert({
        slug: `${gerarSlug(nome)}-${c.id.slice(0, 4)}`, nome, vinculo: 'EGRESSO', papel: 'Egresso',
        instituicao: 'IFS Campus Lagarto', curso: d.curso ?? '', ano_entrada: d.ano_entrada ?? null, ano_saida: d.ano_saida ?? null,
        onde_esta: d.onde_esta ?? '', cidade: d.cidade ?? '', pais: d.pais ?? '',
        lattes_url: d.lattes_url ?? '', linkedin_url: d.linkedin_url ?? '', foto_url, publicado: Boolean(d.autoriza_publicacao),
      }).select('id').single();
      if (error) throw new Error(error.message);
      await sb.from('pessoas_contato').upsert({ pessoa_id: data.id, email: String(d.email ?? '') });
      await guardarDepoimento(c, data.id as string, nome);
      const up = await sb.from('cadastros_egressos').update({ status: 'APROVADO', pessoa_id: data.id }).eq('id', c.id);
      if (up.error) throw new Error(up.error.message);
      return `${nome} entrou na lista de pessoas. Projetos e conquistas informados continuam visíveis no cadastro para você registrar.`;
    });
  }

  /** Junta um cadastro de egresso a uma pessoa que já está no acervo, mantendo os vínculos dela. */
  async function atualizarPerfil(c: Cadastro, pessoaId: string, substituir: string[]) {
    if (!sb || !acervo) return;
    const atual = acervo.pessoas.find((p) => p.id === pessoaId) as unknown as Record<string, unknown> | undefined;
    if (!atual) return;
    await executar(async () => {
      const mudancas: Record<string, unknown> = {};
      for (const campo of camposDoCadastro(c)) {
        const vazio = atual[campo.chave] === '' || atual[campo.chave] === null || atual[campo.chave] === undefined;
        if (vazio || substituir.includes(campo.chave)) mudancas[campo.chave] = campo.valor;
      }
      if (c.foto_path && (!atual.foto_url || substituir.includes('foto_url'))) {
        const baixa = await sb.storage.from('cadastros').download(c.foto_path);
        if (baixa.data) mudancas.foto_url = await enviarImagem(sb, new File([baixa.data], c.foto_path, { type: baixa.data.type }));
      }
      if (c.dados.autoriza_publicacao) mudancas.publicado = true;
      if (Object.keys(mudancas).length) {
        const { error } = await sb.from('pessoas').update(mudancas).eq('id', pessoaId);
        if (error) throw new Error(error.message);
      }
      const email = String(c.dados.email ?? '');
      if (email) await sb.from('pessoas_contato').upsert({ pessoa_id: pessoaId, email });
      await guardarDepoimento(c, pessoaId, String(mudancas.nome ?? atual.nome));
      const up = await sb.from('cadastros_egressos').update({ status: 'APROVADO', pessoa_id: pessoaId }).eq('id', c.id);
      if (up.error) throw new Error(up.error.message);
      return `Perfil de ${String(mudancas.nome ?? atual.nome)} atualizado com os dados do formulário. Projetos e conquistas ligados a ele foram mantidos.`;
    });
  }

  async function recusarCadastro(c: Cadastro) {
    if (!sb) return;
    await executar(async () => {
      const { error } = await sb.from('cadastros_egressos').update({ status: 'RECUSADO' }).eq('id', c.id);
      if (error) throw new Error(error.message);
      return 'Cadastro recusado.';
    });
  }

  async function importarInicial() {
    if (!sb) return;
    await executar(async () => {
      const falha = (e: { message: string } | null) => { if (e) throw new Error(e.message); };
      const ps = await sb.from('pessoas').insert(inicial.pessoas).select('id, slug');
      falha(ps.error);
      const idPessoa = Object.fromEntries((ps.data ?? []).map((p) => [p.slug, p.id]));
      const pr = await sb.from('projetos').insert(inicial.projetos.map(({ pessoas: _p, ...r }) => r)).select('id, slug');
      falha(pr.error);
      const idProjeto = Object.fromEntries((pr.data ?? []).map((p) => [p.slug, p.id]));
      const vp = inicial.projetos.flatMap((p) => p.pessoas.map((v) => ({ projeto_id: idProjeto[p.slug], pessoa_id: idPessoa[v.slug], papel: v.papel })));
      if (vp.length) falha((await sb.from('projeto_pessoas').insert(vp)).error);
      for (const c of inicial.conquistas) {
        const { pessoas: gente, ...r } = c;
        const ins = await sb.from('conquistas').insert(r).select('id').single();
        falha(ins.error);
        if (gente.length) falha((await sb.from('conquista_pessoas').insert(gente.map((s) => ({ conquista_id: ins.data!.id, pessoa_id: idPessoa[s] })))).error);
      }
      for (const s of inicial.iniciativas) {
        const { pessoas: gente, ...r } = s;
        const ins = await sb.from('iniciativas').insert(r).select('id').single();
        falha(ins.error);
        if (gente.length) falha((await sb.from('iniciativa_pessoas').insert(gente.map((x) => ({ iniciativa_id: ins.data!.id, pessoa_id: idPessoa[x] })))).error);
      }
      falha((await sb.from('parceiros').insert(inicial.parceiros)).error);
      falha((await sb.from('marcos').insert(inicial.marcos)).error);
      return 'Acervo inicial importado. Revise cada item antes de divulgar o site.';
    });
  }

  if (fase === 'carregando') return <Tela>Carregando a área de gestão...</Tela>;
  if (fase === 'sem_banco')
    return <Tela>O banco de dados não está configurado neste endereço. Defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY na Vercel (veja docs/IMPLANTACAO.md).</Tela>;
  if (fase === 'sem_acesso')
    return (
      <Tela>
        A conta {usuario} entrou, mas não está na lista de gestores (ou a migração 003 ainda não foi aplicada). Veja o passo 3 de docs/IMPLANTACAO.md.{' '}
        <button className="underline" onClick={sair}>Sair</button>
      </Tela>
    );

  const vazio = acervo && acervo.pessoas.length + acervo.projetos.length === 0;

  return (
    <div className="min-h-screen bg-nevoa">
      <header className="bg-tinta text-papel">
        <div className="contorno flex items-center justify-between py-3 gap-4">
          <p className="display text-2xl">LABIC, gestão do acervo</p>
          <p className="text-sm flex gap-4 items-center">
            <Link href="/" className="underline" target="_blank">Ver o site</Link>
            <span className="hidden sm:inline">{usuario}</span>
            <button onClick={sair} className="underline">Sair</button>
          </p>
        </div>
      </header>

      <div className="contorno py-6 grid gap-6 md:grid-cols-[14rem_1fr]">
        <nav aria-label="Seções" className="flex md:flex-col gap-1 overflow-x-auto">
          {[
            { chave: 'resumo', titulo: 'Visão geral', n: null as number | null },
            { chave: 'cadastros', titulo: 'Cadastros de egressos', n: pendentes.length },
            ...ENTIDADES.map((e) => ({ chave: e.chave as string, titulo: e.titulo, n: acervo ? (acervo[e.chave] as unknown[]).length : 0 })),
          ].map((s) => (
            <button
              key={s.chave}
              onClick={() => { setAba(s.chave); setEditando(null); setAviso(''); setErro(''); }}
              aria-current={aba === s.chave ? 'page' : undefined}
              className={`text-left whitespace-nowrap px-3 py-2 rounded-xl font-semibold flex justify-between gap-3 ${aba === s.chave ? 'bg-tinta text-papel' : 'hover:bg-papel'}`}
            >
              {s.titulo}
              {s.n !== null && <span className={s.chave === 'cadastros' && s.n > 0 ? 'bg-vermelho text-papel rounded-full px-2 text-sm' : 'opacity-60'}>{s.n}</span>}
            </button>
          ))}
        </nav>

        <section className="bg-papel border-[2.5px] border-tinta rounded-[22px] p-5 md:p-8 min-w-0">
          {aviso && <p role="status" className="mb-4 border-2 border-verde rounded-xl px-3 py-2 font-semibold">{aviso}</p>}
          {erro && <p role="alert" className="mb-4 border-2 border-vermelho rounded-xl px-3 py-2 font-semibold">{erro}</p>}

          {aba === 'resumo' && acervo && (
            <div>
              <h1 className="text-5xl">Visão geral</h1>
              {vazio ? (
                <div className="mt-6 max-w-xl">
                  <p className="text-lg">
                    O banco está vazio. Importe o acervo inicial levantado em notícias públicas e na pasta de fotos:{' '}
                    {inicial.projetos.length} projetos, {inicial.pessoas.length} pessoas, {inicial.conquistas.length} conquistas e {inicial.iniciativas.length} startups.
                  </p>
                  <button className="botao mt-4" disabled={ocupado} onClick={importarInicial}>
                    {ocupado ? 'Importando...' : 'Importar acervo inicial'}
                  </button>
                </div>
              ) : (
                <>
                  <ul className="mt-6 grid sm:grid-cols-3 gap-4">
                    {ENTIDADES.map((e) => {
                      const itens = acervo[e.chave] as unknown as Item[];
                      const ocultos = itens.filter((i) => !i.publicado).length;
                      return (
                        <li key={e.chave}>
                          <button onClick={() => setAba(e.chave)} className="w-full text-left border-2 border-tinta rounded-2xl p-4 hover:bg-nevoa">
                            <span className="display text-5xl block">{itens.length}</span>
                            <span className="font-semibold">{e.titulo}</span>
                            <span className="block text-sm text-grafite">{ocultos ? `${ocultos} fora do site` : 'todos no site'}</span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                  <h2 className="text-3xl mt-10">O que falta completar</h2>
                  <ul className="mt-3 space-y-1.5 list-disc pl-5">
                    <li>Cadastros de egressos aguardando revisão: {pendentes.length}</li>
                    <li>Depoimentos enviados pelo site esperando revisão: {acervo.depoimentos.filter((d) => !d.publicado).length}</li>
                    <li>Projetos sem foto de capa: {acervo.projetos.filter((p) => !p.capa_url).length}</li>
                    <li>Projetos sem equipe registrada: {acervo.projetos.filter((p) => p.equipe.length === 0).length}</li>
                    <li>Projetos sem ano de início: {acervo.projetos.filter((p) => !p.ano_inicio).length}</li>
                    <li>Pessoas sem foto: {acervo.pessoas.filter((p) => !p.foto_url).length}</li>
                    <li>Egressos sem informação de onde estão hoje: {acervo.pessoas.filter((p) => (p.vinculo === 'EGRESSO' || p.vinculo === 'EGRESSO_PARCEIRO') && !p.onde_esta).length}</li>
                  </ul>
                  <p className="mt-8 text-sm text-grafite">
                    Link para enviar aos ex-membros: <Link className="underline" href="/egressos" target="_blank">/egressos</Link>{' '}e para pedir depoimentos: <Link className="underline" href="/depoimentos#deixe-seu-depoimento" target="_blank">/depoimentos</Link>
                  </p>
                </>
              )}
            </div>
          )}

          {aba === 'cadastros' && (
            <div>
              <h1 className="text-5xl">Cadastros de egressos</h1>
              <p className="mt-2 text-grafite max-w-[60ch]">
                Respostas do formulário público. Se a pessoa já está no acervo, junte o cadastro ao perfil dela para não duplicar; se não, crie um perfil novo. Ela aparece no site se autorizou a publicação.
              </p>
              {cadastros.length === 0 && <p className="mt-6 text-lg">Nenhum cadastro recebido ainda. Envie o link /egressos para quem já passou pelo LABIC.</p>}
              <ul className="mt-6 space-y-4">
                {cadastros.map((c) => {
                  const d = c.dados as Record<string, string>;
                  return (
                    <li key={c.id} className="border-2 border-tinta rounded-2xl p-4">
                      <div className="flex flex-wrap justify-between gap-2">
                        <p className="display text-3xl">{d.nome}</p>
                        <span className="etiqueta">{c.status === 'PENDENTE' ? 'Aguardando revisão' : c.status === 'APROVADO' ? 'Aprovado' : 'Recusado'}</span>
                      </div>
                      <dl className="mt-2 grid sm:grid-cols-2 gap-x-6 gap-y-1 text-[0.95rem]">
                        {[
                          ['E-mail', d.email], ['No LABIC', [d.ano_entrada, d.ano_saida].filter(Boolean).join(' a ')], ['Curso', d.curso],
                          ['Hoje', d.onde_esta], ['Local', [d.cidade, d.pais].filter(Boolean).join(', ')], ['Formação', d.formacao],
                          ['Projetos', d.projetos], ['Conquistas', d.conquistas], ['Lattes', d.lattes_url], ['LinkedIn', d.linkedin_url],
                          ['Depoimento', d.depoimento], ['Foto', c.foto_path ? 'enviada' : 'não enviou'],
                          ['Autoriza publicar', d.autoriza_publicacao ? 'sim' : 'não'],
                        ].filter(([, v]) => v).map(([k, v]) => (
                          <div key={k} className="min-w-0"><dt className="inline font-semibold">{k}: </dt><dd className="inline whitespace-pre-wrap break-words">{String(v)}</dd></div>
                        ))}
                      </dl>
                      {c.status === 'APROVADO' && c.pessoa_id && (d.conquistas || d.projetos) && (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {d.conquistas && (
                            <button className="botao botao-pequeno" onClick={() => registrarDoCadastro(c, 'conquistas')}>Registrar conquista</button>
                          )}
                          {d.projetos && (
                            <button className="botao botao-vazado botao-pequeno" onClick={() => registrarDoCadastro(c, 'projetos')}>Ligar a projetos</button>
                          )}
                        </div>
                      )}
                      {c.status === 'PENDENTE' && acervo && (
                        <AcoesCadastro
                          cadastro={c}
                          pessoas={acervo.pessoas}
                          ocupado={ocupado}
                          aoCriar={() => aprovarCadastro(c)}
                          aoAtualizar={(pessoaId, substituir) => atualizarPerfil(c, pessoaId, substituir)}
                          aoRecusar={() => recusarCadastro(c)}
                        />
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {referencia && referencia.aba === aba && (
            <aside className="mb-8 border-2 border-tinta rounded-2xl p-4 bg-nevoa" aria-label="Texto do cadastro">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <p className="font-semibold">{referencia.rotulo}</p>
                <button className="underline text-sm" onClick={() => setReferencia(null)}>Fechar</button>
              </div>
              <p className="mt-2 whitespace-pre-wrap break-words">{referencia.texto}</p>
              <p className="mt-3 text-sm text-grafite">
                {referencia.aba === 'conquistas'
                  ? `Confira tipo, ano e título e salve. ${referencia.nome} já vem marcado(a) entre as pessoas envolvidas. Antes, busque na lista para não duplicar algo que já está no acervo.`
                  : `Abra o projeto, marque ${referencia.nome} na equipe e escreva o papel. Se o projeto não existir, cadastre um novo.`}
              </p>
              {referencia.aba === 'conquistas' && !editando && (
                <button className="botao botao-pequeno mt-3" onClick={() => setEditando({ ...PADROES.conquistas, pessoaIds: [referencia.pessoaId] })}>
                  Registrar outra conquista de {referencia.nome.split(' ')[0]}
                </button>
              )}
            </aside>
          )}

          {entidade && acervo && !editando && (
            <Lista
              entidade={entidade}
              itens={acervo[entidade.chave] as unknown as Item[]}
              ocupado={ocupado}
              aoEditar={(i) => setEditando(entidade.chave === 'pessoas' ? { ...i, email: emails[String(i.id)] ?? '' } : { ...i })}
              aoCriar={() => setEditando({ ...PADROES[entidade.chave] })}
              aoAlternar={(i) => alternarPublicado(entidade, i)}
            />
          )}

          {entidade && acervo && editando && sb && (
            <Formulario
              key={String(editando.id ?? 'novo')}
              entidade={entidade}
              inicial={editando}
              acervo={acervo}
              sb={sb}
              ocupado={ocupado}
              aoSalvar={(v) => salvar(entidade, v)}
              aoExcluir={() => excluir(entidade, editando)}
              aoCancelar={() => setEditando(null)}
            />
          )}
        </section>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------------------
 * Cadastro de egresso x pessoa que já existe no acervo
 * -------------------------------------------------------------------------- */
const LIGACOES = new Set(['de', 'da', 'do', 'das', 'dos', 'e']);
function palavrasDoNome(nome: string): string[] {
  return nome.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().split(/[^a-z]+/).filter((t) => t.length > 1 && !LIGACOES.has(t));
}

/** Pessoas do acervo cujo nome parece ser o mesmo do cadastro, da mais parecida para a menos. */
function pessoasParecidas(nome: string, pessoas: Pessoa[]): Pessoa[] {
  const a = palavrasDoNome(nome);
  if (a.length === 0) return [];
  return pessoas
    .map((p) => {
      const b = palavrasDoNome(p.nome);
      const comuns = a.filter((t) => b.includes(t)).length;
      const mesmoPrimeiro = a[0] === b[0];
      const contido = comuns === Math.min(a.length, b.length);
      const parece = (mesmoPrimeiro && comuns >= 2) || comuns >= 3 || (contido && comuns >= 2);
      return { p, pontos: parece ? comuns + (mesmoPrimeiro ? 1 : 0) : 0 };
    })
    .filter((x) => x.pontos > 0)
    .sort((x, y) => y.pontos - x.pontos)
    .map((x) => x.p);
}

const ROTULO_CAMPO: Record<string, string> = {
  nome: 'Nome', vinculo: 'Vínculo', papel: 'Papel', curso: 'Curso', ano_entrada: 'Ano de entrada', ano_saida: 'Ano de saída',
  onde_esta: 'Onde está hoje', cidade: 'Cidade', pais: 'País', bio: 'Minibiografia',
  lattes_url: 'Lattes', linkedin_url: 'LinkedIn', foto_url: 'Foto',
};

/** O que o formulário informa, já no formato das colunas de "pessoas" (só campos preenchidos). */
function camposDoCadastro(c: Cadastro): { chave: string; valor: string | number }[] {
  const d = c.dados as Record<string, string | number | null>;
  const lista: [string, string | number | null | undefined][] = [
    ['nome', typeof d.nome === 'string' ? d.nome.trim() : ''], ['vinculo', 'EGRESSO'], ['papel', 'Egresso'], ['curso', d.curso],
    ['ano_entrada', d.ano_entrada], ['ano_saida', d.ano_saida], ['onde_esta', d.onde_esta], ['cidade', d.cidade], ['pais', d.pais],
    ['lattes_url', d.lattes_url], ['linkedin_url', d.linkedin_url],
  ];
  return lista.filter(([, v]) => v !== '' && v !== null && v !== undefined).map(([chave, valor]) => ({ chave, valor: valor as string | number }));
}

function AcoesCadastro({ cadastro, pessoas, ocupado, aoCriar, aoAtualizar, aoRecusar }: {
  cadastro: Cadastro; pessoas: Pessoa[]; ocupado: boolean;
  aoCriar: () => void; aoAtualizar: (pessoaId: string, substituir: string[]) => void; aoRecusar: () => void;
}) {
  const nome = String(cadastro.dados.nome ?? '');
  const parecidas = useMemo(() => pessoasParecidas(nome, pessoas), [nome, pessoas]);
  const [escolhida, setEscolhida] = useState(parecidas[0]?.id ?? '');
  const [revisando, setRevisando] = useState(false);
  const [substituir, setSubstituir] = useState<string[]>([]);
  const pessoa = pessoas.find((p) => p.id === escolhida) as (Pessoa & Record<string, unknown>) | undefined;

  // Campos em que o formulário diz uma coisa e o perfil já diz outra
  const conflitos = useMemo(() => {
    if (!pessoa) return [];
    const lista = camposDoCadastro(cadastro)
      .filter((c) => pessoa[c.chave] !== '' && pessoa[c.chave] !== null && pessoa[c.chave] !== undefined && String(pessoa[c.chave]) !== String(c.valor))
      .filter((c) => !(c.chave === 'vinculo' && pessoa.vinculo !== 'ESTUDANTE') && !(c.chave === 'papel' && pessoa.vinculo !== 'ESTUDANTE'))
      .map((c) => ({ chave: c.chave, atual: String(pessoa[c.chave]), novo: String(c.valor) }));
    if (cadastro.foto_path && pessoa.foto_url) lista.push({ chave: 'foto_url', atual: 'foto atual', novo: 'foto enviada no formulário' });
    return lista;
  }, [cadastro, pessoa]);

  function comecarAtualizacao() {
    if (!pessoa) return;
    if (conflitos.length === 0) return aoAtualizar(pessoa.id, []);
    // Por padrão, troca o que o formulário tende a saber melhor: situação atual e nome mais completo
    setSubstituir(conflitos.filter((c) => ['onde_esta', 'cidade', 'pais', 'vinculo', 'papel'].includes(c.chave) || (c.chave === 'nome' && c.novo.length > c.atual.length)).map((c) => c.chave));
    setRevisando(true);
  }

  const rotuloVinculo = (v: string) => VINCULO_ROTULO[v as keyof typeof VINCULO_ROTULO] ?? v;

  return (
    <div className="mt-4 border-t-2 border-linha pt-3">
      {parecidas.length > 0 ? (
        <p className="font-semibold">Parece ser alguém que já está no acervo.</p>
      ) : (
        <p className="text-grafite text-sm">Não encontrei ninguém com nome parecido no acervo.</p>
      )}
      <label className="campo mt-2 max-w-md">
        <span>Juntar ao perfil</span>
        <select className="entrada" value={escolhida} onChange={(e) => { setEscolhida(e.target.value); setRevisando(false); }}>
          <option value="">Nenhum (é uma pessoa nova)</option>
          {parecidas.length > 0 && (
            <optgroup label="Nomes parecidos">
              {parecidas.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
            </optgroup>
          )}
          <optgroup label="Todas as pessoas">
            {pessoas.filter((p) => !parecidas.includes(p)).map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
          </optgroup>
        </select>
      </label>

      {revisando && pessoa && (
        <fieldset className="mt-3 border-2 border-tinta rounded-xl p-3">
          <legend className="font-semibold px-1">O perfil de {pessoa.nome} já tem estes dados. Marque o que o formulário deve substituir.</legend>
          <ul className="space-y-2">
            {conflitos.map((c) => (
              <li key={c.chave}>
                <label className="flex gap-2 items-start">
                  <input type="checkbox" className="mt-1 w-4 h-4 accent-black" checked={substituir.includes(c.chave)}
                    onChange={(e) => setSubstituir(e.target.checked ? [...substituir, c.chave] : substituir.filter((x) => x !== c.chave))} />
                  <span className="min-w-0 break-words">
                    <strong>{ROTULO_CAMPO[c.chave] ?? c.chave}:</strong>{' '}
                    {c.chave === 'vinculo' ? rotuloVinculo(c.atual) : c.atual} passa a ser {c.chave === 'vinculo' ? rotuloVinculo(c.novo) : c.novo}
                  </span>
                </label>
              </li>
            ))}
          </ul>
          <p className="text-sm text-grafite mt-2">Os campos que estavam vazios no perfil são preenchidos de qualquer forma.</p>
        </fieldset>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        {pessoa ? (
          revisando ? (
            <button className="botao botao-pequeno" disabled={ocupado} onClick={() => aoAtualizar(pessoa.id, substituir)}>Confirmar atualização do perfil</button>
          ) : (
            <button className="botao botao-pequeno" disabled={ocupado} onClick={comecarAtualizacao}>Atualizar o perfil existente</button>
          )
        ) : null}
        <button className={`botao botao-pequeno ${pessoa ? 'botao-vazado' : ''}`} disabled={ocupado} onClick={aoCriar}>Criar perfil novo</button>
        <button className="botao botao-vazado botao-pequeno" disabled={ocupado} onClick={aoRecusar}>Recusar</button>
      </div>
    </div>
  );
}

function Tela({ children }: { children: React.ReactNode }) {
  return <main className="min-h-screen grid place-items-center p-8"><p className="max-w-lg text-lg">{children}</p></main>;
}

function Lista({ entidade, itens, ocupado, aoEditar, aoCriar, aoAlternar }: {
  entidade: Entidade; itens: Item[]; ocupado: boolean; aoEditar: (i: Item) => void; aoCriar: () => void; aoAlternar: (i: Item) => void;
}) {
  const [busca, setBusca] = useState('');
  const filtrados = useMemo(() => {
    const t = busca.trim().toLowerCase();
    return itens.filter((i) => !t || (entidade.nomeDe(i) + ' ' + entidade.detalheDe(i)).toLowerCase().includes(t));
  }, [itens, busca, entidade]);
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-5xl">{entidade.titulo}</h1>
        <button className="botao botao-pequeno" onClick={aoCriar}>Cadastrar {entidade.singular}</button>
      </div>
      <input type="search" value={busca} onChange={(e) => setBusca(e.target.value)} placeholder={`Buscar em ${itens.length} registros`} aria-label="Buscar" className="entrada mt-4 max-w-sm" />
      {itens.length === 0 ? (
        <p className="mt-6 text-lg">Nada cadastrado ainda. Use o botão acima para criar o primeiro registro.</p>
      ) : (
        <ul className="mt-4 divide-y-2 divide-linha">
          {filtrados.map((i) => (
            <li key={String(i.id)} className="py-3 flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="font-semibold">{entidade.nomeDe(i)}</p>
                <p className="text-sm text-grafite">{entidade.detalheDe(i)}</p>
              </div>
              <div className="flex gap-2 flex-none">
                <button className="etiqueta cursor-pointer" disabled={ocupado} onClick={() => aoAlternar(i)} style={{ ['--cor' as string]: i.publicado ? '#22c93a' : '#bbb' }}>
                  <i />{i.publicado ? 'No site' : 'Fora do site'}
                </button>
                <button className="botao botao-vazado botao-pequeno" onClick={() => aoEditar(i)}>Editar</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Formulario({ entidade, inicial, acervo, sb, ocupado, aoSalvar, aoExcluir, aoCancelar }: {
  entidade: Entidade; inicial: Item; acervo: Acervo; sb: SupabaseClient; ocupado: boolean;
  aoSalvar: (v: Item) => void; aoExcluir: () => void; aoCancelar: () => void;
}) {
  const [v, setV] = useState<Item>(inicial);
  const [enviando, setEnviando] = useState('');
  const [erroImg, setErroImg] = useState('');
  const def = (nome: string, valor: unknown) => setV((a) => ({ ...a, [nome]: valor }));

  async function escolherImagem(campo: Campo, arquivos: FileList | null) {
    if (!arquivos?.length) return;
    setErroImg(''); setEnviando(campo.nome);
    try {
      const urls = await Promise.all(Array.from(arquivos).map((a) => enviarImagem(sb, a)));
      if (campo.tipo === 'imagem') def(campo.nome, urls[0]);
      else def(campo.nome, [...((v[campo.nome] as string[]) ?? []), ...urls]);
    } catch (ex) {
      setErroImg(ex instanceof Error ? ex.message : 'Falha ao enviar a imagem.');
    } finally {
      setEnviando('');
    }
  }

  // quem já vem marcado ao abrir o formulário aparece no topo das listas de pessoas
  const [pessoas] = useState(() => {
    const marcados = new Set<string>([
      ...((inicial.pessoaIds as string[]) ?? []),
      ...((inicial.equipe as { pessoaId: string }[]) ?? []).map((e) => e.pessoaId),
    ]);
    return [...acervo.pessoas].sort((a, b) => Number(marcados.has(b.id)) - Number(marcados.has(a.id)));
  });

  return (
    <form onSubmit={(e) => { e.preventDefault(); aoSalvar(v); }} className="max-w-2xl">
      <button type="button" className="underline text-sm" onClick={aoCancelar}>Voltar para {entidade.titulo.toLowerCase()}</button>
      <h1 className="text-5xl mt-2">{v.id ? entidade.nomeDe(v) || 'Editar' : `Cadastrar ${entidade.singular}`}</h1>
      <div className="mt-6 space-y-5">
        {entidade.campos.map((c) => {
          const valor = v[c.nome];
          if (c.tipo === 'sim_nao')
            return (
              <label key={c.nome} className="flex items-center gap-3 font-semibold">
                <input type="checkbox" className="w-5 h-5 accent-black" checked={Boolean(valor)} onChange={(e) => def(c.nome, e.target.checked)} />
                {c.rotulo}
              </label>
            );
          if (c.tipo === 'areas')
            return (
              <fieldset key={c.nome}>
                <legend className="font-semibold text-[0.95rem] mb-1.5">{c.rotulo}</legend>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(AREAS).map(([k, a]) => {
                    const lista = (valor as string[]) ?? [];
                    const on = lista.includes(k);
                    return (
                      <button type="button" key={k} aria-pressed={on} onClick={() => def(c.nome, on ? lista.filter((x) => x !== k) : [...lista, k])}
                        className={`etiqueta cursor-pointer ${on ? '!bg-tinta !text-papel' : ''}`} style={{ ['--cor' as string]: a.cor }}>
                        <i />{a.nome}
                      </button>
                    );
                  })}
                </div>
                <small className="text-grafite text-sm">A primeira frente marcada define a cor do projeto.</small>
              </fieldset>
            );
          if (c.tipo === 'pessoas' || c.tipo === 'equipe') {
            const equipe = c.tipo === 'equipe' ? ((valor as { pessoaId: string; papel: string }[]) ?? []) : [];
            const ids = c.tipo === 'equipe' ? equipe.map((e) => e.pessoaId) : ((valor as string[]) ?? []);
            return (
              <fieldset key={c.nome}>
                <legend className="font-semibold text-[0.95rem] mb-1.5">{c.rotulo}</legend>
                {pessoas.length === 0 && <p className="text-grafite text-sm">Cadastre pessoas primeiro para poder vinculá-las.</p>}
                <div className="max-h-64 overflow-y-auto border-2 border-tinta rounded-xl p-3 space-y-1.5">
                  {pessoas.map((p) => {
                    const on = ids.includes(p.id);
                    return (
                      <div key={p.id} className="flex flex-wrap items-center gap-2">
                        <label className="flex items-center gap-2 grow">
                          <input type="checkbox" className="w-4 h-4 accent-black" checked={on}
                            onChange={(e) => {
                              if (c.tipo === 'equipe') def(c.nome, e.target.checked ? [...equipe, { pessoaId: p.id, papel: '' }] : equipe.filter((x) => x.pessoaId !== p.id));
                              else def(c.nome, e.target.checked ? [...ids, p.id] : ids.filter((x) => x !== p.id));
                            }} />
                          {p.nome}
                        </label>
                        {c.tipo === 'equipe' && on && (
                          <input className="entrada !w-48 !py-1 !text-sm" placeholder="Papel (bolsista, orientador...)" aria-label={`Papel de ${p.nome}`}
                            value={equipe.find((x) => x.pessoaId === p.id)?.papel ?? ''}
                            onChange={(e) => def(c.nome, equipe.map((x) => (x.pessoaId === p.id ? { ...x, papel: e.target.value } : x)))} />
                        )}
                      </div>
                    );
                  })}
                </div>
              </fieldset>
            );
          }
          if (c.tipo === 'imagem' || c.tipo === 'imagens') {
            const urls = c.tipo === 'imagem' ? (valor ? [String(valor)] : []) : ((valor as string[]) ?? []);
            return (
              <div key={c.nome} className="campo">
                <span>{c.rotulo}</span>
                <div className="flex flex-wrap gap-3 mb-2">
                  {urls.map((u) => (
                    <div key={u} className="relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={u} alt="" referrerPolicy="no-referrer" className="w-28 h-20 object-cover border-2 border-tinta rounded-lg bg-nevoa" />
                      <button type="button" className="absolute -top-2 -right-2 bg-papel border-2 border-tinta rounded-full w-6 h-6 text-sm leading-none" aria-label="Remover imagem"
                        onClick={() => def(c.nome, c.tipo === 'imagem' ? '' : urls.filter((x) => x !== u))}>×</button>
                    </div>
                  ))}
                </div>
                <input type="file" accept="image/jpeg,image/png,image/webp" multiple={c.tipo === 'imagens'} className="entrada" aria-label={c.rotulo}
                  onChange={(e) => escolherImagem(c, e.target.files)} />
                {enviando === c.nome && <small>Enviando imagem...</small>}
              </div>
            );
          }
          if (c.tipo === 'arquivo')
            return (
              <div key={c.nome} className="campo">
                <span>{c.rotulo}</span>
                {valor ? (
                  <p className="mb-2 flex flex-wrap items-center gap-3">
                    <a className="underline" href={String(valor)} target="_blank" rel="noreferrer">Abrir o PDF enviado</a>
                    <button type="button" className="underline text-vermelho" onClick={() => def(c.nome, '')}>Remover</button>
                  </p>
                ) : null}
                <input type="file" accept="application/pdf" className="entrada" aria-label={c.rotulo}
                  onChange={async (e) => {
                    const arq = e.target.files?.[0];
                    if (!arq) return;
                    setErroImg(''); setEnviando(c.nome);
                    try { def(c.nome, await enviarPdf(sb, arq)); }
                    catch (ex) { setErroImg(ex instanceof Error ? ex.message : 'Falha ao enviar o PDF.'); }
                    finally { setEnviando(''); }
                  }} />
                {enviando === c.nome && <small>Enviando PDF...</small>}
                {c.ajuda && <small>{c.ajuda}</small>}
              </div>
            );
          if (c.tipo === 'pessoa')
            return (
              <label key={c.nome} className="campo">
                <span>{c.rotulo}</span>
                <select className="entrada" value={String(valor ?? '')} onChange={(e) => def(c.nome, e.target.value)}>
                  <option value="">Nenhuma (pessoa fora do acervo)</option>
                  {acervo.pessoas.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
                </select>
                {c.ajuda && <small>{c.ajuda}</small>}
              </label>
            );
          if (c.tipo === 'projeto')
            return (
              <label key={c.nome} className="campo">
                <span>{c.rotulo}</span>
                <select className="entrada" value={String(valor ?? '')} onChange={(e) => def(c.nome, e.target.value)}>
                  <option value="">Nenhum</option>
                  {acervo.projetos.map((pr) => <option key={pr.id} value={pr.id}>{pr.titulo}</option>)}
                </select>
                {c.ajuda && <small>{c.ajuda}</small>}
              </label>
            );
          return (
            <label key={c.nome} className="campo">
              <span>{c.rotulo}</span>
              {c.tipo === 'longo' ? (
                <textarea className="entrada" value={String(valor ?? '')} onChange={(e) => def(c.nome, e.target.value)} />
              ) : c.tipo === 'opcoes' ? (
                <select className="entrada" value={String(valor ?? '')} onChange={(e) => def(c.nome, e.target.value)}>
                  {Object.entries(c.opcoes ?? {}).map(([k, r]) => <option key={k} value={k}>{r}</option>)}
                </select>
              ) : (
                <input className="entrada" type={c.tipo === 'numero' ? 'number' : 'text'} required={c.obrigatorio}
                  value={valor === null || valor === undefined ? '' : String(valor)} onChange={(e) => def(c.nome, e.target.value)} />
              )}
              {c.ajuda && <small>{c.ajuda}</small>}
            </label>
          );
        })}
      </div>
      {erroImg && <p role="alert" className="mt-4 font-semibold text-vermelho">{erroImg}</p>}
      <div className="mt-8 flex flex-wrap gap-3 justify-between">
        <div className="flex gap-3">
          <button className="botao" disabled={ocupado || Boolean(enviando)}>{ocupado ? 'Salvando...' : `Salvar ${entidade.singular}`}</button>
          <button type="button" className="botao botao-vazado" onClick={aoCancelar}>Cancelar</button>
        </div>
        {v.id && (
          <button type="button" className="underline text-vermelho font-semibold" disabled={ocupado}
            onClick={() => { if (window.confirm(`Excluir "${entidade.nomeDe(v)}" de vez? Não dá para desfazer.`)) aoExcluir(); }}>
            Excluir {entidade.singular}
          </button>
        )}
      </div>
    </form>
  );
}
