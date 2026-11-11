# Ajustes de escopo e novo Checklist do Motorista

## 1. Limpeza de escopo
- **Oficinas removidas:** sai a seção "Empresas Parceiras/Oficinas" de Configurações (Admin e Gestor). Configurações fica com Perfil (todos) e Parâmetros de Alertas (só Admin). Em Manutenções, a coluna "Oficina", o campo do formulário e a busca por oficina deixam de existir. O relatório "Custos de Manutenção" passa a agrupar só por veículo.
- **Abastecimentos:** hoje não existe campo nem cálculo de "Preço Médio" (R$/L) em tabela, cards ou formulário — vou conferir de novo e garantir que nada assim apareça. Ficam Litros, Valor Total e Consumo Médio (km/l).
- **Relatórios – Gerar PDF:** o botão já existe, mas abre uma janela de impressão que o navegador costuma bloquear. Passa a baixar direto um arquivo PDF de demonstração (título, filtros, tabela e totais), sem depender de pop-up.

## 2. Motorista no layout de computador
- Mesmo menu lateral e barra superior dos outros perfis; o menu mostra **apenas "Checklist"**. Sem Início, sem pesquisa geral de módulos, sem notificações da frota.
- Ao entrar, o motorista vai direto para Checklist; qualquer outro endereço o leva de volta para lá. A tela de celular atual com 4 botões é removida.

## 3. Tela Checklist do Motorista (2 colunas, 50/50; empilha em telas estreitas)

```text
+------------------------------+------------------------------+
| Checklist Diário             | [ Registrar Saída | Retorno ]|
| Para-brisa   Bom|Avaria|Ruim | Saída:  Veículo, Destino,    |
| Lanternas    Bom|Avaria|Ruim |         Odômetro de saída    |
| Faróis       ...             | Retorno: viagem em aberto    |
| Luzes de freio ...           |         (automática),        |
| Luzes de ré  ...             |         Odômetro de entrada  |
| Condição dos pneus ...       |                              |
| Condições do óleo ...        |              [ Salvar ]      |
+------------------------------+------------------------------+
```
- Os 7 itens são obrigatórios (sem resposta, aparece erro no item).
- **Saída:** cria a viagem "Em Rota", marca o veículo "Em uso" e grava o checklist como "Saída".
- **Retorno:** usa a viagem em aberto do motorista; o odômetro de entrada deve ser maior que o de saída. Encerra a viagem, devolve o veículo para "Disponível" e grava o checklist como "Retorno". Se não houver viagem em aberto, a opção Retorno fica desativada com aviso.
- Um único botão **Salvar** envia os dois painéis juntos; se qualquer parte for inválida, nada é gravado. Após salvar, sem editar ou excluir.

## 4. Admin e Gestor intactos
- "Checklist" e "Saídas e Retornos" continuam como telas e tabelas separadas. O que o motorista envia aparece nelas normalmente.
- No "Ver detalhes" do checklist, cada item passa a mostrar Bom / Com Avaria / Ruim. Status: tudo Bom = Aprovado; algum Ruim = Reprovado; senão Com Avarias. Os checklists de demonstração e o formulário do Admin passam a usar os mesmos 7 itens.

## Detalhes técnicos
- `access.ts`: Motorista só acessa `/checklist`; `homeFor('Motorista') = '/checklist'`; `settingsSections` sem `oficinas`. Remover rota `/motorista` e `DriverDashboard`.
- `shell.tsx`: remover o desvio para `DriverDashboard`; menu filtrado por `canAccess` (grupo "Veículos e Operações" oculto se vazio); `ChecklistPage` renderiza `DriverChecklist` quando o perfil é Motorista.
- `ops.ts`: `checklistItems` com os 7 itens novos; itens como `Record<item, 'Bom'|'Com Avaria'|'Ruim'>`; novo `checklistStatus`; `driverSubmissionSchema` (zod, união discriminada saída/retorno) + função pura `buildDriverSubmission` que devolve `{trip, checklist}` ou erro, usada no submit único. Remover `Shop`, `shopSchema`, `initialShops`, `shops` do store e `shop` de `Maintenance`.
- PDF gerado no cliente com `jspdf` + `jspdf-autotable`.
- Testes: atualizar `frota-access` e `frota-ops` (novo status, odômetro de retorno ≤ saída rejeitado, motorista só em /checklist, sem seção oficinas).
- Atualizar regra de acesso em AGENTS.md e a memória de fidelidade.
