import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'

// CNB publishes once per working day, so an hour of freshness is plenty.
const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 60 * 60 * 1000, retry: 1 } },
})

const root = document.getElementById('root')
if (!root) throw new Error('Missing #root element in index.html')

createRoot(root).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
)
