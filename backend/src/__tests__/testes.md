Para garantir que mudanças indesejadas quebrem o sistema (testes de regressão), o ideal é expandir a cobertura para as funcionalidades principais do sistema. Atualmente, temos apenas o login coberto.

Aqui estão os testes de backend que eu recomendo adicionar para tornar o projeto robusto:

1. Testes de CRUD de Integrantes (integrante.test.ts)
Este é o coração da aplicação. Precisamos garantir que:

Criação: Um integrante só pode ser criado se os dados forem válidos (CPF correto, campos obrigatórios preenchidos).
Unicidade: O sistema deve impedir o cadastro de dois integrantes com o mesmo CPF ou o mesmo número de matrícula.
Segurança: Tentar criar, editar ou deletar um integrante sem um token de autenticação válido deve retornar erro 401 Unauthorized.
Filtros: Garantir que a busca por nome, corporação ou patrimônio realmente retorne os dados corretos.
2. Testes de Middleware de Autenticação
Garantir que rotas protegidas bloqueiem tokens expirados ou malformados.
Verificar se o userId é extraído corretamente do token e injetado na requisição.
3. Testes de Lógica de Negócio (Resolvers)
O sistema cria automaticamente uma Corporação ou um Responsável se eles não existirem durante o cadastro do integrante. Precisamos testar se essa criação automática funciona e se não duplica registros existentes.
4. Testes de Upload de Arquivos
Garantir que, ao enviar fotos, elas sejam salvas no diretório correto e o caminho seja armazenado no banco de dados.
Novos Testes Adicionados (integrante.test.ts):
Segurança (Autenticação): Garante que rotas de integrantes não possam ser acessadas sem um token JWT válido (Erro 401).
Criação de Integrante: Valida o cadastro completo, incluindo a criação automática de Corporação e Responsável caso não existam.
Regra de Unicidade (CPF): Impede o cadastro de duplicatas, protegendo a integridade dos dados.
Listagem e Filtros: Verifica se a recuperação de dados está funcionando corretamente.
Atualização (PATCH): Garante que as edições de dados (como troca de nome ou tamanho de uniforme) persistam corretamente.
Exclusão (DELETE): Valida a remoção completa do registro e confirma que ele não está mais acessível.
