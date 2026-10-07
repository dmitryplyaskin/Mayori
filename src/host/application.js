import { FileSystemCharacterLibraryProvider } from '../features/characters/host/provider.js'
import { FileSystemPersonaProvider } from '../features/personas/host/provider.js'
import { PersistentCharacterSessionProvider } from '../features/character-session/host/provider.js'
import { SessionTrajectoryContextProvider } from '../features/trajectory/host/context.js'
import { SessionHistoryDetailsProvider } from '../features/history/host/details.js'
import { createMayoriRoute } from './transport/routes.js'

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
