# FROTATech — Guia de Integração do Backend

> Estado atual: todo dado vive **em memória no navegador** (demonstração). Nada é persistido ao recarregar, exceto a sessão simulada em `sessionStorage`. Este documento descreve o que o backend precisa fornecer para substituir os mocks sem mudar o comportamento validado.

---

## 1. Stack e Arquitetura do Frontend

| Item | Tecnologia |
|---|---|
| Framework | TanStack Start v1 (React 19, SSR) + Vite 7 |
| Roteador | TanStack Router (rotas por arquivo em `src/routes/`) |
| Estilo | Tailwind CSS v4 (`src/styles.css`) + componentes shadcn/ui (`src/components/ui`) |
| Estado | React Context `FleetProvider` / hook `useFleet()` em `src/features/frota/store.tsx` |
| Validação | Zod (`data.ts`, `ops.ts`) — os mesmos schemas devem ser replicados no backend |
| Relatórios | `jspdf` + `jspdf-autotable` (PDF), CSV via `toCsv()` (Excel) |
| Testes | Vitest (`src/test/`) |

```text
src/
  routes/                 uma rota por item de menu (/, /veiculos, /usuarios, /motoristas,
                          /saidas-retornos, /abastecimentos, /manutencoes, /documentos,
                          /multas, /relatorios, /checklist, /configuracoes, /ajuda, /entrar)
  features/frota/
    store.tsx             FleetProvider: estado, CRUD genérico, sessão
    data.ts               Usuários e Veículos: schemas, enums, seeds
    ops.ts                Demais entidades: schemas, enums, regras puras, seeds, resumos
    access.ts             RBAC (routeAccess, can, settingsSections, profileDocumentFields)
    shell.tsx             Sidebar, topbar, busca global, guarda de rota, modal "Meu perfil"
    listings.tsx / ui.tsx Telas e formulários de Usuários e Veículos
    crud.tsx              DataTable e RecordDialog genéricos
    pages-ops.tsx         Abastecimentos, Documentos, Multas
    pages-team.tsx        Motoristas, Saídas e Retornos, Manutenções, Checklist (Admin/Gestor)
    pages-system.tsx      Relatórios, Configurações, Ajuda
    driver.tsx            Login de demonstração e Checklist + Viagem do Motorista
    home.tsx              Início (indicadores e ações rápidas)
```

---

## 2. Dicionário de Dados

Convenções: todo registro tem `id: string` (hoje UUID/strings como `u0`, `v3`). Datas `YYYY-MM-DD`; data-hora `YYYY-MM-DDTHH:mm` (hora local, sem fuso — o backend deve definir o fuso, sugerido `America/Fortaleza`). Valores monetários em reais (number).

### 2.1 Usuário (`User` — `data.ts`)
| Campo | Tipo | Obrig. | Regras |
|---|---|---|---|
| id | string | sim | |
| name | string | sim | 3–100 caracteres |
| cpf | string | sim | `000.000.000-00` |
| email | string | sim | e-mail válido, ≤255 (único — usado para login) |
| phone | string | sim | 10–20 caracteres |
| profile | enum | sim | `Administrador` \| `Gestor da Frota` \| `Motorista` |
| status | enum | sim | `Ativo` \| `Inativo` |

### 2.2 Dados de CNH do Motorista (`DriverInfo` — `ops.ts`)
Relação 1:1 com `User` (mesmo `id`), só para `profile = Motorista`.
| Campo | Tipo | Obrig. | Regras |
|---|---|---|---|
| id | string | sim | = id do usuário |
| cnh | string | sim | exatamente 11 dígitos |
| category | enum | sim | `A` \| `B` \| `AB` \| `C` \| `D` \| `E` |
| validity | date | sim | alerta: `Vencida` / `Vence em breve` (≤ `settings.cnhDays`) / `Válida` |

**CPF/CNH por perfil (`profileDocumentFields`)**: Admin e Gestor exibem apenas `cpf`; Motorista exibe `cpf`, `cnh`, `category`, `validity`. Valores de CNH para Admin/Gestor no front são fictícios (`profileAudit` em `store.tsx`) — o backend não precisa armazená-los.

