import { IntegranteService } from '../services/integrante.service';
import prisma from '../lib/prisma';
import { StorageService } from '../services/storage.service';

jest.mock('../lib/prisma');
jest.mock('../services/storage.service');

describe('IntegranteService (Unit)', () => {
  let integranteService: IntegranteService;
  let storageMock: jest.Mocked<StorageService>;

  beforeEach(() => {
    integranteService = new IntegranteService();
    storageMock = new StorageService() as jest.Mocked<StorageService>;
    jest.clearAllMocks();
  });

  describe('Photo Processing Logic (Private simulation)', () => {
    // Como os métodos são privados, vamos testá-los através do comportamento ou via casting para 'any'

    it('should process fotos correctly when adding and removing', () => {
      const current = ['f1.jpg', 'f2.jpg'];
      const payload = ['f1.jpg']; // remove f2.jpg
      const news = ['f3.jpg'];

      const result = (integranteService as any).processarFotos(current, payload, news);

      expect(result).toEqual(['f1.jpg', 'f3.jpg']);
    });

    it('should process profile photo correctly', () => {
      const current = 'old.jpg';
      const news = 'new.jpg';

      const result = (integranteService as any).processarFotoPerfil(current, news);
      expect(result).toBe('new.jpg');
    });

    it('should return null when profile photo is reset', () => {
      const result = (integranteService as any).processarFotoPerfil('old.jpg', undefined, '');
      expect(result).toBeNull();
    });
  });
});
