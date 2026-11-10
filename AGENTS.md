# AGENTS.md — Guia de Arquitetura, Regras de Negócio e Decisões do HUB-LABIC

> **Instrução para Agentes de IA (Antigravity, Claude Code, Cursor, Copilot, Windsurf):**
> Este arquivo consolida todas as decisões de produto, regras de negócio, permissões (RBAC), sigilo e padrões de UI/UX tomadas junto à coordenação do **LABIC (Laboratório de Pesquisa — Instituto Federal de Sergipe, Campus Lagarto)**. **NÃO pergunte novamente ao usuário sobre decisões já documentadas aqui.** Siga rigorosamente estas diretrizes ao criar ou alterar funcionalidades.

---

## 1. Contexto do Domínio (O que é o LABIC)
- O **LABIC** é um laboratório de pesquisa nascido no **IFS — Campus Lagarto**, reunindo pesquisadores do **Ensino Médio/Técnico Integrado** (*Automação Industrial* e *Redes de Computadores*), **Ensino Superior** (*Bacharelado em Sistemas de Informação - BSI* e *Bacharelado em Engenharia Elétrica - BEE*) e **Pós-Graduação (Mestrado/Doutorado)** em instituições nacionais e internacionais (ex.: *USP - São Paulo*, *Canadá*, *Itália*, *UFS*).
- **Trajetória Multi-Institucional Contínua:** Quando um aluno se forma no IFS e vai fazer Mestrado/Doutorado em outra universidade/país, ele **NÃO é desativado**. Ele permanece `ATIVO` no sistema, com sua nova formação e localização geográfica adicionadas à sua `academicTrajectory`, continuando a publicar, coorientar e participar de projetos do LABIC.
  - A flag `workMode` diferencia quem está `PRESENCIAL_LAGARTO` (entra nas escalas físicas como Limpeza) de quem está `REMOTO_EXTERNO` (ativo na pesquisa, mas isento da escala física de limpeza).

---

## 2. Stack Tecnológica & Padrões Arquiteturais
- **Framework:** Next.js (App Router) + React + TypeScript.
- **Hospedagem alvo:** Vercel.
- **Banco de Dados & Storage:** PostgreSQL via **Supabase** (`supabase/migrations/001_initial_schema.sql`), com suporte híbrido (`src/lib/supabase.ts` + `src/context/LabicContext.tsx`) para funcionar imediatamente mesmo antes da configuração das chaves `.env.local`.
- **Estética & UI/UX (Variante A — Inspirada no Supabase Studio + Engenharia Semiótica):**
  - Navegação lateral fixa à esquerda com **Visibilidade Progressiva por Privilégio**.
  - Signos semióticos claros: todo ícone é acompanhado de rótulo textual inequívoco, badges de status usam cores semânticas consistentes e toda página possui obrigatoriamente o botão **`❓ Como usar esta tela`** (`PageTutorialButton`) no cabeçalho superior direito.

---

## 3. Regras Estritas de Níveis de Acesso (RBAC Cumulativo) e Sigilo
1. **Papéis Globais (`globalRole`):**
   - `DIRETORA` (Professora Orientadora Geral de todos) e `COORD_GERAL` (Coordenadores Gerais): Acesso total a todos os módulos; são os **únicos** que podem criar novas contas, ativar/desativar membros e atribuir coordenações de departamento ou bolsas.
   - `PESQUISADOR`: Alunos/pesquisadores (podem ser bolsistas ou voluntários, coorientadores de projetos e também acumular 1 ou mais coordenações de departamento).
2. **As 7 Coordenações de Departamento (`coordinations[]`):**
   - `FINANCAS`: Caixinhas reservadas (ex.: congressos, café/água/supermercado) e fluxo de caixa.
   - `INSUMOS`: Componentes eletrônicos e aprovação de solicitações (com distinção entre **Consumível/Baixa Definitiva** e **Empréstimo/Cautela retornável**).
   - `IMPRESSAO_3D`: Impressoras 3D, filamentos e fila de peças `.STL`.
   - `MANUTENCAO`: Equipamentos de bancada e chamados de reparo.
   - `COMPUTADORES`: Patrimônio de PCs do laboratório e status operacional.
   - `LIMPEZA`: Tabela/quadro semanal de tarefas e dias da semana (espelhando o quadro físico sem burocracia diária).
   - `MIDIA`: Checklist de membros aptos no mês + **Sorteador/Randomizador Automático** de datas de postagem no Instagram + disparo de alerta.
3. **Regra da Barra Lateral Progressiva:**
   - Na seção `🛠️ MINHAS COORDENAÇÕES`, **só exiba os links dos departamentos que o usuário logado realmente coordena** (ou todos, se for `DIRETORA` / `COORD_GERAL`).
   - A aba de **Finanças (`FINANCAS`) é estritamente invisível** para quem não é `DIRETORA`, `COORD_GERAL` ou coordenador de `FINANCAS`.
   - Qualquer pesquisador acessa seus pedidos e consulta escalas através da seção comum `⚡ SERVIÇOS DO LAB`.
4. **Sigilo do Valor de Bolsa (`scholarshipValueBRL`):**
   - O valor em R$ da bolsa vinculada a um pesquisador em um projeto **SÓ pode ser visto pela `DIRETORA`, por `COORD_GERAL` e pelo próprio bolsista**.
   - **O Coorientador do projeto NÃO vê o valor em R$ da bolsa do seu orientando** (ele vê que o aluno é bolsista e acompanha seus relatórios Parcial/Final, mas o valor monetário é ocultado).

---

## 4. Regras dos Módulos Científicos e Quantitativos
1. **Produções Anuais (2021–2026+) & Coautoria Sem Duplicidade:**
   - Categorias: Artigos, TCCs/Dissertações, Registros de Software (INPI), Premiações, Editais Aprovados (*PIBIC, PIBITI, FAPITEC, CNPq*), Protótipos/Bancadas e Conquistas de Startups.
   - Um único registro de produção vincula múltiplos coautores (`authorIds[]`), aparecendo no **Perfil Individual** de cada um e somando **apenas 1 vez** no painel quantitativo do LABIC.
2. **Timeline Histórica (2021–2026+) e Mapa Mundial ("LABIC pelo Mundo"):**
   - Dados quantitativos agregados por ano compõem a Timeline (na Vitrine Pública e no Modo Apresentação da Diretora). Itens marcados como `isSensitive: true` (ex.: patentes ainda não depositadas no INPI) entram na soma numérica mas ocultam seus detalhes técnicos na Vitrine Pública.
   - O **Mapa Mundial** conecta Lagarto-SE aos polos onde pesquisadores do LABIC atuam (ex.: São Paulo/USP, Canadá, Itália).
3. **Congressos & Submissões (ex.: CROS 2027) — Sem Trava de Conflito de Interesse:**
   - **Regra explícita:** Qualquer membro pode ser designado como revisor interno de um artigo no congresso, **incluindo o próprio autor, coautor ou coorientador** (pois na dinâmica atual do LABIC os coordenadores gerais e seniores revisam seus próprios artigos e os de seus orientandos).
4. **Startups do LABIC:**
   - Rastreamento de startups nascidas no laboratório, membros vinculados e submissões em editais como *Centelha*, *Startup Nordeste*, etc.
5. **Autoexplicação Obrigatória (Tutoriais & Central de Ajuda):**
   - Toda nova página criada no sistema DEVE incluir o componente `<PageTutorialButton />` com explicação clara do objetivo da página e passo a passo de uso, além de estar mapeada na página `/app/ajuda`.
