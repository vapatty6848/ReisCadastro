import { integranteSchema } from "../schemas/integrante.schema";
import { generateIntegranteData } from "./utils/test.utils";

describe("Integrante schema", () => {
  it("deve aceitar número do endereço como valor textual ou s/n", () => {
    const dadosComNumero = generateIntegranteData({ numero: "123" });
    const dadosComSemNumero = generateIntegranteData({ numero: "s/n" });

    expect(integranteSchema.parse(dadosComNumero).numero).toBe("123");
    expect(integranteSchema.parse(dadosComSemNumero).numero).toBe("s/n");
  });

  it("deve manter o número do responsável sem sobrescrever por vazio", () => {
    const cinResponsavel = "98765432100";
    const dadosIntegrante = generateIntegranteData({
      numero: "s/n",
      responsavel: {
        nome: "RESPONSAVEL TESTE",
        cin: cinResponsavel,
        telefone: "11988887777",
        numero: "45",
      },
    });

    const resultado = integranteSchema.parse(dadosIntegrante);

    expect(resultado.numero).toBe("s/n");
    expect(resultado.responsavel?.numero).toBe("45");
  });
});
