import { CharacterLibraryService } from './service.js'
import { FileSystemCharacterLibraryStore } from './store.js'

/** Cordis Provider that publishes the filesystem implementation through ctx. */
export class FileSystemCharacterLibraryProvider extends CharacterLibraryService {
  _store

  constructor(ctx, config) {
    super(ctx)
    this._store = new FileSystemCharacterLibraryStore(config.root)
  }

  get root() { return this._store.root }
  list() { return this._store.list() }
  import(payload) { return this._store.import(payload) }
  remove(id) { return this._store.remove(id) }
}
