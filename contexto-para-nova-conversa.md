# Contexto do projeto Taverna dos Jogos

Cole este arquivo (ou anexe com @) no início de uma conversa nova para retomar o trabalho.

## Projeto
- Site: https://tavernadosjogos.com.br (antes "Pokédex"). Ferramentas e desafios de Pokémon e Hearthstone, em pt e en.
- Repositório: `git@github.com:sergiofisio/new-pokedex.git` (público), branch `main`.
- Stack: Next.js 16 (App Router, Turbopack), React 19, Tailwind 4, motion, Supabase (auth e banco), yarn 1.
- Ambiente de desenvolvimento: Windows com bash (Git Bash). Os `.env` reais não vão para o git; use `.env.example` como modelo e copie para `.env.local`.

## Regras de trabalho
- Responder sempre em português.
- Commits e push sem nenhum vestígio de IA: sem co-autor nem menção a IA. Commitar com:
  `git -c user.name="Sergio Bastos Jr" -c user.email="sergiobastosfisio@gmail.com" commit ...`
- `AGENTS.md` e `CLAUDE.md` ficam no `.gitignore`.
- Nunca imprimir valores secretos de `.env`/`.env.local` (mostrar só tamanho ou últimos 4 caracteres).
- Antes de escrever código Next, ler a doc em `node_modules/next/dist/docs/` (a versão 16 tem mudanças).
- O push vai direto para `main` e dispara o deploy na VPS.
- Não mexer nos outros sites da VPS (`lojagreenlife`, `devsergiofisico`, `compras`) sem perguntar.

## Hospedagem (VPS Hostinger)
- `root@46.202.148.168`, Ubuntu 24.04, 4 GB RAM + 2 GB swap, Node 24, PM2, Nginx.
- Acesso SSH por chave (a chave pessoal precisa estar cadastrada no hPanel da Hostinger para usar de outro computador).
- Estrutura: `/var/www/taverna/releases/<data-sha>`, `current` (link para a versão ativa), `shared/.env.production` (chmod 600).
- PM2: app `taverna` na porta 3010 (`ecosystem.config.cjs`). Nginx: `deploy/nginx.conf`.
- Deploy: `.github/workflows/deploy.yml` roda `deploy/deploy.sh` por SSH a cada push na `main` (build, troca atômica, health check em `/robots.txt` e rollback automático; mantém 3 versões).
  - Variáveis do repositório: `VPS_HOST`, `VPS_USER`; segredo `VPS_SSH_KEY`.
  - Deploy manual: `gh workflow run deploy.yml -R sergiofisio/new-pokedex --ref main`.
- Variáveis NEXT_PUBLIC_* entram no build: mudou alguma na VPS, precisa de novo deploy.

## Cloudflare
- DNS no Cloudflare, registros `@` e `www` com proxy (nuvem laranja), SSL Full (strict).
- Certificado de origem em `/etc/ssl/cloudflare/origin.pem` e `origin.key` na VPS (válido até 2041).
- IP real do visitante: `/etc/nginx/conf.d/cloudflare-realip.conf`.
- Pendências sugeridas: Rocket Loader desligado, Bot Fight Mode desligado, regra de rate limit para `/api/blizzard`.

## AdSense e SEO
- Conta AdSense `ca-pub-3556055715324106`; `ads.txt` servido pelo site.
- Recusa anterior por "conteúdo de baixo valor". Correções já publicadas:
  - Script de anúncios só em páginas com conteúdo (home, Pokédex e Pokémon, Hearthstone, hub de desafios, guias, sobre). Fora de login, perfil, duelo, coleção, telas de jogo, legais e 404.
  - Página por Pokémon `/pokemon/[nome]` (1025) e por carta `/hearthstone/cartas/[slug]` (~6000), com texto gerado próprio.
  - Coleções `/hearthstone/colecoes` e `/hearthstone/colecoes/[colecao]`, índice da Pokédex em `/pokemon`.
  - Guias em `/guias` (tabela de tipos, reconhecer Pokémon, Pó Arcano, montar deck) e página `/sobre`.
  - Sitemap com ~7100 endereços.
- Cartas da coleção Básica (CORE) são gratuitas: campo `free` em `HsCard` e `craftCost()` em `app/lib/hearthstone.ts`.
- Próximos passos: sitemap enviado no Google Search Console (estava "Não foi possível buscar" logo após o envio; esperar e reenviar se precisar). Depois, no AdSense: Central de políticas, "Confirmo que corrigi os problemas" e "Pedir revisão".

## Arquivos importantes
- `app/lib/pokemonServer.ts`, `pokemonText.ts`, `typeChart.ts`, `evolution.ts`: dados e textos das páginas de Pokémon.
- `app/lib/hsServer.ts`, `cardText.ts`, `hearthstone.ts`: dados e textos das cartas e coleções.
- `app/lib/guides.ts`: conteúdo dos guias e da página Sobre (pt e en).
- `app/components/ads/adScript.tsx`: script do AdSense (incluído página a página).
- `deploy/`: `deploy.sh`, `setup-vps.sh`, `nginx.conf`, `.env.production.example`.
