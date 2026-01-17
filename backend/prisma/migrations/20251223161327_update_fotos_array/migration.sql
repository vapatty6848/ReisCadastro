/*
  Warnings:

  - You are about to drop the column `fotoUrl` on the `Aluno` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Aluno" DROP COLUMN "fotoUrl",
ADD COLUMN     "fotos" TEXT[];
