/*
  Warnings:

  - You are about to drop the `Aluno` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Escola` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Aluno" DROP CONSTRAINT "Aluno_escolaId_fkey";

-- DropForeignKey
ALTER TABLE "Aluno" DROP CONSTRAINT "Aluno_responsavelId_fkey";

-- DropTable
DROP TABLE "Aluno";

-- DropTable
DROP TABLE "Escola";

-- CreateTable
CREATE TABLE "Corporacao" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "rua" TEXT,
    "numero" TEXT,
    "bairro" TEXT,
    "cep" TEXT,
    "telefone" TEXT NOT NULL,
    "serie" TEXT,
    "email" TEXT,
    "cidade" TEXT,
    "estado" TEXT,
    "contatoNome" TEXT,
    "contatoTelefone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Corporacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Integrante" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "dataNascimento" TIMESTAMP(3) NOT NULL,
    "cpf" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "email" TEXT,
    "fotos" TEXT[],
    "rua" TEXT,
    "numero" TEXT,
    "bairro" TEXT,
    "cep" TEXT,
    "dataMatricula" TIMESTAMP(3) NOT NULL,
    "matriculaNumero" TEXT,
    "turma" TEXT NOT NULL,
    "tipoIntegrante" "TipoIntegrante" NOT NULL,
    "subtipoIntegrante" "SubtipoIntegrante",
    "tamanhoUniforme" TEXT,
    "tamanhoBota" TEXT,
    "instrumento" TEXT,
    "instrumentoOrigem" "OrigemInstrumento",
    "instrumentoRecebimento" TIMESTAMP(3),
    "instrumentoDevolucao" TIMESTAMP(3),
    "observacoes" TEXT,
    "responsavelId" TEXT NOT NULL,
    "corporacaoId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Integrante_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Corporacao_nome_key" ON "Corporacao"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "Integrante_cpf_key" ON "Integrante"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "Integrante_matriculaNumero_key" ON "Integrante"("matriculaNumero");

-- CreateIndex
CREATE INDEX "Integrante_cpf_idx" ON "Integrante"("cpf");

-- CreateIndex
CREATE INDEX "Integrante_matriculaNumero_idx" ON "Integrante"("matriculaNumero");

-- CreateIndex
CREATE INDEX "Integrante_corporacaoId_turma_idx" ON "Integrante"("corporacaoId", "turma");

-- AddForeignKey
ALTER TABLE "Integrante" ADD CONSTRAINT "Integrante_responsavelId_fkey" FOREIGN KEY ("responsavelId") REFERENCES "Responsavel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Integrante" ADD CONSTRAINT "Integrante_corporacaoId_fkey" FOREIGN KEY ("corporacaoId") REFERENCES "Corporacao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
