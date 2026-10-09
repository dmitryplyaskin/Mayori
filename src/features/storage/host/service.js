import { Service } from '@deepseek-ai/cordis'

/** Deployment-only service consumed by native DSH persistence providers. */
export class MayoriStorageService extends Service {
  constructor(ctx) { super(ctx, 'mayoriStorage') }
  path() { throw new Error('MayoriStorageService.path() is not implemented') }
}
