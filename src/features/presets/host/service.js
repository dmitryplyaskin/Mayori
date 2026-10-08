import { Service } from '@deepseek-ai/cordis'

export class RoleplayPresetService extends Service {
  constructor(ctx) { super(ctx, 'mayoriPresets') }
  list() { throw new Error('RoleplayPresetService.list() is not implemented') }
  save() { throw new Error('RoleplayPresetService.save() is not implemented') }
  remove() { throw new Error('RoleplayPresetService.remove() is not implemented') }
  setDefault() { throw new Error('RoleplayPresetService.setDefault() is not implemented') }
  resolve() { throw new Error('RoleplayPresetService.resolve() is not implemented') }
}

export class SessionPresetService extends Service {
  constructor(ctx) { super(ctx, 'mayoriSessionPresets') }
  state() { throw new Error('SessionPresetService.state() is not implemented') }
  select() { throw new Error('SessionPresetService.select() is not implemented') }
}
