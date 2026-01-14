# 🧪 Plano de Testes: Sistema de Gestão de Integrantes

Este documento descreve os casos de teste necessários para garantir a qualidade e integridade do sistema **ReisCadastro**.

---

## 1. Autenticação (Login)

| ID      | Caso de Teste               | Descrição                                                          | Resultado Esperado                                                       |
| :------ | :-------------------------- | :----------------------------------------------------------------- | :----------------------------------------------------------------------- |
| AUTH-01 | Login com Sucesso           | Inserir credenciais válidas (`admin@corporacao.com` / `admin123`). | Redirecionamento para o Dashboard e armazenamento do token JWT.          |
| AUTH-02 | Login com Senha Inválida    | Inserir email válido e senha incorreta.                            | Mensagem de erro "Credenciais inválidas" e permanência na tela de login. |
| AUTH-03 | Login com Email Inexistente | Inserir um email que não consta na base.                           | Mensagem de erro "Credenciais inválidas".                                |
| AUTH-04 | Validação de Campos Vazios  | Tentar clicar em "Entrar" sem preencher os campos.                 | Mensagens de erro do Zod indicando campos obrigatórios.                  |
| AUTH-05 | Proteção de Rotas           | Tentar acessar `/dashboard` sem estar logado.                      | Redirecionamento automático para `/login`.                               |

---

## 2. Gestão de Integrantes (CRUD)

| ID      | Caso de Teste     | Descrição                                                                 | Resultado Esperado                                                                 |
| :------ | :---------------- | :------------------------------------------------------------------------ | :--------------------------------------------------------------------------------- |
| CRUD-01 | Cadastro Completo | Preencher todos os campos (Integrante, Responsável, Corporação) e salvar. | Integrante criado no ba=nco, redirecionamento para listagem e mensagem de sucesso. |

| CRUD-02 | Não usado |Nesse caso o CPF podes ser duplicado porque se o inntegrante não tever o CPF usara do responsável Cadastro com CPF Duplicado | Tentar cadastrar um integrante com um CPF já existente. | Mensagem de erro "CPF já cadastrado" vinda do backend. |
| CRUD-03 | Edição de Dados | Alterar o nome ou telefone de um integrante existente. | Dados atualizados no banco e refletidos na interface. |
| CRUD-04 | Exclusão com Confirmação | Clicar em excluir e confirmar no modal/alert. | Registro removido da listagem e do banco de dados. |
| CRUD-05 | Cancelamento de Exclusão | Clicar em excluir e cancelar no modal/alert. | O registro deve permanecer intacto. |

---

## 3. Validações e Regras de Negócio

| ID     | Caso de Teste          | Descrição                                                  | Resultado Esperado                                                          |
| :----- | :--------------------- | :--------------------------------------------------------- | :-------------------------------------------------------------------------- |
| VAL-01 | Formato de CPF         | Inserir CPF com letras ou menos de 11 dígitos.             | Bloqueio pelo Zod no frontend com mensagem de erro.                         |
| VAL-02 | Idade Mínima           | Tentar cadastrar integrante com data de nascimento futura. | Erro de validação de data.                                                  |
| VAL-03 | Campos Obrigatórios    | Deixar campos como "Nome", "CPF" ou "Turma" vazios.        | Destaque visual nos campos e impedimento do envio do form.                  |
| VAL-04 | Relacionamento Atômico | Simular erro no cadastro da Corporação durante o envio.    | O Integrante e o Responsável não devem ser criados (Rollback da transação). |

---

## 4. Upload de Arquivos (Fotos)

| ID      | Caso de Teste             | Descrição                                          | Resultado Esperado                                                 |
| :------ | :------------------------ | :------------------------------------------------- | :----------------------------------------------------------------- |
| FILE-01 | Upload de Múltiplas Fotos | Selecionar 3 fotos válidas (JPG/PNG).              | Fotos enviadas para o servidor e exibidas no perfil do integrante. |
| FILE-02 | Limite de Arquivos        | Tentar selecionar mais de 5 fotos simultaneamente. | Alerta informando o limite máximo de 5 arquivos.                   |
| FILE-03 | Tipo de Arquivo Inválido  | Tentar enviar um arquivo .pdf ou .exe.             | Bloqueio de upload e mensagem de erro.                             |
| FILE-04 | Remoção de Foto na Edição | Remover uma das fotos já cadastradas e salvar.     | Arquivo removido do servidor/referência no banco.                  |

---

## 5. Pesquisa e Filtros

| ID      | Caso de Teste     | Descrição                                                 | Resultado Esperado                                         |
| :------ | :---------------- | :-------------------------------------------------------- | :--------------------------------------------------------- |
| SRCH-01 | Pesquisa por Nome | Digitar parte do nome de um integrante no campo de busca. | A lista deve exibir apenas os integrantes correspondentes. |
| SRCH-02 | Pesquisa por CPF  | Digitar o CPF exato de um integrante.                     | A lista deve filtrar o integrante específico.              |
| SRCH-03 | Filtro Vazio      | Pesquisar por um termo que não existe.                    | Exibição de mensagem "Nenhum integrante encontrado".       |
| SRCH-04 | Limpar Filtros    | Realizar uma busca e depois limpar o campo.               | A lista completa de integrantes deve retornar.             |

---

## 6. Interface e UX (Responsividade)

| ID    | Caso de Teste            | Descrição                                                  | Resultado Esperado                                                 |
| :---- | :----------------------- | :--------------------------------------------------------- | :----------------------------------------------------------------- |
| UI-01 | Visualização Mobile      | Acessar o sistema via smartphone (375px).                  | Menu hambúrguer funcional e tabela com scroll horizontal ou cards. |
| UI-02 | Feedback de Carregamento | Simular rede lenta durante o salvamento.                   | Exibição de um spinner ou estado de "Loading" no botão.            |
| UI-03 | Navegação Lateral        | Clicar nos itens do menu lateral (Dashboard, Integrantes). | Troca de páginas sem recarregamento total (SPA).                   |
