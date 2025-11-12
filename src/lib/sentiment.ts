import Sentiment from 'sentiment'

const sentiment = new Sentiment()

export function bucketize(text: string): number {
  const result = sentiment.analyze(text)
  const score = result.score
  
  if (score >= 2) return 2
  if (score >= 1) return 1
  if (score <= -2) return -2
  if (score <= -1) return -1
  return 0
}

export function getWords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2)
}

export function wordSimilarity(text1: string, text2: string): number {
  const words1 = new Set(getWords(text1))
  const words2 = new Set(getWords(text2))
  
  const intersection = [...words1].filter(word => words2.has(word))
  const union = new Set([...words1, ...words2])
  
  return union.size > 0 ? intersection.length / union.size : 0
}