### 2.3 Veículo (`Vehicle` — `data.ts`)
| Campo | Tipo | Obrig. | Regras |
|---|---|---|---|
| id | string | sim | |
| plate | string | sim | maiúsculas, `ABC-1234` ou Mercosul `ABC1D23` (`/^[A-Z]{3}-?[0-9][A-Z0-9][0-9]{2}$/`) |
| brand / model | string | sim | 2–60 |
| year | int | sim | 1950–2027 |
| fuel | enum | sim | `Flex` \| `Diesel` \| `Gasolina` \| `Elétrico` |
| km | number | sim | 0–10.000.000 |
| status | enum | sim | `Disponível` \| `Em uso` \| `Em manutenção` \| `Indisponível` |
| image | number | sim | índice de imagem de demonstração (0–7) — substituir por `imageUrl` |

### 2.4 Viagem — Saídas e Retornos (`Trip` — `ops.ts`)
| Campo | Tipo | Obrig. | Regras |
|---|---|---|---|
| id | string | sim | |
| vehicle | string (FK veículo) | sim | |
| driver | string | sim | **hoje é o nome do motorista**; no banco usar FK `driver_id` |
| destination | string | sim | 2–100 |
| purpose | string | sim | motorista: enum `purposes` = `Entrega de materiais` \| `Visita técnica` \| `Reunião com cliente` \| `Coleta` \| `Rotina de Motorista`; Admin/Gestor: texto livre 2–100 |
| departureAt | datetime | sim | |
| departureKm | number | sim | ≥0 |
| returnAt | datetime | não | > departureAt |
| returnKm | number | não | > departureKm |
| status | enum | sim | `Em Rota` \| `Concluída` |

### 2.5 Checklist (`Checklist` — `ops.ts`)
| Campo | Tipo | Obrig. | Regras |
|---|---|---|---|
| id | string | sim | quando criado pelo motorista: `${tripId}-c` (sugestão: FK `trip_id`) |
| date | date | sim | |
| driver | string | sim | nome (usar FK) |
| vehicle | string (FK) | sim | |
| type | enum | sim | `Saída` \| `Retorno` |
| items | objeto | sim | chaves `Para-brisa`, `Lanternas`, `Faróis`, `Luzes de freio`, `Luzes de ré`, `Condição dos pneus`, `Condições do óleo`; valores `Bom` \| `Com Avaria` \| `Ruim` (todos obrigatórios) |
| notes | string | condicional | ≤500 (motorista); obrigatório com avaria (ver §4) |
| status | enum | sim | **calculado**: `Aprovado` \| `Com Avarias` \| `Reprovado` |

### 2.6 Abastecimento (`Fuel`)
`date` (date), `vehicle` (FK), `driver` (string), `station` (2–100), `fuel` (`Flex`\|`Diesel`\|`Gasolina`\|`Etanol`\|`Elétrico`), `liters` (>0), `total` (>0), `kmPerL` (>0, ≤100). Todos obrigatórios. Destaque: vermelho se `kmPerL < média da frota × 0,9`.

### 2.7 Manutenção (`Maintenance`)
`kind` (`Preventiva`\|`Corretiva`), `vehicle` (FK), `date`, `cost` (≥0), `next` (texto ≤60, opcional/vazio — data ou km), `status` (`Agendada`\|`Em Andamento`\|`Concluída`).

### 2.8 Multa (`Fine`)
`date`, `vehicle` (FK), `driver`, `description` (2–200), `amount` (>0), `status` (`Pendente`\|`Paga`\|`Recorrida`).

### 2.9 Documento (`Doc`)
`vehicle` (FK), `type` (`IPVA`\|`Licenciamento`\|`Seguro`), `due` (date), `payment` (`Pago`\|`Pendente`). Situação calculada: `Vencido` / `Próximo do vencimento` (≤ `settings.docDays`) / `Em dia`.

### 2.10 Parâmetros de Alertas (`Settings`) — registro único
`cnhDays` (int 1–365, padrão 30), `docDays` (int 1–365, padrão 30).

