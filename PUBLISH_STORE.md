# Publicação nas Lojas (Google Play / App Store)

Este projeto é um PWA (React + Vite). Para publicar como app nativo, empacote com **Bubblewrap** (Android/TWA) e **PWABuilder** (iOS).

## 1. Pré-requisitos do PWA
- [x] `manifest.webmanifest` com `name`, `short_name`, `theme_color`, `background_color`, `display: standalone`, `shortcuts`, `categories`
- [x] Service Worker registrado (`src/pwa/registerSW.ts`)
- [x] Ícones 192x192 e 512x512 (`public/`)
- [ ] Screenshots (mobile 750x1334 e tablet 1200x1600) em `public/screenshots/`
- [ ] Splash screen (gerada automaticamente pelo TWA a partir do `theme_color`)

## 2. Google Play (Android TWA — Bubblewrap)

```bash
npm i -g @bubblewrap/cli
bubblewrap init --manifest=https://appsbpm.lovable.app/manifest.webmanifest
bubblewrap build
```

Gere um AAB assinado (`app-release-bundle.aab`) e envie pelo Play Console:
- Categoria: **Saúde e fitness** ou **Estilo de vida**
- Classificação: Livre
- Configurar **Digital Asset Links** (o Bubblewrap gera `assetlinks.json` — publicar em `/.well-known/assetlinks.json`)

## 3. App Store (iOS — PWABuilder)
1. Acesse https://www.pwabuilder.com/ e informe a URL publicada.
2. Baixe o pacote iOS.
3. Abra o projeto no Xcode, ajuste `Bundle Identifier`, `Team` e ícones.
4. Envie via Xcode → Archive → Distribute App.

Requisitos Apple:
- Conta Apple Developer (US$ 99/ano)
- Ícone 1024x1024
- Screenshots 6.7" (iPhone 15 Pro Max) e 12.9" (iPad Pro)
- Política de privacidade pública (já disponível em `/privacidade`)

## 4. Fichas das lojas
- **Nome:** SBPM Bahia
- **Descrição curta:** Portal do associado — carteirinha digital, limites, parceiros e mais.
- **Palavras-chave:** sbpm, polícia militar, bahia, associado, carteirinha
- **Suporte:** contato@sbpmbahia.com.br

## 5. Checklist pré-envio
- [ ] Testar login titular e dependente
- [ ] Testar modo offline
- [ ] Verificar notificações push
- [ ] Validar acessibilidade (WCAG AA)
- [ ] Revisar Termos e Política de Privacidade
