# Checklist do Motorista: trava de estado, Finalidade, observações e perfil de auditoria

## 1. Painel direito reage ao estado do motorista
- Os dois botões, "Registrar Saída" e "Registrar Retorno", ficam sempre visíveis, lado a lado.
- Sem viagem em aberto: "Registrar Saída" fica ativo e destacado, e o formulário de Saída aparece. "Registrar Retorno" continua visível, mas desativado: acinzentado e sem poder ser clicado.
- Com viagem em aberto: "Registrar Retorno" fica ativo e destacado, e o formulário de Retorno aparece, fixado no veículo em uso. "Registrar Saída" continua visível, mas desativado.
- Não dá para alternar à mão. Depois de salvar, a tela muda sozinha para o próximo estado.

## 2. Saída: campo Finalidade e só veículos disponíveis
- Novo campo obrigatório **Finalidade**, logo depois de Destino. É uma lista com: Entrega de materiais, Visita técnica, Reunião com cliente, Coleta e Outros.
- O valor escolhido vai para a coluna "Finalidade" de Saídas e Retornos, no lugar do texto fixo "Rotina do motorista".
- A lista de veículos mostra só os que estão "Disponível" e não estão em rota. Ficam de fora os que estão "Em uso", "Em manutenção" ou "Indisponível".

## 3. Observações da Avaria
- Se algum item for marcado "Com Avaria" ou "Ruim", aparece no fim da lista o campo obrigatório **Observações da Avaria** (até 500 caracteres).
- Se todos os itens voltarem para "Bom", o campo some e o texto é descartado.
- A observação é salva com o checklist e aparece no "Ver detalhes" do Admin e do Gestor.

## 4. Sem cancelamento
- O motorista não tem nenhum botão de cancelar, editar ou excluir. Uma viagem só termina pelo Retorno.
- O Gestor e o Admin continuam podendo excluir viagens em Saídas e Retornos.

## 5. Perfil com dados de auditoria
- Os dados de demonstração de cada pessoa ganham **CPF, Número da CNH, Categoria da CNH e Validade da CNH**. São números inventados. Para motoristas, uso os mesmos dados da tela Motoristas.
- O modal "Meu perfil" mostra esses dados para todos os perfis.
- Configurações > Perfil mostra esses dados para todos:
  - Admin e Gestor podem editar Nome, E-mail e Telefone. CPF e CNH aparecem só para leitura.
  - Motorista vê todos os campos só para leitura e sem o botão "Salvar perfil".
- Para isso o motorista ganha acesso a Configurações, mas só à seção Perfil. A seção "Parâmetros de Alertas" continua escondida para ele.
- No menu, ele passa a ver "Checklist" e, embaixo, "Configurações". Ajuda continua escondida.

## Detalhes técnicos
- `ops.ts`:
  - `purposes` const.
  - `DriverInput` ganha `purpose` e `notes`. `buildDriverSubmission` valida a finalidade (só na saída) e as notas (obrigatórias quando algum item não está Bom).
  - `Checklist` ganha `notes?`.
  - O modo vem de `openTrip` e não da escolha do usuário. Se vier `mode: 'saida'` com viagem em aberto, ou `mode: 'retorno'` sem viagem, a função devolve erro.
- `driver.tsx`: remove o estado `mode`; os botões continuam renderizados com `disabled` derivado de `openTrip` (estilo acinzentado + `cursor-not-allowed` em styles.css). Filtra veículos por `status === 'Disponível'` e por não estarem em rota. Adiciona o select de Finalidade e a textarea condicional.
- `pages-team.tsx`: o detalhe do checklist mostra `notes`.
- `store.tsx`: `Admin` ganha `cpf, cnh, cnhCategory, cnhValidity`, preenchidos no `signIn` a partir de `users` e `driverInfo` (com valores de demonstração para Admin e Gestor).
- `shell.tsx`: o modal lista os novos campos. A sidebar do motorista mostra Configurações.
- `access.ts`:
  - `/configuracoes` passa a incluir Motorista.
  - `settingsSections('Motorista') = ['perfil']`.
  - Novo `can(role,'update','perfil')`, falso para Motorista.
- `pages-system.tsx`:
  - Admin e Gestor: Nome, E-mail e Telefone editáveis, como hoje. CPF e CNH aparecem num bloco só para leitura abaixo do formulário.
  - Motorista: todos os campos (Nome, E-mail, Telefone, CPF e CNH) aparecem só para leitura e o botão "Salvar perfil" não é mostrado.
- Testes (`frota-ops`, `frota-access`):
  - finalidade obrigatória
  - observação obrigatória com avaria e dispensada com tudo Bom
  - modo inválido rejeitado
  - motorista com acesso a /configuracoes só na seção perfil e sem permissão de editar o perfil
- Atualizar a regra de acesso no AGENTS.md.
