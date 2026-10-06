import test from 'node:test'
import assert from 'node:assert/strict'
import { SlotCore } from '@deepseek-ai/dsh-client-ui-slots'
import { mirroredChildren, mirrorSlot } from '../src/slot-mirror.js'

test('mirrors real slot contributions with independent declarations and complete teardown', async () => {
  const slots = new SlotCore()
  const children = { 'conversation.chat.turnTail': { kind: 'list', scope: 'session' } }
  slots.register({ name: 'root', children: { 'conversation.chat.node': { kind: 'keyed', scope: 'session' } } }, () => null)
  slots.register({ name: 'conversation.chat.node', key: 'turn-tail', children }, () => null)
  const prefix = 'mayori.greeting.turn-tail'
  slots.register({ name: 'conversation.chat.node', key: 'turn-tail', priority: -100,
    children: mirroredChildren(children, prefix) }, () => null)
  const Component = () => null
  const source = 'conversation.chat.turnTail'
  const alias = `${prefix}.${source}`
  const disposeOriginal = slots.register({ name: source, id: 'feature', locale: 'chat',
    inject: id => ({ session: id }), children: { 'feature.detail': { kind: 'single', scope: 'session' } } }, Component)
  slots.register({ name: 'feature.detail', inject: id => ({ session: id }) }, Component)
  const stop = mirrorSlot({ slots }, source, alias)
  const originalEntries = slots.entries(source)
  const mirrored = slots.entries(alias)[0]
  assert.equal(mirrored.locale, 'chat')
  assert.equal(mirrored.inject('session-1').session, 'session-1')
  const calls = []
  const element = mirrored.component({ renderSlot: name => { calls.push(name) } })
  assert.equal(element.type, Component)
  element.props.renderSlot('feature.detail', {})
  assert.deepEqual(calls, [`${alias}.feature.detail`])
  assert.equal(slots.entries(`${alias}.feature.detail`).length, 1)
  const second = slots.register({ name: source, id: 'second', order: 1 }, Component)
  await new Promise(resolve => setImmediate(resolve))
  assert.equal(slots.entries(alias).length, 2, 'Late source registrations are mirrored')
  second()
  await new Promise(resolve => setImmediate(resolve))
  assert.equal(slots.entries(alias).length, 1)
  assert.equal(slots.entries(source)[0], originalEntries[0], 'The source registration stays untouched')
  stop()
  assert.equal(slots.entries(alias).length, 0)
  assert.equal(slots.entries(source).length, 1)
  disposeOriginal()
})
