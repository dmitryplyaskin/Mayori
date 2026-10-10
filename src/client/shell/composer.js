import { createElement } from 'react'
import { mirroredChildren, mirrorSlot, remapChildProps } from '../infrastructure/slot-mirror.js'

const shortenHint = text => text.replace(/ or run (?:a )?task\b/, '').replace(/ or sessions\b/, '')

/** Keep the native editor and its state-specific guidance. */
export function MayoriComposer({ stock: Stock, stockChildren, childPrefix, ...props }) {
  const mapped = remapChildProps(props, stockChildren, childPrefix)
  mapped.t = (key, ...args) => {
    const text = props.t(key, ...args)
    return key === 'placeholder.default' || key === 'placeholder.hero' ? shortenHint(text) : text
  }
  if (!props.disabled && !props.blocked && props.sessionId != null && props.variant === 'hero'
    && props.placeholder === props.t('placeholder.hero')) mapped.placeholder = shortenHint(props.placeholder)
  return createElement(Stock, mapped)
}

/** Shadow only the requested controls; Cordis restores the stock entries on unload. */
export function registerComposerPresentation(ctx) {
  ctx.slots.inject('conversation.chat.assistant-actions', () => ctx.slots.register({
    name: 'conversation.chat.assistant-actions', id: 'feedback', priority: -100,
  }, () => null))
  ctx.slots.inject('conversation.input.permission', () => ctx.slots.register({
    name: 'conversation.input.permission', priority: -100,
  }, () => null))
  ctx.slots.inject('conversation.composer.bar', () => ctx.effect(() => {
    let installed = false
    const disposers = []
    const register = () => {
      if (installed) return
      const stock = ctx.slots.entries('conversation.composer.bar')[0]
      if (!stock) return
      installed = true
      const prefix = 'mayori.composer'
      disposers.push(ctx.slots.register({
        name: 'conversation.composer.bar', priority: -100,
        store: stock.store, locale: stock.locale, children: mirroredChildren(stock.children, prefix),
        inject: (...args) => ({ ...stock.inject?.(...args), stock: stock.component,
          stockChildren: stock.children, childPrefix: prefix }),
      }, MayoriComposer))
      for (const name of Object.keys(stock.children ?? {})) disposers.push(mirrorSlot(ctx, name, `${prefix}.${name}`))
    }
    const unsubscribe = ctx.slots.subscribe('conversation.composer.bar', register)
    register()
    return () => { unsubscribe(); for (const dispose of disposers) dispose() }
  }, 'mayori: composer presentation'))
}
