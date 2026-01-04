import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { createIntegrante, listIntegrantes, getIntegrante, updateIntegrante, deleteIntegrante } from '../controllers/integrante.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

const router = Router();

router.use(authMiddleware);

/**
 * @swagger
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *                 errors: { type: object }
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
router.post('/', upload.array('fotos', 5), createIntegrante);
router.get('/', listIntegrantes);
router.get('/:id', getIntegrante);
router.patch('/:id', upload.array('fotos', 5), updateIntegrante);
router.delete('/:id', deleteIntegrante);

export default router;
