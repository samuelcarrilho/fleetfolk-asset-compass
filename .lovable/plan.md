# Refinamentos de UI/UX e lógica (SDD)

## 1. Menu lateral
- Nova ordem: Início, Veículos e Operações (Veículos, Abastecimentos, Documentos, Multas), Usuários, Motoristas, Saídas e Retornos, Manutenções, Checklist, **Relatórios**, Configurações, Ajuda.
- Seta do grupo afastada da borda direita.
- Abertura/fechamento do grupo com animação suave (~0,3s).
- Itens filhos com recuo maior e linha fina à esquerda, mostrando que pertencem ao grupo.

## 2. Pesquisa global
- Ao apertar Enter, abre Veículos já filtrado pelo texto (endereço com `?search=...`), voltando para a página 1.
- Se o texto for exatamente uma placa existente, abre direto a janela de detalhes/edição daquele veículo.
- As sugestões da lista suspensa também passam a abrir a tabela filtrada (veículo ou usuário), não a tela genérica.

## 3. Rodapé das tabelas
- Um único rodapé de paginação para todas as telas: "Mostrando X a Y de Z" à esquerda, controles de página à direita.
- Aplicado em Checklist, Veículos, Documentos, Multas, Usuários, Motoristas, Saídas e Retornos e Manutenções.

## 4. Cartões de resumo (mesmo padrão de Veículos), calculados dos dados
- **Motoristas:** Total, Ativos, Em Viagem, CNHs Próximas do Vencimento (usa os dias de aviso de Configurações).
- **Manutenções:** Total no Mês, Em Andamento, Concluídas.
- **Saídas e Retornos:** Veículos em Rota, Retornos Pendentes, Concluídas.
- **Multas:** Pendentes, Valor Total, Recorridas.
- Clicar num cartão aplica o filtro correspondente na tabela, como em Veículos.

## 5. Checklist do motorista
- Linha de cima: Checklist Diário em largura total.
- Linha de baixo: duas colunas iguais — Saída à esquerda, Retorno à direita.
- A trava continua: só o formulário que se aplica fica ativo; o outro aparece acinzentado e bloqueado. Continua um único botão Salvar no final.
- Em celular, as colunas ficam uma embaixo da outra.

## 6. Meu Perfil
- Número, Categoria e Validade da CNH aparecem só para Motorista (em "Meu perfil" e em Configurações > Perfil).
- Administrador e Gestor veem dados pessoais até o CPF.

## Detalhes técnicos
- `shell.tsx`: reordenar `restItems`; grupo renderizado sempre com wrapper `grid-template-rows 0fr→1fr` (ou max-height) e transição; classes CSS em `styles.css`.
- `/veiculos` e `/usuarios`: `validateSearch` com `search` (fallback ""); `Listings` inicializa/sincroniza a busca a partir do parâmetro; placa exata abre `RecordForm` do registro.
- `Pagination` em `ui.tsx` passa a ser o único rodapé; `DataTable` em `crud.tsx` reutiliza-o; CSS flex `space-between`.
- Funções puras para os contadores dos novos cartões em `ops.ts`, com testes vitest; teste de rota para a nova ordem do menu e para a exibição condicional da CNH.