### 2.11 Perfil do usuário logado (`Admin` — `store.tsx`)
`name`, `email`, `phone` — espelho editável do próprio `User`.

---

## 3. Pontos de Injeção de API

Hoje todas as leituras vêm de `useFleet()` (`users`, `vehicles`, `data.<coleção>`, `settings`, `admin`) e os seeds estão em `data.ts` (`initialUsers`, `initialVehicles`) e `ops.ts` (`initial*`, `defaultSettings`). Busca, filtros e paginação são feitos no cliente (`matches()` em `data.ts`, filtros em `listings.tsx`/`crud.tsx`). Recomendação: substituir as funções do `store.tsx` por chamadas à API (ex.: TanStack Query) mantendo as mesmas assinaturas.

Parâmetros de listagem comuns: `?search=&page=&pageSize=` + filtros específicos. Retorno de listas: `{ items: T[], total: number }`.

| Funcionalidade | Arquivo / Função atual | Endpoint sugerido | Payload | Retorno |
|---|---|---|---|---|
| Login | `driver.tsx` `SignInPage` → `store.signIn(u)` | `POST /auth/login` | `{ email, password }` | `{ token, user }` |
| Sessão atual | `store.tsx` efeito que lê `sessionStorage` | `GET /auth/me` | — | `User` (+ `DriverInfo` se Motorista) |
| Logout | `store.signOut` | `POST /auth/logout` | — | 204 |
| Listar usuários | `listings.tsx` (`fleet.users` + `matches`) | `GET /users?search=&profile=&status=&page=` | — | lista `User` |
| Criar/editar usuário | `ui.tsx` → `store.saveUser` | `POST /users`, `PUT /users/:id` | `User` sem id | `User` |
| Excluir usuário | `store.removeUser` | `DELETE /users/:id` | — | 204 |
| Listar veículos / busca global por placa | `listings.tsx`, `shell.tsx` | `GET /vehicles?search=&status=&page=` | — | lista `Vehicle` |
| Criar/editar veículo | `ui.tsx` → `store.saveVehicle` | `POST /vehicles`, `PUT /vehicles/:id` | `Vehicle` sem id | `Vehicle` |
| Excluir veículo | `store.removeVehicle` | `DELETE /vehicles/:id` | — | 204 |
| Veículos para saída (motorista) | `driver.tsx` `available` | `GET /vehicles?available=true` | — | `Vehicle[]` com status `Disponível` e sem viagem `Em Rota` |
| Indicadores de frota | `data.ts` `fleetCounts` | `GET /vehicles/summary` | — | `{ total, available, maintenance, unavailable }` |
| Motoristas (lista) | `pages-team.tsx` (users + driverInfo) | `GET /drivers?search=&status=` | — | `User & DriverInfo` |
| Criar/editar motorista | `pages-team.tsx` → `saveUser` + `saveRecord('driverInfo')` | `POST /drivers`, `PUT /drivers/:id` | dados de `User` + `cnh, category, validity` | motorista |
| Ativar/desativar / excluir motorista | `pages-team.tsx` menu, `removeUser`+`removeRecord('driverInfo')` | `PATCH /drivers/:id {status}`, `DELETE /drivers/:id` | | |
| Viagens (lista) | `pages-team.tsx` `data.trips` | `GET /trips?search=&status=&driverId=&vehicleId=` | — | lista `Trip` |
| Saída (Admin/Gestor) | `pages-team.tsx` → `saveRecord('trips')` + veículo `Em uso` | `POST /trips` | `vehicleId, driverId, destination, purpose, departureAt, departureKm` | `Trip` |
| Retorno (Admin/Gestor) | `pages-team.tsx` → `closeTrip` | `POST /trips/:id/return` | `{ returnAt, returnKm }` | `Trip` concluída |
| Editar/excluir viagem (staff) | `pages-team.tsx` `onEdit`/`removeRecord('trips')` | `PUT /trips/:id`, `DELETE /trips/:id` | | |
| **Saída/Retorno + checklist do motorista** | `driver.tsx` `DriverChecklist.submit` → `ops.buildDriverSubmission` | `POST /driver/submissions` (transação única) | `{ mode, items, notes?, vehicleId?, destination?, purpose?, departureKm?, returnKm? }` | `{ trip, checklist }` ou `422 { errors: Record<campo,msg> }` |
| Viagem em aberto do motorista | `driver.tsx` `openTrip` | `GET /driver/open-trip` | — | `Trip \| null` |
| Checklists (lista/detalhe) | `pages-team.tsx` `data.checklists` | `GET /checklists?search=&status=&type=`, `GET /checklists/:id` | | `Checklist` |
| Checklist manual / excluir (staff) | `pages-team.tsx` `RecordDialog`, `removeRecord` | `POST /checklists`, `DELETE /checklists/:id` | | |
| Resumo checklists | `ops.checklistSummary` | `GET /checklists/summary` | | `{ total, approved, damaged, rejected }` |
| Abastecimentos | `pages-ops.tsx` | `GET/POST /fuel`, `PUT/DELETE /fuel/:id` (`?search=&month=&driverId=&vehicleId=`) | `Fuel` | |
| Resumo abastecimentos | `ops.fuelSummary` | `GET /fuel/summary?month=` | | `{ total, litersMonth, spent, high }` |
| Documentos | `pages-ops.tsx` | `GET/POST /documents`, `PUT/DELETE /documents/:id`, `PATCH /documents/:id {payment}` | `Doc` | |
| Multas | `pages-ops.tsx` | `GET/POST /fines?driverId=&vehicleId=&status=`, `PUT/DELETE /fines/:id`, `PATCH /fines/:id {status}` | `Fine` | |
| Manutenções | `pages-team.tsx` | `GET/POST /maintenance?kind=`, `PUT/DELETE /maintenance/:id`, `PATCH .../:id {status}` | `Maintenance` | |
| Relatório de abastecimento | `pages-system.tsx` + `ops.monthlyFuelReport`/`toCsv` | `GET /reports/fuel?month=&driverId=&vehicleId=&format=json\|csv\|pdf` | | linhas `Fuel[]` ou arquivo |
| Parâmetros de alertas | `store.setSettings` | `GET /settings`, `PUT /settings` | `Settings` | `Settings` |
| Meu perfil | `store.setAdmin`, `profileAudit` | `GET /me/profile`, `PUT /me/profile` | `{ name, email, phone }` | perfil + documentos permitidos |
| Pesquisa global | `shell.tsx` | `GET /search?q=` (ou reutilizar `/vehicles?search=`) | | sugestões |

