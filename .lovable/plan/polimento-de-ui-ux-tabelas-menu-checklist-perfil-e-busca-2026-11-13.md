# Polimento de UI/UX: tabelas, menu, checklist, perfil e busca

## 1. Tabelas com o mesmo alinhamento de Abastecimentos
- Checklist, Documentos, Multas, Usuários, Motoristas, Saídas e Retornos e Manutenções passam a usar as mesmas larguras de coluna, alinhamento e espaçamento interno da tabela de Abastecimentos.

## 2. Submenu "Veículos e Operações"
- Seta logo depois do texto, longe da margem direita.
- Abertura e fechamento com animação suave (cerca de 0,3s).
- Linha vertical fina à esquerda dos itens filhos, indicando que pertencem ao grupo.

## 3. Checklist do motorista empilhado
- Uma coluna só: "Checklist Diário" no topo em largura total e "Registro de Viagem" (Saída/Retorno) logo abaixo, também em largura total.
- Mantidos os botões Saída/Retorno com a trava (o que não se aplica fica acinzentado) e o único botão Salvar no final.

## 4. CPF e CNH só para Motorista
- Em "Meu perfil" e em Configurações > Perfil, CPF, Número, Categoria e Validade da CNH aparecem apenas para Motorista.
- Administrador e Gestor não veem esses campos.

## 5. Cartões de resumo no topo (padrão de Veículos)
- **Abastecimentos:** Total de abastecimentos, Litros no mês, Valor total, Consumo acima da média.
- **Multas:** Total, Pendentes, Valor total, Recorridas.
- **Motoristas:** Total, Ativos, Em viagem, CNHs a vencer.
- **Saídas e Retornos:** Total de viagens, Em rota, Concluídas, Km rodados.
- **Manutenções:** Total, Agendadas, Em andamento, Concluídas.
- Os números saem dos dados de demonstração, então mudam junto quando você cadastra ou exclui algo.

## 6. Relatórios no fim do menu
- Ordem: Início, Veículos e Operações, Usuários, Motoristas, Saídas e Retornos, Manutenções, Checklist, **Relatórios**, depois Configurações e Ajuda.

## 7. Busca global
- Pesquisar uma placa (Enter ou clique na sugestão) abre Veículos já filtrado por ela, na página 1, mostrando o veículo na hora.
- O mesmo vale para usuários na tela Usuários (apenas Administrador).

## Detalhes técnicos
- Tabelas: classes de coluna compartilhadas em `styles.css` copiadas do padrão de `.data-table` de Abastecimentos, aplicadas em `DataTable` (`crud.tsx`) e nas tabelas de `pages-team.tsx`/`listings.tsx`.
- Submenu: wrapper sempre renderizado com `grid-template-rows 0fr→1fr` + transição; chevron sem `margin-left:auto`; `border-left` com token de borda da sidebar.
- Checklist: grid de uma coluna no layout do `driver.tsx`.
- Perfil: condição `role === 'Motorista'` no modal do `shell.tsx` e em `SettingsPage`.
- Cartões: reutilizar `Stat` de `listings.tsx`; contadores em funções puras de `ops.ts` com testes vitest.
- Menu: reordenar `restItems` no `shell.tsx`; atualizar a regra de ordem na memória do projeto.
- Busca: `validateSearch` com `search` (fallback "") em `/veiculos` e `/usuarios`; `Listings` lê o parâmetro e reinicia a página.
