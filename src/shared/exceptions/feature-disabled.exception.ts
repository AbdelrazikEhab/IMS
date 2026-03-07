import { ForbiddenException } from '@nestjs/common';

export class FeatureDisabledException extends ForbiddenException {
  constructor(featureName: string) {
    super({
      error: 'FEATURE_DISABLED',
      message: `Feature '${featureName}' is not enabled on your plan`,
    });
  }
}
