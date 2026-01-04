/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: Endpoints de autenticação
 *   - name: Integrantes
 *     description: Gestão de integrantes da corporação
 *
 * /api/auth/login:
 *   post:
 *     summary: Realiza o login do administrador
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: admin@corporacao.com
 *               password:
 *                 type: string
 *                 example: admin123
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *       401:
 *         description: Credenciais inválidas
 *
 * /api/auth/me:
 *   get:
 *     summary: Obtém os dados do usuário autenticado
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dados do usuário retornados com sucesso
 *       401:
 *         description: Token ausente ou inválido
 *       404:
 *         description: Usuário não encontrado
 *
 * /api/integrantes:
 *   post:
 *     summary: Cria um novo integrante
 *     description: Realiza o cadastro completo de um integrante, incluindo dados pessoais, responsável, corporação e até 5 fotos.
 *     tags: [Integrantes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               data:
 *                 type: string
 *                 description: JSON string contendo os dados do integrante (nome, cpf, responsavel, corporacao, etc.)
 *               fotos:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Até 5 arquivos de imagem.
 *     responses:
 *       201:
 *         description: Integrante criado com sucesso.
 *       400:
 *         description: Erro de validação (CPF duplicado, campos obrigatórios ausentes, formato inválido).
 *       401:
 *         description: Não autorizado (Token ausente ou inválido).
 *       500:
 *         description: Erro interno do servidor.
 *   get:
 *     summary: Lista integrantes com filtros
 *     description: Retorna uma lista de integrantes. Permite filtrar por nome, responsável, instrumento e tipo.
 *     tags: [Integrantes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: nome
 *         schema: { type: string }
 *         description: Filtro por nome do integrante (case-insensitive).
 *       - in: query
 *         name: responsavel
 *         schema: { type: string }
 *         description: Filtro por nome do responsável.
 *       - in: query
 *         name: corporacao
 *         schema: { type: string }
 *         description: Filtro por nome da corporação.
 *       - in: query
 *         name: tamanhoUniforme
 *         schema: { type: string }
 *         description: Filtro por tamanho do uniforme.
 *       - in: query
 *         name: tamanhoBota
 *         schema: { type: string }
 *         description: Filtro por tamanho da bota.
 *       - in: query
 *         name: patrimonio
 *         schema: { type: string }
 *         description: Filtro por número de patrimônio.
 *       - in: query
 *         name: instrumento
 *         schema: { type: string }
 *         description: Filtro por nome do instrumento.
 *       - in: query
 *         name: naoDevolvido
 *         schema: { type: boolean }
 *         description: Se true, retorna apenas instrumentos não devolvidos.
 *       - in: query
 *         name: instrumentoOrigem
 *         schema: { type: string, enum: [PROJETO, EMPRESA] }
 *       - in: query
 *         name: tipoIntegrante
 *         schema: { type: string, enum: [CORPO_MUSICAL, LINHA_FRENTE] }
 *     responses:
 *       200:
 *         description: Lista de integrantes retornada com sucesso.
 *       401:
 *         description: Não autorizado.
 *
 * /api/integrantes/{id}:
 *   get:
 *     summary: Obtém detalhes de um integrante
 *     tags: [Integrantes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Dados do integrante.
 *       404:
 *         description: Integrante não encontrado.
 *   patch:
 *     summary: Atualiza um integrante existente
 *     description: Permite atualização parcial dos dados. Se novas fotos forem enviadas, elas substituirão as antigas.
 *     tags: [Integrantes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               data: { type: string }
 *               fotos: { type: array, items: { type: string, format: binary } }
 *     responses:
 *       200:
 *         description: Atualizado com sucesso.
 *       400:
 *         description: Erro de validação ou CPF/Matrícula já em uso por outro integrante.
 *   delete:
 *     summary: Remove um integrante
 *     tags: [Integrantes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204:
 *         description: Removido com sucesso.
 *       500:
 *         description: Erro ao deletar.
 */
