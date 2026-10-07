import { Service } from '@deepseek-ai/cordis'

export class DiceService extends Service {
  constructor(ctx) { super(ctx, 'mayoriDice') }
  roll() { throw new Error('DiceService.roll() is not implemented') }
  validate() { throw new Error('DiceService.validate() is not implemented') }
}
