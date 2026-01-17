/**
 * @swagger
 * components:
 *   schemas:
 *     Error:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           example: error
 *         message:
 *           type: string
 *         details:
 *           type: object
 *     ValidationError:
 *       allOf:
 *         - $ref: '#/components/schemas/Error'
 *         - type: object
 *           properties:
 *             details:
 *               type: object
 *               description: Detalhes específicos dos campos invalidados pelo Zod
 *
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
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
 *         description: Erro de validação.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       401:
 *         description: Não autorizado (Token ausente ou inválido).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Conflito (CPF ou Matrícula já existentes).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
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
 *         name: statusDevolucao
 *         schema: { type: string, enum: [DEVOLVIDO, NAO_DEVOLVIDO] }
 *         description: Filtro por status de devolução do instrumento.
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   patch:
 *     summary: Atualiza um integrante existente
 *     description: Permite atualização parcial dos dados. Se novas fotos forem enviadas, elas serão adicionadas à lista existente.
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
 *         description: Erro de validação.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       409:
 *         description: Conflito (CPF de outra família ou Matrícula já em uso).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
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
