/** Reuse child contributions without claiming their original declarations. */
import { createElement } from 'react'
export function mirroredChildren(children, prefix) {
  return Object.fromEntries(Object.entries(children ?? {}).map(([name, spec]) => [`${prefix}.${name}`, spec]))
}

export function remapChildProps(props, children, prefix) {
  const key = name => Object.hasOwn(children ?? {}, name) ? `${prefix}.${name}` : name
  return { ...props,
    ...(props.renderSlot ? { renderSlot: (name, owner, options) => props.renderSlot(key(name), owner, options) } : {}),
    ...(props.renderSlotChain ? { renderSlotChain: (name, owner, options) => props.renderSlotChain(key(name), owner, options) } : {}) }
}

/** Mirror public entries, injections and nested children into an owned child seat. */
export function mirrorSlot(ctx, original, alias) {
  const records = new Map()
  const remove = record => { for (const dispose of record.children) dispose(); record.dispose() }
  const sync = () => {
    const entries = ctx.slots.entries(original)
    for (const [entry, record] of records) {
      if (!entries.includes(entry)) { records.delete(entry); remove(record) }
    }
    for (const entry of entries) {
      if (records.has(entry)) continue
      const Component = entry.component
      const children = mirroredChildren(entry.children, alias)
      const record = { children: [], dispose: () => {} }
      records.set(entry, record)
      record.dispose = ctx.slots.register({ name: alias, ...entry.options,
        inject: entry.inject, locale: entry.locale, store: entry.store, select: entry.select,
        ...(Object.keys(children).length ? { children } : {}) },
      props => createElement(Component, remapChildProps(props, entry.children, alias)))
      record.children = Object.keys(entry.children ?? {}).map(name => mirrorSlot(ctx, name, `${alias}.${name}`))
    }
  }
  const unsubscribe = ctx.slots.subscribe(original, sync)
  sync()
  return () => { unsubscribe(); for (const record of records.values()) remove(record); records.clear() }
}
