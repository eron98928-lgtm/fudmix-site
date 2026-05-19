# FUD MIX — Site Institucional

Site institucional do **FUD MIX**, plataforma que conecta clientes a bares, restaurantes e estabelecimentos parceiros para receber qualquer comida no lugar onde já estão.

🌐 **Domínio:** [fudmix.com.br](https://fudmix.com.br)

---

## 🎯 Sobre o produto

O FUD MIX resolve um problema simples: você está num bar/estádio/parceiro e quer comer algo que o local não serve. Em vez de sair dali, o app:

1. **Ativa sua localização** e mostra todos os parceiros próximos no mapa.
2. **Confirma sua presença** no parceiro via cruzamento GPS + satélite e te conecta temporariamente ao local.
3. **Libera o cardápio dos restaurantes** que entregam ali. Você pede em PIX e recebe na mesa com QR code.

### Modelo de negócio
- **Cliente**: paga a comida + taxa de entrega.
- **Parceiro anfitrião** (bar/local): ganha R$ 5 por pedido recebido + 5% adicional acima de R$ 100. Mantém exclusividade nas bebidas.
- **Restaurante sender**: paga taxa por pedido, ganha alcance sem precisar de ponto físico no local.

---

## 🗺️ Rotas do site

| Rota                 | Página                                  |
| -------------------- | --------------------------------------- |
| `/`                  | Landing institucional                   |
| `/app`               | Entrada para a versão web do app        |
| `/login`             | Login (cliente e parceiro)              |
| `/cadastro/cliente`  | Cadastro de cliente                     |
| `/cadastro/parceiro` | Cadastro de parceiro (4 etapas, CNPJ)   |
| `/termos`            | Termos de uso                           |
| `/privacidade`       | Política de privacidade                 |
| `/sitemap.xml`       | Sitemap dinâmico                        |

---

## 🎨 Identidade visual

- **Paleta:** preto profundo (`#0a0a0a`) + dourado (`#E8B84B`)
- **Tipografia display:** Bebas Neue
- **Tipografia base:** Inter
- **Tom:** premium, escuro, alto contraste, com brilho dourado nos CTAs

Tokens definidos em `src/styles.css` (cores, gradientes, sombras com glow).

---

## 🧱 Stack técnica

- **Framework:** TanStack Start (React 19 + Vite 7, SSR)
- **Estilo:** Tailwind CSS v4 + design system semântico
- **Backend:** Lovable Cloud (Postgres, Auth, Storage, Realtime)
- **Validações externas:** BrasilAPI (CNPJ)
- **Deploy:** Lovable (Cloudflare Workers edge)

---

## 📁 Estrutura principal

```
src/
├── routes/              # Rotas file-based do TanStack Start
│   ├── __root.tsx       # Layout raiz + SEO global
│   ├── index.tsx        # Landing
│   ├── app.tsx
│   ├── login.tsx
│   ├── cadastro.cliente.tsx
│   ├── cadastro.parceiro.tsx
│   ├── termos.tsx
│   ├── privacidade.tsx
│   └── sitemap[.]xml.ts
├── components/
│   └── site/            # Header, Footer, SiteLayout
├── assets/              # Imagens (hero, etc.)
├── integrations/
│   └── supabase/        # Cliente Lovable Cloud (auto-gerado)
└── styles.css           # Design tokens
```

---

## 🚀 Como atualizar o site

1. Edite pelo chat do Lovable (preview ao vivo).
2. Clique em **Publish → Update** no canto superior direito.
3. As mudanças sobem instantaneamente no `fudmix.com.br`.

> Mudanças de **frontend** precisam do botão **Update**.
> Mudanças de **backend** (banco, funções) sobem automaticamente.

---

## 🔜 Próximos passos planejados

- [ ] Autenticação real (cliente + parceiro) integrada ao Lovable Cloud
- [ ] Dashboard do parceiro (pedidos, cardápio, status)
- [ ] App web: mapa com geolocalização + confirmação por satélite
- [ ] Cardápio, carrinho e checkout PIX
- [ ] QR code de confirmação de entrega
- [ ] Integração Mercado Pago

---

_Última atualização: maio/2026_
