import { Service } from '@deepseek-ai/cordis'

export class PersonaService extends Service {
  constructor(ctx) { super(ctx, 'mayoriPersonas') }
  list() { throw new Error('PersonaService.list() is not implemented') }
  save() { throw new Error('PersonaService.save() is not implemented') }
  remove() { throw new Error('PersonaService.remove() is not implemented') }
  setDefault() { throw new Error('PersonaService.setDefault() is not implemented') }
  resolve() { throw new Error('PersonaService.resolve() is not implemented') }
}
