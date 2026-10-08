/** Mayori browser plugin: custom RPG sidebar plus the Character Library UI. */

import { RemoteCharacterLibraryProvider } from '../features/characters/client/library.js'
import { SessionChatHistoryProvider } from '../features/history/client/history.js'
import { ChatHistoryPanel, ChatHistoryIcon } from '../features/history/client/panel.jsx'
import { CharacterGalleryPanel, CharacterGalleryIcon } from '../features/characters/client/gallery.jsx'
import { startCharacterSession } from '../features/character-session/client/start.js'
import { MayoriSidebar, MayoriMark, MayoriBrandName, MayoriNavigationSidebar, MayoriLeadingControls } from './shell/sidebar.jsx'
import { RemotePersonaProvider } from '../features/personas/client/personas.js'
import { RemoteCharacterChatProvider } from '../features/character-session/client/chat.js'
import { PersonaPanel, PersonaIcon } from '../features/personas/client/panel.jsx'
import { GreetingTurnTail } from '../features/character-session/client/greeting.jsx'
import { CharacterMessage } from '../features/character-session/client/messages.jsx'
import { RemoteMessageRevisionProvider } from '../features/message-revisions/client/revisions.js'
import { RevisionBranchNavigation } from '../features/message-revisions/client/controls.jsx'
import { mirroredChildren, mirrorSlot } from './infrastructure/slot-mirror.js'
import { RemoteTrajectoryContextProvider } from '../features/trajectory/client/context.js'
import { ContextTrajectory, TrajectorySessionHeader } from '../features/trajectory/client/view.jsx'
import { HomePanel, HomeConversation, HomeIcon } from './shell/home.jsx'
import { DiceToolCard } from '../features/dice/client/card.jsx'
import { CheckToolCard } from '../features/rules/client/card.jsx'
import { BRAND_STYLE } from './styles.js'
import { PluginSettingsClient } from '../features/plugins/client/settings.js'
import { MayoriSettings, PLUGIN_SETTINGS_STYLE } from '../features/plugins/client/panel.jsx'

export { DiceToolCard } from '../features/dice/client/card.jsx'
export { CheckToolCard } from '../features/rules/client/card.jsx'
export { BRAND_STYLE } from './styles.js'

export const inject = ['slots', 'sessions', 'workspaces', 'uiWorkspace', 'layout']

