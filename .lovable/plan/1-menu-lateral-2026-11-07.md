- FROTATech — novo menu e telas restantes (visão Administrador)

Mesmo visual de Início, Usuários e Veículos: mesmas tabelas, selos coloridos, botões, filtros, paginação e janelas de cadastro. Todos os dados continuam demonstrativos, só nesta sessão, sem banco permanente.

## 1. Menu lateral

- Ordem: Início, **Veículos e Operações** (grupo que abre e fecha: Veículos, Abastecimentos, Documentos, Multas), Usuários, Motoristas, Saídas e Retornos, Manutenções, Relatórios, Checklist, Configurações, Ajuda.
- O grupo fica aberto quando uma das telas dele está ativa. Com o menu recolhido, aparecem só os ícones.
- A ordem é a mesma em todas as telas.

## 2. Telas

- **Abastecimentos**: tabela com Data, Veículo, Motorista, Posto, Combustível, Litros, Valor Total, Consumo Médio (verde dentro da média da frota, vermelho quando o consumo está alto) e Ações. Botão "+ Registrar Abastecimento" com formulário, mais editar e excluir.
- **Documentos**: 4 cartões (Total, Em Dia verde, Próximos do Vencimento amarelo, Vencidos vermelho) calculados a partir da data de vencimento. Tabela com Veículo, Tipo (IPVA, Licenciamento, Seguro), Vencimento, Status Pagamento, Status Vencimento e Ações. Botão "+ Adicionar Documento".
- **Multas**: filtros por Motorista, Veículo e Status, mais busca. Tabela com Data, Veículo, Motorista, Valor, Status (Paga, Recorrida, Pendente) e Ações. Botão "+ Registrar Multa".
- **Motoristas**: tabela com Nome, CPF, CNH, Categoria, Validade (selo amarelo quando faltam até X dias, vermelho quando vencida), Status e Ações. Botão "+ Cadastrar Motorista".
- **Saídas e Retornos**: tabela com Veículo, Motorista, Destino, Finalidade, Saída (data/hora e km), Retorno, Status (Em Rota, Concluída) e Ações. Botões "+ Registrar Saída" e "+ Registrar Retorno". O retorno fecha uma viagem em rota e exige km maior que o da saída. A saída marca o veículo como "Em uso" e o retorno o devolve para "Disponível".
- **Manutenções**: abas Preventivas e Corretivas. Tabela com Veículo, Oficina, Data, Custo, Próxima Revisão, Status (Agendada, Em Andamento, Concluída). Botão "+ Agendar Manutenção".
- **Checklist**: tabela com Data, Motorista, Veículo, Tipo, Status do Veículo (Aprovado, Com Avarias, Reprovado) e "Ver detalhes". Esse botão abre um painel lateral com os itens verificados (Pneus, Iluminação, Óleo, Macaco, Estepe, Freios, Extintor), cada um marcado com um sinal de certo ou X.
- **Relatórios**: grade de cartões. O principal é "Monitoramento de Abastecimento Mensal", com filtros de Mês/Ano, Motorista e Veículo e os botões Gerar PDF e Gerar Excel. Os arquivos são baixados com os dados demonstrativos filtrados: o Excel sai como planilha CSV e o PDF sai como página pronta para imprimir ou salvar.
- **Configurações**: menu vertical interno com Perfil do Administrador (João Silva, editável), Empresas Parceiras/Oficinas (cadastro em lista) e Parâmetros de Alertas (dias de aviso antes do vencimento da CNH e de IPVA/documentos). Esses números passam a valer para os alertas de Motoristas e Documentos.
- **Ajuda**: perguntas frequentes em lista expansível, link para o Manual do Usuário (avisando que é demonstrativo) e contato do suporte. O contato atual será inventado: me envie o e-mail e o telefone reais.

Os atalhos do Início e as notificações passam a abrir essas telas e formulários.

## Detalhes técnicos

- Ampliar `data.ts` com schemas zod e dados de exemplo (abastecimentos, documentos, multas, viagens, manutenções, checklists, oficinas, parâmetros de alerta, CNH dos motoristas). Ampliar `FleetProvider` com operações genéricas de salvar e excluir.
- Funções puras (status de vencimento, alerta de CNH, consumo comparado à média, fechamento de viagem) com testes vitest.
- Uma tabela/lista reutilizável com busca, filtros e paginação, montada sobre o que já existe em `listings.tsx`. Usar os componentes Accordion, Tabs e Sheet do shadcn.
- Substituir `other.tsx` por componentes próprios de cada tela. As rotas existentes continuam as mesmas.