// Czech users type "1 500,50"; others type "1500.50". Anything ambiguous (for example "1.500,50") is rejected.
export function parseAmount(text: string): number | null {
  const compact = text.replace(/[\s ]/g, '').replace(',', '.')
  if (!/^\d+(\.\d*)?$/.test(compact)) return null
  return Number(compact)
}
