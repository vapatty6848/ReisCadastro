import prisma from '../lib/prisma';

export class StatsService {
  async getDashboardStats() {
    const [
      totalIntegrantes,
      totalCorporacoes,
      porTipo,
      porSubtipo,
      integrantesPorCorporacao
    ] = await Promise.all([
      prisma.integrante.count(),
      prisma.corporacao.count(),
      prisma.integrante.groupBy({
        by: ['tipoIntegrante'],
        _count: true,
      }),
      prisma.integrante.groupBy({
        by: ['subtipoIntegrante'],
        _count: true,
      }),
      prisma.integrante.groupBy({
        by: ['corporacaoId'],
        _count: true,
      })
    ]);

    // Buscar nomes das corporações para o gráfico
    const corporacoes = await prisma.corporacao.findMany({
      where: { id: { in: integrantesPorCorporacao.map(i => i.corporacaoId) } },
      select: { id: true, nome: true }
    });

    const statsCorporacao = integrantesPorCorporacao.map(i => ({
      nome: corporacoes.find(c => c.id === i.corporacaoId)?.nome || 'Desconhecida',
      quantidade: i._count
    }));

    return {
      totalIntegrantes,
      totalCorporacoes,
      porTipo: porTipo.map(t => ({ label: t.tipoIntegrante, value: t._count })),
      porSubtipo: porSubtipo.map(s => ({ label: s.subtipoIntegrante || 'Não definido', value: s._count })),
      porCorporacao: statsCorporacao
    };
  }
}
