# AGENTS.md — Guia Oficial de Arquitetura, Regras de Negócio, Segurança e Decisões do HUB-LABIC

> **Instrução Obrigatória para Agentes de IA (Antigravity, Claude Code, Cursor, Copilot, Windsurf):**
> Este arquivo consolida todas as decisões de produto, regras de negócio, permissões (RBAC), sigilo, estrutura de banco de dados (Supabase) e padrões de UI/UX tomadas junto à coordenação do **LABIC (Laboratório de Pesquisa — Instituto Federal de Sergipe, Campus Lagarto)**. **NÃO pergunte novamente ao usuário sobre decisões já documentadas aqui.** Siga rigorosamente estas diretrizes ao criar, refatorar ou alterar funcionalidades.

---

## 1. Contexto do Domínio (O que é o LABIC)
- O **LABIC** é um laboratório de pesquisa nascido no **IFS — Campus Lagarto**, reunindo pesquisadores do **Ensino Médio/Técnico Integrado**, **Ensino Superior** (ex.: *Sistemas de Informação*, *Engenharia Elétrica*) e **Pós-Graduação (Mestrado/Doutorado)** em instituições nacionais e internacionais (ex.: *USP - São Paulo*, *Canadá*, *Itália*, *UFS*).
- **Campos Livres de Curso e Instituição:** Os campos `course`, `institution` e `degreeLevel` no perfil e nas formações são **texto livre** (nunca restritos a um select engessado), permitindo registrar qualquer curso ou universidade.
- **Trajetória Multi-Institucional Contínua (`academicTrajectory`):** Quando um aluno se forma no IFS e vai fazer Mestrado/Doutorado em outra universidade/país, ele **NÃO é desativado**. Ele permanece `ATIVO` no sistema, com sua nova formação e localização geográfica (`currentCity`, `currentStateOrProvince`, `currentCountry`) atualizadas, recalculando automaticamente suas coordenadas no **Mapa Mundial ("LABIC pelo Mundo")**.
  - A flag `workMode` diferencia quem está `PRESENCIAL_LAGARTO` (entra nas escalas físicas como Limpeza) de quem está `REMOTO_EXTERNO` (ativo na pesquisa, mas isento da escala física de limpeza).

---

## 2. Stack Tecnológica & Padrões Arquiteturais
- **Framework:** Next.js 15 (App Router) + React 19 + TypeScript + Tailwind CSS.
- **Hospedagem Oficial:** Vercel (repositório `https://github.com/NyquistEdu/hub-labic.git`, branch `main`).
- **Banco de Dados & Storage:** PostgreSQL + Storage via **Supabase** (`supabase/migrations/001_initial_schema.sql` e `002_full_crud_and_attachments.sql`), gerenciado centralmente em `src/lib/supabase.ts` e `src/context/LabicContext.tsx`.
- **Estética & UI/UX Minimalista e Sóbria (Estilo Supabase Studio):**
  - Fundo escuro sóbrio (`#0c0d10` e `#111318`), bordas discretas (`border-zinc-800`), botões primários em verde esmeralda (`bg-emerald-600`).
  - **Proibido poluição visual:** Não adicione emojis excessivos nos títulos ou menus, não crie simuladores de cargo falsos ("Simular visão") e não exiba dados fictícios hardcoded quando o banco estiver conectado.
  - **Cabeçalho Limpo (`AppShell.tsx`):** Exibe a logo à esquerda e, à direita, o sino de notificações, o botão compacto `?` (`PageTutorialButton` com `headerIconOnly={true}`), a foto/avatar do usuário logado e o botão de sair.
  - **CRUD Completo Obrigatório:** Todo módulo e entidade do sistema DEVE suportar **Criar, Ler/Visualizar, Editar e Excluir (CRUD)** tanto no estado React quanto no Supabase.

---

