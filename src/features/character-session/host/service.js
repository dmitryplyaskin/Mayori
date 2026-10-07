import { Service } from '@deepseek-ai/cordis'

/** Service Definition for binding an imported card to a chat session. */
export class CharacterSessionService extends Service {
  constructor(ctx) { super(ctx, 'mayoriCharacterSessions') }
  prepareCampaign() { throw new Error('CharacterSessionService.prepareCampaign() is not implemented') }
  select() { throw new Error('CharacterSessionService.select() is not implemented') }
  create() { throw new Error('CharacterSessionService.create() is not implemented') }
  state() { throw new Error('CharacterSessionService.state() is not implemented') }
  swipe() { throw new Error('CharacterSessionService.swipe() is not implemented') }
  setPersona() { throw new Error('CharacterSessionService.setPersona() is not implemented') }
}

/** Provider that restores card snapshots before an Agent accepts its first input. */
