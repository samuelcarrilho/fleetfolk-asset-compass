# Fleetfolk Asset Compass

Quero que você reproduza EXATAMENTE a interface das três imagens de referência anexadas neste projeto.



O projeto se chama FROTATech.



ATENÇÃO: NÃO CRIE UM NOVO DESIGN. NÃO INVENTE TELAS, CARDS, GRÁFICOS, INDICADORES, FUNCIONALIDADES VISUAIS OU SEÇÕES QUE NÃO APAREÇAM NAS IMAGENS. NÃO FAÇA UMA VERSÃO APENAS INSPIRADA NAS REFERÊNCIAS. Quero uma reprodução visual fiel, transformando os elementos existentes em funcionalidades reais.



OBJETIVO:

Manter a aparência das imagens e implementar a interatividade no código. Os elementos visuais devem permanecer nas mesmas posições, com as mesmas cores, dimensões aproximadas, espaçamentos, ícones, tipografia, textos, tabelas e estrutura de navegação.



TELA 1 — USUÁRIOS:

Reproduza a tela com:

- Sidebar azul-escura com logo FROTATech e os mesmos itens de menu.

- Barra superior com pesquisa global, notificações e perfil do usuário.

- Breadcrumb Início > Usuários.

- Título Usuários e texto descritivo.

- Botão azul Cadastrar usuário.

- Quatro cards: Total de Usuários, Administradores, Gestores da Frota e Motoristas.

- Barra de filtros com busca por nome, e-mail ou CPF, seleção de Perfil, seleção de Status e botão Mais filtros.

- Tabela com checkbox, nome e avatar, CPF, e-mail, telefone, perfil, status e ações.

- Botões de editar e menu de opções em cada linha.

- Paginação inferior com quantidade de registros por página.

- Preserve o padrão visual dos badges coloridos de perfil e status.



TELA 2 — VEÍCULOS:

Reproduza a tela com:

- A mesma sidebar e o mesmo cabeçalho superior.

- Breadcrumb Início > Veículos.

- Título Veículos, texto descritivo e botão Cadastrar Veículo.

- Quatro cards: Total de Veículos, Disponíveis, Em Manutenção e Indisponíveis.

- Filtros por placa, marca, modelo, status, tipo de combustível e marca, conforme a imagem.

- Botão Mais filtros.

- Tabela com seleção, imagem do veículo, placa, marca/modelo, ano, combustível, quilometragem, status e ações.

- Imagens de veículos correspondentes aos tipos exibidos, mantendo o tamanho e o alinhamento visual da referência.

- Botões de editar e menu de opções.

- Paginação inferior com seleção da quantidade de registros.

- Preserve as cores e os estados Disponível, Em uso, Em manutenção e Indisponível.



TELA 3 — INÍCIO:

Reproduza EXATAMENTE o painel mostrado na terceira imagem:

- Sidebar azul com logo FROTATech e os itens de navegação na ordem mostrada.

- Barra superior com pesquisa e perfil Kleber Samuel, Gestor.

- Saudação Bem-vindo, Kleber Samuel! e data no canto direito.

- Os quatro cards de indicadores mostrados na imagem.

- Seção Ações rápidas com os quatro atalhos: Cadastrar veículo, Cadastrar motorista, Registrar saída e Registrar abastecimento.

- Seção Lembretes de gestão com os três itens: conferir documentos dos veículos, planejar revisões preventivas e acompanhar o consumo de combustível.

- Seção Rotina do motorista com Checklist diário, Registrar saída e Registrar retorno.

- Seção Controle da frota com Ver veículos, Ver manutenções e Consultar multas.

- Mantenha a disposição, as cores, os ícones, as proporções e o espaçamento visual da imagem.

- Não acrescente gráficos, calendários, rankings ou outros cards que não existam na referência.



NAVEGAÇÃO:

Os itens da sidebar devem navegar para suas respectivas rotas. Os três módulos de referência devem ter suas páginas implementadas conforme as imagens.

Para os demais itens do menu, implemente somente o necessário para que a navegação e os atalhos existentes funcionem, sem inventar novos layouts elaborados. Se uma tela ainda não estiver implementada, sinalize isso honestamente.



INTERATIVIDADE REAL:

1. Cadastrar usuário: abrir formulário de cadastro com os campos pertinentes.

2. Editar usuário: abrir formulário preenchido com os dados da linha selecionada.

3. Menu de opções: apresentar ações relevantes para aquele registro.

4. Seleção por checkbox: permitir selecionar linhas e selecionar todos os registros visíveis.

5. Pesquisa: filtrar a tabela conforme o texto digitado.

6. Filtros: aplicar efetivamente perfil, status, combustível, marca e os demais campos existentes.

7. Paginação: trocar de página, alterar a quantidade de itens por página e atualizar a tabela.

8. Cadastrar veículo: abrir formulário de cadastro de veículo.

9. Editar veículo: abrir formulário preenchido com os dados existentes.

10. Cards de indicadores: exibir dados calculados a partir dos registros e, quando adequado, permitir navegar para a listagem correspondente.

11. Ações rápidas do Início: abrir o formulário ou a página correspondente.

12. Lembretes de gestão: navegar para o módulo relacionado ao lembrete.

13. Atalhos de Rotina do motorista e Controle da frota: abrir as funcionalidades correspondentes.

14. Pesquisa global: pesquisar nos módulos disponíveis.

15. Notificações e menus do perfil: abrir seus respectivos menus funcionais.



REGRAS DE IMPLEMENTAÇÃO:

- Utilize React, TypeScript e Tailwind CSS, mantendo os componentes existentes sempre que possível.

- Antes de modificar, inspecione o código atual e identifique o que já está implementado.

- Não recrie o projeto do zero se ele já existir.

- Não altere o design para facilitar a implementação.

- Não remova elementos que aparecem nas referências.

- Não substitua tabelas por cards ou as telas por versões simplificadas.

- Utilize componentes reutilizáveis para sidebar, cabeçalho, filtros, tabelas, badges, modais e paginação.

- Os formulários precisam validar os campos e apresentar mensagens de sucesso ou erro.

- Criar, editar e excluir devem atualizar a interface de forma consistente.

- Mantenha os textos da interface em português brasileiro.

- Preserve os dados de demonstração visíveis nas imagens como referência visual, mas não trate informações fictícias como dados reais de produção.

- Se houver banco de dados conectado, utilize-o. Caso contrário, implemente uma camada de dados organizada e informe o que falta para persistência permanente.

- Não afirme que a integração com banco ou autenticação funciona se ainda não foi configurada e testada.



CRITÉRIO DE ACEITAÇÃO:

Compare cada tela implementada com sua imagem de referência. A estrutura visual deve ser fiel. Teste os botões, os menus, os formulários, a busca, os filtros, as ações de editar e a paginação.



Comece analisando o projeto existente e reproduzindo as três telas. Priorize a fidelidade visual e a interatividade dos elementos que realmente aparecem nas imagens. Não invente um novo design.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://fleetfolk-asset-compass.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/c019baf4-de7e-452e-9cd7-18c146ec44f4).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