## 3. Autenticação, Sessão de 24h e Segurança de Contas
1. **Autenticação Real (`/login`):**
   - Login por e-mail e senha validados contra a tabela `public.profiles`.
   - **Nunca exiba credenciais de administrador ou senhas na tela de `/login`**.
2. **Expiração de Sessão em 24 Horas:**
   - A sessão local (`localStorage` key `labic_auth_session` + cookie `labic_auth_user_id` com `max-age=86400`) expira estritamente em **24 horas** (`24 * 60 * 60 * 1000` ms).
   - Se a sessão expirar ou se o `status` do usuário passar para `INATIVO`, o usuário é deslogado automaticamente e redirecionado para `/login`.
3. **Gestão de Membros (`/app/membros`) e Sigilo de Senhas:**
   - Apenas `DIRETORA` e `COORD_GERAL` acessam `/app/membros`.
   - **Proibido exibir senhas:** As senhas dos membros **NUNCA** devem ser exibidas na listagem nem pré-preenchidas em modais. Existe exclusivamente o botão **"Trocar Senha"**, que abre um modal seguro (`type="password"`) para redefinir a senha.
   - Tanto a `DIRETORA` quanto os `COORD_GERAL` podem alterar o `globalRole` de qualquer membro (`PESQUISADOR` ⇄ `COORD_GERAL` ⇄ `DIRETORA`), editar dados cadastrais, ativar/desativar contas e atribuir/remover as 7 coordenações.

---

## 4. Níveis de Acesso (RBAC Cumulativo), Sigilo de Bolsas e Travas de Acesso
1. **Papéis Globais (`globalRole`):**
   - `DIRETORA` (Professora Orientadora Geral) e `COORD_GERAL` (Coordenadores Gerais): Acesso administrativo total a todos os módulos, projetos, editais e finanças.
   - `PESQUISADOR`: Pesquisadores (podem ser bolsistas/integrantes de projetos, coorientadores e acumular 1 ou mais coordenações de departamento).
2. **As 7 Coordenações de Departamento (`coordinations[]`):**
   - `FINANCAS`: Caixinhas reservadas e extrato de entradas/saídas (`/app/financas`). Invisível na barra lateral para quem não é `DIRETORA`, `COORD_GERAL` ou coordenador de `FINANCAS`.
   - `INSUMOS`: Estoque de componentes eletrônicos e aprovação de pedidos (`/app/coordenacoes/insumos`).
   - `IMPRESSAO_3D`: Aprovação de solicitações de uso da impressora 3D e baixa de conclusão (`/app/coordenacoes/impressao-3d`).
   - `MANUTENCAO`: Equipamentos de bancada e chamados de reparo (`/app/coordenacoes/manutencao`).
   - `COMPUTADORES`: Estações de trabalho (PCs) e status operacional (`/app/coordenacoes/computadores`).
   - `LIMPEZA`: Quadro semanal permitindo selecionar **múltiplos dias da semana** (`Segunda` a `Domingo`) para tarefas recorrentes, listando apenas membros `PRESENCIAL_LAGARTO` (`/app/coordenacoes/limpeza`).
   - `MIDIA`: Seleção de membros aptos e sorteio automático de datas de postagem (`/app/coordenacoes/midia`).
