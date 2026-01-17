/*
  Warnings:

  - You are about to drop the column `serie` on the `Corporacao` table. All the data in the column will be lost.
  - You are about to drop the column `turma` on the `Integrante` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Integrante_corporacaoId_turma_idx";

-- AlterTable
ALTER TABLE "Corporacao" DROP COLUMN "serie";

-- AlterTable
ALTER TABLE "Integrante" DROP COLUMN "turma";

-- CreateIndex
CREATE INDEX "Integrante_corporacaoId_idx" ON "Integrante"("corporacaoId");
