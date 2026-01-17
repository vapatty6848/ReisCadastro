import { Request, Response } from 'express';
import { StatsService } from '../services/stats.service';

const statsService = new StatsService();

export const getStats = async (req: Request, res: Response) => {
  const stats = await statsService.getDashboardStats();
  return res.json(stats);
};
