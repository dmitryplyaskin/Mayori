import { Service } from '@deepseek-ai/cordis'
export class MediaService extends Service {
  constructor(ctx) { super(ctx, 'mayoriMedia') }
  put() { throw new Error('MediaService.put() is not implemented') }
  read() { throw new Error('MediaService.read() is not implemented') }
}