3. **Sigilo Absoluto, Vigência e Cálculo de Bolsas (`/app/projetos`, `/app/perfil` e `/app/membros`):**
   - O status de `Bolsista` e o valor em R$ (`monthlyScholarshipBRL`) **SÓ podem ser vistos pela `DIRETORA`, por `COORD_GERAL` e pelo próprio bolsista**.
   - **PROIBIDO exibir aviso de `"Valor restrito"` ou revelar quem é bolsista** para os demais usuários (incluindo o Coorientador ou outros integrantes do projeto). Para terceiros, todos os alunos do projeto aparecem simplesmente como **`Pesquisador Integrante`**.
   - **Vigência e Parcelas da Bolsa:** Toda bolsa registra o **Início (`scholarshipStartMonth`, formato `YYYY-MM`)**, o **Fim (`scholarshipEndMonth`, formato `YYYY-MM`)** e a **Quantidade de Parcelas (`scholarshipInstallments`, calculada automaticamente e editável)**.
   - **Cálculo Dinâmico de Ganho Mensal Atual (`getScholarshipVigenciaStatus`):** O ganho mensal atual de cada membro soma **apenas as bolsas vigentes no mês/ano atual** (e cujo projeto esteja `EM_ANDAMENTO`), reduzindo ou aumentando automaticamente conforme as vigências iniciam ou encerram.
   - **Detalhamento de Ganhos em `/app/membros`:** Na página de Membros e Permissões (restrita à `DIRETORA` e `COORD_GERAL`), cada cartão de membro exibe explicitamente o **Ganho Mensal Atual (`R$ X/mês`)** e a lista **somente dos projetos em que aquele membro recebe bolsa**, com valor mensal, início/fim (`MM/AAAA`), parcelas e status de vigência (`Vigente` vs `Vigência Encerrada`).
   - No **Meu Perfil (`/app/perfil`)**, o próprio usuário visualiza seu **Ganho Mensal Atual (Bolsas Vigentes: R$ X/mês)** e os detalhes de vigência/parcelas de cada bolsa.
4. **Trava de Acesso em Projetos (`canAccessProject`):**
   - Qualquer pesquisador pode cadastrar um novo projeto, mas **apenas os membros vinculados ao projeto (Orientador, Coorientador, Integrantes) ou `DIRETORA` / `COORD_GERAL`** podem abrir os detalhes internos, entregas/arquivos e o **Bloco de Notas Compartilhado do Projeto (`notes`)** ou editar o projeto.
5. **Trava de Acesso em Editais de Startups (`canAccessStartupEdital`):**
   - Os membros são vinculados diretamente a cada **Edital Submetido (`StartupApplication.memberIds[]`)**.
   - Qualquer pesquisador pode registrar uma startup ou submeter um novo edital, mas **apenas os membros vinculados àquele edital específico (ou `DIRETORA` / `COORD_GERAL`)** podem entrar na página dedicada do edital (`/app/startups/[startupId]/editais/[editalId]`), ver seus arquivos/prazos ou editá-lo. Um membro de fora não consegue se autoincluir em um edital existente.

---

## 5. Padrão de Múltiplos Arquivos (`LabicAttachment[]`) e Módulos Específicos
1. **Gerenciador de Múltiplos Anexos (`src/components/AttachmentManager.tsx`):**
   - Utilizado em Produções, Entregas de Projetos, Congressos, Editais de Startups e Documentos Gerais.
   - **Regra explícita de formato:** Arquivos **`.PDF`** são enviados via upload direto para o Supabase Storage; **qualquer outro formato** (ZIP, DOCX, código, Drive, DOI) deve ser adicionado como **Link Externo (`https://...`)**. Ambos permitem anexar múltiplos itens por registro.
2. **Produções (`/app/producoes`), Autor Principal Externo (`primaryAuthorExternal`) e Coautores Externos (`externalAuthors`):**
   - **Autor Principal Flexível:** O autor principal pode ser um **Membro do LABIC (`primaryAuthorId`)** (ativo, inativo ou egresso) OU um **Autor Externo não cadastrado no sistema (`primaryAuthorExternal`)**. Isso atende diretamente a casos em que um pesquisador do LABIC participou como coautor em uma pesquisa liderada por um orientador/pesquisador externo à instituição.
   - **Coautores do LABIC (`authorIds[]`):** Quando o autor principal for externo, os pesquisadores do LABIC que participaram do trabalho são selecionados em `authorIds[]`, vinculando automaticamente a produção ao portfólio e contadores desses membros no laboratório.
   - **Coautores Externos ao LABIC (`externalAuthors`):** Campo de texto onde se escreve o nome completo dos demais autores externos que não estão cadastrados no sistema separados por vírgula (presente em Produções e em Submissões de Congressos), vinculando-os formalmente sem criar contas de usuário.
   - Soma quantitativa sem duplicidade nos indicadores anuais (calculados dinamicamente a partir dos anos reais existentes no banco, sem hardcode de "2026+").
