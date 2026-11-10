import { PageTutorialContent } from '@/types/labic';

export const PAGE_TUTORIALS: Record<string, PageTutorialContent> = {
  dashboard: {
    pageKey: 'dashboard',
    title: 'Visão Geral',
    purpose:
      'Painel operacional diário. Exibe seus avisos ativos (reuniões, datas de postagem na mídia, entregas pendentes e revisões de artigos) e o resumo de atividades.',
    whoCanAccess: 'Todos os membros autenticados.',
    steps: [
      {
        stepTitle: '1. Avisos e Pendências',
        description:
          'Confira na parte superior se você possui reuniões agendadas, postagens da mídia ou revisões de artigos atribuídas ao seu perfil.',
      },
      {
        stepTitle: '2. Meus Projetos e Submissões',
        description:
          'Acompanhe o andamento dos projetos aos quais você está vinculado e o status dos relatórios.',
      },
    ],
    semioticTips: [
      'A barra lateral esquerda exibe apenas as coordenações atribuídas ao seu usuário.',
    ],
  },

  indicadores: {
    pageKey: 'indicadores',
    title: 'Indicadores Quantitativos, Linha do Tempo e Mapa',
    purpose:
      'Consolida automaticamente os números quantitativos do laboratório por ano a partir dos projetos e produções cadastrados, além do mapa geográfico de atuação dos membros.',
    whoCanAccess: 'Todos os membros autenticados.',
    steps: [
      {
        stepTitle: '1. Linha do Tempo por Ano',
        description:
          'Os números de cada ano são somados automaticamente com base no ano informado no cadastro de cada Projeto e de cada Produção.',
      },
      {
        stepTitle: '2. Mapa de Pesquisadores',
        description:
          'Exibe os locais (cidade e país) onde há membros ativos do laboratório, conforme preenchido no perfil de cada pesquisador.',
      },
    ],
    semioticTips: [
      'Itens marcados como sigilosos entram na contagem numérica, mas ocultam seus detalhes na página pública.',
    ],
  },

  producoes: {
    pageKey: 'producoes',
    title: 'Produções',
    purpose:
      'Registro central de artigos publicados, TCCs, registros de software (INPI), premiações, aprovações em editais e protótipos de qualquer ano.',
    whoCanAccess: 'Todos os membros autenticados.',
    steps: [
      {
        stepTitle: '1. Cadastrar Produção',
        description:
          'Clique em "Nova Produção", informe o título, a categoria, o ano correspondente e a instituição ou evento.',
      },
      {
        stepTitle: '2. Vincular Autores',
        description:
          'Marque todos os membros participantes para que o registro apareça no perfil de cada um sem duplicar a contagem geral do laboratório.',
      },
    ],
    semioticTips: [
      'Você pode filtrar os registros por qualquer ano ou categoria.',
    ],
  },

  perfil: {
    pageKey: 'perfil',
    title: 'Meu Perfil',
    purpose:
      'Reúne seus dados cadastrais, formação acadêmica (curso, instituição e nível), localização atual para o mapa e seu histórico individual de produções e projetos.',
    whoCanAccess: 'O próprio usuário autenticado.',
    steps: [
      {
        stepTitle: '1. Dados Acadêmicos e Localização',
        description:
          'Preencha livremente seu curso, instituição, nível atual e a cidade/país onde atua e clique em "Salvar Dados".',
      },
      {
        stepTitle: '2. Histórico de Formações',
        description:
          'Na mesma tela, adicione formações anteriores ou em andamento (ex.: graduação concluída no IFS e mestrado em outra instituição).',
      },
    ],
    semioticTips: [
      'A cidade e o país informados aqui posicionam automaticamente seu marcador no mapa do laboratório.',
    ],
  },

  projetos: {
    pageKey: 'projetos',
    title: 'Projetos e Bolsas',
    purpose:
      'Cadastro e acompanhamento de projetos de pesquisa, vínculo de coorientador, bolsistas, voluntários e entrega de relatórios obrigatórios (Parcial e Final).',
    whoCanAccess: 'Todos os membros criam e visualizam projetos; valores de bolsas são restritos.',
    steps: [
      {
        stepTitle: '1. Criar Projeto com Ano de Referência',
        description:
          'Clique em "Novo Projeto", informe o título, ano do projeto, edital, coorientador e membros vinculados.',
      },
      {
        stepTitle: '2. Entregar Relatórios',
        description:
          'No card do projeto, registre a entrega do Relatório Parcial, Relatório Final ou protótipos.',
      },
    ],
    semioticTips: [
      'O valor monetário (R$) da bolsa só é visível para a Diretora, Coordenadores Gerais e o próprio bolsista.',
    ],
  },

  congressos: {
    pageKey: 'congressos',
    title: 'Congressos e Submissões',
    purpose:
      'Gerencia pastas de eventos científicos, submissão de artigos, arquivos anexados, designação de revisores internos e status de avaliação.',
    whoCanAccess: 'Todos os membros autenticados.',
    steps: [
      {
        stepTitle: '1. Criar ou Selecionar um Congresso',
        description:
          'Cadastre o evento informando a sigla, prazos de revisão interna e data limite de submissão.',
      },
      {
        stepTitle: '2. Submeter Artigo e Designar Revisores',
        description:
          'Adicione o artigo, selecione os autores e defina quem fará a revisão interna (qualquer membro, inclusive o próprio autor ou coorientador, pode ser designado).',
      },
    ],
    semioticTips: [
      'Atualize o parecer e o status conforme o artigo avança da revisão interna até a publicação.',
    ],
  },

  startups: {
    pageKey: 'startups',
    title: 'Startups e Editais',
    purpose:
      'Acompanhamento das startups vinculadas ao laboratório, equipe participante e submissões em programas e editais de fomento.',
    whoCanAccess: 'Todos os membros autenticados.',
    steps: [
      {
        stepTitle: '1. Cadastrar Startup',
        description:
          'Informe nome, descrição, estágio atual e selecione os pesquisadores integrantes.',
      },
      {
        stepTitle: '2. Registrar Submissão em Edital',
        description:
          'Em cada startup, clique em "Adicionar Edital" para registrar a participação em programas como Centelha, Startup Nordeste, etc.',
      },
    ],
    semioticTips: [],
  },

  documentos: {
    pageKey: 'documentos',
    title: 'Documentos Gerais',
    purpose:
      'Repositório de documentos avulsos e opcionais do laboratório (templates de artigos, manuais de bancada, ofícios e arquivos diversos).',
    whoCanAccess: 'Todos os membros autenticados.',
    steps: [
      {
        stepTitle: '1. Arquivar Documento',
        description:
          'Clique em "Novo Documento", informe o título, a categoria e o arquivo correspondente.',
      },
    ],
    semioticTips: [],
  },

  reunioes: {
    pageKey: 'reunioes',
    title: 'Reuniões',
    purpose:
      'Agendamento de reuniões semanais de orientação, reuniões gerais mensais e reuniões de coordenação, gerando avisos automáticos para os participantes.',
    whoCanAccess: 'Todos os membros autenticados.',
    steps: [
      {
        stepTitle: '1. Agendar Reunião',
        description:
          'Clique em "Nova Reunião", defina título, tipo, data/hora, local/link e marque os participantes.',
      },
    ],
    semioticTips: [],
  },

  servicos: {
    pageKey: 'servicos',
    title: 'Solicitações e Escalas',
    purpose:
      'Área para qualquer pesquisador solicitar insumos eletrônicos, pedir impressões 3D, reportar defeitos em equipamentos/PCs e consultar as escalas de limpeza e mídia.',
    whoCanAccess: 'Todos os membros autenticados.',
    steps: [
      {
        stepTitle: '1. Solicitar Insumo ou Impressão 3D',
        description:
          'Use os botões no topo para abrir um pedido vinculado ao seu projeto.',
      },
      {
        stepTitle: '2. Consultar Escalas',
        description:
          'Verifique na parte inferior os dias e tarefas da escala de limpeza e as datas sorteadas de publicação da mídia.',
      },
    ],
    semioticTips: [],
  },

  coord_insumos: {
    pageKey: 'coord_insumos',
    title: 'Coordenação de Insumos',
    purpose:
      'Gerenciamento do estoque de componentes eletrônicos e aprovação/resposta às solicitações feitas pelos pesquisadores.',
    whoCanAccess: 'Diretora, Coordenadores Gerais e Coordenadores de Insumos.',
    steps: [
      {
        stepTitle: '1. Cadastrar Componentes no Estoque',
        description:
          'Adicione itens informando quantidade, gaveta/local e se é consumível ou retornável (cautela).',
      },
      {
        stepTitle: '2. Responder Solicitações',
        description:
          'Aprove a entrega, marque como em falta para compra ou registre a devolução de cautelas.',
      },
    ],
    semioticTips: [],
  },

  coord_3d: {
    pageKey: 'coord_3d',
    title: 'Coordenação de Impressão 3D',
    purpose:
      'Controle da fila de solicitações de peças 3D (.STL) enviadas pelos projetos do laboratório.',
    whoCanAccess: 'Diretora, Coordenadores Gerais e Coordenadores de Impressão 3D.',
    steps: [
      {
        stepTitle: '1. Atualizar Status da Fila',
        description:
          'Altere o status dos pedidos entre Na Fila, Imprimindo e Concluído.',
      },
    ],
    semioticTips: [],
  },

  coord_manutencao: {
    pageKey: 'coord_manutencao',
    title: 'Coordenação de Manutenção de Equipamentos',
    purpose:
      'Controle dos equipamentos de bancada e ferramentas do laboratório e acompanhamento do que necessita de reparo.',
    whoCanAccess: 'Diretora, Coordenadores Gerais e Coordenadores de Manutenção.',
    steps: [
      {
        stepTitle: '1. Cadastrar Equipamento e Status',
        description:
          'Registre equipamentos de bancada e atualize o diagnóstico quando precisarem de manutenção.',
      },
    ],
    semioticTips: [],
  },

  coord_computadores: {
    pageKey: 'coord_computadores',
    title: 'Coordenação de Computadores',
    purpose:
      'Inventário dos computadores do laboratório, especificações técnicas e status operacional.',
    whoCanAccess: 'Diretora, Coordenadores Gerais e Coordenadores de Computadores.',
    steps: [
      {
        stepTitle: '1. Gerenciar PCs',
        description:
          'Cadastre as máquinas do laboratório e acompanhe quais estão operacionais ou em manutenção.',
      },
    ],
    semioticTips: [],
  },

  coord_limpeza: {
    pageKey: 'coord_limpeza',
    title: 'Coordenação de Limpeza',
    purpose:
      'Montagem da tabela semanal de tarefas do laboratório, definindo quais dias da semana cada atividade deve ser realizada e seus responsáveis.',
    whoCanAccess: 'Diretora, Coordenadores Gerais e Coordenadores de Limpeza.',
    steps: [
      {
        stepTitle: '1. Adicionar Tarefa na Tabela',
        description:
          'Informe a tarefa, a frequência/dias da semana (ex.: Terça e Quinta) e selecione os membros responsáveis.',
      },
    ],
    semioticTips: [],
  },

  coord_midia: {
    pageKey: 'coord_midia',
    title: 'Coordenação de Mídia',
    purpose:
      'Seleção de membros aptos no mês via checklist e sorteio aleatório das datas de publicação nas redes sociais.',
    whoCanAccess: 'Diretora, Coordenadores Gerais e Coordenadores de Mídia.',
    steps: [
      {
        stepTitle: '1. Selecionar Membros Aptos',
        description:
          'Marque no checklist os pesquisadores que participarão das publicações do mês.',
      },
      {
        stepTitle: '2. Sortear Escala',
        description:
          'Clique em "Sortear Datas do Mês" para distribuir aleatoriamente os dias e enviar alertas automáticos aos sorteados.',
      },
    ],
    semioticTips: [],
  },

  financas: {
    pageKey: 'financas',
    title: 'Coordenação de Finanças',
    purpose:
      'Controle restrito das caixinhas reservadas do laboratório (congressos, supermercado/água, insumos) e registro de entradas e saídas.',
    whoCanAccess: 'Exclusivo para Diretora, Coordenadores Gerais e Coordenadores de Finanças.',
    steps: [
      {
        stepTitle: '1. Criar Caixinha Reservada',
        description:
          'Separe o saldo por finalidade específica.',
      },
      {
        stepTitle: '2. Lançar Entrada ou Saída',
        description:
          'Registre as movimentações financeiras vinculadas a cada caixinha.',
      },
    ],
    semioticTips: [],
  },

  membros: {
    pageKey: 'membros',
    title: 'Membros e Contas',
    purpose:
      'Cadastro de novas contas (com definição de e-mail e senha de acesso), ativação/desativação de membros e atribuição das coordenações.',
    whoCanAccess: 'Listagem para todos; criação de contas e permissões exclusivas da Diretora e Coordenadores Gerais.',
    steps: [
      {
        stepTitle: '1. Criar Conta de Pesquisador',
        description:
          'Clique em "Novo Membro", digite nome, e-mail, senha inicial de login e curso (texto livre).',
      },
      {
        stepTitle: '2. Atribuir Coordenações',
        description:
          'Clique nos botões de departamento na linha do membro para conceder ou revogar o acesso à respectiva coordenação.',
      },
    ],
    semioticTips: [],
  },

  ajuda: {
    pageKey: 'ajuda',
    title: 'Ajuda e Suporte',
    purpose:
      'Guia de consulta rápida sobre como realizar cada operação dentro do sistema.',
    whoCanAccess: 'Todos os membros autenticados.',
    steps: [
      {
        stepTitle: '1. Pesquisar Procedimento',
        description:
          'Use o campo de busca para filtrar instruções sobre projetos, artigos, insumos ou escalas.',
      },
    ],
    semioticTips: [],
  },
};

