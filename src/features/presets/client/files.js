import { exportPreset, parsePresetFile, MAX_PRESET_FILE_BYTES } from '../shared/transfer.js'

export async function readPresetFile(file) {
  if (file.size > MAX_PRESET_FILE_BYTES) throw new TypeError('Размер файла пресета не должен превышать 1 МБ.')
  return parsePresetFile(await file.text(), { filename: file.name })
}

export function downloadPreset(preset) {
  const { filename, text } = exportPreset(preset)
  const url = URL.createObjectURL(new Blob([text], { type: 'application/json;charset=utf-8' }))
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.append(link)
  try { link.click() }
  finally {
    link.remove()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }
}
