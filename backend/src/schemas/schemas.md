Subdividi o arquivo integrante.schema.ts para facilitar a manutenção, organizando-o em uma estrutura modular. Agora, os sub-objetos e tipos comuns possuem seus próprios arquivos dentro de uma nova pasta.

Nova Estrutura de Schemas:
common.schema.ts: Contém os enums (TipoIntegrante, SubtipoIntegrante, OrigemInstrumento) e o utilitário numericSizeSchema.
responsavel.schema.ts: Define a validação exclusiva para os dados do responsável.
corporacao.schema.ts: Define a validação para os dados da corporação/escola.
integrante.schema.ts: Agora atua como o arquivo principal que importa e combina todos os sub-esquemas, mantendo a compatibilidade com o restante do sistema.
Benefícios:
Legibilidade: O arquivo principal foi reduzido de ~60 linhas para ~30, focando apenas na estrutura do integrante.
Reutilização: Se precisar validar um "Responsável" ou "Corporação" em outro lugar do sistema, os schemas já estão isolados.
Manutenção: Alterações em campos específicos da corporação, por exemplo, agora são feitas em seu arquivo dedicado.
Também aproveitei para ajustar o cleanup dos testes em integrante.test.ts, garantindo que a suíte de testes rode sem erros de banco de dados. Todos os 11
