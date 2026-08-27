import { Request, Response, NextFunction } from 'express';
import { toSnakeCaseKeys } from './caseConverter';

export const snakeCaseResponseMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const originalJson = res.json.bind(res);
  res.json = (body: any) => originalJson(toSnakeCaseKeys(body));
  next();
};