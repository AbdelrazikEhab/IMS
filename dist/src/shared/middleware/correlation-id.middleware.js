var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
let CorrelationIdMiddleware = class CorrelationIdMiddleware {
    use(req, res, next) {
        const appReq = req;
        const requestId = req.headers['x-request-id'] ||
            req.headers['x-correlation-id'] ||
            uuidv4();
        appReq.requestId = requestId;
        res.setHeader('X-Request-Id', requestId);
        next();
    }
};
CorrelationIdMiddleware = __decorate([
    Injectable()
], CorrelationIdMiddleware);
export { CorrelationIdMiddleware };
//# sourceMappingURL=correlation-id.middleware.js.map