import { Service } from '@deepseek-ai/cordis'

export class RulesService extends Service {
  constructor(ctx) { super(ctx, 'mayoriRules') }
  profiles() { throw new Error('RulesService.profiles() is not implemented') }
  resolve() { throw new Error('RulesService.resolve() is not implemented') }
}
