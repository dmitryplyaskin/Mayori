# AGENTS.md

Mayori is an engine for role-playing, creative writing, collaborative storytelling, and other creative text workflows, delivered as a DeepSeek Harness bundle. RPG mechanics are optional capabilities, not the product's defining scope. Read `docs/architecture.md` before changing runtime behavior.

## Rules

- Extend DSH through documented Cordis services and events; do not patch `agent-loop`.
- Register contributions through `ctx` so unloading the plugin reverses them.
- A new capability includes Service Definition, Provider, and Consumer roles.
- Anything model-visible must be reconstructible from the session log.
- Never represent hidden story or campaign state only in a prompt or process memory.
- Never fabricate random outcomes; use a real rules or dice provider.
- Deployment-varying choices belong in validated `Config` fields.
- Use ESM, keep files newline-terminated, and preserve the user's creative control. In role-playing, preserve player agency unless the user explicitly delegates it.
- Update tests and the affected guide with every behavior change.
- Every icon-only action in the chat must have a visible hover/focus tooltip and an accessible name. Use the shared IconButton / native DSH Tooltip; a title attribute alone is not enough. Apply the same convention to other Mayori icon actions.

## Source layout

- Keep capabilities in `src/features/<name>` with explicit `host`, `client`, `domain`, and `shared` boundaries as needed.
- Compose Host providers in `src/host/application.js`; register browser contributions in `src/client/plugin.js`.
- Feature modules must not import composition roots; Host and browser must not import each other's implementation.
- Keep domain/shared code independent of platform SDKs and mirror ownership under `test`.
- Preserve public package exports and update the package files allowlist when moving Host modules.

## Checks

```sh
pnpm run check
```

For composition changes, also install the checkout into a temporary DSH profile and inspect `--dump-config`.
