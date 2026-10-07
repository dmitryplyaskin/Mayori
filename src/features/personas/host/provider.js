import { PersonaService } from './service.js'
import { FileSystemPersonaStore } from './store.js'

export class FileSystemPersonaProvider extends PersonaService {
  constructor(ctx, root) { super(ctx); this.store = new FileSystemPersonaStore(root) }
  list() { return this.store.list() }
  save(input) { return this.store.save(input) }
  remove(id) { return this.store.remove(id) }
  setDefault(id) { return this.store.setDefault(id) }
  resolve(id) { return this.store.resolve(id) }
}
