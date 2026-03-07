import { ForbiddenException } from '@nestjs/common';
export declare class FeatureDisabledException extends ForbiddenException {
    constructor(featureName: string);
}
