import test from 'node:test'
import assert from 'node:assert/strict'
import { SlotCore } from '@deepseek-ai/dsh-client-ui-slots'
import { MayoriComposer, registerComposerPresentation } from '../../src/client/shell/composer.js'

const copy = {
  'placeholder.default': 'Message or run a task, / commands, @ files or sessions',
  'placeholder.hero': 'Describe what you want to build, / commands, @ files or sessions',
  'placeholder.unavailable': 'Session unavailable',
  'placeholder.plan': 'Describe the next step',
  'placeholder.steerQueue': 'Cmd/Ctrl+Enter steers all queued messages',
}

test('composer shortens ordinary hints and preserves special guidance and native editor props', () => {
  const Stock = () => null
  const keyboard = {}
  const calls = []
  const props = { stock: Stock, stockChildren: { 'conversation.input.model': {} }, childPrefix: 'mayori.composer',
    sessionId: 'session', variant: 'composer', keyboard, t: key => copy[key],
    renderSlot: (...args) => calls.push(args) }
  const element = MayoriComposer(props)
  assert.equal(element.type, Stock)
  assert.equal(element.props.keyboard, keyboard)
  assert.equal(element.props.placeholder, undefined)
  assert.equal(element.props.t('placeholder.default'), 'Message, / commands, @ files')
  for (const key of ['placeholder.unavailable', 'placeholder.plan', 'placeholder.steerQueue']) {
    assert.equal(element.props.t(key), copy[key])
  }
  element.props.renderSlot('conversation.input.model', { locked: false })
  assert.deepEqual(calls, [['mayori.composer.conversation.input.model', { locked: false }, undefined]])
  const hero = { ...props, variant: 'hero', placeholder: copy['placeholder.hero'] }
  assert.equal(MayoriComposer(hero).props.placeholder, 'Describe what you want to build, / commands, @ files')
  for (const state of [{ disabled: true }, { blocked: { reason: hero.placeholder } }, { sessionId: undefined }]) {
    assert.equal(MayoriComposer({ ...hero, ...state }).props.placeholder, hero.placeholder)
  }
  assert.equal(MayoriComposer({ ...hero, placeholder: 'Custom guidance' }).props.placeholder, 'Custom guidance')
  assert.equal(MayoriComposer({ ...props, t: () => 'Напишите сообщение' }).props.t('placeholder.default'), 'Напишите сообщение')
})

test('composer presentation hides only feedback and permission controls and restores them on unload', async () => {
  const slots = new SlotCore()
  slots.register({ name: 'root', children: {
    'conversation.chat.assistant-actions': { kind: 'list', scope: 'session' },
    'conversation.composer.bar': { kind: 'single', scope: 'session-maybe' },
  } }, () => null)
  const Feedback = () => 'Good response / Bad response'
  const Copy = () => 'Copy'
  const Permission = () => 'Read only / Workspace write'
  const Model = () => 'Model'
  const Composer = () => 'Native editor'
  slots.register({ name: 'conversation.chat.assistant-actions', id: 'feedback', order: 10 }, Feedback)
  slots.register({ name: 'conversation.chat.assistant-actions', id: 'copy' }, Copy)
  const pending = new Map()
  const disposers = []
  const ctx = { slots: {
    entries: name => slots.entries(name),
    register: (options, component) => slots.register(options, component),
    subscribe: (name, listener) => slots.subscribe(name, listener),
    inject(name, factory) { pending.set(name, factory) },
  }, effect(factory) { const dispose = factory(); disposers.push(dispose); return dispose } }
  registerComposerPresentation(ctx)
  disposers.push(pending.get('conversation.chat.assistant-actions')())
  pending.get('conversation.composer.bar')()
  assert.equal(slots.entries('conversation.composer.bar').length, 0, 'Wait for the stock editor')
  const children = {
    'conversation.input.permission': { kind: 'single', scope: 'session' },
    'conversation.input.model': { kind: 'single', scope: 'session' },
  }
  slots.register({ name: 'conversation.composer.bar', locale: 'conversation', children,
    inject: sessionId => ({ keyboard: sessionId }) }, Composer)
  slots.register({ name: 'conversation.input.permission' }, Permission)
  slots.register({ name: 'conversation.input.model' }, Model)
  disposers.push(pending.get('conversation.input.permission')())
  await new Promise(resolve => setImmediate(resolve))
  const actions = slots.entriesOfSlot('conversation.chat.assistant-actions')
  assert.equal(actions.find(entry => entry.options.id === 'feedback').component(), null)
  assert.equal(actions.find(entry => entry.options.id === 'copy').component, Copy)
  assert.equal(slots.entriesOfSlot('conversation.input.permission')[0].component(), null)
  const composer = slots.entriesOfSlot('conversation.composer.bar')[0]
  assert.equal(composer.component, MayoriComposer)
  assert.equal(composer.locale, 'conversation')
  assert.equal(composer.inject('session').keyboard, 'session')
  assert.equal(slots.entriesOfSlot('mayori.composer.conversation.input.permission')[0].component({}).type({}), null)
  assert.equal(slots.entriesOfSlot('mayori.composer.conversation.input.model')[0].component({}).type, Model)
  for (const dispose of disposers.reverse()) dispose()
  await new Promise(resolve => setImmediate(resolve))
  assert.equal(slots.entriesOfSlot('conversation.composer.bar')[0].component, Composer)
  assert.equal(slots.entriesOfSlot('conversation.input.permission')[0].component, Permission)
  assert.equal(slots.entriesOfSlot('conversation.chat.assistant-actions').find(entry => entry.options.id === 'feedback').component, Feedback)
  assert.equal(slots.entries('mayori.composer.conversation.input.model').length, 0)
})
