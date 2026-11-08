# Perfis Gestor da Frota e Motorista (acesso simulado)

## O que muda para o usuário
- **Tela de entrada simulada** (`/entrar`): escolha de perfil — Administrador (João Silva), Gestor da Frota (Mariana Lima) ou Motorista (Pedro Santos). "Sair" no menu do perfil volta para essa tela. Aviso visível: modo de demonstração, sem autenticação real.
- **Administrador:** tudo como hoje.
- **Gestor da Frota:**
  - Mesmo menu e mesmo visual, sem "Usuários" no menu e sem resultados de usuários na pesquisa global.
  - Pode criar, editar e excluir em Motoristas, Veículos, Abastecimentos, Documentos, Multas, Saídas e Retornos, Manutenções, Checklist e Relatórios.
  - Configurações: só "Perfil" (o dele) e "Empresas Parceiras/Oficinas"; "Parâmetros de Alertas" fica oculto.
  - Se abrir `/usuarios` direto pelo endereço, volta para o Início.
- **Motorista:**
  - Não tem menu lateral. Painel próprio, pensado para celular (`/motorista`), com quatro cartões grandes: Registrar Saída, Checklist Diário, Registrar Abastecimento, Registrar Retorno.
  - Cada cartão abre só o formulário de registro, com os campos e validações que já existem. Ao salvar, aparece uma confirmação e nenhum botão de editar ou excluir.
  - Para escolher o veículo nos formulários, aparece só a lista mínima de placas disponíveis (Saída) ou em uso por ele (Retorno), não a lista geral de veículos. Ele não tem perfil nem alertas.
  - Se tentar abrir qualquer outro endereço (ex.: `/usuarios`, `/veiculos`), volta para `/motorista`.

## Detalhes técnicos
- `src/features/frota/access.ts`: o tipo `Role`, uma tabela `routeAccess` (rota → perfis permitidos), `homeFor(role)`, `can(role, action, module)` e `settingsSections(role)`.
- O store guarda `session: { userId, role } | null` em sessionStorage (lido em useEffect para não quebrar a hidratação), e expõe `signIn` e `signOut`. `admin` passa a ser o usuário da sessão.
- Shell: sem sessão, mostra só `/entrar`. Com o perfil Motorista, mostra o layout `DriverShell` (topo simples + Sair, sem sidebar). O menu é filtrado por `routeAccess`, e o nome/perfil vêm da sessão.
- Guarda: um efeito no shell redireciona logo, com `navigate({replace:true})`, para `homeFor(role)` quando a rota não é permitida. O conteúdo não é renderizado enquanto não for permitido, para não piscar na tela. Os botões de editar/excluir (RecordActions, listings, CRUD) checam `can()`.
- Configurações: as abas são filtradas por `settingsSections`. O Gestor edita o próprio registro.
- Novas rotas: `src/routes/entrar.tsx` e `src/routes/motorista.tsx`, cada uma com seu head().
- Testes vitest em `src/test/frota-access.test.ts`:
  - Motorista → `/motorista`, e `/usuarios` é bloqueado.
  - Gestor bloqueado em `/usuarios`, sem "Parâmetros de Alertas" e com permissão de criar/editar/excluir veículos.
  - Motorista sem permissão de editar/excluir.
- Verificação no navegador com Playwright para os três perfis, incluindo o acesso direto por URL.
- AGENTS.md: registrar a regra de que o acesso é decidido pela tabela única de acesso.

## Limitação
O controle de acesso só existe no navegador, sobre dados de demonstração, e não protege nada de verdade. Para isso, é preciso ativar o Lovable Cloud com login real e permissões guardadas no servidor. Isso pode ser feito numa etapa seguinte.