---

## 4. Regras de Negócio (Parity Check)

O backend **deve** reaplicar estas regras — o front é apenas uma barreira de UX.

### 4.1 Máquina de estado de viagens (`openTrip`)
```text
[sem viagem] --saida--> [Em Rota] --retorno--> [Concluída] (=> volta a "sem viagem")
```
- Um motorista tem no máximo **uma** viagem `Em Rota` (sugestão: índice único parcial `driver_id WHERE status='Em Rota'`).
- `mode = saida` com viagem aberta → erro `"Você já tem uma viagem em aberto. Registre o retorno."`.
- `mode = retorno` sem viagem aberta → erro `"Você não tem viagem em aberto."`. O retorno usa **sempre** a viagem aberta do próprio motorista (o cliente não escolhe o id).
- O modo é derivado do estado no servidor, não da escolha do usuário.
- Retorno: `returnKm > departureKm` e `returnAt > departureAt`; viagem já concluída não pode ser fechada de novo (`closeTrip`).
- Efeitos colaterais na mesma transação: saída → veículo `Em uso`; retorno → veículo `Disponível` e `km = max(km, returnKm)`.
- **Motorista não pode cancelar, editar nem excluir** viagens ou checklists (`can('Motorista', 'update'|'delete', ...) = false`). `PUT`/`DELETE` em `/trips` e `/checklists` devem retornar 403 para esse papel. Admin/Gestor podem.

