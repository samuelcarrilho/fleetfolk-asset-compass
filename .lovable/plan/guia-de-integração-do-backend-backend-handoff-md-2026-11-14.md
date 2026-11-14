# Guia de integração do backend (BACKEND_HANDOFF.md)

Criar um único arquivo novo, `BACKEND_HANDOFF.md`, na raiz do projeto. Nenhum outro arquivo será alterado.

## Conteúdo (5 seções obrigatórias)
1. **Stack e Arquitetura** — TanStack Start/Router, React 19, Vite, Tailwind v4, shadcn, Zod, jspdf; estado em `FleetProvider` (store.tsx); estrutura de `src/features/frota` e `src/routes`.
2. **Dicionário de Dados** — extraído de `data.ts`, `ops.ts` e `store.tsx`: Usuários/Perfis, Veículos, Viagens, Checklists, Abastecimentos, Manutenções, Multas, Documentos, Dados de CNH e Parâmetros de Alertas. Campos, tipos, obrigatoriedade e enums (status, `purposes`, `conditions`, papéis), mais a regra de CPF/CNH por perfil.
3. **Pontos de Injeção de API** — tabela por funcionalidade: arquivo/função atual, endpoint REST sugerido, payload e retorno, com query params (`?search=`, filtros, paginação).
4. **Regras de Negócio (Parity Check)** — máquina de estado `openTrip`, proibição de cancelamento pelo Motorista, `purpose` obrigatório, `notes` obrigatório (até 500) com avaria, só veículos "Disponível" fora de rota, odômetro de retorno maior que o de saída, cálculo de status do checklist.
5. **Autenticação e RBAC** — fluxo atual de `signIn`/sessionStorage e onde ligar JWT/sessão real; matriz completa de `routeAccess`, `can`, `settingsSections` e `profileDocumentFields`.

## Detalhes técnicos
- Antes de escrever, ler `data.ts`, `access.ts`, `crud.tsx`, `listings.tsx`, `driver.tsx`, `shell.tsx`, `pages-*.tsx` para copiar os tipos e regras exatamente como estão.
- Documento em pt-BR, só markdown.
