export function calculateAccuracy(correct: number, total: number): number {
  if (total <= 0) return 0
  return Math.round((correct / total) * 100)
}

export function calculatePercentage(value: number, total: number): number {
  if (total <= 0) return 0
  return (value / total) * 100
}
