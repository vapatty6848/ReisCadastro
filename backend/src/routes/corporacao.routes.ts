import { Router } from "express";
import {
  listCorporacoesPredefinidas,
  listAllCorporacoes,
  createCorporacao,
  getCorporacao,
} from "../controllers/corporacao.controller";

const router = Router();

/**
 * GET /api/corporacoes/predefinidas
 * Lista todas as corporações predefinidas
 */
router.get("/predefinidas", listCorporacoesPredefinidas);

/**
 * GET /api/corporacoes
 * Lista todas as corporações com busca opcional
 */
router.get("/", listAllCorporacoes);

/**
 * GET /api/corporacoes/:id
 * Busca uma corporação específica
 */
router.get("/:id", getCorporacao);

/**
 * POST /api/corporacoes
 * Cria uma nova corporação
 */
router.post("/", createCorporacao);

export const corporacaoRoutes = router;
