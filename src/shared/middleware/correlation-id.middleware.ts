import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { AppRequest } from '../types/request.type';

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const appReq = req as AppRequest;
    const requestId =
      (req.headers['x-request-id'] as string) ||
      (req.headers['x-correlation-id'] as string) ||
      uuidv4();

    appReq.requestId = requestId;
    res.setHeader('X-Request-Id', requestId);

    next();
  }
}
