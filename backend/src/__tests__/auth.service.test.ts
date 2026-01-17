import { AuthService } from '../services/auth.service';
import prisma from '../lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UnauthorizedError, BaseError } from '../errors/app.errors';

jest.mock('../lib/prisma', () => ({
  __esModule: true,
  default: {
    user: {
      findUnique: jest.fn(),
    },
  },
}));

jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    authService = new AuthService();
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'test_secret';
  });

  describe('authenticate', () => {
    it('should throw UnauthorizedError if user not found', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(authService.authenticate('non@email.com', 'pass'))
        .rejects.toThrow(UnauthorizedError);
    });

    it('should throw UnauthorizedError if password invalid', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: '1', password: 'hash' });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      await expect(authService.authenticate('email@email.com', 'wrong'))
        .rejects.toThrow(UnauthorizedError);
    });

    it('should throw BaseError if JWT_SECRET is missing', async () => {
      delete process.env.JWT_SECRET;
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: '1', password: 'hash' });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      await expect(authService.authenticate('email@email.com', 'pass'))
        .rejects.toThrow(BaseError);
    });

    it('should return token and user on success', async () => {
      const mockUser = { id: '1', email: 'e', name: 'n', password: 'h' };
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue('mock-token');

      const result = await authService.authenticate('e', 'p');
      expect(result.token).toBe('mock-token');
      expect(result.user.email).toBe('e');
    });
  });

  describe('getUserById', () => {
    it('should throw BaseError if user not found', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(authService.getUserById('none'))
        .rejects.toThrow(BaseError);
    });

    it('should return user data if found', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: '1', email: 'e', name: 'n' });
      const result = await authService.getUserById('1');
      expect(result.name).toBe('n');
    });
  });
});
