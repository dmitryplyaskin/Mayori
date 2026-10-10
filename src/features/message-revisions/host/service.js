import { Service } from '@deepseek-ai/cordis'

export class MessageRevisionService extends Service {
  constructor(ctx) { super(ctx, 'mayoriMessageRevisions') }
  inspect() { throw new Error('MessageRevisionService.inspect() is not implemented') }
  list() { throw new Error('MessageRevisionService.list() is not implemented') }
  edit() { throw new Error('MessageRevisionService.edit() is not implemented') }
  regenerate() { throw new Error('MessageRevisionService.regenerate() is not implemented') }
}
