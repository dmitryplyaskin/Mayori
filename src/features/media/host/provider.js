import { MediaService } from './service.js'
import { ImageStore } from './store.js'
export class FileSystemMediaProvider extends MediaService {
  constructor(ctx, root, options) { super(ctx); this.store = new ImageStore(root, options); ctx.effect?.(() => () => this.store.close(), 'mayori: image readers') }
  put(value) { return this.store.put(value) }
  read(id, variant) { return this.store.read(id, variant) }
}
