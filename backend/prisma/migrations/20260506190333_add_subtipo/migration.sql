-- DropForeignKey
ALTER TABLE "Integrante" DROP CONSTRAINT "Integrante_responsavelId_fkey";

-- AddForeignKey
ALTER TABLE "Integrante" ADD CONSTRAINT "Integrante_responsavelId_fkey" FOREIGN KEY ("responsavelId") REFERENCES "Responsavel"("id") ON DELETE SET NULL ON UPDATE CASCADE;
