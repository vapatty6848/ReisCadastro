import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import process from "process";

const prisma = new PrismaClient();

async function main() {
  const env = process.env.NODE_ENV || "development";

  console.log(`🌱 Executando seed para ambiente: ${env}`);

  // Em desenvolvimento, limpar dados existentes e começar do zero
  if (env === "development") {
    console.log("🗑️  Limpando banco de dados...");
    await prisma.integrante.deleteMany({});
    await prisma.responsavel.deleteMany({});
    await prisma.corporacao.deleteMany({});
    await prisma.user.deleteMany({});
    console.log("✅ Banco limpo!");
  }

  // Criar usuário admin
  const hashedPassword = await bcrypt.hash("admin123", 10);
  await prisma.user.upsert({
    where: { email: "admin@corporacao.com" },
    update: {},
    create: {
      email: "admin@corporacao.com",
      name: "Administrador",
      password: hashedPassword,
    },
  });
  console.log("✅ Usuário admin criado.");

  // Em desenvolvimento, criar dados iniciais de exemplo
  if (env === "development") {
    console.log("📝 Criando corporações predefinidas para testes...");

    const corporacoes = await prisma.corporacao.createMany({
      data: [
        {
          nome: "EM Dr Getúlio Vargas",
          telefone: "(11) 3456-7890",
          isPredefinida: true,
          rua: "Rua das Flores",
          numero: "123",
          bairro: "Centro",
          cep: "13680-000",
          cidade: "Tapirai",
          estado: "SP",
        },
        {
          nome: "Banda Marcial de Tapirai",
          telefone: "(11) 3456-7891",
          isPredefinida: true,
          rua: "Avenida Principal",
          numero: "456",
          bairro: "Vila Nova",
          cep: "13680-100",
          cidade: "Tapirai",
          estado: "SP",
        },
        {
          nome: "Fanfarra de Tapirai",
          telefone: "(11) 3456-7892",
          isPredefinida: true,
          rua: "Rua da Música",
          numero: "789",
          bairro: "Centro",
          cep: "13680-000",
          cidade: "Tapirai",
          estado: "SP",
        },
        {
          nome: "EM Prof. Flávio de Souza Nogueira",
          telefone: "(11) 3456-7893",
          isPredefinida: true,
          rua: "Rua da Educação",
          numero: "321",
          bairro: "Centro",
          cep: "13680-000",
          cidade: "Tapirai",
          estado: "SP",
        },
      ],
    });

    console.log(`✅ ${corporacoes.count} corporações predefinidas criadas.`);

    // Criar um responsável de exemplo
    const responsavel = await prisma.responsavel.create({
      data: {
        nome: "Maria da Silva",
        cpf: "12345678901",
        telefone: "(11) 98765-4321",
        email: "maria@example.com",
        rua: "Rua Exemplo",
        numero: "100",
        bairro: "Bairro Teste",
        cep: "13680-000",
        parentesco: "Mãe",
      },
    });

    console.log("✅ Responsável de teste criado.");

    // Criar alguns integrantes de exemplo para diferentes corporações
    const corporacoesData = await prisma.corporacao.findMany({
      where: { isPredefinida: true },
      take: 2,
    });

    if (corporacoesData.length > 0) {
      // Primeiro integrante
      await prisma.integrante.create({
        data: {
          nome: "João Silva - Corpo Musical",
          cpf: "11111111111",
          dataNascimento: new Date("2005-03-15"),
          telefone: "(11) 99999-1111",
          tipoIntegrante: "CORPO_MUSICAL",
          subtipoIntegrante: "INSTRUMENTOS",
          instrumento: "Trombone",
          tamanhoUniforme: "M",
          tamanhoBota: "40",
          dataMatricula: new Date("2026-03-21"),
          responsavelId: responsavel.id,
          corporacaoId: corporacoesData[0].id,
        },
      });

      // Segundo integrante com tipo APOIO
      await prisma.integrante.create({
        data: {
          nome: "Ana Santos - Apoio",
          cpf: "22222222222",
          dataNascimento: new Date("2008-07-20"),
          telefone: "(11) 99999-2222",
          tipoIntegrante: "APOIO",
          dataMatricula: new Date("2026-03-21"),
          responsavelId: responsavel.id,
          corporacaoId: corporacoesData[1].id,
        },
      });

      console.log("✅ Integrantes de exemplo criados.");
    }

    console.log("\n🎉 Seed de desenvolvimento concluído!");
  } else {
    console.log("\n✅ Seed de produção concluído!");
  }
}

main()
  .catch((e) => {
    console.error("❌ Erro ao executar seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
