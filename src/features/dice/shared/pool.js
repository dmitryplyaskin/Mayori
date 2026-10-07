/** Project recorded groups; never generate randomness or reinterpret expressions. */
export function projectDiceGroup(group) {
  const indices = group.keptIndices ?? group.results.map((_, index) => index)
  const kept = new Set(indices)
  const faces = indices.map(index => group.results[index])
  const totals = group.chains
    ? group.chains.filter(chain => chain.indices.some(index => kept.has(index))).map(chain => chain.value)
    : faces
  return { sides: group.sides, faces, totals }
}

export function diceObservations(details) {
  return details.filter(detail => !detail.error && detail.dice.length).map(detail => ({
    path: detail.path, groups: detail.dice.map(projectDiceGroup),
  }))
}
