import { FileSystemCharacterLibraryProvider } from '../features/characters/host/provider.js'
import { FileSystemPersonaProvider } from '../features/personas/host/provider.js'
import { PersistentCharacterSessionProvider } from '../features/character-session/host/provider.js'
import { SessionTrajectoryContextProvider } from '../features/trajectory/host/context.js'
import { SessionHistoryDetailsProvider } from '../features/history/host/details.js'
import { createMayoriRoute } from './transport/routes.js'
import { CryptoDiceProvider } from '../features/dice/host/provider.js'
import { resolveDiceConfig } from '../features/dice/host/config.js'
import { registerDiceTool } from '../features/dice/host/plugin.js'
import { NumericRulesProvider } from '../features/rules/host/provider.js'
import { registerRulesTool } from '../features/rules/host/tool.js'
import { resolveRulesConfig } from '../features/rules/domain/check.js'
import { SessionRollHistoryProvider } from '../features/roll-history/host/provider.js'
import { registerRollHistoryTool } from '../features/roll-history/host/tool.js'

/** Compose Host services in dependency order within the plugin's Cordis lifetime. */
export function registerHostCapabilities(ctx, { charactersPath, campaignsPath, personasPath }) {
  const library = new FileSystemCharacterLibraryProvider(ctx, { root: charactersPath })
  const personas = new FileSystemPersonaProvider(ctx, personasPath)
  ctx.inject(['webServer', 'agents', 'sessions', 'workspaceRegistry', 'agentPresets', 'sessionQuery'], async consumerCtx => {
    const characterSessions = new PersistentCharacterSessionProvider(consumerCtx, library, { campaignsRoot: campaignsPath, personas })
    const trajectoryContext = new SessionTrajectoryContextProvider(consumerCtx)
    const historyDetails = new SessionHistoryDetailsProvider(consumerCtx, campaignsPath)
    await characterSessions.restoreActiveAgents()
    const route = createMayoriRoute({ library, personas, characterSessions, trajectoryContext, historyDetails })
    consumerCtx.effect(() => consumerCtx.webServer.register(route), 'mayori: character library route')
  })
  return library
}

/** Preset-scoped mechanics share one isolated Cordis lifetime. */
export function registerMechanicsCapabilities(ctx, config = {}) {
  const { profiles, ...limits } = config
  const diceConfig = resolveDiceConfig(limits), rulesConfig = resolveRulesConfig(profiles === undefined ? {} : { profiles })
  if (rulesConfig.profiles.some(profile => profile.sides > diceConfig.maxSides || profile.criticalFailureEffects.length > diceConfig.maxSides)) throw new TypeError('Rules profile dice must fit maxSides')
  new CryptoDiceProvider(ctx, diceConfig)
  new SessionRollHistoryProvider(ctx)
  registerRollHistoryTool(ctx)
  ctx.inject(['mayoriDice'], scope => {
    new NumericRulesProvider(scope, scope.mayoriDice, rulesConfig)
    registerDiceTool(scope)
    scope.inject(['mayoriRules'], registerRulesTool)
  })
}
