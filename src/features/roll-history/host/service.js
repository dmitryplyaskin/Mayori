import { Service } from '@deepseek-ai/cordis'

/** Read saved mechanics results in the calling session, including inherited history. */
export class RollHistoryService extends Service {
  constructor(ctx) { super(ctx, 'mayoriRollHistory') }
  read() { throw new Error('RollHistoryService.read() is not implemented') }
}
