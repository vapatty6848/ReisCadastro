import { StatsService } from '../services/stats.service';
import prisma from '../lib/prisma';

jest.mock('../lib/prisma', () => ({
  __esModule: true,
  default: {
    integrante: {
      count: jest.fn(),
      groupBy: jest.fn(),
    },
    corporacao: {
      count: jest.fn(),
      findMany: jest.fn(),
    },
  },
}));

describe('StatsService', () => {
  let statsService: StatsService;

  beforeEach(() => {
    statsService = new StatsService();
    jest.clearAllMocks();
  });

  it('should return dashboard stats correctly', async () => {
    (prisma.integrante.count as jest.Mock).mockResolvedValue(10);
    (prisma.corporacao.count as jest.Mock).mockResolvedValue(2);

    (prisma.integrante.groupBy as jest.Mock)
      .mockResolvedValueOnce([{ tipoIntegrante: 'Ativo', _count: 6 }, { tipoIntegrante: 'Reserva', _count: 4 }]) // porTipo
      .mockResolvedValueOnce([{ subtipoIntegrante: 'A', _count: 10 }]) // porSubtipo
      .mockResolvedValueOnce([{ corporacaoId: 'corp1', _count: 7 }, { corporacaoId: 'corp2', _count: 3 }]); // integrantesPorCorporacao

    (prisma.corporacao.findMany as jest.Mock).mockResolvedValue([
      { id: 'corp1', nome: 'Corp A' },
      { id: 'corp2', nome: 'Corp B' },
    ]);

    const result = await statsService.getDashboardStats();

    expect(result).toEqual({
      totalIntegrantes: 10,
      totalCorporacoes: 2,
      porTipo: [
        { label: 'Ativo', value: 6 },
        { label: 'Reserva', value: 4 },
      ],
      porSubtipo: [
        { label: 'A', value: 10 },
      ],
      porCorporacao: [
        { nome: 'Corp A', quantidade: 7 },
        { nome: 'Corp B', quantidade: 3 },
      ],
    });
  });

  it('should handle missing corporation names', async () => {
    (prisma.integrante.count as jest.Mock).mockResolvedValue(5);
    (prisma.corporacao.count as jest.Mock).mockResolvedValue(1);

    (prisma.integrante.groupBy as jest.Mock)
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ corporacaoId: 'unknown', _count: 5 }]);

    (prisma.corporacao.findMany as jest.Mock).mockResolvedValue([]);

    const result = await statsService.getDashboardStats();

    expect(result.porCorporacao[0].nome).toBe('Desconhecida');
  });

  it('should handle undefined subtipoIntegrante', async () => {
    (prisma.integrante.count as jest.Mock).mockResolvedValue(1);
    (prisma.corporacao.count as jest.Mock).mockResolvedValue(1);

    (prisma.integrante.groupBy as jest.Mock)
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ subtipoIntegrante: null, _count: 1 }])
      .mockResolvedValueOnce([]);

    (prisma.corporacao.findMany as jest.Mock).mockResolvedValue([]);

    const result = await statsService.getDashboardStats();

    expect(result.porSubtipo[0].label).toBe('Não definido');
  });
});
