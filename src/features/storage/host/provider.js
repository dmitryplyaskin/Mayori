import { join } from 'node:path'
import { MayoriStorageService } from './service.js'

export class UserHomeMayoriStorageProvider extends MayoriStorageService {
  constructor(ctx, root) { super(ctx); this.root = root }
  path(...segments) { return join(this.root, ...segments) }
}