### 4.2 Checklist e envio do motorista (`buildDriverSubmission`)
- Os 7 itens são obrigatórios, cada um `Bom` | `Com Avaria` | `Ruim`.
- Saída: `vehicle`, `destination` (≥2), `purpose` ∈ `purposes`, `departureKm` ≥ 0 obrigatórios.
- Se **qualquer** item ≠ `Bom`: `notes` obrigatório (≥3 caracteres após trim, ≤500). Se todos `Bom`: `notes` é descartado (`''`).
- Status calculado no servidor: algum `Ruim` → `Reprovado`; todos `Bom` → `Aprovado`; senão `Com Avarias`.
- Viagem + checklist são gravados juntos (tudo ou nada). `checklist.type` = `Saída` ou `Retorno` conforme o modo; `date` = data do envio; `driver` = usuário autenticado (nunca vindo do payload).

### 4.3 Alocação de frota
- Só veículos com `status = 'Disponível'` **e** sem viagem `Em Rota` podem iniciar saída (front: `available` em `driver.tsx`; rejeita com `"Veículo indisponível para saída."`). Proteger contra corrida com lock/transação.

### 4.4 Outras regras derivadas
- Alerta de CNH (`cnhAlert`) e vencimento de documentos (`dueStatus`) usam `settings.cnhDays`/`docDays`.
- Consumo alto: `kmPerL < fleetAverage × 0,9`.
- Indicador "disponíveis" do Início (`fleetCounts`) conta `Disponível` + `Em uso`.

---

## 5. Autenticação e RBAC

### 5.1 Fluxo atual (simulado)
- `/entrar` lista 3 contas de demonstração (João Silva/Administrador, Mariana Lima/Gestor da Frota, Pedro Santos/Motorista); **não há senha**.
- `store.signIn(u)` grava `{ userId, role, name, email, phone }` em `sessionStorage['frota-session']`; `signOut` remove. `ready` indica que a sessão foi lida.
- `shell.tsx` redireciona para `/entrar` sem sessão, e para `homeFor(role)` (`/` staff, `/checklist` motorista) se `canAccess(role, path)` falhar.
- **Ponto de conexão:** trocar `signIn`/`signOut` e a leitura inicial em `store.tsx` por chamadas a `/auth/login`, `/auth/me`, `/auth/logout` (JWT em cookie httpOnly ou header `Authorization`). O papel deve vir do servidor (tabela de papéis), nunca do cliente.

### 5.2 Rotas (`routeAccess`)
| Rota | Administrador | Gestor da Frota | Motorista |
|---|:-:|:-:|:-:|
| `/` Início | ✔ | ✔ | |
| `/usuarios` | ✔ | | |
| `/motoristas`, `/veiculos`, `/abastecimentos`, `/documentos`, `/multas`, `/saidas-retornos`, `/manutencoes`, `/relatorios`, `/ajuda` | ✔ | ✔ | |
| `/checklist` | ✔ (tabela) | ✔ (tabela) | ✔ (formulário combinado) |
| `/configuracoes` | ✔ | ✔ | ✔ (só Perfil, leitura) |

### 5.3 Ações (`can(role, action, module)`)
| Papel | Regra |
|---|---|
| Administrador | tudo permitido |
| Gestor da Frota | tudo, exceto módulos `usuarios` e `alertas` |
| Motorista | apenas `create` em `saidas-retornos` e `checklist`; `read` em `perfil`; nada mais (sem update/delete) |

### 5.4 Configurações e perfil
- `settingsSections`: Admin → `perfil`, `alertas`; Gestor → `perfil`; Motorista → `perfil`.
- Editar perfil (`can(role,'update','perfil')`): Admin e Gestor editam `name`, `email`, `phone`; CPF exibido somente leitura. Motorista: todos os campos somente leitura, sem "Salvar perfil" → `PUT /me/profile` deve retornar 403.
- Documentos visíveis (`profileDocumentFields`): Admin/Gestor → `cpf`; Motorista → `cpf`, `cnh`, `category`, `validity`.

### 5.5 Isolamento de dados
- Motorista só lê/grava os próprios registros (viagem aberta, envios). Filtrar no servidor por `driver_id` do token.
- Veículos visíveis ao motorista: somente os disponíveis para saída e o da viagem em aberto.
