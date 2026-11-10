# HUB LABIC

Vitrine e acervo do **LABIC — Laboratório de Inovação e Criatividade** do Instituto Federal de Sergipe, Campus Lagarto (desde agosto de 2017).

- **Site público:** projetos, pessoas (equipe e egressos), startups, conquistas e linha do tempo.
- **Área de gestão (`/gestao`):** cadastro e edição de todo o acervo, com controle do que aparece no site.
- **Formulário de egressos (`/egressos`):** ex-membros enviam seus dados; a coordenação aprova antes de publicar.

## Rodar localmente

```bash
npm install
cp .env.example .env.local   # opcional: sem banco, o site mostra o acervo inicial
npm run dev
```

## Documentação

- [`docs/IMPLANTACAO.md`](docs/IMPLANTACAO.md) — como aplicar o banco novo, criar o usuário de gestão e publicar.
- [`docs/REVISAR-ACERVO.md`](docs/REVISAR-ACERVO.md) — de onde veio o acervo inicial e o que conferir.
- [`AGENTS.md`](AGENTS.md) — mapa do código e regras para quem for evoluir o sistema.
