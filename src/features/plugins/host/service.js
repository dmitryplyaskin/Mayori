import { Service } from '@deepseek-ai/cordis'

export class PluginSettingsService extends Service {
  constructor(ctx) { super(ctx, 'mayoriPluginSettings') }
  read() { throw new Error('PluginSettingsService.read() is not implemented') }
  subscribe() { throw new Error('PluginSettingsService.subscribe() is not implemented') }
  update() { throw new Error('PluginSettingsService.update() is not implemented') }
}
