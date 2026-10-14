import { useQuery } from '@tanstack/react-query'
import { fetchRates } from '../api/fetchRates'
import { parseRates } from '../domain/parseRates'

export function useRates() {
  return useQuery({
    queryKey: ['rates'],
    queryFn: async () => parseRates(await fetchRates()),
  })
}
