import { CharacterLibraryService } from './service.js'
import { FileSystemCharacterLibraryStore } from './store.js'

/** Cordis Provider that publishes the filesystem implementation through ctx. */
export class FileSystemCharacterLibraryProvider extends CharacterLibraryService {
  _store

  constructor(ctx, config) {
    super(ctx)
    this._store = new FileSystemCharacterLibraryStore(config.root, config.media)
    ctx.effect?.(() => () => this._store.close(), 'mayori: catalog indexing')
  }

  get root() { return this._store.root }
  list() { return this._store.list() }
  query(input) { return this._store.query(input) }
  get(id) { return this._store.get(id) }
  image(id, variant) { return this._store.image(id, variant) }
  import(payload) { return this._store.import(payload) }
  remove(id) { return this._store.remove(id) }
}