3. **Formatação Limpa de Rótulos, Datas e Horários:**
   - **Proibido exibir códigos internos de enum em `UPPER_SNAKE_CASE`** (como `EM_ANDAMENTO`, `REUNIAO_GERAL_MENSAL`, `TEMPLATE_ARTIGO`, `CONSUMIVEL`). Utilize sempre os mapas de tradução em `src/types/labic.ts` (`PROJECT_STATUS_LABELS`, `MEETING_TYPE_LABELS`, etc.).
   - **Proibido exibir timestamps ISO brutos** (`2026-11-10T14:00:00+00:00`). Utilize sempre `formatDateBR` (`DD/MM/AAAA`) e `formatMeetingDateTime` (`DD/MM/AAAA às HH:MM`).
4. **Congressos e Página Exclusiva (`/app/congressos` e `/app/congressos/[id]`):**
   - Cada congresso possui sua página dedicada (`/app/congressos/[id]`) contendo:
     - **Cronograma Interno de Metas (`milestones[]`)**: Datas-alvo internas do laboratório (ex.: *"Até data X: finalizar Introdução"*).
     - **Fluxo Real de Versões em PDF (`versions[]`) e Checklist de Status**: O autor envia o PDF da v1; o revisor baixa o PDF, faz upload do PDF revisado/comentado com parecer; o autor envia a v2 corrigida.
     - **Sem trava de conflito de interesse:** Qualquer membro (inclusive o próprio autor ou coorientador) pode ser designado como revisor interno.
5. **Reuniões (`/app/reunioes`):**
   - Utiliza inputs nativos `<input type="date" />` e `<input type="time" />`, botões *"Marcar todos / Desmarcar todos"* para participantes, registro de pauta/ata (`minutesNotes`) e CRUD completo.
6. **Solicitações e Escalas (`/app/servicos`):**
   - Os 3 formulários superiores ocupam **1 linha horizontal inteira cada** (1. Solicitar Insumo; 2. Solicitar Autorização para Impressão 3D; 3. Reportar Defeito), mantendo os cartões inferiores de acompanhamento e escalas em blocos de 2 colunas.
   - Na Impressão 3D, o pesquisador solicita autorização de uso da impressora; a Coordenação de Impressão 3D aprova (`APROVADO_PARA_IMPRIMIR`) e depois dá baixa como concluída (`CONCLUIDO`).
7. **Página Exclusiva de Projetos (`/app/projetos/[id]`) e Bloco de Notas Cronológico:**
   - A listagem principal (`/app/projetos`) é leve e despoluída, tendo por padrão o escopo **"Meus Projetos"** e status **"Em andamento"**, com botão `Abrir Projeto (Entregas, Integrantes e Notas) →`.
   - Cada projeto possui sua página dedicada (`/app/projetos/[id]`) contendo os integrantes e bolsas com sigilo absoluto, entregas de relatórios/arquivos em PDF e o **Bloco de Notas Cronológico do Projeto** (`ProjectNoteItem[]`), onde cada anotação é registrada separadamente com autor, data/hora e texto, sem acumular tudo em um único bloco de texto.
8. **Paginação Inteligente e Pesquisa Discreta em Todo o Sistema:**
   - **Paginação (`PaginationControls.tsx`):** Aplicada em Projetos, Produções, Membros, Documentos e Congressos, permitindo ao usuário selecionar **15, 20 ou 50 itens por página**, exibindo totalizador e navegação limpa.
   - **Pesquisa Discreta (`DiscreetSearchBar.tsx`):** Proibido fixar barras de busca gigantes e poluídas na tela. Utiliza-se um botão discreto `[ 🔍 Pesquisar ]` que expande suavemente um campo de texto ao ser clicado, com botão de limpar/fechar `✕`.
