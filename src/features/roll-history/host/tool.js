import { defineTool } from '@deepseek-ai/dsh-tools'

export function registerRollHistoryTool(ctx) {
  ctx.tools.register(defineTool({
    name: 'getRollDetails',
    description: 'Read complete saved rollDice or resolveCheck results by rollId in this chat. '
      + 'Use only when the compact result is insufficient: returns faces, discarded dice, rerolls, explosions, branches, errors and recorded rules. '
      + 'A rollId identifies one invocation including its entire batch. Reads inherited fork history; never rolls again or changes state. '
      + 'Each missing or invalid id returns its own error. Do not substitute a new roll.',
    parameters: { rollIds: { type: 'array', required: true, items: { type: 'string' }, description: '1 to 20 distinct rollId values from earlier results.' } },
    output: { schema: { type: 'json' }, render: (_args, value) => [{ type: 'text', text: JSON.stringify(value) }] },
    isConcurrencySafe: () => true,
    execute: (args, exec) => ctx.mayoriRollHistory.read(exec.agent?.session, args.rollIds),
  }))
}
