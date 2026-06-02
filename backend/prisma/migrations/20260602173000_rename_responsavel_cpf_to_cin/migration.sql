ALTER TABLE "Responsavel" RENAME COLUMN "cpf" TO "cin";

-- Ajusta o nome do índice único gerado automaticamente, mantendo padrão consistente.
ALTER INDEX IF EXISTS "Responsavel_cpf_key" RENAME TO "Responsavel_cin_key";