export interface HelpGuideArticle {
  id: string;
  category: 'PRIMEIROS_PASSOS' | 'PESQUISA_PROJETOS' | 'CONGRESSOS_ARTIGOS' | 'INSUMOS_3D_ESCALAS' | 'GESTAO_COORDENACAO';
  categoryLabel: string;
  question: string;
  shortAnswer: string;
  steps: string[];
  targetRoute: string;
  targetRouteLabel: string;
  keywords: string[];
}

export const HELP_ARTICLES: HelpGuideArticle[] = [
  {
    id: 'help-1',
    category: 'PRIMEIROS_PASSOS',
    categoryLabel: 'Conta e Perfil',
    question: 'Como atualizar meu curso, instituição ou adicionar pós-graduação (mestrado/doutorado)?',
    shortAnswer:
      'Acesse a aba "Meu Perfil" para digitar livremente seu curso, instituição atual, cidade/país e adicionar etapas na sua formação.',
    steps: [
      'No menu lateral, clique em "Meu Perfil".',
      'Edite os campos de Curso, Instituição, Nível e Localização (Cidade/País) e clique em "Salvar Dados".',
      'Na seção de Formações Acadêmicas na mesma tela, você pode registrar formações concluídas ou em andamento.',
    ],
    targetRoute: '/app/perfil',
    targetRouteLabel: 'Abrir Meu Perfil',
    keywords: ['perfil', 'curso', 'mestrado', 'doutorado', 'instituição', 'localização'],
  },
  {
    id: 'help-2',
    category: 'PESQUISA_PROJETOS',
    categoryLabel: 'Projetos e Bolsas',
    question: 'Como cadastrar um projeto e enviar relatórios parcial e final?',
    shortAnswer:
      'Na tela "Projetos", clique em "Novo Projeto", informe o ano, edital, coorientador e equipe.',
    steps: [
      'Acesse "Projetos" no menu lateral e clique em "Novo Projeto".',
      'Preencha título, ano do projeto, edital e selecione o coorientador.',
      'Para entregar um relatório pendente, clique em "Registrar Entrega" ao lado do relatório dentro do projeto.',
    ],
    targetRoute: '/app/projetos',
    targetRouteLabel: 'Abrir Projetos',
    keywords: ['projeto', 'relatório', 'bolsa', 'coorientador', 'parcial', 'final'],
  },
  {
    id: 'help-3',
    category: 'PESQUISA_PROJETOS',
    categoryLabel: 'Produções',
    question: 'Como registrar um artigo, TCC, registro de software (INPI) ou premiação?',
    shortAnswer:
      'Acesse "Produções", clique em "Nova Produção", informe o ano e selecione todos os autores envolvidos.',
    steps: [
      'Clique em "Produções" na barra lateral.',
      'Clique em "Nova Produção", escolha a categoria e digite o ano de realização.',
      'Selecione os membros participantes para vincular ao perfil de cada um sem duplicidade.',
    ],
    targetRoute: '/app/producoes',
    targetRouteLabel: 'Abrir Produções',
    keywords: ['produção', 'artigo', 'tcc', 'inpi', 'software', 'premiação', 'ano'],
  },
  {
    id: 'help-4',
    category: 'CONGRESSOS_ARTIGOS',
    categoryLabel: 'Congressos',
    question: 'Como submeter um artigo em um congresso e definir revisores?',
    shortAnswer:
      'Em "Congressos", selecione o evento desejado, clique em "Submeter Artigo" e marque os autores e revisores.',
    steps: [
      'Acesse "Congressos" no menu lateral.',
      'Selecione a pasta do congresso (ou crie um novo evento).',
      'Clique em "Submeter Artigo", informe o arquivo e selecione os revisores internos.',
    ],
    targetRoute: '/app/congressos',
    targetRouteLabel: 'Abrir Congressos',
    keywords: ['congresso', 'submissão', 'revisão', 'revisor', 'artigo'],
  },
  {
    id: 'help-5',
    category: 'INSUMOS_3D_ESCALAS',
    categoryLabel: 'Solicitações e Escalas',
    question: 'Como solicitar componentes eletrônicos, impressão 3D ou ver escalas?',
    shortAnswer:
      'Utilize a tela "Solicitações e Escalas" para fazer pedidos às coordenações e consultar a tabela de limpeza e datas da mídia.',
    steps: [
      'Acesse "Solicitações e Escalas" no menu lateral.',
      'Clique em "Solicitar Insumo" ou "Solicitar Impressão 3D".',
      'Acompanhe o status de aprovação na própria listagem.',
    ],
    targetRoute: '/app/servicos',
    targetRouteLabel: 'Abrir Solicitações e Escalas',
    keywords: ['insumo', 'componente', 'impressão 3d', 'limpeza', 'mídia', 'escala'],
  },
];
