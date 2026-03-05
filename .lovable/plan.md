

# TalentRadar - Plano de Finalização do MVP

## Situação Atual

O projeto possui apenas frontend estático com mock data: Landing, Register, SelectSports, Feed e AthleteProfile. Nenhum backend, autenticação ou banco de dados está conectado. Não há conexão com Supabase.

## Realidade Importante

Este pedido contém funcionalidades equivalentes a meses de desenvolvimento profissional (editor de vídeo nativo com slow-mo, spotlight tool, chat em tempo real, geolocalização com mapas, OTP parental, modo anônimo, QR codes, internacionalização, PWA, etc.). Vou priorizar o que é viável implementar agora no frontend e indicar o que requer backend.

---

## Fase 1: Identidade Visual Premium (Frontend)

Atualizar toda a interface para o padrão solicitado:

- **Fundo #0A0A0A** e cards com efeito Glassmorphism (`backdrop-blur`, `bg-white/5`, bordas semi-transparentes)
- **Verde Neon #39FF14** como cor primária de ação, **Azul Ciano #00E5FF** para elementos de tecnologia
- Atualizar `index.css` (variáveis CSS) e `tailwind.config.ts` com as novas cores
- **Navegação inferior** renomeada: Home, Discovery, Talent Studio, News/Map, Profile
- Skeleton screens para carregamento de vídeos em todos os cards

## Fase 2: Novas Páginas e Funcionalidades (Frontend)

### Talent Studio (`/talent-studio`)
- Página de upload de vídeo com UI para ferramentas de edição (Trim, Spotlight, Overlay, Slow-Mo)
- Como edição de vídeo real no browser é extremamente complexa, implementar a **UI/UX** das ferramentas com controles visuais e previews simulados
- Overlay automático exibindo Nome, Idade, Posição, Cidade sobre o vídeo

### News/Map (`/eventos`)
- Página de eventos com lista e mapa simulado (placeholder para integração futura com Leaflet/Google Maps)
- **Aba "Last Call"**: seção de destaque para eventos que expiram em 48h com badge de urgência
- Geolocalização simulada com distâncias

### QR Code de Perfil
- Gerar QR Code no perfil do atleta usando biblioteca `qrcode.react`
- Botão de compartilhamento com QR Code em modal

### Chat Seguro (UI)
- Página `/chat` com interface de chat
- Regra visual: apenas Olheiros verificados iniciam conversas
- Banners de segurança fixos em todas as conversas
- Indicador de "Modo Anônimo" para olheiros

### Score de Atividade
- Badge/indicador visual de atividade no card do atleta no feed
- Ranking visual baseado em frequência de postagens

### Páginas Legais
- `/termos` - Termos de Uso focados em proteção de menores (LGPD)
- `/privacidade` - Política de Privacidade
- Link no footer e no cadastro

### Internacionalização (básica)
- Arquivo de traduções PT/EN/ES para termos esportivos e posições
- Seletor de idioma no perfil

## Fase 3: Responsividade e PWA

- Otimizar todas as páginas para telas mobile (iPhone/Android)
- Adicionar `manifest.json` para PWA com ícones e splash screen
- Meta tags para instalação como app

## O Que Requer Supabase (Fase Futura)

As seguintes funcionalidades necessitam de conexão com Supabase/Cloud, que ainda não está configurada:

- Autenticação real e tabelas de usuários (Atleta, Olheiro, Instituição)
- Validação OTP parental por email
- Upload e armazenamento de vídeos
- Chat em tempo real com Supabase Realtime
- Modo Olheiro Anônimo (lógica de visibilidade no banco)
- Selo de Verificado (workflow de documentos)
- Geolocalização real com PostGIS
- Notificações espelhadas para responsáveis
- Score de atividade calculado no backend

**Recomendação**: Após aprovar este plano, conecte o Lovable Cloud para implementar o backend incrementalmente.

---

## Arquivos a Criar/Modificar

| Arquivo | Ação |
|---|---|
| `src/index.css` | Atualizar cores (#0A0A0A, #39FF14, #00E5FF) |
| `tailwind.config.ts` | Adicionar cores cyan, glassmorphism utilities |
| `src/pages/Landing.tsx` | Glassmorphism nos cards |
| `src/pages/Register.tsx` | Glassmorphism, validação visual |
| `src/pages/Feed.tsx` | Nova nav, Last Call, Score, Skeleton screens |
| `src/pages/AthleteProfile.tsx` | QR Code, glassmorphism, skeleton |
| `src/pages/TalentStudio.tsx` | **Nova** - UI de edição de vídeo |
| `src/pages/EventsMap.tsx` | **Nova** - Eventos + mapa placeholder |
| `src/pages/Chat.tsx` | **Nova** - Chat seguro UI |
| `src/pages/Terms.tsx` | **Nova** - Termos de Uso |
| `src/pages/Privacy.tsx` | **Nova** - Política de Privacidade |
| `src/components/SkeletonCard.tsx` | **Novo** - Skeleton para vídeos |
| `src/components/QRCodeModal.tsx` | **Novo** - Modal com QR Code |
| `src/components/BottomNav.tsx` | **Novo** - Nav inferior reutilizável |
| `src/components/LastCallBanner.tsx` | **Novo** - Banner de urgência |
| `src/i18n/translations.ts` | **Novo** - Traduções básicas |
| `src/App.tsx` | Novas rotas |
| `public/manifest.json` | **Novo** - PWA manifest |
| `index.html` | Meta tags PWA |
| `package.json` | Adicionar `qrcode.react` |

## Estimativa

Aproximadamente 15-20 arquivos modificados/criados. A implementação será focada em UI/UX completa e funcional com dados mock, preparada para integração com backend quando Supabase for conectado.

