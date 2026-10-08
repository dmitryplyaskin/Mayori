import { RoleplayPresetService } from './service.js'
import { FileSystemPresetStore } from './store.js'

export class FileSystemRoleplayPresetProvider extends RoleplayPresetService {
  constructor(ctx, root, initialPreset) { super(ctx); this.store = new FileSystemPresetStore(root, initialPreset) }
  list() { return this.store.list() }
  save(input) { return this.store.save(input) }
  remove(id) { return this.store.remove(id) }
  setDefault(id) { return this.store.setDefault(id) }
  resolve(id) { return this.store.resolve(id) }
}
