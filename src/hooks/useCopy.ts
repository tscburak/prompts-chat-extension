export function useCopy() {
  const copy = (text: string) => {
    return navigator.clipboard.writeText(text)
  }
  return { copy }
}
