'use client';

import { useState } from 'react';
import { getSupabase } from '@/lib/supabase';

const ANO_ATUAL = new Date().getFullYear();

export function FormularioEgresso() {
  const [estado, setEstado] = useState<'pronto' | 'enviando' | 'enviado'>('pronto');
  const [erro, setErro] = useState('');

  async function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErro('');
    const f = new FormData(e.currentTarget);
    if (f.get('site')) return; // campo-isca para robôs
    const sb = getSupabase();
    if (!sb) {
      setErro('O cadastro ainda não está ligado ao banco de dados. Tente de novo em alguns dias.');
      return;
    }
    setEstado('enviando');
    try {
      let foto_path = '';
      const foto = f.get('foto');
      if (foto instanceof File && foto.size > 0) {
        if (foto.size > 3 * 1024 * 1024) throw new Error('A foto precisa ter menos de 3 MB.');
        const ext = (foto.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '');
        foto_path = `${crypto.randomUUID()}.${ext}`;
        const up = await sb.storage.from('cadastros').upload(foto_path, foto, { contentType: foto.type });
        if (up.error) throw new Error('Não foi possível enviar a foto. Use JPG, PNG ou WebP com menos de 3 MB.');
      }
      const texto = (k: string) => String(f.get(k) ?? '').trim();
      const dados = {
        nome: texto('nome'),
        email: texto('email'),
        ano_entrada: Number(texto('ano_entrada')) || null,
        ano_saida: Number(texto('ano_saida')) || null,
        curso: texto('curso'),
        projetos: texto('projetos'),
        onde_esta: texto('onde_esta'),
        cidade: texto('cidade'),
        pais: texto('pais'),
        formacao: texto('formacao'),
        conquistas: texto('conquistas'),
        lattes_url: texto('lattes_url'),
        linkedin_url: texto('linkedin_url'),
        depoimento: texto('depoimento'),
        autoriza_publicacao: f.get('autoriza') === 'on',
      };
      const { error } = await sb.from('cadastros_egressos').insert({ dados, foto_path });
      if (error) throw new Error('Não foi possível enviar o cadastro. Confira sua conexão e tente de novo.');
      setEstado('enviado');
    } catch (ex) {
      setErro(ex instanceof Error ? ex.message : 'Não foi possível enviar o cadastro.');
      setEstado('pronto');
    }
  }

  if (estado === 'enviado') {
    return (
      <div className="border-[2.5px] border-tinta rounded-[22px] p-8 max-w-2xl" role="status">
        <h2 className="text-4xl">Cadastro enviado</h2>
        <p className="mt-3 text-lg">Obrigada por ajudar a contar a história do LABIC. Assim que a coordenação revisar, seu perfil entra na página de pessoas.</p>
      </div>
    );
  }

  return (
    <form onSubmit={enviar} className="max-w-2xl space-y-10">
      <fieldset className="space-y-4">
        <legend className="display text-3xl mb-3">Quem é você</legend>
        <label className="campo"><span>Nome completo</span><input name="nome" required className="entrada" autoComplete="name" /></label>
        <label className="campo"><span>E-mail</span><input name="email" type="email" required className="entrada" autoComplete="email" /><small>Só a coordenação vê. Serve para falarmos com você.</small></label>
        <label className="campo"><span>Foto (opcional)</span><input name="foto" type="file" accept="image/jpeg,image/png,image/webp" className="entrada" /><small>JPG, PNG ou WebP, até 3 MB.</small></label>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="display text-3xl mb-3">Seu tempo no LABIC</legend>
        <div className="grid grid-cols-2 gap-4">
          <label className="campo"><span>Ano em que entrou</span><input name="ano_entrada" type="number" min={2017} max={ANO_ATUAL} required className="entrada" /></label>
          <label className="campo"><span>Ano em que saiu</span><input name="ano_saida" type="number" min={2017} max={ANO_ATUAL} className="entrada" /></label>
        </div>
        <label className="campo"><span>Curso que fazia no IFS</span><input name="curso" className="entrada" placeholder="Engenharia Elétrica, técnico em Eletromecânica..." /></label>
        <label className="campo"><span>Projetos em que trabalhou</span><textarea name="projetos" className="entrada" placeholder="Um por linha, com o ano se lembrar" /></label>
        <label className="campo"><span>Artigos, prêmios, editais e outras conquistas dessa época</span><textarea name="conquistas" className="entrada" placeholder="Cole títulos, links ou DOIs" /></label>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="display text-3xl mb-3">Onde você está hoje</legend>
        <label className="campo"><span>O que faz hoje</span><input name="onde_esta" required className="entrada" placeholder="Engenheira na empresa X, mestrando na universidade Y..." /></label>
        <div className="grid grid-cols-2 gap-4">
          <label className="campo"><span>Cidade</span><input name="cidade" className="entrada" /></label>
          <label className="campo"><span>País</span><input name="pais" className="entrada" placeholder="Brasil" /></label>
        </div>
        <label className="campo"><span>Formação depois do IFS</span><textarea name="formacao" className="entrada" placeholder="Mestrado em..., pela..., concluído em..." /></label>
        <div className="grid sm:grid-cols-2 gap-4">
          <label className="campo"><span>Currículo Lattes</span><input name="lattes_url" type="url" className="entrada" placeholder="https://lattes.cnpq.br/..." /></label>
          <label className="campo"><span>LinkedIn</span><input name="linkedin_url" type="url" className="entrada" placeholder="https://www.linkedin.com/in/..." /></label>
        </div>
        <label className="campo"><span>O que o LABIC significou para você (opcional)</span><textarea name="depoimento" className="entrada" /><small>Este texto pode aparecer na página de depoimentos e no seu perfil, depois da revisão da coordenação.</small></label>
      </fieldset>

      <input name="site" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />

      <label className="flex gap-3 items-start">
        <input type="checkbox" name="autoriza" required className="mt-1.5 w-5 h-5 accent-black" />
        <span>Autorizo o LABIC a publicar meu nome, foto, período no laboratório, trajetória e depoimento no site. Posso pedir a remoção quando quiser.</span>
      </label>

      {erro && <p role="alert" className="border-[2.5px] border-vermelho rounded-xl p-3 font-semibold">{erro}</p>}
      <button type="submit" className="botao" disabled={estado === 'enviando'}>
        {estado === 'enviando' ? 'Enviando cadastro...' : 'Enviar cadastro'}
      </button>
    </form>
  );
}