/** Register reversible browser contributions through Cordis. */
export function apply(ctx) {
  const preferences = new PluginSettingsClient()
  ctx.slots.inject('settings.section', () => ctx.slots.register({
    name: 'settings.section', id: 'mayori', order: 35, label: 'Mayori', inject: () => ({ preferences }),
  }, MayoriSettings))
  const library = new RemoteCharacterLibraryProvider()
  ctx.provide('mayoriCharacters', library)
  const personas = new RemotePersonaProvider()
  ctx.provide('mayoriPersonas', personas)
  const chats = new Map()
  const chatFor = sessionId => {
    if (!chats.has(sessionId)) chats.set(sessionId, new RemoteCharacterChatProvider(sessionId))
    return chats.get(sessionId)
  }
  const contexts = new Map()
  const contextFor = sessionId => {
    if (!contexts.has(sessionId)) contexts.set(sessionId, new RemoteTrajectoryContextProvider(sessionId))
    return contexts.get(sessionId)
  }
  ctx.provide('mayoriTrajectoryContext', { forSession: contextFor })
  const revisions = new Map()
  const revisionFor = sessionId => {
    if (!revisions.has(sessionId)) revisions.set(sessionId, new RemoteMessageRevisionProvider(sessionId, async id => {
      try { await ctx.sessions.refresh() } finally { ctx.uiWorkspace.openSession(id) }
    }))
    return revisions.get(sessionId)
  }
  ctx.provide('mayoriMessageRevisions', { forSession: revisionFor })

  ctx.effect(() => {
    const style = document.createElement('style')
    style.dataset.plugin = 'dsh-mayori'
    style.dataset.mayori = 'client'
    style.textContent = BRAND_STYLE + PLUGIN_SETTINGS_STYLE
    document.head.appendChild(style)
    return () => { style.remove() }
  }, 'mayori: client styles')
  ctx.slots.inject('tool.call.toolview', () => ctx.slots.register({
    name: 'tool.call.toolview', key: 'rollDice',
  }, DiceToolCard))
  ctx.slots.inject('tool.call.toolview', () => ctx.slots.register({
    name: 'tool.call.toolview', key: 'resolveCheck',
  }, CheckToolCard))

  ctx.slots.inject('sidebar.brand.mark', () => ctx.slots.register({
    name: 'sidebar.brand.mark', priority: -100,
  }, MayoriMark))
  ctx.slots.inject('sidebar.brand.name', () => ctx.slots.register({
    name: 'sidebar.brand.name', priority: -100,
  }, MayoriBrandName))
  ctx.slots.inject('conversation.hero.brand.mark', () => ctx.slots.register({
    name: 'conversation.hero.brand.mark', priority: -100,
  }, MayoriMark))
  ctx.slots.inject('sidebar.workspaces', () => ctx.slots.register({
    name: 'sidebar.workspaces', priority: -100,
  }, MayoriSidebar))
  for (const [slotName, Component] of [['sidebar', MayoriNavigationSidebar], ['shell.leading', MayoriLeadingControls]]) {
    ctx.slots.inject(slotName, () => ctx.effect(() => {
      let installed = false
      const disposers = []
      const register = () => {
        if (installed) return
        const stock = ctx.slots.entries(slotName)[0]
        if (!stock) return
        installed = true
        const prefix = `mayori.navigation.${slotName}`
        disposers.push(ctx.slots.register({
          name: slotName, priority: -100, store: stock.store, locale: stock.locale,
          children: mirroredChildren(stock.children, prefix),
          inject: (...args) => ({ ...stock.inject?.(...args), stockChildren: stock.children,
            childPrefix: prefix, openHome: () => ctx.layout.selectPanel('mayori-home') }),
        }, Component))
        for (const name of Object.keys(stock.children ?? {})) disposers.push(mirrorSlot(ctx, name, `${prefix}.${name}`))
      }
      const unsubscribe = ctx.slots.subscribe(slotName, register)
      register()
      return () => { unsubscribe(); for (const dispose of disposers) dispose() }
    }, 'mayori: home navigation'))
  }
  const history = new SessionChatHistoryProvider(ctx.sessions, ctx.uiWorkspace, ctx.workspaces)
  ctx.provide('mayoriHistory', history)
  const homeProps = () => ({ history, library, personas, selectPanel: id => ctx.layout.selectPanel(id),
    startCharacter: (card, greetingIndex) => startCharacterSession({ sessions: ctx.sessions,
      workspaces: ctx.workspaces, uiWorkspace: ctx.uiWorkspace, library }, card, greetingIndex) })
  ctx.slots.inject('main', () => ctx.slots.register({
    name: 'main', key: 'mayori-home', inject: homeProps,
  }, HomePanel))
  ctx.slots.inject('sidebar.panellist', () => ctx.slots.register({
    name: 'sidebar.panellist', id: 'mayori-home', order: -30, label: 'Главная',
  }, HomeIcon))
  ctx.slots.inject('main.conversation', () => ctx.effect(() => {
    let installed = false
    const disposers = []
    const register = () => {
      if (installed) return
      const stock = ctx.slots.entries('main.conversation')[0]
      if (!stock) return
      installed = true
      const prefix = 'mayori.home.conversation'
      disposers.push(ctx.slots.register({
        name: 'main.conversation', priority: -100, store: stock.store, locale: stock.locale,
        children: mirroredChildren(stock.children, prefix),
        inject: (...args) => ({ ...stock.inject?.(...args), ...homeProps(), stock: stock.component,
          stockChildren: stock.children, childPrefix: prefix }),
      }, HomeConversation))
      for (const name of Object.keys(stock.children ?? {})) disposers.push(mirrorSlot(ctx, name, `${prefix}.${name}`))
    }
    const unsubscribe = ctx.slots.subscribe('main.conversation', register)
    register()
    return () => { unsubscribe(); for (const dispose of disposers) dispose() }
  }, 'mayori: home conversation'))
  ctx.slots.inject('main', () => ctx.slots.register({
    name: 'main', key: 'mayori-characters',
    inject: () => ({
      library,
      personas,
      startCharacter: (card, greetingIndex) => startCharacterSession({
        sessions: ctx.sessions, workspaces: ctx.workspaces, uiWorkspace: ctx.uiWorkspace, library,
      }, card, greetingIndex),
    }),
  }, CharacterGalleryPanel))
  ctx.slots.inject('main', () => ctx.slots.register({
    name: 'main', key: 'mayori-history', inject: () => ({ history }),
  }, ChatHistoryPanel))
  ctx.slots.inject('main', () => ctx.slots.register({
    name: 'main', key: 'mayori-personas', inject: () => ({ personas, sessions: ctx.sessions, chatFor }),
  }, PersonaPanel))
  ctx.slots.inject('sidebar.panellist', () => ctx.slots.register({
    name: 'sidebar.panellist', id: 'mayori-characters', order: -20, label: 'Персонажи',
  }, CharacterGalleryIcon))
  ctx.slots.inject('sidebar.panellist', () => ctx.slots.register({
    name: 'sidebar.panellist', id: 'mayori-history', order: -10, label: 'История чатов',
  }, ChatHistoryIcon))
  ctx.slots.inject('sidebar.panellist', () => ctx.slots.register({
    name: 'sidebar.panellist', id: 'mayori-personas', order: -15, label: 'Персоны',
  }, PersonaIcon))
  ctx.slots.inject('conversation.chat.node', () => ctx.effect(() => {
    const installed = new Set()
    const disposers = []
    const register = () => {
      for (const [key, component] of [['assistant-step', CharacterMessage], ['user', CharacterMessage], ['steering', CharacterMessage], ['turn-tail', GreetingTurnTail]]) {
        if (installed.has(key)) continue
        const stock = ctx.slots.entries('conversation.chat.node').find(entry => entry.options.key === key)
        if (!stock) continue
        installed.add(key)
        const prefix = `mayori.greeting.${key}`
        disposers.push(ctx.slots.register({
          name: 'conversation.chat.node', key, priority: -100,
          locale: stock.locale, children: mirroredChildren(stock.children, prefix),
          inject: (...args) => ({ ...stock.inject?.(...args), stock: stock.component, stockChildren: stock.children, childPrefix: prefix, chatFor, revisionFor }),
        }, component))
        for (const name of Object.keys(stock.children ?? {})) {
          disposers.push(mirrorSlot(ctx, name, `${prefix}.${name}`))
        }
      }
    }
    const unsubscribe = ctx.slots.subscribe('conversation.chat.node', register)
    register()
    return () => { unsubscribe(); for (const dispose of disposers) dispose() }
  }, 'mayori: greeting renderer'))
  ctx.slots.inject('conversation.view', () => ctx.effect(() => {
    let installed = false
    const disposers = []
    const register = () => {
      if (installed) return
      const stock = ctx.slots.entries('conversation.view').find(entry => entry.options.id === 'trajectory')
      if (!stock) return
      installed = true
      const prefix = 'mayori.trajectory'
      disposers.push(ctx.slots.register({
        ...stock.options, name: 'conversation.view', id: 'trajectory', priority: -100,
        locale: stock.locale, children: mirroredChildren(stock.children, prefix),
        inject: (...args) => ({ ...stock.inject?.(...args), stock: stock.component, stockChildren: stock.children, childPrefix: prefix, contextFor }),
      }, ContextTrajectory))
      for (const name of Object.keys(stock.children ?? {})) disposers.push(mirrorSlot(ctx, name, `${prefix}.${name}`))
    }
    const unsubscribe = ctx.slots.subscribe('conversation.view', register)
    register()
    return () => { unsubscribe(); for (const dispose of disposers) dispose() }
  }, 'mayori: trajectory context'))
  ctx.slots.inject('conversation.session.header', () => ctx.effect(() => {
    let installed = false
    const disposers = []
    const register = () => {
      if (installed) return
      const stock = ctx.slots.entries('conversation.session.header')[0]
      if (!stock) return
      installed = true
      const prefix = 'mayori.trajectory.header'
      disposers.push(ctx.slots.register({
        name: 'conversation.session.header', priority: -100,
        store: stock.store, locale: stock.locale, children: mirroredChildren(stock.children, prefix),
        inject: (...args) => ({ ...stock.inject?.(...args), stock: stock.component, stockChildren: stock.children, childPrefix: prefix,
          revisionNavigation: RevisionBranchNavigation, revisionNavigationProps: { sessions: ctx.sessions, open: id => ctx.uiWorkspace.openSession(id) } }),
      }, TrajectorySessionHeader))
      for (const name of Object.keys(stock.children ?? {})) disposers.push(mirrorSlot(ctx, name, `${prefix}.${name}`))
    }
    const unsubscribe = ctx.slots.subscribe('conversation.session.header', register)
    register()
    return () => { unsubscribe(); for (const dispose of disposers) dispose() }
  }, 'mayori: trajectory header'))
}
