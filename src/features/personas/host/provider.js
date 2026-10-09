import { PersonaService } from './service.js'
import { FileSystemPersonaStore, validatePersona } from './store.js'
import { imageSource, mediaId } from '../../media/shared/image.js'

export class FileSystemPersonaProvider extends PersonaService {
  constructor(ctx, root, media) { super(ctx); this.store = new FileSystemPersonaStore(root); this.media = media }
  async list() {
    let snapshot = await this.store.list()
    if (!this.media) return snapshot
    if (snapshot.personas.some(persona => persona.avatar?.startsWith('data:image/'))) {
      await this.store.migrateAvatars(value => this.media.put(value))
      snapshot = await this.store.list()
    }
    const personas = snapshot.personas.map(persona => ({ ...persona, avatarReference: persona.avatar, avatar: imageSource(persona.avatar) ?? '' }))
    return { ...snapshot, personas }
  }
  async save(input) {
    if (!this.media) return this.store.save(input)
    const local = typeof input?.avatar === 'string' && input.avatar.startsWith('/mayori/characters/media/')
    const avatar = local ? input.avatarReference : input?.avatar
    if (local && !mediaId(avatar)) throw new TypeError('Некорректный аватар.')
    const data = validatePersona({ ...input, avatar })
    const saved = await this.store.save({ ...input, ...data, avatar: await this.media.put(data.avatar) ?? '' })
    return { ...saved, avatarReference: saved.avatar, avatar: imageSource(saved.avatar) ?? '' }
  }
  remove(id) { return this.store.remove(id) }
  setDefault(id) { return this.store.setDefault(id) }
  async resolve(id) {
    const persona = await this.store.resolve(id)
    if (this.media && persona.avatar) persona.avatar = await this.media.put(persona.avatar)
    return persona
  }
}
