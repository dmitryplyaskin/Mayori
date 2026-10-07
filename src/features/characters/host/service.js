import { Service } from '@deepseek-ai/cordis'

/** Service Definition for durable imported Character Cards. */
export class CharacterLibraryService extends Service {
  constructor(ctx) { super(ctx, 'mayoriCharacters') }
  list() { throw new Error('CharacterLibraryService.list() is not implemented') }
  import(payload) { throw new Error('CharacterLibraryService.import() is not implemented') }
  remove() { throw new Error('CharacterLibraryService.remove() is not implemented') }
}
