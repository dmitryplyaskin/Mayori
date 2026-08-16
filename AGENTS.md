# AGENTS.md

Mayori is a DeepSeek Harness RPG bundle. Read `docs/architecture.md` before changing runtime behavior.

## Rules

- Extend DSH through documented Cordis services and events; do not patch `agent-loop`.
- Register contributions through `ctx` so unloading the plugin reverses them.
- A new capability includes Service Definition, Provider, and Consumer roles.
- Anything model-visible must be reconstructible from the session log.
- Never represent hidden campaign state only in a prompt or process memory.
- Never fabricate random outcomes; use a real rules or dice provider.
- Deployment-varying choices belong in validated `Config` fields.
- Use ESM, keep files newline-terminated, and preserve player agency in user-facing behavior.
- Update tests and the affected guide with every behavior change.

## Checks

```sh
pnpm run check
```

For composition changes, also install the checkout into a temporary DSH profile and inspect `--dump-config`.
