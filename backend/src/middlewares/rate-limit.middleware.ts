import { Request, Response, NextFunction } from "express";
import { BaseError } from "../errors/app.errors";

type LimiterOptions = {
  windowMs: number;
  max: number;
  keyPrefix: string;
};

type Bucket = {
  count: number;
  resetAt: number;
};

const memoryStore = new Map<string, Bucket>();

export function createRateLimitMiddleware(options: LimiterOptions) {
  const { windowMs, max, keyPrefix } = options;

  return (req: Request, _res: Response, next: NextFunction) => {
    const now = Date.now();
    const ip = req.ip || "unknown";
    const key = `${keyPrefix}:${ip}`;

    const bucket = memoryStore.get(key);

    if (!bucket || now >= bucket.resetAt) {
      memoryStore.set(key, {
        count: 1,
        resetAt: now + windowMs,
      });
      return next();
    }

    if (bucket.count >= max) {
      throw new BaseError(
        "Muitas tentativas. Aguarde alguns minutos e tente novamente.",
        429,
      );
    }

    bucket.count += 1;
    memoryStore.set(key, bucket);
    return next();
  };
}
