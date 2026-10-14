import type { Rate } from './types'

// The rate is CZK per `amount` units, so 1 CZK buys amount / rate units.
export function convertFromCzk(czk: number, rate: Rate): number {
  return (czk * rate.amount) / rate.rate
}
