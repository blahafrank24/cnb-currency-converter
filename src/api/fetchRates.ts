// Relative on purpose: it resolves against the page URL, so the same code works under /<repo>/ on Pages.
// CNB sends no usable CORS header, so this is a same-origin copy (Vite proxy in dev, deploy step in production).
export async function fetchRates(): Promise<string> {
  const response = await fetch('./daily.txt')
  if (!response.ok) {
    throw new Error(`Could not load exchange rates (HTTP ${response.status})`)
  }
  return response.text()
}
