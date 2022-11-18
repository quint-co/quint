// remove indentation, useful for testing
export function dedent(text: string) {
  return text.replace(/(\n)\s+\|/g, '$1')
}
