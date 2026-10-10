/** The middle half of a group is a nest target; its edges insert siblings. */
export function presetDropPosition(kind, y, bounds) {
  const ratio = (y - bounds.top) / bounds.height
  if (kind === 'group' && ratio > 0.25 && ratio < 0.75) return 'inside'
  return ratio < 0.5 ? 'before' : 'after'
}
