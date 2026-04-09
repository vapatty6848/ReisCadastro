/*
  Warnings:

  - You are about to drop the column `cpf` on the `Integrante` table. All the data in the column will be lost.
  - Added the required column `documento` to the `Integrante` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "DocumentoTipo" AS ENUM ('CPF', 'CIN');

-- DropIndex
DROP INDEX "Integrante_cpf_idx";

-- AlterTable
ALTER TABLE "Integrante"
ADD COLUMN     "complemento" TEXT,
ADD COLUMN     "documento" TEXT,
ADD COLUMN     "documentoTipo" "DocumentoTipo" DEFAULT 'CPF';

-- Migrate CPF data to documento
UPDATE "Integrante" SET "documento" = "cpf" WHERE "cpf" IS NOT NULL;

-- Make documento NOT NULL after migration
ALTER TABLE "Integrante"
ALTER COLUMN "documento" SET NOT NULL,
ALTER COLUMN "documentoTipo" SET NOT NULL;

-- Drop CPF column
ALTER TABLE "Integrante" DROP COLUMN "cpf";

-- CreateIndex
CREATE INDEX "Integrante_documento_idx" ON "Integrante"("documento");
