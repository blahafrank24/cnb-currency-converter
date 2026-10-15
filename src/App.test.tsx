import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { App } from './App'

const SAMPLE = `13 Oct 2026 #197
Country|Currency|Amount|Code|Rate
Australia|dollar|1|AUD|15.203
Japan|yen|100|JPY|13.779
USA|dollar|1|USD|21.788
`

function renderApp() {
  // retry: false so the error state appears at once; a shared client would leak cache between tests.
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  render(
    <QueryClientProvider client={client}>
      <App />
    </QueryClientProvider>,
  )
}

const ok = () => new Response(SAMPLE)

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe('App', () => {
  it('shows the rates and the date of the fixing', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(ok()))
    renderApp()

    expect(screen.getByRole('status').textContent).toMatch(/loading/i)
    expect(await screen.findByText(/13 Oct 2026/)).toBeTruthy()
    expect(screen.getByRole('cell', { name: 'JPY' })).toBeTruthy()
    expect(screen.getByRole('cell', { name: '21.788' })).toBeTruthy()
  })

  it('converts the typed amount with the selected currency', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(ok()))
    renderApp()

    await screen.findByText(/13 Oct 2026/)
    fireEvent.change(screen.getByLabelText('Convert to'), { target: { value: 'USD' } })
    fireEvent.change(screen.getByLabelText('Amount in CZK'), { target: { value: '1 500,50' } })

    expect(screen.getByText('1,500.5 CZK = 68.87 USD')).toBeTruthy()
  })

  it('respects the Amount column for currencies quoted per 100 units', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(ok()))
    renderApp()

    await screen.findByText(/13 Oct 2026/)
    fireEvent.change(screen.getByLabelText('Convert to'), { target: { value: 'JPY' } })

    expect(screen.getByText('1,000 CZK = 7,257.42 JPY')).toBeTruthy()
  })

  it('shows a hint instead of a result for an invalid amount', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(ok()))
    renderApp()

    await screen.findByText(/13 Oct 2026/)
    fireEvent.change(screen.getByLabelText('Amount in CZK'), { target: { value: 'abc' } })

    expect(screen.getByText(/Enter an amount in CZK greater than zero/)).toBeTruthy()
    expect(screen.queryByText(/NaN/)).toBeNull()
  })

  it('shows the error and recovers when "Try again" succeeds', async () => {
    const fetchStub = vi
      .fn()
      .mockResolvedValueOnce(new Response('down', { status: 503 }))
      .mockResolvedValueOnce(ok())
    vi.stubGlobal('fetch', fetchStub)
    renderApp()

    const alert = await screen.findByRole('alert')
    expect(alert.textContent).toContain('HTTP 503')

    fireEvent.click(screen.getByRole('button', { name: 'Try again' }))

    expect(await screen.findByText(/13 Oct 2026/)).toBeTruthy()
    expect(screen.queryByRole('alert')).toBeNull()
  })
})
