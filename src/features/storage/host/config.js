import z from '@deepseek-ai/schemastery'
import { homedir } from 'node:os'
import { isAbsolute, join, resolve } from 'node:path'

export const defaultMayoriRoot = () => join(homedir(), '.dsh-mayori')

export const Config = z.object({ root: z.string().default(defaultMayoriRoot()) })

/** Deployment paths are independent of the launcher's coding DSH_HOME. */
export function resolveStorageConfig(config = {}) {
  const root = config.root ?? defaultMayoriRoot()
  if (typeof root !== 'string' || root.trim() === '') throw new TypeError('Mayori storage root must be a non-empty absolute path')
  const expanded = root === '~' ? homedir() : /^~[/\\]/.test(root) ? join(homedir(), root.slice(2)) : root
  if (!isAbsolute(expanded)) throw new TypeError('Mayori storage root must be an absolute path or start with ~/')
  return { root: resolve(expanded) }
}
