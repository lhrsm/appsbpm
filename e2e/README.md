# Testes E2E — Playwright

## Rodar localmente

```bash
npm i -D @playwright/test
npx playwright install --with-deps chromium
npm run dev &            # sobe em http://localhost:8080
npx playwright test
```

## CI

```bash
E2E_BASE_URL=https://appsbpm.lovable.app npx playwright test
```

Cobertura mínima: login (matrícula demo `123456`), acesso ao Dashboard, página pública
de Privacidade e presença do manifest PWA. Expandir por fluxo crítico à medida que a
integração com a API real for concluída.
