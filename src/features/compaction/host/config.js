import z from '@deepseek-ai/schemastery'
import { DEFAULT_COMPACTION } from '../shared/settings.js'

export const Config = z.object({
  thresholdPercent: z.number().step(1).min(1).max(99).default(DEFAULT_COMPACTION.thresholdPercent),
  retainPercent: z.number().step(1).min(0).max(98).default(DEFAULT_COMPACTION.retainPercent),
  maxSummaryTokens: z.number().step(1).min(1).max(65536).default(DEFAULT_COMPACTION.maxSummaryTokens),
  headroomTokens: z.number().step(1).min(0).max(65536).default(DEFAULT_COMPACTION.headroomTokens),
  instructions: z.string().default(DEFAULT_COMPACTION.instructions),
})
