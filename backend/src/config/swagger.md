Revisei a documentação do Swagger e encontrei algumas discrepâncias entre o que estava documentado e o que as rotas realmente oferecem. Realizei as seguintes correções:

1. Rota de Autenticação (auth.routes.ts)
Adicionei a documentação para o endpoint /api/auth/me, que estava faltando. Agora ele descreve corretamente que requer autenticação via Bearer Token e retorna os dados do usuário logado.
2. Rota de Integrantes (integrante.routes.ts)
Filtros de Listagem: Adicionei todos os parâmetros de busca que o controlador suporta, mas que não estavam no Swagger:
corporacao
tamanhoUniforme
tamanhoBota
patrimonio
instrumento
naoDevolvido (booleano para rastrear instrumentos pendentes)
Método de Atualização: Confirmei que o Swagger já estava usando patch, o que está correto conforme a implementação das rotas.
3. Configuração Geral (swagger.ts)
A configuração está correta, apontando para os arquivos de rotas e controladores para extrair as anotações JSDoc.
Com essas mudanças, a documentação automática (acessível em /api-docs) agora reflete exatamente as capacidades da API.

