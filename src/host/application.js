import { FileSystemCharacterLibraryProvider } from '../features/characters/host/provider.js'
import { FileSystemPersonaProvider } from '../features/personas/host/provider.js'
import { FileSystemRoleplayPresetProvider } from '../features/presets/host/provider.js'
import { LoggedSessionPresetProvider } from '../features/presets/host/session.js'
import { buildDirectorPrompt } from './director.js'
import { PersistentCharacterSessionProvider } from '../features/character-session/host/provider.js'
import { SessionTrajectoryContextProvider } from '../features/trajectory/host/context.js'
import { SessionHistoryDetailsProvider } from '../features/history/host/details.js'
import { SessionMessageRevisionProvider } from '../features/message-revisions/host/provider.js'
import { createMayoriRoute } from './transport/routes.js'
import { CryptoDiceProvider } from '../features/dice/host/provider.js'
import { resolveDiceConfig } from '../features/dice/host/config.js'
import { registerDiceTool } from '../features/dice/host/tool.js'
import { NumericRulesProvider } from '../features/rules/host/provider.js'
import { registerRulesTool } from '../features/rules/host/tool.js'
import { resolveRulesConfig } from '../features/rules/domain/check.js'
import { SessionRollHistoryProvider } from '../features/roll-history/host/provider.js'
import { registerRollHistoryTool } from '../features/roll-history/host/tool.js'

/** Compose Host services in dependency order within the plugin's Cordis lifetime. */
export function registerHostCapabilities(ctx, config) {
  const { charactersPath, campaignsPath, personasPath, presetsPath } = config
  const library = new FileSystemCharacterLibraryProvider(ctx, { root: charactersPath })
  const personas = new FileSystemPersonaProvider(ctx, personasPath)
  const presets = new FileSystemRoleplayPresetProvider(ctx, presetsPath, {
    name: 'Mayori', instructions: `You are Mayori, an AI game master for persistent, collaborative role-playing games.\n\n${buildDirectorPrompt(config)}`,
  })
  ctx.inject(['webServer', 'agents', 'sessions', 'workspaceRegistry', 'agentPresets', 'sessionQuery', 'sessionController'], async consumerCtx => {
    const characterSessions = new PersistentCharacterSessionProvider(consumerCtx, library, { campaignsRoot: campaignsPath, personas })
    const sessionPresets = new LoggedSessionPresetProvider(consumerCtx, presets)
    const trajectoryContext = new SessionTrajectoryContextProvider(consumerCtx)
    const historyDetails = new SessionHistoryDetailsProvider(consumerCtx, campaignsPath)
    const messageRevisions = new SessionMessageRevisionProvider(consumerCtx, characterSessions)
    await characterSessions.restoreActiveAgents()
    await sessionPresets.restoreActiveAgents()
    const route = createMayoriRoute({ library, personas, presets, sessionPresets, characterSessions, trajectoryContext, historyDetails, messageRevisions })
    consumerCtx.effect(() => consumerCtx.webServer.register(route), 'mayori: character library route')
  })
  return library
}

/** A provider can serve Rules without exposing an extra tool to the model. */
export function registerDiceCapabilities(ctx, config = {}) {
  const { exposeTool = true, ...limits } = config
  if (typeof exposeTool !== 'boolean') throw new TypeError('exposeTool must be a boolean')
  new CryptoDiceProvider(ctx, resolveDiceConfig(limits))
  if (exposeTool) return ctx.inject(['mayoriDice'], registerDiceTool)
}

export function registerRulesCapabilities(ctx, config = {}) {
  const rulesConfig = resolveRulesConfig(config)
  const dice = ctx.mayoriDice
  if (!dice) throw new TypeError('Rules requires the mayoriDice service')
  for (const profile of rulesConfig.profiles) {
    for (const sides of [profile.sides, profile.criticalFailureEffects.length].filter(Boolean)) {
      if (dice.validate({ pool: `d${sides}` }).errors.length) throw new TypeError('Rules profile dice must fit the Dice provider limits')
    }
  }
  new NumericRulesProvider(ctx, dice, rulesConfig)
  return ctx.inject(['mayoriRules'], registerRulesTool)
}

export function registerRollHistoryCapabilities(ctx) {
  new SessionRollHistoryProvider(ctx)
  return ctx.inject(['mayoriRollHistory'], registerRollHistoryTool)
}

/** The same Mayori scope changes tools without changing its instructions. */
export async function registerOptionalPlugins(ctx, config = {}) {
  const preferences = ctx.mayoriPluginSettings
  let mounts = []
  let work = Promise.resolve()
  let closed = false
  const reconcile = plugins => {
    const run = async () => {
      if (closed) return
      for (const fiber of mounts.reverse()) await fiber.dispose()
      mounts = []
      const mount = async (name, apply, inject = ['tools']) => {
        let consumer
        const fiber = ctx.plugin({ name, inject, apply: child => { consumer = apply(child) } })
        mounts.push(fiber)
        await fiber
        if (consumer) await consumer
      }
      if (plugins.dice || plugins.rules) await mount('mayori-dice', child => registerDiceCapabilities(child, { ...config.dice, exposeTool: plugins.dice }))
      if (plugins.rules) await mount('mayori-rules', child => registerRulesCapabilities(child, config.rules), ['tools', 'mayoriDice'])
      if (plugins.rollHistory) await mount('mayori-roll-history', registerRollHistoryCapabilities)
    }
    work = work.then(run, run)
    return work
  }
  ctx.effect(() => preferences.subscribe(reconcile), 'mayori: optional plugin subscription')
  ctx.effect(() => () => { closed = true }, 'mayori: stop optional plugin updates')
  await reconcile(preferences.read().active)
}

/** Legacy public mechanics entry; new compositions select individual plugins. */
export function registerMechanicsCapabilities(ctx, config = {}) {
  const { profiles, ...limits } = config
  const diceConfig = resolveDiceConfig(limits), rulesConfig = resolveRulesConfig(profiles === undefined ? {} : { profiles })
  if (rulesConfig.profiles.some(profile => profile.sides > diceConfig.maxSides || profile.criticalFailureEffects.length > diceConfig.maxSides)) throw new TypeError('Rules profile dice must fit maxSides')
  registerDiceCapabilities(ctx, diceConfig)
  registerRulesCapabilities(ctx, rulesConfig)
  registerRollHistoryCapabilities(ctx)
}
