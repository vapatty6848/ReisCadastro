/*
  Warnings:

  - You are about to drop the column `endereco` on the `Escola` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[matriculaNumero]` on the table `Aluno` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[nome]` on the table `Escola` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `dataMatricula` to the `Aluno` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tipoIntegrante` to the `Aluno` table without a default value. This is not possible if the table is not empty.
  - Added the required column `turma` to the `Aluno` table without a default value. This is not possible if the table is not empty.
  - Made the column `telefone` on table `Aluno` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `telefone` to the `Escola` table without a default value. This is not possible if the table is not empty.
  - Added the required column `parentesco` to the `Responsavel` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TipoIntegrante" AS ENUM ('CORPO_MUSICAL', 'LINHA_FRENTE');

-- CreateEnum
CREATE TYPE "SubtipoIntegrante" AS ENUM ('INSTRUMENTOS', 'COMANDANTE_MOR', 'PAVILHAO_NACIONAL', 'CORPO_COREOGRAFICO', 'BALIZAS');

-- CreateEnum
CREATE TYPE "OrigemInstrumento" AS ENUM ('PROJETO', 'EMPRESA');

-- AlterTable
ALTER TABLE "Aluno" ADD COLUMN     "bairro" TEXT,
ADD COLUMN     "cep" TEXT,
ADD COLUMN     "dataMatricula" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "fotoUrl" TEXT,
ADD COLUMN     "instrumento" TEXT,
ADD COLUMN     "instrumentoDevolucao" TIMESTAMP(3),
ADD COLUMN     "instrumentoOrigem" "OrigemInstrumento",
ADD COLUMN     "instrumentoRecebimento" TIMESTAMP(3),
ADD COLUMN     "matriculaNumero" TEXT,
ADD COLUMN     "numero" TEXT,
ADD COLUMN     "observacoes" TEXT,
ADD COLUMN     "rua" TEXT,
ADD COLUMN     "subtipoIntegrante" "SubtipoIntegrante",
ADD COLUMN     "tamanhoBota" TEXT,
ADD COLUMN     "tamanhoUniforme" TEXT,
ADD COLUMN     "tipoIntegrante" "TipoIntegrante" NOT NULL,
ADD COLUMN     "turma" TEXT NOT NULL,
ALTER COLUMN "telefone" SET NOT NULL;

-- AlterTable
ALTER TABLE "Escola" DROP COLUMN "endereco",
ADD COLUMN     "bairro" TEXT,
ADD COLUMN     "cep" TEXT,
ADD COLUMN     "cidade" TEXT,
ADD COLUMN     "contatoNome" TEXT,
ADD COLUMN     "contatoTelefone" TEXT,
ADD COLUMN     "email" TEXT,
ADD COLUMN     "estado" TEXT,
ADD COLUMN     "numero" TEXT,
ADD COLUMN     "rua" TEXT,
ADD COLUMN     "serie" TEXT,
ADD COLUMN     "telefone" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Responsavel" ADD COLUMN     "bairro" TEXT,
ADD COLUMN     "cep" TEXT,
ADD COLUMN     "numero" TEXT,
ADD COLUMN     "parentesco" TEXT NOT NULL,
ADD COLUMN     "rua" TEXT;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "name" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Aluno_matriculaNumero_key" ON "Aluno"("matriculaNumero");

-- CreateIndex
CREATE INDEX "Aluno_cpf_idx" ON "Aluno"("cpf");

-- CreateIndex
CREATE INDEX "Aluno_matriculaNumero_idx" ON "Aluno"("matriculaNumero");

-- CreateIndex
CREATE INDEX "Aluno_escolaId_turma_idx" ON "Aluno"("escolaId", "turma");

-- CreateIndex
CREATE UNIQUE INDEX "Escola_nome_key" ON "Escola"("nome");

-- CreateIndex
CREATE INDEX "Responsavel_id_idx" ON "Responsavel"("id");
